<?php

use App\Models\AgentCommission;
use App\Models\AgentPackageFee;
use App\Models\AgentProfile;
use App\Models\Booking;
use App\Models\Menu;
use App\Models\TravelPackage;
use App\Models\User;
use App\Support\MenuPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Menu::query()->updateOrCreate(['menu_key' => 'agents'], [
            'name' => 'Agents', 'path' => '/dashboard/agent-management/agents', 'icon' => 'Users',
            'children' => null, 'order' => 1, 'is_active' => true,
        ]);
        Menu::query()->updateOrCreate(['menu_key' => 'agent_fees'], [
            'name' => 'Fee per Package', 'path' => '/dashboard/agent-management/fees', 'icon' => 'HandCoins',
            'children' => null, 'order' => 2, 'is_active' => true,
        ]);
        MenuPermissionService::ensurePermissionsExist();
    }

    public function test_authorized_admin_can_create_an_agent_with_a_unique_referral_code(): void
    {
        $admin = User::factory()->create();
        $admin->givePermissionTo(['menu.agents.view', 'menu.agents.create']);

        $this->actingAs($admin)->post(route('agents.store'), [
            'name' => 'Agent Bandung',
            'email' => 'agent@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'referral_code' => 'bandung-01',
            'phone' => '628123456789',
            'bank_name' => 'BCA',
            'bank_account_name' => 'Agent Bandung',
            'bank_account_number' => '1234567890',
            'is_active' => true,
        ])->assertRedirect()->assertSessionHasNoErrors();

        $agent = AgentProfile::query()->where('referral_code', 'BANDUNG-01')->firstOrFail();

        $this->assertTrue($agent->user->hasRole('Agent'));
        $this->assertNotNull($agent->user->email_verified_at);
    }

    public function test_duplicate_referral_codes_are_rejected(): void
    {
        $admin = User::factory()->create();
        $admin->givePermissionTo('menu.agents.create');
        $agentUser = User::factory()->create();
        AgentProfile::query()->create(['user_id' => $agentUser->id, 'referral_code' => 'SAME-CODE', 'is_active' => true]);

        $this->actingAs($admin)->post(route('agents.store'), [
            'name' => 'Agent Dua', 'email' => 'agent2@example.com', 'password' => 'Password123!',
            'password_confirmation' => 'Password123!', 'referral_code' => 'SAME-CODE', 'is_active' => true,
        ])->assertSessionHasErrors('referral_code');
    }

    public function test_one_fee_rule_is_stored_per_agent_and_package(): void
    {
        $admin = User::factory()->create();
        $admin->givePermissionTo('menu.agent_fees.edit');
        $agent = AgentProfile::query()->create(['user_id' => User::factory()->create()->id, 'referral_code' => 'FEE-01', 'is_active' => true]);
        $package = TravelPackage::factory()->create();

        $payload = ['agent_profile_id' => $agent->id, 'package_id' => $package->id, 'fee_type' => 'fixed', 'fee_value' => 500000, 'is_active' => true];
        $this->actingAs($admin)->put(route('agent-fees.update'), $payload)->assertRedirect()->assertSessionHasNoErrors();
        $this->actingAs($admin)->put(route('agent-fees.update'), [...$payload, 'fee_value' => 750000])->assertRedirect();

        $this->assertSame(1, AgentPackageFee::query()->count());
        $this->assertSame(750000.0, (float) AgentPackageFee::query()->firstOrFail()->fee_value);
    }

    public function test_user_without_agent_management_permission_is_forbidden(): void
    {
        $this->actingAs(User::factory()->create())->get(route('agents.index'))->assertForbidden();
    }

    public function test_percentage_fee_cannot_exceed_one_hundred_percent(): void
    {
        $admin = User::factory()->create();
        $admin->givePermissionTo('menu.agent_fees.edit');
        $agent = AgentProfile::query()->create(['user_id' => User::factory()->create()->id, 'referral_code' => 'PERCENT-01', 'is_active' => true]);
        $package = TravelPackage::factory()->create();

        $this->actingAs($admin)->put(route('agent-fees.update'), [
            'agent_profile_id' => $agent->id, 'package_id' => $package->id,
            'fee_type' => 'percentage', 'fee_value' => 101, 'is_active' => true,
        ])->assertSessionHasErrors('fee_value');
    }

    public function test_creating_fee_backfills_existing_attributed_bookings_without_commission(): void
    {
        $admin = User::factory()->create();
        $admin->givePermissionTo('menu.agent_fees.edit');
        $agent = AgentProfile::query()->create(['user_id' => User::factory()->create()->id, 'referral_code' => 'BACKFILL-01', 'is_active' => true]);
        $package = TravelPackage::factory()->create();
        $booking = Booking::query()->create([
            'booking_code' => 'BK-BACKFILL-01', 'agent_profile_id' => $agent->id, 'package_id' => $package->id,
            'booking_type' => 'regular', 'full_name' => 'Jamaah Backfill', 'phone' => '628111111111',
            'origin_city' => 'Jakarta', 'passenger_count' => 2, 'agreed_total_amount' => 50000000,
            'agreed_currency' => 'IDR', 'status' => 'registered',
        ]);

        $this->actingAs($admin)->put(route('agent-fees.update'), [
            'agent_profile_id' => $agent->id, 'package_id' => $package->id,
            'fee_type' => 'fixed', 'fee_value' => 500000, 'is_active' => true,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('agent_commissions', [
            'booking_id' => $booking->id,
            'commission_amount' => 1000000,
            'status' => 'pending',
        ]);
    }

    public function test_paid_commission_is_final_and_pending_cannot_skip_approval(): void
    {
        Menu::query()->updateOrCreate(['menu_key' => 'agent_commissions'], [
            'name' => 'Commissions', 'path' => '/dashboard/agent-management/commissions', 'icon' => 'HandCoins',
            'children' => null, 'order' => 3, 'is_active' => true,
        ]);
        MenuPermissionService::ensurePermissionsExist();
        $admin = User::factory()->create();
        $admin->givePermissionTo(['menu.agent_commissions.view', 'menu.agent_commissions.edit']);
        $agent = AgentProfile::query()->create(['user_id' => User::factory()->create()->id, 'referral_code' => 'FLOW-01', 'is_active' => true]);
        $package = TravelPackage::factory()->create();
        $booking = Booking::query()->create([
            'booking_code' => 'BK-FLOW-01', 'agent_profile_id' => $agent->id, 'package_id' => $package->id,
            'booking_type' => 'regular', 'full_name' => 'Jamaah Flow', 'phone' => '628111111111',
            'origin_city' => 'Jakarta', 'passenger_count' => 1, 'agreed_total_amount' => 25000000,
            'agreed_currency' => 'IDR', 'status' => 'registered',
        ]);
        $commission = AgentCommission::query()->create([
            'agent_profile_id' => $agent->id, 'booking_id' => $booking->id, 'package_id' => $package->id,
            'fee_type' => 'fixed', 'fee_value' => 500000, 'base_amount' => 25000000,
            'commission_amount' => 500000, 'currency' => 'IDR', 'status' => 'pending',
        ]);

        $this->actingAs($admin)->get(route('agent-commissions.index'))->assertOk();

        $this->actingAs($admin)->put(route('agent-commissions.update', $commission), ['status' => 'paid'])
            ->assertSessionHasErrors('commission');
        $this->actingAs($admin)->put(route('agent-commissions.update', $commission), ['status' => 'approved'])
            ->assertSessionHasNoErrors();
        $this->actingAs($admin)->put(route('agent-commissions.update', $commission->fresh()), ['status' => 'paid'])
            ->assertSessionHasNoErrors();
        $this->actingAs($admin)->put(route('agent-commissions.update', $commission->fresh()), ['status' => 'pending'])
            ->assertSessionHasErrors('commission');

        $this->assertSame('paid', $commission->fresh()->status);
    }

    public function test_agent_commission_factory_creates_consistent_relations(): void
    {
        $commission = AgentCommission::factory()->create();

        $this->assertSame($commission->agent_profile_id, $commission->booking->agent_profile_id);
        $this->assertSame($commission->package_id, $commission->booking->package_id);
    }
}
