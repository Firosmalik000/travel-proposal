<?php

namespace Tests\Feature;

use App\Models\Menu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataMenuCleanupTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_removes_legacy_hotel_menus_from_master_data(): void
    {
        Menu::query()->updateOrCreate([
            'menu_key' => 'master_data',
        ], [
            'name' => 'Master Data',
            'path' => '/dashboard/master-data',
            'icon' => 'Database',
            'order' => 5,
            'is_active' => true,
            'children' => [
                [
                    'name' => 'Inventory',
                    'menu_key' => 'inventory',
                    'path' => '/dashboard/master-data/inventory',
                    'icon' => 'Archive',
                    'order' => 1,
                    'is_active' => true,
                    'children' => null,
                ],
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
                    'order' => 3,
                    'is_active' => true,
                    'children' => null,
                ],
                [
                    'name' => 'Master Kota',
                    'menu_key' => 'hotel_city',
                    'path' => '/dashboard/master-data/hotel-cities',
                    'icon' => 'MapPinned',
                    'order' => 4,
                    'is_active' => true,
                    'children' => null,
                ],
                [
                    'name' => 'Master Room Type',
                    'menu_key' => 'hotel_room_type',
                    'path' => '/dashboard/master-data/hotel-room-types',
                    'icon' => 'BedDouble',
                    'order' => 5,
                    'is_active' => true,
                    'children' => null,
                ],
            ],
        ]);

        /** @var object $migration */
        $migration = require database_path('migrations/2026_07_07_164420_remove_hotel_submenus_from_master_data_menu.php');
        $migration->up();

        $children = Menu::query()->where('menu_key', 'master_data')->firstOrFail()->children;

        $this->assertSame(
            ['inventory', 'hotel_country', 'hotel_city', 'hotel_room_type'],
            collect($children)->pluck('menu_key')->all(),
        );
    }
}
