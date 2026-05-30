<?php

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

        $activityMenu = DB::table('menus')
            ->where('menu_key', 'activity_management')
            ->first();

        $activityLogChild = [
            'name' => 'Activity Log',
            'menu_key' => 'activity_log',
            'path' => '/dashboard/activity/logs',
            'icon' => 'History',
            'order' => 1,
            'is_active' => true,
            'children' => null,
        ];

        if ($activityMenu) {
            $children = json_decode((string) ($activityMenu->children ?? '[]'), true);
            if (! is_array($children)) {
                $children = [];
            }

            $alreadyExists = collect($children)->contains(function (mixed $child): bool {
                return is_array($child) && ($child['menu_key'] ?? null) === 'activity_log';
            });

            if (! $alreadyExists) {
                $children[] = $activityLogChild;

                DB::table('menus')
                    ->where('id', $activityMenu->id)
                    ->update([
                        'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                        'updated_at' => now(),
                    ]);
            }

            $this->syncActivityLogPermissions();

            return;
        }

        $order = (int) DB::table('menus')->max('order');

        DB::table('menus')->insert([
            'name' => 'Activity',
            'menu_key' => 'activity_management',
            'path' => '/dashboard/activity',
            'icon' => 'History',
            'children' => json_encode([$activityLogChild], JSON_UNESCAPED_UNICODE),
            'order' => max(1, $order + 1),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->syncActivityLogPermissions();
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $activityMenu = DB::table('menus')
            ->where('menu_key', 'activity_management')
            ->first();

        if (! $activityMenu) {
            return;
        }

        $children = json_decode((string) ($activityMenu->children ?? '[]'), true);
        if (! is_array($children)) {
            $children = [];
        }

        $filteredChildren = collect($children)
            ->reject(function (mixed $child): bool {
                return is_array($child) && ($child['menu_key'] ?? null) === 'activity_log';
            })
            ->values()
            ->all();

        if (empty($filteredChildren)) {
            DB::table('menus')
                ->where('id', $activityMenu->id)
                ->delete();

            return;
        }

        DB::table('menus')
            ->where('id', $activityMenu->id)
            ->update([
                'children' => json_encode($filteredChildren, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }

    private function syncActivityLogPermissions(): void
    {
        if (! Schema::hasTable('permissions')) {
            return;
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $actions = ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'];
        $permissionNames = collect($actions)
            ->map(function (string $action): string {
                $permission = Permission::query()->firstOrCreate([
                    'name' => 'menu.activity_log.'.$action,
                    'guard_name' => 'web',
                ]);

                return (string) $permission->name;
            })
            ->all();

        $roles = Role::query()
            ->whereIn('name', ['Super Admin', 'Operasional'])
            ->get();

        foreach ($roles as $role) {
            $role->givePermissionTo($permissionNames);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
