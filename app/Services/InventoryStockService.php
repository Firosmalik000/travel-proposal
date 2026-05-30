<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\InventoryItem;
use App\Models\InventoryStockMutation;
use App\Models\TravelPackage;
use DomainException;
use Illuminate\Support\Collection;

class InventoryStockService
{
    public function syncForBooking(Booking $booking, array $previous = []): void
    {
        $currentAllocations = $this->allocationsFor(
            (int) $booking->package_id,
            (int) $booking->passenger_count,
            (string) $booking->status,
        );

        $previousAllocations = $this->allocationsFor(
            (int) ($previous['package_id'] ?? 0),
            (int) ($previous['passenger_count'] ?? 0),
            (string) ($previous['status'] ?? ''),
        );

        $inventoryIds = $currentAllocations->keys()
            ->merge($previousAllocations->keys())
            ->unique()
            ->values();

        if ($inventoryIds->isEmpty()) {
            return;
        }

        $items = InventoryItem::query()
            ->whereIn('id', $inventoryIds->all())
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($inventoryIds as $inventoryId) {
            $item = $items->get($inventoryId);
            if (! $item instanceof InventoryItem) {
                continue;
            }

            $target = (int) $currentAllocations->get($inventoryId, 0);
            $source = (int) $previousAllocations->get($inventoryId, 0);
            $delta = $target - $source;

            if ($delta === 0) {
                continue;
            }

            $this->applyDelta(
                $item,
                $booking,
                $delta * -1,
                'booking_allocation_sync',
                sprintf('Sinkron stok booking %s.', (string) $booking->booking_code),
            );
        }
    }

    public function applyManualAdjustment(InventoryItem $item, int $delta, ?string $notes = null): void
    {
        $this->applyDelta(
            $item,
            null,
            $delta,
            'manual_adjustment',
            $notes ?: 'Penyesuaian stok manual.',
        );
    }

    private function applyDelta(
        InventoryItem $item,
        ?Booking $booking,
        int $delta,
        string $changeType,
        string $notes,
    ): void {
        if ($delta === 0) {
            return;
        }

        $before = (int) $item->quantity;
        $after = $before + $delta;

        if ($after < 0) {
            throw new DomainException(sprintf(
                'Stok produk "%s" tidak mencukupi. Sisa stok saat ini %d.',
                (string) ($item->product?->name ?: $item->product?->code ?: 'Unknown Product'),
                $before
            ));
        }

        $item->update([
            'quantity' => $after,
        ]);

        InventoryStockMutation::query()->create([
            'inventory_item_id' => $item->id,
            'product_id' => $item->product_id,
            'booking_id' => $booking?->id,
            'change_type' => $changeType,
            'quantity_before' => $before,
            'quantity_change' => $delta,
            'quantity_after' => $after,
            'notes' => $notes,
            'meta' => $booking instanceof Booking
                ? ['booking_code' => (string) $booking->booking_code]
                : null,
        ]);
    }

    /**
     * @return Collection<int, int>
     */
    private function allocationsFor(int $packageId, int $passengerCount, string $status): Collection
    {
        if ($packageId <= 0 || $passengerCount <= 0 || $status !== 'registered') {
            return collect();
        }

        $package = TravelPackage::query()
            ->with([
                'products.inventoryItem:id,product_id',
            ])
            ->find($packageId);

        if (! $package instanceof TravelPackage) {
            return collect();
        }

        return $package->products
            ->map(function ($product) use ($passengerCount): ?array {
                $inventoryItemId = $product->inventoryItem?->id;
                if (! is_int($inventoryItemId)) {
                    return null;
                }

                return [
                    'inventory_item_id' => $inventoryItemId,
                    'quantity' => $passengerCount,
                ];
            })
            ->filter()
            ->mapWithKeys(fn (array $allocation): array => [
                $allocation['inventory_item_id'] => $allocation['quantity'],
            ]);
    }
}
