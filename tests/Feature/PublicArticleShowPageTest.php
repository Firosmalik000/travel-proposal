<?php

namespace Tests\Feature;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicArticleShowPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_open_article_show_page(): void
    {
        $article = Article::factory()->create();

        $this->get(route('public.artikel.show', $article))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/artikel/show')
                ->has('article')
                ->has('relatedArticles')
            );
    }
}
