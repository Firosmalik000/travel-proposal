<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class HotelRoomType extends Model
{
    use HasAuditTrail, HasFactory, SoftDeletes;

    public const PRODUCT_HOTEL_PRICING_NAMES = [
        'DBL',
        'DOUBLE',
        'TRPL',
        'TRIPLE',
        'QUAD',
        'QUADRUPLE',
    ];

    protected $fillable = [
        'name',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function prices(): HasMany
    {
        return $this->hasMany(HotelPrice::class, 'room_type_id');
    }

    public function scopeForProductHotelPricing(Builder $query): Builder
    {
        return $query->whereIn(DB::raw('UPPER(name)'), self::PRODUCT_HOTEL_PRICING_NAMES);
    }

    public static function isProductHotelPricingName(?string $name): bool
    {
        return in_array(strtoupper(trim((string) $name)), self::PRODUCT_HOTEL_PRICING_NAMES, true);
    }

    /**
     * @return array<int, int>
     */
    public static function productHotelPricingIds(): array
    {
        return self::query()
            ->forProductHotelPricing()
            ->pluck('id')
            ->map(fn (mixed $id): int => (int) $id)
            ->all();
    }
}
