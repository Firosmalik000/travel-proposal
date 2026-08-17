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

        $masterDataMenu = DB::table('menus')->where('menu_key', 'master_data')->first();

        if (! $masterDataMenu) {
            return;
        }

        $children = json_decode((string) ($masterDataMenu->children ?? '[]'), true);

        if (! is_array($children)) {
            $children = [];
        }

        $removeKeys = ['hotel'];

        $children = collect($children)
            ->reject(function (mixed $child) use ($removeKeys): bool {
                return is_array($child) && in_array(($child['menu_key'] ?? null), $removeKeys, true);
            })
            ->values()
            ->all();

        DB::table('menus')
            ->where('id', $masterDataMenu->id)
            ->update([
                'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }

    public function down(): void {}
};
