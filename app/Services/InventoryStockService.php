<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\FinancialAccount;
use App\Models\InventoryItem;
use App\Models\InventoryStockMutation;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InventoryStockService
{
    public function __construct(private readonly FinancialLedgerService $financialLedgerService) {}

    /**
     * @return array{
     *     has_tracked_inventory: bool,
     *     total_tracked_products: int,
     *     insufficient_items: array<int, array{product_name:string, available:int, required:int}>
     * }
     */
    public function stockPreviewForPackage(int $packageId, int $passengerCount): array
    {
        if ($packageId <= 0 || $passengerCount <= 0) {
            return [
                'has_tracked_inventory' => false,
                'total_tracked_products' => 0,
                'insufficient_items' => [],
            ];
        }

        $package = TravelPackage::query()
            ->with(['products.inventoryItem:id,product_id,quantity'])
            ->find($packageId);

        if (! $package instanceof TravelPackage) {
            return [
                'has_tracked_inventory' => false,
                'total_tracked_products' => 0,
                'insufficient_items' => [],
            ];
        }

        $trackedProducts = $package->products
            ->filter(fn ($product): bool => $product->inventoryItem instanceof InventoryItem)
            ->values();

        $insufficientItems = $trackedProducts
            ->map(function ($product) use ($passengerCount): ?array {
                $inventoryItem = $product->inventoryItem;

                if (! $inventoryItem instanceof InventoryItem) {
                    return null;
                }

                $multiplierPerPax = max((int) ($product->pivot->multiplier_per_pax ?? 1), 1);
                $required = $passengerCount * $multiplierPerPax;
                $available = $inventoryItem->availableQuantity();

                if ($available >= $required) {
                    return null;
                }

                return [
                    'product_name' => (string) ($product->name ?: $product->code ?: 'Unknown Product'),
                    'available' => $available,
                    'required' => $required,
                ];
            })
            ->filter()
            ->values()
            ->all();

        return [
            'has_tracked_inventory' => $trackedProducts->isNotEmpty(),
            'total_tracked_products' => $trackedProducts->count(),
            'insufficient_items' => $insufficientItems,
        ];
    }

    public function syncForBooking(Booking $booking, array $previous = []): void
    {
        TravelPackage::query()->lockForUpdate()->find($booking->package_id)?->ensureFinanciallyOpen();
        $currentAllocations = $this->allocationsFor(
            (int) $booking->package_id,
            (int) $booking->passenger_count,
            (string) $booking->status,
        );

        $inventoryIds = $currentAllocations->keys()
            ->merge(InventoryStockMutation::query()
                ->where('booking_id', $booking->id)
                ->where('reserved_quantity_change', '!=', 0)
                ->pluck('inventory_item_id'))
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
            $issued = abs((int) InventoryStockMutation::query()
                ->where('booking_id', $booking->id)
                ->where('inventory_item_id', $inventoryId)
                ->where('change_type', 'booking_issue')
                ->sum('quantity_change'));
            $target = max(0, $target - $issued);
            $source = (int) InventoryStockMutation::query()
                ->where('booking_id', $booking->id)
                ->where('inventory_item_id', $inventoryId)
                ->sum('reserved_quantity_change');
            $delta = $target - $source;

            if ($delta === 0) {
                continue;
            }

            $this->applyReservationDelta(
                $item,
                $booking,
                $delta,
                $delta > 0 ? 'booking_reservation' : 'booking_reservation_release',
                sprintf('Sinkron stok booking %s.', (string) $booking->booking_code),
                [
                    'allocated_quantity' => $target,
                    'previous_allocated_quantity' => $source,
                ],
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

    /** @param array<string, mixed> $data */
    public function receivePurchase(InventoryItem $item, array $data): InventoryStockMutation
    {
        return DB::transaction(function () use ($item, $data): InventoryStockMutation {
            $locked = InventoryItem::query()->lockForUpdate()->findOrFail($item->id);
            $quantity = (int) $data['quantity'];
            $unitCost = (int) $data['unit_cost_idr'];
            $totalCost = $quantity * $unitCost;
            $payloadHash = $this->stockPayloadHash([
                'inventory_item_id' => $locked->id,
                'quantity' => $quantity,
                'unit_cost_idr' => $unitCost,
                'financial_account_id' => (int) $data['financial_account_id'],
                'transaction_date' => (string) $data['transaction_date'],
                'notes' => trim((string) $data['notes']),
            ]);
            $existing = $this->resolveIdempotentMutation((string) $data['idempotency_key'], $payloadHash);
            if ($existing instanceof InventoryStockMutation) {
                return $existing;
            }

            $before = $locked->quantity;
            $after = $before + $quantity;
            $currentValue = $before * $locked->average_unit_cost_idr;
            $averageCost = (int) round(($currentValue + $totalCost) / $after);

            $locked->update(['quantity' => $after, 'average_unit_cost_idr' => $averageCost]);
            $mutation = InventoryStockMutation::query()->create([
                'inventory_item_id' => $locked->id,
                'product_id' => $locked->product_id,
                'change_type' => 'purchase_receipt',
                'quantity_before' => $before,
                'quantity_change' => $quantity,
                'reserved_quantity_change' => 0,
                'quantity_after' => $after,
                'unit_cost_idr' => $unitCost,
                'total_cost_idr' => $totalCost,
                'idempotency_key' => $data['idempotency_key'],
                'payload_hash' => $payloadHash,
                'notes' => $data['notes'],
            ]);

            $inventoryAccount = FinancialAccount::query()->where('system_key', 'inventory')->where('is_active', true)->first();
            $cashAccount = FinancialAccount::query()->whereKey($data['financial_account_id'])->where('is_active', true)->where('is_cash_account', true)->first();
            if (! $inventoryAccount instanceof FinancialAccount || ! $cashAccount instanceof FinancialAccount) {
                throw new DomainException('Akun inventory atau rekening pembayaran tidak tersedia dan aktif.');
            }
            if (in_array($cashAccount->cash_account_type, ['customer_funds', 'legacy'], true)) {
                throw new DomainException('Pembelian inventory hanya dapat dibayar dari rekening operasional atau kas kecil.');
            }

            $this->financialLedgerService->post([
                'transaction_date' => $data['transaction_date'],
                'transaction_type' => 'inventory_purchase',
                'source_type' => InventoryStockMutation::class,
                'source_id' => $mutation->id,
                'currency' => 'IDR',
                'exchange_rate' => 1,
                'idempotency_key' => $data['idempotency_key'],
                'description' => $data['notes'],
            ], [
                ['financial_account_id' => $inventoryAccount->id, 'entry_type' => 'debit', 'amount_original' => $totalCost, 'amount_idr' => $totalCost, 'description' => $data['notes']],
                ['financial_account_id' => $cashAccount->id, 'entry_type' => 'credit', 'amount_original' => $totalCost, 'amount_idr' => $totalCost, 'description' => $data['notes']],
            ]);

            return $mutation;
        });
    }

    /** @param array<string, mixed> $data */
    public function issueToBooking(InventoryItem $item, Booking $booking, array $data): InventoryStockMutation
    {
        return DB::transaction(function () use ($item, $booking, $data): InventoryStockMutation {
            $locked = InventoryItem::query()->lockForUpdate()->findOrFail($item->id);
            $lockedBooking = Booking::query()->lockForUpdate()->findOrFail($booking->id);
            $lockedBooking->package()->lockForUpdate()->firstOrFail()->ensureFinanciallyOpen();
            $quantity = (int) $data['quantity'];
            $payloadHash = $this->stockPayloadHash([
                'inventory_item_id' => $locked->id,
                'booking_id' => $lockedBooking->id,
                'quantity' => $quantity,
                'transaction_date' => (string) $data['transaction_date'],
                'notes' => trim((string) $data['notes']),
            ]);
            $existing = $this->resolveIdempotentMutation((string) $data['idempotency_key'], $payloadHash);
            if ($existing instanceof InventoryStockMutation) {
                return $existing;
            }

            $reservedForBooking = (int) InventoryStockMutation::query()
                ->where('inventory_item_id', $locked->id)
                ->where('booking_id', $lockedBooking->id)
                ->sum('reserved_quantity_change');
            if ($quantity < 1 || $quantity > $reservedForBooking || $quantity > $locked->reserved_quantity || $quantity > $locked->quantity) {
                throw new DomainException('Jumlah serah-terima melebihi stok yang direservasi untuk booking ini.');
            }
            if ($locked->average_unit_cost_idr < 1) {
                throw new DomainException('Nilai rata-rata inventory belum tersedia. Catat penerimaan pembelian terlebih dahulu sebelum serah-terima.');
            }

            $before = $locked->quantity;
            $after = $before - $quantity;
            $totalCost = $quantity * $locked->average_unit_cost_idr;
            $locked->update(['quantity' => $after, 'reserved_quantity' => $locked->reserved_quantity - $quantity]);
            $mutation = InventoryStockMutation::query()->create([
                'inventory_item_id' => $locked->id,
                'product_id' => $locked->product_id,
                'booking_id' => $lockedBooking->id,
                'change_type' => 'booking_issue',
                'quantity_before' => $before,
                'quantity_change' => $quantity * -1,
                'reserved_quantity_change' => $quantity * -1,
                'quantity_after' => $after,
                'unit_cost_idr' => $locked->average_unit_cost_idr,
                'total_cost_idr' => $totalCost,
                'idempotency_key' => $data['idempotency_key'],
                'payload_hash' => $payloadHash,
                'notes' => $data['notes'],
                'meta' => ['booking_code' => $lockedBooking->booking_code],
            ]);

            $inventoryAccount = FinancialAccount::query()->where('system_key', 'inventory')->where('is_active', true)->first();
            $costAccount = FinancialAccount::query()->where('system_key', 'trip_cost')->where('is_active', true)->first();
            if (! $inventoryAccount instanceof FinancialAccount || ! $costAccount instanceof FinancialAccount) {
                throw new DomainException('Akun Persediaan atau HPP Trip tidak tersedia dan aktif.');
            }
            $this->financialLedgerService->post([
                'transaction_date' => $data['transaction_date'],
                'transaction_type' => 'inventory_issue',
                'source_type' => InventoryStockMutation::class,
                'source_id' => $mutation->id,
                'package_id' => $lockedBooking->package_id,
                'currency' => 'IDR',
                'exchange_rate' => 1,
                'idempotency_key' => $data['idempotency_key'],
                'description' => $data['notes'],
            ], [
                ['financial_account_id' => $costAccount->id, 'entry_type' => 'debit', 'amount_original' => $totalCost, 'amount_idr' => $totalCost, 'description' => $data['notes']],
                ['financial_account_id' => $inventoryAccount->id, 'entry_type' => 'credit', 'amount_original' => $totalCost, 'amount_idr' => $totalCost, 'description' => $data['notes']],
            ]);

            return $mutation;
        });
    }

    /**
     * @param  array<int, mixed>  $productIds
     * @param  array<string|int, mixed>  $productMultipliers
     */
    public function ensurePackageProductConfigurationCanChange(
        TravelPackage $package,
        array $productIds,
        array $productMultipliers,
    ): void {
        if (! $package->registrations()->where('status', 'registered')->exists()) {
            return;
        }

        $package->loadMissing(['products.inventoryItem:id,product_id']);
        $currentConfiguration = $package->products
            ->filter(fn (TravelProduct $product): bool => $product->inventoryItem instanceof InventoryItem)
            ->mapWithKeys(fn (TravelProduct $product): array => [
                (int) $product->id => max((int) ($product->pivot->multiplier_per_pax ?? 1), 1),
            ])
            ->sortKeys()
            ->all();

        $desiredProducts = TravelProduct::query()
            ->includingPackageSpecific()
            ->with('inventoryItem:id,product_id')
            ->whereIn('id', collect($productIds)->filter(fn ($id): bool => is_numeric($id))->map(fn ($id): int => (int) $id)->all())
            ->get();
        $desiredConfiguration = $desiredProducts
            ->filter(fn (TravelProduct $product): bool => $product->inventoryItem instanceof InventoryItem)
            ->mapWithKeys(fn (TravelProduct $product): array => [
                (int) $product->id => max((int) ($productMultipliers[(string) $product->id] ?? $productMultipliers[$product->id] ?? 1), 1),
            ])
            ->sortKeys()
            ->all();

        if ($currentConfiguration !== $desiredConfiguration) {
            throw new DomainException(
                'Produk ber-inventory atau nilai x/pax tidak dapat diubah karena package sudah memiliki booking terdaftar. Batalkan booking terkait atau lakukan rekonsiliasi stok terlebih dahulu.',
            );
        }
    }

    private function applyDelta(
        InventoryItem $item,
        ?Booking $booking,
        int $delta,
        string $changeType,
        string $notes,
        ?array $meta = null,
    ): void {
        if ($delta === 0) {
            return;
        }

        $before = (int) $item->quantity;
        $after = $before + $delta;

        if ($after < $item->reserved_quantity) {
            throw new DomainException(sprintf(
                'Stok produk "%s" tidak dapat lebih kecil dari jumlah yang sudah direservasi (%d).',
                (string) ($item->product?->name ?: $item->product?->code ?: 'Unknown Product'),
                $item->reserved_quantity
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
            'reserved_quantity_change' => 0,
            'quantity_after' => $after,
            'notes' => $notes,
            'meta' => $booking instanceof Booking
                ? ['booking_code' => (string) $booking->booking_code, ...($meta ?? [])]
                : $meta,
        ]);
    }

    private function applyReservationDelta(InventoryItem $item, Booking $booking, int $delta, string $changeType, string $notes, ?array $meta = null): void
    {
        if ($delta === 0) {
            return;
        }

        $reservedAfter = $item->reserved_quantity + $delta;
        if ($reservedAfter < 0 || $reservedAfter > $item->quantity) {
            throw new DomainException(sprintf(
                'Stok tersedia produk "%s" tidak mencukupi untuk reservasi booking.',
                (string) ($item->product?->name ?: $item->product?->code ?: 'Unknown Product'),
            ));
        }

        $item->update(['reserved_quantity' => $reservedAfter]);
        InventoryStockMutation::query()->create([
            'inventory_item_id' => $item->id,
            'product_id' => $item->product_id,
            'booking_id' => $booking->id,
            'change_type' => $changeType,
            'quantity_before' => $item->quantity,
            'quantity_change' => 0,
            'reserved_quantity_change' => $delta,
            'quantity_after' => $item->quantity,
            'notes' => $notes,
            'meta' => ['booking_code' => (string) $booking->booking_code, ...($meta ?? [])],
        ]);
    }

    /** @param array<string, int|string> $payload */
    private function stockPayloadHash(array $payload): string
    {
        ksort($payload);

        return hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR));
    }

    private function resolveIdempotentMutation(string $idempotencyKey, string $payloadHash): ?InventoryStockMutation
    {
        $existing = InventoryStockMutation::query()
            ->where('idempotency_key', $idempotencyKey)
            ->lockForUpdate()
            ->first();

        if (! $existing instanceof InventoryStockMutation) {
            return null;
        }
        if (! hash_equals((string) $existing->payload_hash, $payloadHash)) {
            throw new DomainException('Kunci idempotensi sudah digunakan untuk data mutasi inventory yang berbeda.');
        }

        return $existing;
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

                $multiplierPerPax = max((int) ($product->pivot->multiplier_per_pax ?? 1), 1);

                return [
                    'inventory_item_id' => $inventoryItemId,
                    'quantity' => $passengerCount * $multiplierPerPax,
                ];
            })
            ->filter()
            ->mapWithKeys(fn (array $allocation): array => [
                $allocation['inventory_item_id'] => $allocation['quantity'],
            ]);
    }
}
