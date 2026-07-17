<?php

use App\Enums\FeeType;
use App\Enums\PaymentMethod;
use App\Enums\UserRole;
use App\Models\FeeStructure;
use App\Models\User;
use App\Services\FeeService;

it('generates monthly invoices and records a manual bkash payment', function () {
    $institution = makeInstitution();
    $class = makeClass($institution);
    $session = makeAcademicSession();
    $student = makeStudent($institution, ['class_id' => $class->id]);

    $structure = new FeeStructure;
    $structure->forceFill([
        'institution_id' => $institution->id,
        'class_id' => $class->id,
        'session_id' => $session->id,
        'fee_type' => FeeType::MONTHLY_TUITION,
        'name_en' => 'Monthly tuition',
        'name_bn' => 'মাসিক বেতন',
        'amount' => 1500,
        'is_active' => true,
    ])->save();

    $period = now()->format('Y-m');
    $result = app(FeeService::class)->generateMonthlyInvoices($period, $institution->id);

    expect($result['created'])->toBe(1);

    $summary = app(FeeService::class)->studentDueSummary($student);
    expect($summary['total_due'])->toBe(1500.0);

    $admin = User::factory()->create(['role' => UserRole::ADMIN]);
    app(FeeService::class)->recordPayment(
        $student,
        1500,
        PaymentMethod::BKASH,
        now(),
        $admin,
        'BKX123456',
    );

    expect(app(FeeService::class)->studentDueSummary($student)['total_due'])->toBe(0.0);
});

it('lets a parent view their child fee summary', function () {
    $institution = makeInstitution();
    $class = makeClass($institution);
    $student = makeStudent($institution, ['class_id' => $class->id]);

    $structure = new FeeStructure;
    $structure->forceFill([
        'institution_id' => $institution->id,
        'class_id' => $class->id,
        'fee_type' => FeeType::MONTHLY_TUITION,
        'name_en' => 'Monthly tuition',
        'amount' => 2000,
        'is_active' => true,
    ])->save();

    app(FeeService::class)->generateMonthlyInvoices(now()->format('Y-m'), $institution->id);

    $parent = User::factory()->create(['role' => UserRole::PARENT]);
    $student->guardians()->attach($parent->id, ['relation' => 'Father']);

    $this->actingAs($parent)
        ->get('/parent/fees')
        ->assertSuccessful();
});
