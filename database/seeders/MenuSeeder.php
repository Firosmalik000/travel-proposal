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

            // Website Management - Has children (level 1)
            [
                'name' => 'Website Management',
                'menu_key' => 'website_management',
                'path' => '/dashboard/website-management',
                'icon' => 'Globe',
                'children' => [
                    [
                        'name' => 'Landing Page',
                        'menu_key' => 'landing_page',
                        'path' => '/dashboard/website-management/landing',
                        'icon' => 'FileText',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Content Management',
                        'menu_key' => 'content_management',
                        'path' => '/dashboard/website-management/content',
                        'icon' => 'ScrollText',
                        'order' => 2,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'SEO Settings',
                        'menu_key' => 'seo_settings',
                        'path' => '/dashboard/website-management/seo',
                        'icon' => 'Search',
                        'order' => 3,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Branding',
                        'menu_key' => 'branding',
                        'path' => '/dashboard/website-management/branding',
                        'icon' => 'Palette',
                        'order' => 4,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Product Management',
                'menu_key' => 'product_management',
                'path' => '/dashboard/product-management/products',
                'icon' => 'Package',
                'children' => [
                    [
                        'name' => 'Product',
                        'menu_key' => 'product',
                        'path' => '/dashboard/product-management/products',
                        'icon' => 'Package',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Package',
                        'menu_key' => 'package',
                        'path' => '/dashboard/product-management/packages',
                        'icon' => 'Boxes',
                        'order' => 2,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 3,
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
                'order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($menus as $menu) {
            Menu::create($menu);
        }

        $this->command->info('Menus seeded successfully with simplified structure.');
        $this->command->info('  - Dashboard: Direct navigation');
        $this->command->info('  - Website Management: landing, content, SEO, branding');
        $this->command->info('  - Product Management: 2 submenus (product, package)');
        $this->command->info('  - Administrator: 2 submenus (menu management, user access)');
    }
}
