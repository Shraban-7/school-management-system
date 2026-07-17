<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Links a `parent` role User account to one or more Student records,
     * so a guardian can log in and see their child(ren)'s attendance,
     * results, and fee status. Separate from the free-text
     * father_name/mother_name/guardian_* columns on `students`, which
     * remain the record-of-truth for admission paperwork.
     */
    public function up(): void
    {
        Schema::create('student_guardians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('relation', 30)->default('guardian'); // father, mother, guardian
            $table->boolean('is_primary_contact')->default(false);
            $table->timestamps();

            $table->unique(['student_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_guardians');
    }
};
