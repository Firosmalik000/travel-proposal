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
use App\Models\Partner;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\TravelPackage;
use App\Models\TravelProduct;
use App\Models\TravelService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
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
            description: 'FAQ, artikel, layanan, testimoni, galeri, tim, legalitas, mitra, dan karier.',
            breadcrumbHref: '/dashboard/website-management/content',
            pages: [],
            resources: ['services', 'faqs', 'articles', 'testimonials', 'gallery', 'team', 'legal_documents', 'partners', 'career_openings'],
        );
    }

    public function landing(): Response
    {
        return Inertia::render('Dashboard/WebsiteManagement/Landing/Index', [
            'pages' => $this->landingPageSections(),
            'defaultFaqs' => Faq::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['question', 'answer'])
                ->toArray(),
        ]);
    }

    public function products(): Response
    {
        return $this->renderContentPage(
            heading: 'Product Management',
            description: 'Kelola product travel yang menjadi komponen package.',
            breadcrumbHref: '/dashboard/product-management/products',
            pages: [],
            resources: ['products'],
        );
    }

    public function packages(): Response
    {
        return $this->renderContentPage(
            heading: 'Package Management',
            description: 'Kelola package umroh beserta jadwal keberangkatan dan relasi product.',
            breadcrumbHref: '/dashboard/product-management/packages',
            pages: [],
            resources: ['packages', 'schedules'],
        );
    }

    public function schedules(): Response
    {
        return $this->renderContentPage(
            heading: 'Schedule Management',
            description: 'Pilih package lalu atur jadwal keberangkatan, seat, dan statusnya.',
            breadcrumbHref: '/dashboard/website-management/schedules',
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
            'title' => [
                'id' => $request->string('title_id')->value(),
                'en' => $request->string('title_en')->value(),
            ],
            'excerpt' => [
                'id' => $request->string('excerpt_id')->value(),
                'en' => $request->string('excerpt_en')->value(),
            ],
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
                'content' => $page->content ?? [],
                'is_active' => $page->is_active,
            ])
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
     * @param  array<int, string>  $resourceKeys
     * @return array<int, array<string, mixed>>
     */
    private function resourceSections(array $resourceKeys): array
    {
        return collect($this->resourceDefinitions())
            ->only($resourceKeys)
            ->map(
                fn (array $definition, string $key): array => [
                    'key' => $key,
                    'label' => $definition['label'],
                    'description' => $definition['description'],
                    'template' => $definition['template'],
                    'meta' => $this->resourceMeta($key),
                    'template_json' => json_encode($definition['template'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                    'items' => $definition['model']::query()
                        ->when(Arr::get($definition, 'with'), fn ($query, array $relations) => $query->with($relations))
                        ->orderBy(...$definition['order_by'])
                        ->get()
                        ->map(fn (Model $item): array => [
                            'id' => $item->getKey(),
                            'title' => $this->resourceItemTitle($key, $item),
                            'payload' => $this->serializeResource($key, $item),
                            'payload_json' => json_encode($this->serializeResource($key, $item), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                        ])
                        ->values()
                        ->all(),
                ],
            )->values()->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function resourceMeta(string $resource): array
    {
        if (! in_array($resource, ['packages', 'schedules'], true)) {
            return [];
        }

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
        ];

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
            'partners' => [
                'label' => 'Mitra',
                'description' => 'Mitra maskapai, hotel, dan komunitas yang tampil di halaman mitra.',
                'model' => Partner::class,
                'order_by' => ['sort_order', 'asc'],
                'template' => [
                    'name' => 'Nama Mitra',
                    'category' => 'maskapai',
                    'description' => ['id' => 'Deskripsi mitra', 'en' => 'Partner description'],
                    'logo_path' => '/images/dummy.jpg',
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
            'partners' => Arr::only($item->toArray(), ['name', 'category', 'description', 'logo_path', 'sort_order', 'is_active']),
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
            'products' => [
                'code' => (string) ($payload['code'] ?? ''),
                'slug' => (string) ($payload['slug'] ?? ''),
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
            'partners' => [
                'name' => (string) ($payload['name'] ?? ''),
                'category' => (string) ($payload['category'] ?? ''),
                'description' => $this->localizedValue($payload['description'] ?? []),
                'logo_path' => (string) ($payload['logo_path'] ?? ''),
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

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, string>
     */
    private function localizedValue(array $payload): array
    {
        return [
            'id' => isset($payload['id']) ? (string) $payload['id'] : '',
            'en' => isset($payload['en']) ? (string) $payload['en'] : '',
        ];
    }

    private function resourceItemTitle(string $resource, Model $item): string
    {
        return match ($resource) {
            'products', 'packages' => (string) ($item->getAttribute('code') ?? $item->getKey()),
            'schedules' => (string) ($item->travelPackage?->code.' - '.$item->getAttribute('departure_date')),
            'articles' => (string) ($item->getAttribute('slug') ?? $item->getKey()),
            'testimonials', 'team', 'partners' => (string) ($item->getAttribute('name') ?? $item->getKey()),
            default => (string) ($item->getKey()),
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
}
