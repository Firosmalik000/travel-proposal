<?php

namespace Tests\Unit;

use App\Services\HotelProductPricingResolver;
use Tests\TestCase;

class HotelProductPricingResolverTest extends TestCase
{
    public function test_it_resolves_room_aliases_broker_keys_and_the_latest_matching_period(): void
    {
        $rows = [
            [
                'broker_name' => 'Broker Lama',
                'broker_key' => 'broker-utama',
                'room_type' => 'DBL',
                'period_start' => '2026-01-01',
                'period_end' => '2026-12-31',
                'price' => 100,
            ],
            [
                'broker_name' => 'Broker Baru',
                'broker_key' => 'broker-utama',
                'room_type' => 'double',
                'period_start' => '2026-06-01',
                'period_end' => '2026-09-30',
                'price' => 150,
            ],
        ];

        $resolved = app(HotelProductPricingResolver::class)->resolve(
            $rows,
            'dbl',
            'BROKER-UTAMA',
            '2026-09-10',
        );

        $this->assertNotNull($resolved);
        $this->assertSame(150, $resolved['price']);
    }

    public function test_it_does_not_use_a_price_outside_its_active_period(): void
    {
        $resolved = app(HotelProductPricingResolver::class)->resolve([
            [
                'broker_name' => 'Broker',
                'room_type' => 'quad',
                'period_start' => '2026-01-01',
                'period_end' => '2026-01-31',
                'price' => 100,
            ],
        ], 'quad', 'Broker', '2026-09-10');

        $this->assertNull($resolved);
    }
}
