<?php

use App\Support\MenuPermissionService;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        MenuPermissionService::ensurePermissionsExist();

        $ledgerCreate = Permission::findOrCreate(MenuPermissionService::permissionName('financial_ledger', 'create'), 'web');
        $ledgerEdit = Permission::findOrCreate(MenuPermissionService::permissionName('financial_ledger', 'edit'), 'web');
        $ledgerApprove = Permission::findOrCreate(MenuPermissionService::permissionName('financial_ledger', 'approve'), 'web');
        $reportView = Permission::findOrCreate(MenuPermissionService::permissionName('financial_report', 'view'), 'web');
        $reportApprove = Permission::findOrCreate(MenuPermissionService::permissionName('financial_report', 'approve'), 'web');

        Role::query()
            ->whereDoesntHave('permissions', fn ($query) => $query->whereKey($reportView->id))
            ->each(fn (Role $role) => $role->revokePermissionTo([$ledgerCreate, $ledgerEdit, $ledgerApprove]));

        Role::query()
            ->whereHas('permissions', fn ($query) => $query->whereKey($reportApprove->id))
            ->each(fn (Role $role) => $role->givePermissionTo($ledgerApprove));

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $cashflowView = Permission::query()->where('name', MenuPermissionService::permissionName('cashflow', 'view'))->first();
        $ledgerPermissions = Permission::query()->whereIn('name', [
            MenuPermissionService::permissionName('financial_ledger', 'create'),
            MenuPermissionService::permissionName('financial_ledger', 'edit'),
        ])->get();
        $ledgerApprove = Permission::query()->where('name', MenuPermissionService::permissionName('financial_ledger', 'approve'))->first();

        if ($cashflowView) {
            Role::query()
                ->whereHas('permissions', fn ($query) => $query->whereKey($cashflowView->id))
                ->each(fn (Role $role) => $role->givePermissionTo($ledgerPermissions));
        }

        if ($ledgerApprove) {
            Role::query()->each(fn (Role $role) => $role->revokePermissionTo($ledgerApprove));
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
