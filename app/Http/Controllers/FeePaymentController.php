<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Models\FeeInvoice;
use App\Models\Student;
use App\Services\FeeService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FeePaymentController extends Controller
{
    public function __construct(private readonly FeeService $fees) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'fee_invoice_id' => ['nullable', 'exists:fee_invoices,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'reference_number' => ['nullable', 'string', 'max:50'],
            'paid_at' => ['required', 'date'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $method = PaymentMethod::from($validated['payment_method']);

        if ($method->requiresReference() && empty($validated['reference_number'])) {
            return redirect()->back()->withErrors([
                'reference_number' => 'A transaction/reference number is required for '.$method->label().' payments.',
            ]);
        }

        $student = Student::findOrFail($validated['student_id']);

        if (! empty($validated['fee_invoice_id'])) {
            $invoice = FeeInvoice::query()
                ->whereKey($validated['fee_invoice_id'])
                ->where('student_id', $student->id)
                ->firstOrFail();

            if ((float) $validated['amount'] > $invoice->balance()) {
                return redirect()->back()->withErrors([
                    'amount' => 'Payment exceeds the invoice balance of '.number_format($invoice->balance(), 2).'.',
                ]);
            }
        }

        $this->fees->recordPayment(
            $student,
            (float) $validated['amount'],
            $method,
            Carbon::parse($validated['paid_at']),
            $request->user(),
            $validated['reference_number'] ?? null,
            $validated['fee_invoice_id'] ?? null,
            $validated['remarks'] ?? null,
        );

        return redirect()->back()->with('flash.message', 'Payment recorded successfully.');
    }
}
