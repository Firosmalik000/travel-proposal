<?php

namespace Tests\Feature\Public;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicArticlePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_article_index_only_shows_published_articles(): void
    {
        Article::factory()->create([
            'slug' => 'published-news',
            'title' => ['id' => 'Published News', 'en' => 'Published News'],
        ]);
        Article::factory()->draft()->create([
            'slug' => 'draft-news',
            'title' => ['id' => 'Draft News', 'en' => 'Draft News'],
        ]);

        $this->get(route('public.artikel'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/artikel/index')
                ->has('articles.data', 1)
                ->where('articles.data.0.slug', 'published-news')
            );
    }

    public function test_public_article_detail_returns_not_found_for_draft_article(): void
    {
        $article = Article::factory()->draft()->create([
            'slug' => 'internal-draft',
        ]);

        $this->get(route('public.artikel.show', $article))
            ->assertNotFound();
    }

    public function test_shared_public_articles_only_include_visible_articles(): void
    {
        Article::factory()->create([
            'slug' => 'visible-article',
            'title' => ['id' => 'Visible Article', 'en' => 'Visible Article'],
            'published_at' => now()->subDay(),
        ]);
        Article::factory()->draft()->create([
            'slug' => 'hidden-draft',
        ]);
        Article::factory()->scheduled()->create([
            'slug' => 'future-article',
            'published_at' => now()->addDay(),
        ]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->has('publicData.articles', 1)
                ->where('publicData.articles.0.slug', 'visible-article')
            );
    }
}
