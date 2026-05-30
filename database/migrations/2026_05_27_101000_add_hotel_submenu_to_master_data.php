<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $masterDataMenu = DB::table('menus')->where('menu_key', 'master_data')->first();

        $hotelChild = [
            'name' => 'Hotel',
            'menu_key' => 'hotel',
            'path' => '/dashboard/master-data/hotels',
            'icon' => 'Building2',
            'order' => 2,
            'is_active' => true,
            'children' => null,
        ];

        if ($masterDataMenu) {
            $children = json_decode((string) ($masterDataMenu->children ?? '[]'), true);
            if (! is_array($children)) {
                $children = [];
            }

            $exists = collect($children)->contains(fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'hotel');

            if (! $exists) {
                $children[] = $hotelChild;

                DB::table('menus')
                    ->where('id', $masterDataMenu->id)
                    ->update([
                        'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                        'updated_at' => now(),
                    ]);
            }
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $masterDataMenu = DB::table('menus')->where('menu_key', 'master_data')->first();

        if (! $masterDataMenu) {
            return;
        }

        $children = json_decode((string) ($masterDataMenu->children ?? '[]'), true);
        if (! is_array($children)) {
            $children = [];
        }

        $children = collect($children)
            ->reject(fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'hotel')
            ->values()
            ->all();

        DB::table('menus')
            ->where('id', $masterDataMenu->id)
            ->update([
                'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }
};
