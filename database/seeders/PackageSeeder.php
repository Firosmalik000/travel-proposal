<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\DepartureSchedule;
use App\Models\PackageItinerary;
use App\Models\ProductCategory;
use App\Models\Testimonial;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $products = $this->seedProducts();
        $packages = $this->seedPackages($products);
        $this->seedSchedules($packages);
        $this->seedItineraries($packages, $products);
        $this->seedTestimonials($packages);
    }

    private function loc(string $id, string $en = ''): string
    {
        return $id;
    }

    private function seedProducts(): array
    {
        $categories = [
            ['key' => 'hotel', 'name' => $this->loc('Hotel', 'Hotel'), 'sort_order' => 1],
            ['key' => 'tiket', 'name' => $this->loc('Tiket', 'Ticket'), 'sort_order' => 2],
            ['key' => 'merchandise', 'name' => $this->loc('Merchandise', 'Merchandise'), 'sort_order' => 3],
            ['key' => 'perlengkapan', 'name' => $this->loc('Perlengkapan', 'Equipment'), 'sort_order' => 4],
        ];

        foreach ($categories as $category) {
            ProductCategory::query()->updateOrCreate(
                ['key' => $category['key']],
                array_merge($category, ['description' => $this->loc(''), 'is_active' => true]),
            );
        }

        $rows = [
            [
                'code' => 'PRD-VISA',
                'slug' => 'visa-umroh',
                'name' => $this->loc('Visa Umroh', 'Umrah Visa'),
                'product_type' => 'perlengkapan',
                'description' => $this->loc('Pengurusan visa resmi Kerajaan Arab Saudi.', 'Official Saudi Arabia visa processing.'),
                'content' => ['unit' => $this->loc('per jamaah', 'per pilgrim'), 'price' => 3500000, 'currency' => 'IDR'],
            ],
            [
                'code' => 'PRD-PASPOR',
                'slug' => 'pengurusan-paspor',
                'name' => $this->loc('Pengurusan Paspor', 'Passport Processing'),
                'product_type' => 'perlengkapan',
                'description' => $this->loc('Bantuan pengurusan paspor baru atau perpanjangan.', 'Assistance for new or renewal passport processing.'),
                'content' => ['unit' => $this->loc('per jamaah', 'per pilgrim'), 'price' => 1200000, 'currency' => 'IDR'],
            ],
            [
                'code' => 'PRD-TIKET-GA',
                'slug' => 'tiket-garuda',
                'name' => $this->loc('Tiket Garuda Indonesia', 'Garuda Indonesia Ticket'),
                'product_type' => 'tiket',
                'description' => $this->loc('Tiket penerbangan PP dengan Garuda Indonesia.', 'Round-trip flight ticket with Garuda Indonesia.'),
                'content' => ['unit' => $this->loc('round trip', 'round trip'), 'price' => 18500000, 'currency' => 'IDR'],
            ],
            [
                'code' => 'PRD-TIKET-SV',
                'slug' => 'tiket-saudia',
                'name' => $this->loc('Tiket Saudia Airlines', 'Saudia Airlines Ticket'),
                'product_type' => 'tiket',
                'description' => $this->loc('Tiket penerbangan PP dengan Saudia Airlines.', 'Round-trip flight ticket with Saudia Airlines.'),
                'content' => ['unit' => $this->loc('round trip', 'round trip'), 'price' => 16900000, 'currency' => 'IDR'],
            ],
            [
                'code' => 'PRD-BUS',
                'slug' => 'transportasi-bus',
                'name' => $this->loc('Bus Selama Perjalanan', 'Bus During Trip'),
                'product_type' => 'tiket',
                'description' => $this->loc('Transportasi bus AC selama di tanah suci.', 'Air-conditioned bus transportation in the holy land.'),
                'content' => ['unit' => $this->loc('per paket', 'per package'), 'price' => 4500000, 'currency' => 'IDR'],
            ],
            [
                'code' => 'PRD-HOTEL-3',
                'slug' => 'hotel-bintang-3',
                'name' => $this->loc('Hotel Bintang 3', '3-Star Hotel'),
                'product_type' => 'hotel',
                'description' => $this->loc('Akomodasi hotel bintang 3 di Makkah dan Madinah.', '3-star hotel accommodation in Makkah and Madinah.'),
                'content' => ['unit' => $this->loc('per kamar quad', 'per quad room')],
            ],
            [
                'code' => 'PRD-HOTEL-4',
                'slug' => 'hotel-bintang-4',
                'name' => $this->loc('Hotel Bintang 4', '4-Star Hotel'),
                'product_type' => 'hotel',
                'description' => $this->loc('Akomodasi hotel bintang 4 dekat Masjidil Haram.', '4-star hotel near Masjidil Haram.'),
                'content' => ['unit' => $this->loc('per kamar triple', 'per triple room')],
            ],
            [
                'code' => 'PRD-HOTEL-5',
                'slug' => 'hotel-bintang-5',
                'name' => $this->loc('Hotel Bintang 5', '5-Star Hotel'),
                'product_type' => 'hotel',
                'description' => $this->loc('Hotel mewah dengan jarak sangat dekat ke Masjidil Haram.', 'Luxury hotel very close to Masjidil Haram.'),
                'content' => ['unit' => $this->loc('per kamar double', 'per double room')],
            ],
            [
                'code' => 'PRD-MANASIK',
                'slug' => 'manasik-pembimbing',
                'name' => $this->loc('Manasik & Pembimbing', 'Manasik & Worship Guide'),
                'product_type' => 'perlengkapan',
                'description' => $this->loc('Manasik sebelum berangkat dan pendampingan ustadz selama ibadah.', 'Pre-departure manasik and ustadz guidance during worship.'),
                'content' => ['unit' => $this->loc('per paket', 'per package'), 'price' => 1750000, 'currency' => 'IDR'],
            ],
            [
                'code' => 'PRD-MAKAN',
                'slug' => 'konsumsi-katering',
                'name' => $this->loc('Konsumsi & Katering', 'Meals & Catering'),
                'product_type' => 'perlengkapan',
                'description' => $this->loc('Makan 3x sehari dengan menu Indonesia selama di tanah suci.', '3 meals per day with Indonesian menu during the trip.'),
                'content' => ['unit' => $this->loc('per jamaah', 'per pilgrim'), 'price' => 3200000, 'currency' => 'IDR'],
            ],
            [
                'code' => 'PRD-HANDLING',
                'slug' => 'handling-bandara',
                'name' => $this->loc('Handling Bandara', 'Airport Handling'),
                'product_type' => 'perlengkapan',
                'description' => $this->loc('Pendampingan check-in, bagasi, dan grouping jamaah di bandara.', 'Assistance for check-in, baggage, and pilgrim grouping at the airport.'),
                'content' => ['unit' => $this->loc('per keberangkatan', 'per departure'), 'price' => 1250000, 'currency' => 'IDR'],
            ],
            [
                'code' => 'PRD-CITYTOUR',
                'slug' => 'city-tour-ziarah',
                'name' => $this->loc('City Tour & Ziarah', 'City Tour & Ziarah'),
                'product_type' => 'perlengkapan',
                'description' => $this->loc('Program ziarah dan kunjungan lokasi penting di Makkah dan Madinah.', 'Ziarah program and visits to important sites in Makkah and Madinah.'),
                'content' => ['unit' => $this->loc('per paket', 'per package'), 'price' => 2400000, 'currency' => 'IDR'],
            ],
            [
                'code' => 'PRD-PERLENGKAPAN',
                'slug' => 'perlengkapan-umroh',
                'name' => $this->loc('Perlengkapan Umroh', 'Umrah Equipment'),
                'product_type' => 'merchandise',
                'description' => $this->loc('Koper, kain ihram, buku panduan, dan tas jamaah.', 'Luggage, ihram cloth, guidebook, and pilgrim bag.'),
                'content' => ['unit' => $this->loc('per jamaah', 'per pilgrim'), 'price' => 950000, 'currency' => 'IDR'],
            ],
        ];

        $result = [];

        foreach ($rows as $row) {
            $result[$row['code']] = TravelProduct::query()->updateOrCreate(
                ['code' => $row['code']],
                array_merge($row, ['is_active' => true]),
            );
        }

        return $result;
    }

    private function syncProducts(TravelPackage $package, array $products, array $codes): void
    {
        $package->products()->sync(
            collect($codes)
                ->filter(fn ($code) => isset($products[$code]))
                ->values()
                ->mapWithKeys(fn ($code, $index) => [$products[$code]->id => ['sort_order' => $index + 1]])
                ->all(),
        );
    }

    private function seedPackages(array $products): array
    {
        $rows = [
            [
                'code' => 'ASF-BASIC-09',
                'slug' => 'umroh-basic-9-hari',
                'name' => $this->loc('Umroh Basic 9 Hari', 'Basic Umrah 9 Days'),
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 9,
                'price' => 28900000,
                'original_price' => 31900000,
                'discount_label' => 'EARLY BIRD',
                'discount_ends_at' => '2026-08-15 23:59:59',
                'currency' => 'IDR',
                'image_path' => '/images/dummy.jpg',
                'summary' => $this->loc(
                    'Paket basic untuk jamaah yang mengutamakan harga terjangkau dengan layanan inti lengkap.',
                    'Basic package for pilgrims seeking affordable pricing with complete core services.',
                ),
                'content' => [
                    'airline' => $this->loc('Saudia Airlines', 'Saudia Airlines'),
                    'hotel' => $this->loc('Hotel area Ajyad / setara', 'Ajyad area hotel / equivalent'),
                    'badge' => $this->loc('Best Value', 'Best Value'),
                    'period' => $this->loc('Agustus - Oktober 2026', 'August - October 2026'),
                    'room' => $this->loc('Quad sharing', 'Quad sharing'),
                    'meals' => $this->loc('Makan terjadwal', 'Scheduled meals'),
                    'handling' => $this->loc('Handling bandara Jakarta', 'Jakarta airport handling'),
                    'included' => $this->loc(
                        "Tiket pesawat PP Saudia\nVisa umroh resmi\nHotel bintang 3 Makkah & Madinah\nManasik & pembimbing\nTransportasi bus AC\nPerlengkapan umroh",
                        "Round-trip Saudia ticket\nOfficial umrah visa\n3-star hotel Makkah & Madinah\nManasik & guide\nAC bus transportation\nUmrah equipment",
                    ),
                    'excluded' => $this->loc(
                        "Pengeluaran pribadi\nOleh-oleh\nBiaya paspor (jika belum punya)",
                        "Personal expenses\nSouvenirs\nPassport fee (if not yet available)",
                    ),
                    'policy' => $this->loc(
                        'Pembatalan 30 hari sebelum keberangkatan dikenakan biaya 25%. Pembatalan kurang dari 14 hari tidak dapat dikembalikan.',
                        'Cancellation 30 days before departure incurs 25% fee. Cancellation less than 14 days is non-refundable.',
                    ),
                ],
                'products' => ['PRD-VISA', 'PRD-TIKET-SV', 'PRD-HOTEL-3', 'PRD-MANASIK', 'PRD-BUS', 'PRD-HANDLING', 'PRD-PERLENGKAPAN'],
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'code' => 'ASF-REGULAR-10',
                'slug' => 'umroh-regular-10-hari',
                'name' => $this->loc('Umroh Regular 10 Hari', 'Regular Umrah 10 Days'),
                'package_type' => 'reguler',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 36900000,
                'original_price' => 39900000,
                'discount_label' => 'FAMILY DEAL',
                'discount_ends_at' => '2026-09-01 23:59:59',
                'currency' => 'IDR',
                'image_path' => '/images/dummy.jpg',
                'summary' => $this->loc(
                    'Paket seimbang untuk keluarga dan jamaah umum dengan hotel nyaman serta pembimbing berpengalaman.',
                    'Balanced package for families with comfortable hotels and experienced guides.',
                ),
                'content' => [
                    'airline' => $this->loc('Garuda Indonesia', 'Garuda Indonesia'),
                    'hotel' => $this->loc('Hotel bintang 4 dekat Masjidil Haram', '4-star hotel near Masjidil Haram'),
                    'badge' => $this->loc('Pilihan Keluarga', 'Family Choice'),
                    'period' => $this->loc('September - November 2026', 'September - November 2026'),
                    'room' => $this->loc('Triple / quad sharing', 'Triple / quad sharing'),
                    'meals' => $this->loc('3 kali makan menu Indonesia', '3 meals with Indonesian menu'),
                    'handling' => $this->loc('Handling bandara dan hotel', 'Airport and hotel handling'),
                    'ziarah' => $this->loc('Program ziarah Makkah dan Madinah', 'Makkah and Madinah ziarah program'),
                    'included' => $this->loc(
                        "Tiket pesawat PP Garuda\nVisa umroh resmi\nHotel bintang 4 Makkah & Madinah\nManasik & pembimbing\nKonsumsi 3x sehari\nTransportasi bus AC\nPerlengkapan umroh",
                        "Round-trip Garuda ticket\nOfficial umrah visa\n4-star hotel Makkah & Madinah\nManasik & guide\n3 meals per day\nAC bus transportation\nUmrah equipment",
                    ),
                    'excluded' => $this->loc(
                        "Pengeluaran pribadi\nOleh-oleh",
                        "Personal expenses\nSouvenirs",
                    ),
                    'policy' => $this->loc(
                        'Pembatalan 30 hari sebelum keberangkatan dikenakan biaya 25%. Pembatalan kurang dari 14 hari tidak dapat dikembalikan.',
                        'Cancellation 30 days before departure incurs 25% fee. Cancellation less than 14 days is non-refundable.',
                    ),
                ],
                'products' => ['PRD-VISA', 'PRD-TIKET-GA', 'PRD-HOTEL-4', 'PRD-MANASIK', 'PRD-MAKAN', 'PRD-BUS', 'PRD-HANDLING', 'PRD-CITYTOUR', 'PRD-PERLENGKAPAN'],
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'code' => 'ASF-PREMIUM-12',
                'slug' => 'umroh-premium-12-hari',
                'name' => $this->loc('Umroh Premium 12 Hari', 'Premium Umrah 12 Days'),
                'package_type' => 'vip',
                'departure_city' => 'Jakarta',
                'duration_days' => 12,
                'price' => 49900000,
                'original_price' => 54900000,
                'discount_label' => 'HEMAT 9%',
                'discount_ends_at' => '2026-10-01 23:59:59',
                'currency' => 'IDR',
                'image_path' => '/images/dummy.jpg',
                'summary' => $this->loc(
                    'Paket premium dengan hotel bintang 5 sangat dekat Masjidil Haram dan durasi lebih longgar untuk ibadah yang tenang.',
                    'Premium package with 5-star hotel very close to Masjidil Haram and relaxed duration for peaceful worship.',
                ),
                'content' => [
                    'airline' => $this->loc('Garuda Indonesia Business Class', 'Garuda Indonesia Business Class'),
                    'hotel' => $this->loc('Hotel bintang 5 walking distance ke Masjidil Haram', '5-star hotel walking distance to Masjidil Haram'),
                    'badge' => $this->loc('VIP Premium', 'VIP Premium'),
                    'period' => $this->loc('Oktober - Desember 2026', 'October - December 2026'),
                    'room' => $this->loc('Double sharing premium', 'Premium double sharing'),
                    'meals' => $this->loc('Menu premium 3 kali sehari', 'Premium menu 3 times a day'),
                    'handling' => $this->loc('Fast track dan handling prioritas', 'Fast track and priority handling'),
                    'ziarah' => $this->loc('City tour premium dan ziarah terarah', 'Premium city tour and guided ziarah'),
                    'included' => $this->loc(
                        "Tiket Garuda Business Class PP\nVisa umroh resmi\nPengurusan paspor (jika diperlukan)\nHotel bintang 5 Makkah & Madinah\nManasik & pembimbing senior\nKonsumsi 3x sehari menu premium\nTransportasi bus AC eksklusif\nPerlengkapan umroh premium",
                        "Garuda Business Class round-trip\nOfficial umrah visa\nPassport processing (if needed)\n5-star hotel Makkah & Madinah\nManasik & senior guide\n3 premium meals per day\nExclusive AC bus transportation\nPremium umrah equipment",
                    ),
                    'excluded' => $this->loc(
                        "Pengeluaran pribadi\nOleh-oleh",
                        "Personal expenses\nSouvenirs",
                    ),
                    'policy' => $this->loc(
                        'Pembatalan 45 hari sebelum keberangkatan dikenakan biaya 20%. Pembatalan kurang dari 21 hari tidak dapat dikembalikan.',
                        'Cancellation 45 days before departure incurs 20% fee. Cancellation less than 21 days is non-refundable.',
                    ),
                ],
                'products' => ['PRD-VISA', 'PRD-PASPOR', 'PRD-TIKET-GA', 'PRD-HOTEL-5', 'PRD-MANASIK', 'PRD-MAKAN', 'PRD-BUS', 'PRD-HANDLING', 'PRD-CITYTOUR', 'PRD-PERLENGKAPAN'],
                'is_featured' => true,
                'is_active' => true,
            ],
        ];

        $packages = [];
        $activeCodes = collect($rows)->pluck('code')->all();

        TravelPackage::query()
            ->whereNotIn('code', $activeCodes)
            ->delete();

        foreach ($rows as $row) {
            $codes = $row['products'];
            unset($row['products']);

            $package = TravelPackage::query()
                ->where('code', $row['code'])
                ->orWhere('slug', $row['slug'])
                ->first();

            if ($package) {
                $package->update($row);
            } else {
                $package = TravelPackage::query()->create($row);
            }

            $this->syncProducts($package, $products, $codes);
            $packages[$row['code']] = $package;
        }

        return $packages;
    }

    private function seedSchedules(array $packages): void
    {
        $activePackageIds = collect($packages)
            ->map(fn (TravelPackage $package): int => $package->id)
            ->values()
            ->all();

        DepartureSchedule::query()
            ->whereNull('package_id')
            ->orWhereNotIn('package_id', $activePackageIds)
            ->delete();

        DepartureSchedule::query()
            ->whereIn('package_id', $activePackageIds)
            ->delete();

        $rows = [
            ['code' => 'ASF-BASIC-09', 'departure_date' => '2026-08-18', 'return_date' => '2026-08-26', 'city' => 'Jakarta', 'total' => 45, 'available' => 20, 'status' => 'open', 'notes' => 'Kuota batch 1.'],
            ['code' => 'ASF-BASIC-09', 'departure_date' => '2026-09-16', 'return_date' => '2026-09-24', 'city' => 'Jakarta', 'total' => 45, 'available' => 35, 'status' => 'open', 'notes' => 'Kuota batch 2.'],
            ['code' => 'ASF-REGULAR-10', 'departure_date' => '2026-10-06', 'return_date' => '2026-10-15', 'city' => 'Jakarta', 'total' => 40, 'available' => 15, 'status' => 'open', 'notes' => 'Program keluarga.'],
            ['code' => 'ASF-REGULAR-10', 'departure_date' => '2026-11-03', 'return_date' => '2026-11-12', 'city' => 'Surabaya', 'total' => 40, 'available' => 26, 'status' => 'open', 'notes' => 'Keberangkatan Surabaya.'],
            ['code' => 'ASF-PREMIUM-12', 'departure_date' => '2026-11-20', 'return_date' => '2026-12-01', 'city' => 'Jakarta', 'total' => 30, 'available' => 12, 'status' => 'open', 'notes' => 'Layanan premium lengkap.'],
            ['code' => 'ASF-PREMIUM-12', 'departure_date' => '2026-12-10', 'return_date' => '2026-12-21', 'city' => 'Jakarta', 'total' => 30, 'available' => 30, 'status' => 'open', 'notes' => 'Batch akhir tahun.'],
        ];

        foreach ($rows as $row) {
            $package = $packages[$row['code']] ?? null;

            if (! $package) {
                continue;
            }

            DepartureSchedule::query()->updateOrCreate(
                ['package_id' => $package->id, 'departure_date' => $row['departure_date']],
                [
                    'package_id' => $package->id,
                    'departure_date' => $row['departure_date'],
                    'return_date' => $row['return_date'],
                    'departure_city' => $row['city'],
                    'seats_total' => $row['total'],
                    'seats_available' => $row['available'],
                    'status' => $row['status'],
                    'notes' => $row['notes'],
                    'is_active' => true,
                ],
            );
        }
    }

    private function seedItineraries(array $packages, array $products): void
    {
        $activityMap = Activity::query()
            ->where('is_active', true)
            ->pluck('id', 'code');

        $rows = [
            'ASF-BASIC-09' => [
                ['day' => 1, 'activity_code' => 'ACT-DEPARTURE-FLIGHT', 'title' => 'Keberangkatan dari Indonesia', 'description' => 'Briefing, handling bandara, dan penerbangan menuju Jeddah/Madinah.', 'products' => ['PRD-TIKET-SV', 'PRD-HANDLING']],
                ['day' => 2, 'activity_code' => 'ACT-HOTEL-CHECKIN', 'title' => 'Check-in dan Adaptasi', 'description' => 'Check-in hotel, orientasi area, dan persiapan ibadah.', 'products' => ['PRD-HOTEL-3']],
                ['day' => 3, 'activity_code' => 'ACT-MANASIK-ONSITE', 'title' => 'Manasik Lapangan', 'description' => 'Penguatan manasik di lokasi sebelum pelaksanaan umroh.', 'products' => ['PRD-MANASIK']],
                ['day' => 4, 'activity_code' => 'ACT-UMRAH-RITUAL', 'title' => 'Pelaksanaan Umroh', 'description' => 'Pelaksanaan rangkaian umroh dengan pendampingan pembimbing.', 'products' => ['PRD-VISA', 'PRD-MANASIK']],
                ['day' => 5, 'activity_code' => 'ACT-FREE-IBADAH', 'title' => 'Ibadah Mandiri', 'description' => 'Waktu bebas ibadah di Masjidil Haram.', 'products' => ['PRD-PERLENGKAPAN']],
                ['day' => 6, 'activity_code' => 'ACT-ZIARAH-MAKKAH', 'title' => 'Ziarah Makkah', 'description' => 'Kunjungan titik bersejarah di Makkah.', 'products' => ['PRD-BUS', 'PRD-CITYTOUR']],
                ['day' => 7, 'activity_code' => 'ACT-CITY-TRANSFER', 'title' => 'Transfer Antar Kota', 'description' => 'Perjalanan menuju Madinah dan check-in hotel.', 'products' => ['PRD-BUS', 'PRD-HOTEL-3']],
                ['day' => 8, 'activity_code' => 'ACT-ZIARAH-MADINAH', 'title' => 'Ziarah Madinah', 'description' => 'Kunjungan area bersejarah di Madinah.', 'products' => ['PRD-BUS', 'PRD-CITYTOUR']],
                ['day' => 9, 'activity_code' => 'ACT-RETURN-FLIGHT', 'title' => 'Kepulangan', 'description' => 'Check-out hotel, transfer bandara, dan penerbangan pulang.', 'products' => ['PRD-HANDLING', 'PRD-TIKET-SV']],
            ],
            'ASF-REGULAR-10' => [
                ['day' => 1, 'activity_code' => 'ACT-DEPARTURE-FLIGHT', 'title' => 'Keberangkatan Jamaah', 'description' => 'Meeting point, handling, dan keberangkatan penerbangan.', 'products' => ['PRD-TIKET-GA', 'PRD-HANDLING']],
                ['day' => 2, 'activity_code' => 'ACT-HOTEL-CHECKIN', 'title' => 'Kedatangan dan Check-in', 'description' => 'Tiba, transfer ke hotel, dan pembagian kamar.', 'products' => ['PRD-HOTEL-4']],
                ['day' => 3, 'activity_code' => 'ACT-MANASIK-ONSITE', 'title' => 'Manasik Pemantapan', 'description' => 'Sesi pemantapan manasik bersama pembimbing.', 'products' => ['PRD-MANASIK']],
                ['day' => 4, 'activity_code' => 'ACT-UMRAH-RITUAL', 'title' => 'Pelaksanaan Umroh', 'description' => 'Pelaksanaan ibadah umroh secara terstruktur.', 'products' => ['PRD-VISA', 'PRD-MANASIK']],
                ['day' => 5, 'activity_code' => 'ACT-FREE-IBADAH', 'title' => 'Ibadah dan Evaluasi', 'description' => 'Ibadah mandiri dan evaluasi ibadah harian.', 'products' => ['PRD-MAKAN']],
                ['day' => 6, 'activity_code' => 'ACT-ZIARAH-MAKKAH', 'title' => 'City Tour Makkah', 'description' => 'Program city tour dan ziarah sekitar Makkah.', 'products' => ['PRD-BUS', 'PRD-CITYTOUR']],
                ['day' => 7, 'activity_code' => 'ACT-CITY-TRANSFER', 'title' => 'Transfer ke Madinah', 'description' => 'Perjalanan darat ke Madinah dan check-in hotel.', 'products' => ['PRD-BUS', 'PRD-HOTEL-4']],
                ['day' => 8, 'activity_code' => 'ACT-ZIARAH-MADINAH', 'title' => 'Ziarah Madinah', 'description' => 'Kunjungan Masjid Quba, Uhud, dan area terkait.', 'products' => ['PRD-BUS', 'PRD-CITYTOUR']],
                ['day' => 9, 'activity_code' => 'ACT-FREE-IBADAH', 'title' => 'Ibadah Mandiri Madinah', 'description' => 'Fokus ibadah di Masjid Nabawi dan area sekitar.', 'products' => ['PRD-MAKAN', 'PRD-PERLENGKAPAN']],
                ['day' => 10, 'activity_code' => 'ACT-RETURN-FLIGHT', 'title' => 'Persiapan Pulang', 'description' => 'Check-out, handling bandara, dan penerbangan kembali.', 'products' => ['PRD-HANDLING', 'PRD-TIKET-GA']],
            ],
            'ASF-PREMIUM-12' => [
                ['day' => 1, 'activity_code' => 'ACT-DEPARTURE-FLIGHT', 'title' => 'Keberangkatan VIP', 'description' => 'Briefing eksklusif, handling prioritas, dan keberangkatan.', 'products' => ['PRD-TIKET-GA', 'PRD-HANDLING']],
                ['day' => 2, 'activity_code' => 'ACT-HOTEL-CHECKIN', 'title' => 'Kedatangan dan Check-in Premium', 'description' => 'Transfer cepat dan check-in hotel bintang 5.', 'products' => ['PRD-HOTEL-5']],
                ['day' => 3, 'activity_code' => 'ACT-MANASIK-ONSITE', 'title' => 'Manasik Intensif', 'description' => 'Pendalaman fiqih manasik dan simulasi lapangan.', 'products' => ['PRD-MANASIK']],
                ['day' => 4, 'activity_code' => 'ACT-UMRAH-RITUAL', 'title' => 'Pelaksanaan Umroh', 'description' => 'Pelaksanaan ibadah dengan pendampingan senior.', 'products' => ['PRD-VISA', 'PRD-MANASIK']],
                ['day' => 5, 'activity_code' => 'ACT-FREE-IBADAH', 'title' => 'Ibadah Mandiri', 'description' => 'Waktu bebas ibadah dengan dukungan tim.', 'products' => ['PRD-MAKAN']],
                ['day' => 6, 'activity_code' => 'ACT-ZIARAH-MAKKAH', 'title' => 'Ziarah Makkah Premium', 'description' => 'Program ziarah dengan kenyamanan transport eksklusif.', 'products' => ['PRD-BUS', 'PRD-CITYTOUR']],
                ['day' => 7, 'activity_code' => 'ACT-FREE-IBADAH', 'title' => 'Ibadah dan Pendampingan', 'description' => 'Sesi ibadah terjadwal dan konsultasi pembimbing.', 'products' => ['PRD-MAKAN', 'PRD-PERLENGKAPAN']],
                ['day' => 8, 'activity_code' => 'ACT-CITY-TRANSFER', 'title' => 'Transfer ke Madinah', 'description' => 'Perpindahan kota dan check-in hotel premium.', 'products' => ['PRD-BUS', 'PRD-HOTEL-5']],
                ['day' => 9, 'activity_code' => 'ACT-ZIARAH-MADINAH', 'title' => 'Ziarah Madinah', 'description' => 'Kunjungan bersejarah dengan agenda terstruktur.', 'products' => ['PRD-BUS', 'PRD-CITYTOUR']],
                ['day' => 10, 'activity_code' => 'ACT-FREE-IBADAH', 'title' => 'Ibadah Nabawi', 'description' => 'Fokus ibadah mandiri dan pendampingan ibadah.', 'products' => ['PRD-MAKAN']],
                ['day' => 11, 'activity_code' => 'ACT-HOTEL-CHECKOUT', 'title' => 'Persiapan Kepulangan', 'description' => 'Packing, check-out, dan briefing kepulangan.', 'products' => ['PRD-HANDLING']],
                ['day' => 12, 'activity_code' => 'ACT-RETURN-FLIGHT', 'title' => 'Penerbangan Pulang', 'description' => 'Transfer bandara dan penerbangan kembali ke Indonesia.', 'products' => ['PRD-TIKET-GA', 'PRD-HANDLING']],
            ],
        ];

        foreach ($rows as $packageCode => $itineraries) {
            $package = $packages[$packageCode] ?? null;

            if (! $package) {
                continue;
            }

            $package->itineraries()->each(function (PackageItinerary $itinerary): void {
                $itinerary->products()->detach();
                $itinerary->delete();
            });

            foreach ($itineraries as $index => $itineraryRow) {
                $activityId = isset($itineraryRow['activity_code'])
                    ? (int) ($activityMap[$itineraryRow['activity_code']] ?? 0)
                    : 0;

                $itinerary = $package->itineraries()->create([
                    'activity_id' => $activityId > 0 ? $activityId : null,
                    'activity_ids' => $activityId > 0 ? [$activityId] : [],
                    'day_number' => $itineraryRow['day'],
                    'sort_order' => $index + 1,
                    'title' => $this->loc($itineraryRow['title']),
                    'description' => $this->loc($itineraryRow['description']),
                ]);

                $productSyncData = collect($itineraryRow['products'])
                    ->filter(fn (string $productCode): bool => isset($products[$productCode]))
                    ->values()
                    ->mapWithKeys(fn (string $productCode, int $productIndex): array => [
                        $products[$productCode]->id => ['sort_order' => $productIndex + 1],
                    ])
                    ->all();

                $itinerary->products()->sync($productSyncData);
            }
        }
    }

    private function seedTestimonials(array $packages): void
    {
        $rows = [
            ['code' => 'ASF-BASIC-09', 'name' => 'Bapak Hendra S.', 'city' => 'Jakarta', 'rating' => 5, 'quote' => $this->loc('Paket basic-nya rapi, jelas, dan sangat membantu untuk jamaah pertama kali.', 'The basic package is neat, clear, and very helpful for first-time pilgrims.')],
            ['code' => 'ASF-REGULAR-10', 'name' => 'Keluarga Pak Ridwan', 'city' => 'Surabaya', 'rating' => 5, 'quote' => $this->loc('Paket regular paling pas untuk keluarga kami, layanan tim sangat responsif.', 'The regular package suits our family best, and the team service is very responsive.')],
            ['code' => 'ASF-PREMIUM-12', 'name' => 'Ibu Prof. Aminah', 'city' => 'Bandung', 'rating' => 5, 'quote' => $this->loc('Pengalaman premium sangat terasa, dari hotel sampai pendampingan ibadah.', 'The premium experience is evident, from hotel quality to worship assistance.')],
        ];

        foreach ($rows as $row) {
            $package = $packages[$row['code']] ?? null;

            if (! $package) {
                continue;
            }

            Testimonial::query()->updateOrCreate(
                ['name' => $row['name'], 'package_id' => $package->id],
                [
                    'origin_city' => $row['city'],
                    'package_id' => $package->id,
                    'quote' => $row['quote'],
                    'rating' => $row['rating'],
                    'is_featured' => $row['rating'] === 5,
                    'is_active' => true,
                ],
            );
        }
    }
}
