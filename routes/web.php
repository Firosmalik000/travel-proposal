<?php

use App\Http\Controllers\Administrator\ActivityController;
use App\Http\Controllers\Administrator\ArticleController as AdministratorArticleController;
use App\Http\Controllers\Administrator\BookingRegisterController;
use App\Http\Controllers\Administrator\BrandingController;
use App\Http\Controllers\Administrator\ContentController;
use App\Http\Controllers\Administrator\MenuController;
use App\Http\Controllers\Administrator\PackageController;
use App\Http\Controllers\Administrator\SeoController;
use App\Http\Controllers\Administrator\UserAccessController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PackageRegistrationController;
use App\Http\Controllers\Public\ArticleController as PublicArticleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('paket-umroh', function () {
    return Inertia::render('public/paket/index');
})->name('public.paket');

Route::get('paket-umroh/{travelPackage:slug}', function (\App\Models\TravelPackage $travelPackage) {
    $travelPackage->load([
        'products:id,name,product_type',
        'schedules' => fn ($query) => $query->withSum(
            ['registrations as active_booked_pax' => fn ($registrationQuery) => $registrationQuery->where('status', 'registered')],
            'passenger_count',
        ),
        'testimonials',
        'itineraries.activity:id,code,name,description,sort_order,is_active',
        'itineraries.products:id,name,product_type',
    ]);

    return Inertia::render('public/paket/detail/index', [
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
            'products' => $travelPackage->products->map(fn ($p) => [
                'name' => $p->name,
                'product_type' => $p->product_type,
            ])->values()->all(),
            'schedules' => $travelPackage->schedules->map(fn ($s) => [
                'id' => $s->id,
                'departure_date' => $s->departure_date?->toDateString(),
                'return_date' => $s->return_date?->toDateString(),
                'departure_city' => $s->departure_city,
                'seats_total' => $s->seats_total,
                'seats_available' => $s->availableSeatsCount(),
                'status' => $s->status,
                'notes' => $s->notes,
            ])->values()->all(),
            'testimonials' => $travelPackage->testimonials->where('is_active', true)->map(fn ($t) => [
                'name' => $t->name,
                'origin_city' => $t->origin_city,
                'quote' => $t->quote,
                'rating' => $t->rating,
            ])->values()->all(),
            'itineraries' => $travelPackage->itineraries->map(function ($itinerary) {
                $activityIds = collect($itinerary->activity_ids ?? [])
                    ->filter(fn ($activityId) => is_numeric($activityId))
                    ->map(fn ($activityId) => (int) $activityId)
                    ->values();

                if ($activityIds->isEmpty() && $itinerary->activity_id) {
                    $activityIds = collect([(int) $itinerary->activity_id]);
                }

                $activities = \App\Models\Activity::query()
                    ->whereIn('id', $activityIds->all())
                    ->orderBy('sort_order')
                    ->orderBy('code')
                    ->get(['id', 'code', 'name', 'description', 'sort_order'])
                    ->map(fn ($activity) => [
                        'id' => $activity->id,
                        'code' => $activity->code,
                        'name' => $activity->name,
                        'description' => $activity->description,
                        'sort_order' => $activity->sort_order,
                    ])
                    ->values()
                    ->all();

                return [
                    'activity_id' => $itinerary->activity_id,
                    'activity_ids' => $activityIds->all(),
                    'day_number' => $itinerary->day_number,
                    'sort_order' => $itinerary->sort_order,
                    'title' => $itinerary->title,
                    'description' => $itinerary->description,
                    'activity' => $activities[0] ?? ($itinerary->activity ? [
                        'id' => $itinerary->activity->id,
                        'code' => $itinerary->activity->code,
                        'name' => $itinerary->activity->name,
                        'description' => $itinerary->activity->description,
                    ] : null),
                    'activities' => $activities,
                    'product_ids' => $itinerary->products->pluck('id')->values()->all(),
                    'products' => $itinerary->products->map(fn ($product) => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'product_type' => $product->product_type,
                    ])->values()->all(),
                ];
            })->values()->all(),
        ],
    ]);
})->name('public.paket-detail');

Route::get('paket-umroh/{travelPackage:slug}/daftar', [PackageRegistrationController::class, 'create'])
    ->name('public.paket-register');
Route::post('paket-umroh/{travelPackage:slug}/daftar', [PackageRegistrationController::class, 'store'])
    ->name('public.paket-register.store');

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

Route::get('faq', function () {
    return Inertia::render('public/faq/index');
})->name('public.faq');

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

Route::get('mitra', function () {
    return Inertia::render('public/mitra/index');
})->name('public.mitra');

Route::get('karier', function () {
    return Inertia::render('public/karier/index');
})->name('public.karier');

Route::middleware(['auth', 'verified'])->group(function () {
    // Get user menus (for sidebar)
    Route::get('api/user-menus', [MenuController::class, 'getUserMenus'])->name('user.menus');

    $registerAdminPortalRoutes = function (string $prefix, bool $withNames = true): void {
        $nameRoute = static function ($route, string $name) use ($withNames) {
            if ($withNames) {
                $route->name($name);
            }

            return $route;
        };

        $nameRoute(Route::get($prefix, [DashboardController::class, 'index']), 'dashboard');
        $nameRoute(Route::get($prefix.'/stats', [DashboardController::class, 'getStats']), 'dashboard.stats');
        $nameRoute(Route::get($prefix.'/monthly-growth', [DashboardController::class, 'getMonthlyGrowth']), 'dashboard.monthly-growth');
        $nameRoute(Route::get($prefix.'/package-distribution', [DashboardController::class, 'getDepartmentDistribution']), 'dashboard.department-distribution');
        $nameRoute(Route::get($prefix.'/weekly-activity', [DashboardController::class, 'getWeeklyActivity']), 'dashboard.weekly-activity');
        $nameRoute(Route::get($prefix.'/recent-activity', [DashboardController::class, 'getRecentActivity']), 'dashboard.recent-activity');
        $nameRoute(Route::get($prefix.'/pending-tasks', [DashboardController::class, 'getPendingTasks']), 'dashboard.pending-tasks');
        $nameRoute(Route::get($prefix.'/system-status', [DashboardController::class, 'getSystemStatus']), 'dashboard.system-status');
        $nameRoute(Route::get($prefix.'/upcoming-departures', [DashboardController::class, 'getBirthdaysThisMonth']), 'dashboard.birthdays');

        Route::prefix($prefix.'/website-management')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('branding', [BrandingController::class, 'index']), 'branding.index');
            $nameRoute(Route::patch('branding', [BrandingController::class, 'update']), 'branding.update');
            $nameRoute(Route::get('articles', [AdministratorArticleController::class, 'index']), 'articles.index');
            $nameRoute(Route::get('articles/create', [AdministratorArticleController::class, 'create']), 'articles.create');
            $nameRoute(Route::post('articles', [AdministratorArticleController::class, 'store']), 'articles.store');
            $nameRoute(Route::get('articles/{article}/edit', [AdministratorArticleController::class, 'edit']), 'articles.edit');
            $nameRoute(Route::patch('articles/{article}', [AdministratorArticleController::class, 'update']), 'articles.update');
            $nameRoute(Route::delete('articles/{article}', [AdministratorArticleController::class, 'destroy']), 'articles.destroy');
            $nameRoute(Route::get('landing', [ContentController::class, 'landing']), 'landing.index');
            $nameRoute(Route::redirect('schedules', '/admin/product-management/packages'), 'schedules.index');
            $nameRoute(Route::get('content', [ContentController::class, 'index']), 'content.index');
            Route::redirect('products', '/admin/product-management/products');
            Route::redirect('packages', '/admin/product-management/packages');
            $nameRoute(Route::patch('content/{pageContent}', [ContentController::class, 'update']), 'content.update');
            $nameRoute(Route::post('content/resources/{resource}', [ContentController::class, 'storeResource']), 'content.resources.store');
            $nameRoute(Route::patch('content/resources/{resource}/{id}', [ContentController::class, 'updateResource']), 'content.resources.update');
            $nameRoute(Route::delete('content/resources/{resource}/{id}', [ContentController::class, 'destroyResource']), 'content.resources.destroy');
            $nameRoute(Route::get('seo', [SeoController::class, 'index']), 'seo.index');
            $nameRoute(Route::patch('seo', [SeoController::class, 'update']), 'seo.update');
        });

        Route::prefix($prefix.'/product-management')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('categories', [ContentController::class, 'productCategories']), 'product-categories.index');
            $nameRoute(Route::get('products', [ContentController::class, 'products']), 'products.index');
            $nameRoute(Route::get('activities', [ActivityController::class, 'index']), 'activities.index');
            $nameRoute(Route::post('activities', [ActivityController::class, 'store']), 'activities.store');
            $nameRoute(Route::put('activities/{activity}', [ActivityController::class, 'update']), 'activities.update');
            $nameRoute(Route::delete('activities/{activity}', [ActivityController::class, 'destroy']), 'activities.destroy');

            $nameRoute(Route::get('packages', [PackageController::class, 'index']), 'packages.index');
            $nameRoute(Route::post('packages', [PackageController::class, 'store']), 'packages.store');
            $nameRoute(Route::post('packages/{package}', [PackageController::class, 'update']), 'packages.update');
            $nameRoute(Route::delete('packages/{package}', [PackageController::class, 'destroy']), 'packages.destroy');

            $nameRoute(Route::post('packages/{package}/schedules', [PackageController::class, 'storeSchedule']), 'packages.schedules.store');
            $nameRoute(Route::post('packages/{package}/schedules/{schedule}', [PackageController::class, 'updateSchedule']), 'packages.schedules.update');
            $nameRoute(Route::delete('packages/{package}/schedules/{schedule}', [PackageController::class, 'destroySchedule']), 'packages.schedules.destroy');

            $nameRoute(Route::post('packages/{package}/itineraries', [PackageController::class, 'storeItinerary']), 'packages.itineraries.store');
            $nameRoute(Route::post('packages/{package}/itineraries/{itinerary}', [PackageController::class, 'updateItinerary']), 'packages.itineraries.update');
            $nameRoute(Route::delete('packages/{package}/itineraries/{itinerary}', [PackageController::class, 'destroyItinerary']), 'packages.itineraries.destroy');
        });

        Route::prefix($prefix.'/booking-management')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('register', [BookingRegisterController::class, 'index']), 'booking.register.index');
            $nameRoute(Route::put('register/{registration}/mark-registered', [BookingRegisterController::class, 'markRegistered']), 'booking.register.mark-registered');
            $nameRoute(Route::delete('register/{registration}', [BookingRegisterController::class, 'destroy']), 'booking.register.destroy');
            $nameRoute(Route::get('listing', [BookingRegisterController::class, 'listing']), 'booking.listing.index');
            $nameRoute(Route::post('listing', [BookingRegisterController::class, 'store']), 'booking.listing.store');
            $nameRoute(Route::put('listing/{registration}', [BookingRegisterController::class, 'update']), 'booking.listing.update');
            $nameRoute(Route::delete('listing/{registration}', [BookingRegisterController::class, 'destroy']), 'booking.listing.destroy');
        });

        Route::prefix($prefix.'/administrator')->group(function () use ($nameRoute) {
            $nameRoute(Route::get('menus', [MenuController::class, 'index']), 'menus.index');
            $nameRoute(Route::post('menus', [MenuController::class, 'store']), 'menus.store');
            $nameRoute(Route::put('menus/{menu}', [MenuController::class, 'update']), 'menus.update');
            $nameRoute(Route::delete('menus/{menu}', [MenuController::class, 'destroy']), 'menus.destroy');

            $nameRoute(Route::get('user-access', [UserAccessController::class, 'index']), 'user-access.index');
            $nameRoute(Route::post('user-access', [UserAccessController::class, 'store']), 'user-access.store');
            $nameRoute(Route::put('user-access/{userAccess}', [UserAccessController::class, 'update']), 'user-access.update');
            $nameRoute(Route::delete('user-access/{userAccess}', [UserAccessController::class, 'destroy']), 'user-access.destroy');
            $nameRoute(Route::post('user-access/check-permission', [UserAccessController::class, 'checkPermission']), 'user-access.check-permission');
            $nameRoute(Route::get('user-access/menu/{menuKey}', [UserAccessController::class, 'getUserMenuAccess']), 'user-access.menu');
            $nameRoute(Route::post('user-access/grant', [UserAccessController::class, 'grantMenuPermission']), 'user-access.grant');
            $nameRoute(Route::post('user-access/revoke', [UserAccessController::class, 'revokeMenuPermission']), 'user-access.revoke');
        });
    };

    $registerAdminPortalRoutes('admin', true);
    $registerAdminPortalRoutes('dashboard', false);
});

require __DIR__.'/settings.php';
