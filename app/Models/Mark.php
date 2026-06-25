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
            'written_marks' => 'decimal',
            'mcq_marks' => 'decimal',
            'practical_marks' => 'decimal',
            'total_marks' => 'decimal',
            'grade_point' => 'decimal',
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
