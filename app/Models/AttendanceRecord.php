<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Guarded(['*'])]
class AttendanceRecord extends Model
{
    protected $table = 'attendance_records';

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function classSection(): BelongsTo
    {
        return $this->belongsTo(ClassesAndSection::class, 'classes_and_sections_id');
    }

    public function takenBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'taken_by');
    }
}
