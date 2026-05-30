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

        $menu = DB::table('menus')->where('menu_key', 'financial_management')->first();
        if (! $menu) {
            return;
        }

        $children = json_decode((string) $menu->children, true);
        if (! is_array($children)) {
            $children = [];
        }

        $exists = collect($children)->contains(
            fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'hpp_package',
        );

        if ($exists) {
            return;
        }

        $children[] = [
            'name' => 'Cost Calculation / HPP Package',
            'menu_key' => 'hpp_package',
            'path' => '/dashboard/financial-management/hpp-package',
            'icon' => 'Calculator',
            'order' => 3,
            'is_active' => true,
            'children' => null,
        ];

        usort($children, fn (array $a, array $b): int => (int) ($a['order'] ?? 999) <=> (int) ($b['order'] ?? 999));

        DB::table('menus')
            ->where('id', $menu->id)
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

        $menu = DB::table('menus')->where('menu_key', 'financial_management')->first();
        if (! $menu) {
            return;
        }

        $children = json_decode((string) $menu->children, true);
        if (! is_array($children)) {
            return;
        }

        $children = array_values(array_filter($children, fn (mixed $child): bool => ! (is_array($child) && ($child['menu_key'] ?? null) === 'hpp_package')));

        DB::table('menus')
            ->where('id', $menu->id)
            ->update([
                'children' => json_encode($children, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
    }
};
