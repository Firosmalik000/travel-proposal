<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'key' => 'hotel',
                'name' => 'Hotel',
                'description' => 'Kategori untuk produk hotel dan akomodasi jamaah.',
                'sort_order' => 1,
            ],
            [
                'key' => 'tiket',
                'name' => 'Tiket',
                'description' => 'Kategori untuk tiket penerbangan dan transportasi perjalanan.',
                'sort_order' => 2,
            ],
            [
                'key' => 'merchandise',
                'name' => 'Merchandise',
                'description' => 'Kategori untuk merchandise dan perlengkapan identitas jamaah.',
                'sort_order' => 3,
            ],
            [
                'key' => 'perlengkapan',
                'name' => 'Perlengkapan',
                'description' => 'Kategori untuk kebutuhan pendukung layanan dan ibadah jamaah.',
                'sort_order' => 4,
            ],
        ];

        $activeKeys = collect($categories)->pluck('key')->all();

        ProductCategory::query()
            ->whereNotIn('key', $activeKeys)
            ->update(['is_active' => false]);

        foreach ($categories as $category) {
            ProductCategory::query()->updateOrCreate(
                ['key' => $category['key']],
                $category + ['is_active' => true],
            );
        }
    }
}
