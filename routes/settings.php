<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\ScheduleController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');
    Route::redirect('admin/settings', '/settings/profile');
    Route::redirect('admin/settings/schedule', '/settings/schedule');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Profile sections update routes
    Route::patch('settings/profile/personal-info', [ProfileController::class, 'updatePersonalInfo'])->name('profile.update.personal-info');
    Route::patch('settings/profile/account', [ProfileController::class, 'updateAccount'])->name('profile.update.account');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/schedule', [ScheduleController::class, 'edit'])
        ->name('settings.schedule.edit');
    Route::patch('settings/schedule', [ScheduleController::class, 'update'])
        ->name('settings.schedule.update');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
