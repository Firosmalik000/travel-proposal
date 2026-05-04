<?php

namespace Tests\Feature\Public;

use App\Models\Activity;
use App\Models\PackageItinerary;
use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPackageDetailItineraryTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_package_detail_includes_itinerary_activities_and_text(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'ASF-TEST-11',
            'slug' => 'umroh-test',
            'name' => ['id' => 'Umroh Test', 'en' => 'Umrah Test'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 11,
            'price' => 1000000,
            'currency' => 'IDR',
            'summary' => ['id' => 'Ringkasan', 'en' => 'Summary'],
            'content' => [],
            'is_active' => true,
        ]);

        $activity = Activity::query()->create([
            'code' => 'ACT-TEST',
            'name' => 'City Tour',
            'description' => 'Tour kota setelah check-in.',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        PackageItinerary::query()->create([
            'package_id' => $package->id,
            'activity_id' => $activity->id,
            'activity_ids' => [$activity->id],
            'day_number' => 1,
            'sort_order' => 1,
            'title' => 'Hari pertama',
            'description' => 'Aktivitas utama hari pertama.',
        ]);

        $this->get("/paket-umroh/{$package->slug}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/paket/detail/index')
                ->where('travelPackage.slug', 'umroh-test')
                ->has('travelPackage.itineraries', 1)
                ->where('travelPackage.itineraries.0.day_number', 1)
                ->where('travelPackage.itineraries.0.activities.0.name', 'City Tour')
                ->where('travelPackage.itineraries.0.title', 'Hari pertama')
                ->where('travelPackage.itineraries.0.description', 'Aktivitas utama hari pertama.'),
            );
    }
}
