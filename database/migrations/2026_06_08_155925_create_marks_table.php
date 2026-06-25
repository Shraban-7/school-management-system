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
        Schema::create('marks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();

            $table->decimal('written_marks', 5, 1)->nullable();
            $table->decimal('mcq_marks', 5, 1)->nullable();
            $table->decimal('practical_marks', 5, 1)->nullable();
            $table->decimal('total_marks', 5, 1)->nullable();
            $table->decimal('grade_point', 4, 2)->nullable();
            $table->string('grade_letter', 5)->nullable();
            $table->boolean('is_absent')->default(false);
            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->unique(['exam_id', 'subject_id', 'student_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marks');
    }
};
