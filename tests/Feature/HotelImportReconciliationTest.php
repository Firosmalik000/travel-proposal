<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelRoomType;
use App\Services\HotelImport\HotelImportReconciliationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class HotelImportReconciliationTest extends TestCase
{
    use RefreshDatabase;

    private HotelCountry $country;

    private HotelCity $city;

    /** @var array<string, HotelRoomType> */
    private array $roomTypes;

    protected function setUp(): void
    {
        parent::setUp();

        $this->country = HotelCountry::query()->create(['name' => 'Arab Saudi', 'is_active' => true]);
        $this->city = HotelCity::query()->create([
            'country_id' => $this->country->id,
            'name' => 'Mekkah',
            'is_active' => true,
        ]);
        $this->roomTypes = collect(['DBL', 'TRPL', 'QUAD'])
            ->mapWithKeys(fn (string $name): array => [
                strtolower($name) => HotelRoomType::query()->create(['name' => $name, 'is_active' => true]),
            ])
            ->all();
    }

    #[Test]
    public function it_marks_a_new_hotel_for_creation_and_groups_multiple_periods(): void
    {
        $result = $this->service()->reconcile([
            $this->row('NEW HOTEL', '2026-06-01', '2026-06-30', 100, 200, 300, source: 'csv'),
            $this->row('NEW HOTEL', '2026-07-01', '2026-07-31', 110, 210, 310, source: 'csv'),
        ]);

        self::assertCount(1, $result['hotels']);
        self::assertCount(2, $result['hotels'][0]['period_rates']);
        self::assertSame('create', $result['hotels'][0]['import_status']);
        self::assertSame(1, $result['summary']['hotels_to_create']);
    }

    #[Test]
    public function it_reconciles_no_change_update_partial_null_and_new_period(): void
    {
        $hotel = $this->hotel('Movenpick Hajar');
        $this->addPeriod($hotel, '2026-06-01', '2026-06-30', 100, 200, 300);

        $result = $this->service()->reconcile([
            $this->row('Movenpick-Hajar', '2026-06-01', '2026-06-30', 150, null, 300),
            $this->row('Movenpick-Hajar', '2026-07-01', '2026-07-31', 175, 275, 375),
        ]);

        $draft = $result['hotels'][0];
        self::assertSame('update', $draft['import_status']);
        self::assertSame('update', $draft['period_rates'][0]['comparison']['dbl']['action']);
        self::assertSame('keep_existing', $draft['period_rates'][0]['comparison']['trpl']['action']);
        self::assertSame('no_change', $draft['period_rates'][0]['comparison']['quad']['action']);
        self::assertSame('new_period', $draft['period_rates'][1]['import_status']);
    }

    #[Test]
    public function it_marks_conflicting_duplicate_rows_currency_and_inactive_hotels(): void
    {
        $hotel = $this->hotel('Conflict Hotel', currency: 'SAR', active: false);

        $result = $this->service()->reconcile([
            $this->row($hotel->name, '2026-06-01', '2026-06-30', 100, 200, 300, 'USD'),
            $this->row($hotel->name, '2026-06-01', '2026-06-30', 999, 200, 300, 'USD'),
        ]);

        self::assertSame('conflict', $result['hotels'][0]['import_status']);
        self::assertNotEmpty($result['hotels'][0]['conflicts']);
        self::assertCount(2, $result['hotels'][0]['period_rates']);
        self::assertNotEmpty($result['hotels'][0]['period_rates'][0]['conflicts']);
        self::assertNotEmpty($result['hotels'][0]['period_rates'][1]['conflicts']);
        self::assertGreaterThan(0, $result['summary']['conflicts']);
    }

    #[Test]
    public function it_applies_the_collective_currency_and_keeps_missing_rates_empty_with_hotel_context(): void
    {
        $row = $this->row('Hotel Partial Rate', '2026-06-01', '2026-06-30', 100, null, 300, '');

        $result = $this->service()->reconcile([$row], defaultCurrency: 'SAR');
        $draft = $result['hotels'][0];

        self::assertSame('SAR', $draft['currency']);
        self::assertNotContains('Mata uang belum ditentukan.', $draft['conflicts']);
        self::assertNull($draft['period_rates'][0]['trpl_price']);
        self::assertContains(
            'Hotel Partial Rate - periode 2026-06-01 sampai 2026-06-30: rate TRPL tidak terbaca dan dikosongkan.',
            $draft['period_rates'][0]['warnings'],
        );
    }

    private function service(): HotelImportReconciliationService
    {
        return $this->app->make(HotelImportReconciliationService::class);
    }

    /** @return array<string, mixed> */
    private function row(
        string $hotel,
        string $start,
        string $end,
        ?int $dbl,
        ?int $trpl,
        ?int $quad,
        string $currency = 'SAR',
        string $source = 'pdf',
    ): array {
        return [
            'country' => 'Arab Saudi',
            'city' => 'Makkah',
            'hotel' => $hotel,
            'currency' => $currency,
            'period_start' => $start,
            'period_end' => $end,
            'dbl' => $dbl,
            'trpl' => $trpl,
            'quad' => $quad,
            'source' => $source,
            'warnings' => [],
        ];
    }

    private function hotel(string $name, string $currency = 'SAR', bool $active = true): Hotel
    {
        return Hotel::query()->create([
            'country_id' => $this->country->id,
            'city_id' => $this->city->id,
            'name' => $name,
            'code' => 'HTL-'.strtoupper(str_replace(' ', '-', $name)),
            'currency' => $currency,
            'is_active' => $active,
        ]);
    }

    private function addPeriod(Hotel $hotel, string $start, string $end, int $dbl, int $trpl, int $quad): void
    {
        foreach (['dbl' => $dbl, 'trpl' => $trpl, 'quad' => $quad] as $type => $price) {
            $hotel->prices()->create([
                'broker_key' => 'broker-1',
                'broker_name' => 'Broker 1',
                'room_type_id' => $this->roomTypes[$type]->id,
                'period_start' => $start,
                'period_end' => $end,
                'price' => $price,
                'is_active' => true,
            ]);
        }
    }
}
