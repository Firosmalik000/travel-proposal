<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('menus')) {
            $menu = DB::table('menus')->where('menu_key', 'master_data')->first();

            if ($menu) {
                $children = json_decode((string) ($menu->children ?? '[]'), true);
                $children = is_array($children) ? $children : [];
                $children = array_values(array_filter(
                    $children,
                    fn (mixed $child): bool => ! (is_array($child) && ($child['menu_key'] ?? null) === 'master_currency'),
                ));

                DB::table('menus')->where('id', $menu->id)->update([
                    'children' => json_encode($children, JSON_THROW_ON_ERROR),
                    'updated_at' => now(),
                ]);
            }
        }

        if (Schema::hasTable('permissions')) {
            $permissionIds = DB::table('permissions')
                ->where('name', 'like', 'menu.master_currency.%')
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

        Schema::dropIfExists('currencies');
    }

    public function down(): void
    {
        if (! Schema::hasTable('currencies')) {
            Schema::create('currencies', function (Blueprint $table): void {
                $table->id();
                $table->string('code', 3)->unique();
                $table->string('name');
                $table->decimal('conversion_rate', 18, 6)->default(1);
                $table->text('notes')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();
                $table->index(['code', 'is_active']);
            });
        }
    }
};
