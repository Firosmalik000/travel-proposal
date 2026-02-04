<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate menus table to avoid duplicate entries
        Menu::truncate();

        $menus = [
            // Dashboard - No children, navigable
            [
                'name' => 'Dashboard',
                'menu_key' => 'dashboard',
                'path' => '/dashboard',
                'icon' => 'Home',
                'children' => null,
                'order' => 1,
                'is_active' => true,
            ],

            // Administrator - Has children (level 1)
            [
                'name' => 'Administrator',
                'menu_key' => 'administrator',
                'path' => '/dashboard/administrator',
                'icon' => 'Settings',
                'children' => [
                    [
                        'name' => 'Menu Management',
                        'menu_key' => 'menu_management',
                        'path' => '/dashboard/administrator/menus',
                        'icon' => 'FolderTree',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null, // No level 2, navigable
                    ],
                    [
                        'name' => 'User Access',
                        'menu_key' => 'user_access',
                        'path' => '/dashboard/administrator/user-access',
                        'icon' => 'Shield',
                        'order' => 2,
                        'is_active' => true,
                        'children' => null, // No level 2, navigable
                    ],
                ],
                'order' => 2,
                'is_active' => true,
            ],
        ];

        foreach ($menus as $menu) {
            Menu::create($menu);
        }

        $this->command->info('Menus seeded successfully with simplified structure.');
        $this->command->info('  - Dashboard: Direct navigation');
        $this->command->info('  - Administrator: 2 submenus (navigable)');
    }
}
