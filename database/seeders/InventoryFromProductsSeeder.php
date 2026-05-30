<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\TravelProduct;
use Illuminate\Database\Seeder;

class InventoryFromProductsSeeder extends Seeder
{
    public function run(): void
    {
        $allowedCategories = ['merchandise', 'perlengkapan'];

        TravelProduct::query()
            ->where('is_active', true)
            ->whereIn('product_type', $allowedCategories)
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'product_type', 'content'])
            ->each(function (TravelProduct $product): void {
                $unit = is_array($product->content)
                    ? (string) ($product->content['unit'] ?? '')
                    : '';
                $seededQuantity = $this->seededQuantityForProduct($product);

                $inventoryItem = InventoryItem::query()->firstOrNew([
                    'product_id' => $product->id,
                ]);

                $inventoryItem->fill([
                    'item_code' => (string) $product->code,
                    'item_name' => (string) $product->name,
                    'category' => (string) $product->product_type,
                    'unit' => $unit !== '' ? $unit : null,
                    'notes' => 'Generated from product seeder (merchandise/perlengkapan).',
                    'is_active' => true,
                ]);

                if (! $inventoryItem->exists || (int) $inventoryItem->quantity === 0) {
                    $inventoryItem->quantity = $seededQuantity;
                }

                $inventoryItem->save();
            });
    }

    private function seededQuantityForProduct(TravelProduct $product): int
    {
        $content = is_array($product->content) ? $product->content : [];

        foreach (['inventory_quantity', 'stock_quantity', 'stock', 'quantity'] as $key) {
            $raw = $content[$key] ?? null;
            if (is_numeric($raw) && (int) $raw >= 0) {
                return (int) $raw;
            }
        }

        return match ($product->product_type) {
            'merchandise' => 100,
            'perlengkapan' => 50,
            default => 0,
        };
    }
}
