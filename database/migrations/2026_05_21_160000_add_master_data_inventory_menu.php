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

        $masterDataMenu = DB::table('menus')
            ->where('menu_key', 'master_data')
            ->first();

        $inventoryChild = [
            'name' => 'Inventory',
            'menu_key' => 'inventory',
            'path' => '/dashboard/master-data/inventory',
            'icon' => 'Archive',
            'order' => 1,
            'is_active' => true,
            'children' => null,
        ];

        if ($masterDataMenu) {
            $children = json_decode((string) ($masterDataMenu->children ?? '[]'), true);
            if (! is_array($children)) {
                $children = [];
            }

            $alreadyExists = collect($children)->contains(function (mixed $child): bool {
                return is_array($child) && ($child['menu_key'] ?? null) === 'inventory';
            });

            if (! $alreadyExists) {
                $children[] = $inventoryChild;

                DB::table('menus')
                    ->where('id', $masterDataMenu->id)
                    ->update([
                        'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                        'updated_at' => now(),
                    ]);
            }

            return;
        }

        $order = (int) DB::table('menus')->max('order');

        DB::table('menus')->insert([
            'name' => 'Master Data',
            'menu_key' => 'master_data',
            'path' => '/dashboard/master-data',
            'icon' => 'Database',
            'children' => json_encode([$inventoryChild], JSON_UNESCAPED_UNICODE),
            'order' => max(1, $order + 1),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $masterDataMenu = DB::table('menus')
            ->where('menu_key', 'master_data')
            ->first();

        if (! $masterDataMenu) {
            return;
        }

        $children = json_decode((string) ($masterDataMenu->children ?? '[]'), true);
        if (! is_array($children)) {
            $children = [];
        }

        $filteredChildren = collect($children)
            ->reject(function (mixed $child): bool {
                return is_array($child) && ($child['menu_key'] ?? null) === 'inventory';
            })
            ->values()
            ->all();

        if (empty($filteredChildren)) {
            DB::table('menus')
                ->where('id', $masterDataMenu->id)
                ->delete();

            return;
        }

        DB::table('menus')
            ->where('id', $masterDataMenu->id)
            ->update([
                'children' => json_encode($filteredChildren, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }
};
