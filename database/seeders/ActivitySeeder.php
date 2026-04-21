<?php

namespace Database\Seeders;

use App\Models\Activity;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->activities() as $activity) {
            Activity::query()->updateOrCreate(
                ['code' => $activity['code']],
                $activity,
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function activities(): array
    {
        return [
            [
                'code' => 'ACT-DEPARTURE-BRIEFING',
                'name' => $this->loc('Briefing Keberangkatan', 'Departure Briefing'),
                'description' => $this->loc(
                    'Briefing akhir sebelum keberangkatan, pembagian dokumen perjalanan, dan koordinasi rombongan jamaah.',
                    'Final briefing before departure, travel document handover, and pilgrim group coordination.',
                ),
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-AIRPORT-HANDLING',
                'name' => $this->loc('Handling Bandara', 'Airport Handling'),
                'description' => $this->loc(
                    'Pendampingan proses check-in, bagasi, imigrasi, dan boarding di bandara keberangkatan.',
                    'Assistance for check-in, baggage, immigration, and boarding at the departure airport.',
                ),
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-DEPARTURE-FLIGHT',
                'name' => $this->loc('Penerbangan Keberangkatan', 'Departure Flight'),
                'description' => $this->loc(
                    'Perjalanan udara menuju tanah suci sesuai maskapai dan jadwal yang telah ditentukan.',
                    'Air travel to the holy land according to the selected airline and schedule.',
                ),
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-ARRIVAL-TRANSFER',
                'name' => $this->loc('Transfer Kedatangan', 'Arrival Transfer'),
                'description' => $this->loc(
                    'Penjemputan rombongan jamaah dari bandara menuju hotel atau kota tujuan pertama.',
                    'Pickup of pilgrims from the airport to the hotel or first destination city.',
                ),
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-HOTEL-CHECKIN',
                'name' => $this->loc('Check-in Hotel', 'Hotel Check-in'),
                'description' => $this->loc(
                    'Proses pembagian kamar, pembagian koper, dan orientasi awal setibanya di hotel.',
                    'Room assignment, luggage distribution, and initial orientation upon arrival at the hotel.',
                ),
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-MANASIK-ONSITE',
                'name' => $this->loc('Manasik di Lokasi', 'On-site Manasik'),
                'description' => $this->loc(
                    'Pembekalan manasik di lokasi untuk memastikan jamaah siap menjalankan rangkaian ibadah.',
                    'On-site manasik briefing to ensure pilgrims are ready to perform the worship sequence.',
                ),
                'sort_order' => 6,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-UMRAH-RITUAL',
                'name' => $this->loc('Pelaksanaan Umroh', 'Umrah Ritual'),
                'description' => $this->loc(
                    'Pelaksanaan rangkaian ibadah umroh yang meliputi ihram, thawaf, sa’i, dan tahallul dengan pendampingan pembimbing.',
                    'Execution of the umrah ritual sequence including ihram, tawaf, sa’i, and tahallul with guide assistance.',
                ),
                'sort_order' => 7,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-ZIARAH-MAKKAH',
                'name' => $this->loc('Ziarah Makkah', 'Makkah Pilgrimage Tour'),
                'description' => $this->loc(
                    'Kunjungan ke lokasi bersejarah di Makkah seperti Jabal Tsur, Jabal Rahmah, dan area sekitarnya.',
                    'Visits to historical sites in Makkah such as Jabal Thawr, Jabal Rahmah, and surrounding areas.',
                ),
                'sort_order' => 8,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-ZIARAH-MADINAH',
                'name' => $this->loc('Ziarah Madinah', 'Madinah Pilgrimage Tour'),
                'description' => $this->loc(
                    'Kunjungan ke lokasi bersejarah di Madinah seperti Masjid Quba, Jabal Uhud, dan kebun kurma.',
                    'Visits to historical sites in Madinah such as Quba Mosque, Jabal Uhud, and date farms.',
                ),
                'sort_order' => 9,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-FREE-IBADAH',
                'name' => $this->loc('Ibadah Mandiri', 'Free Worship Time'),
                'description' => $this->loc(
                    'Waktu bebas bagi jamaah untuk memperbanyak ibadah pribadi di Masjidil Haram atau Masjid Nabawi.',
                    'Free time for pilgrims to increase personal worship at Masjidil Haram or Masjid Nabawi.',
                ),
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-CITY-TRANSFER',
                'name' => $this->loc('Transfer Antar Kota', 'Intercity Transfer'),
                'description' => $this->loc(
                    'Perpindahan rombongan jamaah dari Makkah ke Madinah atau sebaliknya dengan bus atau kereta.',
                    'Transfer of the pilgrim group from Makkah to Madinah or vice versa by bus or train.',
                ),
                'sort_order' => 11,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-HOTEL-CHECKOUT',
                'name' => $this->loc('Check-out Hotel', 'Hotel Check-out'),
                'description' => $this->loc(
                    'Persiapan check-out hotel, pengumpulan bagasi, dan briefing untuk agenda berikutnya.',
                    'Hotel check-out preparation, luggage collection, and briefing for the next agenda.',
                ),
                'sort_order' => 12,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-RETURN-FLIGHT',
                'name' => $this->loc('Penerbangan Kepulangan', 'Return Flight'),
                'description' => $this->loc(
                    'Perjalanan udara kepulangan jamaah menuju Indonesia sesuai jadwal penerbangan yang ditetapkan.',
                    'Return air travel of the pilgrims to Indonesia according to the assigned flight schedule.',
                ),
                'sort_order' => 13,
                'is_active' => true,
            ],
            [
                'code' => 'ACT-ARRIVAL-HOME',
                'name' => $this->loc('Kedatangan di Tanah Air', 'Arrival Back Home'),
                'description' => $this->loc(
                    'Kedatangan rombongan jamaah di tanah air dan proses akhir penjemputan atau distribusi kepulangan.',
                    'Arrival of the pilgrim group back home and final pickup or return distribution process.',
                ),
                'sort_order' => 14,
                'is_active' => true,
            ],
        ];
    }

    private function loc(string $id, ?string $en = null): array
    {
        return [
            'id' => $id,
            'en' => $en ?? $id,
        ];
    }
}
