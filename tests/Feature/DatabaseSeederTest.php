<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\PageContent;
use App\Models\TravelPackage;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_the_current_admin_portal_baseline_without_packages(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertTrue(Role::query()->where('name', 'Super Admin')->exists());
        $this->assertTrue(User::query()->where('email', 'admin@asfartour.co.id')->exists());
        $this->assertTrue(Menu::query()->where('menu_key', 'dashboard')->exists());
        $this->assertTrue(Menu::query()->where('menu_key', 'product_management')->exists());
        $this->assertTrue(PageContent::query()->where('slug', 'seo-settings')->exists());
        $this->assertSame(0, TravelPackage::query()->count());
    }
}
