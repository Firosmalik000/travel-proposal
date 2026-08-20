<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->renameMenu('Data Peserta');
    }

    public function down(): void
    {
        $this->renameMenu('Data Customer');
    }

    private function renameMenu(string $name): void
    {
        if (! Schema::hasTable('menus')) {
            return;
        }

        $menu = DB::table('menus')->where('menu_key', 'booking_management')->first();

        if (! $menu) {
            return;
        }

        $children = json_decode((string) ($menu->children ?? '[]'), true);

        if (! is_array($children)) {
            return;
        }

        $children = collect($children)
            ->map(function (mixed $child) use ($name): mixed {
                if (is_array($child) && ($child['menu_key'] ?? null) === 'booking_customer_data') {
                    $child['name'] = $name;
                }

                return $child;
            })
            ->all();

        DB::table('menus')
            ->where('id', $menu->id)
            ->update([
                'children' => json_encode($children, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
    }
};
