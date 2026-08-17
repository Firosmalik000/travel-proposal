<?php

use App\Models\AgentCommission;
use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

        $this->actingAs($user)->get(route('agent.dashboard'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('summary.total_bookings', 2)
            ->where('summary.total_pax', 2)
            ->has('summary.revenue_by_currency', 2)
            ->has('summary.commissions_by_currency', 2));
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
