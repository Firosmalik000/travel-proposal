<?php

namespace App\Support;

use App\Models\Menu;
use Illuminate\Support\Collection;
use Spatie\Permission\Models\Permission;

class MenuPermissionService
{
    /**
     * @return array<int, string>
     */
    public static function actions(): array
    {
        return ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'];
    }

    public static function permissionName(string $menuKey, string $action): string
    {
        return 'menu.'.$menuKey.'.'.$action;
    }

    /**
     * @return Collection<int, string>
     */
    public static function navigableMenuKeys(): Collection
    {
        return collect(Menu::getNavigablePaths())
            ->pluck('menu_key')
            ->filter(fn (?string $key): bool => is_string($key) && $key !== '')
            ->unique()
            ->values();
    }

    public static function ensurePermissionsExist(): void
    {
        $menuKeys = self::navigableMenuKeys();
        $actions = self::actions();

        foreach ($menuKeys as $menuKey) {
            foreach ($actions as $action) {
                Permission::query()->firstOrCreate([
                    'name' => self::permissionName($menuKey, $action),
                    'guard_name' => 'web',
                ]);
            }
        }
    }
}
