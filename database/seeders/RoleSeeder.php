<?php

namespace Database\Seeders;

use App\Support\MenuPermissionService;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        MenuPermissionService::ensurePermissionsExist();

        $this->ensureRoleAllAccess('Super Admin');
        $this->ensureRoleAllAccess('Operasional');

        $this->ensureRoleWithMenuAccess(
            roleName: 'ContentEditor',
            access: [
                'dashboard' => ['view'],
                'landing_page' => ['view', 'edit'],
                'portal_content' => ['view', 'edit'],
                'content_management' => ['view', 'create', 'edit'],
                'gallery_management' => ['view', 'create', 'edit'],
                'articles_management' => ['view', 'create', 'edit', 'delete'],
            ],
        );

        $this->ensureRoleWithMenuAccess(
            roleName: 'CS',
            access: [
                'dashboard' => ['view'],
                'booking_register' => ['view', 'approve', 'reject', 'export'],
                'booking_listing' => ['view', 'export'],
                'booking_custom_requests' => ['view', 'approve', 'reject'],
            ],
        );

        $noAccessRole = Role::query()->firstOrCreate(['name' => 'NoAccess', 'guard_name' => 'web']);
        $noAccessRole->syncPermissions([]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    private function ensureRoleAllAccess(string $roleName): void
    {
        $role = Role::query()->firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

        $permissionNames = [];
        $menuKeys = MenuPermissionService::navigableMenuKeys()->all();
        $actions = MenuPermissionService::actions();

        foreach ($menuKeys as $menuKey) {
            foreach ($actions as $action) {
                $permissionNames[] = MenuPermissionService::permissionName((string) $menuKey, (string) $action);
            }
        }

        $role->syncPermissions($permissionNames);
    }

    /**
     * @param  array<string, array<int, string>>  $access
     */
    private function ensureRoleWithMenuAccess(string $roleName, array $access): void
    {
        $role = Role::query()->firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

        $permissionNames = [];
        foreach ($access as $menuKey => $actions) {
            foreach ($actions as $action) {
                $permissionNames[] = MenuPermissionService::permissionName((string) $menuKey, (string) $action);
            }
        }

        $role->syncPermissions($permissionNames);
    }
}
