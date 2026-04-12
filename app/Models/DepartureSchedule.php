<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepartureSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_package_id',
        'departure_date',
        'return_date',
        'departure_city',
        'seats_total',
        'seats_available',
        'status',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'departure_date' => 'date',
            'return_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function travelPackage(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class);
    }
}
