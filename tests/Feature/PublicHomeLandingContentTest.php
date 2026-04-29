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
                ->component('welcome')
                ->has('publicData.pages.home.content.hero.cta_label')
                ->has('publicData.pages.home.content.hero.secondary_cta_label')
                ->has('publicData.pages.home.content.packages.detail_label')
                ->has('publicData.pages.home.content.testimonials.heading')
                ->has('publicData.pages.home.content.articles.read_more_label')
                ->has('publicData.pages.home.content.articles.empty_title')
                ->has('publicData.pages.home.content.contact.office_hours_lines'),
            );

        $this->assertTrue(PageContent::query()->where('slug', 'home')->exists());
    }
}
