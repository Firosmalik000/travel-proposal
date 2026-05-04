<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'name',
        'origin_city',
        'package_id',
        'departure_schedule_id',
        'quote',
        'photos',
        'rating',
        'is_featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'booking_id' => 'integer',
            'package_id' => 'integer',
            'departure_schedule_id' => 'integer',
            'photos' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function departureSchedule(): BelongsTo
    {
        return $this->belongsTo(DepartureSchedule::class);
    }
}
