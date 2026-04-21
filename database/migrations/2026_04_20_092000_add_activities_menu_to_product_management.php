<?php

use App\Models\Menu;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $menu = Menu::query()->where('menu_key', 'product_management')->first();

        if (! $menu) {
            return;
        }

        $children = collect($menu->children ?? []);

        if ($children->contains(fn (array $child): bool => ($child['menu_key'] ?? null) === 'activity')) {
            return;
        }

        $children->push([
            'name' => 'Activity',
            'menu_key' => 'activity',
            'path' => '/dashboard/product-management/activities',
            'icon' => 'ListChecks',
            'order' => 4,
            'is_active' => true,
            'children' => null,
        ]);

        $menu->update([
            'children' => $children
                ->sortBy('order')
                ->values()
                ->all(),
        ]);
    }

    public function down(): void
    {
        $menu = Menu::query()->where('menu_key', 'product_management')->first();

        if (! $menu) {
            return;
        }

        $menu->update([
            'children' => collect($menu->children ?? [])
                ->reject(fn (array $child): bool => ($child['menu_key'] ?? null) === 'activity')
                ->values()
                ->all(),
        ]);
    }
};
