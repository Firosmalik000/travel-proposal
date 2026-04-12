<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'description',
        'logo_path',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'description' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
