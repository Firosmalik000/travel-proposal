<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreCurrencyRequest;
use App\Http\Requests\Administrator\UpdateCurrencyRequest;
use App\Models\Booking;
use App\Models\Currency;
use App\Models\Hotel;
use App\Models\TravelPackage;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CurrencyController extends Controller
{
    public function index(Request $request): Response
    {
        $search = strtoupper(trim((string) $request->string('search')->value()));
        $status = (string) $request->string('status')->value();

        $usageCounts = $this->usageCountsByCode();

        $currencies = Currency::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($inner) use ($search): void {
                    $inner
                        ->where('code', 'like', '%'.$search.'%')
                        ->orWhere('name', 'like', '%'.$search.'%');
                });
            })
            ->when($status === 'active', fn ($query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('is_active', false))
            ->orderBy('code')
            ->paginate(10)
            ->withQueryString()
            ->through(function (Currency $currency) use ($usageCounts): array {
                return [
                    'id' => $currency->id,
                    'code' => $currency->code,
                    'name' => $currency->name,
                    'conversion_rate' => (string) $currency->conversion_rate,
                    'notes' => $currency->notes,
                    'is_active' => $currency->is_active,
                    'usage_count' => (int) ($usageCounts[$currency->code] ?? 0),
                ];
            });

        return Inertia::render('Dashboard/MasterData/Currencies/Index', [
            'currencies' => $currencies,
            'filters' => [
                'search' => $search,
                'status' => in_array($status, ['all', 'active', 'inactive'], true) ? $status : 'all',
            ],
            'stats' => [
                'total' => Currency::query()->count(),
                'active' => Currency::query()->where('is_active', true)->count(),
                'inactive' => Currency::query()->where('is_active', false)->count(),
                'used' => collect($usageCounts)->filter(fn (int $count): bool => $count > 0)->count(),
            ],
        ]);
    }

    public function store(StoreCurrencyRequest $request): RedirectResponse
    {
        Currency::query()->create($this->payloadFromRequest($request));

        return back()->with('success', 'Currency berhasil ditambahkan.');
    }

    public function update(UpdateCurrencyRequest $request, Currency $currency): RedirectResponse
    {
        $currency->update($this->payloadFromRequest($request));

        return back()->with('success', 'Currency berhasil diperbarui.');
    }

    public function destroy(Currency $currency): RedirectResponse
    {
        $currency->update(['is_active' => false]);

        return back()->with('success', 'Currency berhasil dinonaktifkan.');
    }

    /**
     * @return array<string, int>
     */
    private function usageCountsByCode(): array
    {
        $counts = [];

        foreach ([
            $this->usageCountsFromQuery(Hotel::query()->whereNotNull('currency'), 'currency'),
            $this->usageCountsFromQuery(TravelPackage::query()->whereNotNull('currency'), 'currency'),
            $this->usageCountsFromQuery(Booking::query()->whereNotNull('custom_currency'), 'custom_currency'),
        ] as $source) {
            foreach ($source as $code => $total) {
                $counts[$code] = ($counts[$code] ?? 0) + $total;
            }
        }

        return $counts;
    }

    /**
     * @return Collection<string, int>
     */
    private function usageCountsFromQuery(Builder $query, string $column): Collection
    {
        return $query
            ->selectRaw('UPPER('.$column.') as code, COUNT(*) as total')
            ->groupByRaw('UPPER('.$column.')')
            ->get()
            ->mapWithKeys(fn ($row): array => [
                (string) $row->code => (int) ($row->total ?? 0),
            ]);
    }

    /**
     * @return array{code:string,name:string,conversion_rate:string,notes:?string,is_active:bool}
     */
    private function payloadFromRequest(FormRequest $request): array
    {
        return [
            'code' => strtoupper(trim((string) $request->string('code')->value())),
            'name' => trim((string) $request->string('name')->value()),
            'conversion_rate' => trim((string) $request->string('conversion_rate')->value()),
            'notes' => $request->filled('notes') ? trim((string) $request->string('notes')->value()) : null,
            'is_active' => $request->boolean('is_active', true),
        ];
    }
}
