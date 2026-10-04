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

        $children = collect(json_decode((string) $menu->children, true) ?: [])
            ->reject(fn (mixed $item): bool => is_array($item) && ($item['menu_key'] ?? null) === 'finance_receivables')
            ->map(function (mixed $item): mixed {
                if (! is_array($item)) {
                    return $item;
                }

                if (($item['menu_key'] ?? null) === 'finance_vendor_hpp') {
                    $item['name'] = 'HPP & Hutang Vendor';
                }

                if ((int) ($item['order'] ?? 0) >= 3) {
                    $item['order'] = (int) $item['order'] + 1;
                }

                return $item;
            })
            ->values()
            ->all();
        $children[] = [
            'name' => 'Piutang Jemaah',
            'menu_key' => 'finance_receivables',
            'path' => '/dashboard/financial-management/receivables',
            'icon' => 'Users',
            'order' => 3,
            'is_active' => true,
            'children' => null,
        ];
        usort($children, fn (array $left, array $right): int => (int) ($left['order'] ?? 999) <=> (int) ($right['order'] ?? 999));

        DB::table('menus')->where('id', $menu->id)->update([
            'children' => json_encode($children, JSON_THROW_ON_ERROR),
            'updated_at' => now(),
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        MenuPermissionService::ensurePermissionsExist();

        foreach (MenuPermissionService::actions() as $action) {
            $target = Permission::findOrCreate(MenuPermissionService::permissionName('finance_receivables', $action), 'web');
            $sourceNames = [
                MenuPermissionService::permissionName('financial_ledger', $action),
                MenuPermissionService::permissionName('finance_accounting', $action),
            ];
            Role::query()
                ->whereHas('permissions', fn ($query) => $query->whereIn('name', $sourceNames))
                ->each(fn (Role $role) => $role->givePermissionTo($target));
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
            $children = collect(json_decode((string) $menu->children, true) ?: [])
                ->reject(fn (mixed $item): bool => is_array($item) && ($item['menu_key'] ?? null) === 'finance_receivables')
                ->map(function (mixed $item): mixed {
                    if (! is_array($item)) {
                        return $item;
                    }

                    if (($item['menu_key'] ?? null) === 'finance_vendor_hpp') {
                        $item['name'] = 'Vendor & HPP Aktual';
                    }

                    if ((int) ($item['order'] ?? 0) >= 4) {
                        $item['order'] = (int) $item['order'] - 1;
                    }

                    return $item;
                })
                ->values()
                ->all();
            DB::table('menus')->where('id', $menu->id)->update([
                'children' => json_encode($children, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Permission::query()->where('name', 'like', 'menu.finance_receivables.%')->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
