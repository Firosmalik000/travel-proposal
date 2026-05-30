<?php

use App\Support\MenuPermissionService;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $actions = ['view', 'create', 'edit', 'delete', 'export'];

        foreach ($actions as $action) {
            Permission::query()->firstOrCreate([
                'name' => MenuPermissionService::permissionName('hpp_package', $action),
                'guard_name' => 'web',
            ]);
        }

        $roles = Role::query()->get();
        foreach ($roles as $role) {
            foreach ($actions as $action) {
                $financialPermission = MenuPermissionService::permissionName('financial_report', $action);
                $hppPermission = MenuPermissionService::permissionName('hpp_package', $action);

                if ($role->hasPermissionTo($financialPermission)) {
                    $role->givePermissionTo($hppPermission);
                }
            }
        }
    }

    public function down(): void
    {
        $actions = ['view', 'create', 'edit', 'delete', 'export'];
        $permissionNames = collect($actions)
            ->map(fn (string $action): string => MenuPermissionService::permissionName('hpp_package', $action))
            ->all();

        $roles = Role::query()->get();
        foreach ($roles as $role) {
            $role->revokePermissionTo($permissionNames);
        }
    }
};
