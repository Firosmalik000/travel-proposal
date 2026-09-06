<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Services\LiveCurrencyRateService;
use Illuminate\Http\JsonResponse;

class CurrencyRateController extends Controller
{
    public function __construct(
        private readonly LiveCurrencyRateService $liveRateService,
    ) {}

    public function index(): JsonResponse
    {
        $codes = ['USD', 'SAR', 'EGP', 'EUR'];
        $rates = $this->liveRateService->ratesFor($codes);

        $formatted = [];
        foreach ($rates as $code => $rate) {
            $formatted[$code] = [
                'rate_to_idr' => $rate['rate_to_idr'],
                'source' => $rate['source'],
                'fetched_at' => $rate['fetched_at'],
                'is_live' => $rate['is_live'],
            ];
        }

        return response()->json([
            'rates' => $formatted,
            'last_update' => now()->toDateTimeString(),
        ]);
    }
}
