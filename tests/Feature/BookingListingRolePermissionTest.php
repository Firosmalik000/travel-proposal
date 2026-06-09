<?php

namespace Tests\Feature;

use Database\Seeders\MenuSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BookingListingRolePermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_cs_role_receives_edit_permission_for_booking_listing(): void
    {
        $this->seed(MenuSeeder::class);
        $this->seed(RoleSeeder::class);

        $role = Role::query()
            ->where('name', 'CS')
            ->where('guard_name', 'web')
            ->firstOrFail();

        $this->assertTrue($role->hasPermissionTo('menu.booking_listing.view'));
        $this->assertTrue($role->hasPermissionTo('menu.booking_listing.edit'));
        $this->assertTrue($role->hasPermissionTo('menu.booking_listing.export'));
    }
}
