<?php

namespace Database\Seeders;

use App\Models\DepartureSchedule;
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
        $this->seedTestimonials($packages);
    }

    private function loc(string $id, string $en = ''): array
    {
        return ['id' => $id, 'en' => $en ?: $id];
    }

    private function seedProducts(): array
    {
        $categories = [
            ['key' => 'dokumen',      'name' => $this->loc('Dokumen', 'Documents'),           'sort_order' => 1],
            ['key' => 'transportasi', 'name' => $this->loc('Transportasi', 'Transportation'),  'sort_order' => 2],
            ['key' => 'akomodasi',    'name' => $this->loc('Akomodasi', 'Accommodation'),      'sort_order' => 3],
            ['key' => 'layanan',      'name' => $this->loc('Layanan', 'Services'),             'sort_order' => 4],
            ['key' => 'perlengkapan', 'name' => $this->loc('Perlengkapan', 'Equipment'),       'sort_order' => 5],
        ];

        foreach ($categories as $cat) {
            ProductCategory::query()->updateOrCreate(
                ['key' => $cat['key']],
                array_merge($cat, ['description' => $this->loc(''), 'is_active' => true]),
            );
        }

        $rows = [
            [
                'code' => 'PRD-VISA',
                'slug' => 'visa-umroh',
                'name' => $this->loc('Visa Umroh', 'Umrah Visa'),
                'product_type' => 'dokumen',
                'description' => $this->loc('Pengurusan visa resmi Kerajaan Arab Saudi.', 'Official Saudi Arabia visa processing.'),
                'content' => ['unit' => $this->loc('per jamaah', 'per pilgrim')],
            ],
            [
                'code' => 'PRD-PASPOR',
                'slug' => 'pengurusan-paspor',
                'name' => $this->loc('Pengurusan Paspor', 'Passport Processing'),
                'product_type' => 'dokumen',
                'description' => $this->loc('Bantuan pengurusan paspor baru atau perpanjangan.', 'Assistance for new or renewal passport processing.'),
                'content' => ['unit' => $this->loc('per jamaah', 'per pilgrim')],
            ],
            [
                'code' => 'PRD-TIKET-GA',
                'slug' => 'tiket-garuda',
                'name' => $this->loc('Tiket Garuda Indonesia', 'Garuda Indonesia Ticket'),
                'product_type' => 'transportasi',
                'description' => $this->loc('Tiket penerbangan PP dengan Garuda Indonesia.', 'Round-trip flight ticket with Garuda Indonesia.'),
                'content' => ['unit' => $this->loc('round trip', 'round trip')],
            ],
            [
                'code' => 'PRD-TIKET-SV',
                'slug' => 'tiket-saudia',
                'name' => $this->loc('Tiket Saudia Airlines', 'Saudia Airlines Ticket'),
                'product_type' => 'transportasi',
                'description' => $this->loc('Tiket penerbangan PP dengan Saudia Airlines.', 'Round-trip flight ticket with Saudia Airlines.'),
                'content' => ['unit' => $this->loc('round trip', 'round trip')],
            ],
            [
                'code' => 'PRD-BUS',
                'slug' => 'transportasi-bus',
                'name' => $this->loc('Bus Selama Perjalanan', 'Bus During Trip'),
                'product_type' => 'transportasi',
                'description' => $this->loc('Transportasi bus AC selama di tanah suci.', 'Air-conditioned bus transportation in the holy land.'),
                'content' => ['unit' => $this->loc('per paket', 'per package')],
            ],
            [
                'code' => 'PRD-HOTEL-3',
                'slug' => 'hotel-bintang-3',
                'name' => $this->loc('Hotel Bintang 3', '3-Star Hotel'),
                'product_type' => 'akomodasi',
                'description' => $this->loc('Akomodasi hotel bintang 3 di Makkah dan Madinah.', '3-star hotel accommodation in Makkah and Madinah.'),
                'content' => ['unit' => $this->loc('per kamar quad', 'per quad room')],
            ],
            [
                'code' => 'PRD-HOTEL-4',
                'slug' => 'hotel-bintang-4',
                'name' => $this->loc('Hotel Bintang 4', '4-Star Hotel'),
                'product_type' => 'akomodasi',
                'description' => $this->loc('Akomodasi hotel bintang 4 dekat Masjidil Haram.', '4-star hotel near Masjidil Haram.'),
                'content' => ['unit' => $this->loc('per kamar triple', 'per triple room')],
            ],
            [
                'code' => 'PRD-HOTEL-5',
                'slug' => 'hotel-bintang-5',
                'name' => $this->loc('Hotel Bintang 5', '5-Star Hotel'),
                'product_type' => 'akomodasi',
                'description' => $this->loc('Hotel mewah dengan jarak sangat dekat ke Masjidil Haram.', 'Luxury hotel very close to Masjidil Haram.'),
                'content' => ['unit' => $this->loc('per kamar double', 'per double room')],
            ],
            [
                'code' => 'PRD-MANASIK',
                'slug' => 'manasik-pembimbing',
                'name' => $this->loc('Manasik & Pembimbing', 'Manasik & Worship Guide'),
                'product_type' => 'layanan',
                'description' => $this->loc('Manasik sebelum berangkat dan pendampingan ustadz selama ibadah.', 'Pre-departure manasik and ustadz guidance during worship.'),
                'content' => ['unit' => $this->loc('per paket', 'per package')],
            ],
            [
                'code' => 'PRD-MAKAN',
                'slug' => 'konsumsi-katering',
                'name' => $this->loc('Konsumsi & Katering', 'Meals & Catering'),
                'product_type' => 'layanan',
                'description' => $this->loc('Makan 3x sehari dengan menu Indonesia selama di tanah suci.', '3 meals per day with Indonesian menu during the trip.'),
                'content' => ['unit' => $this->loc('per jamaah', 'per pilgrim')],
            ],
            [
                'code' => 'PRD-PERLENGKAPAN',
                'slug' => 'perlengkapan-umroh',
                'name' => $this->loc('Perlengkapan Umroh', 'Umrah Equipment'),
                'product_type' => 'perlengkapan',
                'description' => $this->loc('Koper, kain ihram, buku panduan, dan tas jamaah.', 'Luggage, ihram cloth, guidebook, and pilgrim bag.'),
                'content' => ['unit' => $this->loc('per jamaah', 'per pilgrim')],
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

    private function syncProducts(TravelPackage $pkg, array $products, array $codes): void
    {
        $pkg->products()->sync(
            collect($codes)
                ->filter(fn ($c) => isset($products[$c]))
                ->values()
                ->mapWithKeys(fn ($c, $i) => [$products[$c]->id => ['sort_order' => $i + 1]])
                ->all(),
        );
    }

    private function seedPackages(array $p): array
    {
        $rows = [
            [
                'code' => 'ASF-HEMAT-09',
                'slug' => 'umroh-hemat-9-hari',
                'name' => $this->loc('Umroh Hemat 9 Hari', 'Economy Umrah 9 Days'),
                'package_type' => 'hemat',
                'departure_city' => 'Jakarta',
                'duration_days' => 9,
                'price' => 27900000,
                'original_price' => 31900000,
                'discount_label' => 'EARLY BIRD',
                'currency' => 'IDR',
                'image_path' => '/images/dummy.jpg',
                'summary' => $this->loc(
                    'Paket efisien untuk jamaah yang mengutamakan keberangkatan terjangkau dengan layanan inti lengkap.',
                    'Efficient package for pilgrims seeking affordable departure with complete core services.',
                ),
                'content' => [
                    'airline' => $this->loc('Saudia Airlines', 'Saudia Airlines'),
                    'hotel' => $this->loc('Hotel bintang 3 area Aziziyah', '3-star hotel in Aziziyah area'),
                    'badge' => $this->loc('Terlaris', 'Best Seller'),
                    'period' => $this->loc('Mei – Juni 2026', 'May – June 2026'),
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
                'products' => ['PRD-VISA', 'PRD-TIKET-SV', 'PRD-HOTEL-3', 'PRD-MANASIK', 'PRD-BUS', 'PRD-PERLENGKAPAN'],
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'code' => 'ASF-REG-10',
                'slug' => 'umroh-reguler-10-hari',
                'name' => $this->loc('Umroh Reguler 10 Hari', 'Regular Umrah 10 Days'),
                'package_type' => 'reguler',
                'departure_city' => 'Surabaya',
                'duration_days' => 10,
                'price' => 34900000,
                'currency' => 'IDR',
                'image_path' => '/images/dummy.jpg',
                'summary' => $this->loc(
                    'Paket paling seimbang untuk keluarga dan jamaah umum dengan hotel nyaman dan pembimbing berpengalaman.',
                    'Most balanced package for families with comfortable hotels and experienced guides.',
                ),
                'content' => [
                    'airline' => $this->loc('Garuda Indonesia', 'Garuda Indonesia'),
                    'hotel' => $this->loc('Hotel bintang 4 dekat Masjidil Haram', '4-star hotel near Masjidil Haram'),
                    'badge' => $this->loc('Pilihan Keluarga', 'Family Choice'),
                    'period' => $this->loc('Juni – Agustus 2026', 'June – August 2026'),
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
                'products' => ['PRD-VISA', 'PRD-TIKET-GA', 'PRD-HOTEL-4', 'PRD-MANASIK', 'PRD-MAKAN', 'PRD-BUS', 'PRD-PERLENGKAPAN'],
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'code' => 'ASF-PREM-12',
                'slug' => 'umroh-premium-12-hari',
                'name' => $this->loc('Umroh Premium 12 Hari', 'Premium Umrah 12 Days'),
                'package_type' => 'premium',
                'departure_city' => 'Jakarta',
                'duration_days' => 12,
                'price' => 49900000,
                'original_price' => 54900000,
                'discount_label' => 'HEMAT 9%',
                'currency' => 'IDR',
                'image_path' => '/images/dummy.jpg',
                'summary' => $this->loc(
                    'Paket premium dengan hotel bintang 5 sangat dekat Masjidil Haram dan durasi lebih longgar untuk ibadah yang tenang.',
                    'Premium package with 5-star hotel very close to Masjidil Haram and relaxed duration for peaceful worship.',
                ),
                'content' => [
                    'airline' => $this->loc('Garuda Indonesia Business Class', 'Garuda Indonesia Business Class'),
                    'hotel' => $this->loc('Hotel bintang 5 walking distance ke Masjidil Haram', '5-star hotel walking distance to Masjidil Haram'),
                    'badge' => $this->loc('Premium', 'Premium'),
                    'period' => $this->loc('Juli – September 2026', 'July – September 2026'),
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
                'products' => ['PRD-VISA', 'PRD-PASPOR', 'PRD-TIKET-GA', 'PRD-HOTEL-5', 'PRD-MANASIK', 'PRD-MAKAN', 'PRD-BUS', 'PRD-PERLENGKAPAN'],
                'is_featured' => true,
                'is_active' => true,
            ],
            [
                'code' => 'ASF-PRIV-10',
                'slug' => 'umroh-private-10-hari',
                'name' => $this->loc('Umroh Private 10 Hari', 'Private Umrah 10 Days'),
                'package_type' => 'private',
                'departure_city' => 'Jakarta',
                'duration_days' => 10,
                'price' => 65000000,
                'currency' => 'IDR',
                'image_path' => '/images/dummy.jpg',
                'summary' => $this->loc(
                    'Paket eksklusif untuk rombongan kecil atau keluarga dengan layanan personal dan jadwal fleksibel.',
                    'Exclusive package for small groups or families with personal service and flexible schedule.',
                ),
                'content' => [
                    'airline' => $this->loc('Sesuai permintaan', 'Upon request'),
                    'hotel' => $this->loc('Hotel bintang 5 pilihan jamaah', '5-star hotel of pilgrim choice'),
                    'badge' => $this->loc('Eksklusif', 'Exclusive'),
                    'period' => $this->loc('Fleksibel sesuai permintaan', 'Flexible upon request'),
                    'included' => $this->loc(
                        "Tiket pesawat PP sesuai pilihan\nVisa umroh resmi\nPengurusan paspor\nHotel bintang 5 pilihan\nPembimbing pribadi\nKonsumsi 3x sehari\nTransportasi private\nPerlengkapan umroh premium",
                        "Round-trip ticket of choice\nOfficial umrah visa\nPassport processing\n5-star hotel of choice\nPersonal guide\n3 meals per day\nPrivate transportation\nPremium umrah equipment",
                    ),
                    'excluded' => $this->loc('Pengeluaran pribadi', 'Personal expenses'),
                    'policy' => $this->loc(
                        'Jadwal dan fasilitas dapat disesuaikan. Hubungi tim kami untuk konsultasi.',
                        'Schedule and facilities can be customized. Contact our team for consultation.',
                    ),
                ],
                'products' => ['PRD-VISA', 'PRD-PASPOR', 'PRD-TIKET-GA', 'PRD-HOTEL-5', 'PRD-MANASIK', 'PRD-MAKAN', 'PRD-BUS', 'PRD-PERLENGKAPAN'],
                'is_featured' => false,
                'is_active' => true,
            ],
        ];

        $packages = [];
        foreach ($rows as $row) {
            $codes = $row['products'];
            unset($row['products']);
            $pkg = TravelPackage::query()->updateOrCreate(['code' => $row['code']], $row);
            $this->syncProducts($pkg, $p, $codes);
            $packages[$row['code']] = $pkg;
        }

        return $packages;
    }

    private function seedSchedules(array $packages): void
    {
        $rows = [
            // ASF-HEMAT-09
            ['code' => 'ASF-HEMAT-09', 'departure_date' => '2026-05-10', 'return_date' => '2026-05-18', 'city' => 'Jakarta',   'total' => 45, 'available' => 12, 'status' => 'open',   'notes' => 'Seat terbatas, segera daftar.'],
            ['code' => 'ASF-HEMAT-09', 'departure_date' => '2026-06-08', 'return_date' => '2026-06-16', 'city' => 'Jakarta',   'total' => 45, 'available' => 28, 'status' => 'open',   'notes' => ''],
            ['code' => 'ASF-HEMAT-09', 'departure_date' => '2026-07-12', 'return_date' => '2026-07-20', 'city' => 'Surabaya',  'total' => 40, 'available' => 40, 'status' => 'open',   'notes' => 'Keberangkatan dari Surabaya.'],
            // ASF-REG-10
            ['code' => 'ASF-REG-10',   'departure_date' => '2026-06-15', 'return_date' => '2026-06-24', 'city' => 'Surabaya',  'total' => 40, 'available' => 8,  'status' => 'open',   'notes' => 'Cocok untuk jamaah keluarga.'],
            ['code' => 'ASF-REG-10',   'departure_date' => '2026-07-20', 'return_date' => '2026-07-29', 'city' => 'Jakarta',   'total' => 45, 'available' => 22, 'status' => 'open',   'notes' => ''],
            ['code' => 'ASF-REG-10',   'departure_date' => '2026-08-10', 'return_date' => '2026-08-19', 'city' => 'Makassar',  'total' => 35, 'available' => 35, 'status' => 'open',   'notes' => 'Keberangkatan dari Makassar.'],
            ['code' => 'ASF-REG-10',   'departure_date' => '2026-04-05', 'return_date' => '2026-04-14', 'city' => 'Jakarta',   'total' => 40, 'available' => 0,  'status' => 'full',   'notes' => 'Sudah penuh.'],
            // ASF-PREM-12
            ['code' => 'ASF-PREM-12',  'departure_date' => '2026-07-05', 'return_date' => '2026-07-16', 'city' => 'Jakarta',   'total' => 30, 'available' => 14, 'status' => 'open',   'notes' => 'Hotel sangat dekat Masjidil Haram.'],
            ['code' => 'ASF-PREM-12',  'departure_date' => '2026-09-01', 'return_date' => '2026-09-12', 'city' => 'Jakarta',   'total' => 30, 'available' => 30, 'status' => 'open',   'notes' => ''],
            // ASF-PRIV-10
            ['code' => 'ASF-PRIV-10',  'departure_date' => '2026-08-01', 'return_date' => '2026-08-10', 'city' => 'Jakarta',   'total' => 15, 'available' => 7,  'status' => 'open',   'notes' => 'Jadwal fleksibel, hubungi kami.'],
        ];

        foreach ($rows as $row) {
            $pkg = $packages[$row['code']] ?? null;
            if (! $pkg) {
                continue;
            }

            DepartureSchedule::query()->updateOrCreate(
                ['travel_package_id' => $pkg->id, 'departure_date' => $row['departure_date']],
                [
                    'travel_package_id' => $pkg->id,
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

    private function seedTestimonials(array $packages): void
    {
        $rows = [
            ['code' => 'ASF-HEMAT-09', 'name' => 'Bapak Hendra S.',    'city' => 'Jakarta',   'rating' => 5, 'quote' => $this->loc('Alhamdulillah, paket hemat tapi pelayanannya tidak murahan. Pembimbing sangat sabar dan hotel cukup nyaman.', 'Alhamdulillah, affordable package but service is not cheap. The guide was very patient and the hotel was comfortable enough.')],
            ['code' => 'ASF-HEMAT-09', 'name' => 'Ibu Sari W.',        'city' => 'Bekasi',    'rating' => 4, 'quote' => $this->loc('Pertama kali umroh dan sangat terbantu dengan manasik yang lengkap. Harga terjangkau untuk kualitas ini.', 'First umrah and greatly helped by the comprehensive manasik. Affordable price for this quality.')],
            ['code' => 'ASF-REG-10',   'name' => 'Keluarga Pak Ridwan', 'city' => 'Surabaya',  'rating' => 5, 'quote' => $this->loc('Kami sekeluarga 4 orang sangat puas. Hotel dekat, pembimbing profesional, dan semua urusan dibantu tim Asfar.', 'Our family of 4 was very satisfied. Hotel was close, guide was professional, and all matters were assisted by the Asfar team.')],
            ['code' => 'ASF-REG-10',   'name' => 'Ibu Dewi R.',        'city' => 'Malang',    'rating' => 5, 'quote' => $this->loc('Sudah 2x umroh bersama Asfar dan selalu memuaskan. Paket reguler ini sangat worth it untuk harganya.', 'Already 2x umrah with Asfar and always satisfying. This regular package is very worth it for the price.')],
            ['code' => 'ASF-REG-10',   'name' => 'Bapak Fauzi A.',     'city' => 'Sidoarjo',  'rating' => 4, 'quote' => $this->loc('Pelayanan ramah dan responsif. Sedikit masukan untuk jadwal manasik yang bisa lebih fleksibel.', 'Friendly and responsive service. Minor feedback for manasik schedule that could be more flexible.')],
            ['code' => 'ASF-PREM-12',  'name' => 'Bapak Drs. Santoso', 'city' => 'Jakarta',   'rating' => 5, 'quote' => $this->loc('Luar biasa! Hotel 5 bintang benar-benar walking distance ke Masjidil Haram. Ibadah jadi lebih khusyuk dan nyaman.', 'Extraordinary! The 5-star hotel is truly walking distance to Masjidil Haram. Worship became more focused and comfortable.')],
            ['code' => 'ASF-PREM-12',  'name' => 'Ibu Prof. Aminah',   'city' => 'Bandung',   'rating' => 5, 'quote' => $this->loc('Paket premium yang benar-benar premium. Setiap detail diperhatikan, dari makanan hingga pembimbing senior yang berpengalaman.', 'A truly premium package. Every detail is attended to, from food to experienced senior guides.')],
        ];

        foreach ($rows as $row) {
            $pkg = $packages[$row['code']] ?? null;
            if (! $pkg) {
                continue;
            }

            Testimonial::query()->firstOrCreate(
                ['name' => $row['name'], 'travel_package_id' => $pkg->id],
                [
                    'origin_city' => $row['city'],
                    'travel_package_id' => $pkg->id,
                    'quote' => $row['quote'],
                    'rating' => $row['rating'],
                    'is_featured' => $row['rating'] === 5,
                    'is_active' => true,
                ],
            );
        }
    }
}
