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
                'key' => 'dokumen',
                'name' => 'Dokumen',
                'description' => 'Kategori untuk visa, paspor, dan dokumen pendukung jamaah.',
                'sort_order' => 1,
            ],
            [
                'key' => 'transportasi',
                'name' => 'Transportasi',
                'description' => 'Kategori untuk tiket, bus, dan mobilitas perjalanan jamaah.',
                'sort_order' => 2,
            ],
            [
                'key' => 'akomodasi',
                'name' => 'Akomodasi',
                'description' => 'Kategori untuk hotel dan fasilitas inap selama perjalanan.',
                'sort_order' => 3,
            ],
            [
                'key' => 'layanan',
                'name' => 'Layanan',
                'description' => 'Kategori untuk manasik, pendampingan, dan layanan operasional.',
                'sort_order' => 4,
            ],
            [
                'key' => 'perlengkapan',
                'name' => 'Perlengkapan',
                'description' => 'Kategori untuk perlengkapan ibadah dan kebutuhan perjalanan jamaah.',
                'sort_order' => 5,
            ],
        ];

        foreach ($categories as $category) {
            ProductCategory::query()->updateOrCreate(
                ['key' => $category['key']],
                $category + ['is_active' => true],
            );
        }
    }
}
