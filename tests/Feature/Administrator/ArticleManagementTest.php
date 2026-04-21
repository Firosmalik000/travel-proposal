<?php

namespace Tests\Feature\Administrator;

use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        Storage::fake('public');

        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('articles.store'), [
                'title_id' => 'Update Visa Umrah 2026',
                'title_en' => '2026 Umrah Visa Update',
                'slug' => 'update-visa-umrah-2026',
                'excerpt_id' => 'Ringkasan update visa terbaru.',
                'excerpt_en' => 'Summary of the latest visa update.',
                'body_id' => 'Isi artikel lengkap untuk jamaah.',
                'body_en' => 'Full article body for pilgrims.',
                'author_name' => 'Admin Travel',
                'content_type' => Article::TYPE_COMPANY_NEWS,
                'status' => Article::STATUS_PUBLISHED,
                'tags' => 'visa, umrah, 2026',
                'cover_image' => UploadedFile::fake()->image('cover.png'),
            ])
            ->assertRedirect(route('articles.index'));

        $article = Article::query()->first();

        $this->assertNotNull($article);
        $this->assertSame(Article::STATUS_PUBLISHED, $article->status);
        $this->assertSame(Article::TYPE_COMPANY_NEWS, $article->content_type);
        $this->assertSame(['visa', 'umrah', '2026'], $article->tags);
        $this->assertNotNull($article->published_at);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', (string) $article->image_path));
    }

    public function test_author_name_defaults_to_authenticated_user_when_left_blank(): void
    {
        $user = User::factory()->create([
            'name' => 'Editor Travel',
        ]);

        $this->actingAs($user)
            ->post(route('articles.store'), [
                'title_id' => 'Jadwal Umrah Terbaru',
                'title_en' => 'Latest Umrah Schedule',
                'slug' => 'jadwal-umrah-terbaru',
                'excerpt_id' => 'Ringkasan jadwal.',
                'excerpt_en' => 'Schedule summary.',
                'body_id' => 'Isi artikel untuk jamaah.',
                'body_en' => 'Article body for pilgrims.',
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

    public function test_empty_english_content_falls_back_to_indonesian_values(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('articles.store'), [
                'title_id' => 'Panduan Umrah Keluarga',
                'title_en' => '',
                'slug' => 'panduan-umrah-keluarga',
                'excerpt_id' => 'Ringkasan panduan keluarga.',
                'excerpt_en' => '',
                'body_id' => 'Isi artikel lengkap untuk keluarga.',
                'body_en' => '',
                'author_name' => '',
                'content_type' => Article::TYPE_UMRAH_EDUCATION,
                'status' => Article::STATUS_DRAFT,
                'tags' => 'keluarga, umrah',
                'meta_title_id' => 'Meta panduan keluarga',
                'meta_title_en' => '',
                'meta_description_id' => 'Meta deskripsi keluarga',
                'meta_description_en' => '',
            ])
            ->assertRedirect(route('articles.index'));

        $article = Article::query()->first();

        $this->assertNotNull($article);
        $this->assertSame('Panduan Umrah Keluarga', $article->title['en']);
        $this->assertSame('Ringkasan panduan keluarga.', $article->excerpt['en']);
        $this->assertSame('Isi artikel lengkap untuk keluarga.', $article->body['en']);
        $this->assertSame('Meta panduan keluarga', $article->meta_title['en']);
        $this->assertSame('Meta deskripsi keluarga', $article->meta_description['en']);
    }
}
