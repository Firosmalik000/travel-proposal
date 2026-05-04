<?php

namespace App\Models;

use App\Traits\NormalizesLocalizedStrings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TravelPackage extends Model
{
    use HasFactory;
    use NormalizesLocalizedStrings;

    protected $table = 'packages';

    protected $fillable = [
        'code',
        'slug',
        'name',
        'package_type',
        'departure_city',
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

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(TravelProduct::class, 'package_product', 'package_id', 'product_id')
            ->withPivot('sort_order')
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
}
