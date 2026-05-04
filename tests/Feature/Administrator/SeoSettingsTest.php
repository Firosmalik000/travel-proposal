<?php

namespace Tests\Feature\Administrator;

use App\Models\PageContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeoSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_users_can_view_seo_settings_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('seo.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Administrator/Seo/Index')
                ->has('settings.contact.logo.url')
            );
    }

    public function test_seo_settings_can_be_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->patch(route('seo.update'), [
                'site_name_id' => 'Asfar Tour',
                'site_name_en' => 'Asfar Tour',
                'tagline_id' => 'Travel Umroh Amanah',
                'tagline_en' => 'Trusted Umrah Travel',
                'default_description_id' => 'Deskripsi default',
                'default_description_en' => 'Default description',
                'keywords' => 'travel umroh, asfar',
                'phone' => '+62 812-3456-7890',
                'email' => 'info@asfartour.co.id',
                'address_id' => 'Jakarta',
                'address_en' => 'Jakarta',
                'map_link' => 'https://maps.google.com',
                'weekday_hours_id' => 'Senin - Jumat',
                'weekday_hours_en' => 'Monday - Friday',
                'weekend_hours_id' => 'Sabtu',
                'weekend_hours_en' => 'Saturday',
                'robots_default' => 'index, follow',
                'canonical_base' => 'http://localhost',
                'google_verification' => 'google-code',
                'bing_verification' => 'bing-code',
                'primary' => '#c80012',
                'secondary' => '#8c0a16',
                'accent' => '#ff9200',
                'accent_soft' => '#ffc578',
                'surface' => '#f6e7c6',
            ])
            ->assertRedirect();

        $settings = PageContent::query()->where('slug', 'seo-settings')->first();

        $this->assertNotNull($settings);
        $this->assertSame('Asfar Tour', $settings->content['general']['siteName']['id']);
        $this->assertSame('#c80012', $settings->content['colors']['primary']);
    }

    public function test_seo_logo_can_be_uploaded_without_requiring_other_fields(): void
    {
        $originalStoragePath = $this->app->storagePath();
        $temporaryStoragePath = base_path('.tmp-storage');

        if (! is_dir($temporaryStoragePath)) {
            mkdir($temporaryStoragePath, 0777, true);
        }

        $this->app->useStoragePath($temporaryStoragePath);

        try {
            Storage::fake('public');

            $user = User::factory()->create();

            $this->actingAs($user)
                ->patch(route('seo.update'), [
                    'logo' => UploadedFile::fake()->image('seo-logo.png'),
                ])
                ->assertRedirect();

            $settings = PageContent::query()->where('slug', 'seo-settings')->first();

            $this->assertNotNull($settings);
            $this->assertArrayHasKey('contact', $settings->content);
            $this->assertArrayHasKey('logo', $settings->content['contact']);
            $this->assertArrayHasKey('path', $settings->content['contact']['logo']);

            Storage::disk('public')->assertExists($settings->content['contact']['logo']['path']);
        } finally {
            $this->app->useStoragePath($originalStoragePath);
        }
    }
}
