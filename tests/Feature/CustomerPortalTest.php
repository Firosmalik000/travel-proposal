<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
                ->where('bookings.0.booking_code', 'BK-CUSTOMER-001'));
    }

    public function test_it_forbids_a_customer_from_another_customer_booking(): void
    {
        $other = User::factory()->create();
        $other->assignRole('Customer');

        $this->actingAs($other)
            ->get(route('customer.bookings.show', $this->booking))
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
