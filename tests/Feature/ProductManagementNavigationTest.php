<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\User;
use App\Models\UserAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductManagementNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_management_renders_from_its_own_dashboard_menu_route(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Administrator/Content/Index')
                ->where('heading', 'Product Management')
                ->where('breadcrumbHref', '/admin/product-management/products')
            );
    }

    public function test_product_category_renders_from_its_own_dashboard_menu_route(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('product-categories.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Administrator/Content/Index')
                ->where('heading', 'Product Category')
                ->where('breadcrumbHref', '/admin/product-management/categories')
            );
    }

    public function test_legacy_product_management_urls_redirect_to_the_new_top_level_route(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/dashboard/website-management/products')
            ->assertRedirect('/admin/product-management/products');

        $this->actingAs($user)
            ->get('/dashboard/website-management/packages')
            ->assertRedirect('/admin/product-management/packages');
    }

    public function test_dashboard_named_route_now_points_to_admin_prefix(): void
    {
        $this->assertSame('/admin', route('dashboard', absolute: false));
        $this->assertSame('/admin/product-management/products', route('products.index', absolute: false));
    }

    public function test_sidebar_api_hoists_legacy_product_management_out_of_website_management(): void
    {
        $user = User::factory()->create();

        Menu::query()->create([
            'name' => 'Website Management',
            'menu_key' => 'website_management',
            'path' => '/admin/website-management',
            'icon' => 'Globe',
            'children' => [
                [
                    'name' => 'Landing Page',
                    'menu_key' => 'landing_page',
                    'path' => '/admin/website-management/landing',
                    'icon' => 'FileText',
                    'order' => 1,
                    'is_active' => true,
                    'children' => null,
                ],
                [
                    'name' => 'Product Management',
                    'menu_key' => 'product_management',
                    'path' => '/admin/website-management/products',
                    'icon' => 'Package',
                    'order' => 2,
                    'is_active' => true,
                    'children' => [
                        [
                            'name' => 'Product Category',
                            'menu_key' => 'product_category',
                            'path' => '/admin/product-management/categories',
                            'icon' => 'Tags',
                            'order' => 1,
                            'is_active' => true,
                            'children' => null,
                        ],
                        [
                            'name' => 'Product',
                            'menu_key' => 'product',
                            'path' => '/admin/website-management/products',
                            'icon' => 'Package',
                            'order' => 2,
                            'is_active' => true,
                            'children' => null,
                        ],
                        [
                            'name' => 'Package',
                            'menu_key' => 'package',
                            'path' => '/admin/website-management/packages',
                            'icon' => 'Boxes',
                            'order' => 3,
                            'is_active' => true,
                            'children' => null,
                        ],
                    ],
                ],
            ],
            'order' => 2,
            'is_active' => true,
        ]);

        Menu::query()->create([
            'name' => 'Administrator',
            'menu_key' => 'administrator',
            'path' => '/admin/administrator',
            'icon' => 'Settings',
            'children' => null,
            'order' => 3,
            'is_active' => true,
        ]);

        UserAccess::query()->create([
            'user_id' => $user->id,
            'access' => [
                'landing_page' => ['view'],
                'product_category' => ['view'],
                'product' => ['view'],
                'package' => ['view'],
            ],
        ]);

        $menus = $this->actingAs($user)
            ->getJson(route('user.menus'))
            ->assertOk()
            ->json();

        $this->assertCount(2, $menus);
        $this->assertSame('website_management', $menus[0]['menu_key']);
        $this->assertNotContains('product_management', collect($menus[0]['children'])->pluck('menu_key')->all());
        $this->assertSame('product_management', $menus[1]['menu_key']);
        $this->assertSame('/admin/product-management/products', $menus[1]['path']);
        $this->assertSame([
            '/admin/product-management/categories',
            '/admin/product-management/products',
            '/admin/product-management/packages',
        ], collect($menus[1]['children'])->pluck('path')->all());
    }
}
