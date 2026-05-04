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
            ActivitySeeder::class,
            TravelContentSeeder::class,
            SeoSettingsSeeder::class,
            PackageSeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}
