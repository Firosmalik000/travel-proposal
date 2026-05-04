<?php

use App\Http\Controllers\Administrator\ActivityController;
use App\Http\Controllers\Administrator\ArticleController as AdministratorArticleController;
use App\Http\Controllers\Administrator\BookingRegisterController;
use App\Http\Controllers\Administrator\BrandingController;
use App\Http\Controllers\Administrator\ContentController;
use App\Http\Controllers\Administrator\CustomBookingController;
use App\Http\Controllers\Administrator\CustomUmrohRequestController;
use App\Http\Controllers\Administrator\FinancialReportController;
use App\Http\Controllers\Administrator\GalleryController;
use App\Http\Controllers\Administrator\ImpersonationController;
use App\Http\Controllers\Administrator\InvitationController;
use App\Http\Controllers\Administrator\MenuController;
use App\Http\Controllers\Administrator\PackageController;
use App\Http\Controllers\Administrator\RoleManagementController;
use App\Http\Controllers\Administrator\SeoController;
use App\Http\Controllers\Administrator\UserManagementController;
use App\Http\Controllers\Auth\AcceptInvitationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PackageRegistrationController;
use App\Http\Controllers\Public\ArticleController as PublicArticleController;
use App\Http\Controllers\Public\BookingReviewController;
use App\Http\Controllers\Public\CustomUmrohRequestController as PublicCustomUmrohRequestController;
use App\Http\Controllers\Public\PdfController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('impersonation/stop', [ImpersonationController::class, 'stop'])->name('impersonation.stop.global');
});
Route::get('paket-umroh', function () {
    return Inertia::render('public/paket/index');
})->name('public.paket');
Route::get('paket-umroh/{travelPackage:slug}', function (\App\Models\TravelPackage $travelPackage) {
    $travelPackage->load(['products:id,name,product_type',         'schedules' => fn ($query) => $query->withSum(['registrations as active_booked_pax' => fn ($registrationQuery) => $registrationQuery->where('status', 'registered')], 'passenger_count'),         'testimonials.departureSchedule:id,departure_date,departure_city',         'itineraries.activity:id,code,name,description,sort_order,is_active',         'itineraries.products:id,name,product_type']);

    return Inertia::render('public/paket/detail/index', ['travelPackage' => ['id' => $travelPackage->id,             'code' => $travelPackage->code,             'slug' => $travelPackage->slug,             'name' => $travelPackage->name,             'package_type' => $travelPackage->package_type,             'departure_city' => $travelPackage->departure_city,             'duration_days' => $travelPackage->duration_days,             'price' => (float) $travelPackage->price,             'original_price' => $travelPackage->original_price ? (float) $travelPackage->original_price : null,             'discount_label' => $travelPackage->discount_label,             'discount_percent' => $travelPackage->discountPercent(),             'discount_ends_at' => $travelPackage->discount_ends_at?->toDateTimeString(),             'currency' => $travelPackage->currency,             'image_path' => $travelPackage->image_path,             'summary' => $travelPackage->summary,             'content' => $travelPackage->content,             'is_featured' => $travelPackage->is_featured,             'rating_avg' => $travelPackage->testimonials->avg('rating') ? round($travelPackage->testimonials->avg('rating'), 1) : null,             'rating_count' => $travelPackage->testimonials->count(),             'products' => $travelPackage->products->map(fn ($p) => ['name' => $p->name,                 'product_type' => $p->product_type])->values()->all(),             'schedules' => $travelPackage->schedules->map(fn ($s) => ['id' => $s->id,                 'departure_date' => $s->departure_date?->toDateString(),                 'return_date' => $s->return_date?->toDateString(),                 'departure_city' => $s->departure_city,                 'seats_total' => $s->seats_total,                 'seats_available' => $s->availableSeatsCount(),                 'status' => $s->status,                 'notes' => $s->notes])->values()->all(),             'testimonials' => $travelPackage->testimonials->where('is_active', true)->map(fn ($t) => ['name' => $t->name,                 'origin_city' => $t->origin_city,                 'quote' => $t->quote,                 'rating' => $t->rating,                 'departure_schedule' => $t->departureSchedule ? ['departure_date' => $t->departureSchedule->departure_date?->toDateString(),                         'departure_city' => $t->departureSchedule->departure_city] : null,                 'photos' => $t->photos ?? []])->values()->all(),             'itineraries' => $travelPackage->itineraries->map(function ($itinerary) {
        $activityIds = collect($itinerary->activity_ids ?? [])->filter(fn ($activityId) => is_numeric($activityId))->map(fn ($activityId) => (int) $activityId)->values();
        if ($activityIds->isEmpty() && $itinerary->activity_id) {
            $activityIds = collect([(int) $itinerary->activity_id]);
        }                  $activities = \App\Models\Activity::query()->whereIn('id', $activityIds->all())->orderBy('sort_order')->orderBy('code')->get(['id', 'code', 'name', 'description', 'sort_order'])->map(fn ($activity) => ['id' => $activity->id,                         'code' => $activity->code,                         'name' => $activity->name,                         'description' => $activity->description,                         'sort_order' => $activity->sort_order])->values()->all();

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

Route::middleware(['auth', 'verified'])->group(function () {     /* Get user menus (for sidebar) */ Route::get('api/user-menus', [MenuController::class, 'getUserMenus'])->name('user.menus');
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
            $nameRoute(Route::get('articles/{article}/edit', [AdministratorArticleController::class, 'edit'])->middleware('check.menu.permission:edit'), 'articles.edit');
            $nameRoute(Route::patch('articles/{article}', [AdministratorArticleController::class, 'update'])->middleware('check.menu.permission:edit'), 'articles.update');
            $nameRoute(Route::delete('articles/{article}', [AdministratorArticleController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'articles.destroy');
            $nameRoute(Route::get('portal-content', [ContentController::class, 'portalContent'])->middleware('check.menu.permission:view'), 'portal-content.index');
            $nameRoute(Route::get('landing', [ContentController::class, 'landing'])->middleware('check.menu.permission:view'), 'landing.index');
            $nameRoute(Route::redirect('schedules', '/admin/product-management/packages'), 'schedules.index');
            $nameRoute(Route::get('gallery', [GalleryController::class, 'index'])->middleware('check.menu.permission:view'), 'gallery.index');
            $nameRoute(Route::post('gallery', [GalleryController::class, 'store'])->middleware('check.menu.permission:create'), 'gallery.store');
            $nameRoute(Route::patch('gallery/{galleryItem}', [GalleryController::class, 'update'])->middleware('check.menu.permission:edit'), 'gallery.update');
            $nameRoute(Route::delete('gallery/{galleryItem}', [GalleryController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'gallery.destroy');
            $nameRoute(Route::get('content', [ContentController::class, 'index'])->middleware('check.menu.permission:view'), 'content.index');
            Route::redirect('products', '/admin/product-management/products');
            Route::redirect('packages', '/admin/product-management/packages');
            $nameRoute(Route::patch('content/{pageContent}', [ContentController::class, 'update'])->middleware('check.menu.permission:edit'), 'content.update');
            $nameRoute(Route::post('content/resources/{resource}', [ContentController::class, 'storeResource'])->middleware('check.menu.permission:create'), 'content.resources.store');
            $nameRoute(Route::patch('content/resources/{resource}/{id}', [ContentController::class, 'updateResource'])->middleware('check.menu.permission:edit'), 'content.resources.update');
            $nameRoute(Route::delete('content/resources/{resource}/{id}', [ContentController::class, 'destroyResource'])->middleware('check.menu.permission:delete'), 'content.resources.destroy');
            $nameRoute(Route::get('seo', [SeoController::class, 'index'])->middleware('check.menu.permission:view'), 'seo.index');
            $nameRoute(Route::patch('seo', [SeoController::class, 'update'])->middleware('check.menu.permission:edit'), 'seo.update');
        });
        Route::prefix($prefix.'/product-management')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('categories', [ContentController::class, 'productCategories']), 'product-categories.index');
            $nameRoute(Route::get('products', [ContentController::class, 'products']), 'products.index');
            $nameRoute(Route::get('activities', [ActivityController::class, 'index'])->middleware('check.menu.permission:view'), 'activities.index');
            $nameRoute(Route::post('activities', [ActivityController::class, 'store'])->middleware('check.menu.permission:create'), 'activities.store');
            $nameRoute(Route::put('activities/{activity}', [ActivityController::class, 'update'])->middleware('check.menu.permission:edit'), 'activities.update');
            $nameRoute(Route::delete('activities/{activity}', [ActivityController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'activities.destroy');
            $nameRoute(Route::get('packages', [PackageController::class, 'index'])->middleware('check.menu.permission:view'), 'packages.index');
            $nameRoute(Route::post('packages', [PackageController::class, 'store'])->middleware('check.menu.permission:create'), 'packages.store');
            $nameRoute(Route::post('packages/{package}', [PackageController::class, 'update'])->middleware('check.menu.permission:edit'), 'packages.update');
            $nameRoute(Route::delete('packages/{package}', [PackageController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'packages.destroy');
            $nameRoute(Route::post('packages/{package}/schedules', [PackageController::class, 'storeSchedule'])->middleware('check.menu.permission:create'), 'packages.schedules.store');
            $nameRoute(Route::post('packages/{package}/schedules/{schedule}', [PackageController::class, 'updateSchedule'])->middleware('check.menu.permission:edit'), 'packages.schedules.update');
            $nameRoute(Route::delete('packages/{package}/schedules/{schedule}', [PackageController::class, 'destroySchedule'])->middleware('check.menu.permission:delete'), 'packages.schedules.destroy');
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
            $nameRoute(Route::get('listing/{registration}/participants.pdf', [BookingRegisterController::class, 'participantPdf'])->middleware('check.menu.permission:export'), 'booking.listing.participants.pdf');
            $nameRoute(Route::get('listing/{registration}/invoice.pdf', [BookingRegisterController::class, 'invoicePdf'])->middleware('check.menu.permission:export'), 'booking.listing.invoice.pdf');
            $nameRoute(Route::post('listing', [BookingRegisterController::class, 'store'])->middleware('check.menu.permission:create'), 'booking.listing.store');
            $nameRoute(Route::put('listing/{registration}', [BookingRegisterController::class, 'update'])->middleware('check.menu.permission:edit'), 'booking.listing.update');
            $nameRoute(Route::delete('listing/{registration}', [BookingRegisterController::class, 'destroy'])->middleware('check.menu.permission:delete'), 'booking.listing.destroy');
            $nameRoute(Route::get('custom-bookings', [CustomBookingController::class, 'index']), 'booking.custom-bookings.index');
            $nameRoute(Route::get('custom-requests', [CustomUmrohRequestController::class, 'index'])->middleware('check.menu.permission:view'), 'booking.custom-requests.index');
            $nameRoute(Route::post('custom-requests/{customUmrohRequest}/approve', [CustomUmrohRequestController::class, 'approve'])->middleware('check.menu.permission:approve'), 'booking.custom-requests.approve');
            $nameRoute(Route::post('custom-requests/{customUmrohRequest}/reject', [CustomUmrohRequestController::class, 'reject'])->middleware('check.menu.permission:reject'), 'booking.custom-requests.reject');
        });
        Route::prefix($prefix.'/financial-management')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('', fn () => redirect()->route('financial.report.index')), 'financial.index');
            $nameRoute(Route::get('financial-report', [FinancialReportController::class, 'index'])->middleware('check.menu.permission:view'), 'financial.report.index');
            $nameRoute(Route::get('financial-report/pdf', [FinancialReportController::class, 'pdf'])->middleware('check.menu.permission:export'), 'financial.report.pdf');
        });
        Route::prefix($prefix.'/administrator')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('menus', [MenuController::class, 'index'])->middleware('check.menu.permission:view'), 'menus.index');
            $nameRoute(Route::post('menus', [MenuController::class, 'store'])->middleware('check.menu.permission:create'), 'menus.store');
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
