<?php

namespace Tests\Unit\Models;

use App\Models\DepartureSchedule;
use App\Models\TravelPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SlipGajiTest extends TestCase
{
    use RefreshDatabase;

    public function test_departure_schedule_belongs_to_package(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'PKG-200',
            'title' => 'Umroh Gold',
            'slug' => 'umroh-gold',
            'package_type' => 'gold',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price_from' => 38500000,
            'is_active' => true,
        ]);

        $schedule = DepartureSchedule::query()->create([
            'travel_package_id' => $package->id,
            'departure_date' => now()->addWeeks(2)->toDateString(),
            'departure_city' => 'Jakarta',
            'seats_total' => 40,
            'seats_available' => 10,
            'price' => 38500000,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->assertTrue($schedule->travelPackage?->is($package));
    }

    public function test_departure_schedule_casts_dates_correctly(): void
    {
        $schedule = DepartureSchedule::query()->create([
            'departure_date' => '2026-04-15',
            'return_date' => '2026-04-24',
            'departure_city' => 'Surabaya',
            'seats_total' => 40,
            'seats_available' => 8,
            'status' => 'open',
            'is_active' => true,
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $schedule->departure_date);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $schedule->return_date);
    }
}
