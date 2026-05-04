<?php

namespace Tests\Feature\Administrator;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserPasswordUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_update_other_user_password(): void
    {
        Role::query()->firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        $superAdmin = User::factory()->create([
            'email' => 'admin@asfartour.co.id',
        ]);
        $superAdmin->syncRoles(['Super Admin']);

        $user = User::factory()->create([
            'password' => 'OldPassword123!',
        ]);

        $this->actingAs($superAdmin)
            ->put("/admin/administrator/users/{$user->id}/password", [
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])
            ->assertRedirect();

        $user->refresh();

        $this->assertTrue(Hash::check('NewPassword123!', $user->password));
    }

    public function test_non_super_admin_is_forbidden_from_updating_user_password(): void
    {
        $admin = User::factory()->create();
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->put("/admin/administrator/users/{$user->id}/password", [
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])
            ->assertForbidden();
    }
}
