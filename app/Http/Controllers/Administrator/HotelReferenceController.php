<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreHotelCityRequest;
use App\Http\Requests\Administrator\StoreHotelCountryRequest;
use App\Http\Requests\Administrator\StoreHotelRoomTypeRequest;
use App\Http\Requests\Administrator\UpdateHotelCityRequest;
use App\Http\Requests\Administrator\UpdateHotelCountryRequest;
use App\Http\Requests\Administrator\UpdateHotelRoomTypeRequest;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelRoomType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HotelReferenceController extends Controller
{
    public function countries(Request $request): Response
    {
        $search = trim((string) $request->string('search')->value());

        $countries = HotelCountry::query()
            ->when($search !== '', fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (HotelCountry $country): array => [
                'id' => $country->id,
                'name' => $country->name,
                'is_active' => $country->is_active,
            ]);

        return Inertia::render('Dashboard/MasterData/HotelCountries/Index', [
            'countries' => $countries,
            'filters' => ['search' => $search],
            'stats' => [
                'total' => HotelCountry::query()->count(),
                'active' => HotelCountry::query()->where('is_active', true)->count(),
                'inactive' => HotelCountry::query()->where('is_active', false)->count(),
            ],
        ]);
    }

    public function storeCountry(StoreHotelCountryRequest $request): RedirectResponse
    {
        HotelCountry::query()->create($request->validated());

        return back()->with('success', 'Negara berhasil ditambahkan.');
    }

    public function updateCountry(UpdateHotelCountryRequest $request, HotelCountry $hotelCountry): RedirectResponse
    {
        $hotelCountry->update($request->validated());

        return back()->with('success', 'Negara berhasil diperbarui.');
    }

    public function destroyCountry(HotelCountry $hotelCountry): RedirectResponse
    {
        $hotelCountry->delete();

        return back()->with('success', 'Negara berhasil dihapus.');
    }

    public function cities(Request $request): Response
    {
        $search = trim((string) $request->string('search')->value());

        $cities = HotelCity::query()
            ->with('country:id,name')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhereHas('country', fn ($countryQuery) => $countryQuery->where('name', 'like', '%'.$search.'%'));
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (HotelCity $city): array => [
                'id' => $city->id,
                'country_id' => $city->country_id,
                'country_name' => $city->country?->name,
                'name' => $city->name,
                'is_active' => $city->is_active,
            ]);

        return Inertia::render('Dashboard/MasterData/HotelCities/Index', [
            'cities' => $cities,
            'filters' => ['search' => $search],
            'stats' => [
                'total' => HotelCity::query()->count(),
                'active' => HotelCity::query()->where('is_active', true)->count(),
                'inactive' => HotelCity::query()->where('is_active', false)->count(),
            ],
            'countryOptions' => HotelCountry::query()->orderBy('name')->get(['id', 'name'])
                ->map(fn (HotelCountry $country): array => ['id' => $country->id, 'name' => $country->name])
                ->values()->all(),
        ]);
    }

    public function storeCity(StoreHotelCityRequest $request): RedirectResponse
    {
        HotelCity::query()->create($request->validated());

        return back()->with('success', 'Kota berhasil ditambahkan.');
    }

    public function updateCity(UpdateHotelCityRequest $request, HotelCity $hotelCity): RedirectResponse
    {
        $hotelCity->update($request->validated());

        return back()->with('success', 'Kota berhasil diperbarui.');
    }

    public function destroyCity(HotelCity $hotelCity): RedirectResponse
    {
        $hotelCity->delete();

        return back()->with('success', 'Kota berhasil dihapus.');
    }

    public function roomTypes(Request $request): Response
    {
        $search = trim((string) $request->string('search')->value());

        $roomTypes = HotelRoomType::query()
            ->when($search !== '', fn ($query) => $query->where('name', 'like', '%'.$search.'%'))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (HotelRoomType $roomType): array => [
                'id' => $roomType->id,
                'name' => $roomType->name,
                'is_active' => $roomType->is_active,
            ]);

        return Inertia::render('Dashboard/MasterData/HotelRoomTypes/Index', [
            'roomTypes' => $roomTypes,
            'filters' => ['search' => $search],
            'stats' => [
                'total' => HotelRoomType::query()->count(),
                'active' => HotelRoomType::query()->where('is_active', true)->count(),
                'inactive' => HotelRoomType::query()->where('is_active', false)->count(),
            ],
        ]);
    }

    public function storeRoomType(StoreHotelRoomTypeRequest $request): RedirectResponse
    {
        HotelRoomType::query()->create($request->validated());

        return back()->with('success', 'Room type berhasil ditambahkan.');
    }

    public function updateRoomType(UpdateHotelRoomTypeRequest $request, HotelRoomType $hotelRoomType): RedirectResponse
    {
        $hotelRoomType->update($request->validated());

        return back()->with('success', 'Room type berhasil diperbarui.');
    }

    public function destroyRoomType(HotelRoomType $hotelRoomType): RedirectResponse
    {
        $hotelRoomType->delete();

        return back()->with('success', 'Room type berhasil dihapus.');
    }
}
