<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunicationTemplate extends Model
{
    protected $guarded = [];
    protected $table = 'communication_templates';

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    /**
     * Seeds or guarantees the default system templates.
     *
     * @return list<self>
     */
    public static function ensureDefaults(): void
    {
        $defaults = [
            [
                'title' => 'Student Absence Alert',
                'slug' => 'absence_alert',
                'type' => 'both',
                'subject' => 'Attendance Alert: {student_name} is marked Absent on {date}',
                'body' => "Dear {guardian_name},\n\nThis is an automated attendance notice from {school_name} to inform you that your child {student_name} ({class_name}) was recorded ABSENT on {date}.\n\nIf this absence is unexcused, please contact the class teacher or school administration promptly.",
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Fee Payment Due Reminder',
                'slug' => 'fee_reminder',
                'type' => 'both',
                'subject' => 'Fee Due Reminder for {student_name}',
                'body' => "Dear {guardian_name},\n\nWe kindly remind you that school fees for {student_name} ({class_name}) are currently due. Due amount: {amount}.\n\nPlease deposit the pending dues at the accounts counter or via the portal before {date} to avoid late surcharges.\n\nThank you,\n{school_name}",
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Exam Results Published',
                'slug' => 'exam_results',
                'type' => 'both',
                'subject' => 'Term Exam Results Ready: {student_name}',
                'body' => "Dear {guardian_name},\n\nThe official term exam results for {student_name} ({class_name}) have been published by {school_name}. You can view and download the full marksheet and report card by logging into the parent portal.",
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'title' => 'General Emergency Notice',
                'slug' => 'general_notice',
                'type' => 'both',
                'subject' => 'Official Notice from {school_name}',
                'body' => "Dear Guardian/Student,\n\nPlease take note of the following announcement from {school_name}:\n\n{details}\n\nStay connected via our online school portal for regular updates.",
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Custom Announcement',
                'slug' => 'custom',
                'type' => 'both',
                'subject' => 'Message from {school_name}: {details}',
                'body' => "Dear {recipient_name},\n\n{details}\n\nWarm regards,\n{school_name}",
                'is_system' => true,
                'is_active' => true,
            ],
        ];

        foreach ($defaults as $def) {
            static::query()->firstOrCreate(['slug' => $def['slug']], $def);
        }
    }
}
