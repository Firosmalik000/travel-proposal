<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $menu = DB::table('menus')
            ->select(['id', 'children'])
            ->where('menu_key', 'website_management')
            ->first();

        if (! $menu) {
            return;
        }

        $children = json_decode($menu->children ?? '[]', true);
        $children = is_array($children) ? $children : [];

        $alreadyExists = collect($children)
            ->pluck('menu_key')
            ->contains('gallery_management');

        if ($alreadyExists) {
            return;
        }

        $galleryMenu = [
            'name' => 'Gallery',
            'menu_key' => 'gallery_management',
            'path' => '/dashboard/website-management/gallery',
            'icon' => 'Images',
            'order' => 5,
            'is_active' => true,
            'children' => null,
        ];

        $contentIndex = collect($children)
            ->search(fn ($child) => ($child['menu_key'] ?? null) === 'content_management');

        if (is_int($contentIndex)) {
            $children = array_values($children);

            array_splice($children, $contentIndex + 1, 0, [$galleryMenu]);

            foreach ($children as $index => $child) {
                if (! is_array($child)) {
                    continue;
                }

                if (($child['menu_key'] ?? null) === 'seo_settings' && isset($child['order']) && is_numeric($child['order'])) {
                    $children[$index]['order'] = 6;
                }

                if (($child['menu_key'] ?? null) === 'branding' && isset($child['order']) && is_numeric($child['order'])) {
                    $children[$index]['order'] = 7;
                }
            }
        } else {
            $children[] = $galleryMenu;
        }

        DB::table('menus')
            ->where('id', $menu->id)
            ->update(['children' => json_encode($children)]);
    }

    public function down(): void
    {
        $menu = DB::table('menus')
            ->select(['id', 'children'])
            ->where('menu_key', 'website_management')
            ->first();

        if (! $menu) {
            return;
        }

        $children = json_decode($menu->children ?? '[]', true);
        $children = is_array($children) ? $children : [];

        $children = collect($children)
            ->reject(fn ($child) => ($child['menu_key'] ?? null) === 'gallery_management')
            ->values()
            ->all();

        DB::table('menus')
            ->where('id', $menu->id)
            ->update(['children' => json_encode($children)]);
    }
};
