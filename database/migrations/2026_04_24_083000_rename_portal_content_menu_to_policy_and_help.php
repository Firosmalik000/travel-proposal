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

        $menu = DB::table('menus')
            ->where('menu_key', 'website_management')
            ->first();

        if (! $menu) {
            return;
        }

        $children = json_decode($menu->children ?? '[]', true);

        if (! is_array($children)) {
            return;
        }

        $children = collect($children)
            ->map(function (array $child): array {
                if (($child['menu_key'] ?? null) === 'portal_content') {
                    $child['name'] = 'Policy & Help';
                }

                return $child;
            })
            ->values()
            ->all();

        DB::table('menus')
            ->where('menu_key', 'website_management')
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

        $menu = DB::table('menus')
            ->where('menu_key', 'website_management')
            ->first();

        if (! $menu) {
            return;
        }

        $children = json_decode($menu->children ?? '[]', true);

        if (! is_array($children)) {
            return;
        }

        $children = collect($children)
            ->map(function (array $child): array {
                if (($child['menu_key'] ?? null) === 'portal_content') {
                    $child['name'] = 'Portal Content';
                }

                return $child;
            })
            ->values()
            ->all();

        DB::table('menus')
            ->where('menu_key', 'website_management')
            ->update([
                'children' => json_encode($children, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
    }
};
