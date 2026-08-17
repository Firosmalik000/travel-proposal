<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('menus')) {
            $masterDataMenu = DB::table('menus')->where('menu_key', 'master_data')->first();

            if ($masterDataMenu) {
                $children = json_decode((string) ($masterDataMenu->children ?? '[]'), true);
                $children = is_array($children) ? $children : [];
                $children = array_values(array_filter(
                    $children,
                    fn (mixed $child): bool => ! (is_array($child) && ($child['menu_key'] ?? null) === 'hotel'),
                ));

                DB::table('menus')->where('id', $masterDataMenu->id)->update([
                    'children' => json_encode($children, JSON_THROW_ON_ERROR),
                    'updated_at' => now(),
                ]);
            }
        }

        if (Schema::hasTable('permissions')) {
            $permissionIds = DB::table('permissions')
                ->where('name', 'like', 'menu.hotel.%')
                ->pluck('id');

            if ($permissionIds->isNotEmpty()) {
                foreach (['role_has_permissions', 'model_has_permissions'] as $pivotTable) {
                    if (Schema::hasTable($pivotTable)) {
                        DB::table($pivotTable)->whereIn('permission_id', $permissionIds)->delete();
                    }
                }

                DB::table('permissions')->whereIn('id', $permissionIds)->delete();
            }
        }
    }

    public function down(): void {}
};
