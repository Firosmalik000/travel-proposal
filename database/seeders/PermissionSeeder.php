<?php

namespace Database\Seeders;

use App\Support\MenuPermissionService;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        MenuPermissionService::ensurePermissionsExist();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
