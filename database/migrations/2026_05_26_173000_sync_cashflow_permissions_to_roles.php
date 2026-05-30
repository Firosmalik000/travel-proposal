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

        $allActions = MenuPermissionService::actions();
        $cashflowPermissionNames = collect($allActions)
            ->map(fn (string $action): string => MenuPermissionService::permissionName('cashflow', $action))
            ->all();

        $rolesWithFullCashflowAccess = ['Super Admin', 'Operasional'];

        foreach ($rolesWithFullCashflowAccess as $roleName) {
            $role = Role::query()->where('name', $roleName)->first();
            if (! $role) {
                continue;
            }

            $role->givePermissionTo($cashflowPermissionNames);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $allActions = MenuPermissionService::actions();
        $cashflowPermissionNames = collect($allActions)
            ->map(fn (string $action): string => MenuPermissionService::permissionName('cashflow', $action))
            ->all();

        $rolesWithFullCashflowAccess = ['Super Admin', 'Operasional'];
        foreach ($rolesWithFullCashflowAccess as $roleName) {
            $role = Role::query()->where('name', $roleName)->first();
            if (! $role) {
                continue;
            }

            $role->revokePermissionTo($cashflowPermissionNames);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
