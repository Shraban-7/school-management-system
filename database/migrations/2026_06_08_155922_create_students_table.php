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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('academic_sessions')->nullOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('classes_and_sections')->nullOnDelete();

            $table->string('roll_number', 20)->nullable();
            $table->string('name_en');
            $table->string('name_bn');
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 10);
            $table->string('blood_group', 5)->nullable();
            $table->string('religion', 30)->nullable();
            $table->string('nationality', 50)->default('Bangladeshi');
            $table->string('birth_certificate_number', 30)->nullable();

            $table->string('father_name_en')->nullable();
            $table->string('father_name_bn')->nullable();
            $table->string('father_nid', 30)->nullable();
            $table->string('father_phone', 20)->nullable();
            $table->string('father_occupation')->nullable();

            $table->string('mother_name_en')->nullable();
            $table->string('mother_name_bn')->nullable();
            $table->string('mother_nid', 30)->nullable();
            $table->string('mother_phone', 20)->nullable();
            $table->string('mother_occupation')->nullable();

            $table->string('guardian_name')->nullable();
            $table->string('guardian_relation', 30)->nullable();
            $table->string('guardian_phone', 20)->nullable();
            $table->text('guardian_address')->nullable();

            $table->text('present_address')->nullable();
            $table->text('permanent_address')->nullable();

            $table->string('previous_school')->nullable();
            $table->string('previous_class')->nullable();
            $table->decimal('previous_gpa', 4, 2)->nullable();

            $table->string('academic_year', 20)->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['institution_id', 'class_id', 'roll_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
