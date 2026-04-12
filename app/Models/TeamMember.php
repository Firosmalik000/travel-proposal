<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'role',
        'bio',
        'image_path',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'role' => 'array',
            'bio' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
