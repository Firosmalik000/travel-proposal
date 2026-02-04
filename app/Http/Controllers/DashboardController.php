<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\MasterKaryawan;
use App\Models\Department;
use App\Models\SlipGaji;
use App\Models\IzinKeluarKaryawan;
use App\Models\Recruitment;
use App\Models\PinjamanKaryawan;
use App\Models\Cashflow;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;
    public function index()
    {
        return Inertia::render('dashboard');
    }

    public function getStats()
    {
        try {
            // Total Users
            $totalUsers = User::count();
            $previousMonthUsers = User::where('created_at', '<', Carbon::now()->startOfMonth())->count();
            $userGrowth = $previousMonthUsers > 0
                ? round((($totalUsers - $previousMonthUsers) / $previousMonthUsers) * 100, 1)
                : 0;

            // Active Employees - menggunakan is_active = true
            $activeEmployees = MasterKaryawan::where('is_active', true)->count();
            $newEmployeesThisMonth = MasterKaryawan::where('is_active', true)
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();

            // Departments
            $totalDepartments = Department::count();

            // Today's Activity - menggunakan kolom 'tanggal' untuk izin keluar
            $todayActivity = IzinKeluarKaryawan::whereDate('tanggal', Carbon::today())->count() +
                SlipGaji::whereDate('updated_at', Carbon::today())->count();

            return $this->successResponse([
                'totalUsers' => [
                    'value' => $totalUsers,
                    'growth' => $userGrowth,
                    'description' => $userGrowth >= 0
                        ? "+{$userGrowth}% dari bulan lalu"
                        : "{$userGrowth}% dari bulan lalu"
                ],
                'activeEmployees' => [
                    'value' => $activeEmployees,
                    'newThisMonth' => $newEmployeesThisMonth,
                    'description' => "+{$newEmployeesThisMonth} karyawan baru bulan ini"
                ],
                'departments' => [
                    'value' => $totalDepartments,
                    'description' => 'Total departemen'
                ],
                'todayActivity' => [
                    'value' => $todayActivity,
                    'description' => 'Aktivitas hari ini'
                ]
            ], 'Dashboard statistics retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve dashboard statistics', 500, null, $e);
        }
    }

    public function getMonthlyGrowth()
    {
        try {
            $data = [];

            for ($i = 5; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $monthName = $date->locale('id')->isoFormat('MMM');

                $userCount = User::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();

                $employeeCount = MasterKaryawan::where('is_active', true)
                    ->whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();

                $data[] = [
                    'month' => $monthName,
                    'users' => $userCount,
                    'karyawan' => $employeeCount
                ];
            }

            return $this->successResponse($data, 'Monthly growth data retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve monthly growth data', 500, null, $e);
        }
    }

    public function getDepartmentDistribution()
    {
        try {
            $departments = Department::withCount(['karyawan' => function ($query) {
                $query->where('is_active', true);
            }])->get();

            $colors = [
                '#ED1C24', '#FF4757', '#FF6B81', '#FFA07A',
                '#FF8C94', '#FFAAA5', '#FFB6B9', '#FFC3A0',
            ];

            $data = $departments->map(function ($dept, $index) use ($colors) {
                return [
                    'name' => $dept->name,
                    'value' => $dept->karyawan_count,
                    'color' => $colors[$index % count($colors)]
                ];
            })->filter(fn($dept) => $dept['value'] > 0)->values();

            return $this->successResponse($data, 'Department distribution retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve department distribution', 500, null, $e);
        }
    }

    public function getWeeklyActivity()
    {
        try {
            $data = [];
            $days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $dayIndex = $date->dayOfWeek;

                $izinCount = IzinKeluarKaryawan::whereDate('tanggal', $date)->count();
                $documentCount = SlipGaji::whereDate('updated_at', $date)->count() +
                    Cashflow::whereDate('created_at', $date)->count();

                $data[] = [
                    'day' => $days[$dayIndex],
                    'logins' => $izinCount,
                    'documents' => $documentCount
                ];
            }

            return $this->successResponse($data, 'Weekly activity retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve weekly activity', 500, null, $e);
        }
    }

    public function getRecentActivity()
    {
        try {
            $activities = [];

            $newEmployees = MasterKaryawan::where('is_active', true)
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();

            if ($newEmployees > 0) {
                $activities[] = [
                    'text' => "{$newEmployees} karyawan baru terdaftar",
                    'color' => '#ED1C24'
                ];
            }

            $slipGaji = SlipGaji::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();

            if ($slipGaji > 0) {
                $activities[] = [
                    'text' => "{$slipGaji} slip gaji dibuat",
                    'color' => '#FF4757'
                ];
            }

            $slipGajiSent = SlipGaji::whereNotNull('sent_at')
                ->whereMonth('sent_at', Carbon::now()->month)
                ->whereYear('sent_at', Carbon::now()->year)
                ->count();

            if ($slipGajiSent > 0) {
                $activities[] = [
                    'text' => "{$slipGajiSent} slip gaji dikirim via email",
                    'color' => '#FF6B81'
                ];
            }

            $izinToday = IzinKeluarKaryawan::whereDate('tanggal', Carbon::today())->count();

            if ($izinToday > 0) {
                $activities[] = [
                    'text' => "{$izinToday} izin keluar hari ini",
                    'color' => '#FFA07A'
                ];
            }

            return $this->successResponse($activities, 'Recent activity retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve recent activity', 500, null, $e);
        }
    }

    public function getPendingTasks()
    {
        try {
            $tasks = [];

            $unsentSlipGaji = SlipGaji::whereNull('sent_at')->count();
            $tasks[] = [
                'label' => 'Slip Gaji Belum Terkirim',
                'value' => $unsentSlipGaji,
                'color' => '#ED1C24'
            ];

            $pendingIzin = IzinKeluarKaryawan::where('status', 'pending')->count();
            $tasks[] = [
                'label' => 'Izin Keluar Menunggu Approval',
                'value' => $pendingIzin,
                'color' => '#FF4757'
            ];

            $pendingPinjaman = PinjamanKaryawan::where('is_approve', false)
                ->where('is_rejected', false)
                ->count();
            $tasks[] = [
                'label' => 'Pinjaman Menunggu Approval',
                'value' => $pendingPinjaman,
                'color' => '#FF6B81'
            ];

            $newCandidates = Recruitment::where('status', 'kandidat')
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();
            $tasks[] = [
                'label' => 'Kandidat Baru',
                'value' => $newCandidates,
                'color' => '#FFA07A'
            ];

            return $this->successResponse($tasks, 'Pending tasks retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve pending tasks', 500, null, $e);
        }
    }

    public function getSystemStatus()
    {
        try {
            $statuses = [];

            try {
                DB::connection()->getPdo();
                $statuses[] = [
                    'label' => 'Database',
                    'status' => 'Active',
                    'color' => 'green'
                ];
            } catch (\Exception $e) {
                $statuses[] = [
                    'label' => 'Database',
                    'status' => 'Error',
                    'color' => 'red'
                ];
            }

            $statuses[] = [
                'label' => 'Email Service',
                'status' => config('mail.mailers.smtp.host') ? 'Active' : 'Inactive',
                'color' => config('mail.mailers.smtp.host') ? 'green' : 'yellow'
            ];

            $statuses[] = [
                'label' => 'PDF Generator',
                'status' => 'Active',
                'color' => 'green'
            ];

            return $this->successResponse($statuses, 'System status retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve system status', 500, null, $e);
        }
    }

    public function getBirthdaysThisMonth()
    {
        try {
            $birthdays = MasterKaryawan::where('is_active', true)
                ->whereMonth('tanggal_lahir', Carbon::now()->month)
                ->orderBy(DB::raw('DAY(tanggal_lahir)'))
                ->get(['nama_lengkap', 'tanggal_lahir', 'foto']);

            return $this->successResponse($birthdays, 'Birthdays for this month retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve birthdays for this month', 500, null, $e);
        }
    }
}
