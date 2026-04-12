<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\DepartureSchedule;
use App\Models\PageContent;
use App\Models\Testimonial;
use App\Models\TravelPackage;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use ApiResponse;

    private function localizedValue(mixed $value, string $locale = 'id'): string
    {
        if (is_array($value)) {
            return (string) ($value[$locale] ?? $value['id'] ?? $value['en'] ?? '');
        }

        return (string) $value;
    }

    public function index(): Response
    {
        return Inertia::render('dashboard');
    }

    public function getStats(): JsonResponse
    {
        try {
            $totalUsers = DB::table('users')->count();
            $previousMonthUsers = DB::table('users')
                ->where('created_at', '<', Carbon::now()->startOfMonth())
                ->count();
            $userGrowth = $previousMonthUsers > 0
                ? round((($totalUsers - $previousMonthUsers) / $previousMonthUsers) * 100, 1)
                : 0;

            $activePackages = TravelPackage::query()->where('is_active', true)->count();
            $upcomingDepartures = DepartureSchedule::query()
                ->where('is_active', true)
                ->whereDate('departure_date', '>=', Carbon::today())
                ->count();
            $publishedContent = PageContent::query()->where('is_active', true)->count()
                + Article::query()->where('is_active', true)->count();

            return $this->successResponse([
                'totalUsers' => [
                    'value' => $totalUsers,
                    'growth' => $userGrowth,
                    'description' => $userGrowth >= 0 ? "+{$userGrowth}% dari bulan lalu" : "{$userGrowth}% dari bulan lalu",
                ],
                'activePackages' => [
                    'value' => $activePackages,
                    'description' => 'Paket travel aktif',
                ],
                'upcomingDepartures' => [
                    'value' => $upcomingDepartures,
                    'description' => 'Jadwal keberangkatan terjadwal',
                ],
                'publishedContent' => [
                    'value' => $publishedContent,
                    'description' => 'Konten aktif di website',
                ],
            ], 'Dashboard statistics retrieved successfully');
        } catch (\Throwable $throwable) {
            return $this->errorResponse('Failed to retrieve dashboard statistics', 500, null, $throwable);
        }
    }

    public function getMonthlyGrowth(): JsonResponse
    {
        try {
            $data = [];

            for ($index = 5; $index >= 0; $index -= 1) {
                $date = Carbon::now()->subMonths($index);

                $data[] = [
                    'month' => $date->locale('id')->isoFormat('MMM'),
                    'users' => DB::table('users')
                        ->whereYear('created_at', $date->year)
                        ->whereMonth('created_at', $date->month)
                        ->count(),
                    'departures' => DepartureSchedule::query()
                        ->whereYear('departure_date', $date->year)
                        ->whereMonth('departure_date', $date->month)
                        ->count(),
                ];
            }

            return $this->successResponse($data, 'Monthly growth data retrieved successfully');
        } catch (\Throwable $throwable) {
            return $this->errorResponse('Failed to retrieve monthly growth data', 500, null, $throwable);
        }
    }

    public function getDepartmentDistribution(): JsonResponse
    {
        try {
            $colors = ['#0f766e', '#1d4ed8', '#d97706', '#475569', '#be123c'];
            $distribution = TravelPackage::query()
                ->select('package_type', DB::raw('count(*) as aggregate'))
                ->where('is_active', true)
                ->groupBy('package_type')
                ->orderBy('package_type')
                ->get()
                ->values()
                ->map(fn (TravelPackage $package, int $index): array => [
                    'name' => ucfirst((string) $package->package_type),
                    'value' => (int) $package->aggregate,
                    'color' => $colors[$index % count($colors)],
                ]);

            return $this->successResponse($distribution, 'Package distribution retrieved successfully');
        } catch (\Throwable $throwable) {
            return $this->errorResponse('Failed to retrieve package distribution', 500, null, $throwable);
        }
    }

    public function getWeeklyActivity(): JsonResponse
    {
        try {
            $data = [];
            $days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

            for ($index = 6; $index >= 0; $index -= 1) {
                $date = Carbon::today()->subDays($index);

                $data[] = [
                    'day' => $days[$date->dayOfWeek],
                    'departures' => DepartureSchedule::query()->whereDate('created_at', $date)->count(),
                    'contents' => PageContent::query()->whereDate('updated_at', $date)->count()
                        + Article::query()->whereDate('updated_at', $date)->count(),
                ];
            }

            return $this->successResponse($data, 'Weekly activity retrieved successfully');
        } catch (\Throwable $throwable) {
            return $this->errorResponse('Failed to retrieve weekly activity', 500, null, $throwable);
        }
    }

    public function getRecentActivity(): JsonResponse
    {
        try {
            $activities = [
                [
                    'text' => TravelPackage::query()->where('is_featured', true)->count().' paket unggulan aktif',
                    'color' => '#0f766e',
                ],
                [
                    'text' => DepartureSchedule::query()->whereDate('departure_date', '>=', Carbon::today())->count().' jadwal keberangkatan siap dipasarkan',
                    'color' => '#1d4ed8',
                ],
                [
                    'text' => Testimonial::query()->where('is_active', true)->count().' testimoni aktif',
                    'color' => '#d97706',
                ],
            ];

            return $this->successResponse($activities, 'Recent activity retrieved successfully');
        } catch (\Throwable $throwable) {
            return $this->errorResponse('Failed to retrieve recent activity', 500, null, $throwable);
        }
    }

    public function getPendingTasks(): JsonResponse
    {
        try {
            $tasks = [
                [
                    'label' => 'Jadwal Seat Menipis',
                    'value' => DepartureSchedule::query()
                        ->where('seats_available', '<=', 10)
                        ->whereDate('departure_date', '>=', Carbon::today())
                        ->count(),
                    'color' => '#0f766e',
                ],
                [
                    'label' => 'Artikel Belum Dipublish',
                    'value' => Article::query()->whereNull('published_at')->count(),
                    'color' => '#1d4ed8',
                ],
                [
                    'label' => 'Konten Belum Aktif',
                    'value' => PageContent::query()->where('is_active', false)->count(),
                    'color' => '#d97706',
                ],
                [
                    'label' => 'Paket Nonaktif',
                    'value' => TravelPackage::query()->where('is_active', false)->count(),
                    'color' => '#475569',
                ],
            ];

            return $this->successResponse($tasks, 'Pending tasks retrieved successfully');
        } catch (\Throwable $throwable) {
            return $this->errorResponse('Failed to retrieve pending tasks', 500, null, $throwable);
        }
    }

    public function getSystemStatus(): JsonResponse
    {
        try {
            $statuses = [];

            try {
                DB::connection()->getPdo();
                $statuses[] = [
                    'label' => 'Database',
                    'status' => 'Active',
                    'color' => 'green',
                ];
            } catch (\Throwable) {
                $statuses[] = [
                    'label' => 'Database',
                    'status' => 'Error',
                    'color' => 'red',
                ];
            }

            $statuses[] = [
                'label' => 'Storage',
                'status' => 'Active',
                'color' => 'green',
            ];

            $statuses[] = [
                'label' => 'Queue',
                'status' => 'Ready',
                'color' => 'green',
            ];

            return $this->successResponse($statuses, 'System status retrieved successfully');
        } catch (\Throwable $throwable) {
            return $this->errorResponse('Failed to retrieve system status', 500, null, $throwable);
        }
    }

    public function getBirthdaysThisMonth(): JsonResponse
    {
        try {
            $departures = DepartureSchedule::query()
                ->with('travelPackage:id,name')
                ->where('is_active', true)
                ->whereDate('departure_date', '>=', Carbon::today())
                ->orderBy('departure_date')
                ->limit(5)
                ->get()
                ->map(fn (DepartureSchedule $schedule): array => [
                    'title' => $this->localizedValue($schedule->travelPackage?->name, 'id') ?: 'Paket Umroh',
                    'departure_date' => $schedule->departure_date?->toDateString(),
                    'departure_city' => $schedule->departure_city,
                    'seats_available' => $schedule->seats_available,
                ]);

            return $this->successResponse($departures, 'Upcoming departures retrieved successfully');
        } catch (\Throwable $throwable) {
            return $this->errorResponse('Failed to retrieve upcoming departures', 500, null, $throwable);
        }
    }
}
