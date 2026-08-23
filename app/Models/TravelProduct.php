<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use App\Traits\NormalizesLocalizedStrings;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TravelProduct extends Model
{
    use HasAuditTrail, HasFactory;
    use NormalizesLocalizedStrings;

    public const VISIBILITY_MASTER = 'master';

    public const VISIBILITY_PACKAGE = 'package';

    protected $table = 'products';

    protected $fillable = [
        'code',
        'name',
        'slug',
        'product_type',
        'visibility',
        'package_id',
        'description',
        'content',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::addGlobalScope(
            'master-products',
            fn (Builder $query): Builder => $query->where(
                $query->getModel()->qualifyColumn('visibility'),
                self::VISIBILITY_MASTER,
            ),
        );
    }

    public function scopeIncludingPackageSpecific(Builder $query): Builder
    {
        return $query->withoutGlobalScope('master-products');
    }

    public function ownerPackage(): BelongsTo
    {
        return $this->belongsTo(TravelPackage::class, 'package_id');
    }

    public function isPackageSpecific(): bool
    {
        return $this->visibility === self::VISIBILITY_PACKAGE;
    }

    public function setNameAttribute(mixed $value): void
    {
        $this->attributes['name'] = $this->normalizeLocalizedString($value);
    }

    public function setDescriptionAttribute(mixed $value): void
    {
        $this->attributes['description'] = $this->normalizeNullableLocalizedString($value);
    }

    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(TravelPackage::class, 'package_product', 'product_id', 'package_id')
            ->withPivot('sort_order', 'multiplier_per_pax')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function itineraries(): BelongsToMany
    {
        return $this->belongsToMany(PackageItinerary::class, 'package_itinerary_product', 'product_id', 'package_itinerary_id')
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_type', 'key');
    }

    public function inventoryItem(): HasOne
    {
        return $this->hasOne(InventoryItem::class, 'product_id');
    }
}
