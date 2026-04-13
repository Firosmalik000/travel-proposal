<?php

namespace Tests\Feature;

use App\Models\DepartureSchedule;
use App\Models\PageContent;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\TravelService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
                ->where('heading', 'Content Management')
                ->has('pages', 0)
                ->has('resources'),
            );
    }

    public function test_it_shows_package_resource_with_product_options(): void
    {
        $user = User::factory()->create();

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
                ->component('Dashboard/Administrator/Content/Index')
                ->where('heading', 'Package Management')
                ->has('resources.0.meta.product_options', 1)
                ->where('resources.0.meta.product_options.0.code', 'PRD-VISA'),
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

        DepartureSchedule::query()->create([
            'travel_package_id' => TravelPackage::query()->where('code', 'ASF-REG-10')->value('id'),
            'departure_date' => '2026-08-01',
            'return_date' => '2026-08-10',
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 12,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('schedules.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Administrator/Content/Index')
                ->where('heading', 'Schedule Management')
                ->has('resources.0.meta.package_options', 1)
                ->where('resources.0.meta.package_options.0.code', 'ASF-REG-10'),
            );
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
