<?php

use App\Models\Menu;
use App\Support\MenuPermissionService;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Menu::query()->where('order', '>=', 8)->increment('order');

        Menu::query()->updateOrCreate(
            ['menu_key' => 'agent_management'],
            [
                'name' => 'Agent Management',
                'path' => '/dashboard/agent-management',
                'icon' => 'Handshake',
                'children' => [
                    ['name' => 'Agents', 'menu_key' => 'agents', 'path' => '/dashboard/agent-management/agents', 'icon' => 'Users', 'order' => 1, 'is_active' => true, 'children' => null],
                    ['name' => 'Fee per Package', 'menu_key' => 'agent_fees', 'path' => '/dashboard/agent-management/fees', 'icon' => 'BadgeDollarSign', 'order' => 2, 'is_active' => true, 'children' => null],
                    ['name' => 'Commissions', 'menu_key' => 'agent_commissions', 'path' => '/dashboard/agent-management/commissions', 'icon' => 'HandCoins', 'order' => 3, 'is_active' => true, 'children' => null],
                ],
                'order' => 8,
                'is_active' => true,
            ],
        );

        MenuPermissionService::ensurePermissionsExist();
        Role::query()->firstOrCreate(['name' => 'Agent', 'guard_name' => 'web']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Menu::query()->where('menu_key', 'agent_management')->forceDelete();
    }
};
