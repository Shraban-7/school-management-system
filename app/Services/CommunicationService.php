<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\AttendanceRecord;
use App\Models\ClassesAndSection;
use App\Models\CommunicationLog;
use App\Models\CommunicationSetting;
use App\Models\Institution;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CommunicationService
{
    /**
     * Send an SMS message to a phone number and record log.
     */
    public function sendSms(
        string $to,
        string $message,
        ?string $recipientName = null,
        string $recipientType = 'custom',
        ?int $sentByUserId = null,
        ?int $institutionId = null
    ): bool {
        $cleanPhone = preg_replace('/[^\d+]/', '', trim($to));

        if (empty($cleanPhone)) {
            return false;
        }

        $settings = CommunicationSetting::current();
        $status = 'sent';
        $errorMessage = null;

        if (! $settings->sms_enabled) {
            $status = 'failed';
            $errorMessage = 'SMS sending is disabled in system settings.';
        } else {
            try {
                // If a live API URL and key are configured, attempt HTTP post
                if ($settings->sms_api_url && $settings->sms_api_key && filter_var($settings->sms_api_url, FILTER_VALIDATE_URL)) {
                    $response = Http::timeout(5)->post($settings->sms_api_url, [
                        'api_key' => $settings->sms_api_key,
                        'sender_id' => $settings->sms_sender_id ?? 'SMS-APP',
                        'to' => $cleanPhone,
                        'message' => $message,
                    ]);

                    if ($response->failed()) {
                        $status = 'failed';
                        $errorMessage = 'Gateway returned HTTP '.$response->status().': '.$response->body();
                    }
                } else {
                    // Simulated / development gateway mode
                    Log::info("[CommunicationService SMS to {$cleanPhone}] {$message}");
                }
            } catch (\Throwable $e) {
                $status = 'failed';
                $errorMessage = $e->getMessage();
                Log::error("[CommunicationService SMS Error] ".$e->getMessage());
            }
        }

        CommunicationLog::forceCreate([
            'institution_id' => $institutionId ?? Institution::current()->id,
            'channel' => 'sms',
            'recipient_type' => $recipientType,
            'recipient_to' => $cleanPhone,
            'recipient_name' => $recipientName,
            'subject' => null,
            'content' => $message,
            'status' => $status,
            'error_message' => $errorMessage,
            'sent_by_user_id' => $sentByUserId,
        ]);

        return $status === 'sent';
    }

    /**
     * Send an Email message and record log.
     */
    public function sendEmail(
        string $to,
        string $subject,
        string $content,
        ?string $recipientName = null,
        string $recipientType = 'custom',
        ?int $sentByUserId = null,
        ?int $institutionId = null
    ): bool {
        $cleanEmail = trim($to);

        if (! filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $settings = CommunicationSetting::current();
        $status = 'sent';
        $errorMessage = null;

        if (! $settings->email_enabled) {
            $status = 'failed';
            $errorMessage = 'Email sending is disabled in system settings.';
        } else {
            $school = Institution::current();
            $html = $this->wrapInEmailTemplate($subject, $content, $school);

            try {
                Mail::html($html, function ($message) use ($cleanEmail, $recipientName, $subject, $settings, $school) {
                    $fromAddress = $settings->mail_from_address ?: config('mail.from.address', 'noreply@school.edu.bd');
                    $fromName = $settings->mail_from_name ?: $school->name_en;

                    $message->to($cleanEmail, $recipientName ?: '')
                        ->from($fromAddress, $fromName)
                        ->subject($subject);
                });
            } catch (\Throwable $e) {
                // If mailer fails (e.g. invalid SMTP config in local environment), log and note error
                Log::warning("[CommunicationService Email Send Notice] ".$e->getMessage());
                // In local/test environment, we treat logging as simulated delivery
                if (app()->environment('production')) {
                    $status = 'failed';
                    $errorMessage = $e->getMessage();
                } else {
                    $status = 'sent';
                    Log::info("[CommunicationService Email to {$cleanEmail}] Subject: {$subject} | Body: ".strip_tags($content));
                }
            }
        }

        CommunicationLog::forceCreate([
            'institution_id' => $institutionId ?? Institution::current()->id,
            'channel' => 'email',
            'recipient_type' => $recipientType,
            'recipient_to' => $cleanEmail,
            'recipient_name' => $recipientName,
            'subject' => $subject,
            'content' => $content,
            'status' => $status,
            'error_message' => $errorMessage,
            'sent_by_user_id' => $sentByUserId,
        ]);

        return $status === 'sent';
    }

    /**
     * Dispatch a batch or broadcast message to a target audience.
     *
     * @param array<string, mixed> $payload
     * @return array{total_recipients: int, sent_sms: int, sent_email: int, failed: int}
     */
    public function broadcast(array $payload, ?User $sender = null): array
    {
        $channel = $payload['channel'] ?? 'both'; // sms, email, both
        $audience = $payload['audience'] ?? 'all_guardians';
        $classId = ! empty($payload['class_id']) ? (int) $payload['class_id'] : null;
        $date = ! empty($payload['date']) ? $payload['date'] : now()->toDateString();
        $customRecipient = $payload['custom_recipient'] ?? null;
        $subject = $payload['subject'] ?? 'Notification';
        $messageTemplate = $payload['message'] ?? '';
        $amount = $payload['amount'] ?? '৳ 0';

        $school = Institution::current();
        $recipients = $this->resolveRecipients($audience, $classId, $date, $customRecipient);

        $sentSms = 0;
        $sentEmail = 0;
        $failed = 0;

        foreach ($recipients as $item) {
            $vars = [
                '{school_name}' => $school->name_en,
                '{student_name}' => $item['student_name'] ?? 'Student',
                '{guardian_name}' => $item['guardian_name'] ?? ($item['name'] ?? 'Guardian'),
                '{recipient_name}' => $item['name'] ?? 'Recipient',
                '{class_name}' => $item['class_name'] ?? 'Class',
                '{date}' => $date,
                '{amount}' => $amount,
                '{details}' => $messageTemplate,
            ];

            $renderedMessage = strtr($messageTemplate, $vars);
            $renderedSubject = strtr($subject, $vars);

            // Send SMS if requested and phone is present
            if (in_array($channel, ['sms', 'both'], true) && ! empty($item['phone'])) {
                $ok = $this->sendSms(
                    to: $item['phone'],
                    message: $renderedMessage,
                    recipientName: $item['name'] ?? null,
                    recipientType: $item['type'] ?? 'guardian',
                    sentByUserId: $sender?->id,
                    institutionId: $school->id
                );
                $ok ? $sentSms++ : $failed++;
            }

            // Send Email if requested and email is present
            if (in_array($channel, ['email', 'both'], true) && ! empty($item['email'])) {
                $ok = $this->sendEmail(
                    to: $item['email'],
                    subject: $renderedSubject,
                    content: nl2br(e($renderedMessage)),
                    recipientName: $item['name'] ?? null,
                    recipientType: $item['type'] ?? 'guardian',
                    sentByUserId: $sender?->id,
                    institutionId: $school->id
                );
                $ok ? $sentEmail++ : $failed++;
            }
        }

        return [
            'total_recipients' => count($recipients),
            'sent_sms' => $sentSms,
            'sent_email' => $sentEmail,
            'failed' => $failed,
        ];
    }

    /**
     * Resolve target recipients based on audience filter.
     *
     * @return list<array{name: string, phone: ?string, email: ?string, student_name: ?string, guardian_name: ?string, class_name: ?string, type: string}>
     */
    protected function resolveRecipients(string $audience, ?int $classId, string $date, ?string $customRecipient): array
    {
        $list = [];

        if ($audience === 'custom' && filled($customRecipient)) {
            $isEmail = filter_var($customRecipient, FILTER_VALIDATE_EMAIL);
            return [[
                'name' => 'Custom Recipient',
                'phone' => $isEmail ? null : $customRecipient,
                'email' => $isEmail ? $customRecipient : null,
                'student_name' => 'Student',
                'guardian_name' => 'Guardian',
                'class_name' => 'General',
                'type' => 'custom',
            ]];
        }

        if ($audience === 'absent_today') {
            $query = AttendanceRecord::query()
                ->where('status', 'absent')
                ->whereDate('date', $date)
                ->with(['student.class', 'student.guardians']);

            if ($classId) {
                $query->where('classes_and_sections_id', $classId);
            }

            $records = $query->get();

            foreach ($records as $record) {
                $student = $record->student;
                if (! $student) {
                    continue;
                }

                $guardian = $student->guardians->first();
                $phone = $student->guardian_phone ?: $student->father_phone ?: $student->mother_phone ?: $guardian?->phone;
                $email = $guardian?->email;

                $className = $student->class
                    ? trim($student->class->class_level.' '.$student->class->section_name)
                    : 'Class';

                $list[] = [
                    'name' => $student->guardian_name ?: ($guardian?->name ?: $student->name_en.'\'s Guardian'),
                    'phone' => $phone,
                    'email' => $email,
                    'student_name' => $student->name_en,
                    'guardian_name' => $student->guardian_name ?: ($guardian?->name ?: 'Guardian'),
                    'class_name' => $className,
                    'type' => 'guardian',
                ];
            }

            return $list;
        }

        if ($audience === 'teachers') {
            $teachers = Teacher::query()->where('is_active', true)->get();
            foreach ($teachers as $t) {
                $list[] = [
                    'name' => $t->name_en,
                    'phone' => $t->mobile,
                    'email' => $t->email,
                    'student_name' => null,
                    'guardian_name' => null,
                    'class_name' => 'Faculty',
                    'type' => 'teacher',
                ];
            }
            return $list;
        }

        // Audience: class or all_guardians
        $studentQuery = Student::query()->with(['class', 'guardians']);
        if ($audience === 'class' && $classId) {
            $studentQuery->where('class_id', $classId);
        }

        $students = $studentQuery->get();

        foreach ($students as $student) {
            $guardian = $student->guardians->first();
            $phone = $student->guardian_phone ?: $student->father_phone ?: $student->mother_phone ?: $guardian?->phone;
            $email = $guardian?->email;

            $className = $student->class
                ? trim($student->class->class_level.' '.$student->class->section_name)
                : 'Class';

            $list[] = [
                'name' => $student->guardian_name ?: ($guardian?->name ?: $student->name_en.' Guardian'),
                'phone' => $phone,
                'email' => $email,
                'student_name' => $student->name_en,
                'guardian_name' => $student->guardian_name ?: ($guardian?->name ?: 'Guardian'),
                'class_name' => $className,
                'type' => 'guardian',
            ];
        }

        return $list;
    }

    /**
     * Wrap custom email message inside a clean, modern HTML shell.
     */
    protected function wrapInEmailTemplate(string $subject, string $content, Institution $school): string
    {
        $logoHtml = $school->logoUrl()
            ? '<img src="'.$school->logoUrl().'" alt="'.$school->name_en.'" style="height: 48px; max-width: 140px; object-fit: contain; margin-bottom: 8px;" />'
            : '<div style="font-size: 22px; font-weight: 700; color: #1e293b;">'.$school->name_en.'</div>';

        $year = date('Y');

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{$subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 28px 32px; background-color: #ffffff; border-bottom: 2px solid #4f46e5; text-align: center;">
                            {$logoHtml}
                            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">EIIN: {$school->eiin_number} • {$school->board_affiliation} Board</div>
                        </td>
                    </tr>
                    <!-- Subject Bar -->
                    <tr>
                        <td style="padding: 16px 32px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                            <h1 style="margin: 0; font-size: 18px; font-weight: 600; color: #0f172a;">{$subject}</h1>
                        </td>
                    </tr>
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px; font-size: 15px; color: #334155;">
                            {$content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
                            <p style="margin: 0 0 6px;"><strong>{$school->name_en}</strong></p>
                            <p style="margin: 0 0 6px;">{$school->address} • Tel: {$school->phone}</p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">© {$year} {$school->name_en}. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }
}
