<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\User;
use App\Models\UserAccess;
use Illuminate\Database\Seeder;

class GrantAdminAccessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔍 Searching for admin user...');

        // Find admin user
        $admin = User::where('email', 'admin@xboss.com')->first();

        if (!$admin) {
            $this->command->error('❌ Admin user not found! Please run DatabaseSeeder first.');
            return;
        }

        $this->command->info("✓ Found admin user: {$admin->name} ({$admin->email})");

        // Get all menus
        $menus = Menu::all();
        $this->command->info("✓ Found {$menus->count()} menus");

        // Delete existing access for admin to avoid duplicates
        UserAccess::where('user_id', $admin->id)->delete();
        $this->command->info('✓ Cleared existing admin access');

        // Build access JSON structure
        $accessData = [];
        foreach ($menus as $menu) {
            $accessData[$menu->menu_key] = [
                'view' => true,
                'create' => true,
                'edit' => true,
                'delete' => true,
                'import' => true,
                'export' => true,
                'approve' => true,
                'reject' => true,
            ];
            $this->command->info("  ✓ Access granted for: {$menu->name}");

            // Grant access to child menus (level 1)
            if (!empty($menu->children)) {
                foreach ($menu->children as $childMenu) {
                    $accessData[$childMenu['menu_key']] = [
                        'view' => true,
                        'create' => true,
                        'edit' => true,
                        'delete' => true,
                        'import' => true,
                        'export' => true,
                        'approve' => true,
                        'reject' => true,
                    ];
                    $this->command->info("    ✓ Access granted for child: {$childMenu['name']}");

                    // Grant access to nested child menus (level 2)
                    if (!empty($childMenu['children'])) {
                        foreach ($childMenu['children'] as $nestedChild) {
                            $accessData[$nestedChild['menu_key']] = [
                                'view' => true,
                                'create' => true,
                                'edit' => true,
                                'delete' => true,
                                'import' => true,
                                'export' => true,
                                'approve' => true,
                                'reject' => true,
                            ];
                            $this->command->info("      ✓ Access granted for nested child: {$nestedChild['name']}");
                        }
                    }
                }
            }
        }

        // Create or update user access
        UserAccess::updateOrCreate(
            ['user_id' => $admin->id],
            [
                'access' => $accessData,
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ]
        );

        $count = count($accessData);
        $this->command->info('');
        $this->command->info("🎉 SUCCESS! Admin now has full access to {$count} menus");
        $this->command->info('');
        $this->command->info('Login credentials:');
        $this->command->info('  Email: admin@xboss.com');
        $this->command->info('  Password: admin123');
    }
}
