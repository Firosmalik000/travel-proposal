<?php

namespace App\Actions\Package;

use App\Models\HotelCity;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SyncPackageSpecificProducts
{
    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array{
     *     ids: array<int, int>,
     *     multipliers: array<string, int>,
     *     id_map: array<string, int>,
     *     products: Collection<int, TravelProduct>
     * }
     */
    public function handle(?TravelPackage $package, array $items): array
    {
        $keptIds = [];
        $multipliers = [];
        $idMap = [];
        $products = collect();
        $hotelCities = HotelCity::query()
            ->with('country:id,name')
            ->whereIn(
                'id',
                collect($items)
                    ->where('product_type', 'hotel')
                    ->pluck('city_id')
                    ->filter(fn (mixed $id): bool => is_numeric($id))
                    ->map(fn (mixed $id): int => (int) $id)
                    ->unique()
                    ->all(),
            )
            ->get(['id', 'country_id', 'name'])
            ->keyBy('id');

        foreach ($items as $index => $item) {
            $product = $this->resolveProduct($package, $item, $index);
            $hotelCity = ($item['product_type'] ?? null) === 'hotel'
                ? $hotelCities->get((int) ($item['city_id'] ?? 0))
                : null;
            if (($item['product_type'] ?? null) === 'hotel' && (
                $hotelCity === null
                || $hotelCity->country_id !== (int) ($item['country_id'] ?? 0)
            )) {
                throw ValidationException::withMessages([
                    "custom_products.{$index}.city_id" => 'Kota hotel khusus tidak sesuai dengan negara yang dipilih.',
                ]);
            }
            $product->fill($this->payload($item, $hotelCity));

            if (! $product->exists) {
                $product->forceFill([
                    'code' => $this->uniqueCode(),
                    'slug' => $this->uniqueSlug((string) ($item['name'] ?? 'produk-khusus')),
                    'visibility' => TravelProduct::VISIBILITY_PACKAGE,
                    'package_id' => $package?->id,
                ]);
            }

            $product->save();

            $keptIds[] = $product->id;
            $multipliers[(string) $product->id] = max(1, (int) ($item['multiplier_per_pax'] ?? 1));
            $idMap[(string) ($item['client_key'] ?? $product->id)] = $product->id;
            $idMap[(string) ($item['estimate_id'] ?? $product->id)] = $product->id;
            $products->push($product);
        }

        if ($package !== null) {
            $package->ownedProducts()
                ->whereNotIn('id', $keptIds ?: [0])
                ->get()
                ->each(fn (TravelProduct $product) => $product->delete());
        }

        return [
            'ids' => array_values(array_unique($keptIds)),
            'multipliers' => $multipliers,
            'id_map' => $idMap,
            'products' => $products,
        ];
    }

    /** @param array<int, int> $productIds */
    public function assignOwnership(TravelPackage $package, array $productIds): void
    {
        TravelProduct::query()
            ->includingPackageSpecific()
            ->whereIn('id', $productIds)
            ->where('visibility', TravelProduct::VISIBILITY_PACKAGE)
            ->whereNull('package_id')
            ->update(['package_id' => $package->id]);
    }

    /** @param array<string, mixed> $item */
    private function resolveProduct(?TravelPackage $package, array $item, int $index): TravelProduct
    {
        $productId = isset($item['id']) && is_numeric($item['id']) ? (int) $item['id'] : null;

        if ($productId === null) {
            return new TravelProduct;
        }

        if ($package === null) {
            throw ValidationException::withMessages([
                "custom_products.{$index}.id" => 'Produk khusus tersimpan tidak dapat digunakan saat membuat package baru.',
            ]);
        }

        $product = TravelProduct::query()
            ->includingPackageSpecific()
            ->whereKey($productId)
            ->where('visibility', TravelProduct::VISIBILITY_PACKAGE)
            ->where('package_id', $package->id)
            ->first();

        if ($product === null) {
            throw ValidationException::withMessages([
                "custom_products.{$index}.id" => 'Produk khusus bukan milik package ini.',
            ]);
        }

        return $product;
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function payload(array $item, ?HotelCity $hotelCity): array
    {
        $isHotel = ($item['product_type'] ?? null) === 'hotel';
        $pricing = $isHotel
            ? collect($item['pricing'] ?? [])
                ->filter(fn (mixed $row): bool => is_array($row))
                ->map(fn (array $row): array => [
                    'broker_name' => trim((string) ($row['broker_name'] ?? '')),
                    'room_type' => strtoupper(trim((string) ($row['room_type'] ?? ''))),
                    'period_start' => $row['period_start'] ?? null,
                    'period_end' => $row['period_end'] ?? null,
                    'price' => (float) ($row['price'] ?? 0),
                ])
                ->values()
                ->all()
            : [];

        return [
            'name' => trim((string) ($item['name'] ?? '')),
            'product_type' => (string) ($item['product_type'] ?? ''),
            'description' => filled($item['description'] ?? null)
                ? trim((string) $item['description'])
                : null,
            'content' => [
                'currency' => strtoupper((string) ($item['currency'] ?? 'IDR')),
                'price' => $isHotel ? null : (float) ($item['price'] ?? 0),
                'country_id' => $isHotel ? $hotelCity?->country_id : null,
                'city_id' => $isHotel ? $hotelCity?->id : null,
                'country' => $isHotel ? ($hotelCity?->country?->name ?? '') : null,
                'city' => $isHotel ? ($hotelCity?->name ?? '') : null,
                'pricing' => $pricing,
            ],
            'is_active' => true,
            'visibility' => TravelProduct::VISIBILITY_PACKAGE,
        ];
    }

    private function uniqueCode(): string
    {
        do {
            $code = 'PKG-'.Str::upper(Str::random(16));
        } while (TravelProduct::query()->includingPackageSpecific()->where('code', $code)->exists());

        return $code;
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'produk-khusus';

        do {
            $slug = Str::limit($base, 70, '').'-'.Str::lower(Str::random(10));
        } while (TravelProduct::query()->includingPackageSpecific()->where('slug', $slug)->exists());

        return $slug;
    }
}
