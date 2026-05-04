<?php

namespace Tests\Feature\Administrator;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImpersonationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_impersonate_and_stop_impersonating(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@asfartour.co.id',
        ]);

        $target = User::factory()->create([
            'email' => 'target@example.com',
        ]);

        $this->actingAs($admin)
            ->post("/admin/administrator/users/{$target->id}/impersonate")
            ->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($target);
        $this->assertSame($admin->id, session('impersonator_id'));

        $this->post('/admin/administrator/impersonation/stop')
            ->assertRedirect('/admin');

        $this->assertAuthenticatedAs($admin);
        $this->assertNull(session('impersonator_id'));
    }

    public function test_cannot_impersonate_super_admin(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@asfartour.co.id',
        ]);

        $superAdmin = User::factory()->create([
            'email' => 'superadmin@example.com',
            'username' => 'admin',
        ]);

        $this->actingAs($admin)
            ->post("/admin/administrator/users/{$superAdmin->id}/impersonate")
            ->assertSessionHasErrors('impersonate');
    }
}
