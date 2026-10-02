<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('zkteco_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name')->default('Main Entrance Terminal');
            $table->string('ip_address')->default('192.168.1.201');
            $table->integer('port')->default(4370);
            $table->integer('comm_key')->default(0);
            $table->boolean('is_enabled')->default(false);
            $table->string('protocol', 10)->default('udp');
            $table->string('mapping_field', 30)->default('roll_number');
            $table->time('late_threshold')->default('09:15:00');
            $table->timestamp('last_sync_at')->nullable();
            $table->string('last_sync_status', 30)->nullable();
            $table->text('last_sync_message')->nullable();
            $table->timestamps();
        });

        if (! Schema::hasColumn('students', 'biometric_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->string('biometric_id', 50)->nullable()->after('roll_number');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zkteco_devices');

        if (Schema::hasColumn('students', 'biometric_id')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropColumn('biometric_id');
            });
        }
    }
};
