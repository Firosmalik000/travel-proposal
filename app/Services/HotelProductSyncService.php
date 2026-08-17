<?php

namespace App\Services;

use App\Models\Hotel;
use App\Models\HotelRoomType;
use App\Models\ProductCategory;
use App\Models\TravelProduct;
use Illuminate\Support\Str;

class HotelProductSyncService
{
    public function sync(Hotel $hotel): TravelProduct
    {
        ProductCategory::query()->firstOrCreate(
            ['key' => 'hotel'],
            [
                'name' => 'Hotel',
                'description' => 'Kategori produk hotel dengan pricing per broker dan periode.',
                'sort_order' => 6,
                'is_active' => true,
            ]
        );

        $hotel->loadMissing(['country:id,name', 'city:id,name', 'prices.roomType:id,name']);

        $product = $hotel->product_id
            ? TravelProduct::query()->find($hotel->product_id)
            : null;

        if (! $product) {
            $product = new TravelProduct;
            $product->code = $this->generateCode($hotel->name);
        }

        $slugBase = Str::slug($hotel->name.' '.$hotel->city?->name);

        $product->fill([
            'slug' => $this->ensureUniqueSlug($slugBase !== '' ? $slugBase : 'hotel-'.$hotel->id, $product),
            'name' => $hotel->name,
            'product_type' => 'hotel',
            'description' => $hotel->description,
            'is_active' => $hotel->is_active,
            'content' => [
                'country' => $hotel->country?->name,
                'city' => $hotel->city?->name,
                'currency' => $hotel->currency,
                'pricing' => $hotel->prices
                    ->filter(fn ($price): bool => HotelRoomType::isProductHotelPricingName($price->roomType?->name))
                    ->sortBy(function ($price): string {
                        return ($price->broker_key ?? $price->broker_name ?? 'Broker 1').'|'.($price->period_start?->format('Y-m-d') ?? '');
                    })
                    ->values()
                    ->map(fn ($price): array => [
                        'broker_key' => $price->broker_key ?? null,
                        'broker_name' => $price->broker_name ?? 'Broker 1',
                        'room_type' => $price->roomType?->name,
                        'period_start' => $price->period_start?->toDateString(),
                        'period_end' => $price->period_end?->toDateString(),
                        'price' => $price->price,
                    ])
                    ->all(),
            ],
        ]);

        TravelProduct::withoutEvents(function () use ($product): void {
            $product->save();
        });

        if ($hotel->product_id !== $product->id) {
            $hotel->forceFill(['product_id' => $product->id])->save();
        }

        return $product;
    }

    public function deactivateProduct(Hotel $hotel): void
    {
        if (! $hotel->product_id) {
            return;
        }

        TravelProduct::withoutEvents(function () use ($hotel): void {
            TravelProduct::query()
                ->whereKey($hotel->product_id)
                ->update(['is_active' => false]);
        });
    }

    private function generateCode(string $hotelName): string
    {
        $base = Str::upper(Str::limit(Str::slug($hotelName, '-'), 18, ''));
        $base = $base !== '' ? $base : 'HOTEL';

        $candidate = 'HTL-'.$base;
        $suffix = 2;

        while (TravelProduct::query()->where('code', $candidate)->exists()) {
            $candidate = 'HTL-'.Str::limit($base, 14, '').'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    private function ensureUniqueSlug(string $slugBase, ?TravelProduct $ignore = null): string
    {
        $slug = $slugBase;
        $suffix = 2;

        while (
            TravelProduct::query()
                ->when($ignore?->exists, fn ($query) => $query->whereKeyNot($ignore->getKey()))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $slugBase.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }
}
