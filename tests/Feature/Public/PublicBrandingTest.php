<?php

namespace Tests\Feature\Public;

use App\Models\PageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicBrandingTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_pages_use_default_branding_logo_when_seo_logo_is_missing(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('publicBranding.logo_path', config('branding.logo_path'))
                ->where('publicBranding.favicon_path', config('branding.logo_path'))
            );
    }

    public function test_public_pages_prefer_seo_logo_when_available(): void
    {
        PageContent::query()->create([
            'slug' => 'seo-settings',
            'category' => 'settings',
            'title' => ['id' => 'SEO Settings', 'en' => 'SEO Settings'],
            'excerpt' => ['id' => 'Pengaturan SEO website', 'en' => 'Website SEO settings'],
            'content' => [
                'contact' => [
                    'logo' => [
                        'path' => 'seo/logo-public.png',
                    ],
                ],
            ],
            'is_active' => true,
        ]);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('publicBranding.logo_path', '/storage/seo/logo-public.png')
                ->where('publicBranding.favicon_path', '/storage/seo/logo-public.png')
            );
    }
}
