<?php

namespace Database\Seeders;

use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelRoomType;
use App\Services\HotelProductSyncService;
use Illuminate\Database\Seeder;

class HotelRateSeeder extends Seeder
{
    public function run(): void
    {
        $country = HotelCountry::query()->firstOrCreate(['name' => 'Arab Saudi'], ['is_active' => true]);
        $mekkah = HotelCity::query()->firstOrCreate(['country_id' => $country->id, 'name' => 'Mekkah'], ['is_active' => true]);
        $madinah = HotelCity::query()->firstOrCreate(['country_id' => $country->id, 'name' => 'Madinah'], ['is_active' => true]);

        $dbl = HotelRoomType::query()->firstOrCreate(['name' => 'DBL'], ['is_active' => true]);
        $trpl = HotelRoomType::query()->firstOrCreate(['name' => 'TRPL'], ['is_active' => true]);
        $quad = HotelRoomType::query()->firstOrCreate(['name' => 'QUAD'], ['is_active' => true]);

        $mekkahRates = [
            ['name' => 'Movenpick Hajar', 'code' => 'HTL-MOVENPICK-HAJAR', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-08-30', 'dbl' => 1050, 'trpl' => 1275, 'quad' => 1500],
                ['from' => '2026-08-31', 'to' => '2026-10-11', 'dbl' => 1100, 'trpl' => 1325, 'quad' => 1550],
                ['from' => '2026-10-12', 'to' => '2026-12-16', 'dbl' => 1250, 'trpl' => 1500, 'quad' => 1750],
            ]],
            ['name' => 'Al Safwa Tower', 'code' => 'HTL-ALSAFWA-TOWER', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-07-08', 'dbl' => 925, 'trpl' => 1125, 'quad' => 1325],
                ['from' => '2026-07-09', 'to' => '2026-08-31', 'dbl' => 800, 'trpl' => 1000, 'quad' => 1200],
                ['from' => '2026-09-01', 'to' => '2026-10-11', 'dbl' => 850, 'trpl' => 1050, 'quad' => 1250],
            ]],
            ['name' => 'Al Marwa Rotana', 'code' => 'HTL-ALMARWA-ROTANA', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-07-08', 'dbl' => 1180, 'trpl' => 1450, 'quad' => 1720],
                ['from' => '2026-07-09', 'to' => '2026-09-30', 'dbl' => 1100, 'trpl' => 1370, 'quad' => 1640],
                ['from' => '2026-10-01', 'to' => '2026-12-16', 'dbl' => 1250, 'trpl' => 1520, 'quad' => 1790],
            ]],
            ['name' => 'Azka Al Maqam', 'code' => 'HTL-AZKA-ALMAQAM', 'periods' => [
                ['from' => '2026-06-20', 'to' => '2026-07-01', 'dbl' => 540, 'trpl' => 610, 'quad' => 680],
                ['from' => '2026-07-01', 'to' => '2026-08-01', 'dbl' => 590, 'trpl' => 680, 'quad' => 770],
                ['from' => '2026-08-01', 'to' => '2026-09-01', 'dbl' => 620, 'trpl' => 720, 'quad' => 820],
            ]],
            ['name' => 'Olayan Ajyad', 'code' => 'HTL-OLAYAN-AJYAD', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-07-31', 'dbl' => 580, 'trpl' => 680, 'quad' => 780],
                ['from' => '2026-07-31', 'to' => '2026-10-04', 'dbl' => 660, 'trpl' => 760, 'quad' => 860],
            ]],
            ['name' => 'Snood Ajyad', 'code' => 'HTL-SNOOD-AJYAD', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-07-31', 'dbl' => 380, 'trpl' => 425, 'quad' => 470],
                ['from' => '2026-08-01', 'to' => '2026-10-04', 'dbl' => 430, 'trpl' => 475, 'quad' => 520],
            ]],
            ['name' => 'Sawaed Al Khaier', 'code' => 'HTL-SAWAED-ALKHAIER', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-07-19', 'dbl' => 420, 'trpl' => 465, 'quad' => 510],
            ]],
            ['name' => 'Maysan Al Maqam', 'code' => 'HTL-MAYSAN-ALMAQAM', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-07-31', 'dbl' => 390, 'trpl' => 440, 'quad' => 490],
                ['from' => '2026-08-01', 'to' => '2026-09-12', 'dbl' => 450, 'trpl' => 500, 'quad' => 550],
            ]],
            ['name' => 'Prestige Ajyad', 'code' => 'HTL-PRESTIGE-AJYAD', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-06-30', 'dbl' => 475, 'trpl' => 550, 'quad' => 625],
                ['from' => '2026-07-01', 'to' => '2026-07-31', 'dbl' => 500, 'trpl' => 575, 'quad' => 650],
                ['from' => '2026-08-01', 'to' => '2026-10-04', 'dbl' => 625, 'trpl' => 725, 'quad' => 825],
            ]],
            ['name' => 'Wahat Ajyad', 'code' => 'HTL-WAHAT-AJYAD', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-07-31', 'dbl' => 290, 'trpl' => 330, 'quad' => 370],
                ['from' => '2026-08-01', 'to' => '2026-10-04', 'dbl' => 310, 'trpl' => 350, 'quad' => 390],
            ]],
            ['name' => 'Nada Ajyad', 'code' => 'HTL-NADA-AJYAD', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-07-15', 'dbl' => 520, 'trpl' => 430, 'quad' => 480],
                ['from' => '2026-07-15', 'to' => '2026-09-12', 'dbl' => 530, 'trpl' => 420, 'quad' => 470],
            ]],
            ['name' => 'Al Massa Grand', 'code' => 'HTL-ALMASSA-GRAND', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-07-15', 'dbl' => 470, 'trpl' => 390, 'quad' => 440],
                ['from' => '2026-07-15', 'to' => '2026-09-12', 'dbl' => 490, 'trpl' => 370, 'quad' => 420],
                ['from' => '2026-09-12', 'to' => '2026-12-16', 'dbl' => 575, 'trpl' => 475, 'quad' => 525],
            ]],
            ['name' => 'Al Massa Dar Fayzeen', 'code' => 'HTL-ALMASSA-DARFAYZEEN', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-07-31', 'dbl' => 370, 'trpl' => 310, 'quad' => 350],
                ['from' => '2026-08-01', 'to' => '2026-09-12', 'dbl' => 390, 'trpl' => 290, 'quad' => 330],
                ['from' => '2026-09-12', 'to' => '2026-12-16', 'dbl' => 520, 'trpl' => 420, 'quad' => 470],
            ]],
            ['name' => 'Maather Al Jiwaar', 'code' => 'HTL-MAATHER-ALJIWAAR', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-07-31', 'dbl' => 330, 'trpl' => 370, 'quad' => 410],
            ]],
            ['name' => 'Tara Al Hijra', 'code' => 'HTL-TARA-ALHIJRA', 'periods' => [
                ['from' => '2026-06-16', 'to' => '2026-07-15', 'dbl' => 260, 'trpl' => 300, 'quad' => 340],
            ]],
            ['name' => 'Badr Al Massa', 'code' => 'HTL-BADR-ALMASSA', 'periods' => [
                ['from' => '2026-07-15', 'to' => '2026-09-12', 'dbl' => 285, 'trpl' => 325, 'quad' => 365],
                ['from' => '2026-09-12', 'to' => '2026-12-16', 'dbl' => 300, 'trpl' => 340, 'quad' => 380],
            ]],
            ['name' => 'Saif Al Yamani', 'code' => 'HTL-SAIF-ALYAMANI', 'periods' => [
                ['from' => '2026-07-01', 'to' => '2026-08-01', 'dbl' => 170, 'trpl' => 170, 'quad' => 170],
                ['from' => '2026-08-01', 'to' => '2026-09-01', 'dbl' => 200, 'trpl' => 200, 'quad' => 200],
            ]],
        ];

        $madinahRates = [
            ['name' => 'Taibah Front', 'code' => 'HTL-TAIBAH-FRONT', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-14', 'dbl' => 700, 'trpl' => 825, 'quad' => 950],
                ['from' => '2026-08-15', 'to' => '2026-09-20', 'dbl' => 750, 'trpl' => 875, 'quad' => 1000],
            ]],
            ['name' => 'Dar Al Eiman Al Haram', 'code' => 'HTL-DAREIMAN-ALHARAM', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-15', 'dbl' => 800, 'trpl' => 925, 'quad' => 1050],
                ['from' => '2026-08-15', 'to' => '2026-11-11', 'dbl' => 900, 'trpl' => 1025, 'quad' => 1150],
            ]],
            ['name' => 'Millineum Al Aqeeq', 'code' => 'HTL-MILLINEUM-ALAQEEQ', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-14', 'dbl' => 750, 'trpl' => 875, 'quad' => 1000],
                ['from' => '2026-08-15', 'to' => '2026-09-20', 'dbl' => 800, 'trpl' => 925, 'quad' => 1050],
                ['from' => '2026-11-11', 'to' => '2026-12-10', 'dbl' => 1100, 'trpl' => 1225, 'quad' => 1350],
            ]],
            ['name' => 'Ruve', 'code' => 'HTL-RUVE', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-14', 'dbl' => 700, 'trpl' => 825, 'quad' => 950],
                ['from' => '2026-08-15', 'to' => '2026-09-20', 'dbl' => 725, 'trpl' => 850, 'quad' => 975],
            ]],
            ['name' => 'Grand Plaza', 'code' => 'HTL-GRAND-PLAZA', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-14', 'dbl' => 500, 'trpl' => 570, 'quad' => 640],
                ['from' => '2026-08-15', 'to' => '2026-09-20', 'dbl' => 525, 'trpl' => 595, 'quad' => 665],
            ]],
            ['name' => 'Al Ansar Golden Tuilp', 'code' => 'HTL-ALANSAR-GOLDENTUILP', 'periods' => [
                ['from' => '2026-07-15', 'to' => '2026-08-01', 'dbl' => 490, 'trpl' => 535, 'quad' => 580],
                ['from' => '2026-08-01', 'to' => '2026-09-01', 'dbl' => 510, 'trpl' => 555, 'quad' => 600],
                ['from' => '2026-09-01', 'to' => '2026-10-01', 'dbl' => 530, 'trpl' => 575, 'quad' => 620],
            ]],
            ['name' => 'Jiwar Al Saha', 'code' => 'HTL-JIWAR-ALSAHA', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-07-31', 'dbl' => 440, 'trpl' => 490, 'quad' => 540],
                ['from' => '2026-08-01', 'to' => '2026-09-01', 'dbl' => 430, 'trpl' => 480, 'quad' => 530],
                ['from' => '2026-09-01', 'to' => '2026-10-05', 'dbl' => 450, 'trpl' => 500, 'quad' => 550],
            ]],
            ['name' => 'Zowar International', 'code' => 'HTL-ZOWAR-INTERNATIONAL', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-14', 'dbl' => 485, 'trpl' => 530, 'quad' => 575],
                ['from' => '2026-08-15', 'to' => '2026-09-20', 'dbl' => 460, 'trpl' => 505, 'quad' => 550],
            ]],
            ['name' => 'Odest', 'code' => 'HTL-ODEST', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-14', 'dbl' => 460, 'trpl' => 505, 'quad' => 550],
                ['from' => '2026-08-15', 'to' => '2026-09-20', 'dbl' => 430, 'trpl' => 475, 'quad' => 520],
            ]],
            ['name' => 'Deyar Al Eiman', 'code' => 'HTL-DEYAR-ALEIMAN', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-14', 'dbl' => 525, 'trpl' => 575, 'quad' => 625],
                ['from' => '2026-08-15', 'to' => '2026-11-11', 'dbl' => 475, 'trpl' => 525, 'quad' => 575],
                ['from' => '2026-11-11', 'to' => '2026-12-10', 'dbl' => 575, 'trpl' => 625, 'quad' => 675],
            ]],
            ['name' => 'Durrat El Eiman', 'code' => 'HTL-DURRAT-ELEIMAN', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-14', 'dbl' => 475, 'trpl' => 525, 'quad' => 575],
                ['from' => '2026-08-15', 'to' => '2026-11-11', 'dbl' => 425, 'trpl' => 475, 'quad' => 525],
                ['from' => '2026-11-11', 'to' => '2026-12-10', 'dbl' => 525, 'trpl' => 575, 'quad' => 625],
            ]],
            ['name' => 'Golden Tulip Alshakereen', 'code' => 'HTL-GOLDENTULIP-ALSHAKEREEN', 'periods' => [
                ['from' => '2026-06-20', 'to' => '2026-07-25', 'dbl' => 420, 'trpl' => 465, 'quad' => 510],
                ['from' => '2026-07-25', 'to' => '2026-08-23', 'dbl' => 390, 'trpl' => 435, 'quad' => 480],
                ['from' => '2026-08-23', 'to' => '2026-09-15', 'dbl' => 450, 'trpl' => 495, 'quad' => 540],
            ]],
            ['name' => 'Manazel Al Safiyah', 'code' => 'HTL-MANAZEL-ALSAFIYAH', 'periods' => [
                ['from' => '2026-06-20', 'to' => '2026-07-25', 'dbl' => 410, 'trpl' => 455, 'quad' => 500],
                ['from' => '2026-07-25', 'to' => '2026-08-23', 'dbl' => 380, 'trpl' => 425, 'quad' => 470],
                ['from' => '2026-08-23', 'to' => '2026-09-15', 'dbl' => 440, 'trpl' => 485, 'quad' => 530],
            ]],
            ['name' => 'Al Mokhtara Al Gharbi', 'code' => 'HTL-ALMOKHTARA-ALGHARBI', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-14', 'dbl' => 360, 'trpl' => 400, 'quad' => 440],
                ['from' => '2026-08-15', 'to' => '2026-11-11', 'dbl' => 340, 'trpl' => 380, 'quad' => 420],
                ['from' => '2026-11-11', 'to' => '2026-12-10', 'dbl' => 420, 'trpl' => 460, 'quad' => 500],
            ]],
            ['name' => 'Nusk Al Eiman', 'code' => 'HTL-NUSK-ALEIMAN', 'periods' => [
                ['from' => '2026-06-30', 'to' => '2026-08-14', 'dbl' => 460, 'trpl' => 510, 'quad' => 560],
                ['from' => '2026-08-15', 'to' => '2026-11-11', 'dbl' => 370, 'trpl' => 415, 'quad' => 480],
            ]],
        ];

        $this->seedRatesByCity($country->id, $mekkah->id, $mekkahRates, $dbl->id, $trpl->id, $quad->id);
        $this->seedRatesByCity($country->id, $madinah->id, $madinahRates, $dbl->id, $trpl->id, $quad->id);
    }

    /**
     * @param  array<int, array{name: string, code: string, periods: array<int, array{from: string, to: string, dbl: int, trpl: int, quad: int}>}>  $rates
     */
    private function seedRatesByCity(
        int $countryId,
        int $cityId,
        array $rates,
        int $dblRoomTypeId,
        int $trplRoomTypeId,
        int $quadRoomTypeId,
    ): void {
        $syncService = app(HotelProductSyncService::class);

        foreach ($rates as $hotelRate) {
            $hotel = Hotel::query()->firstOrCreate(
                ['name' => $hotelRate['name'], 'city_id' => $cityId],
                [
                    'country_id' => $countryId,
                    'code' => $hotelRate['code'],
                    'currency' => 'IDR',
                    'is_active' => true,
                ],
            );

            $hotel->update([
                'country_id' => $countryId,
                'city_id' => $cityId,
                'currency' => 'IDR',
                'is_active' => true,
            ]);

            $hotel->prices()->delete();

            foreach ($hotelRate['periods'] as $period) {
                $hotel->prices()->create([
                    'room_type_id' => $dblRoomTypeId,
                    'period_start' => $period['from'],
                    'period_end' => $period['to'],
                    'price' => $period['dbl'],
                    'is_active' => true,
                ]);

                $hotel->prices()->create([
                    'room_type_id' => $trplRoomTypeId,
                    'period_start' => $period['from'],
                    'period_end' => $period['to'],
                    'price' => $period['trpl'],
                    'is_active' => true,
                ]);

                $hotel->prices()->create([
                    'room_type_id' => $quadRoomTypeId,
                    'period_start' => $period['from'],
                    'period_end' => $period['to'],
                    'price' => $period['quad'],
                    'is_active' => true,
                ]);
            }

            $syncService->sync($hotel->fresh('prices.roomType', 'country', 'city'));
        }
    }
}
