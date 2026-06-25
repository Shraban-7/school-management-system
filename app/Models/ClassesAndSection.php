<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Guarded(['*'])]
class ClassesAndSection extends Model
{
    protected $table = 'classes_and_sections';

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
}
