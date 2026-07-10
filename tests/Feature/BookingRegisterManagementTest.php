<?php

namespace Tests\Feature;

use App\Http\Middleware\CheckMenuPermission;
use App\Models\Booking;
use App\Models\DepartureSchedule;
use App\Models\InventoryItem;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BookingRegisterManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_shows_booking_register_page_with_registration_data(): void
    {
        $this->travelTo(Carbon::parse('2026-04-21 09:00:00'));

        $user = User::factory()->create();

        $package = TravelPackage::query()->create([
            'code' => 'ASF-HEMAT-09',
            'slug' => 'umroh-hemat-9-hari',
            'name' => ['id' => 'Umroh Hemat 9 Hari', 'en' => 'Economy Umrah 9 Days'],
            'package_type' => 'hemat',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 27900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-05-10',
            'return_date' => '2026-05-18',
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 12,
            'status' => 'open',
            'is_active' => true,
        ]);

        PackageRegistration::query()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'notes' => 'Mohon info kamar triple.',
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->get(route('booking.register.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/Register/Index')
                ->has('registrations.data', 1)
                ->where('registrations.data.0.booking_code', 'BK-260421-0001')
                ->where('registrations.data.0.full_name', 'Ahmad Fauzi')
                ->where('registrations.data.0.travel_package.code', 'ASF-HEMAT-09')
                ->where('registrations.data.0.travel_package.package_type', 'hemat')
                ->where('registrations.data.0.departure_schedule.departure_city', 'Jakarta')
                ->where('registrations.data.0.departure_schedule.return_date', '2026-05-18')
                ->where('registrations.data.0.status', 'pending')
            );

        $this->travelBack();
    }

    public function test_it_requires_auth_for_booking_register_page(): void
    {
        $this->get(route('booking.register.index'))
            ->assertRedirect(route('login'));
    }

    public function test_it_can_mark_pending_register_as_registered(): void
    {
        $this->travelTo(Carbon::parse('2026-04-21 09:00:00'));

        $user = User::factory()->create();
        $package = TravelPackage::query()->create([
            'code' => 'ASF-MARK-09',
            'slug' => 'umroh-mark-9-hari',
            'name' => ['id' => 'Umroh Mark 9 Hari', 'en' => 'Mark Umrah 9 Days'],
            'package_type' => 'hemat',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 27900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $registration = PackageRegistration::query()->create([
            'package_id' => $package->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 2,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->put(route('booking.register.mark-registered', $registration))
            ->assertRedirect(route('booking.register.index'));

        $this->assertDatabaseMissing('package_registrations', [
            'id' => $registration->id,
        ]);

        $this->assertDatabaseHas('bookings', [
            'booking_code' => sprintf('BK-260421-%04d', $registration->id),
            'package_id' => $package->id,
            'full_name' => 'Ahmad Fauzi',
            'status' => 'registered',
        ]);

        $this->travelBack();
    }

    public function test_it_includes_inventory_tracking_status_for_register_rows(): void
    {
        $user = User::factory()->create();

        $product = TravelProduct::query()->create([
            'code' => 'PRD-TRACK-001',
            'slug' => 'prd-track-001',
            'name' => 'Produk Tracking',
            'product_type' => 'perlengkapan',
            'description' => 'Desc',
            'content' => ['price' => 5000],
            'is_active' => true,
        ]);

        InventoryItem::query()->create([
            'item_code' => $product->code,
            'item_name' => (string) $product->name,
            'category' => (string) $product->product_type,
            'unit' => 'pcs',
            'product_id' => $product->id,
            'quantity' => 10,
            'is_active' => true,
        ]);

        $package = TravelPackage::factory()->create();
        $package->products()->sync([$product->id => ['sort_order' => 1]]);

        PackageRegistration::query()->create([
            'package_id' => $package->id,
            'full_name' => 'Tracking Stock',
            'phone' => '081200000021',
            'email' => 'tracking@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 2,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->get(route('booking.register.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('registrations.data.0.inventory.has_tracked_inventory', true)
                ->where('registrations.data.0.inventory.total_tracked_products', 1)
                ->where('registrations.data.0.inventory.insufficient_items', []));
    }

    public function test_it_flags_insufficient_inventory_for_register_rows(): void
    {
        $user = User::factory()->create();

        $product = TravelProduct::query()->create([
            'code' => 'PRD-TRACK-002',
            'slug' => 'prd-track-002',
            'name' => 'Produk Tracking Kurang',
            'product_type' => 'perlengkapan',
            'description' => 'Desc',
            'content' => ['price' => 5000],
            'is_active' => true,
        ]);

        InventoryItem::query()->create([
            'item_code' => $product->code,
            'item_name' => (string) $product->name,
            'category' => (string) $product->product_type,
            'unit' => 'pcs',
            'product_id' => $product->id,
            'quantity' => 0,
            'is_active' => true,
        ]);

        $package = TravelPackage::factory()->create();
        $package->products()->sync([$product->id => ['sort_order' => 1]]);

        PackageRegistration::query()->create([
            'package_id' => $package->id,
            'full_name' => 'Tracking Stock Kurang',
            'phone' => '081200000022',
            'email' => 'tracking-kurang@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 1,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->get(route('booking.register.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('registrations.data.0.inventory.has_tracked_inventory', true)
                ->where('registrations.data.0.inventory.insufficient_items.0.product_name', 'Produk Tracking Kurang')
                ->where('registrations.data.0.inventory.insufficient_items.0.available', 0)
                ->where('registrations.data.0.inventory.insufficient_items.0.required', 1));
    }

    public function test_it_can_delete_pending_register_entry(): void
    {
        $user = User::factory()->create();
        $package = TravelPackage::query()->create([
            'code' => 'ASF-DELETE-09',
            'slug' => 'umroh-delete-9-hari',
            'name' => ['id' => 'Umroh Delete 9 Hari', 'en' => 'Delete Umrah 9 Days'],
            'package_type' => 'hemat',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 27900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $registration = PackageRegistration::query()->create([
            'package_id' => $package->id,
            'full_name' => 'Siti Aminah',
            'phone' => '081234567891',
            'email' => 'siti@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 2,
            'status' => 'pending',
        ]);

        $this->actingAs($user)
            ->delete(route('booking.register.destroy', $registration))
            ->assertStatus(302);

        $this->assertDatabaseMissing('package_registrations', [
            'id' => $registration->id,
        ]);
    }

    public function test_it_shows_booking_listing_page_without_redirecting(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('booking.listing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/Listing/Index')
                ->has('registrations.data')
                ->has('packages')
                ->has('schedules')
                ->has('revenue.by_currency')
                ->where('filters.search', '')
                ->where('filters.status', 'registered')
            );
    }

    public function test_it_shows_all_active_packages_in_booking_listing_filter(): void
    {
        $user = User::factory()->create();

        $packageWithRegisteredBooking = TravelPackage::query()->create([
            'code' => 'ASF-FLTR-001',
            'slug' => 'filter-package-1',
            'name' => ['id' => 'Paket Filter 1', 'en' => 'Filter Package 1'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 1000000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $packageWithoutBooking = TravelPackage::query()->create([
            'code' => 'ASF-FLTR-002',
            'slug' => 'filter-package-2',
            'name' => ['id' => 'Paket Filter 2', 'en' => 'Filter Package 2'],
            'package_type' => 'reguler',
            'departure_city' => 'Surabaya',
            'duration_days' => 10,
            'price' => 1200000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $packageWithCancelledBooking = TravelPackage::query()->create([
            'code' => 'ASF-FLTR-003',
            'slug' => 'filter-package-3',
            'name' => ['id' => 'Paket Filter 3', 'en' => 'Filter Package 3'],
            'package_type' => 'reguler',
            'departure_city' => 'Medan',
            'duration_days' => 11,
            'price' => 1300000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        TravelPackage::query()->create([
            'code' => 'ASF-FLTR-004',
            'slug' => 'filter-package-4',
            'name' => ['id' => 'Paket Nonaktif', 'en' => 'Inactive Package'],
            'package_type' => 'reguler',
            'departure_city' => 'Bandung',
            'duration_days' => 12,
            'price' => 1400000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => false,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-FLTR-0001',
            'package_id' => $packageWithRegisteredBooking->id,
            'departure_schedule_id' => null,
            'full_name' => 'Booking Registered',
            'phone' => '081200000100',
            'email' => null,
            'origin_city' => 'Jakarta',
            'passenger_count' => 2,
            'notes' => null,
            'status' => 'registered',
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-FLTR-0002',
            'package_id' => $packageWithCancelledBooking->id,
            'departure_schedule_id' => null,
            'full_name' => 'Booking Cancelled',
            'phone' => '081200000101',
            'email' => null,
            'origin_city' => 'Medan',
            'passenger_count' => 1,
            'notes' => null,
            'status' => 'cancelled',
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.index', ['status' => 'registered']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('packages', 3)
                ->where('packages.0.id', $packageWithRegisteredBooking->id)
                ->where('packages.1.id', $packageWithoutBooking->id)
                ->where('packages.2.id', $packageWithCancelledBooking->id)
            );
    }

    public function test_it_calculates_estimated_revenue_from_registered_bookings(): void
    {
        $user = User::factory()->create();

        $package = TravelPackage::query()->create([
            'code' => 'ASF-REV-09',
            'slug' => 'umroh-revenue-9-hari',
            'name' => ['id' => 'Umroh Revenue 9 Hari', 'en' => 'Revenue Umrah 9 Days'],
            'package_type' => 'hemat',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 1000000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-REV-0001',
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'full_name' => 'Revenue Test',
            'phone' => '081200000000',
            'email' => null,
            'origin_city' => 'Jakarta',
            'passenger_count' => 3,
            'notes' => null,
            'status' => 'registered',
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('registrations.data', 1)
                ->has('revenue.by_currency', 1)
                ->where('revenue.by_currency.0.currency', 'IDR')
                ->where('revenue.by_currency.0.bookings', 1)
                ->where('revenue.by_currency.0.pax', 3)
                ->where('revenue.by_currency.0.amount', 3000000)
                ->where('registrations.data.0.revenue.currency', 'IDR')
                ->where('registrations.data.0.revenue.amount', 3000000)
            );
    }

    public function test_it_computes_available_schedule_seats_for_booking_listing_from_active_bookings(): void
    {
        $user = User::factory()->create();

        $package = TravelPackage::query()->create([
            'code' => 'ASF-REGULER-12',
            'slug' => 'umroh-reguler-12-hari',
            'name' => ['id' => 'Umroh Reguler 12 Hari', 'en' => 'Regular Umrah 12 Days'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 12,
            'price' => 32900000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-06-10',
            'return_date' => '2026-06-21',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        PackageRegistration::query()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081234567890',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Gresik',
            'passenger_count' => 6,
            'status' => 'pending',
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-SEAT-0001',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Siti Aminah',
            'phone' => '081234567891',
            'email' => 'siti@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 4,
            'notes' => null,
            'status' => 'registered',
        ]);

        PackageRegistration::query()->create([
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'full_name' => 'Budi Santoso',
            'phone' => '081234567892',
            'email' => 'budi@example.com',
            'origin_city' => 'Sidoarjo',
            'passenger_count' => 5,
            'status' => 'cancelled',
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('schedules.0.seats_total', 40)
                ->where('schedules.0.seats_available', 36)
            );
    }

    public function test_it_deducts_inventory_stock_when_registered_booking_is_created(): void
    {
        $this->withoutMiddleware(CheckMenuPermission::class);
        $user = User::factory()->create();

        $product = TravelProduct::query()->create([
            'code' => 'PRD-STOCK-001',
            'slug' => 'prd-stock-001',
            'name' => 'Produk Stok',
            'product_type' => 'layanan',
            'description' => 'Desc',
            'content' => ['unit' => 'pcs', 'price' => 5000],
            'is_active' => true,
        ]);

        $inventory = InventoryItem::query()->create([
            'item_code' => $product->code,
            'item_name' => (string) $product->name,
            'category' => (string) $product->product_type,
            'unit' => 'pcs',
            'product_id' => $product->id,
            'quantity' => 20,
            'is_active' => true,
        ]);

        $package = TravelPackage::factory()->create();
        $package->products()->sync([$product->id => ['sort_order' => 1]]);

        $this->actingAs($user)->post(route('booking.listing.store'), [
            'travel_package_id' => $package->id,
            'departure_schedule_id' => null,
            'full_name' => 'Jamaah A',
            'phone' => '081200000001',
            'email' => 'jamaah@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 3,
            'notes' => null,
            'status' => 'registered',
        ])->assertRedirect(route('booking.listing.index'));

        $this->assertDatabaseHas('inventory_items', [
            'id' => $inventory->id,
            'quantity' => 17,
        ]);
    }

    public function test_it_restores_inventory_stock_when_booking_is_cancelled(): void
    {
        $this->withoutMiddleware(CheckMenuPermission::class);
        $user = User::factory()->create();

        $product = TravelProduct::query()->create([
            'code' => 'PRD-STOCK-002',
            'slug' => 'prd-stock-002',
            'name' => 'Produk Stok Cancel',
            'product_type' => 'perlengkapan',
            'description' => 'Desc',
            'content' => ['unit' => 'pcs', 'price' => 7000],
            'is_active' => true,
        ]);

        $inventory = InventoryItem::query()->create([
            'item_code' => $product->code,
            'item_name' => (string) $product->name,
            'category' => (string) $product->product_type,
            'unit' => 'pcs',
            'product_id' => $product->id,
            'quantity' => 20,
            'is_active' => true,
        ]);

        $package = TravelPackage::factory()->create();
        $package->products()->sync([$product->id => ['sort_order' => 1]]);

        $this->actingAs($user)->post(route('booking.listing.store'), [
            'travel_package_id' => $package->id,
            'departure_schedule_id' => null,
            'full_name' => 'Jamaah Cancel',
            'phone' => '081200000003',
            'email' => 'jamaah-cancel@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 4,
            'notes' => null,
            'status' => 'registered',
        ])->assertRedirect(route('booking.listing.index'));

        $this->assertDatabaseHas('inventory_items', [
            'id' => $inventory->id,
            'quantity' => 16,
        ]);

        $booking = Booking::query()->latest('id')->firstOrFail();

        $this->actingAs($user)->put(route('booking.listing.update', $booking), [
            'travel_package_id' => $package->id,
            'departure_schedule_id' => null,
            'full_name' => 'Jamaah Cancel',
            'phone' => '081200000003',
            'email' => 'jamaah-cancel@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 4,
            'notes' => null,
            'status' => 'cancelled',
        ])->assertRedirect(route('booking.listing.index'));

        $this->assertDatabaseHas('inventory_items', [
            'id' => $inventory->id,
            'quantity' => 20,
        ]);
    }

    public function test_it_uses_room_configuration_prices_for_regular_booking_revenue(): void
    {
        $this->withoutMiddleware(CheckMenuPermission::class);

        $user = User::factory()->create();

        $package = TravelPackage::query()->create([
            'code' => 'ASF-ROOM-PRICE',
            'slug' => 'umroh-room-price',
            'name' => ['id' => 'Umroh Room Price', 'en' => 'Umroh Room Price'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 9,
            'price' => 30000000,
            'currency' => 'IDR',
            'content' => [
                'room_prices' => [
                    'dbl' => 28000000,
                    'trpl' => 26000000,
                    'quad' => 24000000,
                ],
            ],
            'is_active' => true,
        ]);

        Booking::query()->create([
            'booking_code' => 'BK-ROOM-0001',
            'package_id' => $package->id,
            'departure_schedule_id' => null,
            'full_name' => 'Jamaah Double',
            'phone' => '081200000090',
            'email' => 'double@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 3,
            'room_configuration' => [
                'single' => 1,
                'double' => 1,
                'triple' => 0,
                'quad' => 0,
            ],
            'notes' => null,
            'status' => 'registered',
        ]);

        $this->actingAs($user)
            ->get(route('booking.listing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('revenue.by_currency.0.amount', 86000000)
                ->where('registrations.data.0.revenue.amount', 86000000)
                ->where('registrations.data.0.room_summary', '1 single + 1 double')
            );
    }
}
