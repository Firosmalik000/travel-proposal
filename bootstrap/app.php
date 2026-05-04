<?php

use App\Http\Middleware\CheckMenuPermission;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register custom middleware aliases
        $middleware->alias([
            'check.menu.permission' => CheckMenuPermission::class,
            'permission' => PermissionMiddleware::class,
            'role' => RoleMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->renderable(function (Throwable $exception, Request $request) {
            if ($request->expectsJson()) {
                return null;
            }

            $status = $exception instanceof HttpExceptionInterface
                ? $exception->getStatusCode()
                : 500;

            if (config('app.debug') && $status >= 500) {
                return null;
            }

            $supportedStatuses = [403, 404, 419, 429, 500, 503];
            if (! in_array($status, $supportedStatuses, true)) {
                return null;
            }

            $titles = [
                403 => 'Akses ditolak',
                404 => 'Halaman tidak ditemukan',
                419 => 'Sesi berakhir',
                429 => 'Terlalu banyak permintaan',
                500 => 'Terjadi kesalahan',
                503 => 'Layanan sedang sibuk',
            ];

            $descriptions = [
                403 => 'Kamu tidak punya izin untuk mengakses halaman ini.',
                404 => 'Halaman yang kamu cari tidak ada atau sudah dipindahkan.',
                419 => 'Sesi kamu sudah kedaluwarsa. Silakan muat ulang halaman.',
                429 => 'Terlalu banyak request dalam waktu singkat. Coba lagi beberapa saat.',
                500 => 'Ada kendala di server. Coba lagi sebentar.',
                503 => 'Server sedang dalam perawatan atau overload. Silakan coba lagi nanti.',
            ];

            $props = [
                'status' => $status,
                'title' => $titles[$status] ?? 'Terjadi kesalahan',
                'description' => $descriptions[$status] ?? 'Silakan coba lagi.',
            ];

            if (Inertia::getShared('branding') === null) {
                $props['branding'] = [
                    'company_name' => config('branding.company_name'),
                    'company_subtitle' => config('branding.company_subtitle'),
                    'logo_path' => config('branding.logo_path'),
                    'logo_white_path' => config('branding.logo_white_path'),
                    'palette' => config('branding.palette'),
                ];
            }

            if (Inertia::getShared('publicBranding') === null) {
                $logoPath = data_get($props, 'branding.logo_path', config('branding.logo_path'));

                $props['publicBranding'] = [
                    'logo_path' => $logoPath,
                    'favicon_path' => $logoPath,
                ];
            }

            return Inertia::render('errors/show', $props)
                ->toResponse($request)
                ->setStatusCode($status);
        });
    })->create();
