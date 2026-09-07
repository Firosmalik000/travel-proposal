<?php

namespace App\Services;

use App\Models\TravelPackage;
use App\Models\TravelProduct;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class PackageProductPriceSnapshotService
{
    private const FINANCIAL_CONTENT_KEYS = [
        'price',
        'currency',
        'currency_rate_snapshot',
        'pricing',
    ];

    public function captureMissing(TravelPackage $package): void
    {
        $package->load('products');

        foreach ($package->products as $product) {
            if ($this->snapshotFrom($product) !== null) {
                continue;
            }

            $this->writeSnapshot($package, $product);
        }

        $package->unsetRelation('products');
    }

    /** @param array<int, int>|null $productIds */
    public function refresh(TravelPackage $package, ?array $productIds = null): int
    {
        $package->load('products');
        $allowedIds = $productIds === null
            ? null
            : collect($productIds)->map(fn (int $id): int => $id)->unique();
        $refreshed = 0;

        foreach ($package->products as $product) {
            if ($allowedIds !== null && ! $allowedIds->contains((int) $product->id)) {
                continue;
            }

            $this->writeSnapshot($package, $product);
            $refreshed++;
        }

        $package->unsetRelation('products');

        return $refreshed;
    }

    /** @return Collection<int, TravelProduct> */
    public function apply(Collection $products): Collection
    {
        return $products->map(function (TravelProduct $product): TravelProduct {
            $snapshot = $this->snapshotFrom($product);
            if ($snapshot === null) {
                return $product;
            }

            $copy = clone $product;
            $content = is_array($copy->content) ? $copy->content : [];
            $nonFinancialContent = array_diff_key($content, array_flip(self::FINANCIAL_CONTENT_KEYS));
            $copy->content = array_replace($nonFinancialContent, (array) ($snapshot['content'] ?? []));

            return $copy;
        });
    }

    /** @return array<int, array<string, mixed>> */
    public function statuses(TravelPackage $package): array
    {
        $package->load('products');

        return $package->products->map(function (TravelProduct $product): array {
            $snapshot = $this->snapshotFrom($product);
            $currentHash = $this->fingerprint($product);
            $snapshotHash = (string) ($product->pivot->price_snapshot_hash ?? '');
            $snapshotAt = $product->pivot->price_snapshot_at;

            return [
                'product_id' => (int) $product->id,
                'name' => (string) ($product->name ?: $product->code),
                'product_type' => (string) $product->product_type,
                'is_package_specific' => $product->isPackageSpecific(),
                'has_snapshot' => $snapshot !== null,
                'is_stale' => $snapshot === null || ! hash_equals($snapshotHash, $currentHash),
                'snapshot_at' => $snapshotAt !== null
                    ? Carbon::parse($snapshotAt)->toDateTimeString()
                    : null,
                'snapshot_price' => data_get($snapshot, 'content.price'),
                'current_price' => data_get($product->content, 'price'),
                'currency' => (string) data_get($snapshot, 'content.currency', data_get($product->content, 'currency', 'IDR')),
            ];
        })->values()->all();
    }

    /** @return array<string, mixed>|null */
    public function snapshotFrom(TravelProduct $product): ?array
    {
        $snapshot = $product->pivot?->price_snapshot;

        if (is_string($snapshot)) {
            $snapshot = json_decode($snapshot, true);
        }

        return is_array($snapshot) ? $snapshot : null;
    }

    private function writeSnapshot(TravelPackage $package, TravelProduct $product): void
    {
        $snapshot = $this->snapshot($product);

        $package->products()->updateExistingPivot($product->id, [
            'price_snapshot' => json_encode($snapshot, JSON_THROW_ON_ERROR),
            'price_snapshot_hash' => $this->fingerprint($product),
            'price_snapshot_at' => now(),
        ]);
    }

    /** @return array<string, mixed> */
    private function snapshot(TravelProduct $product): array
    {
        return [
            'version' => 1,
            'product_id' => (int) $product->id,
            'content' => collect(is_array($product->content) ? $product->content : [])
                ->only(self::FINANCIAL_CONTENT_KEYS)
                ->all(),
        ];
    }

    private function fingerprint(TravelProduct $product): string
    {
        return hash('sha256', json_encode(
            $this->sortRecursively($this->snapshot($product)['content']),
            JSON_THROW_ON_ERROR | JSON_PRESERVE_ZERO_FRACTION,
        ));
    }

    private function sortRecursively(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        foreach ($value as $key => $item) {
            $value[$key] = $this->sortRecursively($item);
        }

        if (! array_is_list($value)) {
            ksort($value);
        }

        return $value;
    }
}
