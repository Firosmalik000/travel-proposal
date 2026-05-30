<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('product_categories')) {
            return;
        }

        DB::table('product_categories')->updateOrInsert(
            ['key' => 'hotel'],
            [
                'name' => 'Hotel',
                'description' => 'Kategori produk hotel yang disinkronkan dari Master Hotel.',
                'sort_order' => 6,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        if (! Schema::hasTable('product_categories')) {
            return;
        }

        DB::table('product_categories')->where('key', 'hotel')->delete();
    }
};
