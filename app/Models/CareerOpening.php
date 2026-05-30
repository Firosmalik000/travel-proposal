<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CareerOpening extends Model
{
    use HasAuditTrail, HasFactory;

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
            'is_active' => 'boolean',
        ];
    }
}
