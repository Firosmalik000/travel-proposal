<?php

namespace Tests\Feature\Settings;

use App\Models\PageContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ScheduleSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_schedule_settings_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/settings/schedule')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('settings/schedule')
                ->where('settings.auto_cancellation_enabled', false)
            );
    }

    public function test_schedule_settings_can_enable_auto_cancellation(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch('/settings/schedule', [
                'auto_cancellation_enabled' => true,
            ])
            ->assertRedirect();

        $settings = PageContent::query()->where('slug', 'schedule-settings')->first();

        $this->assertNotNull($settings);
        $this->assertTrue((bool) data_get($settings->content, 'auto_cancellation.enabled'));
    }

    public function test_admin_settings_schedule_alias_redirects_to_settings_schedule(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/admin/settings/schedule')
            ->assertRedirect('/settings/schedule');
    }
}
