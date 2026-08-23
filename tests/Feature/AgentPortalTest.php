<?php

use App\Models\AgentCommission;
use App\Models\AgentPackageFee;
use App\Models\AgentProfile;
use App\Models\AgentReferralVisit;
use App\Models\Booking;
use App\Models\PackageRegistration;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AgentPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_agent_can_view_their_portal(): void
    {
        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole('Agent');
        AgentProfile::query()->create(['user_id' => $user->id, 'referral_code' => 'PORTAL-01', 'is_active' => true]);

        $this->actingAs($user)->get(route('agent.dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Agent/Dashboard')
            ->where('agent.referral_code', 'PORTAL-01')
            ->where('agent.qr_url', route('agent.referral.qr'))
            ->where('summary.payout_profile_complete', false)
            ->where('summary.total_bookings', 0));
    }

    public function test_non_agents_and_inactive_agents_are_forbidden(): void
    {
        $this->actingAs(User::factory()->create())->get(route('agent.dashboard'))->assertForbidden();

        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
        $inactive = User::factory()->create();
        $inactive->assignRole('Agent');
        AgentProfile::query()->create(['user_id' => $inactive->id, 'referral_code' => 'OFF-01', 'is_active' => false]);
        $this->actingAs($inactive)->get(route('agent.dashboard'))->assertForbidden();
    }

    public function test_agent_only_accounts_cannot_access_the_admin_portal(): void
    {
        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
        $agent = User::factory()->create();
        $agent->assignRole('Agent');
        AgentProfile::query()->create(['user_id' => $agent->id, 'referral_code' => 'NO-ADMIN', 'is_active' => true]);

        $this->actingAs($agent)->get('/admin')->assertForbidden();
    }

    public function test_agent_login_redirects_to_agent_portal(): void
    {
        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
        $agent = User::factory()->withoutTwoFactor()->create(['password' => 'password']);
        $agent->assignRole('Agent');
        AgentProfile::query()->create(['user_id' => $agent->id, 'referral_code' => 'LOGIN-01', 'is_active' => true]);

        $this->post('/login', ['email' => $agent->email, 'password' => 'password'])
            ->assertRedirect('/agent');
    }

    public function test_portal_separates_currency_totals_and_excludes_cancelled_bookings_from_kpis(): void
    {
        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole('Agent');
        $agent = AgentProfile::query()->create(['user_id' => $user->id, 'referral_code' => 'MULTI-01', 'is_active' => true]);
        $idrPackage = TravelPackage::factory()->create(['currency' => 'IDR']);
        $usdPackage = TravelPackage::factory()->create(['currency' => 'USD']);

        $idrBooking = $this->createAgentBooking($agent->id, $idrPackage->id, 'BK-IDR', 25000000, 'IDR', 'registered');
        $usdBooking = $this->createAgentBooking($agent->id, $usdPackage->id, 'BK-USD', 2000, 'USD', 'registered');
        $cancelledBooking = $this->createAgentBooking($agent->id, $idrPackage->id, 'BK-OFF', 10000000, 'IDR', 'cancelled');

        AgentCommission::query()->create(['agent_profile_id' => $agent->id, 'booking_id' => $idrBooking->id, 'package_id' => $idrPackage->id, 'fee_type' => 'fixed', 'fee_value' => 500000, 'base_amount' => 25000000, 'commission_amount' => 500000, 'currency' => 'IDR', 'status' => 'pending']);
        AgentCommission::query()->create(['agent_profile_id' => $agent->id, 'booking_id' => $usdBooking->id, 'package_id' => $usdPackage->id, 'fee_type' => 'percentage', 'fee_value' => 10, 'base_amount' => 2000, 'commission_amount' => 200, 'currency' => 'USD', 'status' => 'approved']);
        AgentCommission::query()->create(['agent_profile_id' => $agent->id, 'booking_id' => $cancelledBooking->id, 'package_id' => $idrPackage->id, 'fee_type' => 'fixed', 'fee_value' => 500000, 'base_amount' => 10000000, 'commission_amount' => 500000, 'currency' => 'IDR', 'status' => 'cancelled']);
        AgentReferralVisit::factory()->create(['agent_profile_id' => $agent->id, 'visitor_hash' => hash('sha256', 'visitor-a'), 'visit_count' => 3]);
        AgentReferralVisit::factory()->create(['agent_profile_id' => $agent->id, 'visitor_hash' => hash('sha256', 'visitor-b'), 'visit_count' => 2]);

        $this->actingAs($user)->get(route('agent.dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('summary.total_bookings', 2)
            ->where('summary.total_pax', 2)
            ->where('summary.referral_clicks', 5)
            ->where('summary.unique_visitors', 2)
            ->where('summary.conversion_rate', 100)
            ->has('summary.revenue_by_currency', 2)
            ->has('summary.commissions_by_currency', 2));
    }

    public function test_agent_portal_pages_only_expose_records_owned_by_the_authenticated_agent(): void
    {
        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole('Agent');
        $agent = AgentProfile::query()->create(['user_id' => $user->id, 'referral_code' => 'OWNER-01', 'is_active' => true]);
        $otherUser = User::factory()->create();
        $otherUser->assignRole('Agent');
        $otherAgent = AgentProfile::query()->create(['user_id' => $otherUser->id, 'referral_code' => 'OTHER-01', 'is_active' => true]);
        $package = TravelPackage::factory()->create(['is_active' => true]);

        PackageRegistration::factory()->create(['agent_profile_id' => $agent->id, 'package_id' => $package->id, 'full_name' => 'Lead Milik Agent']);
        PackageRegistration::factory()->create(['agent_profile_id' => $otherAgent->id, 'package_id' => $package->id, 'full_name' => 'Lead Agent Lain']);
        $booking = $this->createAgentBooking($agent->id, $package->id, 'BK-OWNER', 25000000, 'IDR', 'registered');
        $otherBooking = $this->createAgentBooking($otherAgent->id, $package->id, 'BK-OTHER', 25000000, 'IDR', 'registered');
        AgentPackageFee::query()->create(['agent_profile_id' => $agent->id, 'package_id' => $package->id, 'fee_type' => 'fixed', 'fee_value' => 500000, 'is_active' => true]);
        AgentCommission::query()->create(['agent_profile_id' => $agent->id, 'booking_id' => $booking->id, 'package_id' => $package->id, 'fee_type' => 'fixed', 'fee_value' => 500000, 'base_amount' => 25000000, 'commission_amount' => 500000, 'currency' => 'IDR', 'status' => 'pending']);

        $this->actingAs($user)->get(route('agent.leads.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Agent/Leads')->has('leads.data', 1)->where('leads.data.0.customer_name', 'Lead Milik Agent'));
        $this->actingAs($user)->get(route('agent.bookings.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Agent/Bookings')->has('bookings.data', 1)->where('bookings.data.0.booking_code', 'BK-OWNER'));
        $this->actingAs($user)->get(route('agent.commissions.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Agent/Commissions')->has('commissions.data', 1));
        $this->actingAs($user)->get(route('agent.packages.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Agent/Packages')->has('fees', 1)->where('fees.0.referral_url', fn (string $url): bool => str_contains($url, 'ref=OWNER-01')));
        $this->actingAs($user)->get(route('agent.bookings.show', $booking->booking_code))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Agent/BookingShow')->where('booking.booking_code', 'BK-OWNER'));
        $this->actingAs($user)->get(route('agent.bookings.show', $otherBooking->booking_code))->assertForbidden();
    }

    public function test_booking_listing_is_paginated_searchable_and_rejects_unknown_statuses(): void
    {
        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole('Agent');
        $agent = AgentProfile::query()->create(['user_id' => $user->id, 'referral_code' => 'PAGE-01', 'is_active' => true]);
        $package = TravelPackage::factory()->create();

        foreach (range(1, 16) as $index) {
            $this->createAgentBooking($agent->id, $package->id, sprintf('BK-PAGE-%02d', $index), 1000000, 'IDR', 'registered');
        }

        $this->actingAs($user)->get(route('agent.bookings.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('bookings.data', 15)->where('bookings.total', 16)->where('bookings.last_page', 2));
        $this->actingAs($user)->get(route('agent.bookings.index', ['search' => 'BK-PAGE-16']))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('bookings.data', 1)->where('bookings.data.0.booking_code', 'BK-PAGE-16'));
        $this->actingAs($user)->get(route('agent.bookings.index', ['status' => 'paid']))->assertSessionHasErrors('status');
    }

    public function test_agent_can_update_profile_and_password_without_changing_protected_profile_fields(): void
    {
        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
        $user = User::factory()->create(['password' => 'old-password']);
        $user->assignRole('Agent');
        $agent = AgentProfile::query()->create(['user_id' => $user->id, 'referral_code' => 'SAFE-01', 'is_active' => true]);

        $this->actingAs($user)->put(route('agent.account.update'), [
            'name' => 'Agent Baru', 'email' => 'agent-baru@example.com', 'phone' => '628123456789',
            'bank_name' => 'Bank Aman', 'bank_account_name' => 'Agent Baru', 'bank_account_number' => '123456789',
            'referral_code' => 'HACKED', 'is_active' => false,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Agent Baru', 'full_name' => 'Agent Baru']);
        $this->assertDatabaseHas('agent_profiles', ['id' => $agent->id, 'referral_code' => 'SAFE-01', 'is_active' => true, 'bank_name' => 'Bank Aman']);

        $this->actingAs($user)->put(route('agent.password.update'), [
            'current_password' => 'old-password', 'password' => 'new-secure-password', 'password_confirmation' => 'new-secure-password',
        ])->assertRedirect()->assertSessionHasNoErrors();
        $this->assertTrue(Hash::check('new-secure-password', $user->fresh()->password));
    }

    public function test_agent_can_render_and_download_only_authorized_referral_qr_codes(): void
    {
        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole('Agent');
        $agent = AgentProfile::query()->create(['user_id' => $user->id, 'referral_code' => 'QR-SAFE', 'is_active' => true]);
        $ownedPackage = TravelPackage::factory()->create();
        $unauthorizedPackage = TravelPackage::factory()->create();
        AgentPackageFee::query()->create([
            'agent_profile_id' => $agent->id,
            'package_id' => $ownedPackage->id,
            'fee_type' => 'fixed',
            'fee_value' => 500000,
            'is_active' => true,
        ]);

        $this->actingAs($user)->get(route('agent.referral.qr'))
            ->assertOk()
            ->assertHeader('content-type', 'image/svg+xml')
            ->assertHeader('x-content-type-options', 'nosniff')
            ->assertSee('<svg', false);

        $this->actingAs($user)->get(route('agent.packages.qr', $ownedPackage))
            ->assertOk()
            ->assertHeader('content-disposition', 'inline; filename="referral-'.strtolower($ownedPackage->code).'.svg"');

        $this->actingAs($user)->get(route('agent.packages.qr', ['travelPackage' => $ownedPackage, 'download' => true]))
            ->assertOk()
            ->assertHeader('content-disposition', 'attachment; filename="referral-'.strtolower($ownedPackage->code).'.svg"');

        $this->actingAs($user)->get(route('agent.packages.qr', $unauthorizedPackage))->assertNotFound();
    }

    public function test_commission_export_respects_filters_agent_scope_and_spreadsheet_safety(): void
    {
        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole('Agent');
        $agent = AgentProfile::query()->create(['user_id' => $user->id, 'referral_code' => 'CSV-OWNER', 'is_active' => true]);
        $otherAgent = AgentProfile::query()->create(['user_id' => User::factory()->create()->id, 'referral_code' => 'CSV-OTHER', 'is_active' => true]);
        $package = TravelPackage::factory()->create();
        $ownedBooking = $this->createAgentBooking($agent->id, $package->id, 'BK-CSV-OWNER', 25000000, 'IDR', 'registered');
        $ownedBooking->update(['full_name' => '=HYPERLINK("https://invalid.test")']);
        $otherBooking = $this->createAgentBooking($otherAgent->id, $package->id, 'BK-CSV-OTHER', 25000000, 'IDR', 'registered');

        AgentCommission::query()->create([
            'agent_profile_id' => $agent->id,
            'booking_id' => $ownedBooking->id,
            'package_id' => $package->id,
            'fee_type' => 'fixed',
            'fee_value' => 500000,
            'base_amount' => 25000000,
            'commission_amount' => 500000,
            'currency' => 'IDR',
            'status' => 'pending',
            'notes' => '+formula',
        ]);
        AgentCommission::query()->create([
            'agent_profile_id' => $otherAgent->id,
            'booking_id' => $otherBooking->id,
            'package_id' => $package->id,
            'fee_type' => 'fixed',
            'fee_value' => 500000,
            'base_amount' => 25000000,
            'commission_amount' => 500000,
            'currency' => 'IDR',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)->get(route('agent.commissions.export', ['status' => 'pending']));
        $response->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $csv = $response->streamedContent();

        $this->assertStringContainsString('BK-CSV-OWNER', $csv);
        $this->assertStringNotContainsString('BK-CSV-OTHER', $csv);
        $this->assertStringContainsString("'=HYPERLINK", $csv);
        $this->assertStringContainsString("'+formula", $csv);

        $this->actingAs($user)->get(route('agent.commissions.export', ['status' => 'unknown']))
            ->assertSessionHasErrors('status');
    }

    private function createAgentBooking(int $agentProfileId, int $packageId, string $code, int $amount, string $currency, string $status): Booking
    {
        return Booking::query()->create([
            'booking_code' => $code, 'agent_profile_id' => $agentProfileId, 'package_id' => $packageId,
            'booking_type' => 'regular', 'full_name' => 'Jamaah Agent', 'phone' => '628111111111',
            'origin_city' => 'Jakarta', 'passenger_count' => 1, 'agreed_total_amount' => $amount,
            'agreed_currency' => $currency, 'status' => $status,
        ]);
    }
}
