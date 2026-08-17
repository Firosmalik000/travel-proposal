<?php

namespace Tests\Feature;

use App\Models\PageContent;
use App\Models\ProductCategory;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\TravelService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TravelContentResourceManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_shows_content_management_with_resource_sections(): void
    {
        $user = User::factory()->create();

        TravelService::query()->create([
            'title' => ['id' => 'Layanan', 'en' => 'Service'],
            'description' => ['id' => 'Deskripsi', 'en' => 'Description'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('content.index'))
            ->assertRedirect(route('website.index'));
    }

    public function test_it_shows_package_resource_with_product_options(): void
    {
        $user = User::factory()->create();

        ProductCategory::query()->create([
            'key' => 'dokumen',
            'name' => ['id' => 'Dokumen', 'en' => 'Documents'],
            'description' => ['id' => 'Kategori dokumen', 'en' => 'Document category'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        TravelProduct::query()->create([
            'code' => 'PRD-VISA',
            'slug' => 'visa-umroh',
            'name' => ['id' => 'Visa Umroh', 'en' => 'Umrah Visa'],
            'product_type' => 'dokumen',
            'description' => ['id' => 'Pengurusan visa', 'en' => 'Visa processing'],
            'content' => ['unit' => 'per jamaah'],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('packages.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Packages/Index')
                ->has('packages')
                ->has('productOptions', 1)
                ->where('productOptions.0.code', 'PRD-VISA'),
            );
    }

    public function test_it_shows_product_category_management(): void
    {
        $user = User::factory()->create();

        ProductCategory::query()->create([
            'key' => 'tiket',
            'name' => ['id' => 'Tiket', 'en' => 'Ticket'],
            'description' => ['id' => 'Kategori tiket', 'en' => 'Ticket category'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('product-categories.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Categories/Index')
                ->has('categories.data')
                ->where('categories.data.0.key', 'tiket'),
            );
    }

    public function test_it_shows_schedule_management_with_package_options(): void
    {
        $user = User::factory()->create();

        TravelPackage::query()->create([
            'code' => 'ASF-REG-10',
            'slug' => 'umroh-reguler-10-hari',
            'name' => ['id' => 'Umroh Reguler 10 Hari', 'en' => 'Regular Umrah 10 Days'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 34900000,
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        // schedules.index redirects to packages.index
        $this->actingAs($user)
            ->get(route('schedules.index'))
            ->assertRedirect(route('packages.index'));
    }

    public function test_it_shows_landing_page_editor(): void
    {
        $user = User::factory()->create();

        PageContent::query()->create([
            'slug' => 'home_landing_mockup',
            'category' => 'page',
            'title' => ['id' => 'Beranda', 'en' => 'Home'],
            'excerpt' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => ['hero' => ['title' => ['id' => 'Hero', 'en' => 'Hero']]],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('landing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/WebsiteManagement/Landing/Index')
                ->has('pages', 1)
                ->where('pages.0.slug', 'home_landing_mockup'),
            );
    }

    public function test_it_can_store_a_travel_resource_from_content_management(): void
    {
        $user = User::factory()->create();

        $payload = [
            'title' => ['id' => 'Layanan Baru', 'en' => 'New Service'],
            'description' => ['id' => 'Deskripsi layanan', 'en' => 'Service description'],
            'sort_order' => 2,
            'is_active' => true,
        ];

        $this->actingAs($user)
            ->post(route('content.resources.store', ['resource' => 'services']), [
                'payload_json' => json_encode($payload, JSON_THROW_ON_ERROR),
            ])
            ->assertRedirect();

        $this->assertTrue(TravelService::query()->where('sort_order', 2)->exists());
    }

    public function test_it_can_store_a_product_category_from_content_management(): void
    {
        $user = User::factory()->create();

        $payload = [
            'key' => 'administrasi',
            'name' => ['id' => 'Administrasi', 'en' => 'Administration'],
            'description' => ['id' => 'Kategori administrasi', 'en' => 'Administration category'],
            'sort_order' => 4,
            'is_active' => true,
        ];

        $this->actingAs($user)
            ->post(route('content.resources.store', ['resource' => 'product_categories']), [
                'payload_json' => json_encode($payload, JSON_THROW_ON_ERROR),
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('product_categories', [
            'key' => 'administrasi',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    public function test_it_can_store_a_product_from_content_management(): void
    {
        $user = User::factory()->create();

        ProductCategory::query()->create([
            'key' => 'layanan',
            'name' => ['id' => 'Layanan', 'en' => 'Services'],
            'description' => ['id' => 'Kategori layanan', 'en' => 'Service category'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $payload = [
            'code' => 'PRD-HOTEL',
            'slug' => 'hotel-madinah',
            'name' => ['id' => 'Hotel Madinah', 'en' => 'Madinah Hotel'],
            'product_type' => 'layanan',
            'description' => ['id' => 'Hotel dekat masjid', 'en' => 'Hotel near the mosque'],
            'content' => ['unit' => ['id' => 'per kamar', 'en' => 'per room']],
            'is_active' => true,
        ];

        $this->actingAs($user)
            ->post(route('content.resources.store', ['resource' => 'products']), [
                'payload_json' => json_encode($payload, JSON_THROW_ON_ERROR),
            ])
            ->assertRedirect();

        $product = TravelProduct::query()->where('code', 'PRD-HOTEL')->first();

        $this->assertNotNull($product);
        $this->assertSame('PRD-HOTEL', $product->code);
    }

    public function test_it_can_bulk_delete_products_from_content_management(): void
    {
        $user = User::factory()->create();

        $firstProduct = TravelProduct::query()->create([
            'code' => 'PRD-ONE',
            'slug' => 'product-one',
            'name' => ['id' => 'Product One', 'en' => 'Product One'],
            'product_type' => 'layanan',
            'description' => ['id' => 'Produk pertama', 'en' => 'First product'],
            'content' => ['unit' => 'per item'],
            'is_active' => true,
        ]);

        $secondProduct = TravelProduct::query()->create([
            'code' => 'PRD-TWO',
            'slug' => 'product-two',
            'name' => ['id' => 'Product Two', 'en' => 'Product Two'],
            'product_type' => 'layanan',
            'description' => ['id' => 'Produk kedua', 'en' => 'Second product'],
            'content' => ['unit' => 'per item'],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('content.resources.bulk-destroy', ['resource' => 'products']), [
                'ids' => [$firstProduct->id, $secondProduct->id],
            ])
            ->assertRedirect();

        $this->assertDatabaseMissing('products', ['id' => $firstProduct->id]);
        $this->assertDatabaseMissing('products', ['id' => $secondProduct->id]);
    }

    public function test_it_can_store_a_package_with_uploaded_image(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $payload = [
            'code' => 'ASF-IMG-10',
            'slug' => 'umroh-dengan-foto-10-hari',
            'name' => ['id' => 'Umroh Dengan Foto', 'en' => 'Umrah With Photo'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 35900000,
            'currency' => 'IDR',
            'image_path' => '',
            'summary' => ['id' => 'Ringkasan package', 'en' => 'Package summary'],
            'content' => [],
            'product_codes' => [],
            'is_featured' => true,
            'is_active' => true,
        ];

        $this->actingAs($user)
            ->post(route('content.resources.store', ['resource' => 'packages']), [
                'payload_json' => json_encode($payload, JSON_THROW_ON_ERROR),
                'image' => UploadedFile::fake()->image('package-cover.jpg'),
            ])
            ->assertRedirect();

        $package = TravelPackage::query()->where('code', 'ASF-IMG-10')->first();

        $this->assertNotNull($package);
        $this->assertStringStartsWith('/storage/packages/', $package->image_path);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $package->image_path));
    }

    public function test_it_shows_package_detail_using_slug_route(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'ASF-TEST-10',
            'slug' => 'asf-test-10',
            'name' => ['id' => 'Package Test', 'en' => 'Test Package'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 35000000,
            'currency' => 'IDR',
            'image_path' => '/images/dummy.jpg',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_featured' => false,
            'is_active' => true,
        ]);

        $this->get(route('public.paket-detail', $package))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/paket/detail/index')
                ->where('travelPackage.slug', 'asf-test-10'),
            );
    }
}
