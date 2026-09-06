<?php

namespace Database\Seeders;

use App\Models\TravelProduct;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    private const CURRENCY_RATES = [
        'IDR' => 1,
        'USD' => 17860,
        'SAR' => 4763,
    ];

    public function run(): void
    {
        $products = $this->products();
        $productCodes = collect($products)->pluck('code')->all();

        DB::transaction(function () use ($products, $productCodes): void {
            foreach ($products as $product) {
                $content = $product['content'];
                $currency = $content['currency'];
                $content['currency_rate_snapshot'] = [
                    'rate_to_idr' => self::CURRENCY_RATES[$currency],
                    'source' => 'reference_document',
                    'fetched_at' => null,
                ];

                TravelProduct::query()->firstOrCreate(
                    ['code' => $product['code']],
                    [
                        'slug' => $product['slug'],
                        'name' => $product['name'],
                        'product_type' => $product['product_type'],
                        'visibility' => TravelProduct::VISIBILITY_MASTER,
                        'package_id' => null,
                        'description' => $product['description'],
                        'content' => $content,
                        'is_active' => $product['is_active'] ?? true,
                    ],
                );
            }

            TravelProduct::query()
                ->where(function ($query): void {
                    $query->whereNull('product_type')->orWhere('product_type', '!=', 'hotel');
                })
                ->whereNotIn('code', $productCodes)
                ->delete();
        });
    }

    /** @return array<int, array<string, mixed>> */
    private function products(): array
    {
        return [
            ...$this->visaProducts(),
            ...$this->airlineProducts(),
            ...$this->handlingSaudiProducts(),
            ...$this->handlingIndonesiaProducts(),
            ...$this->equipmentProducts(),
            ...$this->transportationProducts(),
            ...$this->manasikProducts(),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function visaProducts(): array
    {
        return [
            $this->product('PRD-VISA-BROKER-A-10-20', 'visa-broker-a-10-20-pax', 'Broker A - Visa Only (10-20 pax)', 'visa', 145, 'USD', 'per_jamaah', 'Visa Umrah untuk rombongan 10-20 pax.', ['min_pax' => 10, 'max_pax' => 20, 'include_transport' => false]),
            $this->product('PRD-VISA-BROKER-A-21-35', 'visa-broker-a-21-35-pax', 'Broker A - Visa Only (21-35 pax)', 'visa', 140, 'USD', 'per_jamaah', 'Visa Umrah untuk rombongan 21-35 pax.', ['min_pax' => 21, 'max_pax' => 35, 'include_transport' => false]),
            $this->product('PRD-VISA-BROKER-A-36-50', 'visa-broker-a-36-50-pax', 'Broker A - Visa Only (36-50 pax)', 'visa', 135, 'USD', 'per_jamaah', 'Visa Umrah untuk rombongan 36-50 pax.', ['min_pax' => 36, 'max_pax' => 50, 'include_transport' => false]),
            $this->product('PRD-VISA-BROKER-B-20-30', 'visa-broker-b-bus-20-30-pax', 'Broker B - Visa + Bus (20-30 pax)', 'visa', 165, 'USD', 'per_jamaah', 'Visa Umrah termasuk bus Jeddah-Madinah PP untuk 20-30 pax.', ['min_pax' => 20, 'max_pax' => 30, 'include_transport' => true]),
            $this->product('PRD-VISA-BROKER-B-31-45', 'visa-broker-b-bus-31-45-pax', 'Broker B - Visa + Bus (31-45 pax)', 'visa', 155, 'USD', 'per_jamaah', 'Visa Umrah termasuk bus Jeddah-Madinah PP untuk 31-45 pax.', ['min_pax' => 31, 'max_pax' => 45, 'include_transport' => true]),
            $this->product('PRD-VISA-AUFA-ONLY', 'aufa-visa-only', 'AUFA Visa Only', 'visa', 122, 'USD', 'per_jamaah', 'Visa Umrah AUFA tanpa transportasi.', ['min_pax' => 0, 'max_pax' => 9999, 'include_transport' => false]),
            $this->product('PRD-VISA-AUFA-BUS', 'aufa-visa-dan-bus', 'AUFA Visa + Bus', 'visa', 135, 'USD', 'per_jamaah', 'Visa Umrah AUFA termasuk bus.', ['min_pax' => 0, 'max_pax' => 9999, 'include_transport' => true]),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function airlineProducts(): array
    {
        return [
            $this->product('PRD-MSK-SAUDIA-CGK-JED', 'saudia-airlines-cgk-jed', 'Saudia Airlines', 'maskapai', 14000000, 'IDR', 'per_jamaah', 'Penerbangan direct CGK-JED dengan bagasi 30 kg.', ['route' => 'CGK-JED', 'flight_type' => 'Direct', 'baggage' => '30kg']),
            $this->product('PRD-MSK-EMIRATES-CGK-JED', 'emirates-cgk-jed-via-dxb', 'Emirates', 'maskapai', 11500000, 'IDR', 'per_jamaah', 'Penerbangan CGK-JED transit Dubai dengan bagasi 30 kg.', ['route' => 'CGK-JED via DXB', 'flight_type' => 'Transit', 'baggage' => '30kg']),
            $this->product('PRD-MSK-ETIHAD-CGK-JED', 'etihad-cgk-jed-via-auh', 'Etihad Airways', 'maskapai', 12000000, 'IDR', 'per_jamaah', 'Penerbangan CGK-JED transit Abu Dhabi dengan bagasi 30 kg.', ['route' => 'CGK-JED via AUH', 'flight_type' => 'Transit', 'baggage' => '30kg']),
            $this->product('PRD-MSK-SAUDIA-NOV-2026', 'saudia-airlines-november-2026', 'Saudia Airlines Nov 2026', 'maskapai', 16000000, 'IDR', 'per_jamaah', 'Penerbangan direct CGK-JED-CGK atau CGK-MED-CGK dengan bagasi 23 kg.', ['route' => 'CGK-JED-CGK / CGK-MED-CGK', 'flight_type' => 'Direct', 'baggage' => '23kg']),
            $this->product('PRD-MSK-EGYPTAIR-JED-MED', 'egyptair-cgk-jed-med-cgk', 'EgyptAir - CGK-JED//MED-CGK', 'maskapai', 989, 'USD', 'per_jamaah', 'Rute multi-city CGK-CAI-JED // MED-CGK, Mesir lebih dulu, bagasi 30 kg.', ['route' => 'CGK-CAI-JED // MED-CGK', 'flight_type' => 'Multi-city', 'baggage' => '30kg']),
            $this->product('PRD-MSK-EGYPTAIR-JED-PP', 'egyptair-cgk-jed-cgk', 'EgyptAir - CGK-JED-CGK', 'maskapai', 999, 'USD', 'per_jamaah', 'Rute multi-city CGK-CAI-JED-CGK dengan bagasi 30 kg.', ['route' => 'CGK-CAI-JED-CGK', 'flight_type' => 'Multi-city', 'baggage' => '30kg']),
            $this->product('PRD-MSK-EGYPTAIR-MED-JED', 'egyptair-cgk-med-jed-cgk', 'EgyptAir - CGK-MED//JED-CGK', 'maskapai', 1050, 'USD', 'per_jamaah', 'Rute multi-city CGK-CAI-MED // JED-CGK dengan bagasi 30 kg.', ['route' => 'CGK-CAI-MED // JED-CGK', 'flight_type' => 'Multi-city', 'baggage' => '30kg']),
            $this->product('PRD-MSK-SAUDIA-JED-PP', 'saudia-airlines-cgk-jed-cgk', 'Saudia Airlines CGK-JED-CGK', 'maskapai', 16100000, 'IDR', 'per_jamaah', 'Penerbangan direct CGK-JED-CGK dengan bagasi 23 kg.', ['route' => 'CGK-JED-CGK', 'flight_type' => 'Direct', 'baggage' => '23kg']),
            $this->product('PRD-MSK-SAUDIA-CAIRO', 'saudia-multi-city-cairo', 'Saudia Multi-city CGK-JED+CAI', 'maskapai', 16500000, 'IDR', 'per_jamaah', 'Rute multi-city via Cairo dengan bagasi 23 kg.', ['route' => 'CGK-CAI-JED // MED-CAI-CGK', 'flight_type' => 'Multi-city via Cairo', 'baggage' => '23kg']),
            $this->product('PRD-MSK-QATAR-DOH', 'qatar-airways-via-doha', 'Qatar Airways', 'maskapai', 0, 'IDR', 'per_jamaah', 'Rute CGK-DOH-JED // MED-DOH-CGK. Harga belum tersedia dan wajib dilengkapi sebelum digunakan.', ['route' => 'CGK-DOH-JED // MED-DOH-CGK', 'flight_type' => 'Transit via Doha', 'baggage' => '23kg'], false),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function handlingSaudiProducts(): array
    {
        return [
            $this->product('PRD-HSA-STANDARD', 'handling-saudi-standard', 'Handling A Standard', 'handling-saudi-arabia', 50, 'USD', 'per_jamaah', 'Penjemputan dan pengantaran Bandara Jeddah, City Tour Makkah dan Madinah dengan snack, termasuk muthawwif.'),
            $this->product('PRD-HSA-PREMIUM', 'handling-saudi-premium', 'Handling B Premium', 'handling-saudi-arabia', 90, 'USD', 'per_jamaah', 'Paket handling Saudi Arabia premium all-in.'),
            $this->product('PRD-HSA-NOV-2026', 'handling-saudi-november-2026', 'Handling Saudi Nov 2026', 'handling-saudi-arabia', 1000000, 'IDR', 'per_jamaah', 'Paket handling Saudi Arabia all-in November 2026.'),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function handlingIndonesiaProducts(): array
    {
        return [
            $this->product('PRD-HID-STANDARD', 'handling-indonesia-standard', 'Handling Only', 'handling-indonesia', 70000, 'IDR', 'per_jamaah', 'Handling keberangkatan dan kepulangan tanpa makan.'),
            $this->product('PRD-HID-MAKAN', 'handling-indonesia-dan-makan', 'Handling + Makan', 'handling-indonesia', 170000, 'IDR', 'per_jamaah', 'Handling keberangkatan dan kepulangan termasuk makan keberangkatan dan kepulangan.'),
            $this->product('PRD-HID-NOV-75', 'handling-indonesia-november-75000', 'Handling Only Nov (75rb)', 'handling-indonesia', 75000, 'IDR', 'per_jamaah', 'Handling kedatangan dan kepulangan November tanpa lounge.'),
            $this->product('PRD-HID-NOV-LOUNGE', 'handling-indonesia-lounge-november', 'Handling + Lounge Nov (230rb)', 'handling-indonesia', 230000, 'IDR', 'per_jamaah', 'Handling kedatangan dan kepulangan November termasuk lounge.'),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function equipmentProducts(): array
    {
        return [
            $this->product('PRD-PLK-KOPER-A', 'koper-24-inch-koper-store-a', 'Koper 24 inch - Koper Store A', 'perlengkapan', 450000, 'IDR', 'per_jamaah', 'Koper 24 inch dari Koper Store A.', ['supplier' => 'Koper Store A']),
            $this->product('PRD-PLK-KOPER-B', 'koper-24-inch-koper-store-b', 'Koper 24 inch - Koper Store B', 'perlengkapan', 380000, 'IDR', 'per_jamaah', 'Koper 24 inch dari Koper Store B.', ['supplier' => 'Koper Store B']),
            $this->product('PRD-PLK-IHRAM', 'ihram-pria', 'Ihram Pria', 'perlengkapan', 150000, 'IDR', 'per_jamaah', 'Perlengkapan ihram pria dari Toko Ihram.', ['supplier' => 'Toko Ihram']),
            $this->product('PRD-PLK-MUKENA', 'mukena-wanita', 'Mukena Wanita', 'perlengkapan', 120000, 'IDR', 'per_jamaah', 'Mukena wanita dari Toko Busana.', ['supplier' => 'Toko Busana']),
            $this->product('PRD-PLK-TAS-SERUT', 'tas-serut', 'Tas Serut', 'perlengkapan', 45000, 'IDR', 'per_jamaah', 'Tas serut jamaah dari Tas Indo.', ['supplier' => 'Tas Indo']),
            $this->product('PRD-PLK-BUKU-DOA', 'buku-doa', 'Buku Doa', 'perlengkapan', 35000, 'IDR', 'per_jamaah', 'Buku doa jamaah dari Qibla Press.', ['supplier' => 'Qibla Press']),
            $this->product('PRD-PLK-LANYARD', 'lanyard-dan-id', 'Lanyard & ID', 'perlengkapan', 15000, 'IDR', 'per_jamaah', 'Lanyard dan kartu identitas jamaah.', ['supplier' => 'Percetakan']),
            $this->product('PRD-PLK-BATIK', 'seragam-batik', 'Seragam Batik', 'perlengkapan', 185000, 'IDR', 'per_jamaah', 'Seragam batik jamaah dari konveksi.', ['supplier' => 'Konveksi']),
            $this->product('PRD-PLK-ALL-IN', 'all-in-perlengkapan-1-juta', 'All-in Perlengkapan 1jt', 'perlengkapan', 1000000, 'IDR', 'per_jamaah', 'Paket perlengkapan lengkap November.', ['supplier' => 'Paket Lengkap Nov']),
            $this->product('PRD-PLK-PAKET-HEMAT', 'paket-hemat-perlengkapan', 'Paket Hemat (Koper+Ihram/Mukena+Seragam+Lanyard)', 'perlengkapan', 850000, 'IDR', 'per_jamaah', 'Koper besar, ihram pria atau mukena wanita, bahan seragam, dan lanyard.', ['supplier' => 'Bundle']),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function transportationProducts(): array
    {
        return [
            $this->product('PRD-TRN-BUS-JED-MED', 'bus-jeddah-madinah-pp', 'Bus Jeddah-Madinah (PP)', 'transportasi', 35000000, 'IDR', 'flat', 'Sewa bus Jeddah-Madinah pulang-pergi.'),
            $this->product('PRD-TRN-BUS-MAK-MED', 'bus-makkah-madinah-pp', 'Bus Makkah-Madinah (PP)', 'transportasi', 30000000, 'IDR', 'flat', 'Sewa bus Makkah-Madinah pulang-pergi.'),
            $this->product('PRD-TRN-THAIF-BUS', 'city-tour-thaif-sewa-bus', 'City Tour Thaif - Sewa Bus', 'transportasi', 1000, 'SAR', 'flat', 'Sewa bus untuk City Tour Thaif.'),
            $this->product('PRD-TRN-THAIF-MEAL', 'city-tour-thaif-makan', 'City Tour Thaif - Makan Jamaah', 'transportasi', 25, 'SAR', 'per_jamaah', 'Biaya makan per jamaah untuk City Tour Thaif.'),
            $this->product('PRD-TRN-MED-BUS', 'city-tour-madinah-sewa-bus', 'City Tour Madinah - Sewa Bus', 'transportasi', 800, 'SAR', 'flat', 'Sewa bus untuk City Tour Madinah.'),
            $this->product('PRD-TRN-MED-MEAL', 'city-tour-madinah-makan', 'City Tour Madinah - Makan Jamaah', 'transportasi', 20, 'SAR', 'per_jamaah', 'Biaya makan per jamaah untuk City Tour Madinah.'),
            $this->product('PRD-TRN-SAU-JED-MED', 'saudi-jeddah-madinah-per-pax', 'Saudi - Jeddah-Madinah (PP/pax)', 'transportasi', 100, 'SAR', 'per_jamaah', 'Transportasi Jeddah-Madinah pulang-pergi per jamaah.'),
            $this->product('PRD-TRN-SAU-MED-MAK', 'saudi-madinah-makkah-per-pax', 'Saudi - Madinah-Makkah', 'transportasi', 100, 'SAR', 'per_jamaah', 'Transportasi Madinah-Makkah per jamaah.'),
            $this->product('PRD-TRN-SAU-ZIARAH', 'saudi-ziarah-makkah-per-pax', 'Saudi - Ziarah Makkah', 'transportasi', 50, 'SAR', 'per_jamaah', 'Transportasi ziarah Makkah per jamaah.'),
            $this->product('PRD-TRN-SAU-AIRPORT', 'saudi-antar-bandara-per-pax', 'Saudi - Antar Bandara', 'transportasi', 100, 'SAR', 'per_jamaah', 'Transportasi antar bandara di Saudi Arabia per jamaah.'),
        ];
    }

    /** @return array<int, array<string, mixed>> */
    private function manasikProducts(): array
    {
        return [
            $this->product('PRD-MNS-SILVER-HONOR', 'manasik-silver-online-honorarium', 'Manasik Silver - Online (Honorarium Ustadz)', 'manasik', 3000000, 'IDR', 'flat', 'Honorarium ustadz untuk Manasik Silver secara online.'),
            $this->product('PRD-MNS-GOLD-BALLROOM', 'manasik-gold-sewa-ballroom', 'Manasik Gold - Sewa Ballroom', 'manasik', 210000, 'IDR', 'per_jamaah', 'Sewa ballroom Manasik Gold offline per jamaah.'),
            $this->product('PRD-MNS-GOLD-HONOR', 'manasik-gold-honorarium-pemateri', 'Manasik Gold - Honorarium Pemateri', 'manasik', 5000000, 'IDR', 'flat', 'Honorarium pemateri untuk Manasik Gold offline.'),
            $this->product('PRD-MNS-GOLD-MC', 'manasik-gold-mc-freelance', 'Manasik Gold - MC Freelance', 'manasik', 1500000, 'IDR', 'flat', 'Biaya MC freelance untuk Manasik Gold offline.'),
            $this->product('PRD-MNS-NOV-HONOR', 'manasik-online-november-honor', 'Manasik Online Nov - 1jt Honor', 'manasik', 1000000, 'IDR', 'flat', 'Honor pengisi Manasik Online November.'),
        ];
    }

    /** @return array<string, mixed> */
    private function product(
        string $code,
        string $slug,
        string $name,
        string $productType,
        int|float $price,
        string $currency,
        string $pricingMode,
        string $description,
        array $metadata = [],
        bool $isActive = true,
    ): array {
        return [
            'code' => $code,
            'slug' => $slug,
            'name' => $name,
            'product_type' => $productType,
            'description' => $description,
            'is_active' => $isActive,
            'content' => [
                'price' => $price,
                'currency' => $currency,
                'pricing_mode' => $pricingMode,
                'unit' => $pricingMode === 'flat' ? 'per paket' : 'per jamaah',
                'reference_source' => 'docs/aplikasi menghitung hpp.html',
                ...$metadata,
            ],
        ];
    }
}
