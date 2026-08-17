<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\Menu;
use App\Models\TravelProduct;
use App\Models\User;
use App\Support\MenuPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductManagementNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_management_renders_from_its_own_dashboard_menu_route(): void
    {
        $user = User::factory()->create();

        $country = HotelCountry::query()->create([
            'name' => 'Arab Saudi',
            'is_active' => true,
        ]);

        $city = HotelCity::query()->create([
            'country_id' => $country->id,
            'name' => 'Madinah',
            'is_active' => true,
        ]);

        Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'Hotel Aktif',
            'code' => 'HTL-AKTIF',
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        Hotel::query()->create([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => 'Hotel Nonaktif',
            'code' => 'HTL-NONAKTIF',
            'currency' => 'IDR',
            'is_active' => false,
        ]);

        $this->actingAs($user)
            ->get(route('products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Products/Index')
                ->where('filters.product_type', 'hotel')
                ->has('product_category_hotel.hotels.data', 1)
                ->where('product_category_hotel.hotels.data.0.name', 'Hotel Aktif')
                ->has('product_category_hotel.cityOptions')
                ->has('hotel_country_options')
                ->has('hotel_city_options')
                ->has('hotel_room_type_options')
                ->has('hotel_currency_options')
            );
    }

    public function test_product_management_uses_badge_filter_query_parameters(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('products.index', ['product_type' => 'layanan']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.product_type', 'layanan')
            );
    }

    public function test_product_management_currency_options_come_from_live_currency_data(): void
    {
        $user = User::factory()->create();
        config()->set('services.currency.live.enabled', true);
        Cache::flush();
        Http::fake(['*' => Http::response([
            'result' => 'success',
            'rates' => ['IDR' => 1, 'USD' => 0.0000625, 'SAR' => 0.0002],
        ])]);

        $this->actingAs($user)
            ->get(route('products.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('hotel_currency_options')
                ->where('hotel_currency_options.0.code', 'IDR')
                ->where('hotel_currency_options.2.code', 'USD')
                ->where('hotel_currency_options.2.conversion_rate', 16000)
            );
    }

    public function test_product_currency_rate_is_saved_as_an_editable_snapshot(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('content.resources.store', ['resource' => 'products']), [
                'payload' => [
                    'code' => 'PRD-SAR-MANUAL',
                    'slug' => 'prd-sar-manual',
                    'name' => 'Product SAR Manual',
                    'product_type' => 'layanan',
                    'description' => '',
                    'content' => [
                        'price' => 100,
                        'currency' => 'SAR',
                        'currency_rate_to_idr' => 5000,
                    ],
                    'is_active' => true,
                ],
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $product = TravelProduct::query()->where('code', 'PRD-SAR-MANUAL')->firstOrFail();

        $this->assertSame(5000, data_get($product->content, 'currency_rate_snapshot.rate_to_idr'));
        $this->assertSame('manual', data_get($product->content, 'currency_rate_snapshot.source'));
    }

    public function test_product_category_renders_from_its_own_dashboard_menu_route(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('product-categories.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Categories/Index')
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

        MenuPermissionService::ensurePermissionsExist();

        $user->givePermissionTo([
            'menu.landing_page.view',
            'menu.product_category.view',
            'menu.product.view',
            'menu.package.view',
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
