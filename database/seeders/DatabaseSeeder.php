<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MenuSeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            AdminUserSeeder::class,
            ProductCategorySeeder::class,
            ActivitySeeder::class,
            SeoSettingsSeeder::class,
            TravelContentSeeder::class,
            HotelRateSeeder::class,
            InventoryFromProductsSeeder::class,
            PackageSeeder::class,
        ]);
    }
}
