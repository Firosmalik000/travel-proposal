<?php

namespace Tests\Feature;

use App\Models\DepartureSchedule;
use App\Models\PageContent;
use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicLandingPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_landing_page_renders_public_landing_component(): void
    {
        $this->get(route('public.landing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/index'));
    }

    public function test_landing_package_page_renders_package_promo_component_by_id(): void
    {
        $package = TravelPackage::factory()->create([
            'slug' => 'umroh-basic-landing',
            'name' => [
                'id' => 'Umroh Basic 9 Hari',
                'en' => 'Basic Umrah 9 Days',
            ],
            'price' => 29029000,
            'original_price' => 31000000,
            'discount_type' => 'nominal',
            'discount_nominal' => 1971000,
            'content' => [
                'room_prices' => [
                    'quad' => 33500000,
                    'trpl' => 35000000,
                    'dbl' => 36500000,
                ],
                'included' => "Tiket Pesawat PP Direct Flight\nHotel Sesuai Paket",
                'excluded' => "Pembuatan Paspor\nVaksin Meningitis",
            ],
        ]);

        $this->get(route('public.landing-package', ['package' => $package->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/package/index')
                ->where('travelPackage.id', $package->id)
                ->where('travelPackage.slug', 'umroh-basic-landing')
                ->where('travelPackage.price', 29029000.0)
                ->where('travelPackage.discount_type', 'nominal')
                ->where('travelPackage.discount_nominal', 1971000.0)
                ->where('travelPackage.content.room_prices.quad', 33500000));
    }

    public function test_landing_package_page_can_resolve_package_by_slug(): void
    {
        $package = TravelPackage::factory()->create([
            'slug' => 'umroh-slug-landing',
        ]);

        $this->get('/landing/umroh-slug-landing')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/package/index')
                ->where('travelPackage.id', $package->id)
                ->where('travelPackage.slug', 'umroh-slug-landing'));
    }

    public function test_landing_package_page_does_not_show_inactive_package(): void
    {
        $package = TravelPackage::factory()->create([
            'slug' => 'inactive-landing-package',
            'is_active' => false,
        ]);

        $this->get(route('public.landing-package', ['package' => $package->id]))
            ->assertNotFound();
    }

    public function test_landing_page_exposes_package_discount_data(): void
    {
        $package = TravelPackage::factory()->create([
            'slug' => 'umroh-promo-landing',
            'price' => 31900000,
            'original_price' => 35900000,
            'discount_type' => 'nominal',
            'discount_nominal' => 4000000,
            'discount_label' => null,
        ]);

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

        $this->get(route('public.landing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/index')
                ->has('publicData.packages', 1)
                ->where('publicData.packages.0.slug', 'umroh-promo-landing')
                ->where('publicData.packages.0.original_price', '35900000.00')
                ->where('publicData.packages.0.discount_type', 'nominal')
                ->where('publicData.packages.0.discount_nominal', '4000000.00')
                ->where('publicData.packages.0.discount_label', null)
                ->where('publicData.packages.0.discount_percent', 11));
    }

    public function test_landing_page_keeps_all_four_hero_stats_from_content(): void
    {
        PageContent::query()->updateOrCreate(
            ['slug' => 'home_landing_mockup'],
            [
                'category' => 'page',
                'title' => 'Landing',
                'excerpt' => 'Landing',
                'content' => [
                    'stats' => [
                        ['label' => 'Stat 1', 'value' => '100+'],
                        ['label' => 'Stat 2', 'value' => '200+'],
                        ['label' => 'Stat 3', 'value' => '300+'],
                        ['label' => 'Stat 4', 'value' => '400+'],
                    ],
                ],
                'is_active' => true,
            ],
        );

        $this->get(route('public.landing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/index')
                ->has('publicData.pages.home_landing_mockup.content.stats', 4)
                ->where('publicData.pages.home_landing_mockup.content.stats.3.label', 'Stat 4'));
    }

    public function test_landing_page_does_not_restore_deleted_default_stats(): void
    {
        PageContent::query()->updateOrCreate(
            ['slug' => 'home_landing_mockup'],
            [
                'category' => 'page',
                'title' => 'Landing',
                'excerpt' => 'Landing',
                'content' => [
                    'stats' => [
                        ['label' => 'Stat 1', 'value' => '100+'],
                        ['label' => 'Stat 2', 'value' => '200+'],
                        ['label' => 'Stat 3', 'value' => '300+'],
                    ],
                ],
                'is_active' => true,
            ],
        );

        $this->get(route('public.landing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/index')
                ->has('publicData.pages.home_landing_mockup.content.stats', 3)
                ->where('publicData.pages.home_landing_mockup.content.stats.2.label', 'Stat 3'));
    }

    public function test_landing_page_allows_empty_hero_stats(): void
    {
        PageContent::query()->updateOrCreate(
            ['slug' => 'home_landing_mockup'],
            [
                'category' => 'page',
                'title' => 'Landing',
                'excerpt' => 'Landing',
                'content' => [
                    'stats' => [],
                ],
                'is_active' => true,
            ],
        );

        $this->get(route('public.landing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/index')
                ->has('publicData.pages.home_landing_mockup.content.stats', 0));
    }

    public function test_landing_page_keeps_all_configured_keunggulan_items(): void
    {
        PageContent::query()->updateOrCreate(
            ['slug' => 'home_landing_mockup'],
            [
                'category' => 'page',
                'title' => 'Landing',
                'excerpt' => 'Landing',
                'content' => [
                    'services' => [
                        'items' => [
                            ['title' => 'Item 1', 'description' => 'Desc 1', 'icon' => 'heart-handshake'],
                            ['title' => 'Item 2', 'description' => 'Desc 2', 'icon' => 'plane'],
                            ['title' => 'Item 3', 'description' => 'Desc 3', 'icon' => 'images'],
                            ['title' => 'Item 4', 'description' => 'Desc 4', 'icon' => 'shield-check'],
                            ['title' => 'Item 5', 'description' => 'Desc 5', 'icon' => 'star'],
                        ],
                    ],
                ],
                'is_active' => true,
            ],
        );

        $this->get(route('public.landing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/index')
                ->has('publicData.pages.home_landing_mockup.content.services.items', 5)
                ->where(
                    'publicData.pages.home_landing_mockup.content.services.items.4.title',
                    'Item 5',
                ));
    }

    public function test_landing_page_allows_empty_keunggulan_items(): void
    {
        PageContent::query()->updateOrCreate(
            ['slug' => 'home_landing_mockup'],
            [
                'category' => 'page',
                'title' => 'Landing',
                'excerpt' => 'Landing',
                'content' => [
                    'services' => [
                        'items' => [],
                    ],
                ],
                'is_active' => true,
            ],
        );

        $this->get(route('public.landing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/index')
                ->has('publicData.pages.home_landing_mockup.content.services.items', 0));
    }

    public function test_landing_page_exposes_editable_heading_parts_from_payload(): void
    {
        PageContent::query()->updateOrCreate(
            ['slug' => 'home_landing_mockup'],
            [
                'category' => 'page',
                'title' => 'Landing',
                'excerpt' => 'Landing',
                'content' => [
                    'included' => [
                        'section_heading_prefix' => 'Yang',
                        'section_heading_highlight' => 'Termasuk',
                        'section_heading_suffix' => 'dalam Paket',
                        'status_label' => 'SUDAH TERMASUK',
                    ],
                    'excluded' => [
                        'status_label' => 'BELUM TERMASUK',
                    ],
                    'testimonials' => [
                        'heading_prefix' => 'Apa Kata',
                        'heading_highlight' => 'Mereka',
                        'heading_suffix' => '?',
                    ],
                    'faq' => [
                        'heading_prefix' => 'Pertanyaan yang',
                        'heading_highlight' => 'Sering Ditanyakan',
                        'heading_suffix' => '',
                    ],
                    'location' => [
                        'heading_prefix' => 'Kunjungi',
                        'heading_highlight' => 'Kantor Kami',
                        'heading_suffix' => '',
                        'address_label' => 'Alamat Kantor',
                        'contact_label' => 'Hubungi Kami',
                    ],
                ],
                'is_active' => true,
            ],
        );

        $this->get(route('public.landing'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/landing/index')
                ->where(
                    'publicData.pages.home_landing_mockup.content.included.section_heading_prefix',
                    'Yang',
                )
                ->where(
                    'publicData.pages.home_landing_mockup.content.testimonials.heading_highlight',
                    'Mereka',
                )
                ->where(
                    'publicData.pages.home_landing_mockup.content.faq.heading_highlight',
                    'Sering Ditanyakan',
                )
                ->where(
                    'publicData.pages.home_landing_mockup.content.location.heading_highlight',
                    'Kantor Kami',
                )
                ->where(
                    'publicData.pages.home_landing_mockup.content.included.status_label',
                    'SUDAH TERMASUK',
                )
                ->where(
                    'publicData.pages.home_landing_mockup.content.excluded.status_label',
                    'BELUM TERMASUK',
                )
                ->where(
                    'publicData.pages.home_landing_mockup.content.location.address_label',
                    'Alamat Kantor',
                ));
    }
}
