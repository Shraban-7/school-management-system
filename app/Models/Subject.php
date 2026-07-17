<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Guarded(['*'])]
class Subject extends Model
{
    protected $table = 'subjects';

    protected function casts(): array
    {
        return [
            'full_marks' => 'decimal:1',
            'pass_marks' => 'decimal:1',
            'is_active' => 'boolean',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
}
