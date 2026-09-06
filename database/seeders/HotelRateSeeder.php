<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelPrice;
use App\Models\HotelRoomType;
use App\Services\HotelProductSyncService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class HotelRateSeeder extends Seeder
{
    public function run(): void
    {
        $hotels = $this->snapshotHotels();

        DB::transaction(function () use ($hotels): void {
            foreach ($hotels as $hotelData) {
                $this->seedHotel($hotelData);
            }
        });
    }

    /** @return array<int, array<string, mixed>> */
    private function snapshotHotels(): array
    {
        $snapshotPath = database_path('seeders/data/hotel-rates.json');
        $snapshot = json_decode((string) file_get_contents($snapshotPath), true, flags: JSON_THROW_ON_ERROR);
        $hotels = $snapshot['hotels'] ?? null;

        if (! is_array($hotels)) {
            throw new RuntimeException('Snapshot hotel tidak valid.');
        }

        return $hotels;
    }

    /** @param array<string, mixed> $hotelData */
    private function seedHotel(array $hotelData): void
    {
        $country = $this->country((string) $hotelData['country']);
        $city = $this->city($country, (string) $hotelData['city']);
        $hotel = Hotel::withTrashed()
            ->where('code', (string) $hotelData['code'])
            ->first();

        if (! $hotel) {
            $hotel = Hotel::withTrashed()
                ->where('city_id', $city->id)
                ->where('name', (string) $hotelData['name'])
                ->firstOrNew();
        }

        $hotel->fill([
            'country_id' => $country->id,
            'city_id' => $city->id,
            'name' => (string) $hotelData['name'],
            'code' => (string) $hotelData['code'],
            'description' => $hotelData['description'] ?? null,
            'currency' => strtoupper((string) $hotelData['currency']),
            'is_active' => (bool) $hotelData['is_active'],
        ]);
        $hotel->save();

        if ($hotel->trashed()) {
            $hotel->restore();
        }

        HotelPrice::withTrashed()->where('hotel_id', $hotel->id)->forceDelete();

        foreach ((array) $hotelData['prices'] as $priceData) {
            $roomType = $this->roomType((string) $priceData['room_type']);

            $hotel->prices()->create([
                'broker_key' => $priceData['broker_key'] ?? null,
                'broker_name' => (string) ($priceData['broker_name'] ?? 'Broker 1'),
                'room_type_id' => $roomType->id,
                'period_start' => (string) $priceData['period_start'],
                'period_end' => (string) $priceData['period_end'],
                'price' => (int) $priceData['price'],
                'is_active' => (bool) $priceData['is_active'],
            ]);
        }

        app(HotelProductSyncService::class)->sync(
            $hotel->fresh(['country', 'city', 'prices.roomType']),
        );
    }

    private function country(string $name): HotelCountry
    {
        $country = HotelCountry::withTrashed()->firstOrNew(['name' => $name]);
        $country->is_active = true;
        $country->save();

        if ($country->trashed()) {
            $country->restore();
        }

        return $country;
    }

    private function city(HotelCountry $country, string $name): HotelCity
    {
        $city = HotelCity::withTrashed()->firstOrNew([
            'country_id' => $country->id,
            'name' => $name,
        ]);
        $city->is_active = true;
        $city->save();

        if ($city->trashed()) {
            $city->restore();
        }

        return $city;
    }

    private function roomType(string $name): HotelRoomType
    {
        $roomType = HotelRoomType::withTrashed()->firstOrNew(['name' => strtoupper($name)]);
        $roomType->is_active = true;
        $roomType->save();

        if ($roomType->trashed()) {
            $roomType->restore();
        }

        return $roomType;
    }
}
