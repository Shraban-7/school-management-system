<?php

namespace App\Http\Controllers;

use App\Enums\InvoiceStatus;
use App\Models\FeeInvoice;
use App\Models\Institution;
use App\Models\Student;
use App\Models\User;
use App\Services\FeeService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeeInvoiceController extends Controller
{
    public function __construct(private readonly FeeService $fees) {}

    public function index(Request $request): Response
    {
        $this->fees->syncOverdueStatuses();

        $status = $request->string('status')->toString() ?: null;
        $institutionId = Institution::current()->id;

        $invoices = FeeInvoice::query()
            ->with(['student:id,name_en,roll_number,class_id', 'student.class:id,class_level,section_name'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->where('institution_id', $institutionId)
            ->orderByDesc('due_date')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (FeeInvoice $i) => [
                'id' => $i->id,
                'invoice_number' => $i->invoice_number,
                'title_en' => $i->title_en,
                'fee_type' => $i->fee_type->value,
                'amount' => (float) $i->amount,
                'paid_amount' => (float) $i->paid_amount,
                'balance' => $i->balance(),
                'due_date' => $i->due_date?->toDateString(),
                'billing_period' => $i->billing_period,
                'status' => $i->status->value,
                'status_label' => $i->status->label(),
                'student_id' => $i->student_id,
                'student_name' => $i->student?->name_en,
                'roll_number' => $i->student?->roll_number,
                'class_label' => $i->student?->class
                    ? trim($i->student->class->class_level.' '.$i->student->class->section_name)
                    : null,
            ]);

        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->toDateString());

        return Inertia::render('Admin/Fees/Invoices/Index', [
            'invoices' => $invoices,
            'filters' => [
                'status' => $status,
                'from' => $from,
                'to' => $to,
            ],
            'statuses' => collect(InvoiceStatus::cases())
                ->map(fn (InvoiceStatus $s) => ['value' => $s->value, 'label' => $s->label()])
                ->all(),
            'defaulters' => $this->fees->defaulters($institutionId)->take(50)->all(),
            'collectionReport' => $this->fees->collectionReport(
                Carbon::parse($from),
                Carbon::parse($to),
                $institutionId,
            ),
            'sidebar' => app(DashboardController::class)->adminSidebar(),
        ]);
    }

    public function generate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'billing_period' => ['required', 'date_format:Y-m'],
        ]);

        $result = $this->fees->generateMonthlyInvoices(
            $validated['billing_period'],
            Institution::current()->id,
            $request->user(),
        );

        return redirect()->back()->with(
            'flash.message',
            "Generated {$result['created']} invoice(s). Skipped {$result['skipped']} duplicate(s)."
        );
    }

    public function parentIndex(Request $request): Response
    {
        $children = $request->user()->children()->with('class:id,class_level,section_name')->get();

        return Inertia::render('Parent/Fees/Index', [
            'children' => $children->map(fn (Student $c) => [
                'id' => $c->id,
                'name_en' => $c->name_en,
                'roll_number' => $c->roll_number,
                'class_label' => $c->class
                    ? trim($c->class->class_level.' '.$c->class->section_name)
                    : null,
                'summary' => $this->fees->studentDueSummary($c),
                'href' => "/parent/children/{$c->id}/fees",
            ])->all(),
            'sidebar' => app(DashboardController::class)->parentSidebar(),
        ]);
    }

    public function parentChild(Request $request, Student $student): Response
    {
        $this->assertGuardianOf($request->user(), $student);

        $invoices = FeeInvoice::query()
            ->where('student_id', $student->id)
            ->orderByDesc('due_date')
            ->get()
            ->map(fn (FeeInvoice $i) => [
                'id' => $i->id,
                'invoice_number' => $i->invoice_number,
                'title_en' => $i->title_en,
                'amount' => (float) $i->amount,
                'paid_amount' => (float) $i->paid_amount,
                'balance' => $i->balance(),
                'due_date' => $i->due_date?->toDateString(),
                'status' => $i->status->value,
                'status_label' => $i->status->label(),
            ]);

        return Inertia::render('Parent/Fees/Child', [
            'student' => [
                'id' => $student->id,
                'name_en' => $student->name_en,
                'roll_number' => $student->roll_number,
            ],
            'summary' => $this->fees->studentDueSummary($student),
            'invoices' => $invoices,
            'sidebar' => app(DashboardController::class)->parentSidebar(),
        ]);
    }

    private function assertGuardianOf(User $user, Student $student): void
    {
        abort_unless(
            $user->children()->whereKey($student->id)->exists(),
            403,
            'This child is not linked to your account.'
        );
    }
}
