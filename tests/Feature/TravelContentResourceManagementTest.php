<?php

namespace Tests\Feature;

use App\Models\DepartureSchedule;
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
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Administrator/Content/Index')
                ->has('resources'),
            );
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
            'key' => 'layanan',
            'name' => ['id' => 'Layanan', 'en' => 'Services'],
            'description' => ['id' => 'Kategori layanan', 'en' => 'Service category'],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('product-categories.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Administrator/Content/Index')
                ->where('heading', 'Product Category')
                ->has('resources.0.items', 1)
                ->where('resources.0.items.0.payload.key', 'layanan'),
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
            'slug' => 'home',
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
                ->has('pages', 1),
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
