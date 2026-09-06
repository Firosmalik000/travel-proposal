<?php

namespace Tests\Feature;

use App\Models\ProductCategory;
use App\Models\TravelProduct;
use Database\Seeders\ProductCategorySeeder;
use Database\Seeders\ProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_the_product_categories_and_products_from_the_hpp_reference(): void
    {
        $this->seed(ProductCategorySeeder::class);
        $this->seed(ProductSeeder::class);

        $this->assertEqualsCanonicalizing([
            'hotel',
            'maskapai',
            'perlengkapan',
            'transportasi',
            'visa',
            'manasik',
            'handling-indonesia',
            'handling-saudi-arabia',
        ], ProductCategory::query()->where('is_active', true)->pluck('key')->all());
        $this->assertSame(49, TravelProduct::query()->count());

        $this->assertDatabaseHas('products', [
            'code' => 'PRD-VISA-AUFA-BUS',
            'product_type' => 'visa',
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('products', [
            'code' => 'PRD-MNS-NOV-HONOR',
            'product_type' => 'manasik',
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('products', [
            'code' => 'PRD-HSA-NOV-2026',
            'product_type' => 'handling-saudi-arabia',
            'is_active' => true,
        ]);

        $qatar = TravelProduct::query()->where('code', 'PRD-MSK-QATAR-DOH')->firstOrFail();
        $thaifBus = TravelProduct::query()->where('code', 'PRD-TRN-THAIF-BUS')->firstOrFail();

        $this->assertFalse($qatar->is_active);
        $this->assertSame('flat', data_get($thaifBus->content, 'pricing_mode'));
        $this->assertSame(4763, data_get($thaifBus->content, 'currency_rate_snapshot.rate_to_idr'));
    }

    public function test_it_removes_non_reference_master_data_without_overwriting_reference_product_edits(): void
    {
        ProductCategory::query()->create([
            'key' => 'custom-category',
            'name' => 'Custom Category',
            'sort_order' => 99,
            'is_active' => true,
        ]);
        TravelProduct::query()->create([
            'code' => 'PRD-CUSTOM',
            'slug' => 'custom-product',
            'name' => 'Custom Product',
            'product_type' => 'custom-category',
            'content' => ['price' => 1000, 'currency' => 'IDR'],
            'is_active' => true,
        ]);

        $this->seed(ProductCategorySeeder::class);
        $this->seed(ProductSeeder::class);

        $product = TravelProduct::query()->where('code', 'PRD-VISA-AUFA-ONLY')->firstOrFail();
        $content = $product->content;
        $content['price'] = 999;
        $product->update(['content' => $content]);

        $this->seed(ProductCategorySeeder::class);
        $this->seed(ProductSeeder::class);

        $this->assertSame(49, TravelProduct::query()->count());
        $this->assertSame(999, data_get($product->fresh()->content, 'price'));
        $this->assertFalse(TravelProduct::query()->where('code', 'PRD-CUSTOM')->exists());
        $this->assertFalse(ProductCategory::query()->where('key', 'custom-category')->exists());
    }
}
