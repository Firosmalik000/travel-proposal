<?php

namespace Tests\Unit\Models;

use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterKaryawanTest extends TestCase
{
    use RefreshDatabase;

    public function test_travel_package_stores_content_as_array(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'PKG-100',
            'slug' => 'umroh-family',
            'name' => ['id' => 'Umroh Family', 'en' => 'Family Umrah'],
            'package_type' => 'reguler',
            'departure_city' => 'Makassar',
            'duration_days' => 10,
            'price' => 36900000,
            'currency' => 'IDR',
            'content' => ['included' => ['id' => ['Tiket', 'Visa'], 'en' => ['Ticket', 'Visa']]],
            'is_active' => true,
        ]);

        $this->assertIsArray($package->content);
        $this->assertCount(2, $package->content['included']['id']);
    }

    public function test_travel_package_has_many_schedules(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'PKG-101',
            'slug' => 'umroh-plus',
            'name' => ['id' => 'Umroh Plus', 'en' => 'Plus Umrah'],
            'package_type' => 'vip',
            'departure_city' => 'Jakarta',
            'duration_days' => 12,
            'price' => 39900000,
            'currency' => 'IDR',
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
