<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->text('admission_guidelines')->nullable()->after('admission_info');
            $table->text('lab_facilities')->nullable()->after('admission_guidelines');
            $table->text('school_facilities')->nullable()->after('lab_facilities');
            $table->text('fee_notes')->nullable()->after('school_facilities');
        });
    }

    public function down(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->dropColumn([
                'admission_guidelines',
                'lab_facilities',
                'school_facilities',
                'fee_notes',
            ]);
        });
    }
};
