<?php

namespace Tests\Unit\Models;

use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterKaryawanTest extends TestCase
{
    use RefreshDatabase;

    public function test_travel_package_stores_detail_content_as_array(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'PKG-100',
            'title' => 'Umroh Family',
            'slug' => 'umroh-family',
            'package_type' => 'family',
            'departure_city' => 'Makassar',
            'duration_days' => 10,
            'price_from' => 36900000,
            'detail_content' => [
                'notes' => ['Pendampingan keluarga', 'Seat terbatas'],
            ],
            'is_active' => true,
        ]);

        $this->assertIsArray($package->detail_content);
        $this->assertCount(2, $package->detail_content['notes']);
    }

    public function test_travel_package_has_many_schedules(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'PKG-101',
            'title' => 'Umroh Plus',
            'slug' => 'umroh-plus',
            'package_type' => 'plus',
            'departure_city' => 'Jakarta',
            'duration_days' => 12,
            'price_from' => 39900000,
            'is_active' => true,
        ]);

        $package->schedules()->create([
            'departure_date' => now()->addMonth()->toDateString(),
            'departure_city' => 'Jakarta',
            'seats_total' => 45,
            'seats_available' => 15,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->assertCount(1, $package->schedules);
    }
}
