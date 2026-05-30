<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Hotel;
use App\Models\TravelPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function index(Request $request): Response
    {
        $search = strtoupper(trim((string) $request->string('search')->value()));

        $hotelCurrencies = Hotel::query()
            ->selectRaw('UPPER(currency) as code')
            ->whereNotNull('currency')
            ->pluck('code')
            ->filter(fn (?string $code): bool => is_string($code) && $code !== '');

        $packageCurrencies = TravelPackage::query()
            ->selectRaw('UPPER(currency) as code')
            ->whereNotNull('currency')
            ->pluck('code')
            ->filter(fn (?string $code): bool => is_string($code) && $code !== '');

        $customBookingCurrencies = Booking::query()
            ->selectRaw('UPPER(custom_currency) as code')
            ->whereNotNull('custom_currency')
            ->pluck('code')
            ->filter(fn (?string $code): bool => is_string($code) && $code !== '');

        $currencies = $hotelCurrencies
            ->merge($packageCurrencies)
            ->merge($customBookingCurrencies)
            ->unique()
            ->sort()
            ->values()
            ->map(fn (string $code): array => ['code' => $code])
            ->values();

        if ($search !== '') {
            $currencies = $currencies
                ->filter(fn (array $currency): bool => str_contains((string) ($currency['code'] ?? ''), $search))
                ->values();
        }

        return Inertia::render('Dashboard/MasterData/Currencies/Index', [
            'currencies' => $currencies,
            'filters' => [
                'search' => $search,
            ],
            'stats' => [
                'total' => $currencies->count(),
            ],
        ]);
    }
}
