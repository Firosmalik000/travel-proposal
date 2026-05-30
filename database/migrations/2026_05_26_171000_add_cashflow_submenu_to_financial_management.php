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

        $hasCashflow = collect($children)->contains(
            fn (mixed $child): bool => is_array($child) && ($child['menu_key'] ?? null) === 'cashflow',
        );

        if ($hasCashflow) {
            return;
        }

        $children[] = [
            'name' => 'Cashflow',
            'menu_key' => 'cashflow',
            'path' => '/dashboard/financial-management/cashflow',
            'icon' => 'Wallet',
            'order' => 2,
            'is_active' => true,
            'children' => null,
        ];

        usort($children, function (array $a, array $b): int {
            return (int) ($a['order'] ?? 999) <=> (int) ($b['order'] ?? 999);
        });

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

        $children = array_values(array_filter($children, function (mixed $child): bool {
            return ! (is_array($child) && ($child['menu_key'] ?? null) === 'cashflow');
        }));

        DB::table('menus')
            ->where('id', $menu->id)
            ->update([
                'children' => json_encode($children, JSON_THROW_ON_ERROR),
                'updated_at' => now(),
            ]);
    }
};
