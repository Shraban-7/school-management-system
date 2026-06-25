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
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();

            $table->string('name_en');
            $table->string('name_bn');
            $table->string('code', 20)->nullable();
            $table->string('class_level');
            $table->string('group_stream', 50)->nullable();
            $table->string('subject_type', 20)->default('compulsory');
            $table->decimal('full_marks', 5, 1)->default(100);
            $table->decimal('pass_marks', 5, 1)->default(33);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['institution_id', 'name_en', 'class_level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
