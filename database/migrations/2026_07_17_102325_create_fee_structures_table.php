<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes_and_sections')->cascadeOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('academic_sessions')->nullOnDelete();

            $table->string('fee_type', 30);
            $table->string('name_en');
            $table->string('name_bn')->nullable();
            $table->decimal('amount', 10, 2);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['class_id', 'fee_type', 'session_id'], 'fee_structures_class_type_session_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_structures');
    }
};
