<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Menu;
use App\Models\User;
use App\Support\MenuPermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ActivityLogPageTest extends TestCase
{
    use RefreshDatabase;

    private function ensureActivityMenuExists(): void
    {
        Menu::query()->updateOrCreate(
            ['menu_key' => 'activity_management'],
            [
                'name' => 'Activity',
                'path' => '/dashboard/activity',
                'icon' => 'History',
                'children' => [
                    [
                        'name' => 'Activity Log',
                        'menu_key' => 'activity_log',
                        'path' => '/dashboard/activity/logs',
                        'icon' => 'History',
                        'order' => 1,
                        'is_active' => true,
                        'children' => null,
                    ],
                ],
                'order' => 8,
                'is_active' => true,
            ]
        );
    }

    public function test_activity_log_is_forbidden_without_view_permission(): void
    {
        $user = User::factory()->create();

        $this->ensureActivityMenuExists();
        MenuPermissionService::ensurePermissionsExist();

        $this->actingAs($user)
            ->get('/admin/activity/logs')
            ->assertForbidden();
    }

    public function test_activity_log_can_be_opened_with_view_permission(): void
    {
        $user = User::factory()->create();

        $this->ensureActivityMenuExists();
        MenuPermissionService::ensurePermissionsExist();
        $user->givePermissionTo('menu.activity_log.view');
        ActivityLog::query()->create([
            'user_id' => $user->id,
            'event_type' => 'create',
            'module' => 'product-management',
            'menu_key' => 'activity_log',
            'description' => 'Membuat data activity.',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
            'logged_at' => now(),
        ]);

        $this->actingAs($user)
            ->get('/admin/activity/logs')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Activity/Logs/Index')
                ->has('logs')
                ->has('filters')
                ->has('moduleOptions')
                ->has('users')
            );
    }
}
