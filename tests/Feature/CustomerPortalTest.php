<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CustomerPortalTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        Role::findOrCreate('Customer', 'web');
        $this->customer = User::factory()->withoutTwoFactor()->create();
        $this->customer->assignRole('Customer');
        $package = TravelPackage::factory()->create(['price' => 25_000_000, 'currency' => 'IDR']);
        $this->booking = Booking::query()->create([
            'customer_id' => $this->customer->id,
            'booking_code' => 'BK-CUSTOMER-001',
            'package_id' => $package->id,
            'booking_type' => 'regular',
            'full_name' => $this->customer->name,
            'phone' => '628123456789',
            'email' => $this->customer->email,
            'origin_city' => 'Jakarta',
            'passenger_count' => 2,
            'room_configuration' => ['double' => 1],
            'status' => 'registered',
            'agreed_total_amount' => 50_000_000,
            'agreed_currency' => 'IDR',
        ]);
    }

    public function test_it_shows_only_the_authenticated_customer_bookings(): void
    {
        $this->actingAs($this->customer)
            ->get(route('customer.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customer/Dashboard')
                ->where('summary.total_bookings', 1)
                ->where('summary.total_spent', 0)
                ->where('summary.total_due', 50_000_000)
                ->where('summary.remaining_payment', 50_000_000)
                ->where('summary.incomplete_participant_orders', 1)
                ->where('summary.remaining_participant_slots', 2)
                ->where('summary.latest_booking_status', 'registered')
                ->where('bookings.0.booking_code', 'BK-CUSTOMER-001'));
    }

    public function test_it_shows_a_separate_booking_page_for_the_customer(): void
    {
        $this->actingAs($this->customer)
            ->get(route('customer.bookings.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customer/Bookings')
                ->where('summary.total_bookings', 1)
                ->where('summary.total_spent', 0)
                ->where('summary.total_due', 50_000_000)
                ->where('bookings.0.booking_code', 'BK-CUSTOMER-001')
                ->where('bookings.0.detail_url', route('customer.bookings.show', $this->booking->booking_code)));
    }

    public function test_it_uses_the_payment_ledger_for_customer_booking_data_and_history(): void
    {
        BookingPayment::factory()->for($this->booking)->create([
            'payment_date' => '2026-08-17',
            'amount' => 10_000_000,
            'status' => 'confirmed',
        ]);
        BookingPayment::factory()->for($this->booking)->create([
            'payment_date' => '2026-08-18',
            'amount' => 5_000_000,
            'status' => 'pending',
        ]);
        BookingPayment::factory()->for($this->booking)->create([
            'payment_date' => '2026-08-19',
            'amount' => 3_000_000,
            'status' => 'void',
        ]);

        $this->actingAs($this->customer)
            ->get(route('customer.bookings.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.total_spent', 10_000_000)
                ->where('summary.remaining_payment', 40_000_000)
                ->where('bookings.0.total_amount', 50_000_000)
                ->where('bookings.0.paid_amount', 10_000_000)
                ->where('bookings.0.remaining_amount', 40_000_000)
                ->where('bookings.0.payment_status', 'partial'));

        $this->actingAs($this->customer)
            ->get(route('customer.bookings.show', $this->booking->booking_code))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.paid_amount', 10_000_000)
                ->where('booking.remaining_amount', 40_000_000)
                ->has('booking.payments', 2)
                ->where('booking.payments.0.status', 'pending')
                ->where('booking.payments.0.paid_after', 10_000_000)
                ->where('booking.payments.0.remaining_after', 40_000_000)
                ->where('booking.payments.0.download_url', fn (?string $url): bool => is_string($url)
                    && str_contains($url, '/payments/')
                    && str_ends_with($url, '/invoice'))
                ->where('booking.payments.1.status', 'confirmed')
                ->where('booking.payments.1.paid_after', 10_000_000));
    }

    public function test_customer_can_download_their_payment_invoice(): void
    {
        $payment = BookingPayment::factory()->for($this->booking)->create([
            'payment_date' => '2026-08-18',
            'amount' => 10_000_000,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->customer)
            ->get(route('customer.payments.invoice.download', [
                'booking' => $this->booking->booking_code,
                'payment' => $payment,
            ]));

        $response
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
        $this->assertStringContainsString(
            'attachment;',
            (string) $response->headers->get('content-disposition'),
        );
        $this->assertStringContainsString(
            'INV-BK-CUSTOMER-001',
            (string) $response->headers->get('content-disposition'),
        );
    }

    public function test_customer_cannot_download_another_customers_payment_invoice(): void
    {
        $payment = BookingPayment::factory()->for($this->booking)->create([
            'status' => 'confirmed',
        ]);
        $otherCustomer = User::factory()->withoutTwoFactor()->create();
        $otherCustomer->assignRole('Customer');

        $this->actingAs($otherCustomer)
            ->get(route('customer.payments.invoice.download', [
                'booking' => $this->booking->booking_code,
                'payment' => $payment,
            ]))
            ->assertForbidden();
    }

    public function test_customer_cannot_download_a_payment_from_a_different_booking(): void
    {
        $otherBooking = Booking::factory()->create();
        $payment = BookingPayment::factory()->for($otherBooking)->create([
            'status' => 'confirmed',
        ]);

        $this->actingAs($this->customer)
            ->get(route('customer.payments.invoice.download', [
                'booking' => $this->booking->booking_code,
                'payment' => $payment,
            ]))
            ->assertNotFound();
    }

    public function test_it_exposes_booking_actions_on_the_customer_booking_detail_page(): void
    {
        $this->actingAs($this->customer)
            ->get(route('customer.bookings.show', $this->booking->booking_code))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customer/BookingShow')
                ->where('booking.full_name', fn (?string $value): bool => is_string($value) && $value !== '')
                ->where('booking.phone', fn (?string $value): bool => is_string($value) && $value !== '')
                ->where('booking.origin_city', fn (?string $value): bool => is_string($value) && $value !== '')
                ->where('booking.room_summary', fn (?string $value): bool => is_string($value) && $value !== '')
                ->where('booking.package_url', fn (?string $url): bool => is_string($url) && str_contains($url, '/paket-umroh/'))
                ->where('booking.participants_url', fn (?string $url): bool => is_string($url) && str_contains($url, 'tab=participants'))
                ->where('booking.invoice_url', fn (?string $url): bool => is_string($url) && str_contains($url, 'tab=payments'))
                ->where('booking.review_url', fn (?string $url): bool => is_string($url) && str_contains($url, '/booking/'))
            );
    }

    public function test_it_shows_a_pending_public_registration_before_it_becomes_a_booking(): void
    {
        $packageId = $this->booking->package_id;
        $this->booking->delete();

        PackageRegistration::factory()->create([
            'customer_id' => $this->customer->id,
            'package_id' => $packageId,
            'email' => $this->customer->email,
            'passenger_count' => 3,
            'room_configuration' => ['triple' => 1],
            'status' => 'pending',
        ]);
        PackageRegistration::factory()->create([
            'customer_id' => User::factory(),
            'package_id' => $packageId,
            'status' => 'pending',
        ]);

        $this->actingAs($this->customer)
            ->get(route('customer.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customer/Dashboard')
                ->where('summary.total_bookings', 1)
                ->where('summary.total_spent', 0)
                ->where('summary.total_due', 0)
                ->where('summary.incomplete_participant_orders', 1)
                ->where('summary.remaining_participant_slots', 3)
                ->where('summary.latest_booking_status', 'pending')
                ->has('bookings', 1)
                ->where('bookings.0.record_type', 'registration')
                ->where('bookings.0.status', 'pending')
                ->where('bookings.0.detail_url', fn (?string $url): bool => is_string($url) && str_contains($url, '/customer/bookings/REG-')));
    }

    public function test_it_opens_the_pending_registration_detail_page_for_the_customer(): void
    {
        $packageId = $this->booking->package_id;
        $this->booking->delete();

        PackageRegistration::factory()->create([
            'customer_id' => $this->customer->id,
            'package_id' => $packageId,
            'email' => $this->customer->email,
            'passenger_count' => 3,
            'room_configuration' => ['triple' => 1],
            'status' => 'pending',
        ]);

        $this->actingAs($this->customer)
            ->get(route('customer.bookings.show', 'REG-0001'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Customer/BookingShow')
                ->where('booking.record_type', 'registration')
                ->where('booking.booking_code', 'REG-0001')
                ->where('booking.full_name', fn (?string $value): bool => is_string($value) && $value !== '')
                ->where('booking.phone', fn (?string $value): bool => is_string($value) && $value !== '')
                ->where('booking.origin_city', fn (?string $value): bool => is_string($value) && $value !== '')
                ->where('booking.room_summary', fn (?string $value): bool => is_string($value) && $value !== '')
                ->where('booking.detail_url', fn (?string $url): bool => is_string($url) && str_contains($url, '/customer/bookings/REG-0001'))
            );
    }

    public function test_it_forbids_a_customer_from_another_customer_booking(): void
    {
        $other = User::factory()->create();
        $other->assignRole('Customer');

        $this->actingAs($other)
            ->get(route('customer.bookings.show', $this->booking->booking_code))
            ->assertForbidden();
    }

    public function test_it_allows_a_customer_to_fill_participant_slots_and_respects_the_booking_limit(): void
    {
        $this->actingAs($this->customer)
            ->post(route('customer.participants.store', $this->booking), ['full_name' => 'Peserta Satu', 'gender' => 'male'])
            ->assertRedirect();
        $this->actingAs($this->customer)
            ->post(route('customer.participants.store', $this->booking), ['full_name' => 'Peserta Dua'])
            ->assertRedirect();
        $this->actingAs($this->customer)
            ->post(route('customer.participants.store', $this->booking), ['full_name' => 'Peserta Tiga'])
            ->assertSessionHasErrors('full_name');

        $this->assertSame(2, $this->booking->participants()->count());
    }

    public function test_customer_participant_form_stores_the_same_complete_data_used_by_admin(): void
    {
        Storage::fake('local');

        $this->actingAs($this->customer)
            ->post(route('customer.participants.store', $this->booking), [
                'full_name' => 'Peserta Lengkap',
                'gender' => 'female',
                'birth_place' => 'Bandung',
                'birth_date' => '1990-05-10',
                'marital_status' => 'married',
                'address' => 'Jalan Contoh 10',
                'needs_wheelchair' => true,
                'shirt_size' => 'L',
                'passport_ready' => true,
                'passport_issue_date' => '2024-01-01',
                'passport_expiry_date' => '2029-01-01',
                'passport_type' => 'e_passport',
                'passport_scan' => UploadedFile::fake()->create('passport.pdf', 100, 'application/pdf'),
                'has_medical_history' => true,
                'medical_history_notes' => 'Alergi obat tertentu',
                'emergency_contact_name' => 'Keluarga Peserta',
                'emergency_contact_phone' => '628123456700',
                'emergency_contact_relationship' => 'Pasangan',
                'has_performed_umrah' => true,
                'referral_source' => 'Keluarga',
            ])
            ->assertRedirect();

        $participant = $this->booking->participants()->firstOrFail();

        $this->assertDatabaseHas('booking_participants', [
            'id' => $participant->id,
            'full_name' => 'Peserta Lengkap',
            'needs_wheelchair' => true,
            'passport_type' => 'e_passport',
            'has_medical_history' => true,
            'has_performed_umrah' => true,
        ]);
        Storage::disk('local')->assertExists($participant->passport_scan_path);

        $this->actingAs($this->customer)
            ->get(route('customer.bookings.show', $this->booking->booking_code))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('booking.participants.0.full_name', 'Peserta Lengkap')
                ->where('booking.participants.0.needs_wheelchair', true)
                ->where('booking.participants.0.has_medical_history', true)
                ->where('booking.participants.0.is_complete', false)
                ->where('booking.participants.0.missing_documents_count', 5)
                ->where('booking.participants.0.documents.passport_scan', fn (?string $url): bool => is_string($url) && str_contains($url, '/documents/passport_scan'))
            );

        $this->actingAs($this->customer)
            ->get(route('customer.participants.documents.download', [
                'booking' => $this->booking,
                'participant' => $participant,
                'document' => 'passport_scan',
            ]))
            ->assertOk();
    }

    public function test_it_redirects_a_customer_login_to_the_customer_portal(): void
    {
        $password = 'Customer123!';
        $this->customer->update(['password' => $password]);

        $this->post(route('login.store'), ['email' => $this->customer->email, 'password' => $password])
            ->assertRedirect('/customer');
    }

    public function test_it_ignores_an_admin_intended_url_for_customer_logins(): void
    {
        $password = 'Customer123!';
        $this->customer->update(['password' => $password]);

        $this->withSession(['url.intended' => url('/admin')])
            ->post(route('login.store'), ['email' => $this->customer->email, 'password' => $password])
            ->assertRedirect('/customer');
    }

    public function test_customer_only_account_cannot_open_the_admin_portal(): void
    {
        $this->actingAs($this->customer)
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_customer_cannot_change_participants_after_admin_locks_the_booking(): void
    {
        $this->booking->update(['participant_data_locked_at' => now()]);

        $this->actingAs($this->customer)
            ->post(route('customer.participants.store', $this->booking), ['full_name' => 'Peserta Terkunci'])
            ->assertForbidden();

        $this->assertSame(0, $this->booking->participants()->count());
    }
}
