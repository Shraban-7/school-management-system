<?php

namespace App\Models;

use App\Enums\FeeType;
use App\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Guarded(['*'])]
class FeeInvoice extends Model
{
    protected function casts(): array
    {
        return [
            'fee_type' => FeeType::class,
            'status' => InvoiceStatus::class,
            'amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'due_date' => 'date',
        ];
    }

    public function balance(): float
    {
        return max(0, (float) $this->amount - (float) $this->paid_amount);
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class);
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(FeePayment::class);
    }
}
