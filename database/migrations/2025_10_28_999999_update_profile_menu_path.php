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
        DB::table('menus')
            ->where('menu_key', 'profile')
            ->update(['path' => '/settings/profile']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('menus')
            ->where('menu_key', 'profile')
            ->update(['path' => '/dashboard/profile']);
    }
};
