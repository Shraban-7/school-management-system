<?php

namespace App\Models;

use App\Enums\FeeType;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Guarded(['*'])]
class FeeStructure extends Model
{
    protected function casts(): array
    {
        return [
            'fee_type' => FeeType::class,
            'amount' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassesAndSection::class, 'class_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(FeeInvoice::class);
    }
}
