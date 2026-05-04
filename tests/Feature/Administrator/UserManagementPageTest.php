<?php

namespace Tests\Feature\Administrator;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserManagementPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_open_user_management_page(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@asfartour.co.id',
        ]);

        $this->actingAs($user)
            ->get('/admin/administrator/users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Administrator/Users/Index')
                ->has('users')
                ->has('roles')
            );
    }
}
