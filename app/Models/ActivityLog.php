<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_type',
        'module',
        'menu_key',
        'subject_type',
        'subject_id',
        'method',
        'route_name',
        'url',
        'description',
        'properties',
        'ip_address',
        'user_agent',
        'logged_at',
    ];

    protected function casts(): array
    {
        return [
            'properties' => 'array',
            'logged_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
