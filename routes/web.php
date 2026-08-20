<?php

use App\Http\Controllers\Administrator\ActivityController;
use App\Http\Controllers\Administrator\ActivityLogController;
use App\Http\Controllers\Administrator\AgentManagementController;
use App\Http\Controllers\Administrator\ArticleController as AdministratorArticleController;
use App\Http\Controllers\Administrator\BookingCustomerDataController;
use App\Http\Controllers\Administrator\BookingPaymentController;
use App\Http\Controllers\Administrator\BookingRegisterController;
use App\Http\Controllers\Administrator\BrandingController;
use App\Http\Controllers\Administrator\CashflowController;
use App\Http\Controllers\Administrator\ContentController;
use App\Http\Controllers\Administrator\CustomBookingController;
use App\Http\Controllers\Administrator\CustomUmrohRequestController;
use App\Http\Controllers\Administrator\FinancialReportController;
use App\Http\Controllers\Administrator\GalleryController;
use App\Http\Controllers\Administrator\HotelAssignmentController;
use App\Http\Controllers\Administrator\HotelReferenceController;
use App\Http\Controllers\Administrator\ImpersonationController;
use App\Http\Controllers\Administrator\InventoryController;
use App\Http\Controllers\Administrator\InvitationController;
use App\Http\Controllers\Administrator\MenuController;
use App\Http\Controllers\Administrator\PackageController;
use App\Http\Controllers\Administrator\PackageCostCalculationController;
use App\Http\Controllers\Administrator\PackageVendorController;
use App\Http\Controllers\Administrator\ProductManagement\ProductCategoryHotelController;
use App\Http\Controllers\Administrator\RoleManagementController;
use App\Http\Controllers\Administrator\SeoController;
use App\Http\Controllers\Administrator\UserManagementController;
use App\Http\Controllers\Administrator\VendorPricePeriodController;
use App\Http\Controllers\Agent\PortalController as AgentPortalController;
use App\Http\Controllers\Auth\AcceptInvitationController;
use App\Http\Controllers\Customer\AccountController as CustomerAccountController;
use App\Http\Controllers\Customer\BookingParticipantController as CustomerBookingParticipantController;
use App\Http\Controllers\Customer\BookingPaymentInvoiceController as CustomerBookingPaymentInvoiceController;
use App\Http\Controllers\Customer\PortalController as CustomerPortalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PackageRegistrationController;
use App\Http\Controllers\Public\ArticleController as PublicArticleController;
use App\Http\Controllers\Public\BookingReviewController;
use App\Http\Controllers\Public\CustomUmrohRequestController as PublicCustomUmrohRequestController;
use App\Http\Controllers\Public\PdfController;
use App\Models\Activity;
use App\Models\TravelPackage;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('public/website/index', [
        'pageSlug' => 'home_landing',
        'forceWebsite' => true,
    ]);
})->name('home');
Route::get('/landing', function () {
    $templatePath = resource_path('landing/asfar_landing.html');
    $landingHtml = file_exists($templatePath)
        ? (string) file_get_contents($templatePath)
        : '';

    return Inertia::render('public/landing/index', [
        'html' => $landingHtml,
    ]);
})->name('public.landing');
Route::get('/landing/{package}', function (string $package) {
    $travelPackage = TravelPackage::query()
        ->where('is_active', true)
        ->where(function ($query) use ($package): void {
            if (is_numeric($package)) {
                $query->whereKey((int) $package);
            }

            $query->orWhere('slug', $package);
        })
        ->with([
            'products:id,name,product_type,slug',
            'testimonials.departureSchedule:id,departure_date,departure_city',
            'itineraries.activity:id,code,name,description,sort_order,is_active',
            'itineraries.products:id,name,product_type',
        ])
        ->firstOrFail();

    return Inertia::render('public/landing/package/index', [
        'travelPackage' => [
            'id' => $travelPackage->id,
            'code' => $travelPackage->code,
            'slug' => $travelPackage->slug,
            'name' => $travelPackage->name,
            'package_type' => $travelPackage->package_type,
            'departure_city' => $travelPackage->departure_city,
            'duration_days' => $travelPackage->duration_days,
            'price' => (float) $travelPackage->price,
            'original_price' => $travelPackage->original_price ? (float) $travelPackage->original_price : null,
            'discount_label' => $travelPackage->discount_label,
            'discount_percent' => $travelPackage->discountPercent(),
            'discount_ends_at' => $travelPackage->discount_ends_at?->toDateTimeString(),
            'currency' => $travelPackage->currency,
            'image_path' => $travelPackage->image_path,
            'summary' => $travelPackage->summary,
            'content' => $travelPackage->content,
            'is_featured' => $travelPackage->is_featured,
            'rating_avg' => $travelPackage->testimonials->avg('rating') ? round($travelPackage->testimonials->avg('rating'), 1) : null,
            'rating_count' => $travelPackage->testimonials->count(),
            'products' => $travelPackage->products->map(fn ($product): array => [
                'name' => $product->name,
                'product_type' => $product->product_type,
                'slug' => $product->slug,
            ])->values()->all(),
            'schedules' => $travelPackage->start_date ? [[
                'id' => $travelPackage->id,
                'departure_date' => $travelPackage->start_date->toDateString(),
                'return_date' => $travelPackage->end_date?->toDateString(),
                'departure_city' => $travelPackage->departure_city,
                'seats_total' => (int) $travelPackage->seats_total,
                'seats_available' => $travelPackage->availableSeatsCount(),
                'status' => $travelPackage->booking_status,
                'notes' => $travelPackage->departure_notes,
            ]] : [],
            'testimonials' => $travelPackage->testimonials->where('is_active', true)->map(fn ($testimonial): array => [
                'name' => $testimonial->name,
                'origin_city' => $testimonial->origin_city,
                'quote' => $testimonial->quote,
                'rating' => $testimonial->rating,
                'departure_schedule' => $testimonial->departureSchedule ? [
                    'departure_date' => $testimonial->departureSchedule->departure_date?->toDateString(),
                    'departure_city' => $testimonial->departureSchedule->departure_city,
                ] : null,
                'photos' => $testimonial->photos ?? [],
            ])->values()->all(),
            'itineraries' => $travelPackage->itineraries->map(fn ($itinerary): array => [
                'activity_id' => $itinerary->activity_id,
                'activity_ids' => collect($itinerary->activity_ids ?? [])->filter(fn ($activityId) => is_numeric($activityId))->map(fn ($activityId) => (int) $activityId)->values()->all(),
                'day_number' => $itinerary->day_number,
                'sort_order' => $itinerary->sort_order,
                'title' => $itinerary->title,
                'description' => $itinerary->description,
                'activity' => $itinerary->activity ? [
                    'id' => $itinerary->activity->id,
                    'code' => $itinerary->activity->code,
                    'name' => $itinerary->activity->name,
                    'description' => $itinerary->activity->description,
                ] : null,
                'product_ids' => $itinerary->products->pluck('id')->values()->all(),
                'products' => $itinerary->products->map(fn ($product): array => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'product_type' => $product->product_type,
                ])->values()->all(),
            ])->values()->all(),
        ],
    ]);
})->name('public.landing-package');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('impersonation/stop', [ImpersonationController::class, 'stop'])->name('impersonation.stop.global');
});
Route::get('paket-umroh', function () {
    return Inertia::render('public/paket/index');
})->name('public.paket');
Route::get('paket-umroh/{travelPackage:slug}', function (TravelPackage $travelPackage) {
    $travelPackage->load(['products:id,name,product_type', 'testimonials.departureSchedule:id,departure_date,departure_city', 'itineraries.activity:id,code,name,description,sort_order,is_active', 'itineraries.products:id,name,product_type']);

    return Inertia::render('public/paket/detail/index', ['travelPackage' => ['id' => $travelPackage->id,             'code' => $travelPackage->code,             'slug' => $travelPackage->slug,             'name' => $travelPackage->name,             'package_type' => $travelPackage->package_type,             'departure_city' => $travelPackage->departure_city,             'duration_days' => $travelPackage->duration_days,             'price' => (float) $travelPackage->price,             'original_price' => $travelPackage->original_price ? (float) $travelPackage->original_price : null,             'discount_label' => $travelPackage->discount_label,             'discount_percent' => $travelPackage->discountPercent(),             'discount_ends_at' => $travelPackage->discount_ends_at?->toDateTimeString(),             'currency' => $travelPackage->currency,             'image_path' => $travelPackage->image_path,             'summary' => $travelPackage->summary,             'content' => $travelPackage->content,             'is_featured' => $travelPackage->is_featured,             'rating_avg' => $travelPackage->testimonials->avg('rating') ? round($travelPackage->testimonials->avg('rating'), 1) : null,             'rating_count' => $travelPackage->testimonials->count(),             'products' => $travelPackage->products->map(fn ($p) => ['name' => $p->name,                 'product_type' => $p->product_type])->values()->all(),             'schedules' => $travelPackage->start_date ? [['id' => $travelPackage->id,                 'departure_date' => $travelPackage->start_date->toDateString(),                 'return_date' => $travelPackage->end_date?->toDateString(),                 'departure_city' => $travelPackage->departure_city,                 'seats_total' => (int) $travelPackage->seats_total,                 'seats_available' => $travelPackage->availableSeatsCount(),                 'status' => $travelPackage->booking_status,                 'notes' => $travelPackage->departure_notes]] : [],             'testimonials' => $travelPackage->testimonials->where('is_active', true)->map(fn ($t) => ['name' => $t->name,                 'origin_city' => $t->origin_city,                 'quote' => $t->quote,                 'rating' => $t->rating,                 'departure_schedule' => $t->departureSchedule ? ['departure_date' => $t->departureSchedule->departure_date?->toDateString(),                         'departure_city' => $t->departureSchedule->departure_city] : null,                 'photos' => $t->photos ?? []])->values()->all(),             'itineraries' => $travelPackage->itineraries->map(function ($itinerary) {
        $activityIds = collect($itinerary->activity_ids ?? [])->filter(fn ($activityId) => is_numeric($activityId))->map(fn ($activityId) => (int) $activityId)->values();
        if ($activityIds->isEmpty() && $itinerary->activity_id) {
            $activityIds = collect([(int) $itinerary->activity_id]);
        }                  $activities = Activity::query()->whereIn('id', $activityIds->all())->orderBy('sort_order')->orderBy('code')->get(['id', 'code', 'name', 'description', 'sort_order'])->map(fn ($activity) => ['id' => $activity->id,                         'code' => $activity->code,                         'name' => $activity->name,                         'description' => $activity->description,                         'sort_order' => $activity->sort_order])->values()->all();

        return ['activity_id' => $itinerary->activity_id,                     'activity_ids' => $activityIds->all(),                     'day_number' => $itinerary->day_number,                     'sort_order' => $itinerary->sort_order,                     'title' => $itinerary->title,                     'description' => $itinerary->description,                     'activity' => $activities[0] ?? ($itinerary->activity ? ['id' => $itinerary->activity->id,                         'code' => $itinerary->activity->code,                         'name' => $itinerary->activity->name,                         'description' => $itinerary->activity->description] : null),                     'activities' => $activities,                     'product_ids' => $itinerary->products->pluck('id')->values()->all(),                     'products' => $itinerary->products->map(fn ($product) => ['id' => $product->id,                         'name' => $product->name,                         'product_type' => $product->product_type])->values()->all()];
    })->values()->all()]]);
})->name('public.paket-detail');
Route::get('paket-umroh/{travelPackage:slug}/daftar', [PackageRegistrationController::class, 'create'])->name('public.paket-register');
Route::post('paket-umroh/{travelPackage:slug}/daftar', [PackageRegistrationController::class, 'store'])->name('public.paket-register.store');
Route::get('tentang-kami', function () {
    return Inertia::render('public/tentang/index');
})->name('public.tentang');
Route::get('legalitas', function () {
    return Inertia::render('public/legalitas/index');
})->name('public.legalitas');
Route::get('jadwal-keberangkatan', function () {
    return Inertia::render('public/jadwal/index');
})->name('public.jadwal');
Route::get('galeri', function () {
    return Inertia::render('public/galeri/index');
})->name('public.galeri');
Route::get('testimoni', function () {
    return Inertia::render('public/testimoni/index');
})->name('public.testimoni');
Route::get('booking/{booking:booking_code}/review', [BookingReviewController::class, 'show'])
    ->middleware('signed')
    ->name('public.booking.review.show');
Route::post('booking/{booking:booking_code}/review', [BookingReviewController::class, 'store'])
    ->middleware('signed')
    ->name('public.booking.review.store');
Route::get('faq', function () {
    return Inertia::render('public/faq/index');
})->name('public.faq');
Route::get('terms-conditions', function () {
    return Inertia::render('public/policy/index', ['slug' => 'terms-conditions']);
})->name('public.terms');
Route::get('terms-conditions.pdf', [PdfController::class, 'termsConditions'])->name('public.terms.pdf');
Route::get('privacy-policy', function () {
    return Inertia::render('public/policy/index', ['slug' => 'privacy-policy']);
})->name('public.privacy');
Route::get('privacy-policy.pdf', [PdfController::class, 'privacyPolicy'])->name('public.privacy.pdf');
Route::get('refund-policy', function () {
    return Inertia::render('public/policy/index', ['slug' => 'refund-policy']);
})->name('public.refund');
Route::get('refund-policy.pdf', [PdfController::class, 'refundPolicy'])->name('public.refund.pdf');
Route::get('disclaimer', function () {
    return Inertia::render('public/policy/index', ['slug' => 'disclaimer']);
})->name('public.disclaimer');
Route::get('disclaimer.pdf', [PdfController::class, 'disclaimer'])->name('public.disclaimer.pdf');
Route::get('artikel', [PublicArticleController::class, 'index'])->name('public.artikel');
Route::get('artikel/{article:slug}', [PublicArticleController::class, 'show'])->name('public.artikel.show');
Route::get('kontak', function () {
    return Inertia::render('public/kontak/index');
})->name('public.kontak');
Route::get('layanan', function () {
    return Inertia::render('public/layanan/index');
})->name('public.layanan');
Route::get('custom-umroh', function () {
    return Inertia::render('public/custom/index');
})->name('public.custom');
Route::post('custom-umroh', [PublicCustomUmrohRequestController::class, 'store'])->name('public.custom.store');
Route::get('paket-umroh/{travelPackage:slug}/sk.pdf', [PdfController::class, 'packageSk'])->name('public.paket.sk.pdf');
Route::get('karier', function () {
    return Inertia::render('public/karier/index');
})->name('public.karier');

Route::middleware('guest')->group(function () {
    Route::get('invitation/{token}', [AcceptInvitationController::class, 'show'])->name('invitations.show');
    Route::post('invitation/{token}', [AcceptInvitationController::class, 'store'])->name('invitations.store');
});

Route::middleware(['auth', 'customer'])->prefix('customer')->name('customer.')->group(function (): void {
    Route::get('', [CustomerPortalController::class, 'index'])->name('dashboard');
    Route::get('bookings', [CustomerPortalController::class, 'bookings'])->name('bookings.index');
    Route::get('password', [CustomerAccountController::class, 'editPassword'])->name('password.edit');
    Route::put('password', [CustomerAccountController::class, 'updatePassword'])->middleware('throttle:6,1')->name('password.update');
    Route::get('bookings/{bookingCode}', [CustomerPortalController::class, 'show'])->name('bookings.show');
    Route::get('bookings/{booking:booking_code}/payments/{payment}/invoice', CustomerBookingPaymentInvoiceController::class)->name('payments.invoice.download');
    Route::post('bookings/{booking}/participants', [CustomerBookingParticipantController::class, 'store'])->name('participants.store');
    Route::post('bookings/{booking}/participants/{participant}', [CustomerBookingParticipantController::class, 'update'])->name('participants.update');
    Route::delete('bookings/{booking}/participants/{participant}', [CustomerBookingParticipantController::class, 'destroy'])->name('participants.destroy');
    Route::get('bookings/{booking}/participants/{participant}/documents/{document}', [CustomerBookingParticipantController::class, 'download'])->name('participants.documents.download');
});

Route::middleware(['auth', 'agent'])->prefix('agent')->name('agent.')->group(function (): void {
    Route::get('', [AgentPortalController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'verified', 'admin.portal'])->group(function () {     /* Get user menus (for sidebar) */ Route::get('api/user-menus', [MenuController::class, 'getUserMenus'])->name('user.menus');
    $registerAdminPortalRoutes = function (string $prefix, bool $withNames = true): void {
        $nameRoute = static function ($route, string $name) use ($withNames) {
            if ($withNames) {
                $route->name($name);
            }

            return $route;
        };
        $nameRoute(Route::get($prefix, [DashboardController::class, 'index'])->middleware('check.menu.permission:view'), 'dashboard');
        $nameRoute(Route::get($prefix.'/stats', [DashboardController::class, 'getStats'])->middleware('check.menu.permission:view'), 'dashboard.stats');
        $nameRoute(Route::get($prefix.'/monthly-growth', [DashboardController::class, 'getMonthlyGrowth'])->middleware('check.menu.permission:view'), 'dashboard.monthly-growth');
        $nameRoute(Route::get($prefix.'/package-distribution', [DashboardController::class, 'getDepartmentDistribution'])->middleware('check.menu.permission:view'), 'dashboard.department-distribution');
        $nameRoute(Route::get($prefix.'/weekly-activity', [DashboardController::class, 'getWeeklyActivity'])->middleware('check.menu.permission:view'), 'dashboard.weekly-activity');
        $nameRoute(Route::get($prefix.'/recent-activity', [DashboardController::class, 'getRecentActivity'])->middleware('check.menu.permission:view'), 'dashboard.recent-activity');
        $nameRoute(Route::get($prefix.'/pending-tasks', [DashboardController::class, 'getPendingTasks'])->middleware('check.menu.permission:view'), 'dashboard.pending-tasks');
        $nameRoute(Route::get($prefix.'/system-status', [DashboardController::class, 'getSystemStatus'])->middleware('check.menu.permission:view'), 'dashboard.system-status');
        $nameRoute(Route::get($prefix.'/upcoming-departures', [DashboardController::class, 'getBirthdaysThisMonth'])->middleware('check.menu.permission:view'), 'dashboard.birthdays');
        Route::prefix($prefix.'/website-management')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('branding', [BrandingController::class, 'index'])->middleware('check.menu.permission:view'), 'branding.index');
            $nameRoute(Route::patch('branding', [BrandingController::class, 'update'])->middleware('check.menu.permission:edit'), 'branding.update');
            $nameRoute(Route::get('articles', [AdministratorArticleController::class, 'index'])->middleware('check.menu.permission:view'), 'articles.index');
            $nameRoute(Route::get('articles/create', [AdministratorArticleController::class, 'create'])->middleware('check.menu.permission:create'), 'articles.create');
            $nameRoute(Route::post('articles', [AdministratorArticleController::class, 'store'])->middleware('check.menu.permission:create'), 'articles.store');
            $nameRoute(Route::get('articles/{article}/preview', [AdministratorArticleController::class, 'preview'])->middleware('check.menu.permission:view'), 'articles.preview');
            $nameRoute(Route::get('articles/{article}/edit', [AdministratorArticleController::class, 'edit'])->middleware('check.menu.permission:edit'), 'articles.edit');
            $nameRoute(Route::patch('articles/{article}', [AdministratorArticleController::class, 'update'])->middleware('check.menu.permission:edit'), 'articles.update');
            $nameRoute(Route::delete('articles/{article}', [AdministratorArticleController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'articles.destroy');
            $nameRoute(Route::get('portal-content', [ContentController::class, 'portalContent'])->middleware('check.menu.permission:view'), 'portal-content.index');
            $nameRoute(Route::get('landing', [ContentController::class, 'landing'])->middleware('check.menu.permission:view'), 'landing.index');
            $nameRoute(Route::get('website', [ContentController::class, 'website'])->middleware('check.menu.permission:view'), 'website.index');
            $nameRoute(Route::get('gallery', [GalleryController::class, 'index'])->middleware('check.menu.permission:view'), 'gallery.index');
            $nameRoute(Route::post('gallery', [GalleryController::class, 'store'])->middleware('check.menu.permission:create'), 'gallery.store');
            $nameRoute(Route::patch('gallery/{galleryItem}', [GalleryController::class, 'update'])->middleware('check.menu.permission:edit'), 'gallery.update');
            $nameRoute(Route::delete('gallery/{galleryItem}', [GalleryController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'gallery.destroy');
            $nameRoute(Route::redirect('content', '/admin/website-management/website'), 'content.index');
            Route::redirect('products', '/admin/product-management/products');
            Route::redirect('packages', '/admin/product-management/packages');
            $nameRoute(Route::patch('content/{pageContent}', [ContentController::class, 'update'])->middleware('check.menu.permission:edit'), 'content.update');
            $nameRoute(Route::post('content/resources/{resource}', [ContentController::class, 'storeResource'])->middleware('check.menu.permission:create'), 'content.resources.store');
            $nameRoute(Route::patch('content/resources/{resource}/{id}', [ContentController::class, 'updateResource'])->middleware('check.menu.permission:edit'), 'content.resources.update');
            $nameRoute(Route::delete('content/resources/{resource}/{id}', [ContentController::class, 'destroyResource'])->middleware('check.menu.permission:delete'), 'content.resources.destroy');
            $nameRoute(Route::post('content/resources/{resource}/bulk-delete', [ContentController::class, 'bulkDestroyResource'])->middleware('check.menu.permission:delete'), 'content.resources.bulk-destroy');
            $nameRoute(Route::get('seo', [SeoController::class, 'index'])->middleware('check.menu.permission:view'), 'seo.index');
            $nameRoute(Route::patch('seo', [SeoController::class, 'update'])->middleware('check.menu.permission:edit'), 'seo.update');
        });
        Route::prefix($prefix.'/product-management')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('categories', [ContentController::class, 'productCategories']), 'product-categories.index');
            $nameRoute(Route::get('products', [ContentController::class, 'products']), 'products.index');
            $nameRoute(Route::post('products/hotels', [ProductCategoryHotelController::class, 'store'])->middleware('check.menu.permission:create'), 'products.hotels.store');
            $nameRoute(Route::post('products/hotels/bulk', [ProductCategoryHotelController::class, 'bulkStore'])->middleware('check.menu.permission:create'), 'products.hotels.bulk-store');
            $nameRoute(Route::post('products/hotels/bulk-delete', [ProductCategoryHotelController::class, 'bulkDelete'])->middleware('check.menu.permission:delete'), 'products.hotels.bulk-delete');
            $nameRoute(Route::put('products/hotels/{hotel}', [ProductCategoryHotelController::class, 'update'])->middleware('check.menu.permission:edit'), 'products.hotels.update');
            $nameRoute(Route::delete('products/hotels/{hotel}', [ProductCategoryHotelController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'products.hotels.destroy');
            $nameRoute(Route::get('activities', [ActivityController::class, 'index'])->middleware('check.menu.permission:view'), 'activities.index');
            $nameRoute(Route::post('activities', [ActivityController::class, 'store'])->middleware('check.menu.permission:create'), 'activities.store');
            $nameRoute(Route::put('activities/{activity}', [ActivityController::class, 'update'])->middleware('check.menu.permission:edit'), 'activities.update');
            $nameRoute(Route::delete('activities/{activity}', [ActivityController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'activities.destroy');
            $nameRoute(Route::get('packages', [PackageController::class, 'index'])->middleware('check.menu.permission:view'), 'packages.index');
            $nameRoute(Route::get('packages/create', [PackageController::class, 'create'])->middleware('check.menu.permission:create'), 'packages.create');
            $nameRoute(Route::get('packages/{package}', [PackageController::class, 'show'])->middleware('check.menu.permission:view'), 'packages.show');
            $nameRoute(Route::get('packages/{package}/edit', [PackageController::class, 'edit'])->middleware('check.menu.permission:edit'), 'packages.edit');
            $nameRoute(Route::post('packages', [PackageController::class, 'store'])->middleware('check.menu.permission:create'), 'packages.store');
            $nameRoute(Route::post('packages/{package}', [PackageController::class, 'update'])->middleware('check.menu.permission:edit'), 'packages.update');
            $nameRoute(Route::delete('packages/{package}', [PackageController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'packages.destroy');
            $nameRoute(Route::post('package-vendors', [PackageVendorController::class, 'store'])->middleware('check.menu.permission:create'), 'package-vendors.store');
            $nameRoute(Route::put('package-vendors/{vendor}', [PackageVendorController::class, 'update'])->middleware('check.menu.permission:edit'), 'package-vendors.update');
            $nameRoute(Route::delete('package-vendors/{vendor}', [PackageVendorController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'package-vendors.destroy');
            $nameRoute(Route::post('package-vendors/{vendor}/periods', [VendorPricePeriodController::class, 'store'])->middleware('check.menu.permission:create'), 'package-vendors.periods.store');
            $nameRoute(Route::put('package-vendors/{vendor}/periods/{period}', [VendorPricePeriodController::class, 'update'])->middleware('check.menu.permission:edit'), 'package-vendors.periods.update');
            $nameRoute(Route::delete('package-vendors/{vendor}/periods/{period}', [VendorPricePeriodController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'package-vendors.periods.destroy');
            $nameRoute(Route::post('packages/{package}/itineraries', [PackageController::class, 'storeItinerary'])->middleware('check.menu.permission:create'), 'packages.itineraries.store');
            $nameRoute(Route::post('packages/{package}/itineraries/{itinerary}', [PackageController::class, 'updateItinerary'])->middleware('check.menu.permission:edit'), 'packages.itineraries.update');
            $nameRoute(Route::delete('packages/{package}/itineraries/{itinerary}', [PackageController::class, 'destroyItinerary'])->middleware('check.menu.permission:delete'), 'packages.itineraries.destroy');
        });
        Route::prefix($prefix.'/booking-management')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('register', [BookingRegisterController::class, 'index'])->middleware('check.menu.permission:view'), 'booking.register.index');
            $nameRoute(Route::put('register/{registration}/mark-registered', [BookingRegisterController::class, 'markRegistered'])->middleware('check.menu.permission:approve'), 'booking.register.mark-registered');
            $nameRoute(Route::delete('register/{registration}', [BookingRegisterController::class, 'destroyPending'])->middleware('check.menu.permission:delete'), 'booking.register.destroy');
            $nameRoute(Route::get('listing', [BookingRegisterController::class, 'listing'])->middleware('check.menu.permission:view'), 'booking.listing.index');
            $nameRoute(Route::get('listing.pdf', [BookingRegisterController::class, 'listingPdf'])->middleware('check.menu.permission:export'), 'booking.listing.pdf');
            $nameRoute(Route::get('listing/{registration}/participants', [BookingRegisterController::class, 'participants'])->middleware('check.menu.permission:view'), 'booking.listing.participants.index');
            $nameRoute(Route::post('listing/{registration}/participants', [BookingRegisterController::class, 'storeParticipant'])->middleware('check.menu.permission:edit'), 'booking.listing.participants.store');
            $nameRoute(Route::post('listing/{registration}/participants/import', [BookingRegisterController::class, 'importParticipants'])->middleware('check.menu.permission:edit'), 'booking.listing.participants.import');
            $nameRoute(Route::put('listing/{registration}/participants/{participant}', [BookingRegisterController::class, 'updateParticipant'])->middleware('check.menu.permission:edit'), 'booking.listing.participants.update');
            $nameRoute(Route::delete('listing/{registration}/participants/{participant}', [BookingRegisterController::class, 'destroyParticipant'])->middleware('check.menu.permission:edit'), 'booking.listing.participants.destroy');
            $nameRoute(Route::get('listing/{registration}/participants.pdf', [BookingRegisterController::class, 'participantPdf'])->middleware('check.menu.permission:export'), 'booking.listing.participants.pdf');
            $nameRoute(Route::get('listing/{registration}/invoice.pdf', [BookingRegisterController::class, 'invoicePdf'])->middleware('check.menu.permission:export'), 'booking.listing.invoice.pdf');
            $nameRoute(Route::post('listing', [BookingRegisterController::class, 'store'])->middleware('check.menu.permission:create'), 'booking.listing.store');
            $nameRoute(Route::put('listing/{registration}', [BookingRegisterController::class, 'update'])->middleware('check.menu.permission:edit'), 'booking.listing.update');
            $nameRoute(Route::delete('listing/{registration}', [BookingRegisterController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'booking.listing.destroy');
            $nameRoute(Route::get('listing/{booking}/payments', [BookingPaymentController::class, 'index'])->middleware('check.menu.permission:view'), 'booking.payments.index');
            $nameRoute(Route::post('listing/{booking}/payments', [BookingPaymentController::class, 'store'])->middleware('check.menu.permission:edit'), 'booking.payments.store');
            $nameRoute(Route::put('listing/{booking}/payments/{payment}', [BookingPaymentController::class, 'update'])->middleware('check.menu.permission:edit'), 'booking.payments.update');
            $nameRoute(Route::delete('listing/{booking}/payments/{payment}', [BookingPaymentController::class, 'destroy'])->middleware('check.menu.permission:edit'), 'booking.payments.destroy');
            $nameRoute(Route::post('listing/{booking}/payments/reminder', [BookingPaymentController::class, 'remind'])->middleware(['check.menu.permission:edit', 'throttle:3,1']), 'booking.payments.reminder');
            $nameRoute(Route::get('customer-data', [BookingCustomerDataController::class, 'index'])->middleware('check.menu.permission:view'), 'booking.customer-data.index');
            $nameRoute(Route::get('customer-data/{booking}', [BookingCustomerDataController::class, 'show'])->middleware('check.menu.permission:view'), 'booking.customer-data.show');
            $nameRoute(Route::get('customer-data/{booking}/participants/{participant}/documents/{document}', [BookingCustomerDataController::class, 'document'])->middleware('check.menu.permission:view'), 'booking.customer-data.documents.show');
            $nameRoute(Route::post('customer-data/packages/{travelPackage}/reminders', [BookingCustomerDataController::class, 'sendReminders'])->middleware(['check.menu.permission:edit', 'throttle:3,1']), 'booking.customer-data.reminders.send');
            $nameRoute(Route::get('hotel-assignment', [HotelAssignmentController::class, 'index'])->middleware('check.menu.permission:view'), 'booking.hotel-assignment.index');
            $nameRoute(Route::post('hotel-assignment', [HotelAssignmentController::class, 'store'])->middleware('check.menu.permission:create'), 'booking.hotel-assignment.store');
            $nameRoute(Route::put('hotel-assignment/{assignment}', [HotelAssignmentController::class, 'update'])->middleware('check.menu.permission:edit'), 'booking.hotel-assignment.update');
            $nameRoute(Route::delete('hotel-assignment/{assignment}', [HotelAssignmentController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'booking.hotel-assignment.destroy');
            $nameRoute(Route::get('custom-bookings', [CustomBookingController::class, 'index']), 'booking.custom-bookings.index');
            $nameRoute(Route::get('custom-requests', [CustomUmrohRequestController::class, 'index'])->middleware('check.menu.permission:view'), 'booking.custom-requests.index');
            $nameRoute(Route::post('custom-requests/{customUmrohRequest}/approve', [CustomUmrohRequestController::class, 'approve'])->middleware('check.menu.permission:approve'), 'booking.custom-requests.approve');
            $nameRoute(Route::post('custom-requests/{customUmrohRequest}/reject', [CustomUmrohRequestController::class, 'reject'])->middleware('check.menu.permission:reject'), 'booking.custom-requests.reject');
        });
        Route::prefix($prefix.'/financial-management')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('', fn () => redirect()->route('financial.report.index')), 'financial.index');
            $nameRoute(Route::get('financial-report', [FinancialReportController::class, 'index'])->middleware('check.menu.permission:view'), 'financial.report.index');
            $nameRoute(Route::get('financial-report/pdf', [FinancialReportController::class, 'pdf'])->middleware('check.menu.permission:export'), 'financial.report.pdf');
            $nameRoute(Route::get('cashflow', [CashflowController::class, 'index'])->middleware('check.menu.permission:view'), 'cashflow.index');
            $nameRoute(Route::get('cashflow/pdf', [CashflowController::class, 'pdf'])->middleware('check.menu.permission:export'), 'cashflow.pdf');
            $nameRoute(Route::post('cashflow', [CashflowController::class, 'store'])->middleware('check.menu.permission:create'), 'cashflow.store');
            $nameRoute(Route::put('cashflow/{cashflow}', [CashflowController::class, 'update'])->middleware('check.menu.permission:edit'), 'cashflow.update');
            $nameRoute(Route::delete('cashflow/{cashflow}', [CashflowController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'cashflow.destroy');
            $nameRoute(Route::get('hpp-package', [PackageCostCalculationController::class, 'index'])->middleware('check.menu.permission:view'), 'hpp-package.index');
            $nameRoute(Route::post('hpp-package', [PackageCostCalculationController::class, 'store'])->middleware('check.menu.permission:create'), 'hpp-package.store');
            $nameRoute(Route::put('hpp-package/{hppPackage}', [PackageCostCalculationController::class, 'update'])->middleware('check.menu.permission:edit'), 'hpp-package.update');
            $nameRoute(Route::post('hpp-package/{hppPackage}/recalculate', [PackageCostCalculationController::class, 'recalculate'])->middleware('check.menu.permission:edit'), 'hpp-package.recalculate');
        });
        Route::prefix($prefix.'/master-data')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('inventory', [InventoryController::class, 'index'])->middleware('check.menu.permission:view'), 'master-data.inventory.index');
            $nameRoute(Route::post('inventory', [InventoryController::class, 'store'])->middleware('check.menu.permission:create'), 'master-data.inventory.store');
            $nameRoute(Route::put('inventory/{inventoryItem}', [InventoryController::class, 'update'])->middleware('check.menu.permission:edit'), 'master-data.inventory.update');
            $nameRoute(Route::delete('inventory/{inventoryItem}', [InventoryController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'master-data.inventory.destroy');
            $nameRoute(Route::get('hotel-countries', [HotelReferenceController::class, 'countries'])->middleware('check.menu.permission:view'), 'master-data.hotel-countries.index');
            $nameRoute(Route::post('hotel-countries', [HotelReferenceController::class, 'storeCountry'])->middleware('check.menu.permission:create'), 'master-data.hotel-countries.store');
            $nameRoute(Route::put('hotel-countries/{hotelCountry}', [HotelReferenceController::class, 'updateCountry'])->middleware('check.menu.permission:edit'), 'master-data.hotel-countries.update');
            $nameRoute(Route::delete('hotel-countries/{hotelCountry}', [HotelReferenceController::class, 'destroyCountry'])->middleware('check.menu.permission:delete'), 'master-data.hotel-countries.destroy');
            $nameRoute(Route::get('hotel-cities', [HotelReferenceController::class, 'cities'])->middleware('check.menu.permission:view'), 'master-data.hotel-cities.index');
            $nameRoute(Route::post('hotel-cities', [HotelReferenceController::class, 'storeCity'])->middleware('check.menu.permission:create'), 'master-data.hotel-cities.store');
            $nameRoute(Route::put('hotel-cities/{hotelCity}', [HotelReferenceController::class, 'updateCity'])->middleware('check.menu.permission:edit'), 'master-data.hotel-cities.update');
            $nameRoute(Route::delete('hotel-cities/{hotelCity}', [HotelReferenceController::class, 'destroyCity'])->middleware('check.menu.permission:delete'), 'master-data.hotel-cities.destroy');
            $nameRoute(Route::get('hotel-room-types', [HotelReferenceController::class, 'roomTypes'])->middleware('check.menu.permission:view'), 'master-data.hotel-room-types.index');
            $nameRoute(Route::post('hotel-room-types', [HotelReferenceController::class, 'storeRoomType'])->middleware('check.menu.permission:create'), 'master-data.hotel-room-types.store');
            $nameRoute(Route::put('hotel-room-types/{hotelRoomType}', [HotelReferenceController::class, 'updateRoomType'])->middleware('check.menu.permission:edit'), 'master-data.hotel-room-types.update');
            $nameRoute(Route::delete('hotel-room-types/{hotelRoomType}', [HotelReferenceController::class, 'destroyRoomType'])->middleware('check.menu.permission:delete'), 'master-data.hotel-room-types.destroy');
        });
        Route::prefix($prefix.'/activity')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('logs', [ActivityLogController::class, 'index'])->middleware('check.menu.permission:view'), 'activity.logs.index');
        });
        Route::prefix($prefix.'/agent-management')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('agents', [AgentManagementController::class, 'agents'])->middleware('check.menu.permission:view'), 'agents.index');
            $nameRoute(Route::post('agents', [AgentManagementController::class, 'storeAgent'])->middleware('check.menu.permission:create'), 'agents.store');
            $nameRoute(Route::put('agents/{agent}', [AgentManagementController::class, 'updateAgent'])->middleware('check.menu.permission:edit'), 'agents.update');
            $nameRoute(Route::get('fees', [AgentManagementController::class, 'fees'])->middleware('check.menu.permission:view'), 'agent-fees.index');
            $nameRoute(Route::put('fees', [AgentManagementController::class, 'updateFee'])->middleware('check.menu.permission:edit'), 'agent-fees.update');
            $nameRoute(Route::get('commissions', [AgentManagementController::class, 'commissions'])->middleware('check.menu.permission:view'), 'agent-commissions.index');
            $nameRoute(Route::put('commissions/{commission}', [AgentManagementController::class, 'updateCommission'])->middleware('check.menu.permission:edit'), 'agent-commissions.update');
        });
        Route::prefix($prefix.'/administrator')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('menus', [MenuController::class, 'index'])->middleware('check.menu.permission:view'), 'menus.index');
            $nameRoute(Route::post('menus', [MenuController::class, 'store'])->middleware('check.menu.permission:create'), 'menus.store');
            $nameRoute(Route::put('menus/reorder', [MenuController::class, 'reorder'])->middleware('check.menu.permission:edit'), 'menus.reorder');
            $nameRoute(Route::put('menus/{menu}', [MenuController::class, 'update'])->middleware('check.menu.permission:edit'), 'menus.update');
            $nameRoute(Route::delete('menus/{menu}', [MenuController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'menus.destroy');

            $nameRoute(Route::get('users', [UserManagementController::class, 'index'])->middleware('check.menu.permission:view'), 'users.index');
            $nameRoute(Route::put('users/{user}/role', [UserManagementController::class, 'updateRole'])->middleware('check.menu.permission:edit'), 'users.role.update');
            $nameRoute(Route::put('users/{user}', [UserManagementController::class, 'update'])->middleware('check.menu.permission:edit'), 'users.update');
            $nameRoute(Route::put('users/{user}/password', [UserManagementController::class, 'updatePassword'])->middleware('check.menu.permission:edit'), 'users.password.update');
            $nameRoute(Route::post('invitations', [InvitationController::class, 'store'])->middleware('check.menu.permission:create'), 'users.invite');
            $nameRoute(Route::post('users/{user}/impersonate', [ImpersonationController::class, 'start']), 'users.impersonate');
            $nameRoute(Route::post('impersonation/stop', [ImpersonationController::class, 'stop']), 'impersonation.stop');

            $nameRoute(Route::get('roles', [RoleManagementController::class, 'index'])->middleware('check.menu.permission:view'), 'roles.index');
            $nameRoute(Route::post('roles', [RoleManagementController::class, 'store'])->middleware('check.menu.permission:create'), 'roles.store');
            $nameRoute(Route::put('roles/{role}/permissions', [RoleManagementController::class, 'updatePermissions'])->middleware('check.menu.permission:edit'), 'roles.permissions.update');
        });
    };
    $registerAdminPortalRoutes('admin', true);
    $registerAdminPortalRoutes('dashboard', false);
});
require __DIR__.'/settings.php';

Route::fallback(function () {
    return Inertia::render('errors/show', [
        'status' => 404,
    ])->toResponse(request())->setStatusCode(404);
});
