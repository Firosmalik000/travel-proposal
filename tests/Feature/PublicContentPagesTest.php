<?php

namespace Tests\Feature;

use App\Models\PageContent;
use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicContentPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_package_page_receives_active_public_packages(): void
    {
        TravelPackage::query()->create([
            'code' => 'ASF-REG-10',
            'slug' => 'umroh-reguler-10-hari',
            'name' => ['id' => 'Umroh Reguler 10 Hari', 'en' => 'Regular Umrah 10 Days'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 35000000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [
                'airline' => ['id' => 'Saudia', 'en' => 'Saudia'],
                'hotel' => ['id' => 'Setara bintang 4', 'en' => 'Equivalent to 4-star hotel'],
            ],
            'is_active' => true,
        ]);

        $this->get(route('public.paket'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/paket/index')
                ->has('publicData.packages', 1)
                ->where('publicData.packages.0.slug', 'umroh-reguler-10-hari'),
            );
    }

    public function test_custom_page_receives_custom_page_content_from_database(): void
    {
        PageContent::query()->create([
            'slug' => 'custom-umroh',
            'category' => 'page',
            'title' => ['id' => 'Custom Umroh', 'en' => 'Custom Umrah'],
            'excerpt' => ['id' => 'Paket custom', 'en' => 'Custom package'],
            'content' => [
                'badge' => ['id' => 'Custom', 'en' => 'Custom'],
                'description' => ['id' => 'Deskripsi custom', 'en' => 'Custom description'],
            ],
            'is_active' => true,
        ]);

        $this->get(route('public.custom'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/custom/index')
                ->where('publicData.pages.custom-umroh.slug', 'custom-umroh'),
            );
    }
}
