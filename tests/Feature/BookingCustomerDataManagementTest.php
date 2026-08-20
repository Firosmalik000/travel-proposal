<?php

namespace Tests\Feature;

use App\Mail\ParticipantDataReminder;
use App\Models\Booking;
use App\Models\BookingParticipant;
use App\Models\DepartureSchedule;
use App\Models\Menu;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
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
        $booking = Booking::factory()->create();

        $this->get(route('booking.customer-data.show', $booking))
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
        $booking = Booking::factory()->create();

        $this->actingAs(User::factory()->create())
            ->get(route('booking.customer-data.show', $booking))
            ->assertForbidden();
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
        $completeParticipant = BookingParticipant::query()->create([
            'booking_id' => $bookingA1->id,
            'full_name' => 'Ahmad Fauzi',
            'gender' => 'male',
            'birth_place' => 'Jakarta',
            'birth_date' => '1988-01-01',
            'marital_status' => 'married',
            'address' => 'Jakarta',
            'passport_ready' => true,
            'passport_issue_date' => '2025-01-01',
            'passport_expiry_date' => '2030-01-01',
            'passport_type' => 'ordinary',
            'shirt_size' => 'L',
            'passport_scan_path' => 'participants/passport.pdf',
            'family_card_scan_path' => 'participants/family-card.pdf',
            'marriage_book_scan_path' => 'participants/marriage-book.pdf',
            'birth_certificate_scan_path' => 'participants/birth-certificate.pdf',
            'photo_path' => 'participants/photo.jpg',
            'meningitis_vaccine_scan_path' => 'participants/vaccine.pdf',
            'emergency_contact_name' => 'Siti',
            'emergency_contact_phone' => '08123456789',
            'emergency_contact_relationship' => 'Istri',
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
                ->where('packages.0.incomplete_booking_count', 2)
                ->has('packages.0.bookings', 2)
                ->where('packages.0.bookings.0.booking_code', 'BK-A-001')
                ->where('packages.1.code', 'PKG-B')
            );

        $this->actingAs($user)
            ->get(route('booking.customer-data.show', [
                'booking' => $bookingA1,
                'status' => 'all',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Booking/CustomerData/Show')
                ->where('booking.id', $bookingA1->id)
                ->where('booking.booking_code', 'BK-A-001')
                ->where('booking.package.code', 'PKG-A')
                ->where('booking.participants_count', 2)
                ->has('booking.slots', 10)
                ->where('booking.slots.0.is_filled', true)
                ->where('booking.slots.0.participant.is_complete', true)
                ->where('booking.slots.0.participant.documents_count', 6)
                ->where(
                    'booking.slots.0.participant.documents.0.url',
                    route('booking.customer-data.documents.show', [
                        'booking' => $bookingA1,
                        'participant' => $completeParticipant,
                        'document' => 'passport_scan',
                    ]),
                )
                ->where('booking.slots.1.is_filled', true)
                ->where('booking.slots.1.participant.is_complete', false)
                ->where('booking.slots.2.is_filled', false));
    }

    public function test_authorized_user_can_view_an_existing_participant_document(): void
    {
        Storage::fake('local');
        $this->seedBookingManagementMenu();

        $permission = Permission::findOrCreate('menu.booking_customer_data.view', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo($permission);
        $booking = Booking::factory()->create();
        $path = "booking-participants/{$booking->id}/passport.pdf";
        Storage::disk('local')->put($path, '%PDF-1.4 test document');

        $participant = BookingParticipant::query()->create([
            'booking_id' => $booking->id,
            'full_name' => 'Peserta Dokumen',
            'passport_scan_path' => $path,
        ]);
        $documentUrl = route('booking.customer-data.documents.show', [
            'booking' => $booking,
            'participant' => $participant,
            'document' => 'passport_scan',
        ]);

        $this->get($documentUrl)->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create())
            ->get($documentUrl)
            ->assertForbidden();

        $this->actingAs($user)
            ->get($documentUrl)
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->actingAs($user)
            ->get(route('booking.customer-data.documents.show', [
                'booking' => $booking,
                'participant' => $participant,
                'document' => 'not-allowed',
            ]))
            ->assertNotFound();
    }

    public function test_authorized_user_can_send_participant_reminders_for_incomplete_bookings(): void
    {
        Mail::fake();
        $this->seedBookingManagementMenu();

        $viewPermission = Permission::findOrCreate('menu.booking_customer_data.view', 'web');
        $editPermission = Permission::findOrCreate('menu.booking_customer_data.edit', 'web');
        $package = TravelPackage::factory()->create();
        $booking = Booking::factory()->create([
            'package_id' => $package->id,
            'email' => 'customer@example.com',
            'passenger_count' => 2,
        ]);
        BookingParticipant::query()->create([
            'booking_id' => $booking->id,
            'full_name' => 'Peserta Belum Lengkap',
        ]);
        $reminderUrl = route('booking.customer-data.reminders.send', $package);

        $viewOnlyUser = User::factory()->create();
        $viewOnlyUser->givePermissionTo($viewPermission);
        $this->actingAs($viewOnlyUser)
            ->post($reminderUrl, ['status' => 'registered'])
            ->assertForbidden();

        $authorizedUser = User::factory()->create();
        $authorizedUser->givePermissionTo([$viewPermission, $editPermission]);

        $this->actingAs($authorizedUser)
            ->post($reminderUrl, ['status' => 'registered'])
            ->assertRedirect()
            ->assertSessionHas('success');

        Mail::assertSent(
            ParticipantDataReminder::class,
            fn (ParticipantDataReminder $mail): bool => $mail->booking->is($booking)
                && $mail->hasTo('customer@example.com')
                && $mail->summary['remaining_slots'] === 1
                && $mail->summary['missing_fields_count'] > 0
                && $mail->summary['missing_documents_count'] === 6,
        );
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
                ->has('packages.0.bookings', 1));
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
                        'name' => 'Data Peserta',
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
