<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\User;
use App\Support\MenuPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MasterDataHotelCountryPageTest extends TestCase
{
    use RefreshDatabase;

    private function ensureMenuExists(): void
    {
        Menu::query()->updateOrCreate(
            ['menu_key' => 'master_data'],
            [
                'name' => 'Master Data',
                'path' => '/dashboard/master-data',
                'icon' => 'Database',
                'children' => [
                    [
                        'name' => 'Master Negara',
                        'menu_key' => 'hotel_country',
                        'path' => '/dashboard/master-data/hotel-countries',
                        'icon' => 'Flag',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 1,
                'is_active' => true,
            ]
        );
    }

    public function test_country_page_requires_view_permission(): void
    {
        $user = User::factory()->create();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        $this->actingAs($user)
            ->get('/admin/master-data/hotel-countries')
            ->assertForbidden();
    }

    public function test_country_page_renders_with_permission(): void
    {
        $user = User::factory()->create();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.hotel_country.view');

        $this->actingAs($user)
            ->get('/admin/master-data/hotel-countries')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Dashboard/MasterData/HotelCountries/Index'));
    }

    public function test_country_can_be_created_with_permission(): void
    {
        $user = User::factory()->create();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo(['menu.hotel_country.view', 'menu.hotel_country.create']);

        $this->actingAs($user)
            ->post('/admin/master-data/hotel-countries', [
                'name' => 'Arab Saudi',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('hotel_countries', [
            'name' => 'Arab Saudi',
        ]);
    }
}
