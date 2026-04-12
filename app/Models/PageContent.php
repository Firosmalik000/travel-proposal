<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'category',
        'title',
        'excerpt',
        'content',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'title' => 'array',
            'excerpt' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
