<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\User;
use App\Models\UserAccess;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or get admin user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@xboss.com'],
            [
                'name' => 'Administrator',
                'username' => 'admin',
                'full_name' => 'System Administrator',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );

        $adminUserId = $adminUser->id;

        // Get all menus
        $menus = Menu::active()->orderBy('order')->get();

        // Build access array with all permissions for all menus
        $access = [];

        // All available permissions
        $allPermissions = ['view', 'create', 'edit', 'delete', 'import', 'export'];

        foreach ($menus as $menu) {
            // Get all menu keys from this menu (including children)
            $menuKeys = $this->extractAllMenuKeys($menu);

            // Grant all permissions to each menu key
            foreach ($menuKeys as $menuKey) {
                if ($menuKey) {
                    $access[$menuKey] = $allPermissions;
                }
            }
        }

        // Create or update user access for admin
        UserAccess::updateOrCreate(
            ['user_id' => $adminUserId],
            [
                'access' => $access,
            ]
        );

        $this->command->info('✓ Admin user access seeded successfully!');
        $this->command->info('  - User ID: ' . $adminUserId);
        $this->command->info('  - Total menu keys granted: ' . count($access));
        $this->command->info('  - Permissions per menu: ' . implode(', ', $allPermissions));
    }

    /**
     * Extract all menu keys from a menu structure (including children).
     *
     * @param Menu $menu
     * @return array
     */
    private function extractAllMenuKeys(Menu $menu): array
    {
        $keys = [$menu->menu_key];

        // Add children (level 1)
        if (!empty($menu->children)) {
            foreach ($menu->children as $child) {
                if (isset($child['menu_key'])) {
                    $keys[] = $child['menu_key'];
                }

                // Add grandchildren (level 2)
                if (!empty($child['children'])) {
                    foreach ($child['children'] as $grandChild) {
                        if (isset($grandChild['menu_key'])) {
                            $keys[] = $grandChild['menu_key'];
                        }
                    }
                }
            }
        }

        return array_filter($keys);
    }
}
