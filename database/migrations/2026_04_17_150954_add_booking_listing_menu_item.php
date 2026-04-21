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

        $menu = DB::table('menus')
            ->where('menu_key', 'booking_management')
            ->first();

        if (! $menu) {
            return;
        }

        $children = json_decode((string) $menu->children, true);
        $children = is_array($children) ? $children : [];

        $hasListing = collect($children)->contains(
            fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'booking_listing'
        );

        if ($hasListing) {
            return;
        }

        $children[] = [
            'name' => 'Listing',
            'menu_key' => 'booking_listing',
            'path' => '/dashboard/booking-management/listing',
            'icon' => 'Users',
            'order' => 2,
            'is_active' => true,
            'children' => null,
        ];

        DB::table('menus')
            ->where('menu_key', 'booking_management')
            ->update([
                'children' => json_encode($children, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $menu = DB::table('menus')
            ->where('menu_key', 'booking_management')
            ->first();

        if (! $menu) {
            return;
        }

        $children = json_decode((string) $menu->children, true);
        $children = is_array($children) ? $children : [];

        $filteredChildren = collect($children)
            ->reject(fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'booking_listing')
            ->values()
            ->all();

        DB::table('menus')
            ->where('menu_key', 'booking_management')
            ->update([
                'children' => json_encode($filteredChildren, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
    }
};
