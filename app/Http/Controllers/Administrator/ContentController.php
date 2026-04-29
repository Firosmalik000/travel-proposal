<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\ManageTravelResourceRequest;
use App\Http\Requests\Administrator\UpdatePageContentRequest;
use App\Models\Article;
use App\Models\CareerOpening;
use App\Models\DepartureSchedule;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\LegalDocument;
use App\Models\PageContent;
use App\Models\ProductCategory;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\TravelService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    public function index(): Response
    {
        return $this->renderContentPage(
            heading: 'Content Management',
            description: 'FAQ, layanan, testimoni, galeri, tim, legalitas, dan karier. Artikel kini dikelola di menu Articles & News.',
            breadcrumbHref: '/admin/website-management/content',
            pages: [],
            resources: ['services', 'faqs', 'testimonials', 'gallery', 'team', 'legal_documents', 'career_openings'],
        );
    }

    public function portalContent(): Response
    {
        return $this->renderContentPage(
            heading: 'Policy & Help',
            description: 'Kelola halaman policy dan bantuan seperti Terms & Conditions, Privacy Policy, Refund Policy, serta resource FAQ dan legalitas.',
            breadcrumbHref: '/admin/website-management/portal-content',
            pages: $this->portalPageSections(),
            resources: ['faqs', 'legal_documents'],
        );
    }

    public function landing(): Response
    {
        return Inertia::render('Dashboard/WebsiteManagement/Landing/Index', [
            'pages' => $this->landingPageSections(),
        ]);
    }

    public function products(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $productType = trim((string) $request->query('product_type', 'all'));

        $query = TravelProduct::query()
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($inner) use ($search): void {
                    $inner
                        ->where('code', 'like', '%'.$search.'%')
                        ->orWhere('name', 'like', '%'.$search.'%')
                        ->orWhere('slug', 'like', '%'.$search.'%')
                        ->orWhere('product_type', 'like', '%'.$search.'%');
                });
            })
            ->when($productType !== '' && $productType !== 'all', fn ($q) => $q->where('product_type', $productType))
            ->orderBy('code');

        $products = $query
            ->paginate(12)
            ->withQueryString()
            ->through(fn (TravelProduct $product): array => [
                'id' => $product->id,
                'code' => $product->code,
                'slug' => $product->slug,
                'icon' => $product->icon,
                'name' => $product->name,
                'product_type' => $product->product_type,
                'description' => $product->description,
                'unit' => is_array($product->content) ? (string) ($product->content['unit'] ?? '') : '',
                'is_active' => $product->is_active,
            ]);

        $stats = [
            'total' => TravelProduct::query()->count(),
            'active' => TravelProduct::query()->where('is_active', true)->count(),
            'inactive' => TravelProduct::query()->where('is_active', false)->count(),
        ];

        $productTypeOptions = ProductCategory::query()
            ->orderBy('sort_order')
            ->orderBy('key')
            ->get(['key', 'name'])
            ->map(fn (ProductCategory $category): array => [
                'value' => (string) $category->key,
                'label' => (string) ($category->name ?: $category->key),
            ])
            ->values()
            ->all();

        return Inertia::render('Dashboard/ProductManagement/Products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
                'product_type' => $productType,
            ],
            'stats' => $stats,
            'product_type_options' => $productTypeOptions,
        ]);
    }

    public function productCategories(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $categories = ProductCategory::query()
            ->when($search !== '', function ($q) use ($search): void {
                $q->where(function ($inner) use ($search): void {
                    $inner
                        ->where('key', 'like', '%'.$search.'%')
                        ->orWhere('name', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%');
                });
            })
            ->orderBy('sort_order')
            ->orderBy('key')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (ProductCategory $category): array => [
                'id' => $category->id,
                'key' => $category->key,
                'name' => $category->name,
                'description' => $category->description,
                'sort_order' => $category->sort_order,
                'is_active' => $category->is_active,
            ]);

        $stats = [
            'total' => ProductCategory::query()->count(),
            'active' => ProductCategory::query()->where('is_active', true)->count(),
            'inactive' => ProductCategory::query()->where('is_active', false)->count(),
        ];

        return Inertia::render('Dashboard/ProductManagement/Categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    public function packages(): Response
    {
        return $this->renderContentPage(
            heading: 'Package Management',
            description: 'Kelola package umroh beserta jadwal keberangkatan dan relasi product.',
            breadcrumbHref: '/admin/product-management/packages',
            pages: [],
            resources: ['packages', 'schedules'],
        );
    }

    public function schedules(): Response
    {
        return $this->renderContentPage(
            heading: 'Schedule Management',
            description: 'Pilih package lalu atur jadwal keberangkatan, seat, dan statusnya.',
            breadcrumbHref: '/admin/website-management/schedules',
            pages: [],
            resources: ['schedules'],
        );
    }

    public function update(UpdatePageContentRequest $request, PageContent $pageContent): RedirectResponse
    {
        $content = $request->has('content')
            ? $request->input('content', [])
            : json_decode($request->string('content_json')->value() ?: '{}', true, 512, JSON_THROW_ON_ERROR);
        $content = $this->applyUploadedMedia($request, is_array($content) ? $content : []);

        $pageContent->update([
            'title' => $request->string('title')->value(),
            'excerpt' => $request->filled('excerpt') ? $request->string('excerpt')->value() : null,
            'content' => $content,
            'is_active' => $request->boolean('is_active'),
        ]);

        return back()->with('success', 'Konten halaman berhasil diperbarui.');
    }

    public function storeResource(ManageTravelResourceRequest $request, string $resource): RedirectResponse
    {
        $definition = $this->resourceDefinitions()[$resource] ?? null;

        abort_if($definition === null, 404);

        $modelClass = $definition['model'];
        $model = new $modelClass;
        $payload = $this->requestPayload($request);
        $payload = $this->applyResourceUploads($request, $resource, null, $payload);
        $model->fill($this->normalizePayload($resource, $payload));
        $model->save();
        $this->afterResourceSaved($resource, $model, $payload);

        return back()->with('success', $definition['label'].' berhasil ditambahkan.');
    }

    public function updateResource(ManageTravelResourceRequest $request, string $resource, int $id): RedirectResponse
    {
        $definition = $this->resourceDefinitions()[$resource] ?? null;

        abort_if($definition === null, 404);

        /** @var Model $model */
        $model = $definition['model']::query()->findOrFail($id);
        $payload = $this->requestPayload($request);
        $payload = $this->applyResourceUploads($request, $resource, $model, $payload);
        $model->fill($this->normalizePayload($resource, $payload));
        $model->save();
        $this->afterResourceSaved($resource, $model, $payload);

        return back()->with('success', $definition['label'].' berhasil diperbarui.');
    }

    public function destroyResource(string $resource, int $id): RedirectResponse
    {
        $definition = $this->resourceDefinitions()[$resource] ?? null;

        abort_if($definition === null, 404);

        $definition['model']::query()->findOrFail($id)->delete();

        return back()->with('success', $definition['label'].' berhasil dihapus.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function pageSections(): array
    {
        return PageContent::query()
            ->where('category', 'page')
            ->orderBy('slug')
            ->get()
            ->map(fn (PageContent $page): array => [
                'id' => $page->id,
                'slug' => $page->slug,
                'title' => $page->title,
                'excerpt' => $page->excerpt,
                'content_json' => json_encode($page->content ?? [], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                'is_active' => $page->is_active,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function landingPageSections(): array
    {
        return PageContent::query()
            ->where('category', 'page')
            ->orderBy('slug')
            ->get()
            ->map(fn (PageContent $page): array => [
                'id' => $page->id,
                'slug' => $page->slug,
                'title' => $page->title,
                'excerpt' => $page->excerpt,
                'content' => $this->stripLocaleData($page->content ?? []),
                'is_active' => $page->is_active,
            ])
            ->all();
    }

    /**
     * @return array<int, array{slug: string, title: array{id: string, en: string}, excerpt: array{id: string, en: string}, content: array<string, mixed>}>
     */
    private function landingPageDefinitions(): array
    {
        return [
            [
                'slug' => 'home',
                'title' => ['id' => 'Home', 'en' => 'Home'],
                'excerpt' => ['id' => 'Konten landing page utama.', 'en' => 'Main landing page content.'],
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
                    ],
                    'timeline' => [
                        'label' => ['id' => 'Alur Perjalanan yang Kami Jalankan', 'en' => 'Journey Flow'],
                        'heading' => [
                            'id' => 'Sistem Perjalanan yang Jelas, Bukan Sekadar Janji',
                            'en' => 'A Clear System, Not Just Promises',
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
                        'badges' => [
                            ['id' => 'Biaya tiba-tiba berubah di tengah jalan', 'en' => 'Fees change unexpectedly'],
                            ['id' => 'Minimnya informasi & komunikasi', 'en' => 'Lack of info & communication'],
                            ['id' => 'Jadwal keberangkatan tidak jelas', 'en' => 'Unclear departure schedule'],
                            ['id' => 'Takut tertipu travel yang tidak amanah', 'en' => 'Fear of untrustworthy travel'],
                        ],
                        'quote' => [
                            'id' => '“Kami memahami kekhawatiran itu. Karena itu, Asfar Tour hadir dengan sistem yang jelas dan transparan.”',
                            'en' => '“We understand the concerns. That’s why we provide a clear and transparent system.”',
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
                    ],
                    'services' => [
                        'label' => ['id' => 'Layanan Kami', 'en' => 'Our Services'],
                        'title' => ['id' => 'Apa yang Kami Tawarkan?', 'en' => 'What We Offer'],
                        'description' => [
                            'id' => 'Layanan umroh menyeluruh untuk menjaga perjalanan ibadah tetap aman, nyaman, dan terarah.',
                            'en' => 'A complete umrah service to keep the worship journey safe, comfortable, and well-guided.',
                        ],
                        'fallback_title_prefix' => ['id' => 'Layanan', 'en' => 'Service'],
                        'fallback_description' => [
                            'id' => 'Deskripsi layanan akan tampil di sini.',
                            'en' => 'Service description will appear here.',
                        ],
                        'items' => [
                            [
                                'icon' => 'plane',
                                'title' => ['id' => 'Flight Booking', 'en' => 'Flight Booking'],
                                'description' => ['id' => 'Kami bantu atur penerbangan PP sesuai paket dan kebutuhan.', 'en' => 'We arrange round-trip flights based on your needs.'],
                            ],
                            [
                                'icon' => 'landmark',
                                'title' => ['id' => 'Tours & Activities', 'en' => 'Tours & Activities'],
                                'description' => ['id' => 'Rangkaian agenda ibadah & ziarah yang tertata.', 'en' => 'Structured worship agenda and visits.'],
                            ],
                            [
                                'icon' => 'map-pin',
                                'title' => ['id' => 'Airport Transfers', 'en' => 'Airport Transfers'],
                                'description' => ['id' => 'Penjemputan dan pengantaran yang terkoordinasi.', 'en' => 'Coordinated pick-up and drop-off.'],
                            ],
                            [
                                'icon' => 'check-circle-2',
                                'title' => ['id' => 'Hotel Bookings', 'en' => 'Hotel Bookings'],
                                'description' => ['id' => 'Akomodasi nyaman dengan lokasi strategis.', 'en' => 'Comfortable hotels in strategic locations.'],
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
                            'en' => 'Let’s go to the holy land with {company_name}',
                        ],
                        'secondary_label' => ['id' => 'Lihat Paket', 'en' => 'View Packages'],
                        'secondary_href' => '/paket-umroh',
                        'address_label' => ['id' => 'Alamat', 'en' => 'Address'],
                        'contact_info_label' => ['id' => 'Kontak', 'en' => 'Contact'],
                    ],
                ],
            ],
            [
                'slug' => 'tentang-kami',
                'title' => ['id' => 'Tentang Kami', 'en' => 'About Us'],
                'excerpt' => ['id' => 'Profil perusahaan dan nilai-nilai.', 'en' => 'Company profile and values.'],
                'content' => [
                    'hero' => [
                        'label' => ['id' => 'Tentang', 'en' => 'About'],
                        'title' => ['id' => 'Mengenal Asfar Tour', 'en' => 'Get to Know Asfar Tour'],
                        'description' => [
                            'id' => 'Cerita, visi, dan komitmen kami dalam melayani jamaah.',
                            'en' => 'Our story, vision, and commitment to serving pilgrims.',
                        ],
                        'image' => '/images/dummy.jpg',
                    ],
                    'profile' => [
                        'title' => ['id' => 'Profil Perusahaan', 'en' => 'Company Profile'],
                        'description' => [
                            'id' => 'Tuliskan profil perusahaan Anda di sini.',
                            'en' => 'Write your company profile here.',
                        ],
                    ],
                    'stats' => [
                        ['value' => '15+', 'label' => ['id' => 'Tahun Melayani', 'en' => 'Years of Service']],
                        ['value' => '20K+', 'label' => ['id' => 'Jamaah Berangkat', 'en' => 'Pilgrims Departed']],
                    ],
                    'values' => [
                        'title' => ['id' => 'Nilai & Budaya', 'en' => 'Values & Culture'],
                        'description' => [
                            'id' => 'Tuliskan nilai utama dan budaya layanan di sini.',
                            'en' => 'Write key values and service culture here.',
                        ],
                        'items' => [],
                    ],
                ],
            ],
            [
                'slug' => 'kontak',
                'title' => ['id' => 'Kontak', 'en' => 'Contact'],
                'excerpt' => ['id' => 'Informasi kontak dan lokasi.', 'en' => 'Contact information and location.'],
                'content' => [
                    'heading' => [
                        'title' => ['id' => 'Hubungi Kami', 'en' => 'Contact Us'],
                        'subtitle' => [
                            'id' => 'Kami siap membantu kebutuhan perjalanan Anda.',
                            'en' => 'We are ready to help with your travel needs.',
                        ],
                    ],
                    'description' => [
                        'body' => [
                            'id' => 'Tuliskan informasi kontak lengkap di sini.',
                            'en' => 'Write full contact information here.',
                        ],
                    ],
                    'map' => [
                        'embed' => '',
                    ],
                ],
            ],
            [
                'slug' => 'custom-umroh',
                'title' => ['id' => 'Custom Umroh', 'en' => 'Custom Umrah'],
                'excerpt' => ['id' => 'Halaman permintaan paket custom.', 'en' => 'Custom package request page.'],
                'content' => [
                    'badge' => ['id' => 'Custom', 'en' => 'Custom'],
                    'subtitle' => [
                        'id' => 'Untuk keluarga, komunitas, atau corporate dengan kebutuhan khusus.',
                        'en' => 'For families, communities, or corporate groups with specific needs.',
                    ],
                    'description' => [
                        'id' => 'Kami menyesuaikan jadwal, hotel, maskapai, dan itinerary sesuai kebutuhan rombongan.',
                        'en' => 'We tailor schedules, hotels, airlines, and itineraries to your group needs.',
                    ],
                    'cta' => ['id' => 'Konsultasi WhatsApp', 'en' => 'WhatsApp Consultation'],
                ],
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function portalPageSections(): array
    {
        $portalPageDefinitions = collect($this->portalPageDefinitions());
        // Ensure portal pages exist in DB so they can be updated and also consumed by public pages
        // through the shared `publicData.pages` prop (which only includes active DB records).
        $pages = $portalPageDefinitions
            ->mapWithKeys(function (array $definition): array {
                $page = PageContent::query()->firstOrCreate(
                    [
                        'slug' => $definition['slug'],
                        'category' => 'page',
                    ],
                    [
                        'title' => $this->localizedValue($definition['title'] ?? ''),
                        'excerpt' => $this->localizedValue($definition['excerpt'] ?? ''),
                        'content' => $this->stripLocaleData($definition['content'] ?? []),
                        'is_active' => true,
                    ],
                );

                return [$definition['slug'] => $page];
            });

        return $portalPageDefinitions
            ->map(function (array $definition) use ($pages): array {
                /** @var PageContent|null $page */
                $page = $pages->get($definition['slug']);

                $resolvedContent = $this->stripLocaleData($page?->content ?? $definition['content']);

                return [
                    'id' => $page?->id,
                    'slug' => $definition['slug'],
                    'label' => $definition['label'],
                    'description' => $definition['description'],
                    'title' => $this->localizedValue($page?->title ?? $definition['title']),
                    'excerpt' => $this->localizedValue($page?->excerpt ?? $definition['excerpt']),
                    'content' => $resolvedContent,
                    'content_json' => json_encode($resolvedContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                    'is_active' => $page?->is_active ?? true,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  array<int, string>  $resources
     */
    private function renderContentPage(string $heading, string $description, string $breadcrumbHref, array $pages, array $resources): Response
    {
        return Inertia::render('Dashboard/Administrator/Content/Index', [
            'heading' => $heading,
            'description' => $description,
            'breadcrumbHref' => $breadcrumbHref,
            'pages' => $pages,
            'resources' => $this->resourceSections($resources),
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function portalPageDefinitions(): array
    {
        return [
            [
                'slug' => 'terms-conditions',
                'label' => 'Terms & Conditions',
                'description' => 'Atur syarat dan ketentuan umum penggunaan portal dan layanan.',
                'title' => ['id' => 'Syarat & Ketentuan', 'en' => 'Terms & Conditions'],
                'excerpt' => ['id' => 'Aturan penggunaan layanan dan portal.', 'en' => 'Rules for using the services and portal.'],
                'content' => [
                    'body' => [
                        'id' => 'Tuliskan syarat dan ketentuan layanan di sini.',
                        'en' => 'Write the service terms and conditions here.',
                    ],
                ],
            ],
            [
                'slug' => 'privacy-policy',
                'label' => 'Privacy Policy',
                'description' => 'Kelola kebijakan privasi dan pemrosesan data pengguna.',
                'title' => ['id' => 'Kebijakan Privasi', 'en' => 'Privacy Policy'],
                'excerpt' => ['id' => 'Penjelasan penggunaan dan perlindungan data pengguna.', 'en' => 'Explanation of user data usage and protection.'],
                'content' => [
                    'body' => [
                        'id' => 'Tuliskan kebijakan privasi di sini.',
                        'en' => 'Write the privacy policy here.',
                    ],
                ],
            ],
            [
                'slug' => 'refund-policy',
                'label' => 'Refund Policy',
                'description' => 'Atur kebijakan refund, reschedule, dan pembatalan transaksi.',
                'title' => ['id' => 'Kebijakan Refund', 'en' => 'Refund Policy'],
                'excerpt' => ['id' => 'Aturan refund, reschedule, dan pembatalan.', 'en' => 'Rules for refunds, reschedules, and cancellations.'],
                'content' => [
                    'body' => [
                        'id' => 'Tuliskan kebijakan refund dan pembatalan di sini.',
                        'en' => 'Write the refund and cancellation policy here.',
                    ],
                ],
            ],
            [
                'slug' => 'disclaimer',
                'label' => 'Disclaimer',
                'description' => 'Atur pernyataan disclaimer resmi untuk portal dan layanan.',
                'title' => ['id' => 'Disclaimer', 'en' => 'Disclaimer'],
                'excerpt' => ['id' => 'Pernyataan batas tanggung jawab layanan.', 'en' => 'Statement of service liability limitations.'],
                'content' => [
                    'body' => [
                        'id' => 'Tuliskan disclaimer resmi di sini.',
                        'en' => 'Write the official disclaimer here.',
                    ],
                ],
            ],
        ];
    }

    /**
     * @param  array<int, string>  $resourceKeys
     * @return array<int, array<string, mixed>>
     */
    private function resourceSections(array $resourceKeys): array
    {
        return collect($this->resourceDefinitions())
            ->only($resourceKeys)
            ->map(
                function (array $definition, string $key): array {
                    $template = $this->stripLocaleData($definition['template'] ?? []);

                    return [
                        'key' => $key,
                        'label' => $definition['label'],
                        'description' => $definition['description'],
                        'template' => $template,
                        'meta' => $this->resourceMeta($key),
                        'template_json' => json_encode($template, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                        'items' => $definition['model']::query()
                            ->when(Arr::get($definition, 'with'), fn ($query, array $relations) => $query->with($relations))
                            ->orderBy(...$definition['order_by'])
                            ->get()
                            ->map(fn (Model $item): array => [
                                'id' => $item->getKey(),
                                'title' => $this->resourceItemTitle($key, $item),
                                'payload' => $this->stripLocaleData($this->serializeResource($key, $item)),
                                'payload_json' => json_encode($this->stripLocaleData($this->serializeResource($key, $item)), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                            ])
                            ->values()
                            ->all(),
                    ];
                },
            )->values()->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function resourceMeta(string $resource): array
    {
        $packageOptions = TravelPackage::query()
            ->orderBy('code')
            ->get(['code', 'name', 'departure_city', 'duration_days', 'is_active'])
            ->map(fn (TravelPackage $package): array => [
                'code' => $package->code,
                'name' => $package->name,
                'departure_city' => $package->departure_city,
                'duration_days' => $package->duration_days,
                'is_active' => $package->is_active,
            ])
            ->values()
            ->all();

        $meta = [
            'package_options' => $packageOptions,
            'product_category_options' => ProductCategory::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('key')
                ->get(['key', 'name', 'description', 'is_active'])
                ->map(fn (ProductCategory $category): array => [
                    'key' => $category->key,
                    'name' => $category->name,
                    'description' => $category->description,
                    'default_unit' => $this->productCategoryDefaultUnit($category->key),
                    'is_active' => $category->is_active,
                ])
                ->values()
                ->all(),
        ];

        if ($resource === 'products') {
            return [
                'product_category_options' => $meta['product_category_options'],
            ];
        }

        if (! in_array($resource, ['packages', 'schedules'], true)) {
            return [];
        }

        if ($resource === 'schedules') {
            return $meta;
        }

        return [
            ...$meta,
            'product_options' => TravelProduct::query()
                ->orderBy('code')
                ->get(['code', 'product_type', 'name', 'is_active'])
                ->map(fn (TravelProduct $product): array => [
                    'code' => $product->code,
                    'name' => $product->name,
                    'product_type' => $product->product_type,
                    'is_active' => $product->is_active,
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function resourceDefinitions(): array
    {
        return [
            'product_categories' => [
                'label' => 'Kategori Product',
                'description' => 'Kategori sederhana untuk mengelompokkan product travel.',
                'model' => ProductCategory::class,
                'order_by' => ['sort_order', 'asc'],
                'template' => [
                    'key' => 'dokumen',
                    'name' => ['id' => 'Dokumen', 'en' => 'Documents'],
                    'description' => ['id' => 'Kategori product dokumen', 'en' => 'Document product category'],
                    'sort_order' => 1,
                    'is_active' => true,
                ],
            ],
            'products' => [
                'label' => 'Produk Travel',
                'description' => 'Komponen layanan yang bisa digabungkan ke package. Harga tetap ditentukan di package.',
                'model' => TravelProduct::class,
                'order_by' => ['code', 'asc'],
                'template' => [
                    'code' => 'PRD-BARU',
                    'slug' => 'produk-baru',
                    'icon' => 'Package',
                    'name' => ['id' => 'Produk Baru', 'en' => 'New Product'],
                    'product_type' => 'layanan',
                    'description' => ['id' => 'Deskripsi produk', 'en' => 'Product description'],
                    'content' => ['unit' => 'per jamaah'],
                    'is_active' => true,
                ],
            ],
            'packages' => [
                'label' => 'Package Umroh',
                'description' => 'Harga paket, ringkasan, detail, dan susunan product ada di sini.',
                'model' => TravelPackage::class,
                'with' => ['products:id,code'],
                'order_by' => ['code', 'asc'],
                'template' => [
                    'code' => 'ASF-BARU-10',
                    'slug' => 'umroh-baru-10-hari',
                    'name' => ['id' => 'Umroh Baru 10 Hari', 'en' => 'New Umrah 10 Days'],
                    'package_type' => 'reguler',
                    'departure_city' => 'Jakarta',
                    'duration_days' => 10,
                    'price' => 34900000,
                    'currency' => 'IDR',
                    'image_path' => '/images/dummy.jpg',
                    'summary' => ['id' => 'Ringkasan paket', 'en' => 'Package summary'],
                    'content' => [
                        'airline' => ['id' => 'Saudia', 'en' => 'Saudia'],
                        'hotel' => ['id' => 'Setara bintang 4', 'en' => 'Equivalent to 4-star hotel'],
                        'badge' => ['id' => 'Seat Terbatas', 'en' => 'Limited Seats'],
                        'period' => ['id' => 'April 2026', 'en' => 'April 2026'],
                        'highlight' => [
                            'title' => ['id' => 'Hotel Strategis', 'en' => 'Strategic Hotel'],
                            'desc' => ['id' => 'Estimasi jarak jelas', 'en' => 'Clear distance estimate'],
                        ],
                        'included' => ['id' => ['Tiket', 'Visa'], 'en' => ['Tickets', 'Visa']],
                        'excluded' => ['id' => ['Pengeluaran pribadi'], 'en' => ['Personal expenses']],
                        'itinerary' => [
                            ['title' => ['id' => 'Hari 1', 'en' => 'Day 1'], 'desc' => ['id' => 'Briefing dan keberangkatan', 'en' => 'Briefing and departure']],
                        ],
                        'requirements' => ['id' => ['Paspor'], 'en' => ['Passport']],
                        'payment' => ['id' => ['DP booking seat'], 'en' => ['Seat booking deposit']],
                        'policy' => ['id' => 'Kebijakan perubahan', 'en' => 'Change policy'],
                    ],
                    'product_codes' => ['PRD-VISA', 'PRD-TIKET'],
                    'is_featured' => true,
                    'is_active' => true,
                ],
            ],
            'schedules' => [
                'label' => 'Jadwal Keberangkatan',
                'description' => 'Jadwal keberangkatan aktif per package.',
                'model' => DepartureSchedule::class,
                'with' => ['travelPackage:id,code'],
                'order_by' => ['departure_date', 'asc'],
                'template' => [
                    'travel_package_code' => 'ASF-REG-10',
                    'departure_date' => '2026-08-01',
                    'return_date' => '2026-08-10',
                    'departure_city' => 'Jakarta',
                    'seats_total' => 45,
                    'seats_available' => 12,
                    'status' => 'open',
                    'notes' => 'Catatan jadwal',
                    'is_active' => true,
                ],
            ],
            'services' => [
                'label' => 'Layanan',
                'description' => 'Nilai layanan utama yang tampil di homepage dan halaman layanan.',
                'model' => TravelService::class,
                'order_by' => ['sort_order', 'asc'],
                'template' => [
                    'title' => ['id' => 'Layanan Baru', 'en' => 'New Service'],
                    'description' => ['id' => 'Deskripsi layanan', 'en' => 'Service description'],
                    'sort_order' => 1,
                    'is_active' => true,
                ],
            ],
            'faqs' => [
                'label' => 'FAQ',
                'description' => 'Pertanyaan dan jawaban yang tampil di halaman FAQ.',
                'model' => Faq::class,
                'order_by' => ['sort_order', 'asc'],
                'template' => [
                    'question' => ['id' => 'Pertanyaan baru?', 'en' => 'New question?'],
                    'answer' => ['id' => 'Jawaban baru', 'en' => 'New answer'],
                    'sort_order' => 1,
                    'is_active' => true,
                ],
            ],
            'articles' => [
                'label' => 'Artikel',
                'description' => 'Artikel edukasi dan promosi yang tampil di halaman artikel.',
                'model' => Article::class,
                'order_by' => ['published_at', 'desc'],
                'template' => [
                    'title' => ['id' => 'Judul artikel', 'en' => 'Article title'],
                    'slug' => 'judul-artikel',
                    'excerpt' => ['id' => 'Ringkasan artikel', 'en' => 'Article summary'],
                    'body' => ['id' => 'Isi artikel', 'en' => 'Article body'],
                    'image_path' => '/images/dummy.jpg',
                    'published_at' => now()->toDateTimeString(),
                    'is_featured' => false,
                    'is_active' => true,
                ],
            ],
            'testimonials' => [
                'label' => 'Testimoni',
                'description' => 'Testimoni jamaah yang dikaitkan dengan package.',
                'model' => Testimonial::class,
                'with' => ['travelPackage:id,code'],
                'order_by' => ['id', 'desc'],
                'template' => [
                    'name' => 'Nama Jamaah',
                    'origin_city' => 'Jakarta',
                    'travel_package_code' => 'ASF-REG-10',
                    'quote' => ['id' => 'Testimoni jamaah', 'en' => 'Pilgrim testimonial'],
                    'rating' => 5,
                    'is_featured' => true,
                    'is_active' => true,
                ],
            ],
            'gallery' => [
                'label' => 'Galeri',
                'description' => 'Galeri foto/video untuk homepage dan halaman galeri.',
                'model' => GalleryItem::class,
                'order_by' => ['sort_order', 'asc'],
                'template' => [
                    'title' => ['id' => 'Judul galeri', 'en' => 'Gallery title'],
                    'category' => 'galeri',
                    'description' => ['id' => 'Deskripsi galeri', 'en' => 'Gallery description'],
                    'image_path' => '/images/dummy.jpg',
                    'sort_order' => 1,
                    'is_active' => true,
                ],
            ],
            'team' => [
                'label' => 'Tim',
                'description' => 'Tim yang tampil di halaman tentang kami.',
                'model' => TeamMember::class,
                'order_by' => ['sort_order', 'asc'],
                'template' => [
                    'name' => 'Nama Tim',
                    'role' => ['id' => 'Role', 'en' => 'Role'],
                    'bio' => ['id' => 'Bio singkat', 'en' => 'Short bio'],
                    'image_path' => '/images/dummy.jpg',
                    'sort_order' => 1,
                    'is_active' => true,
                ],
            ],
            'legal_documents' => [
                'label' => 'Legalitas',
                'description' => 'Dokumen legal yang tampil di halaman legalitas.',
                'model' => LegalDocument::class,
                'order_by' => ['sort_order', 'asc'],
                'template' => [
                    'title' => ['id' => 'Izin Baru', 'en' => 'New License'],
                    'document_number' => 'DOC-001',
                    'issued_by' => ['id' => 'Penerbit', 'en' => 'Issuer'],
                    'description' => ['id' => 'Deskripsi dokumen', 'en' => 'Document description'],
                    'sort_order' => 1,
                    'is_active' => true,
                ],
            ],
            'career_openings' => [
                'label' => 'Karier',
                'description' => 'Lowongan kerja yang tampil di halaman karier.',
                'model' => CareerOpening::class,
                'order_by' => ['sort_order', 'asc'],
                'template' => [
                    'title' => ['id' => 'Posisi Baru', 'en' => 'New Position'],
                    'location' => 'Jakarta',
                    'employment_type' => 'Full-time',
                    'description' => ['id' => 'Deskripsi lowongan', 'en' => 'Job description'],
                    'requirements' => ['id' => 'Kualifikasi', 'en' => 'Requirements'],
                    'sort_order' => 1,
                    'is_active' => true,
                ],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeResource(string $resource, Model $item): array
    {
        return match ($resource) {
            'products' => Arr::only($item->toArray(), ['code', 'slug', 'icon', 'name', 'product_type', 'description', 'content', 'is_active']),
            'product_categories' => Arr::only($item->toArray(), ['key', 'name', 'description', 'sort_order', 'is_active']),
            'packages' => [
                ...Arr::only($item->toArray(), ['code', 'slug', 'name', 'package_type', 'departure_city', 'duration_days', 'price', 'currency', 'image_path', 'summary', 'content', 'is_featured', 'is_active']),
                'product_codes' => $item->products->pluck('code')->values()->all(),
            ],
            'schedules' => [
                ...Arr::only($item->toArray(), ['departure_date', 'return_date', 'departure_city', 'seats_total', 'seats_available', 'status', 'notes', 'is_active']),
                'travel_package_code' => $item->travelPackage?->code,
            ],
            'services' => Arr::only($item->toArray(), ['title', 'description', 'sort_order', 'is_active']),
            'faqs' => Arr::only($item->toArray(), ['question', 'answer', 'sort_order', 'is_active']),
            'articles' => [
                ...Arr::only($item->toArray(), ['title', 'slug', 'excerpt', 'body', 'image_path', 'is_featured', 'is_active']),
                'published_at' => $item->published_at?->format('Y-m-d H:i:s'),
            ],
            'testimonials' => [
                ...Arr::only($item->toArray(), ['name', 'origin_city', 'quote', 'rating', 'is_featured', 'is_active']),
                'travel_package_code' => $item->travelPackage?->code,
            ],
            'gallery' => Arr::only($item->toArray(), ['title', 'category', 'description', 'image_path', 'sort_order', 'is_active']),
            'team' => Arr::only($item->toArray(), ['name', 'role', 'bio', 'image_path', 'sort_order', 'is_active']),
            'legal_documents' => Arr::only($item->toArray(), ['title', 'document_number', 'issued_by', 'description', 'sort_order', 'is_active']),
            'career_openings' => Arr::only($item->toArray(), ['title', 'location', 'employment_type', 'description', 'requirements', 'sort_order', 'is_active']),
            default => [],
        };
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizePayload(string $resource, array $payload): array
    {
        return match ($resource) {
            'product_categories' => [
                'key' => (string) ($payload['key'] ?? ''),
                'name' => $this->localizedValue($payload['name'] ?? []),
                'description' => $this->localizedValue($payload['description'] ?? []),
                'sort_order' => (int) ($payload['sort_order'] ?? 0),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'products' => [
                'code' => (string) ($payload['code'] ?? ''),
                'slug' => (string) ($payload['slug'] ?? ''),
                'icon' => (string) ($payload['icon'] ?? 'Package'),
                'name' => $this->localizedValue($payload['name'] ?? []),
                'product_type' => (string) ($payload['product_type'] ?? ''),
                'description' => $this->localizedValue($payload['description'] ?? []),
                'content' => is_array($payload['content'] ?? null) ? $payload['content'] : [],
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'packages' => $this->normalizePackagePayload($payload),
            'schedules' => [
                'travel_package_id' => TravelPackage::query()->where('code', (string) ($payload['travel_package_code'] ?? ''))->value('id'),
                'departure_date' => $payload['departure_date'] ?? null,
                'return_date' => $payload['return_date'] ?? null,
                'departure_city' => (string) ($payload['departure_city'] ?? ''),
                'seats_total' => (int) ($payload['seats_total'] ?? 0),
                'seats_available' => (int) ($payload['seats_available'] ?? 0),
                'status' => (string) ($payload['status'] ?? 'open'),
                'notes' => (string) ($payload['notes'] ?? ''),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'services' => [
                'title' => $this->localizedValue($payload['title'] ?? []),
                'description' => $this->localizedValue($payload['description'] ?? []),
                'sort_order' => (int) ($payload['sort_order'] ?? 0),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'faqs' => [
                'question' => $this->localizedValue($payload['question'] ?? []),
                'answer' => $this->localizedValue($payload['answer'] ?? []),
                'sort_order' => (int) ($payload['sort_order'] ?? 0),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'articles' => [
                'title' => $this->localizedValue($payload['title'] ?? []),
                'slug' => (string) ($payload['slug'] ?? ''),
                'excerpt' => $this->localizedValue($payload['excerpt'] ?? []),
                'body' => $this->localizedValue($payload['body'] ?? []),
                'image_path' => (string) ($payload['image_path'] ?? ''),
                'published_at' => $payload['published_at'] ?? null,
                'is_featured' => (bool) ($payload['is_featured'] ?? false),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'testimonials' => [
                'name' => (string) ($payload['name'] ?? ''),
                'origin_city' => (string) ($payload['origin_city'] ?? ''),
                'travel_package_id' => TravelPackage::query()->where('code', (string) ($payload['travel_package_code'] ?? ''))->value('id'),
                'quote' => $this->localizedValue($payload['quote'] ?? []),
                'rating' => (int) ($payload['rating'] ?? 5),
                'is_featured' => (bool) ($payload['is_featured'] ?? false),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'gallery' => [
                'title' => $this->localizedValue($payload['title'] ?? []),
                'category' => (string) ($payload['category'] ?? 'galeri'),
                'description' => $this->localizedValue($payload['description'] ?? []),
                'image_path' => (string) ($payload['image_path'] ?? ''),
                'sort_order' => (int) ($payload['sort_order'] ?? 0),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'team' => [
                'name' => (string) ($payload['name'] ?? ''),
                'role' => $this->localizedValue($payload['role'] ?? []),
                'bio' => $this->localizedValue($payload['bio'] ?? []),
                'image_path' => (string) ($payload['image_path'] ?? ''),
                'sort_order' => (int) ($payload['sort_order'] ?? 0),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'legal_documents' => [
                'title' => $this->localizedValue($payload['title'] ?? []),
                'document_number' => (string) ($payload['document_number'] ?? ''),
                'issued_by' => $this->localizedValue($payload['issued_by'] ?? []),
                'description' => $this->localizedValue($payload['description'] ?? []),
                'sort_order' => (int) ($payload['sort_order'] ?? 0),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'career_openings' => [
                'title' => $this->localizedValue($payload['title'] ?? []),
                'location' => (string) ($payload['location'] ?? ''),
                'employment_type' => (string) ($payload['employment_type'] ?? ''),
                'description' => $this->localizedValue($payload['description'] ?? []),
                'requirements' => $this->localizedValue($payload['requirements'] ?? []),
                'sort_order' => (int) ($payload['sort_order'] ?? 0),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            default => [],
        };
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizePackagePayload(array $payload): array
    {
        return [
            'code' => (string) ($payload['code'] ?? ''),
            'slug' => (string) ($payload['slug'] ?? ''),
            'name' => $this->localizedValue($payload['name'] ?? []),
            'package_type' => (string) ($payload['package_type'] ?? ''),
            'departure_city' => (string) ($payload['departure_city'] ?? ''),
            'duration_days' => (int) ($payload['duration_days'] ?? 0),
            'price' => (float) ($payload['price'] ?? 0),
            'currency' => (string) ($payload['currency'] ?? 'IDR'),
            'image_path' => (string) ($payload['image_path'] ?? ''),
            'summary' => $this->localizedValue($payload['summary'] ?? []),
            'content' => is_array($payload['content'] ?? null) ? $payload['content'] : [],
            'is_featured' => (bool) ($payload['is_featured'] ?? false),
            'is_active' => (bool) ($payload['is_active'] ?? true),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function requestPayload(ManageTravelResourceRequest $request): array
    {
        if ($request->has('payload')) {
            /** @var array<string, mixed> $payload */
            $payload = $request->input('payload', []);

            return $payload;
        }

        /** @var array<string, mixed> $payload */
        $payload = json_decode($request->string('payload_json')->value(), true, 512, JSON_THROW_ON_ERROR);

        return $payload;
    }

    private function localizedValue(mixed $payload): string
    {
        if (is_string($payload)) {
            return $payload;
        }

        if (is_array($payload)) {
            return (string) ($payload['id'] ?? $payload['en'] ?? '');
        }

        return '';
    }

    private function stripLocaleData(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        if (array_key_exists('id', $value) || array_key_exists('en', $value)) {
            return $this->stripLocaleData($value['id'] ?? $value['en'] ?? '');
        }

        foreach ($value as $key => $item) {
            $value[$key] = $this->stripLocaleData($item);
        }

        return $value;
    }

    private function resourceItemTitle(string $resource, Model $item): string
    {
        return match ($resource) {
            'product_categories' => (string) ($item->getAttribute('key') ?? $item->getKey()),
            'products', 'packages' => (string) ($item->getAttribute('code') ?? $item->getKey()),
            'schedules' => (string) ($item->travelPackage?->code.' - '.$item->getAttribute('departure_date')),
            'faqs' => (string) ($item->getAttribute('question') ?? $item->getKey()),
            'legal_documents' => (string) ($item->getAttribute('document_number') ?? $item->getKey()),
            'articles' => (string) ($item->getAttribute('slug') ?? $item->getKey()),
            'testimonials', 'team' => (string) ($item->getAttribute('name') ?? $item->getKey()),
            default => (string) ($item->getKey()),
        };
    }

    private function productCategoryDefaultUnit(string $categoryKey): string
    {
        return match ($categoryKey) {
            'dokumen' => 'per jamaah',
            'transportasi' => 'per paket',
            'akomodasi' => 'per kamar',
            'layanan' => 'per paket',
            'perlengkapan' => 'per jamaah',
            default => 'per paket',
        };
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function afterResourceSaved(string $resource, Model $model, array $payload): void
    {
        if ($resource !== 'packages' || ! $model instanceof TravelPackage) {
            return;
        }

        $productCodes = collect($payload['product_codes'] ?? [])
            ->filter(fn ($code): bool => is_string($code) && $code !== '')
            ->values();

        $productIds = TravelProduct::query()
            ->whereIn('code', $productCodes->all())
            ->get(['id', 'code'])
            ->mapWithKeys(fn (TravelProduct $product, int $index): array => [
                $product->id => ['sort_order' => $index + 1],
            ])
            ->all();

        $model->products()->sync($productIds);
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    private function applyUploadedMedia(UpdatePageContentRequest $request, array $content): array
    {
        $uploadedMedia = $request->file('media', []);

        if (! is_array($uploadedMedia)) {
            return $content;
        }

        foreach ($uploadedMedia as $path => $file) {
            if (! $file) {
                continue;
            }

            $currentPath = Arr::get($content, $path);
            if (is_string($currentPath) && str_starts_with($currentPath, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $currentPath));
            }

            $storedPath = $file->store('landing', 'public');
            Arr::set($content, $path, '/storage/'.$storedPath);
        }

        return $content;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function applyResourceUploads(ManageTravelResourceRequest $request, string $resource, ?Model $existingModel, array $payload): array
    {
        if ($resource !== 'packages' || ! $request->hasFile('image')) {
            return $payload;
        }

        $currentImagePath = $existingModel?->getAttribute('image_path');
        if (is_string($currentImagePath) && str_starts_with($currentImagePath, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $currentImagePath));
        }

        /** @var UploadedFile $image */
        $image = $request->file('image');
        $storedPath = $image->store('packages', 'public');
        $payload['image_path'] = '/storage/'.$storedPath;

        return $payload;
    }
}
