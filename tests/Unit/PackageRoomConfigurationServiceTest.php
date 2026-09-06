<?php

namespace Tests\Unit;

use App\Models\TravelPackage;
use App\Services\PackageRoomConfigurationService;
use Tests\TestCase;

class PackageRoomConfigurationServiceTest extends TestCase
{
    public function test_it_uses_double_for_one_remaining_passenger_without_charging_an_empty_bed(): void
    {
        $package = new TravelPackage([
            'price' => 26_000_000,
            'currency' => 'IDR',
            'content' => [
                'room_prices' => [
                    'dbl' => 26_000_000,
                    'trpl' => 25_000_000,
                    'quad' => 24_000_000,
                ],
            ],
        ]);
        $service = app(PackageRoomConfigurationService::class);

        $this->assertSame([
            'double' => 1,
            'triple' => 0,
            'quad' => 0,
        ], $service->recommendedConfiguration(1));
        $this->assertSame(26_000_000.0, $service->calculateTotalAmount(
            $package,
            ['double' => 1, 'triple' => 0, 'quad' => 0],
            1,
        ));
        $this->assertEquals([[
            'type' => 'double',
            'label' => 'Double',
            'rooms' => 1,
            'pax' => 1,
            'unit_price' => 26_000_000.0,
            'amount' => 26_000_000.0,
        ]], $service->buildLineItems(
            $package,
            ['double' => 1, 'triple' => 0, 'quad' => 0],
            1,
        ));
    }

    public function test_it_converts_legacy_single_rooms_to_double_rooms_when_reading_old_bookings(): void
    {
        $service = app(PackageRoomConfigurationService::class);

        $this->assertSame([
            'double' => 3,
            'triple' => 1,
            'quad' => 0,
        ], $service->normalizeConfiguration([
            'single' => 1,
            'double' => 2,
            'triple' => 1,
            'quad' => 0,
        ]));
        $this->assertSame('1 double', $service->summarize(['single' => 1]));
    }

    public function test_it_does_not_copy_the_double_fallback_into_unset_triple_and_quad_prices(): void
    {
        $package = new TravelPackage([
            'price' => 26_000_000,
            'content' => [],
        ]);

        $this->assertSame([
            'double' => 26_000_000.0,
            'triple' => 0.0,
            'quad' => 0.0,
        ], app(PackageRoomConfigurationService::class)->roomPrices($package));
    }

    public function test_it_uses_the_configured_double_price_instead_of_legacy_package_columns(): void
    {
        $package = new TravelPackage([
            'price' => 24_000_000,
            'original_price' => 25_000_000,
            'content' => [
                'room_prices' => ['dbl' => 25_000_000],
                'room_original_prices' => ['dbl' => 26_000_000],
            ],
        ]);

        $this->assertSame(25_000_000.0, $package->doubleSellingPrice());
        $this->assertSame(26_000_000.0, $package->doubleOriginalPrice());
        $this->assertSame(4, $package->discountPercent());
    }

    public function test_it_recommends_only_double_triple_and_quad_for_odd_passenger_totals(): void
    {
        $service = app(PackageRoomConfigurationService::class);

        $this->assertSame([
            'double' => 1,
            'triple' => 0,
            'quad' => 1,
        ], $service->recommendedConfiguration(5));
        $this->assertSame([
            'double' => 0,
            'triple' => 1,
            'quad' => 8,
        ], $service->recommendedConfiguration(35));
    }

    public function test_it_calculates_public_pax_allocations_using_each_per_jamaah_price(): void
    {
        $package = new TravelPackage([
            'price' => 40_000_000,
            'currency' => 'IDR',
            'content' => [
                'room_prices' => [
                    'dbl' => 40_000_000,
                    'trpl' => 39_000_000,
                    'quad' => 38_000_000,
                ],
            ],
        ]);
        $service = app(PackageRoomConfigurationService::class);
        $allocation = $service->normalizePaxAllocation([
            'double' => 2,
            'triple' => 0,
            'quad' => 8,
        ]);

        $this->assertSame([
            'unit' => 'pax',
            'double' => 2,
            'triple' => 0,
            'quad' => 8,
        ], $allocation);
        $this->assertSame(10, $service->occupiedPax($allocation));
        $this->assertSame([
            'double' => 1,
            'triple' => 0,
            'quad' => 2,
        ], $service->roomCounts($allocation));
        $this->assertSame(384_000_000.0, $service->calculateTotalAmount($package, $allocation, 10));
        $this->assertSame('2 pax double + 8 pax quad', $service->summarize($allocation));
        $this->assertEquals([
            [
                'type' => 'double',
                'label' => 'Double',
                'rooms' => 1,
                'pax' => 2,
                'unit_price' => 40_000_000.0,
                'amount' => 80_000_000.0,
            ],
            [
                'type' => 'quad',
                'label' => 'Quad',
                'rooms' => 2,
                'pax' => 8,
                'unit_price' => 38_000_000.0,
                'amount' => 304_000_000.0,
            ],
        ], $service->buildLineItems($package, $allocation, 10));
    }
}
