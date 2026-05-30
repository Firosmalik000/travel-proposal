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

        $role = Role::query()->where('name', 'CS')->first();
        if (! $role) {
            return;
        }

        $permissions = ['view', 'create', 'edit', 'delete', 'export'];
        $permissionNames = collect($permissions)
            ->map(fn (string $action): string => MenuPermissionService::permissionName('cashflow', $action))
            ->all();

        $role->givePermissionTo($permissionNames);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $role = Role::query()->where('name', 'CS')->first();
        if (! $role) {
            return;
        }

        $permissions = ['view', 'create', 'edit', 'delete', 'export'];
        $permissionNames = collect($permissions)
            ->map(fn (string $action): string => MenuPermissionService::permissionName('cashflow', $action))
            ->all();

        $role->revokePermissionTo($permissionNames);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
