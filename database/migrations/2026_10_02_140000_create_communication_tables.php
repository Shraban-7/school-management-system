<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communication_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->nullable()->constrained()->nullOnDelete();
            
            // SMS Gateway Configuration
            $table->string('sms_provider', 50)->default('generic_http');
            $table->text('sms_api_key')->nullable();
            $table->string('sms_sender_id', 50)->nullable();
            $table->string('sms_api_url')->nullable();
            $table->boolean('sms_enabled')->default(true);

            // Email / SMTP Configuration
            $table->string('mail_mailer', 30)->default('smtp');
            $table->string('mail_host')->nullable();
            $table->unsignedSmallInteger('mail_port')->default(587);
            $table->string('mail_username')->nullable();
            $table->text('mail_password')->nullable();
            $table->string('mail_encryption', 10)->default('tls');
            $table->string('mail_from_address')->nullable();
            $table->string('mail_from_name')->nullable();
            $table->boolean('email_enabled')->default(true);

            $table->timestamps();
        });

        Schema::create('communication_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('type', 20)->default('both'); // sms, email, both
            $table->string('subject')->nullable();
            $table->text('body');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('communication_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel', 20); // sms, email
            $table->string('recipient_type', 30)->default('custom'); // guardian, student, teacher, staff, custom
            $table->string('recipient_to');
            $table->string('recipient_name')->nullable();
            $table->string('subject')->nullable();
            $table->text('content');
            $table->string('status', 20)->default('sent'); // sent, failed, pending
            $table->text('error_message')->nullable();
            $table->foreignId('sent_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_logs');
        Schema::dropIfExists('communication_templates');
        Schema::dropIfExists('communication_settings');
    }
};
