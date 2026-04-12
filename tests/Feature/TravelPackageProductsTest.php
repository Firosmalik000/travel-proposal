<?php

namespace Tests\Feature;

use App\Models\TravelPackage;
use App\Models\TravelProduct;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TravelPackageProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_package_can_have_multiple_products_with_sorted_pivot(): void
    {
        $package = TravelPackage::query()->create([
            'code' => 'PKG-001',
            'slug' => 'package-001',
            'name' => ['id' => 'Paket 001', 'en' => 'Package 001'],
            'package_type' => 'reguler',
            'departure_city' => 'Jakarta',
            'duration_days' => 10,
            'price' => 35000000,
            'currency' => 'IDR',
            'is_active' => true,
        ]);

        $visa = TravelProduct::query()->create([
            'code' => 'PRD-001',
            'slug' => 'visa',
            'name' => ['id' => 'Visa', 'en' => 'Visa'],
            'is_active' => true,
        ]);

        $hotel = TravelProduct::query()->create([
            'code' => 'PRD-002',
            'slug' => 'hotel',
            'name' => ['id' => 'Hotel', 'en' => 'Hotel'],
            'is_active' => true,
        ]);

        $package->products()->sync([
            $hotel->id => ['sort_order' => 2],
            $visa->id => ['sort_order' => 1],
        ]);

        $package->refresh();

        $this->assertCount(2, $package->products);
        $this->assertSame('Visa', $package->products->first()->name['id']);
    }
}
