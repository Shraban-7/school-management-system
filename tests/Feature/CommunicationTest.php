<?php

use App\Enums\UserRole;
use App\Models\ClassesAndSection;
use App\Models\CommunicationLog;
use App\Models\CommunicationSetting;
use App\Models\CommunicationTemplate;
use App\Models\Institution;
use App\Models\Student;
use App\Models\User;

function communicationAdmin(): User
{
    return User::factory()->create(['role' => UserRole::ADMIN]);
}

it('renders the communication broadcast hub page', function () {
    makeInstitution();
    CommunicationTemplate::ensureDefaults();

    $this->actingAs(communicationAdmin())
        ->get('/admin/communication/messages')
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Communication/Index')
            ->has('templates')
            ->has('settings')
            ->has('stats')
        );
});

it('broadcasts an SMS and Email to custom recipient', function () {
    makeInstitution();

    $this->actingAs(communicationAdmin())
        ->post('/admin/communication/messages/send', [
            'channel' => 'both',
            'audience' => 'custom',
            'custom_recipient' => '+8801700000000',
            'subject' => 'Exam Results Announced',
            'message' => 'Dear Guardian, exam results are now available online.',
        ])
        ->assertRedirect()
        ->assertSessionHas('flash.message');

    $smsLog = CommunicationLog::query()->where('channel', 'sms')->first();
    expect($smsLog)->not->toBeNull()
        ->and($smsLog->recipient_to)->toBe('+8801700000000')
        ->and($smsLog->content)->toContain('exam results');
});

it('allows admin to create a custom communication template', function () {
    makeInstitution();

    $this->actingAs(communicationAdmin())
        ->post('/admin/communication/templates', [
            'title' => 'Sports Day Invitation',
            'type' => 'both',
            'subject' => 'Annual Sports Day 2026',
            'body' => 'Dear {guardian_name}, join us for Sports Day at {school_name}.',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $template = CommunicationTemplate::query()->where('title', 'Sports Day Invitation')->first();
    expect($template)->not->toBeNull()
        ->and($template->subject)->toBe('Annual Sports Day 2026')
        ->and($template->is_system)->toBeFalse();
});

it('updates the communication gateway settings', function () {
    makeInstitution();

    $this->actingAs(communicationAdmin())
        ->put('/admin/communication/settings', [
            'sms_provider' => 'greenweb',
            'sms_api_key' => 'secret-test-key',
            'sms_sender_id' => 'MY-SCHOOL',
            'sms_api_url' => 'https://api.greenweb.com/api.php',
            'sms_enabled' => true,
            'mail_mailer' => 'smtp',
            'mail_host' => 'smtp.test.com',
            'mail_port' => 465,
            'mail_username' => 'testuser',
            'mail_password' => 'testpass',
            'mail_encryption' => 'ssl',
            'mail_from_address' => 'admin@school.com',
            'mail_from_name' => 'School Admin',
            'email_enabled' => true,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $settings = CommunicationSetting::current();
    expect($settings->sms_provider)->toBe('greenweb')
        ->and($settings->sms_sender_id)->toBe('MY-SCHOOL')
        ->and($settings->mail_host)->toBe('smtp.test.com');
});

it('broadcasts absence notifications to guardians of absent students', function () {
    $inst = makeInstitution();
    $class = makeClass($inst);
    $student = Student::forceCreate([
        'institution_id' => $inst->id,
        'class_id' => $class->id,
        'name_en' => 'Tanvir Ahmed',
        'name_bn' => 'তানভীর আহমেদ',
        'gender' => 'Male',
        'guardian_name' => 'Md. Rafiq',
        'guardian_phone' => '+8801811223344',
    ]);

    \App\Models\AttendanceRecord::forceCreate([
        'classes_and_sections_id' => $class->id,
        'student_id' => $student->id,
        'date' => now()->toDateString(),
        'status' => 'absent',
    ]);

    $this->actingAs(communicationAdmin())
        ->post('/admin/communication/messages/send', [
            'channel' => 'sms',
            'audience' => 'absent_today',
            'class_id' => $class->id,
            'date' => now()->toDateString(),
            'message' => 'Dear {guardian_name}, {student_name} is absent today from {school_name}.',
        ])
        ->assertRedirect()
        ->assertSessionHas('flash.message');

    $log = CommunicationLog::query()->where('channel', 'sms')->where('recipient_to', '+8801811223344')->first();
    expect($log)->not->toBeNull()
        ->and($log->content)->toContain('Tanvir Ahmed is absent today');
});
