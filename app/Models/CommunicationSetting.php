<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunicationSetting extends Model
{
    protected $guarded = [];
    protected $table = 'communication_settings';

    protected function casts(): array
    {
        return [
            'mail_port' => 'integer',
            'sms_enabled' => 'boolean',
            'email_enabled' => 'boolean',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    /**
     * Retrieve the singleton or default settings row.
     */
    public static function current(): self
    {
        $setting = static::query()->first();

        if ($setting === null) {
            $institution = Institution::query()->first();
            $setting = static::forceCreate([
                'institution_id' => $institution?->id,
                'sms_provider' => 'generic_http',
                'sms_sender_id' => 'SMS-APP',
                'sms_api_url' => 'https://api.sms-provider.com/send',
                'sms_enabled' => true,
                'mail_mailer' => config('mail.default', 'smtp'),
                'mail_host' => config('mail.mailers.smtp.host', 'smtp.mailgun.org'),
                'mail_port' => (int) config('mail.mailers.smtp.port', 587),
                'mail_username' => config('mail.mailers.smtp.username', ''),
                'mail_encryption' => config('mail.mailers.smtp.encryption', 'tls'),
                'mail_from_address' => config('mail.from.address', 'noreply@school.edu.bd'),
                'mail_from_name' => config('mail.from.name', 'School Management System'),
                'email_enabled' => true,
            ]);
        }

        return $setting;
    }
}
