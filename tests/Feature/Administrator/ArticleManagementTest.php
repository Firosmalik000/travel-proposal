<?php

namespace Tests\Feature\Administrator;

use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ArticleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_users_can_view_article_management_page(): void
    {
        $user = User::factory()->create();
        Article::factory()->create();

        $this->actingAs($user)
            ->get(route('articles.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/WebsiteManagement/Articles/Index')
                ->has('articles.data', 1)
            );
    }

    public function test_authenticated_users_can_create_published_article(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('articles.store'), [
                'title' => 'Update Visa Umroh 2026',
                'slug' => 'update-visa-umrah-2026',
                'excerpt' => 'Ringkasan update visa terbaru.',
                'body' => 'Isi artikel lengkap untuk jamaah.',
                'author_name' => 'Admin Travel',
                'content_type' => Article::TYPE_COMPANY_NEWS,
                'status' => Article::STATUS_PUBLISHED,
                'tags' => 'visa, umrah, 2026',
            ])
            ->assertRedirect(route('articles.index'));

        $article = Article::query()->first();

        $this->assertNotNull($article);
        $this->assertSame(Article::STATUS_PUBLISHED, $article->status);
        $this->assertSame(Article::TYPE_COMPANY_NEWS, $article->content_type);
        $this->assertSame(['visa', 'umrah', '2026'], $article->tags);
        $this->assertNotNull($article->published_at);
    }

    public function test_author_name_defaults_to_authenticated_user_when_left_blank(): void
    {
        $user = User::factory()->create([
            'name' => 'Editor Travel',
        ]);

        $this->actingAs($user)
            ->post(route('articles.store'), [
                'title' => 'Jadwal Umroh Terbaru',
                'slug' => 'jadwal-umrah-terbaru',
                'excerpt' => 'Ringkasan jadwal.',
                'body' => 'Isi artikel untuk jamaah.',
                'author_name' => '',
                'content_type' => Article::TYPE_TRAVEL_UPDATE,
                'status' => Article::STATUS_DRAFT,
                'tags' => 'jadwal, umrah',
            ])
            ->assertRedirect(route('articles.index'));

        $article = Article::query()->first();

        $this->assertNotNull($article);
        $this->assertSame('Editor Travel', $article->author_name);
    }

    public function test_meta_fields_are_saved_when_provided(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('articles.store'), [
                'title' => 'Panduan Umroh Keluarga',
                'slug' => 'panduan-umrah-keluarga',
                'excerpt' => 'Ringkasan panduan keluarga.',
                'body' => 'Isi artikel lengkap untuk keluarga.',
                'author_name' => '',
                'content_type' => Article::TYPE_UMRAH_EDUCATION,
                'status' => Article::STATUS_DRAFT,
                'tags' => 'keluarga, umrah',
                'meta_title' => 'Meta panduan keluarga',
                'meta_description' => 'Meta deskripsi keluarga',
            ])
            ->assertRedirect(route('articles.index'));

        $article = Article::query()->first();

        $this->assertNotNull($article);
        $this->assertSame('Meta panduan keluarga', $article->meta_title);
        $this->assertSame('Meta deskripsi keluarga', $article->meta_description);
    }

    public function test_authenticated_users_can_update_article_using_patch(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create([
            'title' => 'Judul Lama',
            'slug' => 'judul-lama',
            'excerpt' => 'Excerpt lama',
            'body' => 'Body lama',
            'content_type' => Article::TYPE_GENERAL_NEWS,
            'status' => Article::STATUS_DRAFT,
            'author_name' => 'Admin',
        ]);

        $this->actingAs($user)
            ->patch(route('articles.update', $article), [
                'title' => 'Judul Baru',
                'slug' => 'judul-baru',
                'excerpt' => 'Excerpt baru',
                'body' => 'Body baru',
                'author_name' => 'Editor',
                'content_type' => Article::TYPE_UMRAH_EDUCATION,
                'status' => Article::STATUS_PUBLISHED,
                'tags' => 'umrah, edukasi',
            ])
            ->assertRedirect(route('articles.index'));

        $article->refresh();

        $this->assertSame('Judul Baru', $article->title);
        $this->assertSame('judul-baru', $article->slug);
        $this->assertSame(Article::TYPE_UMRAH_EDUCATION, $article->content_type);
        $this->assertSame(Article::STATUS_PUBLISHED, $article->status);
        $this->assertSame(['umrah', 'edukasi'], $article->tags);
        $this->assertSame('Editor', $article->author_name);
        $this->assertNotNull($article->published_at);
    }

    public function test_post_to_article_update_route_is_not_allowed(): void
    {
        $user = User::factory()->create();
        $article = Article::factory()->create();

        $this->actingAs($user)
            ->post(route('articles.update', $article), [
                'title' => 'Judul Baru',
                'slug' => 'judul-baru',
                'excerpt' => 'Excerpt baru',
                'body' => 'Body baru',
                'author_name' => 'Editor',
                'content_type' => Article::TYPE_UMRAH_EDUCATION,
                'status' => Article::STATUS_DRAFT,
            ])
            ->assertMethodNotAllowed();
    }
}
