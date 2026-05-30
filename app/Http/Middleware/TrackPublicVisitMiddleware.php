<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class TrackPublicVisitMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->isMethod('GET')) {
            return $response;
        }

        if ($request->is('admin') || $request->is('admin/*') || $request->is('dashboard') || $request->is('dashboard/*')) {
            return $response;
        }

        $todayKey = now()->toDateString();
        $isLandingRequest = $request->is('landing');
        $publicSessionVisitKey = 'analytics.public.visited.'.$todayKey;
        $landingSessionVisitKey = 'analytics.landing.visited.'.$todayKey;

        if ($isLandingRequest) {
            Cache::add('analytics.landing.total_visits', 0);
            Cache::add('analytics.landing.daily_visits.'.$todayKey, 0);
            Cache::add('analytics.landing.total_visitors', 0);
            Cache::add('analytics.landing.daily_visitors.'.$todayKey, 0);

            Cache::increment('analytics.landing.total_visits', 1);
            Cache::increment('analytics.landing.daily_visits.'.$todayKey, 1);

            if (! $request->session()->has($landingSessionVisitKey)) {
                Cache::increment('analytics.landing.total_visitors', 1);
                Cache::increment('analytics.landing.daily_visitors.'.$todayKey, 1);
                $request->session()->put($landingSessionVisitKey, true);
            }

            return $response;
        }

        Cache::add('analytics.public.total_visits', 0);
        Cache::add('analytics.public.daily_visits.'.$todayKey, 0);
        Cache::add('analytics.public.total_visitors', 0);
        Cache::add('analytics.public.daily_visitors.'.$todayKey, 0);

        Cache::increment('analytics.public.total_visits', 1);
        Cache::increment('analytics.public.daily_visits.'.$todayKey, 1);

        if (! $request->session()->has($publicSessionVisitKey)) {
            Cache::increment('analytics.public.total_visitors', 1);
            Cache::increment('analytics.public.daily_visitors.'.$todayKey, 1);
            $request->session()->put($publicSessionVisitKey, true);
        }

        return $response;
    }
}
