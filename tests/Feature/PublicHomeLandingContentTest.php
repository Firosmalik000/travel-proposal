<?php

namespace Tests\Feature;

use App\Models\PageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicHomeLandingContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_provides_home_landing_content_schema(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/website/index')
                ->has('publicData.pages.home_landing.content.hero.cta_label')
                ->where(
                    'publicData.pages.home_landing.content.hero.label',
                    'Asfar Tour',
                )
                ->where(
                    'publicData.pages.home_landing.content.hero.background.type',
                    'default',
                )
                ->where(
                    'publicData.pages.home_landing.content.hero.background.color',
                    '#0f766e',
                )
                ->where(
                    'publicData.pages.home_landing.content.hero.background.overlay_intensity',
                    'strong',
                )
                ->has('publicData.pages.home_landing.content.hero.secondary_cta_label')
                ->has('publicData.pages.home_landing.content.packages.detail_label')
                ->where(
                    'publicData.pages.home_landing.content.packages.background.overlay_intensity',
                    'strong',
                )
                ->where(
                    'publicData.pages.home_landing.content.packages.background.color',
                    '#0f766e',
                )
                ->has('publicData.pages.home_landing.content.testimonials.heading')
                ->has('publicData.pages.home_landing.content.articles.read_more_label')
                ->has('publicData.pages.home_landing.content.articles.empty_title'),
            );

        $this->assertTrue(PageContent::query()->where('slug', 'home_landing')->exists());
    }
}
