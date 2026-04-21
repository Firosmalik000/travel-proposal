<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_package_id',
        'departure_schedule_id',
        'full_name',
        'phone',
        'email',
        'origin_city',
        'passenger_count',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'passenger_count' => 'integer',
        ];
    }

    public function travelPackage(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class);
    }

    public function departureSchedule(): BelongsTo
    {
        return $this->belongsTo(DepartureSchedule::class);
    }
}
