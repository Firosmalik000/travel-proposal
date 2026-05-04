<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreRoleRequest;
use App\Http\Requests\Administrator\UpdateRolePermissionsRequest;
use App\Support\MenuPermissionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleManagementController extends Controller
{
    public function index(): Response
    {
        MenuPermissionService::ensurePermissionsExist();
        Role::query()->firstOrCreate(['name' => 'NoAccess', 'guard_name' => 'web']);

        $menus = collect(\App\Models\Menu::getNavigablePaths())
            ->values()
            ->all();

        $roles = Role::query()
            ->with('permissions:id,name')
            ->withCount('users')
            ->orderBy('name')
            ->get(['id', 'name', 'guard_name'])
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => $role->users_count,
                'access' => $this->permissionsToAccessMap($role->permissions->pluck('name')->all()),
            ]);

        return Inertia::render('Dashboard/Administrator/Roles/Index', [
            'roles' => $roles,
            'menus' => $menus,
            'actions' => MenuPermissionService::actions(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        Role::query()->create([
            'name' => $request->validated('name'),
            'guard_name' => 'web',
        ]);

        return back()->with('success', 'Role berhasil ditambahkan.');
    }

    public function updatePermissions(UpdateRolePermissionsRequest $request, Role $role): RedirectResponse
    {
        $access = $request->validated('access');

        $permissionNames = [];
        foreach ($access as $menuKey => $actions) {
            foreach ($actions as $action) {
                $permissionNames[] = MenuPermissionService::permissionName((string) $menuKey, (string) $action);
            }
        }

        MenuPermissionService::ensurePermissionsExist();
        $role->syncPermissions($permissionNames);

        return back()->with('success', 'Permission role berhasil diperbarui.');
    }

    /**
     * @param  array<int, string>  $permissionNames
     * @return array<string, array<int, string>>
     */
    private function permissionsToAccessMap(array $permissionNames): array
    {
        $access = [];

        foreach ($permissionNames as $name) {
            if (! str_starts_with($name, 'menu.')) {
                continue;
            }

            $parts = explode('.', $name, 3);
            if (count($parts) !== 3) {
                continue;
            }

            [, $menuKey, $action] = $parts;
            $access[$menuKey] ??= [];
            if (! in_array($action, $access[$menuKey], true)) {
                $access[$menuKey][] = $action;
            }
        }

        return $access;
    }
}
