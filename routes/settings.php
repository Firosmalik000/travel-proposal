<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Profile sections update routes
    Route::patch('settings/profile/personal-info', [ProfileController::class, 'updatePersonalInfo'])->name('profile.update.personal-info');
    Route::patch('settings/profile/account', [ProfileController::class, 'updateAccount'])->name('profile.update.account');

    // Vehicle management routes
    Route::post('settings/profile/kendaraan', [ProfileController::class, 'storeKendaraan'])->name('profile.kendaraan.store');
    Route::patch('settings/profile/kendaraan/{id}', [ProfileController::class, 'updateKendaraan'])->name('profile.kendaraan.update');
    Route::delete('settings/profile/kendaraan/{id}', [ProfileController::class, 'deleteKendaraan'])->name('profile.kendaraan.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
