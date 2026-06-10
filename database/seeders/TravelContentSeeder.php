<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\CareerOpening;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\LegalDocument;
use App\Models\PageContent;
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
        $this->seedCareerOpenings();
    }

    private function localize(string $id, ?string $en = null): string
    {
        return $id;
    }

    /**
     * @param  array<int, string>  $blocks
     */
    private function html(array $blocks): string
    {
        return implode('', $blocks);
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
                    'public_theme' => config('branding.public_theme'),
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
                        ['value' => '50+', 'label' => $this->localize('Program Terlaksana', 'Programs Delivered')],
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
                'slug' => 'home_landing_mockup',
                'category' => 'page',
                'title' => $this->localize('Landing Asfar Tour', 'Asfar Tour Landing'),
                'excerpt' => $this->localize('Konten landing baru untuk halaman /landing.'),
                'content' => [
                    'faq' => [
                        'title' => $this->localize('Pertanyaan yang Sering Ditanyakan'),
                        'description' => $this->localize('Temukan jawaban atas pertanyaan jamaah kami.'),
                    ],
                    'hero' => [
                        'image' => '/images/dummy.jpg',
                        'label' => $this->localize('Hajj & Umrah', 'Hajj & Umrah'),
                        'title' => $this->localize("Hajj & Umrah\nTerpercaya\nPerjalanan\nMenuju\nTanah Suci\nImpian Anda", 'Trusted Hajj & Umrah Journey'),
                        'cta_label' => $this->localize('Konsultasi Gratis', 'Free Consultation'),
                        'description' => $this->localize('Bersama Asfar Tour, setiap langkah ibadah Anda kami jaga dengan sepenuh hati. Didampingi mutawif berpengalaman, fasilitas premium, dan layanan tulus.'),
                        'feature_cards' => [
                            [
                                'icon' => 'hotel',
                                'title' => $this->localize('Hotel Premium Pilihan'),
                                'description' => $this->localize('Dekat Masjidil Haram & Nabawi'),
                            ],
                            [
                                'icon' => 'plane',
                                'title' => $this->localize('Penerbangan Direct'),
                                'description' => $this->localize('Jakarta - Madinah Non-stop'),
                            ],
                            [
                                'icon' => 'images',
                                'title' => $this->localize('Free Dokumentasi'),
                                'description' => $this->localize('Kenangan ibadah Anda abadi'),
                            ],
                        ],
                        'secondary_cta_href' => '/paket-umroh',
                        'secondary_cta_label' => $this->localize('Lihat Paket', 'View Packages'),
                    ],
                    'about' => [
                        'cta' => $this->localize('Baca Selengkapnya', 'Read More'),
                        'label' => $this->localize('Tentang Kami', 'About Us'),
                        'title' => $this->localize('Pelayanan Umroh yang Tertata dan Menenangkan'),
                        'description' => $this->localize('Kami mengelola keberangkatan umroh dengan alur yang jelas, pendampingan ibadah, dan komunikasi yang transparan.'),
                        'image_primary' => '/images/dummy.jpg',
                        'image_secondary' => '/images/dummy.jpg',
                    ],
                    'stats' => [
                        ['label' => $this->localize('Jamaah Diberangkatkan'), 'value' => '500+'],
                        ['label' => $this->localize('Tahun Pengalaman'), 'value' => '10+'],
                        ['label' => $this->localize('Rating Jamaah'), 'value' => '4.9'],
                        ['label' => $this->localize('Program Terlaksana'), 'value' => '50+'],
                    ],
                    'footer' => [
                        'brand' => $this->localize('ASFAR TOUR'),
                        'subtitle' => $this->localize('Hajj & Umrah'),
                        'copyright' => $this->localize('(c) 2025 Asfar Tour - Terdaftar Kemenag RI'),
                    ],
                    'contact' => [
                        'label' => $this->localize('Kontak Cepat', 'Quick Contact'),
                        'title' => $this->localize('Siap berangkat? Konsultasi gratis dulu.', 'Ready to depart? Start with a free consultation.'),
                        'description' => $this->localize('Konsultasikan kebutuhan ibadah Anda bersama tim kami. Gratis, tanpa syarat, tanpa tekanan.'),
                        'banner_image' => '/images/dummy.jpg',
                        'banner_title' => $this->localize("Siap Melangkah ke\nTanah Suci?"),
                        'address_label' => $this->localize('Alamat'),
                        'banner_kicker' => $this->localize('Mulai Perjalanan Anda'),
                        'contact_label' => $this->localize('Lihat Kontak Lengkap', 'View Full Contact'),
                        'secondary_href' => '/paket-umroh',
                        'whatsapp_label' => $this->localize('Chat Admin WhatsApp Sekarang'),
                        'secondary_label' => $this->localize('Lihat Paket'),
                        'contact_info_label' => $this->localize('Kontak'),
                        'navbar_whatsapp_label' => $this->localize('Chat Admin'),
                    ],
                    'gallery' => [
                        'title' => $this->localize('Galeri Perjalanan', 'Travel Gallery'),
                        'images' => [],
                        'cta_label' => $this->localize('OUR HISTORY'),
                        'description' => $this->localize('Momen-momen berharga selama perjalanan jamaah.'),
                    ],
                    'problem' => [
                        'label' => $this->localize('PENTING DIKETAHUI'),
                        'quote' => $this->localize('Kami memahami kekhawatiran itu. Karena itu, kami hadir dengan sistem yang jelas dan transparan.'),
                        'badges' => [
                            $this->localize('Biaya tiba-tiba berubah di tengah jalan'),
                            $this->localize('Minimnya informasi & komunikasi'),
                            $this->localize('Jadwal keberangkatan tidak jelas'),
                            $this->localize('Takut tertipu travel yang tidak amanah'),
                        ],
                        'heading' => $this->localize('Banyak Jamaah Gagal Berangkat Bukan Karena Niat, Tapi Karena Salah Pilih Travel'),
                    ],
                    'articles' => [
                        'label' => $this->localize('Artikel'),
                        'heading' => $this->localize('News & Update Terbaru'),
                        'cta_label' => $this->localize('Lihat Semua Artikel'),
                        'empty_title' => $this->localize('Belum ada artikel yang tampil.'),
                        'read_more_label' => $this->localize('Baca selengkapnya'),
                        'empty_description' => $this->localize('Pastikan artikel sudah berstatus Terbit dan tanggal publikasinya tidak di masa depan.'),
                        'fallback_item_title_prefix' => $this->localize('Artikel'),
                    ],
                    'packages' => [
                        'title' => $this->localize('Pilihan Paket'),
                        'heading' => $this->localize('Paket Umrah Kami', 'Our Umrah Packages'),
                        'cta_label' => $this->localize('Lihat Paket'),
                        'description' => $this->localize('Pilih paket yang sesuai dengan kebutuhan dan budget perjalanan ibadah Anda.'),
                        'detail_label' => $this->localize('Tanya Paket Ini'),
                        'price_prefix' => $this->localize('Mulai'),
                        'fallback_name' => $this->localize('Paket Umroh'),
                        'duration_suffix' => $this->localize('Hari'),
                        'fallback_summary' => $this->localize('Detail paket akan tampil di sini.'),
                        'discount_badge_label' => $this->localize('UNGGULAN'),
                        'selected_package_ids' => [],
                    ],
                    'services' => [
                        'items' => [
                            [
                                'icon' => 'heart-handshake',
                                'title' => $this->localize('Mutawif Berpengalaman'),
                                'description' => $this->localize('Didampingi pembimbing ibadah profesional yang hafal rute, doa, dan ritual di Tanah Suci.'),
                            ],
                            [
                                'icon' => 'plane',
                                'title' => $this->localize('Penerbangan Direct'),
                                'description' => $this->localize('Penerbangan langsung tanpa transit untuk kenyamanan dan efisiensi waktu jamaah.'),
                            ],
                            [
                                'icon' => 'images',
                                'title' => $this->localize('Free Dokumentasi'),
                                'description' => $this->localize('Setiap momen berharga ibadah Anda diabadikan secara profesional sebagai kenangan seumur hidup.'),
                            ],
                            [
                                'icon' => 'shield-check',
                                'title' => $this->localize('Legal & Amanah'),
                                'description' => $this->localize('Terdaftar resmi di Kemenag RI. Kepercayaan jamaah adalah prioritas utama kami.'),
                            ],
                        ],
                        'label' => $this->localize('Layanan Kami'),
                        'title' => $this->localize('Mengapa Asfar Tour'),
                        'heading' => $this->localize("Ibadah Lebih Bermakna\nBersama Kami"),
                        'description' => $this->localize('Kami tidak sekadar memberangkatkan - kami memastikan setiap momen ibadah Anda berjalan sempurna.'),
                        'highlight_word' => $this->localize('Bermakna'),
                        'fallback_description' => $this->localize('Deskripsi layanan akan tampil di sini.'),
                        'fallback_title_prefix' => $this->localize('Layanan'),
                    ],
                    'timeline' => [
                        'label' => $this->localize('Alur Perjalanan yang Kami Jalankan'),
                        'steps' => [
                            ['icon' => 'users', 'title' => $this->localize('Registrasi'), 'caption' => $this->localize('DAFTAR & KONSULTASI'), 'description' => $this->localize('Konsultasi & pilih paket yang sesuai.')],
                            ['icon' => 'credit-card', 'title' => $this->localize('Pembayaran'), 'caption' => $this->localize('DP / PELUNASAN'), 'description' => $this->localize('Skema biaya jelas, konfirmasi transparan.')],
                            ['icon' => 'check-circle-2', 'title' => $this->localize('Persiapan Umroh'), 'caption' => $this->localize('MANASIK & DOKUMEN'), 'description' => $this->localize('Manasik, perlengkapan, dan dokumen.')],
                            ['icon' => 'plane', 'title' => $this->localize('Keberangkatan'), 'caption' => $this->localize('BERANGKAT BARENG'), 'description' => $this->localize('Briefing & pendampingan sebelum berangkat.')],
                            ['icon' => 'landmark', 'title' => $this->localize('Ibadah'), 'caption' => $this->localize('BIMBINGAN IBADAH'), 'description' => $this->localize('Bimbingan ibadah sepanjang perjalanan.')],
                            ['icon' => 'calendar-days', 'title' => $this->localize('Kepulangan'), 'caption' => $this->localize('PULANG AMAN'), 'description' => $this->localize('Kontrol perjalanan sampai tiba di tanah air.')],
                        ],
                        'heading' => $this->localize('Sistem Perjalanan yang Jelas, Bukan Sekadar Janji'),
                        'value_cards' => [
                            ['icon' => 'shield-check', 'title' => $this->localize('Transparansi Biaya'), 'description' => $this->localize('Rincian biaya jelas sejak awal, tanpa kejutan di tengah jalan.')],
                            ['icon' => 'calendar-days', 'title' => $this->localize('Timeline Terencana'), 'description' => $this->localize('Jadwal terstruktur dari pendaftaran sampai kepulangan.')],
                            ['icon' => 'heart-handshake', 'title' => $this->localize('Pendampingan Ibadah'), 'description' => $this->localize('Pembimbing berpengalaman memastikan ibadah lebih tenang dan khusyuk.')],
                            ['icon' => 'check-circle-2', 'title' => $this->localize('Sistem Terstruktur'), 'description' => $this->localize('Proses administrasi, keberangkatan, dan pelayanan berjalan rapi.')],
                        ],
                    ],
                    'testimonials' => [
                        'title' => $this->localize('Testimoni Jamaah'),
                        'heading' => $this->localize('Mereka Sudah Merasakan'),
                        'next_label' => $this->localize('Berikutnya'),
                        'prev_label' => $this->localize('Sebelumnya'),
                        'description' => $this->localize('Kepercayaan jamaah adalah kebanggaan terbesar Asfar Tour.'),
                        'fallback_quote' => $this->localize('Kepercayaan jamaah adalah kebanggaan terbesar Asfar Tour.'),
                        'featured_label' => $this->localize('UNGGULAN'),
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
                        ['value' => '50+', 'label' => $this->localize('Program Terlaksana', 'Programs Delivered')],
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
                    'body' => $this->localize(
                        $this->html([
                            '<p>Asfar Tour berkomitmen menjalankan operasional perjalanan ibadah secara legal, transparan, dan mudah diverifikasi oleh calon jamaah maupun keluarga.</p>',
                            '<h2>Komitmen Legalitas</h2>',
                            '<ul>',
                            '<li>Setiap transaksi diarahkan melalui rekening resmi perusahaan.</li>',
                            '<li>Dokumen perizinan dan identitas usaha dapat diverifikasi melalui tim admin resmi.</li>',
                            '<li>Informasi paket, jadwal, dan fasilitas selalu disampaikan tertulis sebelum keberangkatan.</li>',
                            '</ul>',
                            '<h3>Catatan Penting</h3>',
                            '<p>Apabila Anda menerima penawaran dari pihak yang mengatasnamakan perusahaan, pastikan nomor kontak, rekening, dan dokumen pendukung sesuai dengan kanal resmi yang tercantum di website.</p>',
                        ]),
                        $this->html([
                            '<p>Asfar Tour is committed to operating pilgrimage journeys legally, transparently, and in a way that is easy for pilgrims and families to verify.</p>',
                            '<h2>Legal Commitment</h2>',
                            '<ul>',
                            '<li>All transactions are directed through the official company bank account.</li>',
                            '<li>Licenses and company identity documents can be verified through the official admin team.</li>',
                            '<li>Package details, schedules, and facilities are always shared in writing before departure.</li>',
                            '</ul>',
                            '<h3>Important Note</h3>',
                            '<p>If you receive an offer from someone claiming to represent the company, make sure the contact number, bank account, and supporting documents match the official channels listed on the website.</p>',
                        ]),
                    ),
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
                'slug' => 'home_landing',
                'category' => 'page',
                'title' => $this->localize('Home Landing Website', 'Home Landing Website'),
                'excerpt' => $this->localize('Konten utama untuk halaman /.', 'Primary content for the / homepage.'),
                'content' => [
                    'hero' => [
                        'label' => ['id' => 'Asfar Tour', 'en' => 'Asfar Tour'],
                        'title' => ['id' => 'Jelas Rencananya, Terjamin Amanahnya.', 'en' => 'Clear in Planning, Trusted in Delivery.'],
                        'description' => [
                            'id' => 'Pengalaman ibadah umroh yang khusyuk, nyaman, dan terarah bersama tim yang amanah.',
                            'en' => 'A focused, comfortable, and well-guided umrah journey with a trusted team.',
                        ],
                        'image' => '/images/dummy.jpg',
                        'cta_label' => ['id' => 'FREE KONSULTASI', 'en' => 'FREE CONSULTATION'],
                        'secondary_cta_label' => ['id' => 'Lihat Paket', 'en' => 'View Packages'],
                        'secondary_cta_href' => '/paket-umroh',
                        'background' => [
                            'type' => 'default',
                            'color' => '#0f766e',
                            'overlay_intensity' => 'strong',
                        ],
                    ],
                    'timeline' => [
                        'label' => ['id' => 'Alur Perjalanan yang Kami Jalankan', 'en' => 'Journey Flow'],
                        'heading' => [
                            'id' => 'Sistem Perjalanan yang Jelas, Bukan Sekadar Janji',
                            'en' => 'A Clear System, Not Just Promises',
                        ],
                        'background' => [
                            'type' => 'default',
                            'color' => '#155e75',
                            'overlay_intensity' => 'strong',
                        ],
                        'steps' => [
                            [
                                'icon' => 'users',
                                'caption' => ['id' => 'DAFTAR & KONSULTASI', 'en' => 'REGISTER'],
                                'title' => ['id' => 'Registrasi', 'en' => 'Registration'],
                                'description' => ['id' => 'Konsultasi & pilih paket yang sesuai.', 'en' => 'Consult and pick the right package.'],
                            ],
                            [
                                'icon' => 'credit-card',
                                'caption' => ['id' => 'DP / PELUNASAN', 'en' => 'PAYMENT'],
                                'title' => ['id' => 'Pembayaran', 'en' => 'Payment'],
                                'description' => ['id' => 'Skema biaya jelas, konfirmasi transparan.', 'en' => 'Clear costs and transparent confirmation.'],
                            ],
                            [
                                'icon' => 'check-circle-2',
                                'caption' => ['id' => 'MANASIK & DOKUMEN', 'en' => 'PREP'],
                                'title' => ['id' => 'Persiapan Umroh', 'en' => 'Preparation'],
                                'description' => ['id' => 'Manasik, perlengkapan, dan dokumen.', 'en' => 'Manasik, gear, and documents.'],
                            ],
                            [
                                'icon' => 'plane',
                                'caption' => ['id' => 'BERANGKAT BARENG', 'en' => 'DEPART'],
                                'title' => ['id' => 'Keberangkatan', 'en' => 'Departure'],
                                'description' => ['id' => 'Briefing & pendampingan sebelum berangkat.', 'en' => 'Briefing and guidance before departure.'],
                            ],
                            [
                                'icon' => 'landmark',
                                'caption' => ['id' => 'BIMBINGAN IBADAH', 'en' => 'GUIDANCE'],
                                'title' => ['id' => 'Ibadah', 'en' => 'Worship'],
                                'description' => ['id' => 'Bimbingan ibadah sepanjang perjalanan.', 'en' => 'Guidance throughout the journey.'],
                            ],
                            [
                                'icon' => 'calendar-days',
                                'caption' => ['id' => 'PULANG AMAN', 'en' => 'RETURN'],
                                'title' => ['id' => 'Kepulangan', 'en' => 'Return'],
                                'description' => ['id' => 'Kontrol perjalanan sampai tiba di tanah air.', 'en' => 'Managed until you return home.'],
                            ],
                        ],
                        'value_cards' => [
                            [
                                'icon' => 'shield-check',
                                'title' => ['id' => 'Transparansi Biaya', 'en' => 'Transparent Fees'],
                                'description' => ['id' => 'Rincian biaya jelas sejak awal, tanpa kejutan di tengah jalan.', 'en' => 'Clear fees from the start, no surprises.'],
                            ],
                            [
                                'icon' => 'calendar-days',
                                'title' => ['id' => 'Timeline Terencana', 'en' => 'Planned Timeline'],
                                'description' => ['id' => 'Jadwal terstruktur dari pendaftaran sampai kepulangan.', 'en' => 'Structured schedule from start to return.'],
                            ],
                            [
                                'icon' => 'heart-handshake',
                                'title' => ['id' => 'Pendampingan Ibadah', 'en' => 'Worship Assistance'],
                                'description' => ['id' => 'Pembimbing berpengalaman memastikan ibadah lebih tenang dan khusyuk.', 'en' => 'Experienced guidance for calm worship.'],
                            ],
                            [
                                'icon' => 'check-circle-2',
                                'title' => ['id' => 'Sistem Terstruktur', 'en' => 'Structured System'],
                                'description' => ['id' => 'Proses administrasi, keberangkatan, dan pelayanan berjalan rapi.', 'en' => 'Administration, departure, and service are organized.'],
                            ],
                        ],
                    ],
                    'problem' => [
                        'label' => ['id' => 'PENTING DIKETAHUI', 'en' => 'IMPORTANT'],
                        'heading' => [
                            'id' => 'Banyak Jamaah Gagal Berangkat Bukan Karena Niat, Tapi Karena Salah Pilih Travel',
                            'en' => 'Many Fail to Depart Due to Choosing the Wrong Travel',
                        ],
                        'background' => [
                            'type' => 'default',
                            'color' => '#7a0d17',
                            'overlay_intensity' => 'strong',
                        ],
                        'badges' => [
                            ['id' => 'Biaya tiba-tiba berubah di tengah jalan', 'en' => 'Fees change unexpectedly'],
                            ['id' => 'Minimnya informasi & komunikasi', 'en' => 'Lack of info & communication'],
                            ['id' => 'Jadwal keberangkatan tidak jelas', 'en' => 'Unclear departure schedule'],
                            ['id' => 'Takut tertipu travel yang tidak amanah', 'en' => 'Fear of untrustworthy travel'],
                        ],
                        'quote' => [
                            'id' => 'â€œKami memahami kekhawatiran itu. Karena itu, Asfar Tour hadir dengan sistem yang jelas dan transparan.â€',
                            'en' => 'â€œWe understand the concerns. Thatâ€™s why we provide a clear and transparent system.â€',
                        ],
                    ],
                    'stats' => [
                        ['value' => '15+', 'label' => ['id' => 'Tahun Melayani', 'en' => 'Years of Service']],
                        ['value' => '98%', 'label' => ['id' => 'Kepuasan Jamaah', 'en' => 'Pilgrim Satisfaction']],
                        ['value' => '20K+', 'label' => ['id' => 'Jamaah Berangkat', 'en' => 'Pilgrims Departed']],
                        ['value' => '50+', 'label' => ['id' => 'Program Terlaksana', 'en' => 'Programs Delivered']],
                    ],
                    'about' => [
                        'label' => ['id' => 'Tentang Kami', 'en' => 'About Us'],
                        'title' => [
                            'id' => 'Pelayanan Umroh yang Tertata dan Menenangkan',
                            'en' => 'Structured and Reassuring Umrah Service',
                        ],
                        'description' => [
                            'id' => 'Kami mengelola keberangkatan umroh dengan alur yang jelas, pendampingan ibadah, dan komunikasi yang transparan.',
                            'en' => 'We manage umrah departures with clear flows, worship guidance, and transparent communication.',
                        ],
                        'cta' => ['id' => 'Baca Selengkapnya', 'en' => 'Read More'],
                        'image_primary' => '/images/dummy.jpg',
                        'image_secondary' => '/images/dummy.jpg',
                    ],
                    'packages' => [
                        'title' => ['id' => 'Paket Unggulan', 'en' => 'Featured Packages'],
                        'price_prefix' => ['id' => 'Mulai', 'en' => 'From'],
                        'heading' => ['id' => 'PAKET UMROH KAMI', 'en' => 'OUR UMRAH PACKAGES'],
                        'cta_label' => ['id' => 'Lihat Paket Lainnya', 'en' => 'See More Packages'],
                        'detail_label' => ['id' => 'Lihat Detail', 'en' => 'View Details'],
                        'duration_suffix' => ['id' => 'hari', 'en' => 'days'],
                        'fallback_name' => ['id' => 'Paket Umroh', 'en' => 'Umrah Package'],
                        'fallback_summary' => ['id' => 'Detail paket akan tampil di sini.', 'en' => 'Package details will appear here.'],
                        'background' => [
                            'type' => 'default',
                            'color' => '#0f766e',
                            'overlay_intensity' => 'strong',
                        ],
                    ],
                    'services' => [
                        'label' => ['id' => 'Layanan Kami', 'en' => 'Our Services'],
                        'title' => ['id' => 'Apa yang Kami Tawarkan?', 'en' => 'What We Offer'],
                        'description' => [
                            'id' => 'Layanan umroh menyeluruh untuk menjaga perjalanan ibadah tetap aman, nyaman, dan terarah.',
                            'en' => 'A complete umrah service to keep the worship journey safe, comfortable, and well-guided.',
                        ],
                        'background' => [
                            'type' => 'default',
                            'color' => '#0f766e',
                            'overlay_intensity' => 'strong',
                        ],
                        'fallback_title_prefix' => ['id' => 'Layanan', 'en' => 'Service'],
                        'fallback_description' => [
                            'id' => 'Deskripsi layanan akan tampil di sini.',
                            'en' => 'Service description will appear here.',
                        ],
                        'items' => [
                            [
                                'image_path' => '/images/dummy.jpg',
                                'title' => ['id' => 'Legalitas Terjamin', 'en' => 'Guaranteed Legality'],
                                'description' => ['id' => 'Travel berizin resmi dengan informasi keberangkatan yang jelas.', 'en' => 'Licensed travel with clear departure information.'],
                            ],
                            [
                                'image_path' => '/images/dummy.jpg',
                                'title' => ['id' => 'Pembimbing Profesional', 'en' => 'Professional Guidance'],
                                'description' => ['id' => 'Ustadz berpengalaman mendampingi jamaah sejak manasik hingga pulang.', 'en' => 'Experienced guides assist pilgrims from manasik until return.'],
                            ],
                            [
                                'image_path' => '/images/dummy.jpg',
                                'title' => ['id' => 'Akomodasi Terbaik', 'en' => 'Best Accommodation'],
                                'description' => ['id' => 'Pilihan hotel nyaman yang menyesuaikan kelas paket.', 'en' => 'Comfortable hotel options tailored to the package class.'],
                            ],
                            [
                                'image_path' => '/images/dummy.jpg',
                                'title' => ['id' => 'Layanan Menyeluruh', 'en' => 'Comprehensive Services'],
                                'description' => ['id' => 'Visa, tiket, manasik, perlengkapan, dan dokumen ditangani satu tim.', 'en' => 'Visa, tickets, manasik, equipment, and documents are handled by one team.'],
                            ],
                        ],
                    ],
                    'gallery' => [
                        'title' => ['id' => 'Galeri Perjalanan', 'en' => 'Travel Gallery'],
                        'description' => [
                            'id' => 'Momen-momen berharga selama perjalanan jamaah.',
                            'en' => 'Meaningful moments from pilgrim journeys.',
                        ],
                        'cta_label' => ['id' => 'OUR HISTORY', 'en' => 'OUR HISTORY'],
                        'background' => [
                            'type' => 'default',
                            'color' => '#e6a34a',
                            'overlay_intensity' => 'strong',
                        ],
                        'images' => [],
                    ],
                    'faq' => [
                        'title' => ['id' => 'Pertanyaan Umum', 'en' => 'FAQ'],
                        'description' => [
                            'id' => 'Temukan jawaban untuk pertanyaan yang sering ditanyakan.',
                            'en' => 'Find answers to common questions.',
                        ],
                    ],
                    'testimonials' => [
                        'heading' => ['id' => 'Kesan Jamaah', 'en' => 'Testimonials'],
                        'background' => [
                            'type' => 'default',
                            'color' => '#155e75',
                            'overlay_intensity' => 'strong',
                        ],
                        'fallback_quote' => [
                            'id' => 'Testimoni jamaah akan tampil di sini.',
                            'en' => 'Testimonials will appear here.',
                        ],
                    ],
                    'articles' => [
                        'label' => ['id' => 'Artikel', 'en' => 'Articles'],
                        'heading' => ['id' => 'News & Update Terbaru', 'en' => 'Latest News & Updates'],
                        'cta_label' => ['id' => 'Lihat Semua Artikel', 'en' => 'View All Articles'],
                        'read_more_label' => ['id' => 'Baca selengkapnya', 'en' => 'Read more'],
                        'empty_title' => ['id' => 'Belum ada artikel yang tampil.', 'en' => 'No articles available yet.'],
                        'empty_description' => [
                            'id' => 'Pastikan artikel sudah berstatus Terbit dan tanggal publikasinya tidak di masa depan.',
                            'en' => 'Make sure the article is Published and the publish date is not in the future.',
                        ],
                        'background' => [
                            'type' => 'default',
                            'color' => '#e6a34a',
                            'overlay_intensity' => 'strong',
                        ],
                        'fallback_item_title_prefix' => ['id' => 'Artikel', 'en' => 'Article'],
                    ],
                    'contact' => [
                        'label' => ['id' => 'Kontak Cepat', 'en' => 'Quick Contact'],
                        'title' => [
                            'id' => 'Siap berangkat? Konsultasi gratis dulu.',
                            'en' => 'Ready to depart? Start with a free consultation.',
                        ],
                        'description' => [
                            'id' => 'Tim kami siap membantu memilih paket terbaik, jadwal, dan kebutuhan dokumen.',
                            'en' => 'Our team helps you choose the right package, schedule, and documents.',
                        ],
                        'whatsapp_label' => ['id' => 'Konsultasi WhatsApp', 'en' => 'WhatsApp Consultation'],
                        'contact_label' => ['id' => 'Lihat Kontak Lengkap', 'en' => 'View Full Contact'],
                        'banner_image' => '/images/dummy.jpg',
                        'banner_kicker' => ['id' => 'Konsultasi Gratis', 'en' => 'Free Consultation'],
                        'banner_title' => [
                            'id' => 'AYO WUJUDKAN IBADAH KE TANAH SUCI BARENG {company_name}',
                            'en' => 'Letâ€™s go to the holy land with {company_name}',
                        ],
                        'secondary_label' => ['id' => 'Lihat Paket', 'en' => 'View Packages'],
                        'secondary_href' => '/paket-umroh',
                        'address_label' => ['id' => 'Alamat', 'en' => 'Address'],
                        'contact_info_label' => ['id' => 'Kontak', 'en' => 'Contact'],
                        'background' => [
                            'type' => 'default',
                            'color' => '#7a0d17',
                            'overlay_intensity' => 'strong',
                        ],
                    ],
                ],
                'is_active' => true,
            ],
            [
                'slug' => 'terms-conditions',
                'category' => 'page',
                'title' => $this->localize('Syarat & Ketentuan', 'Terms & Conditions'),
                'excerpt' => $this->localize('Ketentuan penggunaan layanan, pendaftaran, dan transaksi.', 'Rules for using the service, registration, and transactions.'),
                'content' => [
                    'body' => $this->localize(
                        $this->html([
                            '<p>Dengan menggunakan layanan Asfar Tour, pengguna dianggap telah memahami alur pendaftaran, pembayaran, dan komunikasi resmi yang berlaku.</p>',
                            '<h2>Ketentuan Umum</h2>',
                            '<ul>',
                            '<li>Pendaftaran dinyatakan aktif setelah data jamaah dan pembayaran awal diterima.</li>',
                            '<li>Harga paket mengikuti detail yang tertulis pada invoice atau penawaran resmi.</li>',
                            '<li>Perubahan jadwal keberangkatan mengikuti ketersediaan seat dan kebijakan maskapai.</li>',
                            '</ul>',
                            '<h2>Tanggung Jawab Pengguna</h2>',
                            '<p>Calon jamaah wajib memberikan data identitas yang benar, aktif merespons kebutuhan dokumen, dan mengikuti arahan administrasi sebelum keberangkatan.</p>',
                        ]),
                        $this->html([
                            '<p>By using Asfar Tour services, users are considered to understand the active registration, payment, and official communication flow.</p>',
                            '<h2>General Terms</h2>',
                            '<ul>',
                            '<li>Registration becomes active after pilgrim data and the initial payment are received.</li>',
                            '<li>Package prices follow the details stated in the invoice or official quotation.</li>',
                            '<li>Departure schedule changes are subject to seat availability and airline policies.</li>',
                            '</ul>',
                            '<h2>User Responsibility</h2>',
                            '<p>Pilgrims are required to provide accurate identity data, respond to document requests, and follow administrative guidance before departure.</p>',
                        ]),
                    ),
                ],
                'is_active' => true,
            ],
            [
                'slug' => 'privacy-policy',
                'category' => 'page',
                'title' => $this->localize('Kebijakan Privasi', 'Privacy Policy'),
                'excerpt' => $this->localize('Pengelolaan data pribadi jamaah dan pengguna website.', 'Management of pilgrim personal data and website user information.'),
                'content' => [
                    'body' => $this->localize(
                        $this->html([
                            '<p>Data pribadi digunakan untuk proses registrasi, komunikasi layanan, validasi dokumen, dan peningkatan kualitas pendampingan jamaah.</p>',
                            '<h2>Data yang Dikumpulkan</h2>',
                            '<ul>',
                            '<li>Identitas dasar seperti nama, nomor telepon, email, dan alamat.</li>',
                            '<li>Dokumen perjalanan yang dibutuhkan untuk pengurusan keberangkatan.</li>',
                            '<li>Riwayat komunikasi yang berkaitan dengan konsultasi dan transaksi.</li>',
                            '</ul>',
                            '<h2>Perlindungan Data</h2>',
                            '<p>Kami membatasi akses data hanya untuk tim internal yang membutuhkan dan tidak membagikan data kepada pihak luar tanpa dasar yang sah.</p>',
                        ]),
                        $this->html([
                            '<p>Personal data is used for registration, service communication, document validation, and improving pilgrim assistance.</p>',
                            '<h2>Collected Data</h2>',
                            '<ul>',
                            '<li>Basic identity such as name, phone number, email, and address.</li>',
                            '<li>Travel documents required for departure arrangements.</li>',
                            '<li>Communication history related to consultation and transactions.</li>',
                            '</ul>',
                            '<h2>Data Protection</h2>',
                            '<p>We limit data access to the internal team that needs it and do not share data with external parties without a valid basis.</p>',
                        ]),
                    ),
                ],
                'is_active' => true,
            ],
            [
                'slug' => 'refund-policy',
                'category' => 'page',
                'title' => $this->localize('Kebijakan Refund', 'Refund Policy'),
                'excerpt' => $this->localize('Aturan refund, reschedule, dan pembatalan keberangkatan.', 'Refund, reschedule, and cancellation rules for departures.'),
                'content' => [
                    'body' => $this->localize(
                        $this->html([
                            '<p>Permintaan refund atau perubahan jadwal diproses berdasarkan status pembayaran, progres pengurusan dokumen, dan kebijakan vendor terkait.</p>',
                            '<h2>Pengajuan Refund</h2>',
                            '<ul>',
                            '<li>Pengajuan wajib dilakukan melalui admin resmi perusahaan.</li>',
                            '<li>Nominal refund dapat dipotong biaya administrasi, visa, tiket, atau komponen lain yang sudah diproses.</li>',
                            '<li>Estimasi penyelesaian mengikuti hasil verifikasi internal dan vendor.</li>',
                            '</ul>',
                            '<h2>Perubahan Jadwal</h2>',
                            '<p>Reschedule akan dibantu sesuai seat yang tersedia dan selisih biaya yang mungkin timbul pada periode baru.</p>',
                        ]),
                        $this->html([
                            '<p>Refund and schedule change requests are processed based on payment status, document progress, and related vendor policies.</p>',
                            '<h2>Refund Requests</h2>',
                            '<ul>',
                            '<li>Requests must be submitted through the official company admin.</li>',
                            '<li>The refund amount may be reduced by administration, visa, ticket, or other processed component costs.</li>',
                            '<li>Completion timing depends on internal and vendor verification.</li>',
                            '</ul>',
                            '<h2>Schedule Changes</h2>',
                            '<p>Rescheduling will be assisted based on available seats and any fare differences in the new period.</p>',
                        ]),
                    ),
                ],
                'is_active' => true,
            ],
            [
                'slug' => 'disclaimer',
                'category' => 'page',
                'title' => $this->localize('Disclaimer', 'Disclaimer'),
                'excerpt' => $this->localize('Batas tanggung jawab informasi dan layanan.', 'Service and information liability limitations.'),
                'content' => [
                    'body' => $this->localize(
                        $this->html([
                            '<p>Informasi pada website disediakan untuk membantu calon jamaah memahami layanan, namun detail akhir tetap mengacu pada penawaran resmi, invoice, dan dokumen perjalanan.</p>',
                            '<ul>',
                            '<li>Ketersediaan seat, harga, dan jadwal dapat berubah mengikuti vendor dan kondisi operasional.</li>',
                            '<li>Materi website tidak menggantikan verifikasi administratif yang diwajibkan sebelum keberangkatan.</li>',
                            '<li>Keputusan akhir terkait visa dan regulasi perjalanan tetap mengikuti otoritas terkait.</li>',
                            '</ul>',
                        ]),
                        $this->html([
                            '<p>The information on this website is provided to help prospective pilgrims understand the services, but final details always follow the official quotation, invoice, and travel documents.</p>',
                            '<ul>',
                            '<li>Seat availability, pricing, and schedules may change based on vendors and operational conditions.</li>',
                            '<li>Website material does not replace administrative verification required before departure.</li>',
                            '<li>Final decisions regarding visas and travel regulations remain subject to the relevant authorities.</li>',
                            '</ul>',
                        ]),
                    ),
                ],
                'is_active' => true,
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
                    'cta' => $this->localize('Kirim Request', 'Submit Request'),
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
            ['name' => 'Ibu Rahma', 'origin_city' => 'Jakarta', 'package_id' => $packages['ASF-REG-10']->id, 'quote' => $this->localize('Pelayanan rapi dari awal. Manasik jelas, hotel sesuai info, dan pembimbing sabar.', 'The service was organized from the start. Manasik was clear, the hotel matched the information, and the guide was patient.'), 'rating' => 5, 'is_featured' => true],
            ['name' => 'Pak Hadi', 'origin_city' => 'Surabaya', 'package_id' => $packages['ASF-PREM-12']->id, 'quote' => $this->localize('Tim admin responsif, dokumen dibantu sampai tuntas, keberangkatan terasa tenang.', 'The admin team was responsive, the documents were handled well, and departure felt calm.'), 'rating' => 5, 'is_featured' => true],
            ['name' => 'Bu Siti', 'origin_city' => 'Makassar', 'package_id' => $packages['ASF-HEMAT-09']->id, 'quote' => $this->localize('Hotel dekat, jadwal jelas, tim pendamping sangat membantu.', 'The hotel was convenient, the schedule was clear, and the support team was very helpful.'), 'rating' => 5, 'is_featured' => false],
        ];

        foreach ($rows as $row) {
            Testimonial::query()->updateOrCreate(['name' => $row['name'], 'package_id' => $row['package_id']], $row + ['is_active' => true]);
        }
    }

    private function seedFaqs(): void
    {
        $rows = [
            ['question' => $this->localize('Apakah Asfar Tour sudah terdaftar resmi di Kemenag?', 'Is Asfar Tour officially registered with the Ministry of Religious Affairs?'), 'answer' => $this->localize('Ya, Asfar Tour terdaftar resmi di Kemenag RI dan memiliki izin operasional yang berlaku.', 'Yes, Asfar Tour is officially registered and has valid operational permits.'), 'sort_order' => 1],
            ['question' => $this->localize('Berapa lama proses pendaftaran hingga keberangkatan?', 'How long is the registration process until departure?'), 'answer' => $this->localize('Umumnya 1-3 bulan sebelum jadwal keberangkatan, tergantung kuota seat dan proses dokumen.', 'Generally 1-3 months before departure, depending on seat quota and document processing.'), 'sort_order' => 2],
            ['question' => $this->localize('Apakah bisa daftar untuk pasangan suami istri?', 'Can husband and wife register together?'), 'answer' => $this->localize('Bisa. Kami menyediakan opsi kamar dan pengaturan keberangkatan untuk pasangan.', 'Yes. We provide room and departure arrangements for couples.'), 'sort_order' => 3],
            ['question' => $this->localize('Apakah ada cicilan atau DP?', 'Is installment or down payment available?'), 'answer' => $this->localize('Ada. Pembayaran dapat dimulai dengan DP lalu pelunasan mengikuti jadwal yang disepakati.', 'Yes. Payment can start with a down payment and be settled based on the agreed schedule.'), 'sort_order' => 4],
            ['question' => $this->localize('Apa yang dimaksud free dokumentasi di Paket Santuy?', 'What does free documentation in Paket Santuy mean?'), 'answer' => $this->localize('Jamaah mendapatkan layanan dokumentasi foto/video selama program sesuai ketentuan paket.', 'Pilgrims receive photo/video documentation service during the program based on package terms.'), 'sort_order' => 5],
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
