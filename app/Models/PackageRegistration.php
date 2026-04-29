<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackageRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',
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

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function departureSchedule(): BelongsTo
    {
        return $this->belongsTo(DepartureSchedule::class);
    }

    public function travelPackage(): BelongsTo
    {
        return $this->package();
    }
}
