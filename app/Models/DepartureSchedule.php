<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DepartureSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',
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
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function bookedPassengerCount(?int $excludingRegistrationId = null): int
    {
        if (
            $excludingRegistrationId === null &&
            $this->getAttribute('active_booked_pax') !== null
        ) {
            return (int) $this->getAttribute('active_booked_pax');
        }

        if ($this->relationLoaded('registrations')) {
            return (int) $this->registrations
                ->when(
                    $excludingRegistrationId !== null,
                    fn ($registrations) => $registrations->where(
                        'id',
                        '!=',
                        $excludingRegistrationId,
                    ),
                )
                ->where('status', 'registered')
                ->sum('passenger_count');
        }

        return (int) $this->registrations()
            ->where('status', 'registered')
            ->when(
                $excludingRegistrationId !== null,
                fn ($query) => $query->whereKeyNot($excludingRegistrationId),
            )
            ->sum('passenger_count');
    }

    public function availableSeatsCount(?int $excludingRegistrationId = null): int
    {
        return max(
            (int) $this->seats_total - $this->bookedPassengerCount($excludingRegistrationId),
            0,
        );
    }

    public function syncSeatAvailability(?int $excludingRegistrationId = null): void
    {
        $availableSeats = $this->availableSeatsCount($excludingRegistrationId);

        $this->forceFill([
            'seats_available' => $availableSeats,
            'status' => $this->status === 'closed'
                ? 'closed'
                : ($availableSeats > 0 ? 'open' : 'full'),
        ])->saveQuietly();
    }
}
