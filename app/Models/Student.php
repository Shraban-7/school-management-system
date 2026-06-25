<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Guarded(['*'])]
class Student extends Model
{
    protected $table = 'students';

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'previous_gpa' => 'decimal',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->nullable();
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class)->nullable();
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassesAndSection::class, 'class_id')->nullable();
    }
}
