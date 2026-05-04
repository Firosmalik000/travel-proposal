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

        $now = now();

        $existingMenu = DB::table('menus')
            ->where('menu_key', 'financial_management')
            ->first();

        $payload = [
            'name' => 'Financial Management',
            'menu_key' => 'financial_management',
            'path' => '/dashboard/financial-management',
            'icon' => 'Wallet',
            'children' => json_encode([
                [
                    'name' => 'Financial Report',
                    'menu_key' => 'financial_report',
                    'path' => '/dashboard/financial-management/financial-report',
                    'icon' => 'FileText',
                    'order' => 1,
                    'is_active' => true,
                    'children' => null,
                ],
            ], JSON_THROW_ON_ERROR),
            'order' => 6,
            'is_active' => true,
            'updated_at' => $now,
        ];

        if ($existingMenu) {
            DB::table('menus')
                ->where('menu_key', 'financial_management')
                ->update($payload);

            return;
        }

        DB::table('menus')->insert([
            ...$payload,
            'created_at' => $now,
        ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        DB::table('menus')
            ->where('menu_key', 'financial_management')
            ->delete();
    }
};
