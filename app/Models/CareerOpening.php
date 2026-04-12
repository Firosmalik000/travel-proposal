<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CareerOpening extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'location',
        'employment_type',
        'description',
        'requirements',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'description' => 'array',
            'requirements' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
