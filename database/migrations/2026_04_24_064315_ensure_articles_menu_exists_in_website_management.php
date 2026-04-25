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
            $children = [];
        }

        $hasArticlesMenu = collect($children)->contains(
            fn (array $child): bool => ($child['menu_key'] ?? null) === 'articles_management'
        );

        if (! $hasArticlesMenu) {
            $children[] = [
                'name' => 'Articles & News',
                'menu_key' => 'articles_management',
                'path' => '/dashboard/website-management/articles',
                'icon' => 'FileText',
                'order' => 2,
                'is_active' => true,
                'children' => null,
            ];
        }

        $children = collect($children)
            ->map(function (array $child): array {
                if (($child['menu_key'] ?? null) === 'content_management') {
                    $child['order'] = 3;
                }

                if (($child['menu_key'] ?? null) === 'seo_settings') {
                    $child['order'] = 4;
                }

                if (($child['menu_key'] ?? null) === 'branding') {
                    $child['order'] = 5;
                }

                return $child;
            })
            ->sortBy(fn (array $child): int => (int) ($child['order'] ?? 999))
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
            $children = [];
        }

        $children = collect($children)
            ->reject(fn (array $child): bool => ($child['menu_key'] ?? null) === 'articles_management')
            ->map(function (array $child): array {
                if (($child['menu_key'] ?? null) === 'content_management') {
                    $child['order'] = 2;
                }

                if (($child['menu_key'] ?? null) === 'seo_settings') {
                    $child['order'] = 3;
                }

                if (($child['menu_key'] ?? null) === 'branding') {
                    $child['order'] = 4;
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
