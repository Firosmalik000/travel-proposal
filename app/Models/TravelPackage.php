<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\NormalizesLocalizedStrings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TravelPackage extends Model
{
    use HasAuditTrail, HasFactory;
    use NormalizesLocalizedStrings;

    protected $table = 'packages';

    protected $fillable = [
        'code',
        'slug',
        'name',
        'package_type',
        'departure_city',
        'start_date',
        'end_date',
        'seats_total',
        'seats_available',
        'booking_status',
        'departure_notes',
        'duration_days',
        'price',
        'original_price',
        'discount_label',
        'discount_ends_at',
        'currency',
        'image_path',
        'summary',
        'content',
        'is_featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'start_date' => 'date',
            'end_date' => 'date',
            'seats_total' => 'integer',
            'seats_available' => 'integer',
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'discount_ends_at' => 'datetime',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function setNameAttribute(mixed $value): void
    {
        $this->attributes['name'] = $this->normalizeLocalizedString($value);
    }

    public function setSummaryAttribute(mixed $value): void
    {
        $this->attributes['summary'] = $this->normalizeNullableLocalizedString($value);
    }

    public function hasDiscount(): bool
    {
        return $this->original_price !== null && $this->original_price > $this->price;
    }

    public function discountPercent(): ?int
    {
        if (! $this->hasDiscount()) {
            return null;
        }

        return (int) round((1 - $this->price / $this->original_price) * 100);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(DepartureSchedule::class, 'package_id');
    }

    public function bookedPassengerCount(?int $excludingBookingId = null): int
    {
        return (int) $this->registrations()
            ->where('status', 'registered')
            ->when(
                $excludingBookingId !== null,
                fn ($query) => $query->whereKeyNot($excludingBookingId),
            )
            ->sum('passenger_count');
    }

    public function availableSeatsCount(?int $excludingBookingId = null): int
    {
        return max((int) $this->seats_total - $this->bookedPassengerCount($excludingBookingId), 0);
    }

    public function syncSeatAvailability(): void
    {
        $availableSeats = $this->availableSeatsCount();

        $this->forceFill([
            'seats_available' => $availableSeats,
            'booking_status' => $this->booking_status === 'closed'
                ? 'closed'
                : ($availableSeats > 0 ? 'open' : 'full'),
        ])->saveQuietly();
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(TravelProduct::class, 'package_product', 'package_id', 'product_id')
            ->withPivot('sort_order', 'multiplier_per_pax')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class, 'package_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Booking::class, 'package_id');
    }

    public function itineraries(): HasMany
    {
        return $this->hasMany(PackageItinerary::class, 'package_id')
            ->orderBy('sort_order')
            ->orderBy('day_number');
    }

    public function hotelAssignments(): HasMany
    {
        return $this->hasMany(HotelAssignment::class, 'package_id');
    }

    public function agentFees(): HasMany
    {
        return $this->hasMany(AgentPackageFee::class, 'package_id');
    }

    public function allInConfig(): HasOne
    {
        return $this->hasOne(PackageAllInConfig::class, 'package_id');
    }
}
