<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Guarded(['*'])]
class Mark extends Model
{
    protected $table = 'marks';

    protected function casts(): array
    {
        return [
            'written_marks' => 'decimal:1',
            'mcq_marks' => 'decimal:1',
            'practical_marks' => 'decimal:1',
            'total_marks' => 'decimal:1',
            'grade_point' => 'decimal:2',
            'is_absent' => 'boolean',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
