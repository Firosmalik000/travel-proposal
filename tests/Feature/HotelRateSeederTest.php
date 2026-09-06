<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\HotelPrice;
use App\Models\TravelProduct;
use Database\Seeders\HotelRateSeeder;
use Database\Seeders\ProductCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HotelRateSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_restores_the_current_hotel_database_snapshot(): void
    {
        $this->seed(ProductCategorySeeder::class);
        $this->seed(HotelRateSeeder::class);

        $this->assertSame(35, Hotel::query()->count());
        $this->assertSame(279, HotelPrice::query()->count());
        $this->assertSame(35, TravelProduct::query()->where('product_type', 'hotel')->count());

        $this->assertDatabaseHas('hotels', [
            'code' => 'HTL-ZOWAR-INTERNATIONAL',
            'name' => 'Zowar International',
            'currency' => 'IDR',
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('hotel_prices', [
            'broker_key' => 'broker-1',
            'broker_name' => 'Broker 1',
            'period_start' => '2026-08-15',
            'period_end' => '2026-09-20',
            'price' => 575,
            'is_active' => true,
        ]);
    }

    public function test_it_can_be_rerun_without_duplicating_hotels_or_prices(): void
    {
        $this->seed(ProductCategorySeeder::class);
        $this->seed(HotelRateSeeder::class);
        $this->seed(HotelRateSeeder::class);

        $this->assertSame(35, Hotel::query()->count());
        $this->assertSame(279, HotelPrice::query()->count());
        $this->assertSame(35, TravelProduct::query()->where('product_type', 'hotel')->count());
    }
}
