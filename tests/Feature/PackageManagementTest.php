<?php

namespace Tests\Feature;

use App\Models\DepartureSchedule;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PackageManagementTest extends TestCase
{
    use RefreshDatabase;

    private function makePackage(array $overrides = []): TravelPackage
    {
        return TravelPackage::query()->create(array_merge([
            'code' => 'ASF-TEST-10',
            'slug' => 'umroh-test-10-hari',
            'name' => ['id' => 'Umroh Test', 'en' => 'Test Umrah'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 34900000,
            'currency' => 'IDR',
            'is_active' => true,
        ], $overrides));
    }

    public function test_it_shows_package_management_page(): void
    {
        $user = User::factory()->create();
        $this->makePackage();

        $this->actingAs($user)
            ->get(route('packages.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/ProductManagement/Packages/Index')
                ->has('packages', 1)
                ->has('productOptions')
                ->where('packages.0.code', 'ASF-TEST-10')
            );
    }

    public function test_it_shows_discount_percent_when_original_price_set(): void
    {
        $user = User::factory()->create();
        $this->makePackage(['price' => 30000000, 'original_price' => 40000000]);

        $this->actingAs($user)
            ->get(route('packages.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('packages.0.discount_percent', 25)
                ->where('packages.0.original_price', 40000000)
            );
    }

    public function test_it_stores_a_new_package(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'code' => 'ASF-NEW-10',
                'slug' => 'umroh-new-10',
                'name' => ['id' => 'Umroh Baru', 'en' => 'New Umrah'],
                'package_type' => 'reguler',
                'departure_city' => 'Surabaya',
                'duration_days' => 10,
                'price' => 35000000,
                'currency' => 'IDR',
                'is_featured' => false,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertTrue(TravelPackage::query()->where('code', 'ASF-NEW-10')->exists());
    }

    public function test_it_stores_package_with_discount_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'code' => 'ASF-PROMO-10',
                'slug' => 'umroh-promo-10',
                'name' => ['id' => 'Umroh Promo', 'en' => 'Promo Umrah'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 30000000,
                'original_price' => 40000000,
                'discount_label' => 'EARLY BIRD',
                'currency' => 'IDR',
                'is_active' => true,
            ])
            ->assertRedirect();

        $pkg = TravelPackage::query()->where('code', 'ASF-PROMO-10')->first();
        $this->assertNotNull($pkg);
        $this->assertEquals('40000000.00', $pkg->original_price);
        $this->assertEquals('EARLY BIRD', $pkg->discount_label);
        $this->assertEquals(25, $pkg->discountPercent());
    }

    public function test_it_rejects_original_price_less_than_price(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('packages.store'), [
                'code' => 'ASF-BAD-10',
                'slug' => 'umroh-bad-10',
                'name' => ['id' => 'Test'],
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 40000000,
                'original_price' => 30000000,
                'currency' => 'IDR',
                'is_active' => true,
            ])
            ->assertSessionHasErrors('original_price');
    }

    public function test_it_updates_a_package(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        $this->actingAs($user)
            ->post(route('packages.update', $pkg), [
                'code' => $pkg->code,
                'slug' => $pkg->slug,
                'name' => ['id' => 'Nama Diperbarui', 'en' => 'Updated Name'],
                'package_type' => 'vip',
                'departure_city' => 'Bandung',
                'duration_days' => 12,
                'price' => 45000000,
                'currency' => 'IDR',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertEquals('vip', $pkg->fresh()->package_type);
        $this->assertEquals('Bandung', $pkg->fresh()->departure_city);
    }

    public function test_it_syncs_products_when_updating_package(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();
        $product = TravelProduct::query()->create([
            'code' => 'PRD-VISA',
            'slug' => 'visa-umroh',
            'name' => ['id' => 'Visa', 'en' => 'Visa'],
            'product_type' => 'dokumen',
            'description' => ['id' => 'Visa', 'en' => 'Visa'],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('packages.update', $pkg), [
                'code' => $pkg->code,
                'slug' => $pkg->slug,
                'name' => $pkg->name,
                'package_type' => $pkg->package_type,
                'departure_city' => $pkg->departure_city,
                'duration_days' => $pkg->duration_days,
                'price' => $pkg->price,
                'currency' => $pkg->currency,
                'product_ids' => [$product->id],
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertEquals(1, $pkg->fresh()->products()->count());
    }

    public function test_it_deletes_a_package(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        $this->actingAs($user)
            ->delete(route('packages.destroy', $pkg))
            ->assertRedirect();

        $this->assertNull(TravelPackage::query()->find($pkg->id));
    }

    public function test_it_stores_a_schedule_for_a_package(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        $this->actingAs($user)
            ->post(route('packages.schedules.store', $pkg), [
                'departure_date' => '2026-08-01',
                'return_date' => '2026-08-10',
                'departure_city' => 'Jakarta',
                'seats_total' => 45,
                'seats_available' => 45,
                'status' => 'open',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertEquals(1, $pkg->schedules()->count());
    }

    public function test_it_rejects_schedule_with_seats_available_exceeding_total(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        $this->actingAs($user)
            ->post(route('packages.schedules.store', $pkg), [
                'departure_date' => '2026-08-01',
                'departure_city' => 'Jakarta',
                'seats_total' => 10,
                'seats_available' => 20,
                'status' => 'open',
                'is_active' => true,
            ])
            ->assertSessionHasErrors('seats_available');
    }

    public function test_it_prevents_updating_schedule_of_different_package(): void
    {
        $user = User::factory()->create();
        $pkg1 = $this->makePackage(['code' => 'PKG-1', 'slug' => 'pkg-1']);
        $pkg2 = $this->makePackage(['code' => 'PKG-2', 'slug' => 'pkg-2']);

        $schedule = DepartureSchedule::query()->create([
            'travel_package_id' => $pkg1->id,
            'departure_date' => '2026-08-01',
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 45,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->post(route('packages.schedules.update', [$pkg2, $schedule]), [
                'departure_date' => '2026-09-01',
                'departure_city' => 'Surabaya',
                'seats_total' => 30,
                'seats_available' => 30,
                'status' => 'open',
                'is_active' => true,
            ])
            ->assertForbidden();
    }

    public function test_it_deletes_a_schedule(): void
    {
        $user = User::factory()->create();
        $pkg = $this->makePackage();

        $schedule = DepartureSchedule::query()->create([
            'travel_package_id' => $pkg->id,
            'departure_date' => '2026-08-01',
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 45,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->delete(route('packages.schedules.destroy', [$pkg, $schedule]))
            ->assertRedirect();

        $this->assertNull(DepartureSchedule::query()->find($schedule->id));
    }

    public function test_it_requires_auth_for_package_routes(): void
    {
        $pkg = $this->makePackage();

        $this->get(route('packages.index'))->assertRedirect(route('login'));
        $this->post(route('packages.store'))->assertRedirect(route('login'));
        $this->post(route('packages.update', $pkg))->assertRedirect(route('login'));
        $this->delete(route('packages.destroy', $pkg))->assertRedirect(route('login'));
    }
}
