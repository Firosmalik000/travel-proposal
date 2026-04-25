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
            'question' => ['id' => 'Apa itu umroh?', 'en' => 'What is umrah?'],
            'answer' => ['id' => 'Perjalanan ibadah ke Tanah Suci.', 'en' => 'A pilgrimage trip to the holy land.'],
            'sort_order' => 1,
            'is_active' => true,
        ]);
        PageContent::query()->create([
            'slug' => 'home',
            'category' => 'page',
            'title' => ['id' => 'Beranda', 'en' => 'Home'],
            'excerpt' => ['id' => 'Excerpt', 'en' => 'Excerpt'],
            'content' => ['hero' => ['title' => ['id' => 'Hero', 'en' => 'Hero']]],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('landing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/WebsiteManagement/Landing/Index')
                ->has('pages', 1)
                ->has('defaultFaqs', 1)
                ->where('defaultFaqs.0.question.id', 'Apa itu umroh?'),
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
            'title' => ['id' => 'Beranda', 'en' => 'Home'],
            'excerpt' => ['id' => 'Excerpt', 'en' => 'Excerpt'],
            'content' => ['hero' => ['title' => ['id' => 'Hero', 'en' => 'Hero']]],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->patch(route('content.update', $page), [
                'title_id' => 'Beranda Baru',
                'title_en' => 'New Home',
                'excerpt_id' => 'Ringkasan baru',
                'excerpt_en' => 'New summary',
                'content_json' => json_encode(['hero' => ['title' => ['id' => 'Judul Baru', 'en' => 'New Title']]]),
                'is_active' => true,
            ])
            ->assertRedirect();

        $page->refresh();

        $this->assertSame('Beranda Baru', $page->title['id']);
        $this->assertSame('Judul Baru', $page->content['hero']['title']['id']);
    }

    public function test_portal_content_page_can_be_updated(): void
    {
        $user = User::factory()->create();
        $page = PageContent::query()->where('slug', 'terms-conditions')->first();

        $this->assertNotNull($page);

        $this->actingAs($user)
            ->patch(route('content.update', $page), [
                'title_id' => 'Syarat Portal Baru',
                'title_en' => 'New Portal Terms',
                'excerpt_id' => 'Ringkasan portal baru',
                'excerpt_en' => 'New portal summary',
                'content_json' => json_encode([
                    'body' => [
                        'id' => '<h2>Isi terms portal baru</h2><p>Konten HTML baru.</p>',
                        'en' => '<h2>New portal terms body</h2><p>Updated HTML content.</p>',
                    ],
                ], JSON_THROW_ON_ERROR),
                'is_active' => true,
            ])
            ->assertRedirect();

        $page->refresh();

        $this->assertSame('Syarat Portal Baru', $page->title['id']);
        $this->assertSame('<h2>Isi terms portal baru</h2><p>Konten HTML baru.</p>', $page->content['body']['id']);
    }
}
