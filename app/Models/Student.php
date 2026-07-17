<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Guarded(['*'])]
class Student extends Model
{
    protected $table = 'students';

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'previous_gpa' => 'decimal:2',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassesAndSection::class, 'class_id');
    }

    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_guardians')
            ->withPivot('relation', 'is_primary_contact')
            ->withTimestamps();
    }
}
