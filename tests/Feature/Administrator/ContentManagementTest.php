<?php

namespace Tests\Feature\Administrator;

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
                ->has('pages', 1),
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
}
