<?php

namespace Tests\Feature;

use App\Models\Menu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ResetAdminPasswordCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_grants_all_current_menu_keys_when_resetting_admin_password(): void
    {
        Menu::query()->create([
            'name' => 'Website Management',
            'menu_key' => 'website_management',
            'path' => '/admin/website-management',
            'icon' => 'Globe',
            'children' => [
                [
                    'name' => 'Articles & News',
                    'menu_key' => 'articles_management',
                    'path' => '/admin/website-management/articles',
                    'icon' => 'FileText',
                    'order' => 1,
                    'is_active' => true,
                    'children' => null,
                ],
            ],
            'order' => 1,
            'is_active' => true,
        ]);

        $this->artisan('admin:reset-password', [
            'email' => 'admin@asfartour.co.id',
            '--password' => 'secret123',
        ])->assertSuccessful();

        $user = User::query()->where('email', 'admin@asfartour.co.id')->first();

        $this->assertNotNull($user);
        $this->assertTrue($user->can('menu.website_management.view'));
        $this->assertTrue($user->can('menu.articles_management.view'));
        $this->assertTrue($user->can('menu.articles_management.create'));
        $this->assertTrue($user->can('menu.articles_management.edit'));
        $this->assertTrue($user->can('menu.articles_management.delete'));
    }
}
