<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\BulkDeleteTravelProductRequest;
use App\Http\Requests\Administrator\ManageTravelResourceRequest;
use App\Http\Requests\Administrator\UpdatePageContentRequest;
use App\Models\Article;
use App\Models\CareerOpening;
use App\Models\DepartureSchedule;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\Hotel;
use App\Models\HotelCity;
use App\Models\HotelCountry;
use App\Models\HotelRoomType;
use App\Models\LegalDocument;
use App\Models\PageContent;
use App\Models\ProductCategory;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\TravelService;
use App\Services\LiveCurrencyRateService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    public function __construct(private readonly LiveCurrencyRateService $liveCurrencyRateService) {}

    public function index(): Response
    {
        return $this->renderContentPage(
            heading: 'Website Content',
            description: 'Kelola konten website utama (bukan landing): FAQ, layanan, testimoni, galeri, tim, legalitas, dan karier. Artikel dikelola di menu Articles & News.',
            breadcrumbHref: '/admin/website-management/content',
            menuKey: 'content_management',
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
            menuKey: 'portal_content',
            pages: $this->portalPageSections(),
            resources: ['faqs', 'legal_documents'],
        );
    }

    public function landing(): Response
    {
        return Inertia::render('Dashboard/WebsiteManagement/Landing/Index', [
            'pages' => $this->landingPageSections('home_landing_mockup'),
            'editorType' => 'landing',
            'packageOptions' => $this->landingPackageOptions(),
        ]);
    }

    public function website(): Response
    {
        return Inertia::render('Dashboard/WebsiteManagement/Landing/Index', [
            'pages' => $this->landingPageSections('home_landing'),
            'editorType' => 'website',
            'packageOptions' => $this->landingPackageOptions(),
        ]);
    }

    public function products(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $productType = trim((string) $request->query('product_type', 'hotel'));
        $status = trim((string) $request->query('status', 'all'));

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
                'name' => $product->name,
                'product_type' => $product->product_type,
                'description' => $product->description,
                'price' => is_array($product->content) && isset($product->content['price'])
                    ? (int) $product->content['price']
                    : null,
                'currency' => is_array($product->content)
                    ? (string) ($product->content['currency'] ?? '')
                    : '',
                'currency_rate_snapshot' => is_array($product->content)
                    ? data_get($product->content, 'currency_rate_snapshot')
                    : null,
                'hotel_info' => is_array($product->content)
                    ? [
                        'hotel_id' => (int) ($product->content['hotel_id'] ?? 0),
                        'city' => (string) ($product->content['city'] ?? ''),
                        'country' => (string) ($product->content['country'] ?? ''),
                        'currency' => (string) ($product->content['currency'] ?? ''),
                        'pricing' => collect(is_array($product->content['pricing'] ?? null) ? $product->content['pricing'] : [])
                            ->map(fn ($row): array => [
                                'room_type' => (string) data_get($row, 'room_type', ''),
                                'period_start' => data_get($row, 'period_start'),
                                'period_end' => data_get($row, 'period_end'),
                                'price' => data_get($row, 'price'),
                            ])
                            ->values()
                            ->all(),
                    ]
                    : null,
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

        $currencyOptions = $this->liveCurrencyRateService->options();

        return Inertia::render('Dashboard/ProductManagement/Products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
                'product_type' => $productType !== '' ? $productType : 'hotel',
            ],
            'stats' => $stats,
            'product_type_options' => $productTypeOptions,
            'hotel_options' => Hotel::query()
                ->with(['country:id,name', 'city:id,name', 'product:id,code', 'prices.roomType:id,name'])
                ->whereNotNull('product_id')
                ->orderBy('name')
                ->get(['id', 'product_id', 'country_id', 'city_id', 'name', 'code', 'description', 'currency', 'is_active'])
                ->map(fn (Hotel $hotel): array => [
                    'id' => $hotel->id,
                    'product_id' => $hotel->product_id,
                    'name' => $hotel->name,
                    'code' => $hotel->code,
                    'description' => $hotel->description,
                    'product_code' => $hotel->product?->code,
                    'country_id' => $hotel->country_id,
                    'city_id' => $hotel->city_id,
                    'country' => $hotel->country?->name,
                    'city' => $hotel->city?->name,
                    'currency' => $hotel->currency,
                    'is_active' => $hotel->is_active,
                    'pricing' => $hotel->prices
                        ->filter(fn ($price): bool => HotelRoomType::isProductHotelPricingName($price->roomType?->name))
                        ->sortBy('period_start')
                        ->values()
                        ->map(fn ($price): array => [
                            'id' => $price->id,
                            'broker_key' => $price->broker_key,
                            'broker_name' => $price->broker_name,
                            'room_type_id' => $price->room_type_id,
                            'room_type' => (string) ($price->roomType?->name ?? ''),
                            'period_start' => $price->period_start?->toDateString(),
                            'period_end' => $price->period_end?->toDateString(),
                            'price' => $price->price,
                        ])
                        ->all(),
                ])
                ->values()
                ->all(),
            'hotel_country_options' => HotelCountry::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (HotelCountry $country): array => [
                    'id' => $country->id,
                    'name' => $country->name,
                ])
                ->values()
                ->all(),
            'hotel_city_options' => HotelCity::query()
                ->with('country:id,name')
                ->orderBy('name')
                ->get(['id', 'country_id', 'name'])
                ->map(fn (HotelCity $city): array => [
                    'id' => $city->id,
                    'country_id' => $city->country_id,
                    'name' => $city->name,
                    'country_name' => $city->country?->name,
                ])
                ->values()
                ->all(),
            'hotel_room_type_options' => HotelRoomType::query()
                ->forProductHotelPricing()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (HotelRoomType $roomType): array => [
                    'id' => $roomType->id,
                    'name' => $roomType->name,
                ])
                ->values()
                ->all(),
            'hotel_currency_options' => $currencyOptions,
            'product_category_hotel' => [
                'hotels' => Hotel::query()
                    ->with(['country:id,name', 'city:id,name', 'product:id,code', 'prices.roomType:id,name'])
                    ->where('is_active', true)
                    ->when($search !== '', function ($query) use ($search): void {
                        $query->where(function ($inner) use ($search): void {
                            $inner
                                ->where('code', 'like', '%'.$search.'%')
                                ->orWhere('name', 'like', '%'.$search.'%')
                                ->orWhereHas('country', fn ($countryQuery) => $countryQuery->where('name', 'like', '%'.$search.'%'))
                                ->orWhereHas('city', fn ($cityQuery) => $cityQuery->where('name', 'like', '%'.$search.'%'));
                        });
                    })
                    ->when($request->integer('city_id') > 0, fn ($query) => $query->where('city_id', $request->integer('city_id')))
                    ->when($status === 'active', fn ($query) => $query->where('is_active', true))
                    ->when($status === 'inactive', fn ($query) => $query->where('is_active', false))
                    ->latest('id')
                    ->paginate(10)
                    ->withQueryString()
                    ->through(function (Hotel $hotel): array {
                        return [
                            'id' => $hotel->id,
                            'code' => $hotel->code,
                            'name' => $hotel->name,
                            'description' => $hotel->description,
                            'currency' => $hotel->currency,
                            'is_active' => $hotel->is_active,
                            'country_id' => $hotel->country_id,
                            'city_id' => $hotel->city_id,
                            'country_name' => $hotel->country?->name,
                            'city_name' => $hotel->city?->name,
                            'product_code' => $hotel->product?->code,
                            'prices' => $hotel->prices
                                ->filter(fn ($price): bool => HotelRoomType::isProductHotelPricingName($price->roomType?->name))
                                ->map(fn ($price): array => [
                                    'id' => $price->id,
                                    'broker_key' => $price->broker_key,
                                    'broker_name' => $price->broker_name,
                                    'room_type_id' => $price->room_type_id,
                                    'room_type_name' => $price->roomType?->name,
                                    'period_start' => $price->period_start?->toDateString(),
                                    'period_end' => $price->period_end?->toDateString(),
                                    'price' => $price->price,
                                ])
                                ->values()
                                ->all(),
                        ];
                    }),
                'filters' => [
                    'search' => $search,
                    'city_id' => $request->integer('city_id') > 0 ? (string) $request->integer('city_id') : 'all',
                    'status' => in_array($status, ['active', 'inactive'], true) ? $status : 'all',
                ],
                'cityStats' => Hotel::query()
                    ->selectRaw('city_id, COUNT(*) as total_hotels')
                    ->with('city:id,name')
                    ->groupBy('city_id')
                    ->orderByDesc('total_hotels')
                    ->get()
                    ->map(fn (Hotel $hotel): array => [
                        'city_id' => (int) $hotel->city_id,
                        'city_name' => (string) ($hotel->city?->name ?? '-'),
                        'total_hotels' => (int) ($hotel->getAttribute('total_hotels') ?? 0),
                    ])
                    ->values()
                    ->all(),
                'countryOptions' => HotelCountry::query()
                    ->orderBy('name')
                    ->get(['id', 'name'])
                    ->map(fn (HotelCountry $country): array => [
                        'id' => $country->id,
                        'name' => $country->name,
                    ])
                    ->values()
                    ->all(),
                'cityOptions' => HotelCity::query()
                    ->with('country:id,name')
                    ->orderBy('name')
                    ->get(['id', 'country_id', 'name'])
                    ->map(fn (HotelCity $city): array => [
                        'id' => $city->id,
                        'country_id' => $city->country_id,
                        'name' => $city->name,
                        'country_name' => $city->country?->name,
                    ])
                    ->values()
                    ->all(),
                'roomTypeOptions' => HotelRoomType::query()
                    ->forProductHotelPricing()
                    ->orderBy('name')
                    ->get(['id', 'name'])
                    ->map(fn (HotelRoomType $roomType): array => [
                        'id' => $roomType->id,
                        'name' => $roomType->name,
                    ])
                    ->values()
                    ->all(),
                'currencyOptions' => $currencyOptions,
            ],
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
            description: 'Kelola package umroh beserta keberangkatan, kapasitas, dan relasi product.',
            breadcrumbHref: '/admin/product-management/packages',
            menuKey: 'package',
            pages: [],
            resources: ['packages'],
        );
    }

    public function schedules(): Response
    {
        return $this->renderContentPage(
            heading: 'Schedule Management',
            description: 'Pilih package lalu atur jadwal keberangkatan, seat, dan statusnya.',
            breadcrumbHref: '/admin/website-management/schedules',
            menuKey: 'package',
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
        $model->fill($this->normalizePayload($resource, $payload, $model));
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

    public function bulkDestroyResource(BulkDeleteTravelProductRequest $request, string $resource): RedirectResponse
    {
        $definition = $this->resourceDefinitions()[$resource] ?? null;

        abort_if($definition === null || $resource !== 'products', 404);

        $ids = collect($request->validated('ids'))
            ->map(fn (mixed $id): int => (int) $id)
            ->filter()
            ->unique()
            ->values();

        $deletedCount = 0;

        DB::transaction(function () use ($definition, $ids, &$deletedCount): void {
            $definition['model']::query()
                ->whereIn('id', $ids->all())
                ->get()
                ->each(function (Model $item) use (&$deletedCount): void {
                    $item->delete();
                    $deletedCount++;
                });
        });

        return back()->with('success', $deletedCount.' '.$definition['label'].' berhasil dihapus.');
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
    private function landingPageSections(string $slug): array
    {
        $definition = collect($this->landingPageDefinitions())
            ->first(fn (array $item): bool => ($item['slug'] ?? null) === $slug);

        if ($definition) {
            PageContent::query()->firstOrCreate(
                [
                    'category' => 'page',
                    'slug' => $slug,
                ],
                [
                    'title' => (string) data_get($definition, 'title.id', 'Home'),
                    'excerpt' => (string) data_get($definition, 'excerpt.id', 'Konten landing page utama.'),
                    'content' => $definition['content'] ?? [],
                    'is_active' => true,
                ],
            );
        }

        return PageContent::query()
            ->where('category', 'page')
            ->where('slug', $slug)
            ->orderBy('slug')
            ->get()
            ->map(function (PageContent $page) use ($slug): array {
                $content = $this->stripLocaleData($page->content ?? []);

                if ($slug === 'home_landing_mockup') {
                    $content = $this->hydrateLandingPackageSelection($content);
                }

                return [
                    'id' => $page->id,
                    'slug' => $page->slug,
                    'title' => $page->title,
                    'excerpt' => $page->excerpt,
                    'content' => $content,
                    'is_active' => $page->is_active,
                ];
            })
            ->all();
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    private function hydrateLandingPackageSelection(array $content): array
    {
        $packages = is_array($content['packages'] ?? null)
            ? $content['packages']
            : [];

        if (array_key_exists('selected_package_ids', $packages)) {
            return $content;
        }

        $packages['selected_package_ids'] = $this->defaultLandingSelectedPackageIds();
        $content['packages'] = $packages;

        return $content;
    }

    /**
     * @return array<int, int>
     */
    private function defaultLandingSelectedPackageIds(): array
    {
        return TravelPackage::query()
            ->where('is_active', true)
            ->where('booking_status', 'open')
            ->whereDate('start_date', '>=', now()->toDateString())
            ->orderByDesc('is_featured')
            ->orderBy('price')
            ->limit(3)
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultLandingMockupContentDefinition(): array
    {
        return [
            'hero' => [
                'promo_pill' => ['id' => 'PROGRAM TERBATAS - SEATS TERBATAS', 'en' => 'LIMITED PROGRAM - LIMITED SEATS'],
                'badge' => ['id' => 'PAKET UMROH', 'en' => 'UMRAH PACKAGE'],
                'title' => [
                    'id' => "SPECIAL 9 HARI\nAgustus",
                    'en' => "SPECIAL 9 DAYS\nAugust",
                ],
                'duration_value' => '9',
                'duration_suffix' => ['id' => 'HARI', 'en' => 'DAYS'],
                'nav_items' => [
                    ['id' => 'Paket Umroh', 'en' => 'Umrah Packages'],
                    ['id' => 'Fasilitas', 'en' => 'Facilities'],
                    ['id' => 'Testimoni', 'en' => 'Testimonials'],
                    ['id' => 'FAQ', 'en' => 'FAQ'],
                ],
                'nav_active_label' => ['id' => 'Paket Umroh', 'en' => 'Umrah Packages'],
                'subtitle' => [
                    'id' => 'Berangkat Agustus 2026',
                    'en' => 'Departing August 2026',
                ],
                'subtitle_badge' => ['id' => '9 Hari Program', 'en' => '9 Day Program'],
                'description' => [
                    'id' => 'Bersama Asfar Tour, setiap langkah ibadah Anda kami jaga dengan sepenuh hati. Didampingi mutawif berpengalaman, fasilitas premium, dan layanan tulus.',
                    'en' => 'With Asfar Tour, every step of your worship journey is handled with care. Guided by experienced mentors, premium facilities, and heartfelt service.',
                ],
                'checklist_items' => [
                    ['id' => 'Izin Resmi Kemenag RI', 'en' => 'Official Ministry License'],
                    ['id' => '10+ Tahun Pengalaman', 'en' => '10+ Years Experience'],
                    ['id' => 'FREE Konsultasi Jabodetabek', 'en' => 'FREE Greater Jakarta Consultation'],
                ],
                'cta_label' => ['id' => 'Konsultasi Gratis', 'en' => 'Free Consultation'],
                'secondary_cta_label' => ['id' => 'Lihat Paket', 'en' => 'View Packages'],
                'secondary_cta_href' => '/paket-umroh',
                'navbar_cta_label' => ['id' => 'Konsultasi Gratis', 'en' => 'Free Consultation'],
                'pricing_cards' => [
                    ['label' => 'QUAD', 'price' => 'Rp 33.500.000', 'note' => '/Pax'],
                    ['label' => 'TRIPLE', 'price' => 'Rp 35.000.000', 'note' => '/Pax'],
                    ['label' => 'DOUBLE', 'price' => 'Rp 36.500.000', 'note' => '/Pax'],
                ],
                'feature_cards' => [
                    [
                        'icon' => 'plane',
                        'title' => ['id' => 'Direct Flight', 'en' => 'Direct Flight'],
                        'description' => ['id' => 'Lion Air / Saudia', 'en' => 'Lion Air / Saudia'],
                    ],
                    [
                        'icon' => 'hotel',
                        'title' => ['id' => 'Hotel Makkah', 'en' => 'Makkah Hotel'],
                        'description' => ['id' => 'Maysan Al Maqom', 'en' => 'Maysan Al Maqom'],
                    ],
                    [
                        'icon' => 'hotel',
                        'title' => ['id' => 'Hotel Madinah', 'en' => 'Madinah Hotel'],
                        'description' => ['id' => 'Arkan Al Manar', 'en' => 'Arkan Al Manar'],
                    ],
                    [
                        'icon' => 'food',
                        'title' => ['id' => 'Konsumsi', 'en' => 'Meals'],
                        'description' => ['id' => 'Makan 3x Sehari', 'en' => 'Meals 3x a Day'],
                    ],
                ],
                'free_badge_title' => 'FREE',
                'free_badge_label' => ['id' => 'KONSULTASI', 'en' => 'CONSULTATION'],
                'free_badge_note' => ['id' => 'SE-JABODETABEK', 'en' => 'GREATER JAKARTA'],
            ],
            'package_details' => [
                'title' => ['id' => 'PAKET KAMI', 'en' => 'OUR PACKAGE'],
                'heading' => [
                    'id' => "Pilih Paket Umroh Terbaik\nUntuk Perjalanan Ibadah Anda",
                    'en' => "Choose the Best Umrah Package\nFor Your Worship Journey",
                ],
                'description' => [
                    'id' => 'Direct flight, hotel strategis, mutawif berpengalaman, dan dokumentasi profesional - semua sudah termasuk.',
                    'en' => 'Direct flight, strategic hotels, experienced guides, and professional documentation - all included.',
                ],
                'items' => [
                    ['icon' => 'plane', 'title' => ['id' => 'Maskapai', 'en' => 'Airline'], 'description' => ['id' => "Lion Air / Saudia\nDirect Flight", 'en' => "Lion Air / Saudia\nDirect Flight"]],
                    ['icon' => 'hotel', 'title' => ['id' => 'Hotel Makkah', 'en' => 'Makkah Hotel'], 'description' => ['id' => "Maysan Al Maqom\nBintang 4", 'en' => "Maysan Al Maqom\n4 Star"]],
                    ['icon' => 'hotel', 'title' => ['id' => 'Hotel Madinah', 'en' => 'Madinah Hotel'], 'description' => ['id' => "Arkan Al Manar\nBintang 3", 'en' => "Arkan Al Manar\n3 Star"]],
                    ['icon' => 'cal', 'title' => ['id' => 'Durasi', 'en' => 'Duration'], 'description' => ['id' => "9 Hari\n7 Malam", 'en' => "9 Days\n7 Nights"]],
                    ['icon' => 'food', 'title' => ['id' => 'Makan', 'en' => 'Meals'], 'description' => ['id' => "Makan 3x\nSehari", 'en' => "Meals 3x\nDaily"]],
                    ['icon' => 'user', 'title' => ['id' => 'Mutawif', 'en' => 'Guide'], 'description' => ['id' => "Tour Leader & Mutawif\nBerpengalaman", 'en' => "Tour Leader & Guide\nExperienced"]],
                    ['icon' => 'doc', 'title' => ['id' => 'Visa', 'en' => 'Visa'], 'description' => ['id' => "Visa Umroh\nResmi", 'en' => "Official Umrah\nVisa"]],
                    ['icon' => 'bottle', 'title' => ['id' => 'Zam-zam', 'en' => 'Zamzam'], 'description' => ['id' => "Air Zam-zam\n5 Liter", 'en' => "Zamzam Water\n5 Liters"]],
                    ['icon' => 'cam', 'title' => ['id' => 'Dokumentasi', 'en' => 'Documentation'], 'description' => ['id' => "Dokumentasi\nProfesional", 'en' => "Professional\nDocumentation"]],
                ],
            ],
            'included' => [
                'section_badge' => ['id' => 'DETAIL PAKET', 'en' => 'PACKAGE DETAILS'],
                'section_heading' => ['id' => "Yang Termasuk\ndalam Paket", 'en' => "What Is Included\nin the Package"],
                'title' => ['id' => 'TERMASUK DALAM PAKET', 'en' => 'INCLUDED IN THE PACKAGE'],
                'image_url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
                'items' => [
                    ['id' => 'Tiket Pesawat PP Direct Flight', 'en' => 'Return Direct Flight Tickets'],
                    ['id' => 'Air Zam-zam 5 Liter', 'en' => '5 Liters of Zamzam Water'],
                    ['id' => 'Hotel Sesuai Paket', 'en' => 'Hotel According to Package'],
                    ['id' => 'TL & Mutawif', 'en' => 'Tour Leader & Guide'],
                    ['id' => 'Visa Umroh Resmi', 'en' => 'Official Umrah Visa'],
                    ['id' => 'Handling', 'en' => 'Handling'],
                    ['id' => 'Makan 3x Sehari', 'en' => 'Meals 3x Daily'],
                    ['id' => 'Dokumentasi', 'en' => 'Documentation'],
                ],
            ],
            'excluded' => [
                'title' => ['id' => 'TIDAK TERMASUK DALAM PAKET', 'en' => 'NOT INCLUDED IN THE PACKAGE'],
                'image_url' => 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1000&q=85',
                'items' => [
                    ['id' => 'Pembuatan Paspor', 'en' => 'Passport Creation'],
                    ['id' => 'Vaksin Meningitis', 'en' => 'Meningitis Vaccine'],
                    ['id' => 'Pengeluaran Pribadi', 'en' => 'Personal Expenses'],
                    ['id' => 'Kelebihan Bagasi', 'en' => 'Excess Baggage'],
                    ['id' => 'Biaya Perubahan Jadwal (jika ada)', 'en' => 'Schedule Change Fee (if any)'],
                ],
            ],
            'reasons' => [
                'title' => ['id' => 'KENAPA PILIH KAMI', 'en' => 'WHY CHOOSE US'],
                'heading' => ['id' => "Lebih dari Sekadar Perjalanan,\nIni Pengalaman Berharga", 'en' => "More Than Just a Journey,\nThis Is a Meaningful Experience"],
                'items' => [
                    ['icon' => 'users', 'title' => ['id' => 'Pembimbing Berpengalaman', 'en' => 'Experienced Guides'], 'description' => ['id' => 'Tim mutawif ramah & profesional mendampingi setiap langkah ibadah Anda di Tanah Suci.', 'en' => 'Friendly and professional mutawif team accompanies each step of your worship.']],
                    ['icon' => 'hotel', 'title' => ['id' => 'Hotel Nyaman & Strategis', 'en' => 'Comfortable Strategic Hotels'], 'description' => ['id' => 'Maysan Al Maqom (550m dari Haram) & Arkan Al Manar (200m dari Nabawi).', 'en' => 'Maysan Al Maqom (550m from Haram) & Arkan Al Manar (200m from Nabawi).']],
                    ['icon' => 'plane', 'title' => ['id' => 'Direct Flight', 'en' => 'Direct Flight'], 'description' => ['id' => 'Penerbangan langsung tanpa transit - lebih nyaman dan efisien waktu untuk jamaah.', 'en' => 'Direct flight without transit for greater comfort and time efficiency.']],
                    ['icon' => 'cam', 'title' => ['id' => 'Dokumentasi Profesional', 'en' => 'Professional Documentation'], 'description' => ['id' => 'Setiap momen ibadah diabadikan secara profesional sebagai kenangan seumur hidup.', 'en' => 'Each worship moment is captured professionally as a lifelong memory.']],
                    ['icon' => 'pin', 'title' => ['id' => 'Izin Resmi Kemenag RI', 'en' => 'Official Ministry License'], 'description' => ['id' => 'Travel resmi berizin PPIU dari Kementerian Agama RI. Aman, legal, dan terpercaya.', 'en' => 'Official PPIU-licensed travel from the Ministry. Safe, legal, and trusted.']],
                    ['icon' => 'headset', 'title' => ['id' => 'Support 24/7', 'en' => '24/7 Support'], 'description' => ['id' => 'Tim kami siap membantu sebelum, selama, dan setelah perjalanan ibadah Anda.', 'en' => 'Our team is ready to help before, during, and after your worship journey.']],
                ],
                'stats' => [
                    ['value' => '10+', 'label' => ['id' => 'Tahun Pengalaman', 'en' => 'Years of Experience'], 'note' => ['id' => 'Sejak 2015', 'en' => 'Since 2015']],
                    ['value' => '2.500+', 'label' => ['id' => 'Jamaah Telah Berangkat', 'en' => 'Pilgrims Departed'], 'note' => ['id' => 'Dari seluruh Indonesia', 'en' => 'From across Indonesia']],
                    ['value' => '98%', 'label' => ['id' => 'Kepuasan Jamaah', 'en' => 'Pilgrim Satisfaction'], 'note' => ['id' => 'Rating rata-rata 4.9', 'en' => 'Average rating 4.9']],
                ],
            ],
            'stats' => [
                ['value' => '10+', 'label' => ['id' => 'Tahun Pengalaman', 'en' => 'Years of Experience']],
                ['value' => '2.500+', 'label' => ['id' => 'Jamaah Telah Berangkat', 'en' => 'Pilgrims Departed']],
                ['value' => '98%', 'label' => ['id' => 'Kepuasan Jamaah', 'en' => 'Pilgrim Satisfaction']],
            ],
            'services' => [
                'items' => [
                    ['icon' => 'users', 'title' => ['id' => 'Pembimbing Berpengalaman', 'en' => 'Experienced Guides'], 'description' => ['id' => 'Tim mutawif ramah & profesional mendampingi setiap langkah ibadah Anda di Tanah Suci.', 'en' => 'Friendly and professional mutawif team accompanies each step of your worship.']],
                    ['icon' => 'hotel', 'title' => ['id' => 'Hotel Nyaman & Strategis', 'en' => 'Comfortable Strategic Hotels'], 'description' => ['id' => 'Maysan Al Maqom (550m dari Haram) & Arkan Al Manar (200m dari Nabawi).', 'en' => 'Maysan Al Maqom (550m from Haram) & Arkan Al Manar (200m from Nabawi).']],
                    ['icon' => 'plane', 'title' => ['id' => 'Direct Flight', 'en' => 'Direct Flight'], 'description' => ['id' => 'Penerbangan langsung tanpa transit - lebih nyaman dan efisien waktu untuk jamaah.', 'en' => 'Direct flight without transit for greater comfort and time efficiency.']],
                    ['icon' => 'cam', 'title' => ['id' => 'Dokumentasi Profesional', 'en' => 'Professional Documentation'], 'description' => ['id' => 'Setiap momen ibadah diabadikan secara profesional sebagai kenangan seumur hidup.', 'en' => 'Each worship moment is captured professionally as a lifelong memory.']],
                    ['icon' => 'pin', 'title' => ['id' => 'Izin Resmi Kemenag RI', 'en' => 'Official Ministry License'], 'description' => ['id' => 'Travel resmi berizin PPIU dari Kementerian Agama RI. Aman, legal, dan terpercaya.', 'en' => 'Official PPIU-licensed travel from the Ministry. Safe, legal, and trusted.']],
                    ['icon' => 'headset', 'title' => ['id' => 'Support 24/7', 'en' => '24/7 Support'], 'description' => ['id' => 'Tim kami siap membantu sebelum, selama, dan setelah perjalanan ibadah Anda.', 'en' => 'Our team is ready to help before, during, and after your worship journey.']],
                ],
            ],
            'packages' => [
                'title' => ['id' => 'PAKET KAMI', 'en' => 'OUR PACKAGE'],
                'heading' => ['id' => "Pilih Paket Umroh Terbaik\nUntuk Perjalanan Ibadah Anda", 'en' => "Choose the Best Umrah Package\nFor Your Worship Journey"],
                'description' => [
                    'id' => 'Direct flight, hotel strategis, mutawif berpengalaman, dan dokumentasi profesional - semua sudah termasuk.',
                    'en' => 'Direct flight, strategic hotels, experienced guides, and professional documentation - all included.',
                ],
                'cta_label' => ['id' => 'Lihat Semua Paket', 'en' => 'View All Packages'],
                'detail_label' => ['id' => 'Tanya Paket Ini', 'en' => 'Ask About This Package'],
                'price_prefix' => ['id' => 'Mulai', 'en' => 'From'],
                'duration_suffix' => ['id' => 'Hari', 'en' => 'Days'],
                'fallback_name' => ['id' => 'Paket Umroh', 'en' => 'Umrah Package'],
                'fallback_summary' => ['id' => 'Detail paket akan tampil di sini.', 'en' => 'Package details will appear here.'],
                'discount_badge_label' => ['id' => 'UNGGULAN', 'en' => 'FEATURED'],
                'selected_package_ids' => [],
            ],
            'gallery' => [
                'title' => ['id' => 'DOKUMENTASI JAMAAH', 'en' => 'PILGRIM DOCUMENTATION'],
                'heading' => ['id' => "Momen Berharga\nBersama Asfar Tour", 'en' => "Precious Moments\nWith Asfar Tour"],
                'description' => [
                    'id' => 'Setiap momen ibadah diabadikan secara profesional - kenangan yang akan selalu diingat.',
                    'en' => 'Each worship moment is captured professionally - a memory worth keeping.',
                ],
                'cta_label' => ['id' => 'Lihat Semua Dokumentasi', 'en' => 'View All Documentation'],
            ],
            'testimonials' => [
                'title' => ['id' => 'TESTIMONI JAMAAH', 'en' => 'PILGRIM TESTIMONIALS'],
                'heading' => ['id' => 'Apa Kata Mereka?', 'en' => 'What Do They Say?'],
                'description' => [
                    'id' => 'Ribuan jamaah telah mempercayakan perjalanan ibadahnya bersama Asfar Tour.',
                    'en' => 'Thousands of pilgrims have trusted their worship journey with Asfar Tour.',
                ],
                'more_label' => ['id' => 'Lihat Semua Testimoni', 'en' => 'View All Testimonials'],
            ],
            'faq' => [
                'title' => ['id' => 'PERTANYAAN YANG SERING DIAJUKAN', 'en' => 'FREQUENTLY ASKED QUESTIONS'],
                'description' => [
                    'id' => 'Temukan jawaban untuk pertanyaan yang paling sering ditanyakan calon jamaah.',
                    'en' => 'Find answers to the questions prospective pilgrims ask most often.',
                ],
            ],
            'location' => [
                'title' => ['id' => 'Kunjungi Kantor Kami', 'en' => 'Visit Our Office'],
                'description' => [
                    'id' => 'Kami siap melayani konsultasi umroh secara langsung maupun online.',
                    'en' => 'We are ready to serve umrah consultations both in person and online.',
                ],
                'office_hours_title' => ['id' => 'Jam Operasional', 'en' => 'Office Hours'],
                'visit_points' => [
                    ['id' => 'Kantor Dapat Dikunjungi', 'en' => 'Office Available to Visit'],
                    ['id' => 'Konsultasi Langsung', 'en' => 'Direct Consultation'],
                    ['id' => 'Tim Siap Membantu', 'en' => 'Team Ready to Help'],
                    ['id' => 'Lokasi Mudah Diakses', 'en' => 'Easy to Reach Location'],
                ],
                'whatsapp_label' => ['id' => 'Konsultasi via WhatsApp', 'en' => 'Consult via WhatsApp'],
                'maps_label' => ['id' => 'Buka Google Maps', 'en' => 'Open Google Maps'],
                'maps_cta_label' => ['id' => 'Lihat Lokasi di Google Maps', 'en' => 'View Location on Google Maps'],
            ],
            'cta' => [
                'badge' => ['id' => 'JANGAN TUNDA NIAT BAIK ANDA', 'en' => 'DO NOT DELAY YOUR GOOD INTENTION'],
                'title' => ['id' => "Jangan Tunda Niat\nBaik Anda", 'en' => "Do Not Delay Your\nGood Intention"],
                'description' => [
                    'id' => 'Konsultasikan perjalanan ibadah Anda sekarang bersama tim Asfar Tour. Gratis, tanpa syarat, tanpa tekanan.',
                    'en' => 'Consult your worship journey now with the Asfar Tour team. Free, with no pressure.',
                ],
                'button_label' => ['id' => 'Konsultasi via WhatsApp', 'en' => 'Consult via WhatsApp'],
                'badges' => [
                    ['id' => 'Resmi Kemenag', 'en' => 'Official Ministry License'],
                    ['id' => 'Fast Response', 'en' => 'Fast Response'],
                    ['id' => 'Amanah', 'en' => 'Trustworthy'],
                    ['id' => 'Support 24 Jam', 'en' => '24 Hour Support'],
                ],
            ],
            'footer' => [
                'brand' => ['id' => 'ASFAR TOUR', 'en' => 'ASFAR TOUR'],
                'subtitle' => ['id' => 'HAJI & UMRAH', 'en' => 'HAJJ & UMRAH'],
                'description' => [
                    'id' => 'Jelas Rencananya, Terjamin Amanahnya. Melayani perjalanan umroh dengan sistem transparan & amanah sejak 2015.',
                    'en' => 'Clear in planning, trusted in delivery. Serving umrah journeys with a transparent and trustworthy system since 2015.',
                ],
                'package_links' => [
                    ['id' => 'Umroh Quad', 'en' => 'Umrah Quad'],
                    ['id' => 'Umroh Triple', 'en' => 'Umrah Triple'],
                    ['id' => 'Umroh Double', 'en' => 'Umrah Double'],
                    ['id' => 'Custom/Private', 'en' => 'Custom/Private'],
                ],
                'company_links' => [
                    ['id' => 'Tentang Kami', 'en' => 'About Us'],
                    ['id' => 'Legalitas', 'en' => 'Legality'],
                    ['id' => 'Kantor', 'en' => 'Office'],
                    ['id' => 'Galeri', 'en' => 'Gallery'],
                ],
                'legal_links' => [
                    ['id' => 'Syarat & Ketentuan', 'en' => 'Terms & Conditions'],
                    ['id' => 'Kebijakan Privasi', 'en' => 'Privacy Policy'],
                    ['id' => 'Kebijakan Refund', 'en' => 'Refund Policy'],
                    ['id' => 'Disclaimer', 'en' => 'Disclaimer'],
                ],
                'bottom_links' => [
                    ['id' => 'Privasi', 'en' => 'Privacy'],
                    ['id' => 'Syarat', 'en' => 'Terms'],
                    ['id' => 'Refund', 'en' => 'Refund'],
                ],
                'whatsapp_float_label' => [
                    'id' => 'Konsultasi Gratis',
                    'en' => 'Free Consultation',
                ],
                'copyright' => [
                    'id' => '© 2026 Asfar Tour · Terdaftar Kemenag RI · PPIU-2026-001 · Jakarta Selatan',
                    'en' => '© 2026 Asfar Tour · Officially Registered · South Jakarta',
                ],
            ],
        ];
    }

    /**
     * @return array<int, array{slug: string, title: array{id: string, en: string}, excerpt: array{id: string, en: string}, content: array<string, mixed>}>
     */
    private function landingPageDefinitions(): array
    {
        return [
            [
                'slug' => 'home_landing',
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
                            'en' => 'Let’s go to the holy land with {company_name}',
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
            ],
            [
                'slug' => 'home_landing_mockup',
                'title' => ['id' => 'Landing Promo', 'en' => 'Promo Landing'],
                'excerpt' => ['id' => 'Konten landing promo untuk halaman /landing.', 'en' => 'Promo landing content for the /landing page.'],
                'content' => $this->defaultLandingMockupContentDefinition(),
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
    private function landingPackageOptions(): array
    {
        return TravelPackage::query()
            ->select(['id', 'name', 'package_type', 'duration_days', 'departure_city', 'is_active'])
            ->where('is_active', true)
            ->orderByDesc('is_featured')
            ->orderBy('name')
            ->get()
            ->map(fn (TravelPackage $package): array => [
                'id' => $package->id,
                'name' => (string) $this->stripLocaleData($package->name),
                'package_type' => $package->package_type,
                'duration_days' => $package->duration_days,
                'departure_city' => $package->departure_city,
                'is_active' => (bool) $package->is_active,
            ])
            ->values()
            ->all();
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
    private function renderContentPage(string $heading, string $description, string $breadcrumbHref, string $menuKey, array $pages, array $resources): Response
    {
        return Inertia::render('Dashboard/Administrator/Content/Index', [
            'heading' => $heading,
            'description' => $description,
            'breadcrumbHref' => $breadcrumbHref,
            'menuKey' => $menuKey,
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
                'with' => ['package:id,code'],
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
            'products' => Arr::only($item->toArray(), ['code', 'slug', 'name', 'product_type', 'description', 'content', 'is_active']),
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
                'travel_package_code' => $item->package?->code,
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
    private function normalizePayload(string $resource, array $payload, ?Model $existing = null): array
    {
        return match ($resource) {
            'product_categories' => [
                'key' => (string) ($payload['key'] ?? ''),
                'name' => $this->localizedValue($payload['name'] ?? []),
                'description' => $this->localizedValue($payload['description'] ?? []),
                'sort_order' => (int) ($payload['sort_order'] ?? 0),
                'is_active' => (bool) ($payload['is_active'] ?? true),
            ],
            'products' => $this->normalizeProductPayload($payload, $existing instanceof TravelProduct ? $existing : null),
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
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalizeProductPayload(array $payload, ?TravelProduct $existing = null): array
    {
        $currencyCode = strtoupper((string) data_get($payload, 'content.currency', 'IDR'));
        $manualRate = data_get($payload, 'content.currency_rate_to_idr');
        $existingSnapshot = data_get($existing?->content, 'currency_rate_snapshot');

        if (is_numeric($manualRate) && (float) $manualRate > 0) {
            $currencyRate = [
                'rate_to_idr' => (float) $manualRate,
                'source' => 'manual',
                'fetched_at' => null,
            ];
        } elseif ($existing !== null && ! data_get($payload, 'content.refresh_currency_rate', false)) {
            $currencyRate = is_array($existingSnapshot) ? $existingSnapshot : [
                'rate_to_idr' => $currencyCode === 'IDR' ? 1 : 0,
                'source' => $currencyCode === 'IDR' ? 'identity' : 'unavailable',
                'fetched_at' => null,
            ];
        } else {
            $currencyRate = $this->liveCurrencyRateService->rateFor($currencyCode);
        }

        return [
            'code' => (string) ($payload['code'] ?? ''),
            'slug' => (string) ($payload['slug'] ?? ''),
            'name' => $this->localizedValue($payload['name'] ?? []),
            'product_type' => (string) ($payload['product_type'] ?? ''),
            'description' => $this->localizedValue($payload['description'] ?? []),
            'content' => [
                'price' => is_array($payload['content'] ?? null) && ($payload['content']['price'] ?? '') !== ''
                    ? (int) $payload['content']['price']
                    : null,
                'currency' => $currencyCode,
                'currency_rate_snapshot' => [
                    'rate_to_idr' => $currencyRate['rate_to_idr'],
                    'source' => $currencyRate['source'],
                    'fetched_at' => $currencyRate['fetched_at'],
                ],
            ],
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
