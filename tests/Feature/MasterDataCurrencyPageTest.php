<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\User;
use App\Support\MenuPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MasterDataCurrencyPageTest extends TestCase
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
                        'name' => 'Master Currency',
                        'menu_key' => 'master_currency',
                        'path' => '/dashboard/master-data/currencies',
                        'icon' => 'Coins',
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

    public function test_currency_page_requires_view_permission(): void
    {
        $user = User::factory()->create();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        $this->actingAs($user)
            ->get('/admin/master-data/currencies')
            ->assertForbidden();
    }

    public function test_currency_page_renders_with_permission(): void
    {
        $user = User::factory()->create();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.master_currency.view');

        $this->actingAs($user)
            ->get('/admin/master-data/currencies')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/MasterData/Currencies/Index')
                ->has('currencies')
                ->where('filters.search', ''));
    }
}
