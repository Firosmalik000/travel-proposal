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

        $financialMenu = DB::table('menus')->where('menu_key', 'financial_management')->first();

        if ($financialMenu) {
            DB::table('menus')->where('id', $financialMenu->id)->update([
                'name' => 'Keuangan',
                'path' => '/dashboard/financial-management/overview',
                'children' => json_encode($this->financialChildren(), JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
        }

        $this->moveHppEstimateToProductManagement();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        MenuPermissionService::ensurePermissionsExist();

        $permissionSources = [
            'finance_overview' => ['financial_report', 'financial_ledger', 'cashflow'],
            'finance_transactions' => ['financial_ledger', 'cashflow'],
            'finance_vendor_hpp' => ['financial_ledger'],
            'finance_accounting' => ['financial_ledger'],
            'finance_controls' => ['financial_report'],
            'finance_reports' => ['financial_report'],
            'finance_master' => ['financial_ledger'],
        ];

        foreach ($permissionSources as $targetMenuKey => $sourceMenuKeys) {
            foreach (MenuPermissionService::actions() as $action) {
                $sourceNames = collect($sourceMenuKeys)
                    ->map(fn (string $menuKey): string => MenuPermissionService::permissionName($menuKey, $action))
                    ->all();
                $targetPermission = Permission::findOrCreate(
                    MenuPermissionService::permissionName($targetMenuKey, $action),
                    'web',
                );

                Role::query()
                    ->whereHas('permissions', fn ($query) => $query->whereIn('name', $sourceNames))
                    ->each(fn (Role $role) => $role->givePermissionTo($targetPermission));
            }
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $financialMenu = DB::table('menus')->where('menu_key', 'financial_management')->first();

        if ($financialMenu) {
            DB::table('menus')->where('id', $financialMenu->id)->update([
                'name' => 'Financial Management',
                'path' => '/dashboard/financial-management',
                'children' => json_encode($this->legacyFinancialChildren(), JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
        }

        $this->removeHppEstimateFromProductManagement();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Permission::query()
            ->where(function ($query): void {
                foreach (array_keys($this->permissionSources()) as $menuKey) {
                    $query->orWhere('name', 'like', 'menu.'.$menuKey.'.%');
                }
            })
            ->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /** @return array<int, array<string, mixed>> */
    private function financialChildren(): array
    {
        return [
            $this->menuItem('Ringkasan', 'finance_overview', '/dashboard/financial-management/overview', 'LayoutGrid', 1),
            $this->menuItem('Transaksi', 'finance_transactions', '/dashboard/financial-management/transactions', 'Wallet', 2),
            $this->menuItem('Vendor & HPP Aktual', 'finance_vendor_hpp', '/dashboard/financial-management/vendor-hpp', 'HandCoins', 3),
            $this->menuItem('Pembukuan', 'finance_accounting', '/dashboard/financial-management/accounting', 'BookOpen', 4),
            $this->menuItem('Rekonsiliasi & Periode', 'finance_controls', '/dashboard/financial-management/controls', 'CalendarCheck', 5),
            $this->menuItem('Laporan', 'finance_reports', '/dashboard/financial-management/reports', 'FileText', 6),
            $this->menuItem('Master Keuangan', 'finance_master', '/dashboard/financial-management/master', 'Database', 7),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function legacyFinancialChildren(): array
    {
        return [
            $this->menuItem('Financial Report', 'financial_report', '/dashboard/financial-management/financial-report', 'FileText', 1),
            $this->menuItem('Cashflow', 'cashflow', '/dashboard/financial-management/cashflow', 'Wallet', 2),
            $this->menuItem('HPP Package', 'hpp_package', '/dashboard/financial-management/hpp-package', 'Calculator', 3),
            $this->menuItem('Akun & Ledger', 'financial_ledger', '/dashboard/financial-management/ledger', 'BookOpenCheck', 4),
        ];
    }

    /** @return array<string, mixed> */
    private function menuItem(string $name, string $menuKey, string $path, string $icon, int $order): array
    {
        return [
            'name' => $name,
            'menu_key' => $menuKey,
            'path' => $path,
            'icon' => $icon,
            'order' => $order,
            'is_active' => true,
            'children' => null,
        ];
    }

    private function moveHppEstimateToProductManagement(): void
    {
        $productMenu = DB::table('menus')->where('menu_key', 'product_management')->first();

        if ($productMenu) {
            $children = json_decode((string) $productMenu->children, true);
            $children = collect(is_array($children) ? $children : [])
                ->reject(fn (mixed $item): bool => is_array($item) && ($item['menu_key'] ?? null) === 'hpp_package')
                ->values()
                ->all();
            $children[] = $this->menuItem(
                'Kalkulasi Harga & HPP Estimasi',
                'hpp_package',
                '/dashboard/product-management/hpp-estimate',
                'BadgeDollarSign',
                5,
            );
            usort($children, fn (array $left, array $right): int => (int) ($left['order'] ?? 999) <=> (int) ($right['order'] ?? 999));

            DB::table('menus')->where('id', $productMenu->id)->update([
                'children' => json_encode($children, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);

            return;
        }

        $websiteMenu = DB::table('menus')->where('menu_key', 'website_management')->first();

        if (! $websiteMenu) {
            return;
        }

        $children = json_decode((string) $websiteMenu->children, true);
        $children = is_array($children) ? $children : [];

        foreach ($children as &$child) {
            if (($child['menu_key'] ?? null) !== 'product_management') {
                continue;
            }

            $productChildren = collect($child['children'] ?? [])
                ->reject(fn (mixed $item): bool => is_array($item) && ($item['menu_key'] ?? null) === 'hpp_package')
                ->values()
                ->all();
            $productChildren[] = $this->menuItem(
                'Kalkulasi Harga & HPP Estimasi',
                'hpp_package',
                '/dashboard/product-management/hpp-estimate',
                'BadgeDollarSign',
                5,
            );
            usort($productChildren, fn (array $left, array $right): int => (int) ($left['order'] ?? 999) <=> (int) ($right['order'] ?? 999));
            $child['children'] = $productChildren;
        }
        unset($child);

        DB::table('menus')->where('id', $websiteMenu->id)->update([
            'children' => json_encode($children, JSON_THROW_ON_ERROR),
            'updated_at' => now(),
        ]);
    }

    private function removeHppEstimateFromProductManagement(): void
    {
        $productMenu = DB::table('menus')->where('menu_key', 'product_management')->first();

        if ($productMenu) {
            $children = json_decode((string) $productMenu->children, true);
            $children = collect(is_array($children) ? $children : [])
                ->reject(fn (mixed $item): bool => is_array($item) && ($item['menu_key'] ?? null) === 'hpp_package')
                ->values()
                ->all();

            DB::table('menus')->where('id', $productMenu->id)->update([
                'children' => json_encode($children, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);

            return;
        }

        $websiteMenu = DB::table('menus')->where('menu_key', 'website_management')->first();

        if (! $websiteMenu) {
            return;
        }

        $children = json_decode((string) $websiteMenu->children, true);
        $children = is_array($children) ? $children : [];

        foreach ($children as &$child) {
            if (($child['menu_key'] ?? null) === 'product_management') {
                $child['children'] = collect($child['children'] ?? [])
                    ->reject(fn (mixed $item): bool => is_array($item) && ($item['menu_key'] ?? null) === 'hpp_package')
                    ->values()
                    ->all();
            }
        }
        unset($child);

        DB::table('menus')->where('id', $websiteMenu->id)->update([
            'children' => json_encode($children, JSON_THROW_ON_ERROR),
            'updated_at' => now(),
        ]);
    }

    /** @return array<string, array<int, string>> */
    private function permissionSources(): array
    {
        return [
            'finance_overview' => [],
            'finance_transactions' => [],
            'finance_vendor_hpp' => [],
            'finance_accounting' => [],
            'finance_controls' => [],
            'finance_reports' => [],
            'finance_master' => [],
        ];
    }
};
