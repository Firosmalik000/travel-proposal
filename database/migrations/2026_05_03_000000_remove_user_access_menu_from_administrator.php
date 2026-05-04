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

        $administrator = DB::table('menus')->where('menu_key', 'administrator')->first();
        if (! $administrator) {
            return;
        }

        $children = [];
        if (is_string($administrator->children) && $administrator->children !== '') {
            $children = json_decode($administrator->children, true);
        }

        $children = collect(is_array($children) ? $children : [])
            ->reject(fn (array $child): bool => ($child['menu_key'] ?? null) === 'user_access')
            ->values()
            ->all();

        DB::table('menus')
            ->where('menu_key', 'administrator')
            ->update([
                'children' => json_encode($children),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // no-op
    }
};
