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
                'name' => ['id' => 'Dokumen', 'en' => 'Documents'],
                'description' => ['id' => 'Kategori untuk visa, paspor, dan dokumen pendukung jamaah.', 'en' => 'Category for visas, passports, and pilgrim supporting documents.'],
                'sort_order' => 1,
            ],
            [
                'key' => 'transportasi',
                'name' => ['id' => 'Transportasi', 'en' => 'Transportation'],
                'description' => ['id' => 'Kategori untuk tiket, bus, dan mobilitas perjalanan jamaah.', 'en' => 'Category for tickets, buses, and pilgrim travel mobility.'],
                'sort_order' => 2,
            ],
            [
                'key' => 'akomodasi',
                'name' => ['id' => 'Akomodasi', 'en' => 'Accommodation'],
                'description' => ['id' => 'Kategori untuk hotel dan fasilitas inap selama perjalanan.', 'en' => 'Category for hotels and stay facilities during the trip.'],
                'sort_order' => 3,
            ],
            [
                'key' => 'layanan',
                'name' => ['id' => 'Layanan', 'en' => 'Services'],
                'description' => ['id' => 'Kategori untuk manasik, pendampingan, dan layanan operasional.', 'en' => 'Category for manasik, guidance, and operational services.'],
                'sort_order' => 4,
            ],
            [
                'key' => 'perlengkapan',
                'name' => ['id' => 'Perlengkapan', 'en' => 'Equipment'],
                'description' => ['id' => 'Kategori untuk perlengkapan ibadah dan kebutuhan perjalanan jamaah.', 'en' => 'Category for worship equipment and pilgrim travel needs.'],
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
