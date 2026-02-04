<?php

use App\Http\Controllers\Administrator\MenuController;
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

Route::get('paket-umroh/detail', function () {
    return Inertia::render('public/paket/detail/index');
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
    Route::get('api/dashboard/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');
    Route::get('api/dashboard/monthly-growth', [DashboardController::class, 'getMonthlyGrowth'])->name('dashboard.monthly-growth');
    Route::get('api/dashboard/department-distribution', [DashboardController::class, 'getDepartmentDistribution'])->name('dashboard.department-distribution');
    Route::get('api/dashboard/weekly-activity', [DashboardController::class, 'getWeeklyActivity'])->name('dashboard.weekly-activity');
    Route::get('api/dashboard/recent-activity', [DashboardController::class, 'getRecentActivity'])->name('dashboard.recent-activity');
    Route::get('api/dashboard/pending-tasks', [DashboardController::class, 'getPendingTasks'])->name('dashboard.pending-tasks');
    Route::get('api/dashboard/system-status', [DashboardController::class, 'getSystemStatus'])->name('dashboard.system-status');
    Route::get('api/dashboard/birthdays', [DashboardController::class, 'getBirthdaysThisMonth'])->name('dashboard.birthdays');

    // Get user menus (for sidebar)
    Route::get('api/user-menus', [MenuController::class, 'getUserMenus'])->name('user.menus');

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

// MinIO Storage Routes
Route::prefix('minio')->middleware(['auth'])->group(function () {
    Route::post('upload', [App\Http\Controllers\MinioStorageController::class, 'upload'])->name('minio.upload');
    Route::get('download/{path}', [App\Http\Controllers\MinioStorageController::class, 'download'])->name('minio.download')->where('path', '.*');
    Route::delete('delete/{path}', [App\Http\Controllers\MinioStorageController::class, 'delete'])->name('minio.delete')->where('path', '.*');
    Route::get('list/{directory?}', [App\Http\Controllers\MinioStorageController::class, 'listFiles'])->name('minio.list')->where('directory', '.*');
    Route::post('temporary-url', [App\Http\Controllers\MinioStorageController::class, 'getTemporaryUrl'])->name('minio.temporary-url');
    Route::get('info/{path}', [App\Http\Controllers\MinioStorageController::class, 'getFileInfo'])->name('minio.info')->where('path', '.*');
});

// MinIO Test Routes (untuk development/testing)
Route::prefix('minio-test')->group(function () {
    Route::get('/', [App\Http\Controllers\MinioTestController::class, 'index'])->name('minio-test.index');
    Route::get('/connection', [App\Http\Controllers\MinioTestController::class, 'testConnection'])->name('minio-test.connection');
    Route::get('/upload-dummy', [App\Http\Controllers\MinioTestController::class, 'testUploadDummy'])->name('minio-test.upload-dummy');
    Route::get('/list-files', [App\Http\Controllers\MinioTestController::class, 'testListFiles'])->name('minio-test.list-files');
    Route::post('/delete', [App\Http\Controllers\MinioTestController::class, 'testDelete'])->name('minio-test.delete');
    Route::get('/system-info', [App\Http\Controllers\MinioTestController::class, 'systemInfo'])->name('minio-test.system-info');
});