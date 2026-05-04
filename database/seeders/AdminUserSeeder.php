<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->assignRoleToUserEmail('operasional@asfartour.co.id', 'Operasional');
        $this->assignRoleToUserEmail('marketing@asfartour.co.id', 'ContentEditor');
        $this->assignRoleToUserEmail('cs@asfartour.co.id', 'CS');
        $this->assignRoleToUserEmail('admin@asfartour.co.id', 'Super Admin');

        $noAccessRole = Role::query()->firstOrCreate(['name' => 'NoAccess', 'guard_name' => 'web']);
        $noAccessRole->syncPermissions([]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    private function assignRoleToUserEmail(string $email, string $roleName): void
    {
        $user = User::query()->where('email', $email)->first();
        if (! $user) {
            return;
        }

        $role = Role::query()->firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        $user->syncRoles([$role->name]);
    }
}
