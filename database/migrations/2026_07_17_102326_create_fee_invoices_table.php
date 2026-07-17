<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fee_structure_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('invoice_number', 30);
            $table->string('fee_type', 30);
            $table->string('title_en');
            $table->string('title_bn')->nullable();
            $table->decimal('amount', 10, 2);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->date('due_date');
            $table->string('billing_period', 7)->nullable(); // YYYY-MM for monthly tuition
            $table->string('status', 20)->default('pending');
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->unique(['student_id', 'fee_type', 'billing_period'], 'fee_invoices_student_type_period_unique');
            $table->index(['institution_id', 'status', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_invoices');
    }
};
