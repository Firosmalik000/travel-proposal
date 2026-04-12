<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LegalDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'document_number',
        'issued_by',
        'description',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'issued_by' => 'array',
            'description' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
