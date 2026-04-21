<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Administrator\SeoController;
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
use App\Models\TravelService;
use App\Models\UserAccess;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

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

        if ($user) {
            $rawPermissions = UserAccess::getAllAccessForUser($user->id);
            $userPermissions = [];
            foreach ($rawPermissions as $menuKey => $permissions) {
                $userPermissions[$menuKey] = is_array($permissions) ? array_values($permissions) : [];
            }

            $user->load('profile');
        }

        $brandingDefaults = [
            'company_name' => config('branding.company_name'),
            'company_subtitle' => config('branding.company_subtitle'),
            'logo_path' => config('branding.logo_path'),
            'logo_white_path' => config('branding.logo_white_path'),
            'palette' => config('branding.palette'),
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
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function getPublicData(): array
    {
        return [
            'pages' => PageContent::query()
                ->where('category', 'page')
                ->where('is_active', true)
                ->get()
                ->mapWithKeys(fn (PageContent $page): array => [
                    $page->slug => [
                        'slug' => $page->slug,
                        'title' => $page->title,
                        'excerpt' => $page->excerpt,
                        'content' => $page->content,
                    ],
                ])
                ->all(),
            'packages' => TravelPackage::query()
                ->with([
                    'products:id,name,slug',
                    'schedules' => fn ($query) => $query->withSum(
                        ['registrations as active_booked_pax' => fn ($registrationQuery) => $registrationQuery->where('status', 'registered')],
                        'passenger_count',
                    ),
                    'testimonials:id,travel_package_id,rating',
                ])
                ->where('is_active', true)
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
                    'rating_avg' => $package->testimonials->avg('rating') ? round($package->testimonials->avg('rating'), 1) : null,
                    'rating_count' => $package->testimonials->count(),
                    'products' => $package->products->map(fn ($product): array => [
                        'name' => $product->name,
                        'slug' => $product->slug,
                    ])->values()->all(),
                    'schedules' => $package->schedules->map(fn (DepartureSchedule $schedule): array => [
                        'departure_date' => $schedule->departure_date?->toDateString(),
                        'return_date' => $schedule->return_date?->toDateString(),
                        'departure_city' => $schedule->departure_city,
                        'seats_total' => $schedule->seats_total,
                        'seats_available' => $schedule->availableSeatsCount(),
                        'status' => $schedule->status,
                        'notes' => $schedule->notes,
                    ])->values()->all(),
                ])
                ->values()
                ->all(),
            'schedules' => DepartureSchedule::query()
                ->withSum(
                    ['registrations as active_booked_pax' => fn ($registrationQuery) => $registrationQuery->where('status', 'registered')],
                    'passenger_count',
                )
                ->with('travelPackage:id,slug,name,duration_days,price,currency')
                ->where('is_active', true)
                ->orderBy('departure_date')
                ->get()
                ->map(fn (DepartureSchedule $schedule): array => [
                    'departure_date' => $schedule->departure_date?->toDateString(),
                    'return_date' => $schedule->return_date?->toDateString(),
                    'departure_city' => $schedule->departure_city,
                    'seats_total' => $schedule->seats_total,
                    'seats_available' => $schedule->availableSeatsCount(),
                    'status' => $schedule->status,
                    'notes' => $schedule->notes,
                    'package' => [
                        'slug' => $schedule->travelPackage?->slug,
                        'name' => $schedule->travelPackage?->name,
                        'duration_days' => $schedule->travelPackage?->duration_days,
                        'price' => $schedule->travelPackage?->price,
                        'currency' => $schedule->travelPackage?->currency,
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
                ->with('travelPackage:id,name')
                ->where('is_active', true)
                ->latest()
                ->get()
                ->map(fn (Testimonial $testimonial): array => [
                    'name' => $testimonial->name,
                    'origin_city' => $testimonial->origin_city,
                    'quote' => $testimonial->quote,
                    'rating' => $testimonial->rating,
                    'package_name' => $testimonial->travelPackage?->name,
                ])
                ->values()
                ->all(),
            'gallery' => GalleryItem::query()->where('is_active', true)->orderBy('sort_order')->get(['title', 'category', 'description', 'image_path', 'sort_order'])->toArray(),
            'team' => TeamMember::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'role', 'bio', 'image_path', 'sort_order'])->toArray(),
            'legal_documents' => LegalDocument::query()->where('is_active', true)->orderBy('sort_order')->get(['title', 'document_number', 'issued_by', 'description', 'sort_order'])->toArray(),
            'partners' => Partner::query()->where('is_active', true)->orderBy('sort_order')->get(['name', 'category', 'description', 'logo_path', 'sort_order'])->toArray(),
            'career_openings' => CareerOpening::query()->where('is_active', true)->orderBy('sort_order')->get(['title', 'location', 'employment_type', 'description', 'requirements', 'sort_order'])->toArray(),
        ];
    }
}
