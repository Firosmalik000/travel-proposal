<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityAuditTrailTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_logs_create_activity_on_admin_dashboard_action(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('activities.store'), [
                'name' => 'Handling Jamaah',
                'description' => 'Aktivitas handling jamaah.',
                'sort_order' => 1,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'event_type' => 'create',
            'route_name' => 'activities.store',
        ]);
    }

    public function test_it_does_not_log_view_action_on_admin_dashboard_page(): void
    {
        $user = User::factory()->create([
            'username' => 'admin',
        ]);

        $this->actingAs($user)
            ->get('/admin')
            ->assertOk();

        $this->assertDatabaseMissing('activity_logs', [
            'user_id' => $user->id,
            'event_type' => 'activity',
            'route_name' => 'dashboard',
        ]);
    }

    public function test_it_fills_created_by_and_updated_by_for_mutated_data(): void
    {
        $user = User::factory()->create([
            'username' => 'admin',
        ]);

        $this->actingAs($user)
            ->post(route('activities.store'), [
                'name' => 'Handling Manasik',
                'description' => 'Aktivitas manasik.',
                'sort_order' => 3,
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('activities', [
            'code' => 'ACT-HANDLING-MANASIK',
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }
}
