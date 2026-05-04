<?php

namespace Tests\Feature;

use App\Models\PageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicLandingSeoPropsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_landing_receives_seo_settings_props(): void
    {
        PageContent::query()->create([
            'slug' => 'seo-settings',
            'category' => 'settings',
            'title' => 'SEO',
            'excerpt' => 'SEO',
            'content' => [
                'advanced' => [
                    'canonicalBase' => 'https://example.com',
                ],
                'general' => [
                    'defaultDescription' => [
                        'id' => 'Desc',
                        'en' => 'Desc',
                    ],
                    'siteName' => [
                        'id' => 'Site',
                        'en' => 'Site',
                    ],
                ],
            ],
            'is_active' => true,
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('seoSettings')
            );
    }
}
