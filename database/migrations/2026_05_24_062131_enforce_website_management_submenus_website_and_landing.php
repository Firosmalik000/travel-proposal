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
            $children = [];
        }

        $byKey = [];
        foreach ($children as $child) {
            if (is_array($child) && isset($child['menu_key'])) {
                $byKey[(string) $child['menu_key']] = $child;
            }
        }

        $website = $byKey['landing_page'] ?? [];
        $website['name'] = 'Website';
        $website['menu_key'] = 'landing_page';
        $website['path'] = '/dashboard/website-management/website';
        $website['icon'] = $website['icon'] ?? 'FileText';
        $website['order'] = 1;
        $website['is_active'] = true;
        $website['children'] = null;

        $landing = $byKey['portal_content'] ?? [];
        $landing['name'] = 'Landing';
        $landing['menu_key'] = 'portal_content';
        $landing['path'] = '/dashboard/website-management/landing';
        $landing['icon'] = $landing['icon'] ?? 'Folder';
        $landing['order'] = 3;
        $landing['is_active'] = true;
        $landing['children'] = null;

        $byKey['landing_page'] = $website;
        $byKey['portal_content'] = $landing;
        unset($byKey['content_management']);

        DB::table('menus')->where('id', $menu->id)->update([
            'children' => json_encode(array_values($byKey), JSON_UNESCAPED_SLASHES),
        ]);
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

        $children = array_map(function (array $child): array {
            $menuKey = (string) ($child['menu_key'] ?? '');

            if ($menuKey === 'landing_page') {
                $child['name'] = 'Landing Page';
                $child['path'] = '/dashboard/website-management/landing';
            }

            if ($menuKey === 'portal_content') {
                $child['name'] = 'Policy & Help';
                $child['path'] = '/dashboard/website-management/portal-content';
            }

            return $child;
        }, $children);

        DB::table('menus')->where('id', $menu->id)->update([
            'children' => json_encode($children, JSON_UNESCAPED_SLASHES),
        ]);
    }
};
