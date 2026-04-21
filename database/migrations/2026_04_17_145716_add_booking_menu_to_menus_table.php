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

        $now = now();

        DB::table('menus')
            ->where('menu_key', 'administrator')
            ->update([
                'order' => 5,
                'updated_at' => $now,
            ]);

        $existingMenu = DB::table('menus')
            ->where('menu_key', 'booking_management')
            ->first();

        $payload = [
            'name' => 'Booking',
            'menu_key' => 'booking_management',
            'path' => '/dashboard/booking-management',
            'icon' => 'BookOpen',
            'children' => json_encode([
                [
                    'name' => 'Register',
                    'menu_key' => 'booking_register',
                    'path' => '/dashboard/booking-management/register',
                    'icon' => 'ClipboardList',
                    'order' => 1,
                    'is_active' => true,
                    'children' => null,
                ],
                [
                    'name' => 'Listing',
                    'menu_key' => 'booking_listing',
                    'path' => '/dashboard/booking-management/listing',
                    'icon' => 'Users',
                    'order' => 2,
                    'is_active' => true,
                    'children' => null,
                ],
            ], JSON_THROW_ON_ERROR),
            'order' => 4,
            'is_active' => true,
            'updated_at' => $now,
        ];

        if ($existingMenu) {
            DB::table('menus')
                ->where('menu_key', 'booking_management')
                ->update($payload);

            return;
        }

        DB::table('menus')->insert([
            ...$payload,
            'created_at' => $now,
        ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        DB::table('menus')
            ->where('menu_key', 'booking_management')
            ->delete();

        DB::table('menus')
            ->where('menu_key', 'administrator')
            ->update([
                'order' => 4,
                'updated_at' => now(),
            ]);
    }
};
