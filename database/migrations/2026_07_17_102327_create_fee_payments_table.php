<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fee_invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 20);
            $table->string('reference_number', 50)->nullable();
            $table->date('paid_at');
            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->index(['student_id', 'paid_at']);
            $table->index(['institution_id', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_payments');
    }
};
