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
                'key' => 'maskapai',
                'name' => 'Maskapai',
                'description' => 'Kategori untuk produk tiket dan layanan maskapai penerbangan.',
                'sort_order' => 2,
            ],
            [
                'key' => 'perlengkapan',
                'name' => 'Perlengkapan',
                'description' => 'Kategori untuk kebutuhan pendukung layanan dan ibadah jamaah.',
                'sort_order' => 3,
            ],
            [
                'key' => 'transportasi',
                'name' => 'Transportasi',
                'description' => 'Kategori untuk transportasi darat dan layanan perpindahan jamaah.',
                'sort_order' => 4,
            ],
            [
                'key' => 'visa',
                'name' => 'Visa',
                'description' => 'Kategori untuk pengurusan visa dan dokumen perjalanan jamaah.',
                'sort_order' => 5,
            ],
            [
                'key' => 'manasik',
                'name' => 'Manasik',
                'description' => 'Kategori untuk kegiatan dan kebutuhan pelaksanaan manasik jamaah.',
                'sort_order' => 6,
            ],
            [
                'key' => 'handling-indonesia',
                'name' => 'Handling Indonesia',
                'description' => 'Kategori untuk layanan handling keberangkatan dan kepulangan di Indonesia.',
                'sort_order' => 7,
            ],
            [
                'key' => 'handling-saudi-arabia',
                'name' => 'Handling Saudi Arabia',
                'description' => 'Kategori untuk layanan handling dan pendampingan operasional di Saudi Arabia.',
                'sort_order' => 8,
            ],
        ];

        $categoryKeys = collect($categories)->pluck('key')->all();

        foreach ($categories as $category) {
            ProductCategory::query()->updateOrCreate(
                ['key' => $category['key']],
                $category + ['is_active' => true],
            );
        }

        ProductCategory::query()
            ->whereNotIn('key', $categoryKeys)
            ->delete();
    }
}
