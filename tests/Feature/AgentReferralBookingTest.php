<?php

use App\Actions\Agent\CreateBookingCommission;
use App\Actions\Agent\RecordAgentReferralVisit;
use App\Models\AgentCommission;
use App\Models\AgentPackageFee;
use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\Menu;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Models\User;
use App\Support\MenuPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class AgentReferralBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_referral_is_tracked_and_package_commission_is_snapshotted_when_approved(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => now()->addMonth(), 'end_date' => now()->addMonth()->addDays(8),
            'seats_total' => 40, 'seats_available' => 40, 'booking_status' => 'open',
            'price' => 25000000, 'currency' => 'IDR',
        ]);
        $agentUser = User::factory()->create();
        $agent = AgentProfile::query()->create(['user_id' => $agentUser->id, 'referral_code' => 'REF-UMROH', 'is_active' => true]);
        AgentPackageFee::query()->create(['agent_profile_id' => $agent->id, 'package_id' => $package->id, 'fee_type' => 'fixed', 'fee_value' => 500000, 'is_active' => true]);

        $this->post(route('public.paket-register.store', $package), [
            'full_name' => 'Jamaah Referral', 'phone' => '628111111111', 'email' => 'jamaah@example.com',
            'origin_city' => 'Bandung', 'passenger_count' => 2,
            'room_configuration' => ['single' => 0, 'double' => 1, 'triple' => 0, 'quad' => 0],
            'referral_code' => 'ref-umroh',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $registration = PackageRegistration::query()->firstOrFail();
        $this->assertSame($agent->id, $registration->agent_profile_id);

        Menu::query()->updateOrCreate(['menu_key' => 'booking_register'], [
            'name' => 'Register', 'path' => '/dashboard/booking-management/register', 'icon' => 'Users',
            'children' => null, 'order' => 1, 'is_active' => true,
        ]);
        MenuPermissionService::ensurePermissionsExist();
        $admin = User::factory()->create();
        $admin->givePermissionTo('menu.booking_register.approve');

        $this->actingAs($admin)->put(route('booking.register.mark-registered', $registration))->assertRedirect()->assertSessionHasNoErrors();

        $commission = AgentCommission::query()->firstOrFail();
        $this->assertSame(1000000, $commission->commission_amount);
        $this->assertSame(500000.0, (float) $commission->fee_value);
        $this->assertSame('pending', $commission->status);

        AgentPackageFee::query()->where('agent_profile_id', $agent->id)->where('package_id', $package->id)->update(['fee_value' => 900000]);
        $this->assertSame(1000000, $commission->fresh()->commission_amount);
    }

    public function test_pending_commission_follows_booking_changes_and_cancellation_preserves_history(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => now()->addMonth(), 'end_date' => now()->addMonth()->addDays(8),
            'seats_total' => 40, 'seats_available' => 40, 'booking_status' => 'open',
            'price' => 25000000, 'currency' => 'IDR',
        ]);
        $agent = AgentProfile::query()->create(['user_id' => User::factory()->create()->id, 'referral_code' => 'SYNC-01', 'is_active' => true]);
        AgentPackageFee::query()->create(['agent_profile_id' => $agent->id, 'package_id' => $package->id, 'fee_type' => 'fixed', 'fee_value' => 500000, 'is_active' => true]);
        $booking = Booking::query()->create([
            'booking_code' => 'BK-SYNC-01', 'customer_id' => User::factory()->create()->id,
            'agent_profile_id' => $agent->id, 'referral_code' => $agent->referral_code,
            'package_id' => $package->id, 'booking_type' => 'regular', 'full_name' => 'Jamaah Sync',
            'phone' => '628111111111', 'email' => 'sync@example.com', 'origin_city' => 'Bandung',
            'passenger_count' => 2, 'room_configuration' => ['single' => 0, 'double' => 1, 'triple' => 0, 'quad' => 0],
            'agreed_total_amount' => 50000000, 'agreed_currency' => 'IDR', 'status' => 'registered',
        ]);
        app(CreateBookingCommission::class)->handle($booking);

        Menu::query()->updateOrCreate(['menu_key' => 'booking_listing'], [
            'name' => 'Listing', 'path' => '/dashboard/booking-management/listing', 'icon' => 'Users',
            'children' => null, 'order' => 1, 'is_active' => true,
        ]);
        MenuPermissionService::ensurePermissionsExist();
        $admin = User::factory()->create();
        $admin->givePermissionTo(['menu.booking_listing.edit', 'menu.booking_listing.delete']);

        AgentPackageFee::query()->where('agent_profile_id', $agent->id)->where('package_id', $package->id)->update(['fee_value' => 900000]);
        $this->actingAs($admin)->put(route('booking.listing.update', $booking), [
            'travel_package_id' => $package->id, 'full_name' => $booking->full_name,
            'phone' => $booking->phone, 'email' => $booking->email, 'origin_city' => $booking->origin_city,
            'passenger_count' => 3, 'room_configuration' => ['single' => 0, 'double' => 0, 'triple' => 1, 'quad' => 0],
            'status' => 'registered',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertSame(1500000, $booking->fresh()->agentCommission->commission_amount);
        $this->assertSame(75000000, $booking->fresh()->agreed_total_amount);

        $this->actingAs($admin)->delete(route('booking.listing.destroy', $booking))->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'cancelled', 'passenger_count' => 3]);
        $this->assertDatabaseHas('agent_commissions', ['booking_id' => $booking->id, 'status' => 'cancelled', 'commission_amount' => 1500000]);
    }

    public function test_paid_commission_blocks_booking_cancellation(): void
    {
        $package = TravelPackage::factory()->create();
        $agent = AgentProfile::query()->create(['user_id' => User::factory()->create()->id, 'referral_code' => 'PAID-01', 'is_active' => true]);
        $booking = Booking::query()->create([
            'booking_code' => 'BK-PAID-01', 'agent_profile_id' => $agent->id, 'package_id' => $package->id,
            'booking_type' => 'regular', 'full_name' => 'Jamaah Paid', 'phone' => '628111111111',
            'origin_city' => 'Jakarta', 'passenger_count' => 1, 'agreed_total_amount' => 25000000,
            'agreed_currency' => 'IDR', 'status' => 'registered',
        ]);
        AgentCommission::query()->create([
            'agent_profile_id' => $agent->id, 'booking_id' => $booking->id, 'package_id' => $package->id,
            'fee_type' => 'fixed', 'fee_value' => 500000, 'base_amount' => 25000000,
            'commission_amount' => 500000, 'currency' => 'IDR', 'status' => 'paid', 'paid_at' => now(),
        ]);
        Menu::query()->updateOrCreate(['menu_key' => 'booking_listing'], [
            'name' => 'Listing', 'path' => '/dashboard/booking-management/listing', 'icon' => 'Users',
            'children' => null, 'order' => 1, 'is_active' => true,
        ]);
        MenuPermissionService::ensurePermissionsExist();
        $admin = User::factory()->create();
        $admin->givePermissionTo('menu.booking_listing.delete');

        $this->actingAs($admin)->delete(route('booking.listing.destroy', $booking))->assertSessionHasErrors('booking');
        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'registered']);
        $this->assertDatabaseHas('agent_commissions', ['booking_id' => $booking->id, 'status' => 'paid']);
    }

    public function test_inactive_referral_codes_are_rejected(): void
    {
        $package = TravelPackage::factory()->create(['start_date' => now()->addMonth(), 'end_date' => now()->addMonth()->addDays(8), 'seats_total' => 10, 'seats_available' => 10, 'booking_status' => 'open']);
        AgentProfile::query()->create(['user_id' => User::factory()->create()->id, 'referral_code' => 'INACTIVE', 'is_active' => false]);

        $this->post(route('public.paket-register.store', $package), [
            'full_name' => 'Jamaah', 'phone' => '628111111111', 'email' => 'inactive@example.com',
            'origin_city' => 'Jakarta', 'passenger_count' => 1,
            'room_configuration' => ['single' => 1, 'double' => 0, 'triple' => 0, 'quad' => 0],
            'referral_code' => 'INACTIVE',
        ])->assertSessionHasErrors('referral_code');
    }

    public function test_valid_referral_persists_across_navigation_until_registration(): void
    {
        $package = TravelPackage::factory()->create([
            'start_date' => now()->addMonth(),
            'end_date' => now()->addMonth()->addDays(8),
            'seats_total' => 10,
            'seats_available' => 10,
            'booking_status' => 'open',
        ]);
        $agent = AgentProfile::query()->create([
            'user_id' => User::factory()->create()->id,
            'referral_code' => 'PERSIST-01',
            'is_active' => true,
        ]);

        $this->get(route('public.paket-register', $package).'?ref=persist-01')
            ->assertOk()
            ->assertSessionHas('agent_referral_code', 'PERSIST-01');

        $this->assertDatabaseHas('agent_referral_visits', [
            'agent_profile_id' => $agent->id,
            'visit_count' => 1,
        ]);

        $this->post(route('public.paket-register.store', $package), [
            'full_name' => 'Jamaah Persist',
            'phone' => '628111111111',
            'email' => 'persist@example.com',
            'origin_city' => 'Jakarta',
            'passenger_count' => 1,
            'room_configuration' => ['single' => 1, 'double' => 0, 'triple' => 0, 'quad' => 0],
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('package_registrations', [
            'agent_profile_id' => $agent->id,
            'referral_code' => 'PERSIST-01',
        ]);
    }

    public function test_repeated_referral_clicks_increment_hits_without_duplicating_unique_visitor(): void
    {
        $agent = AgentProfile::query()->create([
            'user_id' => User::factory()->create()->id,
            'referral_code' => 'CLICKS-01',
            'is_active' => true,
        ]);
        $request = Request::create('/paket-umroh', 'GET');
        $request->cookies->set('agent_referral_visitor', 'stable-visitor-token');

        app(RecordAgentReferralVisit::class)->handle($request, $agent);
        app(RecordAgentReferralVisit::class)->handle($request, $agent);

        $this->assertDatabaseCount('agent_referral_visits', 1);
        $this->assertDatabaseHas('agent_referral_visits', [
            'agent_profile_id' => $agent->id,
            'visitor_hash' => hash('sha256', 'stable-visitor-token'),
            'visit_count' => 2,
        ]);
    }

    public function test_bot_referral_previews_do_not_inflate_agent_analytics(): void
    {
        $agent = AgentProfile::query()->create([
            'user_id' => User::factory()->create()->id,
            'referral_code' => 'BOT-SAFE',
            'is_active' => true,
        ]);

        $this->withHeader('User-Agent', 'TelegramBot 1.0')
            ->get('/paket-umroh?ref=BOT-SAFE')
            ->assertOk()
            ->assertSessionHas('agent_referral_code', 'BOT-SAFE');

        $this->assertDatabaseMissing('agent_referral_visits', [
            'agent_profile_id' => $agent->id,
        ]);
    }
}
