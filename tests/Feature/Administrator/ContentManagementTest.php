<?php

namespace Tests\Feature\Administrator;

use App\Models\Faq;
use App\Models\PageContent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_users_can_view_landing_page_management(): void
    {
        $user = User::factory()->create();
        Faq::query()->create([
            'question' => 'Apa itu umroh?',
            'answer' => 'Perjalanan ibadah ke Tanah Suci.',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        PageContent::query()->create([
            'slug' => 'home',
            'category' => 'page',
            'title' => 'Beranda',
            'excerpt' => 'Excerpt',
            'content' => ['hero' => ['title' => 'Hero']],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('landing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/WebsiteManagement/Landing/Index')
                ->has('pages')
            );
    }

    public function test_authenticated_users_can_view_portal_content_management(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('portal-content.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/Administrator/Content/Index')
                ->where('heading', 'Policy & Help')
                ->has('pages', 4)
                ->where('pages.0.slug', 'terms-conditions')
                ->where('pages.1.slug', 'privacy-policy')
                ->where('pages.2.slug', 'refund-policy')
                ->where('pages.3.slug', 'disclaimer')
                ->has('resources', 2)
                ->where('resources.0.key', 'faqs')
                ->where('resources.1.key', 'legal_documents'),
            );
    }

    public function test_page_content_can_be_updated(): void
    {
        $user = User::factory()->create();
        $page = PageContent::query()->create([
            'slug' => 'home',
            'category' => 'page',
            'title' => 'Beranda',
            'excerpt' => 'Excerpt',
            'content' => ['hero' => ['title' => 'Hero']],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->patch(route('content.update', $page), [
                'title' => 'Beranda Baru',
                'excerpt' => 'Ringkasan baru',
                'content_json' => json_encode(['hero' => ['title' => 'Judul Baru']]),
                'is_active' => true,
            ])
            ->assertRedirect();

        $page->refresh();

        $this->assertSame('Beranda Baru', $page->title);
        $this->assertSame('Judul Baru', $page->content['hero']['title']);
    }

    public function test_portal_content_page_can_be_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get(route('portal-content.index'))->assertOk();

        $page = PageContent::query()->where('slug', 'terms-conditions')->first();

        $this->assertNotNull($page);

        $this->actingAs($user)
            ->patch(route('content.update', $page), [
                'title' => 'Syarat Portal Baru',
                'excerpt' => 'Ringkasan portal baru',
                'content_json' => json_encode([
                    'body' => '<h2>Isi terms portal baru</h2><p>Konten HTML baru.</p>',
                ], JSON_THROW_ON_ERROR),
                'is_active' => true,
            ])
            ->assertRedirect();

        $page->refresh();

        $this->assertSame('Syarat Portal Baru', $page->title);
        $this->assertSame('<h2>Isi terms portal baru</h2><p>Konten HTML baru.</p>', $page->content['body']);
    }
}
