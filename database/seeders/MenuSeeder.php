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
                        'name' => 'Articles & News',
                        'menu_key' => 'articles_management',
                        'path' => '/dashboard/website-management/articles',
                        'icon' => 'FileText',
                        'order' => 2,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Policy & Help',
                        'menu_key' => 'portal_content',
                        'path' => '/dashboard/website-management/portal-content',
                        'icon' => 'Folder',
                        'order' => 3,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Content',
                        'menu_key' => 'content_management',
                        'path' => '/dashboard/website-management/content',
                        'icon' => 'ClipboardList',
                        'order' => 4,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Gallery',
                        'menu_key' => 'gallery_management',
                        'path' => '/dashboard/website-management/gallery',
                        'icon' => 'Images',
                        'order' => 5,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'SEO Settings',
                        'menu_key' => 'seo_settings',
                        'path' => '/dashboard/website-management/seo',
                        'icon' => 'Search',
                        'order' => 6,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Branding',
                        'menu_key' => 'branding',
                        'path' => '/dashboard/website-management/branding',
                        'icon' => 'Palette',
                        'order' => 7,
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
                        'name' => 'Product Category',
                        'menu_key' => 'product_category',
                        'path' => '/dashboard/product-management/categories',
                        'icon' => 'Tags',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Product',
                        'menu_key' => 'product',
                        'path' => '/dashboard/product-management/products',
                        'icon' => 'Package',
                        'order' => 2,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Package',
                        'menu_key' => 'package',
                        'path' => '/dashboard/product-management/packages',
                        'icon' => 'Boxes',
                        'order' => 3,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Activity',
                        'menu_key' => 'activity',
                        'path' => '/dashboard/product-management/activities',
                        'icon' => 'ListChecks',
                        'order' => 4,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Booking',
                'menu_key' => 'booking_management',
                'path' => '/dashboard/booking-management',
                'icon' => 'BookOpen',
                'children' => [
                    [
                        'name' => 'Register',
                        'menu_key' => 'booking_register',
                        'path' => '/dashboard/booking-management/register',
                        'icon' => 'ClipboardList',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Listing',
                        'menu_key' => 'booking_listing',
                        'path' => '/dashboard/booking-management/listing',
                        'icon' => 'Users',
                        'order' => 2,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Custom Requests',
                        'menu_key' => 'booking_custom_requests',
                        'path' => '/dashboard/booking-management/custom-requests',
                        'icon' => 'MessageSquare',
                        'order' => 3,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 4,
                'is_active' => true,
            ],

            // Financial Management - Has children (level 1)
            [
                'name' => 'Financial Management',
                'menu_key' => 'financial_management',
                'path' => '/dashboard/financial-management',
                'icon' => 'Wallet',
                'children' => [
                    [
                        'name' => 'Financial Report',
                        'menu_key' => 'financial_report',
                        'path' => '/dashboard/financial-management/financial-report',
                        'icon' => 'FileText',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 6,
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
                        'name' => 'User Management',
                        'menu_key' => 'user_management',
                        'path' => '/dashboard/administrator/users',
                        'icon' => 'Users',
                        'order' => 2,
                        'is_active' => true,
                        'children' => null,
                    ],
                    [
                        'name' => 'Role Management',
                        'menu_key' => 'role_management',
                        'path' => '/dashboard/administrator/roles',
                        'icon' => 'Shield',
                        'order' => 3,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($menus as $menu) {
            Menu::create($menu);
        }

        $this->command->info('Menus seeded successfully with simplified structure.');
        $this->command->info('  - Dashboard: Direct navigation');
        $this->command->info('  - Website Management: landing, schedules, SEO, branding');
        $this->command->info('  - Product Management: 4 submenus (product category, product, package, activity)');
        $this->command->info('  - Booking: 3 submenus (register, listing, custom requests)');
        $this->command->info('  - Financial Management: financial report');
        $this->command->info('  - Administrator: 3 submenus (menu management, user management, role management)');
    }
}
