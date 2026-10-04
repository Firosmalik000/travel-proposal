<?php

use App\Support\MenuPermissionService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $menu = DB::table('menus')->where('menu_key', 'financial_management')->first();
        if (! $menu) {
            return;
        }

        $children = json_decode((string) $menu->children, true);
        $children = is_array($children) ? $children : [];

        if (! collect($children)->contains(fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'financial_ledger')) {
            $children[] = [
                'name' => 'Akun & Ledger',
                'menu_key' => 'financial_ledger',
                'path' => '/dashboard/financial-management/ledger',
                'icon' => 'BookOpenCheck',
                'order' => 3,
                'is_active' => true,
                'children' => null,
            ];
            usort($children, fn (array $left, array $right): int => (int) ($left['order'] ?? 999) <=> (int) ($right['order'] ?? 999));

            DB::table('menus')->where('id', $menu->id)->update([
                'children' => json_encode($children, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        MenuPermissionService::ensurePermissionsExist();

        $cashflowView = Permission::query()
            ->where('name', MenuPermissionService::permissionName('cashflow', 'view'))
            ->first();
        $ledgerPermissions = collect(['view', 'create', 'edit'])
            ->map(fn (string $action): string => MenuPermissionService::permissionName('financial_ledger', $action))
            ->all();

        if ($cashflowView) {
            Role::query()
                ->whereHas('permissions', fn ($query) => $query->whereKey($cashflowView->id))
                ->each(fn (Role $role) => $role->givePermissionTo($ledgerPermissions));
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $menu = DB::table('menus')->where('menu_key', 'financial_management')->first();
        if ($menu) {
            $children = json_decode((string) $menu->children, true);
            $children = is_array($children) ? array_values(array_filter(
                $children,
                fn (mixed $child): bool => ! is_array($child) || ($child['menu_key'] ?? null) !== 'financial_ledger',
            )) : [];

            DB::table('menus')->where('id', $menu->id)->update([
                'children' => json_encode($children, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
        }

        Permission::query()
            ->where('name', 'like', 'menu.financial_ledger.%')
            ->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
