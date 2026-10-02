<?php

use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the attendance page with student names and ids', function () {
    $institution = makeInstitution();
    $class = makeClass($institution, ['class_level' => 'Class 8', 'section_name' => 'A']);
    $student = makeStudent($institution, [
        'class_id' => $class->id,
        'name_en' => 'Rafiq Ahmed',
        'roll_number' => '101',
    ]);

    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->get("/admin/attendance?class_id={$class->id}&date=2026-10-02")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Attendance/Index')
            ->has('attendance', 1)
            ->where('attendance.0.student_id', $student->id)
            ->where('attendance.0.student_name', 'Rafiq Ahmed')
            ->where('attendance.0.roll_number', '101')
            ->where('class_id', $class->id)
        );
});

it('allows admin to save attendance records for a class', function () {
    $institution = makeInstitution();
    $class = makeClass($institution);
    $student1 = makeStudent($institution, ['class_id' => $class->id]);
    $student2 = makeStudent($institution, ['class_id' => $class->id]);

    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($admin)
        ->post('/admin/attendance', [
            'date' => '2026-10-02',
            'class_id' => $class->id,
            'records' => [
                [
                    'student_id' => $student1->id,
                    'status' => 'present',
                    'remarks' => 'On time',
                ],
                [
                    'student_id' => $student2->id,
                    'status' => 'absent',
                    'remarks' => 'Sick leave',
                ],
            ],
        ]);

    $response->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(AttendanceRecord::count())->toBe(2);

    $record = AttendanceRecord::where('student_id', $student2->id)
        ->whereDate('date', '2026-10-02')
        ->first();

    expect($record)->not->toBeNull()
        ->status->toBe('absent')
        ->remarks->toBe('Sick leave');
});

it('provides zkteco device configuration in attendance props', function () {
    $institution = makeInstitution();
    $class = makeClass($institution);
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->get("/admin/attendance?class_id={$class->id}&date=2026-10-02")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Attendance/Index')
            ->has('zkteco')
            ->where('zkteco.is_enabled', false)
            ->where('zkteco.mapping_field', 'roll_number')
        );
});

it('allows admin to save zkteco device settings', function () {
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $response = $this->actingAs($admin)
        ->post('/admin/attendance/zkteco/settings', [
            'name' => 'North Gate Device',
            'ip_address' => '192.168.1.150',
            'port' => 4370,
            'comm_key' => 0,
            'is_enabled' => true,
            'protocol' => 'udp',
            'mapping_field' => 'roll_number',
            'late_threshold' => '09:00',
        ]);

    $response->assertSessionHasNoErrors()->assertRedirect();

    $device = \App\Models\ZktecoDevice::first();
    expect($device)->not->toBeNull()
        ->name->toBe('North Gate Device')
        ->ip_address->toBe('192.168.1.150')
        ->is_enabled->toBeTrue();
});

it('can import zkteco attlog file and record punches into attendance', function () {
    $institution = makeInstitution();
    $class = makeClass($institution);
    $student1 = makeStudent($institution, ['class_id' => $class->id, 'roll_number' => '101']);
    $student2 = makeStudent($institution, ['class_id' => $class->id, 'roll_number' => '102']);

    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $logContent = "101\t2026-10-02 08:30:15\t1\t0\n102\t2026-10-02 09:35:22\t1\t0\n";
    $file = \Illuminate\Http\UploadedFile::fake()->createWithContent('1_attlog.dat', $logContent);

    $response = $this->actingAs($admin)
        ->post('/admin/attendance/zkteco/import', [
            'date' => '2026-10-02',
            'class_id' => $class->id,
            'log_file' => $file,
        ]);

    $response->assertSessionHasNoErrors()->assertRedirect();

    $rec1 = AttendanceRecord::where('student_id', $student1->id)->whereDate('date', '2026-10-02')->first();
    $rec2 = AttendanceRecord::where('student_id', $student2->id)->whereDate('date', '2026-10-02')->first();

    expect($rec1)->not->toBeNull()
        ->status->toBe('present');

    expect($rec2)->not->toBeNull()
        ->status->toBe('late');
});

it('renders the dedicated zkteco settings page', function () {
    $admin = User::factory()->create(['role' => UserRole::ADMIN]);

    $this->actingAs($admin)
        ->get('/admin/settings/zkteco')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Settings/Zkteco')
            ->has('zkteco')
            ->has('classes')
        );
});


