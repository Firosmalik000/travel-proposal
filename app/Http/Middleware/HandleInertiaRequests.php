<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Administrator\SeoController;
use App\Models\Article;
use App\Models\CareerOpening;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\LegalDocument;
use App\Models\PageContent;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Models\TravelPackage;
use App\Models\TravelService;
use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Middleware;
use Spatie\Permission\Models\Permission;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Get user permissions if logged in
        $userPermissions = null;
        $user = $request->user();
        $impersonator = null;
        $isImpersonating = false;

        if ($user) {
            $permissionNames = $user->isSuperAdmin()
                ? Permission::query()
                    ->where('name', 'like', 'menu.%')
                    ->pluck('name')
                : $user
                    ->getAllPermissions()
                    ->pluck('name');

            $userPermissions = $permissionNames
                ->filter(fn (string $name): bool => str_starts_with($name, 'menu.'))
                ->reduce(function (array $carry, string $name): array {
                    $parts = explode('.', $name, 3);
                    if (count($parts) !== 3) {
                        return $carry;
                    }

                    [$prefix, $menuKey, $action] = $parts;
                    if ($prefix !== 'menu') {
                        return $carry;
                    }

                    $carry[$menuKey] ??= [];
                    if (! in_array($action, $carry[$menuKey], true)) {
                        $carry[$menuKey][] = $action;
                    }

                    return $carry;
                }, []);

            $user->load('profile');
        }

        /** @var int|null $impersonatorId */
        $impersonatorId = $request->session()->get('impersonator_id');
        if ($impersonatorId) {
            $impersonator = User::query()->find($impersonatorId);
            $isImpersonating = $impersonator !== null;
        }

        $brandingDefaults = [
            'company_name' => config('branding.company_name'),
            'company_subtitle' => config('branding.company_subtitle'),
            'logo_path' => config('branding.logo_path'),
            'logo_white_path' => config('branding.logo_white_path'),
            'palette' => config('branding.palette'),
            'public_theme' => config('branding.public_theme'),
        ];
        $brandingOverrides = PageContent::query()->where('slug', 'branding-settings')->value('content');
        $branding = [
            'company_name' => $brandingOverrides['company_name'] ?? $brandingDefaults['company_name'],
            'company_subtitle' => $brandingOverrides['company_subtitle'] ?? $brandingDefaults['company_subtitle'],
            'logo_path' => isset($brandingOverrides['logo_path']) ? '/storage/'.$brandingOverrides['logo_path'] : $brandingDefaults['logo_path'],
            'logo_white_path' => isset($brandingOverrides['logo_white_path']) ? '/storage/'.$brandingOverrides['logo_white_path'] : $brandingDefaults['logo_white_path'],
            'palette' => array_merge(
                $brandingDefaults['palette'],
                is_array($brandingOverrides['palette'] ?? null) ? $brandingOverrides['palette'] : [],
            ),
            'public_theme' => array_merge(
                $brandingDefaults['public_theme'],
                is_array($brandingOverrides['public_theme'] ?? null) ? $brandingOverrides['public_theme'] : [],
            ),
        ];
        $seoSettings = SeoController::getPublicSettings();
        $publicLogoPath = data_get($seoSettings, 'contact.logo.url', $branding['logo_path']);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
                'permissions' => $userPermissions,
                'impersonation' => [
                    'is_impersonating' => $isImpersonating,
                    'impersonator' => $impersonator
                        ? [
                            'id' => $impersonator->id,
                            'name' => $impersonator->name,
                            'email' => $impersonator->email,
                        ]
                        : null,
                ],
            ],
            'branding' => $branding,
            'seoSettings' => $seoSettings,
            'publicBranding' => [
                'logo_path' => $publicLogoPath,
                'favicon_path' => $publicLogoPath,
            ],
            'publicData' => $this->getPublicData(),
            'url' => $request->url(),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'bulk_created_count' => $request->session()->get('bulk_created_count'),
                'bulk_skipped_hotels' => $request->session()->get('bulk_skipped_hotels'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getPublicData(): array
    {
        $this->ensureLandingPagesExist();

        return [
            'pages' => PageContent::query()
                ->where('category', 'page')
                ->where('is_active', true)
                ->get()
                ->mapWithKeys(fn (PageContent $page): array => [
                    $page->slug => [
                        'slug' => $page->slug,
                        'title' => (string) $this->stripLocaleData($page->title),
                        'excerpt' => $this->stripLocaleData($page->excerpt),
                        'content' => $this->stripLocaleData($page->content),
                    ],
                ])
                ->all(),
            'packages' => TravelPackage::query()
                ->with([
                    'products:id,name,slug',
                    'testimonials' => fn ($query) => $query
                        ->where('is_active', true)
                        ->select(['id', 'package_id', 'rating']),
                ])
                ->where('is_active', true)
                ->where('booking_status', 'open')
                ->whereDate('start_date', '>=', Carbon::today())
                ->orderByDesc('is_featured')
                ->orderBy('price')
                ->get()
                ->map(fn (TravelPackage $package): array => [
                    'id' => $package->id,
                    'code' => $package->code,
                    'slug' => $package->slug,
                    'name' => $package->name,
                    'package_type' => $package->package_type,
                    'departure_city' => $package->departure_city,
                    'start_date' => $package->start_date?->toDateString(),
                    'end_date' => $package->end_date?->toDateString(),
                    'seats_total' => (int) $package->seats_total,
                    'seats_available' => $package->availableSeatsCount(),
                    'booking_status' => $package->booking_status,
                    'duration_days' => $package->duration_days,
                    'price' => $package->price,
                    'original_price' => $package->original_price,
                    'discount_label' => $package->discount_label,
                    'discount_percent' => $package->discountPercent(),
                    'currency' => $package->currency,
                    'image_path' => $package->image_path,
                    'summary' => $package->summary,
                    'content' => $package->content,
                    'is_featured' => $package->is_featured,
                    'rating_avg' => $package->testimonials->avg('rating')
                        ? round($package->testimonials->avg('rating'), 1)
                        : null,
                    'rating_count' => $package->testimonials->count(),
                    'products' => $package->products->map(fn ($product): array => [
                        'name' => $product->name,
                        'slug' => $product->slug,
                    ])->values()->all(),
                ])
                ->values()
                ->all(),
            'schedules' => TravelPackage::query()
                ->where('is_active', true)
                ->whereDate('start_date', '>=', Carbon::today())
                ->orderBy('start_date')
                ->get()
                ->map(fn (TravelPackage $package): array => [
                    'departure_date' => $package->start_date?->toDateString(),
                    'return_date' => $package->end_date?->toDateString(),
                    'departure_city' => $package->departure_city,
                    'seats_total' => (int) $package->seats_total,
                    'seats_available' => $package->availableSeatsCount(),
                    'status' => $package->booking_status,
                    'notes' => $package->departure_notes,
                    'package' => [
                        'slug' => $package->slug,
                        'name' => $package->name,
                        'duration_days' => $package->duration_days,
                        'price' => $package->price,
                        'currency' => $package->currency,
                    ],
                ])
                ->values()
                ->all(),
            'services' => TravelService::query()->where('is_active', true)->orderBy('sort_order')->get(['title', 'description', 'sort_order'])->toArray(),
            'faqs' => Faq::query()->where('is_active', true)->orderBy('sort_order')->get(['question', 'answer', 'sort_order'])->toArray(),
            'articles' => Article::query()
                ->visible()
                ->latest('published_at')
                ->limit(4)
                ->get(['title', 'slug', 'excerpt', 'body', 'image_path', 'published_at', 'is_featured', 'reading_time_minutes'])
                ->toArray(),
            'testimonials' => Testimonial::query()
                ->with('package:id,name')
                ->where('is_active', true)
                ->latest()
                ->get()
                ->map(fn (Testimonial $testimonial): array => [
                    'name' => $testimonial->name,
                    'origin_city' => $testimonial->origin_city,
                    'quote' => $testimonial->quote,
                    'rating' => $testimonial->rating,
                    'package_name' => $testimonial->package?->name,
                ])
                ->values()
                ->all(),
            'gallery' => GalleryItem::query()->where('is_active', true)->orderBy('sort_order')->get(['title', 'category', 'description', 'image_path', 'sort_order'])->toArray(),
            'team' => TeamMember::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'role', 'bio', 'image_path', 'sort_order'])->toArray(),
            'legal_documents' => LegalDocument::query()->where('is_active', true)->orderBy('sort_order')->get(['title', 'document_number', 'issued_by', 'description', 'sort_order'])->toArray(),
            'career_openings' => CareerOpening::query()->where('is_active', true)->orderBy('sort_order')->get(['title', 'location', 'employment_type', 'description', 'requirements', 'sort_order'])->toArray(),
        ];
    }

    private function ensureLandingPagesExist(): void
    {
        $defaults = $this->landingHomeDefaultContent();

        foreach (['home', 'home_landing', 'home_landing_mockup'] as $slug) {
            $homePage = PageContent::query()
                ->where('category', 'page')
                ->where('slug', $slug)
                ->first();

            if (! $homePage) {
                PageContent::query()->create([
                    'slug' => $slug,
                    'category' => 'page',
                    'title' => 'Home',
                    'excerpt' => 'Konten landing page utama.',
                    'content' => $defaults,
                    'is_active' => true,
                ]);

                continue;
            }

            if (! is_array($homePage->content)) {
                $homePage->content = $defaults;
                $homePage->save();

                continue;
            }

            $merged = $this->mergeMissingRecursive($defaults, $homePage->content);

            if ($merged !== $homePage->content) {
                $homePage->content = $merged;
                $homePage->save();
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function landingHomeDefaultContent(): array
    {
        return [
            'hero' => [
                'label' => config('branding.company_name'),
                'title' => config('branding.company_subtitle'),
                'description' => 'Pengalaman ibadah umroh yang khusyuk, nyaman, dan terarah bersama tim yang amanah.',
                'image' => '/images/dummy.jpg',
                'cta_label' => 'FREE KONSULTASI',
                'secondary_cta_label' => 'Lihat Paket',
                'secondary_cta_href' => '/paket-umroh',
                'background' => [
                    'type' => 'default',
                    'color' => '#0f766e',
                    'overlay_intensity' => 'strong',
                ],
            ],
            'timeline' => [
                'label' => 'Alur Perjalanan yang Kami Jalankan',
                'heading' => 'Sistem Perjalanan yang Jelas, Bukan Sekadar Janji',
                'background' => [
                    'type' => 'default',
                    'color' => '#155e75',
                    'overlay_intensity' => 'strong',
                ],
                'steps' => [
                    [
                        'icon' => 'users',
                        'caption' => 'DAFTAR & KONSULTASI',
                        'title' => 'Registrasi',
                        'description' => 'Konsultasi & pilih paket yang sesuai.',
                    ],
                    [
                        'icon' => 'credit-card',
                        'caption' => 'DP / PELUNASAN',
                        'title' => 'Pembayaran',
                        'description' => 'Skema biaya jelas, konfirmasi transparan.',
                    ],
                    [
                        'icon' => 'check-circle-2',
                        'caption' => 'MANASIK & DOKUMEN',
                        'title' => 'Persiapan Umroh',
                        'description' => 'Manasik, perlengkapan, dan dokumen.',
                    ],
                    [
                        'icon' => 'plane',
                        'caption' => 'BERANGKAT BARENG',
                        'title' => 'Keberangkatan',
                        'description' => 'Briefing & pendampingan sebelum berangkat.',
                    ],
                    [
                        'icon' => 'landmark',
                        'caption' => 'BIMBINGAN IBADAH',
                        'title' => 'Ibadah',
                        'description' => 'Bimbingan ibadah sepanjang perjalanan.',
                    ],
                    [
                        'icon' => 'calendar-days',
                        'caption' => 'PULANG AMAN',
                        'title' => 'Kepulangan',
                        'description' => 'Kontrol perjalanan sampai tiba di tanah air.',
                    ],
                ],
                'value_cards' => [
                    [
                        'icon' => 'shield-check',
                        'title' => 'Transparansi Biaya',
                        'description' => 'Rincian biaya jelas sejak awal, tanpa kejutan di tengah jalan.',
                    ],
                    [
                        'icon' => 'calendar-days',
                        'title' => 'Timeline Terencana',
                        'description' => 'Jadwal terstruktur dari pendaftaran sampai kepulangan.',
                    ],
                    [
                        'icon' => 'heart-handshake',
                        'title' => 'Pendampingan Ibadah',
                        'description' => 'Pembimbing berpengalaman memastikan ibadah lebih tenang dan khusyuk.',
                    ],
                    [
                        'icon' => 'check-circle-2',
                        'title' => 'Sistem Terstruktur',
                        'description' => 'Proses administrasi, keberangkatan, dan pelayanan berjalan rapi.',
                    ],
                ],
            ],
            'problem' => [
                'label' => 'PENTING DIKETAHUI',
                'heading' => 'Banyak Jamaah Gagal Berangkat Bukan Karena Niat, Tapi Karena Salah Pilih Travel',
                'background' => [
                    'type' => 'default',
                    'color' => '#7a0d17',
                    'overlay_intensity' => 'strong',
                ],
                'badges' => [
                    'Biaya tiba-tiba berubah di tengah jalan',
                    'Minimnya informasi & komunikasi',
                    'Jadwal keberangkatan tidak jelas',
                    'Takut tertipu travel yang tidak amanah',
                ],
                'quote' => '“Kami memahami kekhawatiran itu. Karena itu, kami hadir dengan sistem yang jelas dan transparan.”',
            ],
            'stats' => [
                ['value' => '15+', 'label' => 'Tahun Melayani'],
                ['value' => '98%', 'label' => 'Kepuasan Jamaah'],
                ['value' => '20K+', 'label' => 'Jamaah Berangkat'],
                ['value' => '50+', 'label' => 'Program Terlaksana'],
            ],
            'about' => [
                'label' => 'Tentang Kami',
                'title' => 'Pelayanan Umroh yang Tertata dan Menenangkan',
                'description' => 'Kami mengelola keberangkatan umroh dengan alur yang jelas, pendampingan ibadah, dan komunikasi yang transparan.',
                'cta' => 'Baca Selengkapnya',
                'image_primary' => '/images/dummy.jpg',
                'image_secondary' => '/images/dummy.jpg',
            ],
            'packages' => [
                'title' => 'Paket Unggulan',
                'price_prefix' => 'Mulai',
                'heading' => 'PAKET UMROH KAMI',
                'cta_label' => 'Lihat Paket Lainnya',
                'detail_label' => 'Lihat Detail',
                'duration_suffix' => 'hari',
                'fallback_name' => 'Paket Umroh',
                'fallback_summary' => 'Detail paket akan tampil di sini.',
                'background' => [
                    'type' => 'default',
                    'color' => '#0f766e',
                    'overlay_intensity' => 'strong',
                ],
            ],
            'services' => [
                'label' => 'Layanan Kami',
                'title' => 'Apa yang Kami Tawarkan?',
                'description' => 'Layanan umroh menyeluruh untuk menjaga perjalanan ibadah tetap aman, nyaman, dan terarah.',
                'background' => [
                    'type' => 'default',
                    'color' => '#0f766e',
                    'overlay_intensity' => 'strong',
                ],
                'fallback_title_prefix' => 'Layanan',
                'fallback_description' => 'Deskripsi layanan akan tampil di sini.',
            ],
            'gallery' => [
                'title' => 'Galeri Perjalanan',
                'description' => 'Momen-momen berharga selama perjalanan jamaah.',
                'cta_label' => 'OUR HISTORY',
                'background' => [
                    'type' => 'default',
                    'color' => '#e6a34a',
                    'overlay_intensity' => 'strong',
                ],
                'images' => [],
            ],
            'faq' => [
                'title' => 'Pertanyaan Umum',
                'description' => 'Temukan jawaban untuk pertanyaan yang sering ditanyakan.',
            ],
            'testimonials' => [
                'heading' => 'Kesan Jamaah',
                'background' => [
                    'type' => 'default',
                    'color' => '#155e75',
                    'overlay_intensity' => 'strong',
                ],
                'fallback_quote' => 'Testimoni jamaah akan tampil di sini.',
            ],
            'articles' => [
                'label' => 'Artikel',
                'heading' => 'News & Update Terbaru',
                'cta_label' => 'Lihat Semua Artikel',
                'read_more_label' => 'Baca selengkapnya',
                'empty_title' => 'Belum ada artikel yang tampil.',
                'empty_description' => 'Pastikan artikel sudah berstatus Terbit dan tanggal publikasinya tidak di masa depan.',
                'background' => [
                    'type' => 'default',
                    'color' => '#e6a34a',
                    'overlay_intensity' => 'strong',
                ],
                'fallback_item_title_prefix' => 'Artikel',
            ],
            'contact' => [
                'label' => 'Kontak Cepat',
                'title' => 'Siap berangkat? Konsultasi gratis dulu.',
                'description' => 'Tim kami siap membantu memilih paket terbaik, jadwal, dan kebutuhan dokumen.',
                'whatsapp_label' => 'Konsultasi WhatsApp',
                'contact_label' => 'Lihat Kontak Lengkap',
                'banner_image' => '/images/dummy.jpg',
                'banner_kicker' => 'Konsultasi Gratis',
                'banner_title' => 'AYO WUJUDKAN IBADAH KE TANAH SUCI BARENG {company_name}',
                'secondary_label' => 'Lihat Paket',
                'secondary_href' => '/paket-umroh',
                'address_label' => 'Alamat',
                'contact_info_label' => 'Kontak',
                'background' => [
                    'type' => 'default',
                    'color' => '#7a0d17',
                    'overlay_intensity' => 'strong',
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $defaults
     * @param  array<string, mixed>  $existing
     * @return array<string, mixed>
     */
    private function mergeMissingRecursive(array $defaults, array $existing): array
    {
        foreach ($defaults as $key => $value) {
            if (! array_key_exists($key, $existing)) {
                $existing[$key] = $value;

                continue;
            }

            if (
                is_array($value) &&
                is_array($existing[$key]) &&
                ! array_is_list($value) &&
                ! array_is_list($existing[$key])
            ) {
                $existing[$key] = $this->mergeMissingRecursive($value, $existing[$key]);
            }
        }

        return $existing;
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
}
