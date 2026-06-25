<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Guarded(['*'])]
class Institution extends Model
{
    protected function casts(): array
    {
        return [
            'eiin_number' => 'integer',
            'mpo_status' => 'boolean',
        ];
    }

    public function classesAndSections(): HasMany
    {
        return $this->hasMany(ClassesAndSection::class);
    }
}
