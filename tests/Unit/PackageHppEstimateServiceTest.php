<?php

namespace Tests\Unit;

use App\Models\TravelProduct;
use App\Services\PackageHppEstimateService;
use Tests\TestCase;

class PackageHppEstimateServiceTest extends TestCase
{
    public function test_it_calculates_estimated_hpp_and_revenue_using_package_selling_prices(): void
    {
        $estimate = app(PackageHppEstimateService::class)->calculate(
            [
                'customers' => ['single' => 1, 'dbl' => 2, 'trpl' => 2, 'quad' => 3],
                'product_cost_per_customer' => 2_000_000,
                'hotel_total' => 10_000_000,
                'tour_leader_fee' => 3_000_000,
                'muthawwif_fee' => 2_000_000,
                'other_cost' => 1_000_000,
            ],
            35_200_000,
            ['dbl' => 34_320_000, 'trpl' => 33_440_000, 'quad' => 32_560_000],
        );

        $this->assertSame(8, $estimate['customer_count']);
        $this->assertSame(16_000_000, $estimate['product_total']);
        $this->assertSame(32_000_000, $estimate['grand_total']);
        $this->assertSame(4_000_000, $estimate['hpp_per_customer']);
        $this->assertSame(268_400_000, $estimate['revenue_total']);
        $this->assertSame(236_400_000, $estimate['estimated_profit']);
    }

    public function test_quad_selling_price_changes_revenue_for_the_quad_hotel_scenario(): void
    {
        $estimateInput = [
            'customers' => ['single' => 0, 'dbl' => 0, 'trpl' => 3, 'quad' => 32],
            'tour_leader_fee' => 0,
            'tour_leader_fee_is_manual' => true,
            'muthawwif_fee' => 0,
            'muthawwif_fee_is_manual' => true,
        ];
        $service = app(PackageHppEstimateService::class);

        $initialEstimate = $service->calculate(
            $estimateInput,
            25_000_000,
            ['dbl' => 26_000_000, 'trpl' => 27_000_000, 'quad' => 28_000_000],
        );
        $updatedEstimate = $service->calculate(
            $estimateInput,
            25_000_000,
            ['dbl' => 26_000_000, 'trpl' => 27_000_000, 'quad' => 30_000_000],
        );

        $this->assertSame(977_000_000, $initialEstimate['revenue_total']);
        $this->assertSame(1_041_000_000, $updatedEstimate['revenue_total']);
        $this->assertSame(
            64_000_000,
            $updatedEstimate['estimated_profit'] - $initialEstimate['estimated_profit'],
        );
    }

    public function test_it_returns_no_per_customer_estimate_when_the_target_customer_is_empty(): void
    {
        $estimate = app(PackageHppEstimateService::class)->calculate([], 35_000_000, []);

        $this->assertSame(0, $estimate['customer_count']);
        $this->assertSame(0, $estimate['grand_total']);
        $this->assertNull($estimate['hpp_per_customer']);
    }

    public function test_it_converts_package_revenue_to_idr_without_converting_idr_costs(): void
    {
        $estimate = app(PackageHppEstimateService::class)->calculate(
            [
                'customers' => ['single' => 2],
                'product_cost_per_customer' => 100_000,
                'hotel_total' => 300_000,
            ],
            1_000,
            [],
            4_200,
            'SAR',
            'live',
            '2026-08-12 10:00:00',
        );

        $this->assertSame(2_000, $estimate['revenue_original_total']);
        $this->assertSame(8_400_000, $estimate['revenue_total']);
        $this->assertSame(4_850_000, $estimate['grand_total']);
        $this->assertSame(3_550_000, $estimate['estimated_profit']);
        $this->assertSame('SAR', $estimate['revenue_currency']);
        $this->assertSame(4_200.0, $estimate['conversion_rate_to_idr']);
        $this->assertSame('live', $estimate['conversion_rate_source']);
    }

    public function test_it_builds_product_and_highest_cost_hotel_breakdown_with_formula_fees(): void
    {
        $product = new TravelProduct([
            'code' => 'PRD-VISA',
            'name' => 'Visa',
            'product_type' => 'visa',
            'content' => ['price' => 100, 'currency' => 'IDR'],
        ]);
        $product->id = 10;
        $hotel = new TravelProduct([
            'code' => 'HTL-GRAND',
            'name' => 'Grand Hotel',
            'product_type' => 'hotel',
            'content' => [
                'currency' => 'IDR',
                'pricing' => [
                    ['broker_name' => 'Broker A', 'room_type' => 'DBL', 'period_start' => '2026-09-01', 'period_end' => '2026-09-30', 'price' => 1000],
                    ['broker_name' => 'Broker A', 'room_type' => 'TRPL', 'period_start' => '2026-09-01', 'period_end' => '2026-09-30', 'price' => 1200],
                    ['broker_name' => 'Broker A', 'room_type' => 'QUAD', 'period_start' => '2026-09-01', 'period_end' => '2026-09-30', 'price' => 1800],
                ],
            ],
        ]);
        $hotel->id = 20;

        $estimate = app(PackageHppEstimateService::class)->calculate(
            ['customers' => ['quad' => 8]],
            10_000,
            [],
            products: collect([$product, $hotel]),
            productMultipliers: ['10' => 2, '20' => 1],
            periodDate: '2026-09-16',
            hotelBrokerSelections: ['20' => 'Broker A'],
            currencySnapshots: ['IDR' => ['rate_to_idr' => 1]],
        );

        $this->assertSame(16, data_get($estimate, 'product_quantities.10'));
        $this->assertSame('rooms', $estimate['hotel_allocations_unit']);
        $this->assertSame(2, data_get($estimate, 'hotel_allocations.20.quad'));
        $this->assertSame(1600, $estimate['product_total']);
        $this->assertSame(3600, $estimate['hotel_total']);
        $this->assertSame(10_000, $estimate['tour_leader_fee']);
        $this->assertSame(450, $estimate['muthawwif_fee']);
        $this->assertSame(15_650, $estimate['grand_total']);
        $this->assertSame(64_350, $estimate['estimated_profit']);
        $this->assertCount(4, $estimate['items']);
    }

    public function test_it_allocates_estimated_hotel_rooms_quad_first_and_uses_triple_for_three_remaining_pax(): void
    {
        $hotel = new TravelProduct([
            'code' => 'HTL-RISK',
            'name' => 'Risk Hotel',
            'product_type' => 'hotel',
            'content' => [
                'currency' => 'IDR',
                'pricing' => [
                    ['room_type' => 'DBL', 'period_start' => '2026-09-01', 'period_end' => '2026-09-30', 'price' => 1000],
                    ['room_type' => 'TRPL', 'period_start' => '2026-09-01', 'period_end' => '2026-09-30', 'price' => 1200],
                    ['room_type' => 'QUAD', 'period_start' => '2026-09-01', 'period_end' => '2026-09-30', 'price' => 1800],
                ],
            ],
        ]);
        $hotel->id = 40;

        $estimate = app(PackageHppEstimateService::class)->calculate(
            ['customers' => ['quad' => 35]],
            10_000,
            [],
            products: collect([$hotel]),
            periodDate: '2026-09-16',
            currencySnapshots: ['IDR' => ['rate_to_idr' => 1]],
        );

        $this->assertSame(8, data_get($estimate, 'hotel_allocations.40.quad'));
        $this->assertSame(1, data_get($estimate, 'hotel_allocations.40.trpl'));
        $this->assertSame(0, data_get($estimate, 'hotel_allocations.40.dbl'));
        $this->assertSame(15_600, $estimate['hotel_total']);
        $this->assertSame(445, $estimate['muthawwif_fee']);
        $this->assertSame(350_000, data_get(collect($estimate['items'])->firstWhere('label', 'Fee Tour Leader'), 'meta.formula_base'));
        $this->assertSame(35, data_get(collect($estimate['items'])->firstWhere('label', 'Fee Muthawwif'), 'meta.customer_count'));

        $twentyCustomers = app(PackageHppEstimateService::class)->calculate(
            ['customers' => ['quad' => 20]],
            10_000,
            [],
            products: collect([$hotel]),
            periodDate: '2026-09-16',
            currencySnapshots: ['IDR' => ['rate_to_idr' => 1]],
        );

        $this->assertSame(5, data_get($twentyCustomers, 'hotel_allocations.40.quad'));
        $this->assertSame(0, data_get($twentyCustomers, 'hotel_allocations.40.trpl'));
        $this->assertSame(0, data_get($twentyCustomers, 'hotel_allocations.40.dbl'));
    }

    public function test_it_only_keeps_product_quantity_when_admin_marked_it_as_manual(): void
    {
        $product = new TravelProduct([
            'code' => 'PRD-MANUAL',
            'name' => 'Manual Product',
            'product_type' => 'visa',
            'content' => ['price' => 100, 'currency' => 'IDR'],
        ]);
        $product->id = 30;
        $service = app(PackageHppEstimateService::class);

        $automatic = $service->calculate(
            [
                'customers' => ['dbl' => 2],
                'product_quantities' => ['30' => 3],
                'product_quantities_is_manual' => ['30' => false],
                'tour_leader_fee' => 0,
                'muthawwif_fee' => 0,
            ],
            1000,
            [],
            products: collect([$product]),
            productMultipliers: ['30' => 2],
        );
        $manual = $service->calculate(
            [
                'customers' => ['dbl' => 2],
                'product_quantities' => ['30' => 3],
                'product_quantities_is_manual' => ['30' => true],
            ],
            1000,
            [],
            products: collect([$product]),
            productMultipliers: ['30' => 2],
        );

        $this->assertSame(4, data_get($automatic, 'product_quantities.30'));
        $this->assertSame(3, data_get($manual, 'product_quantities.30'));
        $this->assertSame(1000, $automatic['tour_leader_fee']);
        $this->assertFalse($automatic['tour_leader_fee_is_manual']);
        $this->assertFalse($automatic['muthawwif_fee_is_manual']);
    }

    public function test_it_converts_all_in_cost_to_idr_and_excludes_covered_products(): void
    {
        $coveredHotel = new TravelProduct([
            'code' => 'HTL-COVERED',
            'name' => 'Hotel Ditanggung Vendor',
            'product_type' => 'hotel',
            'content' => ['currency' => 'IDR', 'pricing' => []],
        ]);
        $coveredHotel->id = 71;
        $ticket = new TravelProduct([
            'code' => 'PRD-TICKET',
            'name' => 'Tiket Mandiri',
            'product_type' => 'tiket',
            'content' => ['price' => 50_000, 'currency' => 'IDR'],
        ]);
        $ticket->id = 72;

        $estimate = app(PackageHppEstimateService::class)->calculate(
            [
                'customers' => ['single' => 3],
                'tour_leader_fee' => 0,
                'tour_leader_fee_is_manual' => true,
                'muthawwif_fee' => 0,
                'muthawwif_fee_is_manual' => true,
            ],
            10_000_000,
            [],
            products: collect([$coveredHotel, $ticket]),
            currencySnapshots: [
                'IDR' => ['rate_to_idr' => 1],
                'SAR' => ['rate_to_idr' => 4_000, 'source' => 'snapshot'],
            ],
            allInConfiguration: [
                'enabled' => true,
                'vendor_id' => 5,
                'vendor_name_snapshot' => 'Vendor Makkah',
                'broker_package_name' => 'Land Arrangement',
                'currency' => 'SAR',
                'price_per_pax' => 100,
                'included_category_keys' => ['hotel'],
            ],
        );

        $this->assertSame(1_200_000, $estimate['all_in_total']);
        $this->assertSame(1_350_000, $estimate['product_total']);
        $this->assertSame(0, $estimate['hotel_total']);
        $this->assertSame(1_350_000, $estimate['grand_total']);
        $this->assertNotNull(collect($estimate['items'])->firstWhere('cost_type', 'all_in'));
        $this->assertNull(collect($estimate['items'])->firstWhere('reference_id', 71));
    }

    public function test_it_calculates_operational_cost_breakdown_with_currency_conversion(): void
    {
        $ticket = new TravelProduct([
            'code' => 'PRD-TICKET-OPS',
            'name' => 'Tiket Pesawat',
            'product_type' => 'tiket',
            'content' => ['price' => 100, 'currency' => 'IDR'],
        ]);
        $ticket->id = 81;
        $visa = new TravelProduct([
            'code' => 'PRD-VISA-OPS',
            'name' => 'Visa Umroh',
            'product_type' => 'perlengkapan',
            'content' => ['price' => 50, 'currency' => 'IDR'],
        ]);
        $visa->id = 82;

        $estimate = app(PackageHppEstimateService::class)->calculate(
            [
                'customers' => ['quad' => 4],
                'hotel_total' => 8_000,
                'operational_costs' => [
                    'overhead' => ['amount' => 10, 'mode' => 'per_pax'],
                    'photographer' => ['count' => 1, 'daily_salary' => 20, 'days' => 2],
                    'human_resources' => [
                        ['id' => 'admin', 'name' => 'Admin Tambahan', 'salary' => 30],
                        ['id' => 'helper', 'name' => 'Perbantuan', 'salary' => 20],
                    ],
                    'tour_leader' => [
                        'count' => 1,
                        'salary_per_trip' => 100,
                        'include_hotel' => true,
                        'include_ticket_and_visa' => true,
                    ],
                    'muthawwif' => [
                        'count' => 1,
                        'daily_salary' => 2,
                        'days' => 3,
                        'currency' => 'SAR',
                        'include_hotel' => true,
                    ],
                    'marketing' => ['amount_per_pax' => 5],
                    'guide_tips' => [[
                        'id' => 'guide-egypt',
                        'country' => 'Mesir',
                        'amount_per_day' => 1,
                        'days' => 2,
                        'currency' => 'USD',
                        'mode' => 'per_pax',
                    ]],
                    'driver_tips' => [[
                        'id' => 'driver-egypt',
                        'country' => 'Mesir',
                        'amount' => 100,
                        'currency' => 'IDR',
                    ]],
                ],
            ],
            100_000,
            [],
            products: collect([$ticket, $visa]),
            currencySnapshots: [
                'IDR' => ['rate_to_idr' => 1],
                'SAR' => ['rate_to_idr' => 4_000, 'source' => 'snapshot'],
                'USD' => ['rate_to_idr' => 15_000, 'source' => 'snapshot'],
            ],
        );

        $this->assertSame(600, $estimate['product_total']);
        $this->assertSame(8_000, $estimate['hotel_total']);
        $this->assertSame(2_250, $estimate['tour_leader_fee']);
        $this->assertSame(26_000, $estimate['muthawwif_fee']);
        $this->assertSame(148_485, $estimate['operational_total']);
        $this->assertSame(157_085, $estimate['grand_total']);
        $this->assertSame(39_271, $estimate['hpp_per_customer']);
        $this->assertNotNull(collect($estimate['items'])->firstWhere('label', 'SDM - Admin Tambahan'));
        $this->assertNotNull(collect($estimate['items'])->firstWhere('label', 'Tips Guide Mesir'));
        $this->assertEmpty($estimate['warnings']);
    }
}
