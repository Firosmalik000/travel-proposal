<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PackageCostCalculation extends Model
{
    use HasAuditTrail, HasFactory, SoftDeletes;

    protected $fillable = [
        'package_id',
        'departure_schedule_id',
        'calculation_date',
        'booking_count',
        'customer_count',
        'hotel_total',
        'product_total',
        'manual_adjustment',
        'grand_total',
        'hpp_per_customer',
        'currency',
        'warnings',
        'notes',
        'calculated_at',
    ];

    protected function casts(): array
    {
        return [
            'calculation_date' => 'date',
            'calculated_at' => 'datetime',
            'warnings' => 'array',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function departureSchedule(): BelongsTo
    {
        return $this->belongsTo(DepartureSchedule::class, 'departure_schedule_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PackageCostCalculationItem::class, 'package_cost_calculation_id');
    }
}
