<?php

use App\Support\MenuPermissionService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $menu = DB::table('menus')->where('menu_key', 'booking_management')->first();

        if (! $menu) {
            return;
        }

        $children = json_decode((string) ($menu->children ?? '[]'), true);
        if (! is_array($children)) {
            $children = [];
        }

        $children = collect($children)
            ->reject(fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'booking_customer_data')
            ->map(function (mixed $child): array {
                if (! is_array($child)) {
                    return [];
                }

                $menuKey = (string) ($child['menu_key'] ?? '');

                if ($menuKey === 'booking_custom_requests') {
                    $child['order'] = 4;
                }

                if ($menuKey === 'booking_hotel_assignment') {
                    $child['order'] = 5;
                }

                return $child;
            })
            ->filter()
            ->push([
                'name' => 'Data Customer',
                'menu_key' => 'booking_customer_data',
                'path' => '/dashboard/booking-management/customer-data',
                'icon' => 'Users',
                'order' => 3,
                'is_active' => true,
                'children' => null,
            ])
            ->sortBy(fn (array $child): int => (int) ($child['order'] ?? 0))
            ->values()
            ->all();

        DB::table('menus')
            ->where('id', $menu->id)
            ->update([
                'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);

        MenuPermissionService::ensurePermissionsExist();
        $this->grantViewPermissionToRole('Operasional');
        $this->grantViewPermissionToRole('CS');
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $menu = DB::table('menus')->where('menu_key', 'booking_management')->first();

        if ($menu) {
            $children = json_decode((string) ($menu->children ?? '[]'), true);
            if (! is_array($children)) {
                $children = [];
            }

            $children = collect($children)
                ->reject(fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'booking_customer_data')
                ->map(function (mixed $child): array {
                    if (! is_array($child)) {
                        return [];
                    }

                    $menuKey = (string) ($child['menu_key'] ?? '');

                    if ($menuKey === 'booking_custom_requests') {
                        $child['order'] = 3;
                    }

                    if ($menuKey === 'booking_hotel_assignment') {
                        $child['order'] = 4;
                    }

                    return $child;
                })
                ->filter()
                ->sortBy(fn (array $child): int => (int) ($child['order'] ?? 0))
                ->values()
                ->all();

            DB::table('menus')
                ->where('id', $menu->id)
                ->update([
                    'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                    'updated_at' => now(),
                ]);
        }

        $role = Role::query()
            ->where('name', 'CS')
            ->where('guard_name', 'web')
            ->first();

        if ($role) {
            $role->revokePermissionTo(
                MenuPermissionService::permissionName('booking_customer_data', 'view'),
            );
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    private function grantViewPermissionToRole(string $roleName): void
    {
        $role = Role::query()
            ->where('name', $roleName)
            ->where('guard_name', 'web')
            ->first();

        if (! $role) {
            return;
        }

        $role->givePermissionTo(
            MenuPermissionService::permissionName('booking_customer_data', 'view'),
        );
    }
};
