<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'package_id',
        'departure_schedule_id',
        'booking_type',
        'custom_departure_date',
        'custom_return_date',
        'custom_unit_price',
        'custom_total_amount',
        'custom_currency',
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
            'custom_departure_date' => 'date',
            'custom_return_date' => 'date',
            'custom_unit_price' => 'integer',
            'custom_total_amount' => 'integer',
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

    public function testimonial(): HasOne
    {
        return $this->hasOne(Testimonial::class);
    }
}
