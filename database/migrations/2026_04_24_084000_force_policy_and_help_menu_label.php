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

        DB::table('menus')
            ->where('menu_key', 'website_management')
            ->update([
                'children' => DB::raw("REPLACE(children, '\"name\": \"Portal Content\"', '\"name\": \"Policy & Help\"')"),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        DB::table('menus')
            ->where('menu_key', 'website_management')
            ->update([
                'children' => DB::raw("REPLACE(children, '\"name\": \"Policy & Help\"', '\"name\": \"Portal Content\"')"),
                'updated_at' => now(),
            ]);
    }
};
