<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->text('address')->nullable()->after('mpo_status');
            $table->string('phone', 30)->nullable()->after('address');
            $table->string('email')->nullable()->after('phone');
            $table->string('website')->nullable()->after('email');
            $table->unsignedSmallInteger('established_year')->nullable()->after('website');
            $table->string('logo_path')->nullable()->after('established_year');
            $table->text('about_en')->nullable()->after('logo_path');
            $table->text('about_bn')->nullable()->after('about_en');
            $table->string('headmaster_name_en')->nullable()->after('about_bn');
            $table->string('headmaster_name_bn')->nullable()->after('headmaster_name_en');
            $table->string('headmaster_photo_path')->nullable()->after('headmaster_name_bn');
            $table->text('headmaster_speech')->nullable()->after('headmaster_photo_path');
            $table->text('admission_info')->nullable()->after('headmaster_speech');
            $table->string('hero_tagline')->nullable()->after('admission_info');
        });
    }

    public function down(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->dropColumn([
                'address',
                'phone',
                'email',
                'website',
                'established_year',
                'logo_path',
                'about_en',
                'about_bn',
                'headmaster_name_en',
                'headmaster_name_bn',
                'headmaster_photo_path',
                'headmaster_speech',
                'admission_info',
                'hero_tagline',
            ]);
        });
    }
};
