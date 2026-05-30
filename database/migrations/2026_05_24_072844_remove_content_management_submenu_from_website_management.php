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

        $children = array_values(array_filter(
            $children,
            fn (array $child): bool => (string) ($child['menu_key'] ?? '') !== 'content_management',
        ));

        DB::table('menus')->where('id', $menu->id)->update([
            'children' => json_encode($children, JSON_UNESCAPED_SLASHES),
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
            $children = [];
        }

        $exists = collect($children)
            ->contains(fn (array $child): bool => (string) ($child['menu_key'] ?? '') === 'content_management');

        if (! $exists) {
            $children[] = [
                'name' => 'Website Content',
                'menu_key' => 'content_management',
                'path' => '/dashboard/website-management/content',
                'icon' => 'ClipboardList',
                'order' => 4,
                'is_active' => true,
                'children' => null,
            ];
        }

        DB::table('menus')->where('id', $menu->id)->update([
            'children' => json_encode(array_values($children), JSON_UNESCAPED_SLASHES),
        ]);
    }
};
