<?php

namespace Tests\Feature;

use App\Models\PageContent;
use Database\Seeders\SeoSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoSettingsSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_fills_seo_settings_defaults(): void
    {
        $this->seed(SeoSettingsSeeder::class);

        $settings = PageContent::query()->where('slug', 'seo-settings')->first();

        $this->assertNotNull($settings);

        $content = is_array($settings?->content) ? $settings->content : [];

        $this->assertNotEmpty(data_get($content, 'advanced.canonicalBase'));
        $this->assertNotEmpty(data_get($content, 'general.defaultDescription.id'));
        $this->assertNotEmpty(data_get($content, 'social.ogTitle.id'));
        $this->assertNotEmpty(data_get($content, 'social.ogDescription.id'));
    }
}
