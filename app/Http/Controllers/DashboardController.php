<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\DepartureSchedule;
use App\Models\PageContent;
use App\Models\Testimonial;
use App\Models\TravelPackage;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard');
    }

    public function getStats(): JsonResponse
    {
        $totalUsers = DB::table('users')->count();
        $previousMonthUsers = DB::table('users')
            ->where('created_at', '<', Carbon::now()->startOfMonth())
            ->count();
        $userGrowth = $previousMonthUsers > 0
            ? round((($totalUsers - $previousMonthUsers) / $previousMonthUsers) * 100, 1)
            : 0;

        return response()->json([
            'totalUsers' => [
                'value' => $totalUsers,
                'growth' => $userGrowth,
                'description' => $userGrowth >= 0 ? "+{$userGrowth}% dari bulan lalu" : "{$userGrowth}% dari bulan lalu",
            ],
            'activePackages' => [
                'value' => TravelPackage::query()->where('is_active', true)->count(),
                'description' => 'Paket travel aktif',
            ],
            'upcomingDepartures' => [
                'value' => DepartureSchedule::query()->where('is_active', true)->whereDate('departure_date', '>=', Carbon::today())->count(),
                'description' => 'Jadwal keberangkatan terjadwal',
            ],
            'publishedContent' => [
                'value' => PageContent::query()->where('is_active', true)->count() + Article::query()->where('is_active', true)->count(),
                'description' => 'Konten aktif di website',
            ],
        ]);
    }

    public function getMonthlyGrowth(): JsonResponse
    {
        $data = collect(range(5, 0))->map(function (int $monthsAgo): array {
            $date = Carbon::now()->subMonths($monthsAgo);

            return [
                'month' => $date->locale('id')->isoFormat('MMM'),
                'users' => DB::table('users')->whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count(),
                'departures' => DepartureSchedule::query()->whereYear('departure_date', $date->year)->whereMonth('departure_date', $date->month)->count(),
            ];
        });

        return response()->json($data);
    }

    public function getDepartmentDistribution(): JsonResponse
    {
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

        return response()->json($distribution);
    }

    public function getWeeklyActivity(): JsonResponse
    {
        $days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        $data = collect(range(6, 0))->map(function (int $daysAgo) use ($days): array {
            $date = Carbon::today()->subDays($daysAgo);

            return [
                'day' => $days[$date->dayOfWeek],
                'departures' => DepartureSchedule::query()->whereDate('created_at', $date)->count(),
                'contents' => PageContent::query()->whereDate('updated_at', $date)->count()
                    + Article::query()->whereDate('updated_at', $date)->count(),
            ];
        });

        return response()->json($data);
    }

    public function getRecentActivity(): JsonResponse
    {
        return response()->json([
            ['text' => TravelPackage::query()->where('is_featured', true)->count().' paket unggulan aktif', 'color' => '#0f766e'],
            ['text' => DepartureSchedule::query()->whereDate('departure_date', '>=', Carbon::today())->count().' jadwal keberangkatan siap dipasarkan', 'color' => '#1d4ed8'],
            ['text' => Testimonial::query()->where('is_active', true)->count().' testimoni aktif', 'color' => '#d97706'],
        ]);
    }

    public function getPendingTasks(): JsonResponse
    {
        $thinSeatSchedules = DepartureSchedule::query()
            ->withSum(
                ['registrations as active_booked_pax' => fn ($registrationQuery) => $registrationQuery->where('status', 'registered')],
                'passenger_count',
            )
            ->whereDate('departure_date', '>=', Carbon::today())
            ->get()
            ->filter(fn (DepartureSchedule $schedule): bool => $schedule->availableSeatsCount() <= 10)
            ->count();

        return response()->json([
            ['label' => 'Jadwal Seat Menipis', 'value' => $thinSeatSchedules, 'color' => '#0f766e'],
            ['label' => 'Artikel Belum Dipublish', 'value' => Article::query()->whereNull('published_at')->count(), 'color' => '#1d4ed8'],
            ['label' => 'Konten Belum Aktif', 'value' => PageContent::query()->where('is_active', false)->count(), 'color' => '#d97706'],
            ['label' => 'Paket Nonaktif', 'value' => TravelPackage::query()->where('is_active', false)->count(), 'color' => '#475569'],
        ]);
    }

    public function getSystemStatus(): JsonResponse
    {
        $dbStatus = 'Active';
        try {
            DB::connection()->getPdo();
        } catch (\Throwable) {
            $dbStatus = 'Error';
        }

        return response()->json([
            ['label' => 'Database', 'status' => $dbStatus, 'color' => $dbStatus === 'Active' ? 'green' : 'red'],
            ['label' => 'Storage', 'status' => 'Active', 'color' => 'green'],
            ['label' => 'Queue', 'status' => 'Ready', 'color' => 'green'],
        ]);
    }

    public function getBirthdaysThisMonth(): JsonResponse
    {
        $departures = DepartureSchedule::query()
            ->withSum(
                ['registrations as active_booked_pax' => fn ($registrationQuery) => $registrationQuery->where('status', 'registered')],
                'passenger_count',
            )
            ->with('travelPackage:id,name')
            ->where('is_active', true)
            ->whereDate('departure_date', '>=', Carbon::today())
            ->orderBy('departure_date')
            ->limit(5)
            ->get()
            ->map(fn (DepartureSchedule $schedule): array => [
                'title' => (string) ($schedule->travelPackage?->name['id'] ?? 'Paket Umroh'),
                'departure_date' => $schedule->departure_date?->toDateString(),
                'departure_city' => $schedule->departure_city,
                'seats_available' => $schedule->availableSeatsCount(),
            ]);

        return response()->json($departures);
    }
}
