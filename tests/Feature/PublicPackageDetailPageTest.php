<?php

namespace Tests\Feature;

use App\Models\DepartureSchedule;
use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPackageDetailPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_open_package_detail_page(): void
    {
        $package = TravelPackage::factory()->create();
        DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => now()->subDays(10)->toDateString(),
            'return_date' => now()->subDays(3)->toDateString(),
            'departure_city' => 'Jakarta',
            'seats_total' => 30,
            'seats_available' => 10,
            'status' => 'open',
            'notes' => null,
            'is_active' => true,
        ]);
        DepartureSchedule::query()->create([
            'package_id' => $package->id,
            'departure_date' => now()->addDays(14)->toDateString(),
            'return_date' => now()->addDays(20)->toDateString(),
            'departure_city' => 'Surabaya',
            'seats_total' => 30,
            'seats_available' => 18,
            'status' => 'open',
            'notes' => null,
            'is_active' => true,
        ]);

        $this->get('/paket-umroh/'.$package->slug)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/paket/detail/index')
                ->has('travelPackage')
                ->has('travelPackage.schedules', 1)
                ->where('travelPackage.schedules.0.departure_city', 'Surabaya')
                ->where('travelPackage.schedules.0.departure_date', now()->addDays(14)->toDateString())
            );
    }

    public function test_it_exposes_nominal_discount_on_package_detail_page(): void
    {
        $package = TravelPackage::factory()->create([
            'price' => 28000000,
            'original_price' => 32000000,
            'discount_type' => 'nominal',
            'discount_nominal' => 4000000,
            'discount_label' => null,
        ]);

        $this->get(route('public.paket-detail', $package))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/paket/detail/index')
                ->where('travelPackage.price', 28000000.0)
                ->where('travelPackage.original_price', 32000000.0)
                ->where('travelPackage.discount_type', 'nominal')
                ->where('travelPackage.discount_nominal', 4000000.0)
                ->where('travelPackage.discount_percent', 13)
            );
    }
}
