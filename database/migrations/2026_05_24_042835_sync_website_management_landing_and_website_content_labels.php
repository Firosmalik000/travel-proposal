<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $menu = DB::table('menus')->where('menu_key', 'website_management')->first();

        if (! $menu) {
            return;
        }

        $children = json_decode((string) ($menu->children ?? '[]'), true);
        if (! is_array($children)) {
            return;
        }

        $updatedChildren = array_map(function (array $child): array {
            $menuKey = (string) ($child['menu_key'] ?? '');

            if ($menuKey === 'landing_page') {
                $child['name'] = 'Website';
                $child['path'] = '/dashboard/website-management/website';
            }

            if ($menuKey === 'content_management') {
                $child['name'] = 'Website Content';
                $child['path'] = '/dashboard/website-management/content';
            }

            if ($menuKey === 'portal_content') {
                $child['name'] = 'Landing HTML';
                $child['path'] = '/dashboard/website-management/landing';
            }

            return $child;
        }, $children);

        DB::table('menus')
            ->where('id', $menu->id)
            ->update(['children' => json_encode($updatedChildren, JSON_UNESCAPED_SLASHES)]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $menu = DB::table('menus')->where('menu_key', 'website_management')->first();

        if (! $menu) {
            return;
        }

        $children = json_decode((string) ($menu->children ?? '[]'), true);
        if (! is_array($children)) {
            return;
        }

        $updatedChildren = array_map(function (array $child): array {
            $menuKey = (string) ($child['menu_key'] ?? '');

            if ($menuKey === 'landing_page') {
                $child['name'] = 'Website';
                $child['path'] = '/dashboard/website-management/landing';
            }

            if ($menuKey === 'content_management') {
                $child['name'] = 'Content';
            }

            if ($menuKey === 'portal_content') {
                $child['name'] = 'Policy & Help';
                $child['path'] = '/dashboard/website-management/portal-content';
            }

            return $child;
        }, $children);

        DB::table('menus')
            ->where('id', $menu->id)
            ->update(['children' => json_encode($updatedChildren, JSON_UNESCAPED_SLASHES)]);
    }
};
