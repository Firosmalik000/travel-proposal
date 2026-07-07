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

        if (! $masterDataMenu) {
            return;
        }

        $children = json_decode((string) ($masterDataMenu->children ?? '[]'), true);

        if (! is_array($children)) {
            $children = [];
        }

        $removeKeys = ['hotel'];

        $children = collect($children)
            ->reject(function (mixed $child) use ($removeKeys): bool {
                return is_array($child) && in_array(($child['menu_key'] ?? null), $removeKeys, true);
            })
            ->values()
            ->all();

        DB::table('menus')
            ->where('id', $masterDataMenu->id)
            ->update([
                'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
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

        $entries = [
            [
                'name' => 'Hotel',
                'menu_key' => 'hotel',
                'path' => '/dashboard/master-data/hotels',
                'icon' => 'Building2',
                'order' => 2,
                'is_active' => true,
                'children' => null,
            ],
            [
                'name' => 'Master Negara',
                'menu_key' => 'hotel_country',
                'path' => '/dashboard/master-data/hotel-countries',
                'icon' => 'Flag',
                'order' => 2,
                'is_active' => true,
                'children' => null,
            ],
            [
                'name' => 'Master Kota',
                'menu_key' => 'hotel_city',
                'path' => '/dashboard/master-data/hotel-cities',
                'icon' => 'MapPinned',
                'order' => 3,
                'is_active' => true,
                'children' => null,
            ],
            [
                'name' => 'Master Room Type',
                'menu_key' => 'hotel_room_type',
                'path' => '/dashboard/master-data/hotel-room-types',
                'icon' => 'BedDouble',
                'order' => 4,
                'is_active' => true,
                'children' => null,
            ],
        ];

        foreach ($entries as $entry) {
            $exists = collect($children)->contains(function (mixed $child) use ($entry): bool {
                return is_array($child) && ($child['menu_key'] ?? null) === $entry['menu_key'];
            });

            if (! $exists) {
                $children[] = $entry;
            }
        }

        DB::table('menus')
            ->where('id', $masterDataMenu->id)
            ->update([
                'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }
};
