<?php

namespace Tests\Feature;

use App\Models\Currency;
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
            ],
        );
    }

    private function makeSuperAdminUser(): User
    {
        return User::factory()->create([
            'email' => 'admin@asfartour.co.id',
            'username' => 'admin',
        ]);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        $this->get('/admin/master-data/currencies')
            ->assertRedirect('/login');
    }

    public function test_currency_page_is_forbidden_for_non_super_admins_even_with_permission(): void
    {
        $user = User::factory()->create();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.master_currency.view');

        $this->actingAs($user)
            ->get('/admin/master-data/currencies')
            ->assertForbidden();
    }

    public function test_currency_page_renders_for_super_admin(): void
    {
        $user = $this->makeSuperAdminUser();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        Currency::factory()->create([
            'code' => 'CHF',
            'name' => 'Swiss Franc',
            'conversion_rate' => 18650,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get('/admin/master-data/currencies')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/MasterData/Currencies/Index')
                ->has('currencies.data')
                ->where('filters.search', '')
                ->where('filters.status', 'all'));
    }

    public function test_sidebar_menu_hides_currency_for_non_super_admins(): void
    {
        $user = User::factory()->create();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.master_currency.view');

        $menus = $this->actingAs($user)
            ->getJson(route('user.menus'))
            ->assertOk()
            ->json();

        $menuKeys = collect($menus)
            ->flatMap(fn (array $menu): array => collect($menu['children'] ?? [])->pluck('menu_key')->all())
            ->all();

        $this->assertNotContains('master_currency', $menuKeys);
    }

    public function test_sidebar_menu_shows_currency_for_super_admin(): void
    {
        $user = $this->makeSuperAdminUser();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        $menus = $this->actingAs($user)
            ->getJson(route('user.menus'))
            ->assertOk()
            ->json();

        $menuKeys = collect($menus)
            ->flatMap(fn (array $menu): array => collect($menu['children'] ?? [])->pluck('menu_key')->all())
            ->all();

        $this->assertContains('master_currency', $menuKeys);
    }

    public function test_currency_can_be_created_by_super_admin(): void
    {
        $user = $this->makeSuperAdminUser();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        $this->actingAs($user)
            ->from('/admin/master-data/currencies')
            ->post('/admin/master-data/currencies', [
                'code' => 'brl',
                'name' => 'Brazilian Real',
                'conversion_rate' => '2950.500000',
                'notes' => 'Default for international pricing.',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('currencies', [
            'code' => 'BRL',
            'name' => 'Brazilian Real',
            'conversion_rate' => '2950.500000',
            'is_active' => true,
        ]);
    }

    public function test_currency_validation_rejects_duplicate_code(): void
    {
        $user = $this->makeSuperAdminUser();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        Currency::factory()->create([
            'code' => 'NOK',
        ]);

        $this->actingAs($user)
            ->from('/admin/master-data/currencies')
            ->post('/admin/master-data/currencies', [
                'code' => 'NOK',
                'name' => 'Norwegian Krone Duplicate',
                'conversion_rate' => '1750.000000',
                'notes' => null,
                'is_active' => true,
            ])
            ->assertSessionHasErrors(['code']);
    }

    public function test_currency_can_be_updated_by_super_admin(): void
    {
        $user = $this->makeSuperAdminUser();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        $currency = Currency::factory()->create([
            'code' => 'CAD',
            'name' => 'Canadian Dollar',
            'conversion_rate' => 11850,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->from('/admin/master-data/currencies')
            ->put('/admin/master-data/currencies/'.$currency->id, [
                'code' => 'CAD',
                'name' => 'Canadian Dollar Updated',
                'conversion_rate' => '12025.750000',
                'notes' => 'Updated note',
                'is_active' => false,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('currencies', [
            'id' => $currency->id,
            'name' => 'Canadian Dollar Updated',
            'conversion_rate' => '12025.750000',
            'is_active' => false,
        ]);
    }

    public function test_currency_can_be_deactivated_by_super_admin(): void
    {
        $user = $this->makeSuperAdminUser();
        $this->ensureMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        $currency = Currency::factory()->create([
            'code' => 'NZD',
            'name' => 'New Zealand Dollar',
            'conversion_rate' => 9850,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->from('/admin/master-data/currencies')
            ->delete('/admin/master-data/currencies/'.$currency->id)
            ->assertRedirect();

        $this->assertDatabaseHas('currencies', [
            'id' => $currency->id,
            'is_active' => false,
        ]);
    }
}
