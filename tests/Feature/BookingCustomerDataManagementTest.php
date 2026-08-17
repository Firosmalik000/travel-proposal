<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\DepartureSchedule;
use App\Models\Menu;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class BookingCustomerDataManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_booking_customer_data_page(): void
    {
        $this->get(route('booking.customer-data.index'))
            ->assertRedirect(route('login'));
    }

    public function test_guest_is_redirected_from_booking_customer_data_detail_page(): void
    {
        $package = TravelPackage::factory()->create();

        $this->get(route('booking.customer-data.show', $package))
            ->assertRedirect(route('login'));
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $this->seedBookingManagementMenu();

        $this->actingAs(User::factory()->create())
            ->get(route('booking.customer-data.index'))
            ->assertForbidden();
    }

    public function test_user_without_permission_cannot_open_detail_page(): void
    {
        $this->seedBookingManagementMenu();
        $package = TravelPackage::factory()->create();

        $this->actingAs(User::factory()->create())
            ->get(route('booking.customer-data.show', $package))
            ->assertNotFound();
    }

    public function test_invalid_filters_are_rejected(): void
    {
        $this->seedBookingManagementMenu();

        $permission = Permission::findOrCreate('menu.booking_customer_data.view', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo($permission);

        $this->actingAs($user)
            ->from(route('booking.customer-data.index'))
            ->get(route('booking.customer-data.index', [
                'status' => 'cancelled',
            ]))
            ->assertRedirect(route('booking.customer-data.index'))
            ->assertSessionHasErrors(['status']);
    }

    public function test_it_groups_bookings_by_package_schedule_and_participant_slots(): void
    {
        $this->seedBookingManagementMenu();

        $permission = Permission::findOrCreate('menu.booking_customer_data.view', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo($permission);

        $packageA = TravelPackage::factory()->create([
            'code' => 'PKG-A',
            'name' => [
                'id' => 'Package A',
                'en' => 'Package A',
            ],
        ]);
        $scheduleA1 = DepartureSchedule::query()->create([
            'package_id' => $packageA->id,
            'departure_date' => '2026-07-10',
            'return_date' => '2026-07-20',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);
        $scheduleA2 = DepartureSchedule::query()->create([
            'package_id' => $packageA->id,
            'departure_date' => '2026-08-10',
            'return_date' => '2026-08-20',
            'departure_city' => 'Madinah',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        $packageB = TravelPackage::factory()->create([
            'code' => 'PKG-B',
            'name' => [
                'id' => 'Package B',
                'en' => 'Package B',
            ],
        ]);
        $scheduleB = DepartureSchedule::query()->create([
            'package_id' => $packageB->id,
            'departure_date' => '2026-09-10',
            'return_date' => '2026-09-20',
            'departure_city' => 'Jeddah',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        $bookingA1 = Booking::query()->create([
            'booking_code' => 'BK-A-001',
            'package_id' => $packageA->id,
            'departure_schedule_id' => $scheduleA1->id,
            'booking_type' => 'regular',
            'full_name' => 'Ahmad Fauzi',
            'phone' => '081200000001',
            'email' => 'ahmad@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 10,
            'status' => 'registered',
        ]);
        BookingParticipant::query()->create([
            'booking_id' => $bookingA1->id,
            'full_name' => 'Ahmad Fauzi',
            'gender' => 'male',
            'passport_ready' => true,
            'shirt_size' => 'L',
        ]);
        BookingParticipant::query()->create([
            'booking_id' => $bookingA1->id,
            'full_name' => 'Siti Aminah',
            'gender' => 'female',
            'passport_ready' => true,
            'shirt_size' => 'M',
        ]);

        $bookingA2 = Booking::query()->create([
            'booking_code' => 'BK-A-002',
            'package_id' => $packageA->id,
            'departure_schedule_id' => $scheduleA2->id,
            'booking_type' => 'regular',
            'full_name' => 'Budi Santoso',
            'phone' => '081200000002',
            'email' => 'budi@example.com',
            'origin_city' => 'Bandung',
            'passenger_count' => 3,
            'status' => 'registered',
        ]);
        BookingParticipant::query()->create([
            'booking_id' => $bookingA2->id,
            'full_name' => 'Budi Santoso',
            'gender' => 'male',
            'passport_ready' => true,
            'shirt_size' => 'L',
        ]);

        $bookingB = Booking::query()->create([
            'booking_code' => 'BK-B-001',
            'package_id' => $packageB->id,
            'departure_schedule_id' => $scheduleB->id,
            'booking_type' => 'regular',
            'full_name' => 'Chandra',
            'phone' => '081200000003',
            'email' => 'chandra@example.com',
            'origin_city' => 'Surabaya',
            'passenger_count' => 1,
            'status' => 'pending',
        ]);
        BookingParticipant::query()->create([
            'booking_id' => $bookingB->id,
            'full_name' => 'Chandra',
            'gender' => 'male',
            'passport_ready' => false,
            'shirt_size' => 'XL',
        ]);

        $this->actingAs($user)
            ->get(route('booking.customer-data.index', ['status' => 'all']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/CustomerData/Index')
                ->where('filters.status', 'all')
                ->where('summary.packages', 2)
                ->where('summary.bookings', 3)
                ->where('summary.customers', 14)
                ->where('summary.participants', 4)
                ->where('selectedPackageId', null)
                ->where('selectedPackage', null)
                ->has('packages', 2)
                ->where('packages.0.code', 'PKG-A')
                ->where('packages.0.booking_count', 2)
                ->where('packages.1.code', 'PKG-B')
            );

        $this->actingAs($user)
            ->get(route('booking.customer-data.show', [
                'travelPackage' => $packageA,
                'status' => 'all',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/CustomerData/Show')
                ->where('selectedPackage.id', $packageA->id)
                ->where('selectedPackage.code', 'PKG-A')
                ->has('selectedPackage.schedules', 2)
                ->where('selectedPackage.schedules.0.departure_date', '2026-07-10')
                ->where('selectedPackage.schedules.0.booking_count', 1)
                ->where('selectedPackage.schedules.0.bookings.0.booking_code', 'BK-A-001')
                ->where('selectedPackage.schedules.0.bookings.0.participants_count', 2)
                ->has('selectedPackage.schedules.0.bookings.0.slots', 10)
                ->where('selectedPackage.schedules.0.bookings.0.slots.0.is_filled', true)
                ->where('selectedPackage.schedules.0.bookings.0.slots.1.is_filled', true)
                ->where('selectedPackage.schedules.0.bookings.0.slots.2.is_filled', false)
                ->where('selectedPackage.schedules.1.departure_date', '2026-08-10')
                ->where('selectedPackage.schedules.1.bookings.0.booking_code', 'BK-A-002'));
    }

    public function test_registered_filter_is_used_by_default_and_search_stays_synchronized(): void
    {
        $this->seedBookingManagementMenu();

        $permission = Permission::findOrCreate('menu.booking_customer_data.view', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo($permission);

        $package = TravelPackage::factory()->create([
            'code' => 'SYNC-001',
            'name' => ['id' => 'Paket Sinkron', 'en' => 'Synchronized Package'],
        ]);
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-10-10',
            'return_date' => '2026-10-20',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        foreach (['registered', 'pending'] as $status) {
            Booking::query()->create([
                'booking_code' => 'SYNC-'.strtoupper($status),
                'package_id' => $package->id,
                'departure_schedule_id' => $schedule->id,
                'booking_type' => 'regular',
                'full_name' => 'Customer '.$status,
                'phone' => '081200000009',
                'origin_city' => 'Jakarta',
                'passenger_count' => 2,
                'status' => $status,
            ]);
        }

        $this->actingAs($user)
            ->get(route('booking.customer-data.index', ['search' => 'SYNC']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'SYNC')
                ->where('filters.status', 'registered')
                ->where('summary.bookings', 1)
                ->where('packages.0.code', 'SYNC-001')
                ->where('packages.0.booking_count', 1)
                ->has('packages.0.schedules.0.bookings', 0));
    }

    public function test_travel_package_filter_accepts_existing_package_ids(): void
    {
        $this->seedBookingManagementMenu();

        $permission = Permission::findOrCreate('menu.booking_customer_data.view', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo($permission);

        $package = TravelPackage::factory()->create([
            'code' => 'PKG-FILTER',
            'name' => [
                'id' => 'Paket Filter',
                'en' => 'Filter Package',
            ],
        ]);
        $schedule = DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => '2026-11-10',
            'return_date' => '2026-11-20',
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 40,
            'status' => 'open',
            'is_active' => true,
        ]);

        Booking::query()->create([
            'booking_code' => 'FILTER-001',
            'package_id' => $package->id,
            'departure_schedule_id' => $schedule->id,
            'booking_type' => 'regular',
            'full_name' => 'Filter Customer',
            'phone' => '081200000010',
            'origin_city' => 'Jakarta',
            'passenger_count' => 2,
            'status' => 'registered',
        ]);

        $this->actingAs($user)
            ->get(route('booking.customer-data.index', [
                'travel_package_id' => $package->id,
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.travel_package_id', $package->id)
                ->where('selectedPackageId', $package->id)
                ->where('selectedPackage.code', 'PKG-FILTER')
                ->where('summary.bookings', 1));
    }

    private function seedBookingManagementMenu(): void
    {
        Menu::query()->updateOrCreate(
            ['menu_key' => 'booking_management'],
            [
                'name' => 'Booking',
                'path' => '/dashboard/booking-management',
                'icon' => 'BookOpen',
                'children' => [
                    [
                        'name' => 'Register',
                        'menu_key' => 'booking_register',
                        'path' => '/dashboard/booking-management/register',
                        'icon' => 'ClipboardList',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Listing',
                        'menu_key' => 'booking_listing',
                        'path' => '/dashboard/booking-management/listing',
                        'icon' => 'Users',
                        'order' => 2,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Data Customer',
                        'menu_key' => 'booking_customer_data',
                        'path' => '/dashboard/booking-management/customer-data',
                        'icon' => 'Users',
                        'order' => 3,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Custom Requests',
                        'menu_key' => 'booking_custom_requests',
                        'path' => '/dashboard/booking-management/custom-requests',
                        'icon' => 'MessageSquare',
                        'order' => 4,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Hotel Assignment',
                        'menu_key' => 'booking_hotel_assignment',
                        'path' => '/dashboard/booking-management/hotel-assignment',
                        'icon' => 'Building2',
                        'order' => 5,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 4,
                'is_active' => true,
            ],
        );
    }
}
