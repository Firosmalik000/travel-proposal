<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $administrator = DB::table('menus')->where('menu_key', 'administrator')->first();
        if (! $administrator) {
            return;
        }

        $children = [];
        if (is_string($administrator->children) && $administrator->children !== '') {
            $children = json_decode($administrator->children, true, flags: JSON_THROW_ON_ERROR);
        }

        $children = is_array($children) ? $children : [];

        $desired = [
            [
                'name' => 'User Management',
                'menu_key' => 'user_management',
                'path' => '/dashboard/administrator/users',
                'icon' => 'Users',
                'order' => 2,
                'is_active' => true,
                'children' => null,
            ],
            [
                'name' => 'Role Management',
                'menu_key' => 'role_management',
                'path' => '/dashboard/administrator/roles',
                'icon' => 'Shield',
                'order' => 3,
                'is_active' => true,
                'children' => null,
            ],
        ];

        foreach ($desired as $item) {
            $exists = collect($children)->contains(fn (array $child): bool => ($child['menu_key'] ?? null) === $item['menu_key']);
            if ($exists) {
                continue;
            }

            $children[] = $item;
        }

        $children = collect($children)
            ->map(fn (array $child): array => [
                ...$child,
                'children' => $child['children'] ?? null,
                'order' => $child['order'] ?? 999,
                'is_active' => $child['is_active'] ?? true,
            ])
            ->sortBy('order')
            ->values()
            ->all();

        DB::table('menus')
            ->where('menu_key', 'administrator')
            ->update([
                'children' => json_encode($children, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $administrator = DB::table('menus')->where('menu_key', 'administrator')->first();
        if (! $administrator) {
            return;
        }

        $children = [];
        if (is_string($administrator->children) && $administrator->children !== '') {
            $children = json_decode($administrator->children, true);
        }

        $children = collect(is_array($children) ? $children : [])
            ->reject(fn (array $child): bool => in_array($child['menu_key'] ?? null, ['user_management', 'role_management'], true))
            ->values()
            ->all();

        DB::table('menus')
            ->where('menu_key', 'administrator')
            ->update([
                'children' => json_encode($children),
                'updated_at' => now(),
            ]);
    }
};
