<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageCostCalculationItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_cost_calculation_id',
        'cost_type',
        'reference_type',
        'reference_id',
        'label',
        'description',
        'quantity',
        'unit_price',
        'total_price',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }

    public function calculation(): BelongsTo
    {
        return $this->belongsTo(PackageCostCalculation::class, 'package_cost_calculation_id');
    }
}
