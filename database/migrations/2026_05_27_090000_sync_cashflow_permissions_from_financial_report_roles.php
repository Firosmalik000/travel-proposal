<?php

use App\Support\MenuPermissionService;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        MenuPermissionService::ensurePermissionsExist();

        $cashflowActions = ['view', 'create', 'edit', 'delete', 'export'];
        $cashflowPermissions = collect($cashflowActions)
            ->map(fn (string $action): string => MenuPermissionService::permissionName('cashflow', $action))
            ->all();

        $financialReportPermission = Permission::query()
            ->where('name', MenuPermissionService::permissionName('financial_report', 'view'))
            ->first();

        if (! $financialReportPermission) {
            return;
        }

        $roles = Role::query()
            ->whereHas('permissions', fn ($query) => $query->where('id', $financialReportPermission->id))
            ->get();

        foreach ($roles as $role) {
            $role->givePermissionTo($cashflowPermissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $cashflowActions = ['view', 'create', 'edit', 'delete', 'export'];
        $cashflowPermissions = collect($cashflowActions)
            ->map(fn (string $action): string => MenuPermissionService::permissionName('cashflow', $action))
            ->all();

        $financialReportPermission = Permission::query()
            ->where('name', MenuPermissionService::permissionName('financial_report', 'view'))
            ->first();

        if (! $financialReportPermission) {
            return;
        }

        $roles = Role::query()
            ->whereHas('permissions', fn ($query) => $query->where('id', $financialReportPermission->id))
            ->get();

        foreach ($roles as $role) {
            $role->revokePermissionTo($cashflowPermissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
