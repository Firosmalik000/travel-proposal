<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\CareerOpening;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\LegalDocument;
use App\Models\PageContent;
use App\Models\Partner;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\TravelService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TravelContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedBrandingSettings();
        $this->seedSeoSettings();
        $this->seedPageContents();
        $this->seedServices();
        $this->seedFaqs();
        $this->seedArticles();
        $this->seedGallery();
        $this->seedTeam();
        $this->seedLegalDocuments();
        $this->seedPartners();
        $this->seedCareerOpenings();
    }

    private function localize(string $id, ?string $en = null): array
    {
        return [
            'id' => $id,
            'en' => $en ?? $id,
        ];
    }

    private function seedBrandingSettings(): void
    {
        PageContent::query()->updateOrCreate(
            ['slug' => 'branding-settings'],
            [
                'category' => 'settings',
                'title' => $this->localize('Branding Settings'),
                'excerpt' => $this->localize('Default branding settings for public pages and administrator portal.'),
                'content' => [
                    'company_name' => 'Asfar Tour',
                    'company_subtitle' => 'Jelas Rencananya, Terjamin Amanahnya.',
                    'palette' => config('branding.palette'),
                ],
                'is_active' => true,
            ],
        );
    }

    private function seedSeoSettings(): void
    {
        PageContent::query()->updateOrCreate(
            ['slug' => 'seo-settings'],
            [
                'category' => 'settings',
                'title' => $this->localize('SEO Settings'),
                'excerpt' => $this->localize('Pengaturan SEO, kontak, dan identitas website travel.'),
                'content' => [
                    'general' => [
                        'siteName' => $this->localize('Asfar Tour', 'Asfar Tour'),
                        'tagline' => $this->localize('Jelas Rencananya, Terjamin Amanahnya.', 'Clear in Planning, Trusted in Delivery.'),
                        'defaultDescription' => $this->localize(
                            'Asfar Tour melayani perjalanan umroh dan haji dengan paket terstruktur, jadwal jelas, dan pendampingan yang profesional.',
                            'Asfar Tour provides structured umrah and hajj journeys with clear schedules and professional guidance.',
                        ),
                        'keywords' => 'travel umroh, paket umroh, haji khusus, jadwal umroh, asfar tour',
                    ],
                    'contact' => [
                        'phone' => '08137892647',
                        'whatsapp' => '08137892647',
                        'email' => 'info@asfartour.co.id',
                        'address' => [
                            'full' => $this->localize(
                                'Casa pesanggrahan, 2 no B6, Jl. H. Sulaiman, Petukangan Utara, Kec. Pesanggrahan, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12260',
                                'Casa Pesanggrahan, 2 No B6, Jl. H. Sulaiman, Petukangan Utara, Pesanggrahan, South Jakarta, Special Capital Region of Jakarta 12260',
                            ),
                            'mapLink' => 'https://maps.google.com/?q=Casa+pesanggrahan+2+no+B6+Jl.+H.+Sulaiman+Petukangan+Utara+Pesanggrahan+Jakarta+Selatan+12260',
                        ],
                        'operatingHours' => [
                            'weekday' => $this->localize('Senin - Jumat, 08.00 - 17.00', 'Monday - Friday, 08.00 AM - 05.00 PM'),
                            'weekend' => $this->localize('Sabtu, 09.00 - 14.00', 'Saturday, 09.00 AM - 02.00 PM'),
                        ],
                    ],
                    'social' => [
                        'accounts' => [
                            [
                                'platform' => 'instagram',
                                'label' => 'Instagram',
                                'url' => 'https://instagram.com/asfartour.id',
                            ],
                            [
                                'platform' => 'tiktok',
                                'label' => 'TikTok',
                                'url' => 'https://tiktok.com/@asfartour.id',
                            ],
                        ],
                        'ogTitle' => $this->localize('Asfar Tour', 'Asfar Tour'),
                        'ogDescription' => $this->localize(
                            'Jelas rencananya, terjamin amanahnya bersama layanan umroh Asfar Tour.',
                            'Clear in planning, trusted in delivery with Asfar Tour umrah services.',
                        ),
                    ],
                    'advanced' => [
                        'robotsDefault' => 'index, follow',
                        'canonicalBase' => config('app.url'),
                        'googleVerification' => '',
                        'bingVerification' => '',
                        'googleAnalyticsId' => '',
                    ],
                    'colors' => config('branding.palette'),
                ],
                'is_active' => true,
            ],
        );
    }

    private function seedPageContents(): void
    {
        $pages = [
            [
                'slug' => 'home',
                'category' => 'page',
                'title' => $this->localize('Asfar Tour - Umroh Profesional & Terpercaya', 'Asfar Tour - Professional & Trusted Umrah'),
                'excerpt' => $this->localize('Landing page travel umroh dengan hero, statistik, layanan, galeri, dan CTA konsultasi.'),
                'content' => [
                    'hero' => [
                        'label' => $this->localize('Asfar Tour', 'Asfar Tour'),
                        'title' => $this->localize('Jelas Rencananya, Terjamin Amanahnya.', 'Clear in Planning, Trusted in Delivery.'),
                        'description' => $this->localize(
                            'Pengalaman ibadah umroh yang khusyuk, nyaman, dan terarah bersama tim yang amanah.',
                            'A focused, comfortable, and well-guided umrah journey with a trusted team.',
                        ),
                        'image' => '/images/dummy.jpg',
                    ],
                    'stats' => [
                        ['value' => '15+', 'label' => $this->localize('Tahun Melayani', 'Years of Service')],
                        ['value' => '98%', 'label' => $this->localize('Kepuasan Jamaah', 'Pilgrim Satisfaction')],
                        ['value' => '20K+', 'label' => $this->localize('Jamaah Berangkat', 'Pilgrims Departed')],
                        ['value' => '50+', 'label' => $this->localize('Mitra Terpercaya', 'Trusted Partners')],
                    ],
                    'about' => [
                        'label' => $this->localize('Tentang Kami', 'About Us'),
                        'title' => $this->localize('Pelayanan Umroh yang Tertata dan Menenangkan', 'Structured and Reassuring Umrah Service'),
                        'description' => $this->localize(
                            'Kami mengelola keberangkatan umroh dengan alur yang jelas, pendampingan ibadah, dan komunikasi yang transparan.',
                            'We manage umrah departures with clear flows, worship guidance, and transparent communication.',
                        ),
                        'cta' => $this->localize('Baca Selengkapnya', 'Read More'),
                        'image_primary' => '/images/dummy.jpg',
                        'image_secondary' => '/images/dummy.jpg',
                    ],
                    'packages' => [
                        'title' => $this->localize('Paket Unggulan', 'Featured Packages'),
                        'price_prefix' => $this->localize('Mulai', 'From'),
                    ],
                    'services' => [
                        'label' => $this->localize('Layanan Kami', 'Our Services'),
                        'title' => $this->localize('Apa yang Kami Tawarkan?', 'What We Offer'),
                        'description' => $this->localize(
                            'Layanan umroh menyeluruh untuk menjaga perjalanan ibadah tetap aman, nyaman, dan terarah.',
                            'A complete umrah service to keep the worship journey safe, comfortable, and well-guided.',
                        ),
                    ],
                    'gallery' => [
                        'title' => $this->localize('Galeri Perjalanan', 'Travel Gallery'),
                        'description' => $this->localize('Momen-momen berharga selama perjalanan jamaah Asfar Tour.', 'Meaningful moments from Asfar Tour pilgrim journeys.'),
                    ],
                    'contact' => [
                        'label' => $this->localize('Kontak Cepat', 'Quick Contact'),
                        'title' => $this->localize('Siap berangkat? Konsultasi gratis dulu.', 'Ready to depart? Start with a free consultation.'),
                        'description' => $this->localize(
                            'Tim kami siap membantu memilih package terbaik, jadwal keberangkatan, dan kebutuhan dokumen.',
                            'Our team helps you choose the right package, departure schedule, and document requirements.',
                        ),
                        'whatsapp_label' => $this->localize('Konsultasi WhatsApp', 'WhatsApp Consultation'),
                        'contact_label' => $this->localize('Lihat Kontak Lengkap', 'View Full Contact'),
                    ],
                ],
            ],
            [
                'slug' => 'tentang-kami',
                'category' => 'page',
                'title' => $this->localize('Tentang Asfar Tour', 'About Asfar Tour'),
                'excerpt' => $this->localize('Profil perusahaan, visi misi, dan tim inti travel umroh.'),
                'content' => [
                    'hero' => [
                        'title' => $this->localize('Tentang Asfar Tour', 'About Asfar Tour'),
                        'description' => $this->localize('Mengenal visi, misi, nilai layanan, dan tim inti Asfar Tour.', 'Learn about Asfar Tour vision, mission, service values, and core team.'),
                    ],
                    'profile' => [
                        'title' => $this->localize('Profil & Nilai Perusahaan', 'Company Profile & Values'),
                        'description' => $this->localize(
                            'Asfar Tour fokus pada penyelenggaraan perjalanan umroh yang tertib, nyaman, dan sesuai tuntunan sejak 2015.',
                            'Asfar Tour has focused on organized, comfortable, and well-guided umrah journeys since 2015.',
                        ),
                        'image_primary' => '/images/dummy.jpg',
                        'image_secondary' => '/images/dummy.jpg',
                    ],
                    'values' => [
                        [
                            'title' => $this->localize('Visi Kami', 'Our Vision'),
                            'description' => $this->localize(
                                'Menjadi perusahaan travel umroh terpercaya dengan pelayanan yang profesional dan menenangkan.',
                                'To become a trusted umrah travel company known for professional and reassuring service.',
                            ),
                        ],
                        [
                            'title' => $this->localize('Misi Kami', 'Our Mission'),
                            'description' => $this->localize(
                                'Memberikan bimbingan ibadah, fasilitas transparan, dan pendampingan total dari awal hingga akhir.',
                                'Provide worship guidance, transparent facilities, and end-to-end support from start to finish.',
                            ),
                        ],
                    ],
                    'team' => [
                        'title' => $this->localize('Tim Inti Kami', 'Our Core Team'),
                        'description' => $this->localize('Figur-figur yang mengawal pelayanan jamaah dari awal hingga akhir.', 'The people who guide pilgrim service from start to finish.'),
                    ],
                    'stats' => [
                        ['value' => '15+', 'label' => $this->localize('Tahun Melayani', 'Years Serving')],
                        ['value' => '20K+', 'label' => $this->localize('Jamaah Berangkat', 'Pilgrims Departed')],
                        ['value' => '98%', 'label' => $this->localize('Kepuasan Jamaah', 'Pilgrim Satisfaction')],
                        ['value' => '50+', 'label' => $this->localize('Mitra Terpercaya', 'Trusted Partners')],
                    ],
                ],
            ],
            [
                'slug' => 'paket-umroh',
                'category' => 'page',
                'title' => $this->localize('Paket Umroh 2026', 'Umrah Packages 2026'),
                'excerpt' => $this->localize('Daftar paket umroh berdasarkan kota keberangkatan, durasi, dan kebutuhan jamaah.'),
                'content' => [
                    'filters' => [
                        'months' => ['Maret 2026', 'April 2026', 'Mei 2026'],
                        'cities' => ['Jakarta', 'Surabaya', 'Makassar'],
                        'durations' => ['9 Hari', '10 Hari', '12 Hari'],
                    ],
                    'cards' => [
                        'detail' => $this->localize('Detail Paket', 'Package Details'),
                        'ask' => $this->localize('Tanya Seat', 'Check Availability'),
                    ],
                    'note' => $this->localize(
                        'Harga dapat berbeda sesuai tipe kamar dan periode keberangkatan.',
                        'Prices may vary based on room type and departure period.',
                    ),
                ],
            ],
            [
                'slug' => 'kontak',
                'category' => 'page',
                'title' => $this->localize('Kontak Resmi', 'Official Contact'),
                'excerpt' => $this->localize('Kanal resmi Asfar Tour untuk konsultasi paket dan dokumen.'),
                'content' => [
                    'badge' => $this->localize('Kontak Resmi', 'Official Contact'),
                    'heading' => $this->localize('Hubungi Asfar Tour', 'Contact Asfar Tour'),
                    'description' => $this->localize(
                        'Kami siap membantu dari konsultasi package sampai kebutuhan dokumen.',
                        'We are ready to help from package consultation to document preparation.',
                    ),
                    'map' => [
                        'title' => $this->localize('Lokasi Kantor', 'Office Location'),
                        'badge' => $this->localize('Maps', 'Maps'),
                        'placeholder' => $this->localize('Maps belum ditambahkan', 'Map is not available yet'),
                        'note' => $this->localize('Lokasi tampil setelah link maps diisi di SEO settings.', 'Location appears after the maps link is filled in SEO settings.'),
                    ],
                ],
            ],
            [
                'slug' => 'legalitas',
                'category' => 'page',
                'title' => $this->localize('Legalitas & Perizinan', 'Licenses & Legalities'),
                'excerpt' => $this->localize('Informasi legalitas resmi travel umroh.', 'Official legality information for the umrah travel business.'),
                'content' => [
                    'hero' => [
                        'badge' => $this->localize('Legal', 'Legal'),
                        'title' => $this->localize('Legalitas & Perizinan', 'Licenses & Legalities'),
                        'description' => $this->localize('Informasi resmi yang memperkuat kepercayaan jamaah.', 'Verified information that strengthens pilgrim trust.'),
                    ],
                    'docs_title' => $this->localize('Dokumen Legalitas', 'Legal Documents'),
                    'bank_title' => $this->localize('Rekening Resmi', 'Official Bank Account'),
                    'bank_lines' => [
                        $this->localize('Nama rekening: PT Asfar Tour', 'Account name: PT Asfar Tour'),
                        $this->localize('Bank: BSI / Bank Syariah', 'Bank: BSI / Islamic Bank'),
                        $this->localize('No rekening: 1234 5678 90', 'Account number: 1234 5678 90'),
                    ],
                    'disclaimer_title' => $this->localize('Disclaimer Anti Penipuan', 'Anti-Fraud Disclaimer'),
                    'disclaimer' => $this->localize(
                        'Kami hanya melayani transaksi melalui rekening resmi perusahaan dan kontak resmi.',
                        'We only accept transactions through the official company account and official contacts.',
                    ),
                ],
            ],
            [
                'slug' => 'galeri',
                'category' => 'page',
                'title' => $this->localize('Galeri Foto & Video', 'Photo & Video Gallery'),
                'excerpt' => $this->localize('Dokumentasi perjalanan jamaah dan tim.', 'Documentation of pilgrim and team journeys.'),
                'content' => [
                    'badge' => $this->localize('Gallery', 'Gallery'),
                    'description' => $this->localize('Dokumentasi jamaah, hotel, manasik, dan perjalanan di tanah suci.', 'Documentation of pilgrims, hotels, manasik, and journeys in the holy land.'),
                ],
            ],
            [
                'slug' => 'mitra',
                'category' => 'page',
                'title' => $this->localize('Mitra, Corporate, & Komunitas', 'Partners, Corporate, & Community'),
                'excerpt' => $this->localize('Program kerja sama untuk corporate dan komunitas.', 'Partnership programs for corporate and community groups.'),
                'content' => [
                    'badge' => $this->localize('Partner', 'Partner'),
                    'subtitle' => $this->localize('Program kerja sama untuk kantor, komunitas, dan organisasi.', 'Collaboration programs for offices, communities, and organizations.'),
                    'description' => $this->localize(
                        'Kami menyediakan penawaran khusus untuk perjalanan rombongan dan corporate.',
                        'We provide special offers for group and corporate trips.',
                    ),
                    'cta' => $this->localize('Hubungi Tim Mitra', 'Contact Partner Team'),
                ],
            ],
            [
                'slug' => 'karier',
                'category' => 'page',
                'title' => $this->localize('Karier di Asfar Tour', 'Careers at Asfar Tour'),
                'excerpt' => $this->localize('Lowongan kerja untuk mendukung operasional travel umroh.', 'Job openings to support umrah travel operations.'),
                'content' => [
                    'badge' => $this->localize('Career', 'Career'),
                    'subtitle' => $this->localize('Bergabung dengan tim yang melayani jamaah dengan amanah.', 'Join a team that serves pilgrims with integrity.'),
                    'cta' => $this->localize('Lihat Detail', 'View Details'),
                ],
            ],
            [
                'slug' => 'custom-umroh',
                'category' => 'page',
                'title' => $this->localize('Custom atau Private Umroh', 'Custom or Private Umrah'),
                'excerpt' => $this->localize('Paket custom untuk keluarga, komunitas, dan corporate.', 'Custom packages for families, communities, and corporate groups.'),
                'content' => [
                    'badge' => $this->localize('Custom', 'Custom'),
                    'subtitle' => $this->localize('Untuk keluarga, komunitas, atau corporate dengan kebutuhan khusus.', 'For families, communities, or corporate groups with specific needs.'),
                    'description' => $this->localize(
                        'Kami menyesuaikan jadwal, hotel, maskapai, dan itinerary sesuai kebutuhan rombongan.',
                        'We tailor schedules, hotels, airlines, and itineraries to your group needs.',
                    ),
                    'cta' => $this->localize('Konsultasi WhatsApp', 'WhatsApp Consultation'),
                ],
            ],
            [
                'slug' => 'paket-detail',
                'category' => 'page',
                'title' => $this->localize('Detail Paket Umroh', 'Umrah Package Details'),
                'excerpt' => $this->localize('Label dan blok umum untuk halaman detail package.', 'General labels and blocks for the package detail page.'),
                'content' => [
                    'ctas' => [
                        'book' => $this->localize('Booking & Konsultasi WhatsApp', 'Book & WhatsApp Consultation'),
                        'brochure' => $this->localize('Unduh Brosur', 'Download Brochure'),
                    ],
                    'summary_title' => $this->localize('Ringkasan Paket', 'Package Summary'),
                    'included_title' => $this->localize('Yang Termasuk', 'Included'),
                    'excluded_title' => $this->localize('Yang Tidak Termasuk', 'Not Included'),
                    'itinerary_title' => $this->localize('Itinerary Perjalanan', 'Travel Itinerary'),
                    'facilities_title' => $this->localize('Fasilitas & Layanan', 'Facilities & Services'),
                    'requirements_title' => $this->localize('Syarat & Dokumen', 'Requirements & Documents'),
                    'payment_title' => $this->localize('Skema Pembayaran', 'Payment Terms'),
                    'policy_title' => $this->localize('Kebijakan Perubahan', 'Change Policy'),
                    'cta_block' => [
                        'title' => $this->localize('Siap berangkat umroh dengan tenang?', 'Ready for a calm umrah journey?'),
                        'description' => $this->localize('Klik WhatsApp, kami kirim brosur dan rincian fasilitas package ini.', 'Tap WhatsApp and we will send the brochure and package facilities.'),
                        'button' => $this->localize('WhatsApp Sekarang', 'WhatsApp Now'),
                    ],
                    'interest' => [
                        'title' => $this->localize('Form Minat', 'Interest Form'),
                        'placeholders' => [
                            $this->localize('Nama lengkap', 'Full name'),
                            $this->localize('Kota domisili', 'City'),
                            $this->localize('Tanggal minat', 'Preferred date'),
                        ],
                        'button' => $this->localize('Kirim Minat', 'Submit Interest'),
                    ],
                ],
            ],
        ];

        foreach ($pages as $page) {
            PageContent::query()->updateOrCreate(['slug' => $page['slug']], $page + ['is_active' => true]);
        }
    }

    private function seedServices(): void
    {
        $rows = [
            ['title' => $this->localize('Legalitas Terjamin', 'Verified Legality'), 'description' => $this->localize('Travel berizin resmi dengan informasi keberangkatan yang jelas.', 'Licensed travel with clear departure information.'), 'sort_order' => 1],
            ['title' => $this->localize('Pembimbing Profesional', 'Professional Guides'), 'description' => $this->localize('Ustadz berpengalaman mendampingi jamaah sejak manasik hingga pulang.', 'Experienced ustadz accompany pilgrims from manasik to return.'), 'sort_order' => 2],
            ['title' => $this->localize('Akomodasi Terbaik', 'Comfortable Accommodation'), 'description' => $this->localize('Pilihan hotel nyaman yang menyesuaikan kelas paket.', 'Comfortable hotel options matched to the package class.'), 'sort_order' => 3],
            ['title' => $this->localize('Layanan Menyeluruh', 'End-to-End Service'), 'description' => $this->localize('Visa, tiket, manasik, perlengkapan, dan dokumen ditangani satu tim.', 'Visa, tickets, manasik, essentials, and documents are handled by one team.'), 'sort_order' => 4],
        ];

        foreach ($rows as $row) {
            TravelService::query()->updateOrCreate(['sort_order' => $row['sort_order']], $row + ['is_active' => true]);
        }
    }

    private function seedTestimonials(array $packages): void
    {
        $rows = [
            ['name' => 'Ibu Rahma', 'origin_city' => 'Jakarta', 'travel_package_id' => $packages['ASF-REG-10']->id, 'quote' => $this->localize('Pelayanan rapi dari awal. Manasik jelas, hotel sesuai info, dan pembimbing sabar.', 'The service was organized from the start. Manasik was clear, the hotel matched the information, and the guide was patient.'), 'rating' => 5, 'is_featured' => true],
            ['name' => 'Pak Hadi', 'origin_city' => 'Surabaya', 'travel_package_id' => $packages['ASF-PREM-12']->id, 'quote' => $this->localize('Tim admin responsif, dokumen dibantu sampai tuntas, keberangkatan terasa tenang.', 'The admin team was responsive, the documents were handled well, and departure felt calm.'), 'rating' => 5, 'is_featured' => true],
            ['name' => 'Bu Siti', 'origin_city' => 'Makassar', 'travel_package_id' => $packages['ASF-HEMAT-09']->id, 'quote' => $this->localize('Hotel dekat, jadwal jelas, tim pendamping sangat membantu.', 'The hotel was convenient, the schedule was clear, and the support team was very helpful.'), 'rating' => 5, 'is_featured' => false],
        ];

        foreach ($rows as $row) {
            Testimonial::query()->updateOrCreate(['name' => $row['name'], 'travel_package_id' => $row['travel_package_id']], $row + ['is_active' => true]);
        }
    }

    private function seedFaqs(): void
    {
        $rows = [
            ['question' => $this->localize('Apakah harga sudah termasuk visa dan tiket?', 'Does the package include visa and tickets?'), 'answer' => $this->localize('Ya, harga paket ditentukan di level package dan sudah mencakup produk yang tercantum pada detail paket.', 'Yes, package pricing is defined at the package level and already includes the listed products.'), 'sort_order' => 1],
            ['question' => $this->localize('Kapan manasik dilakukan?', 'When is manasik conducted?'), 'answer' => $this->localize('Manasik dilakukan sebelum keberangkatan dan jadwalnya diinformasikan oleh admin.', 'Manasik is conducted before departure and the schedule is shared by the admin team.'), 'sort_order' => 2],
            ['question' => $this->localize('Bagaimana cara booking seat?', 'How do I reserve a seat?'), 'answer' => $this->localize('Booking dilakukan melalui admin resmi dengan pembayaran DP sesuai ketentuan paket.', 'Seat reservations are handled through the official admin with a deposit based on the package terms.'), 'sort_order' => 3],
        ];

        foreach ($rows as $row) {
            Faq::query()->updateOrCreate(['sort_order' => $row['sort_order']], $row + ['is_active' => true]);
        }
    }

    private function seedArticles(): void
    {
        $rows = [
            [
                'slug' => 'tips-menyiapkan-dokumen-umroh',
                'title' => $this->localize('Tips Menyiapkan Dokumen Umroh', 'Tips for Preparing Umrah Documents'),
                'excerpt' => $this->localize('Checklist dokumen yang perlu disiapkan sebelum keberangkatan.', 'A checklist of documents to prepare before departure.'),
                'body' => $this->localize('Pastikan paspor aktif, data identitas sesuai, dan konsultasikan kebutuhan vaksin serta dokumen tambahan dengan admin resmi.', 'Make sure your passport is valid, identity data is correct, and consult the official admin about vaccines and additional documents.'),
                'image_path' => '/images/dummy.jpg',
                'published_at' => Carbon::now()->subDays(10),
                'is_featured' => true,
            ],
            [
                'slug' => 'cara-memilih-paket-umroh-sesuai-kebutuhan',
                'title' => $this->localize('Cara Memilih Paket Umroh Sesuai Kebutuhan', 'How to Choose the Right Umrah Package'),
                'excerpt' => $this->localize('Panduan sederhana membandingkan durasi, hotel, dan kota keberangkatan.', 'A simple guide to comparing duration, hotels, and departure cities.'),
                'body' => $this->localize('Pertimbangkan durasi, lokasi hotel, maskapai, dan pendampingan ibadah sebelum memilih paket keberangkatan.', 'Consider duration, hotel location, airline, and worship guidance before choosing a departure package.'),
                'image_path' => '/images/dummy.jpg',
                'published_at' => Carbon::now()->subDays(4),
                'is_featured' => false,
            ],
        ];

        foreach ($rows as $row) {
            Article::query()->updateOrCreate(['slug' => $row['slug']], $row + ['is_active' => true]);
        }
    }

    private function seedGallery(): void
    {
        $rows = [
            ['title' => $this->localize('Detail arsitektur Masjid Nabawi', 'Masjid Nabawi architecture detail'), 'category' => 'galeri', 'description' => $this->localize('Momen dokumentasi perjalanan jamaah.', 'Documented moments from pilgrim journeys.'), 'image_path' => '/images/dummy.jpg', 'sort_order' => 1],
            ['title' => $this->localize('Pemandangan kota Madinah', 'Madinah city view'), 'category' => 'galeri', 'description' => $this->localize('Area sekitar masjid dan hotel jamaah.', 'Areas around the mosque and pilgrim hotels.'), 'image_path' => '/images/dummy.jpg', 'sort_order' => 2],
            ['title' => $this->localize('Jamaah sedang berdoa', 'Pilgrims praying'), 'category' => 'galeri', 'description' => $this->localize('Pendampingan ibadah selama di tanah suci.', 'Worship assistance during the holy land journey.'), 'image_path' => '/images/dummy.jpg', 'sort_order' => 3],
        ];

        foreach ($rows as $row) {
            GalleryItem::query()->updateOrCreate(['sort_order' => $row['sort_order']], $row + ['is_active' => true]);
        }
    }

    private function seedTeam(): void
    {
        $rows = [
            ['name' => 'Direktur Operasional', 'role' => $this->localize('Direktur Operasional', 'Operations Director'), 'bio' => $this->localize('Mengawal operasional keberangkatan, hotel, dan kenyamanan jamaah.', 'Oversees departures, hotels, and pilgrim comfort.'), 'image_path' => '/images/dummy.jpg', 'sort_order' => 1],
            ['name' => 'Pembimbing Ibadah', 'role' => $this->localize('Pembimbing Ibadah', 'Worship Guide'), 'bio' => $this->localize('Mendampingi manasik dan pelaksanaan ibadah selama perjalanan.', 'Guides manasik and worship throughout the journey.'), 'image_path' => '/images/dummy.jpg', 'sort_order' => 2],
            ['name' => 'Customer Care', 'role' => $this->localize('Customer Care', 'Customer Care'), 'bio' => $this->localize('Menangani konsultasi, dokumen, dan tindak lanjut seat.', 'Handles consultations, documents, and seat follow-up.'), 'image_path' => '/images/dummy.jpg', 'sort_order' => 3],
        ];

        foreach ($rows as $row) {
            TeamMember::query()->updateOrCreate(['sort_order' => $row['sort_order']], $row + ['is_active' => true]);
        }
    }

    private function seedLegalDocuments(): void
    {
        $rows = [
            ['title' => $this->localize('Izin Penyelenggara Perjalanan Ibadah Umroh', 'Umrah Travel License'), 'document_number' => 'PPIU-2026-001', 'issued_by' => $this->localize('Kementerian Agama RI', 'Ministry of Religious Affairs'), 'description' => $this->localize('Legalitas utama penyelenggaraan perjalanan umroh.', 'Primary legal license for umrah travel operations.'), 'sort_order' => 1],
            ['title' => $this->localize('Akta Pendirian Perusahaan', 'Company Establishment Deed'), 'document_number' => 'ASF-LEGAL-002', 'issued_by' => $this->localize('Notaris Resmi', 'Authorized Notary'), 'description' => $this->localize('Dokumen pendirian dan perubahan perusahaan.', 'Company establishment and amendment documents.'), 'sort_order' => 2],
        ];

        foreach ($rows as $row) {
            LegalDocument::query()->updateOrCreate(['sort_order' => $row['sort_order']], $row + ['is_active' => true]);
        }
    }

    private function seedPartners(): void
    {
        $rows = [
            ['name' => 'Garuda Indonesia', 'category' => 'maskapai', 'description' => $this->localize('Partner penerbangan untuk keberangkatan tertentu.', 'Flight partner for selected departures.'), 'logo_path' => '/images/dummy.jpg', 'sort_order' => 1],
            ['name' => 'Saudia', 'category' => 'maskapai', 'description' => $this->localize('Maskapai internasional untuk paket reguler dan premium.', 'International airline for regular and premium packages.'), 'logo_path' => '/images/dummy.jpg', 'sort_order' => 2],
        ];

        foreach ($rows as $row) {
            Partner::query()->updateOrCreate(['name' => $row['name']], $row + ['is_active' => true]);
        }
    }

    private function seedCareerOpenings(): void
    {
        $rows = [
            ['title' => $this->localize('Customer Service', 'Customer Service'), 'location' => 'Jakarta', 'employment_type' => 'Full-time', 'description' => $this->localize('Menangani konsultasi jamaah dan tindak lanjut administrasi.', 'Handle pilgrim consultations and administrative follow-up.'), 'requirements' => $this->localize('Pengalaman 1 tahun di bidang pelayanan.', 'At least 1 year of service experience.'), 'sort_order' => 1],
            ['title' => $this->localize('Tour Leader', 'Tour Leader'), 'location' => 'Jakarta', 'employment_type' => 'Project based', 'description' => $this->localize('Mendampingi rombongan dan memastikan itinerary berjalan rapi.', 'Accompany groups and ensure the itinerary runs smoothly.'), 'requirements' => $this->localize('Memahami alur perjalanan ibadah dan komunikasi jamaah.', 'Understands pilgrimage flow and pilgrim communication.'), 'sort_order' => 2],
        ];

        foreach ($rows as $row) {
            CareerOpening::query()->updateOrCreate(['sort_order' => $row['sort_order']], $row + ['is_active' => true]);
        }
    }
}
