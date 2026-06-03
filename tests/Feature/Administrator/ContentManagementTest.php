<?php

namespace Tests\Feature\Administrator;

use App\Models\DepartureSchedule;
use App\Models\Faq;
use App\Models\PageContent;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
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
            'slug' => 'home_landing_mockup',
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
                ->has('pages', 1)
                ->where('pages.0.slug', 'home_landing_mockup')
            );
    }

    public function test_landing_management_hydrates_default_selected_packages_when_not_saved_yet(): void
    {
        $user = User::factory()->create();

        $firstPackage = TravelPackage::factory()->create([
            'name' => 'Paket A',
            'price' => 31000000,
            'is_featured' => true,
            'is_active' => true,
        ]);
        $secondPackage = TravelPackage::factory()->create([
            'name' => 'Paket B',
            'price' => 32000000,
            'is_featured' => false,
            'is_active' => true,
        ]);
        $thirdPackage = TravelPackage::factory()->create([
            'name' => 'Paket C',
            'price' => 33000000,
            'is_featured' => false,
            'is_active' => true,
        ]);

        foreach ([$firstPackage, $secondPackage, $thirdPackage] as $package) {
            DepartureSchedule::query()->create([
                'package_id' => $package->id,
                'departure_date' => Carbon::today()->addDays(30),
                'return_date' => Carbon::today()->addDays(39),
                'departure_city' => 'Jakarta',
                'seats_total' => 40,
                'seats_available' => 40,
                'status' => 'open',
                'notes' => null,
                'is_active' => true,
            ]);
        }

        PageContent::query()->create([
            'slug' => 'home_landing_mockup',
            'category' => 'page',
            'title' => 'Beranda',
            'excerpt' => 'Excerpt',
            'content' => [
                'packages' => [
                    'title' => 'Pilihan Paket',
                ],
            ],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('landing.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/WebsiteManagement/Landing/Index')
                ->where('pages.0.content.packages.selected_package_ids.0', $firstPackage->id)
                ->where('pages.0.content.packages.selected_package_ids.1', $secondPackage->id)
                ->where('pages.0.content.packages.selected_package_ids.2', $thirdPackage->id));
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

    public function test_authenticated_users_can_view_website_content_management(): void
    {
        $user = User::factory()->create();
        PageContent::query()->create([
            'slug' => 'home_landing',
            'category' => 'page',
            'title' => 'Beranda Website',
            'excerpt' => 'Excerpt',
            'content' => ['hero' => ['title' => 'Hero Website']],
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get(route('website.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard/WebsiteManagement/Landing/Index')
                ->has('pages', 1)
                ->where('pages.0.slug', 'home_landing')
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
