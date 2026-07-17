<?php

namespace App\Services;

use App\Enums\FeeType;
use App\Enums\InvoiceStatus;
use App\Enums\PaymentMethod;
use App\Models\FeeInvoice;
use App\Models\FeePayment;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Manual fee ledger — no payment gateway integration.
 * bKash/Nagad/Rocket/bank payments are recorded by admin with a reference number.
 */
class FeeService
{
    /**
     * Generate monthly tuition invoices for all active students in classes
     * that have an active monthly_tuition fee structure.
     *
     * @return array{created: int, skipped: int}
     */
    public function generateMonthlyInvoices(string $billingPeriod, ?int $institutionId = null, ?User $issuedBy = null): array
    {
        $dueDate = Carbon::createFromFormat('Y-m', $billingPeriod)->endOfMonth();
        $created = 0;
        $skipped = 0;

        $structures = FeeStructure::query()
            ->where('fee_type', FeeType::MONTHLY_TUITION)
            ->where('is_active', true)
            ->when($institutionId, fn ($q) => $q->where('institution_id', $institutionId))
            ->with('class')
            ->get();

        foreach ($structures as $structure) {
            $students = Student::query()
                ->where('institution_id', $structure->institution_id)
                ->where('class_id', $structure->class_id)
                ->where('is_active', true)
                ->get();

            foreach ($students as $student) {
                $exists = FeeInvoice::query()
                    ->where('student_id', $student->id)
                    ->where('fee_type', FeeType::MONTHLY_TUITION)
                    ->where('billing_period', $billingPeriod)
                    ->exists();

                if ($exists) {
                    $skipped++;

                    continue;
                }

                $this->createInvoice($student, $structure, $dueDate, $billingPeriod, $issuedBy);
                $created++;
            }
        }

        return ['created' => $created, 'skipped' => $skipped];
    }

    public function createInvoice(
        Student $student,
        FeeStructure $structure,
        Carbon $dueDate,
        ?string $billingPeriod = null,
        ?User $issuedBy = null,
    ): FeeInvoice {
        $invoice = new FeeInvoice;

        $invoice->forceFill([
            'institution_id' => $student->institution_id,
            'student_id' => $student->id,
            'fee_structure_id' => $structure->id,
            'issued_by' => $issuedBy?->id,
            'invoice_number' => $this->nextInvoiceNumber($student->institution_id),
            'fee_type' => $structure->fee_type,
            'title_en' => $structure->name_en.($billingPeriod ? " ({$billingPeriod})" : ''),
            'title_bn' => $structure->name_bn,
            'amount' => $structure->amount,
            'paid_amount' => 0,
            'due_date' => $dueDate,
            'billing_period' => $billingPeriod,
            'status' => InvoiceStatus::PENDING,
        ])->save();

        $this->refreshInvoiceStatus($invoice);

        return $invoice->fresh();
    }

    /**
     * Record a manual payment and apply it to one or more invoices (FIFO by due date).
     */
    public function recordPayment(
        Student $student,
        float $amount,
        PaymentMethod $method,
        CarbonInterface $paidAt,
        User $recordedBy,
        ?string $referenceNumber = null,
        ?int $invoiceId = null,
        ?string $remarks = null,
    ): FeePayment {
        return DB::transaction(function () use ($student, $amount, $method, $paidAt, $recordedBy, $referenceNumber, $invoiceId, $remarks) {
            $payment = new FeePayment;
            $payment->forceFill([
                'institution_id' => $student->institution_id,
                'student_id' => $student->id,
                'fee_invoice_id' => $invoiceId,
                'recorded_by' => $recordedBy->id,
                'amount' => $amount,
                'payment_method' => $method,
                'reference_number' => $referenceNumber,
                'paid_at' => $paidAt,
                'remarks' => $remarks,
            ])->save();

            $remaining = $amount;

            if ($invoiceId) {
                $invoice = FeeInvoice::query()
                    ->whereKey($invoiceId)
                    ->where('student_id', $student->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $applied = min($remaining, $invoice->balance());
                $invoice->forceFill([
                    'paid_amount' => (float) $invoice->paid_amount + $applied,
                ])->save();
                $this->refreshInvoiceStatus($invoice);
            } else {
                $invoices = FeeInvoice::query()
                    ->where('student_id', $student->id)
                    ->whereIn('status', [InvoiceStatus::PENDING, InvoiceStatus::PARTIAL, InvoiceStatus::OVERDUE])
                    ->orderBy('due_date')
                    ->lockForUpdate()
                    ->get();

                foreach ($invoices as $invoice) {
                    if ($remaining <= 0) {
                        break;
                    }

                    $applied = min($remaining, $invoice->balance());
                    $invoice->forceFill([
                        'paid_amount' => (float) $invoice->paid_amount + $applied,
                    ])->save();
                    $this->refreshInvoiceStatus($invoice);
                    $remaining -= $applied;
                }
            }

            return $payment;
        });
    }

    public function refreshInvoiceStatus(FeeInvoice $invoice): void
    {
        $balance = $invoice->balance();
        $paid = (float) $invoice->paid_amount;

        $status = match (true) {
            $invoice->status === InvoiceStatus::WAIVED => InvoiceStatus::WAIVED,
            $balance <= 0 && $paid > 0 => InvoiceStatus::PAID,
            $paid > 0 && $balance > 0 => InvoiceStatus::PARTIAL,
            $invoice->due_date->isPast() => InvoiceStatus::OVERDUE,
            default => InvoiceStatus::PENDING,
        };

        if ($invoice->status !== InvoiceStatus::WAIVED) {
            $invoice->forceFill(['status' => $status])->save();
        }
    }

    /** Mark overdue invoices across the institution (call from scheduler or on page load). */
    public function syncOverdueStatuses(?int $institutionId = null): int
    {
        $query = FeeInvoice::query()
            ->whereIn('status', [InvoiceStatus::PENDING, InvoiceStatus::PARTIAL])
            ->whereDate('due_date', '<', today())
            ->when($institutionId, fn ($q) => $q->where('institution_id', $institutionId));

        $count = 0;
        $query->each(function (FeeInvoice $invoice) use (&$count) {
            $this->refreshInvoiceStatus($invoice);
            $count++;
        });

        return $count;
    }

    public function studentDueSummary(Student $student): array
    {
        $this->syncOverdueStatuses($student->institution_id);

        $invoices = FeeInvoice::query()
            ->where('student_id', $student->id)
            ->whereIn('status', [InvoiceStatus::PENDING, InvoiceStatus::PARTIAL, InvoiceStatus::OVERDUE])
            ->get();

        $totalDue = $invoices->sum(fn (FeeInvoice $i) => $i->balance());
        $overdueCount = $invoices->where('status', InvoiceStatus::OVERDUE)->count();

        return [
            'total_due' => round($totalDue, 2),
            'invoice_count' => $invoices->count(),
            'overdue_count' => $overdueCount,
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function defaulters(?int $institutionId = null): Collection
    {
        $this->syncOverdueStatuses($institutionId);

        return FeeInvoice::query()
            ->with(['student.class:id,class_level,section_name'])
            ->where('status', InvoiceStatus::OVERDUE)
            ->when($institutionId, fn ($q) => $q->where('institution_id', $institutionId))
            ->get()
            ->groupBy('student_id')
            ->map(function (Collection $invoices) {
                $student = $invoices->first()->student;

                return [
                    'student_id' => $student->id,
                    'name_en' => $student->name_en,
                    'roll_number' => $student->roll_number,
                    'class_label' => $student->class
                        ? trim($student->class->class_level.' '.$student->class->section_name)
                        : null,
                    'overdue_amount' => round($invoices->sum(fn (FeeInvoice $i) => $i->balance()), 2),
                    'overdue_invoices' => $invoices->count(),
                ];
            })
            ->sortByDesc('overdue_amount')
            ->values();
    }

    /**
     * @return array{total_collected: float, payment_count: int, by_method: array<string, float>}
     */
    public function collectionReport(Carbon $from, Carbon $to, ?int $institutionId = null): array
    {
        $payments = FeePayment::query()
            ->whereBetween('paid_at', [$from, $to])
            ->when($institutionId, fn ($q) => $q->where('institution_id', $institutionId))
            ->get();

        $byMethod = $payments
            ->groupBy(fn (FeePayment $p) => $p->payment_method->value)
            ->map(fn (Collection $group) => round((float) $group->sum('amount'), 2))
            ->all();

        return [
            'total_collected' => round((float) $payments->sum('amount'), 2),
            'payment_count' => $payments->count(),
            'by_method' => $byMethod,
        ];
    }

    private function nextInvoiceNumber(int $institutionId): string
    {
        $year = now()->format('Y');
        $count = FeeInvoice::query()
            ->where('institution_id', $institutionId)
            ->whereYear('created_at', $year)
            ->count() + 1;

        return sprintf('INV-%s-%04d', $year, $count);
    }
}
