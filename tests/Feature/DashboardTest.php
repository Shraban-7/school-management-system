<?php

use App\Enums\FeeType;
use App\Enums\InvoiceStatus;
use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\FeeInvoice;
use App\Models\User;
use App\Models\ZktecoDevice;
use Inertia\Testing\AssertableInertia as Assert;

it('provides dynamic operational data on the admin dashboard', function () {
    $institution = makeInstitution();
    $class = makeClass($institution);
    $student = makeStudent($institution, ['class_id' => $class->id]);

    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    // Create an attendance record for today
    AttendanceRecord::forceCreate([
        'student_id' => $student->id,
        'classes_and_sections_id' => $class->id,
        'date' => today(),
        'status' => 'present',
    ]);

    // Create fee invoice
    FeeInvoice::forceCreate([
        'institution_id' => $institution->id,
        'student_id' => $student->id,
        'invoice_number' => 'INV-TEST-001',
        'fee_type' => FeeType::MONTHLY_TUITION,
        'title_en' => 'Monthly Tuition',
        'amount' => 1500,
        'paid_amount' => 1000,
        'status' => InvoiceStatus::PARTIAL,
        'due_date' => now()->addDays(10),
    ]);

    // Create a zkteco device
    ZktecoDevice::create([
        'institution_id' => $institution->id,
        'name' => 'Main Gate Terminal',
        'ip_address' => '192.168.1.201',
        'port' => 4370,
        'is_enabled' => true,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->where('role', 'admin')
            ->where('attendanceSummary.marked_today', 1)
            ->where('attendanceSummary.present', 1)
            ->where('attendanceSummary.rate', 100)
            ->where('financeSummary.total_invoiced', 1500)
            ->where('financeSummary.total_collected', 1000)
            ->where('financeSummary.total_due', 500)
            ->where('zktecoSummary.online', 1)
            ->missing('quickActions')
            ->has('schoolInfo')
        );
});
