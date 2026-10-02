<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZktecoDevice extends Model
{
    use HasFactory;

    protected $table = 'zkteco_devices';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'port' => 'integer',
            'comm_key' => 'integer',
            'is_enabled' => 'boolean',
            'last_sync_at' => 'datetime',
        ];
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }
}
