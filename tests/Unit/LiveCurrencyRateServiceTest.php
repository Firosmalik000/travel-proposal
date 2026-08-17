<?php

namespace Tests\Unit;

use App\Services\CurrencyConversionService;
use App\Services\LiveCurrencyRateService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LiveCurrencyRateServiceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
        config()->set('services.currency.live.enabled', true);
        config()->set('services.currency.live.endpoint', 'https://rates.test/latest/IDR');
    }

    public function test_it_resolves_foreign_currency_to_idr_from_live_provider(): void
    {
        Http::fake([
            'rates.test/*' => Http::response([
                'result' => 'success',
                'rates' => ['IDR' => 1, 'USD' => 0.0000625],
            ]),
        ]);

        $rate = app(LiveCurrencyRateService::class)->rateFor('USD');

        $this->assertSame(16_000.0, $rate['rate_to_idr']);
        $this->assertSame('live', $rate['source']);
        $this->assertTrue($rate['is_live']);
        $this->assertSame(32_000, app(CurrencyConversionService::class)->convertToIdr(2, 'USD'));
    }

    public function test_it_uses_the_last_successful_live_rate_when_the_provider_fails(): void
    {
        Http::fake(['rates.test/*' => Http::response([
            'result' => 'success',
            'rates' => ['IDR' => 1, 'SAR' => 0.0002],
        ])]);
        app(LiveCurrencyRateService::class)->rateFor('SAR');
        Cache::forget('currency.live-rates.idr');
        config()->set('services.currency.live.enabled', false);

        $rate = app(LiveCurrencyRateService::class)->rateFor('SAR');

        $this->assertSame(5_000.0, $rate['rate_to_idr']);
        $this->assertSame('cached_live', $rate['source']);
        $this->assertFalse($rate['is_live']);
    }
}
