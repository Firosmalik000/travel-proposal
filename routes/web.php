<?php

use App\Http\Controllers\Administrator\BrandingController;
use App\Http\Controllers\Administrator\ContentController;
use App\Http\Controllers\Administrator\MenuController;
use App\Http\Controllers\Administrator\PackageController;
use App\Http\Controllers\Administrator\SeoController;
use App\Http\Controllers\Administrator\UserAccessController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('paket-umroh', function () {
    return Inertia::render('public/paket/index');
})->name('public.paket');

Route::get('paket-umroh/{travelPackage:slug}', function (\App\Models\TravelPackage $travelPackage) {
    $travelPackage->load(['products:id,name,product_type', 'schedules', 'testimonials']);

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
                'departure_date' => $s->departure_date?->toDateString(),
                'return_date' => $s->return_date?->toDateString(),
                'departure_city' => $s->departure_city,
                'seats_total' => $s->seats_total,
                'seats_available' => $s->seats_available,
                'status' => $s->status,
                'notes' => $s->notes,
            ])->values()->all(),
            'testimonials' => $travelPackage->testimonials->where('is_active', true)->map(fn ($t) => [
                'name' => $t->name,
                'origin_city' => $t->origin_city,
                'quote' => $t->quote,
                'rating' => $t->rating,
            ])->values()->all(),
        ],
    ]);
})->name('public.paket-detail');

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

Route::get('artikel', function () {
    return Inertia::render('public/artikel/index');
})->name('public.artikel');

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
    // Dashboard Home
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Dashboard API endpoints
    Route::get('dashboard/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');
    Route::get('dashboard/monthly-growth', [DashboardController::class, 'getMonthlyGrowth'])->name('dashboard.monthly-growth');
    Route::get('dashboard/package-distribution', [DashboardController::class, 'getDepartmentDistribution'])->name('dashboard.department-distribution');
    Route::get('dashboard/weekly-activity', [DashboardController::class, 'getWeeklyActivity'])->name('dashboard.weekly-activity');
    Route::get('dashboard/recent-activity', [DashboardController::class, 'getRecentActivity'])->name('dashboard.recent-activity');
    Route::get('dashboard/pending-tasks', [DashboardController::class, 'getPendingTasks'])->name('dashboard.pending-tasks');
    Route::get('dashboard/system-status', [DashboardController::class, 'getSystemStatus'])->name('dashboard.system-status');
    Route::get('dashboard/upcoming-departures', [DashboardController::class, 'getBirthdaysThisMonth'])->name('dashboard.birthdays');

    // Get user menus (for sidebar)
    Route::get('api/user-menus', [MenuController::class, 'getUserMenus'])->name('user.menus');

    Route::prefix('dashboard/website-management')->group(function () {
        Route::get('branding', [BrandingController::class, 'index'])->name('branding.index');
        Route::patch('branding', [BrandingController::class, 'update'])->name('branding.update');
        Route::get('landing', [ContentController::class, 'landing'])->name('landing.index');
        Route::redirect('schedules', '/dashboard/product-management/packages')->name('schedules.index');
        Route::get('content', [ContentController::class, 'index'])->name('content.index');
        Route::redirect('products', '/dashboard/product-management/products');
        Route::redirect('packages', '/dashboard/product-management/packages');
        Route::patch('content/{pageContent}', [ContentController::class, 'update'])->name('content.update');
        Route::post('content/resources/{resource}', [ContentController::class, 'storeResource'])->name('content.resources.store');
        Route::patch('content/resources/{resource}/{id}', [ContentController::class, 'updateResource'])->name('content.resources.update');
        Route::delete('content/resources/{resource}/{id}', [ContentController::class, 'destroyResource'])->name('content.resources.destroy');
        Route::get('seo', [SeoController::class, 'index'])->name('seo.index');
        Route::patch('seo', [SeoController::class, 'update'])->name('seo.update');
    });

    Route::prefix('dashboard/product-management')->group(function () {
        Route::get('categories', [ContentController::class, 'productCategories'])->name('product-categories.index');
        Route::get('products', [ContentController::class, 'products'])->name('products.index');

        // Package Management (dedicated controller)
        Route::get('packages', [PackageController::class, 'index'])->name('packages.index');
        Route::post('packages', [PackageController::class, 'store'])->name('packages.store');
        Route::post('packages/{package}', [PackageController::class, 'update'])->name('packages.update');
        Route::delete('packages/{package}', [PackageController::class, 'destroy'])->name('packages.destroy');

        // Schedule management (nested under package)
        Route::post('packages/{package}/schedules', [PackageController::class, 'storeSchedule'])->name('packages.schedules.store');
        Route::post('packages/{package}/schedules/{schedule}', [PackageController::class, 'updateSchedule'])->name('packages.schedules.update');
        Route::delete('packages/{package}/schedules/{schedule}', [PackageController::class, 'destroySchedule'])->name('packages.schedules.destroy');
    });

    // Administrator Routes
    Route::prefix('dashboard/administrator')->group(function () {
        // Menu Management
        Route::get('menus', [MenuController::class, 'index'])->name('menus.index');
        Route::post('menus', [MenuController::class, 'store'])->name('menus.store');
        Route::put('menus/{menu}', [MenuController::class, 'update'])->name('menus.update');
        Route::delete('menus/{menu}', [MenuController::class, 'destroy'])->name('menus.destroy');

        // User Access Management
        Route::get('user-access', [UserAccessController::class, 'index'])->name('user-access.index');
        Route::post('user-access', [UserAccessController::class, 'store'])->name('user-access.store');
        Route::put('user-access/{userAccess}', [UserAccessController::class, 'update'])->name('user-access.update');
        Route::delete('user-access/{userAccess}', [UserAccessController::class, 'destroy'])->name('user-access.destroy');

        // Permission checking and management
        Route::post('user-access/check-permission', [UserAccessController::class, 'checkPermission'])->name('user-access.check-permission');
        Route::get('user-access/menu/{menuKey}', [UserAccessController::class, 'getUserMenuAccess'])->name('user-access.menu');
        Route::post('user-access/grant', [UserAccessController::class, 'grantMenuPermission'])->name('user-access.grant');
        Route::post('user-access/revoke', [UserAccessController::class, 'revokeMenuPermission'])->name('user-access.revoke');
    });
});

require __DIR__.'/settings.php';
