<?php

use App\Models\Menu;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @var array<int, string>
     */
    private array $actions = ['view', 'create', 'edit', 'delete', 'import', 'export', 'approve', 'reject'];

    public function up(): void
    {
        if (! Schema::hasTable('menus') || ! Schema::hasTable('permissions')) {
            return;
        }

        $menuKeys = collect(Menu::getNavigablePaths())
            ->pluck('menu_key')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $now = now();
        $names = [];

        foreach ($menuKeys as $menuKey) {
            foreach ($this->actions as $action) {
                $names[] = 'menu.'.$menuKey.'.'.$action;
            }
        }

        $existing = DB::table('permissions')
            ->whereIn('name', $names)
            ->pluck('name')
            ->all();

        $existingLookup = array_fill_keys($existing, true);

        $insert = [];
        foreach ($names as $name) {
            if (isset($existingLookup[$name])) {
                continue;
            }

            $insert[] = [
                'name' => $name,
                'guard_name' => 'web',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($insert === []) {
            return;
        }

        DB::table('permissions')->insert($insert);
    }

    public function down(): void
    {
        if (! Schema::hasTable('permissions')) {
            return;
        }

        DB::table('permissions')
            ->where('guard_name', 'web')
            ->where('name', 'like', 'menu.%')
            ->delete();
    }
};
