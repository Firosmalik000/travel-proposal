<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasAuditTrail, HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'name',
        'conversion_rate',
        'notes',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'conversion_rate' => 'decimal:6',
            'is_active' => 'boolean',
        ];
    }
}
