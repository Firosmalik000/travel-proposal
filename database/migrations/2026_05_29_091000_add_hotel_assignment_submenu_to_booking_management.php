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

        $menu = DB::table('menus')->where('menu_key', 'booking_management')->first();

        if (! $menu) {
            return;
        }

        $children = json_decode((string) ($menu->children ?? '[]'), true);
        if (! is_array($children)) {
            $children = [];
        }

        $exists = collect($children)->contains(
            fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'booking_hotel_assignment'
        );

        if ($exists) {
            return;
        }

        $children[] = [
            'name' => 'Hotel Assignment',
            'menu_key' => 'booking_hotel_assignment',
            'path' => '/dashboard/booking-management/hotel-assignment',
            'icon' => 'Hotel',
            'order' => 3,
            'is_active' => true,
            'children' => null,
        ];

        DB::table('menus')
            ->where('id', $menu->id)
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

        $menu = DB::table('menus')->where('menu_key', 'booking_management')->first();
        if (! $menu) {
            return;
        }

        $children = json_decode((string) ($menu->children ?? '[]'), true);
        if (! is_array($children)) {
            $children = [];
        }

        $children = collect($children)
            ->reject(fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'booking_hotel_assignment')
            ->values()
            ->all();

        DB::table('menus')
            ->where('id', $menu->id)
            ->update([
                'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }
};
