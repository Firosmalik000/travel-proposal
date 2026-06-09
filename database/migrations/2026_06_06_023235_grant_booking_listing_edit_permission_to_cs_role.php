<?php

use App\Support\MenuPermissionService;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        MenuPermissionService::ensurePermissionsExist();

        $role = Role::query()
            ->where('name', 'CS')
            ->where('guard_name', 'web')
            ->first();

        if (! $role) {
            return;
        }

        $role->givePermissionTo(
            MenuPermissionService::permissionName('booking_listing', 'edit'),
        );

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $role = Role::query()
            ->where('name', 'CS')
            ->where('guard_name', 'web')
            ->first();

        if (! $role) {
            return;
        }

        $role->revokePermissionTo(
            MenuPermissionService::permissionName('booking_listing', 'edit'),
        );

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
