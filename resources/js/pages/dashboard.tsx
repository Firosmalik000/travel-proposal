import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { handleApiError } from '@/lib/notifications';
import { dashboard } from '@/routes';
import {
    birthdays as dashboardBirthdays,
    departmentDistribution as dashboardDepartmentDistribution,
    monthlyGrowth as dashboardMonthlyGrowth,
    pendingTasks as dashboardPendingTasks,
    recentActivity as dashboardRecentActivity,
    stats as dashboardStats,
    systemStatus as dashboardSystemStatus,
    weeklyActivity as dashboardWeeklyActivity,
} from '@/routes/dashboard';
import { index as menusIndex } from '@/routes/menus';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    Activity,
    ArrowUpRight,
    Building2,
    Cake,
    Clock,
    FolderTree,
    Loader2,
    Minus,
    RefreshCw,
    Shield,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Stats {
    totalUsers: { value: number; growth: number; description: string };
    activePackages: { value: number; description: string };
    upcomingDepartures: { value: number; description: string };
    estimatedRevenue: { value: number; currency: string; description: string };
    publishedContent: { value: number; description: string };
}

interface MonthlyGrowthData {
    month: string;
    users: number;
    departures: number;
}

interface DepartmentData {
    name: string;
    value: number;
    color: string;
}

interface WeeklyActivityData {
    day: string;
    departures: number;
    contents: number;
}

interface UpcomingDepartureData {
    title: string;
    departure_date: string;
    departure_city: string;
    seats_available: number;
}

interface RecentActivityItem {
    text: string;
    color: string;
}

interface PendingTaskItem {
    label: string;
    value: number;
    color: string;
}

interface SystemStatusItem {
    label: string;
    status: string;
    color: 'green' | 'red' | string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1">
                        <span className="text-[0.70rem] text-muted-foreground uppercase">
                            {label}
                        </span>
                        <span className="font-bold text-muted-foreground">
                            {payload[0].name}
                        </span>
                        {payload[1] && (
                            <span className="font-bold text-muted-foreground">
                                {payload[1].name}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="text-[0.70rem] text-muted-foreground uppercase">
                            Value
                        </span>
                        <span className="font-bold">{payload[0].value}</span>
                        {payload[1] && (
                            <span className="font-bold">
                                {payload[1].value}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

function formatCurrency(amount: number, currency = 'IDR'): string {
    if (!Number.isFinite(amount)) {
        return '-';
    }

    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    }
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [monthlyGrowth, setMonthlyGrowth] = useState<MonthlyGrowthData[]>([]);
    const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
    const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityData[]>(
        [],
    );
    const [upcomingDepartures, setUpcomingDepartures] = useState<
        UpcomingDepartureData[]
    >([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>(
        [],
    );
    const [pendingTasks, setPendingTasks] = useState<PendingTaskItem[]>([]);
    const [systemStatus, setSystemStatus] = useState<SystemStatusItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [
                    statsRes,
                    monthlyRes,
                    deptRes,
                    weeklyRes,
                    birthdaysRes,
                    recentRes,
                    pendingRes,
                    statusRes,
                ] = await Promise.all([
                    axios.get(dashboardStats().url),
                    axios.get(dashboardMonthlyGrowth().url),
                    axios.get(dashboardDepartmentDistribution().url),
                    axios.get(dashboardWeeklyActivity().url),
                    axios.get(dashboardBirthdays().url),
                    axios.get(dashboardRecentActivity().url),
                    axios.get(dashboardPendingTasks().url),
                    axios.get(dashboardSystemStatus().url),
                ]);

                // Extract data from success response
                setStats(statsRes.data.data || statsRes.data);
                setMonthlyGrowth(monthlyRes.data.data || monthlyRes.data);
                setDepartmentData(deptRes.data.data || deptRes.data);
                setWeeklyActivity(weeklyRes.data.data || weeklyRes.data);
                setUpcomingDepartures(
                    birthdaysRes.data.data || birthdaysRes.data,
                );
                setRecentActivity(recentRes.data.data || recentRes.data);
                setPendingTasks(pendingRes.data.data || pendingRes.data);
                setSystemStatus(statusRes.data.data || statusRes.data);
                setLastUpdatedAt(new Date());
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                handleApiError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const refreshDashboard = async () => {
        setRefreshing(true);
        try {
            const [
                statsRes,
                monthlyRes,
                deptRes,
                weeklyRes,
                birthdaysRes,
                recentRes,
                pendingRes,
                statusRes,
            ] = await Promise.all([
                axios.get(dashboardStats().url),
                axios.get(dashboardMonthlyGrowth().url),
                axios.get(dashboardDepartmentDistribution().url),
                axios.get(dashboardWeeklyActivity().url),
                axios.get(dashboardBirthdays().url),
                axios.get(dashboardRecentActivity().url),
                axios.get(dashboardPendingTasks().url),
                axios.get(dashboardSystemStatus().url),
            ]);

            setStats(statsRes.data.data || statsRes.data);
            setMonthlyGrowth(monthlyRes.data.data || monthlyRes.data);
            setDepartmentData(deptRes.data.data || deptRes.data);
            setWeeklyActivity(weeklyRes.data.data || weeklyRes.data);
            setUpcomingDepartures(birthdaysRes.data.data || birthdaysRes.data);
            setRecentActivity(recentRes.data.data || recentRes.data);
            setPendingTasks(pendingRes.data.data || pendingRes.data);
            setSystemStatus(statusRes.data.data || statusRes.data);
            setLastUpdatedAt(new Date());
        } catch (error) {
            console.error('Error refreshing dashboard data:', error);
            handleApiError(error);
        } finally {
            setRefreshing(false);
        }
    };

    const statPalette = ['#0f766e', '#1d4ed8', '#d97706', '#475569'];
    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers.value || 0,
            description: stats?.totalUsers.description || 'Loading...',
            icon: Users,
            trend: stats?.totalUsers.growth
                ? stats.totalUsers.growth > 0
                    ? 'up'
                    : stats.totalUsers.growth < 0
                      ? 'down'
                      : 'stable'
                : 'stable',
            color: statPalette[0],
        },
        {
            title: 'Paket Aktif',
            value: stats?.activePackages.value || 0,
            description: stats?.activePackages.description || 'Loading...',
            icon: FolderTree,
            trend: 'up',
            color: statPalette[1],
        },
        {
            title: 'Jadwal Berangkat',
            value: stats?.upcomingDepartures.value || 0,
            description: stats?.upcomingDepartures.description || 'Loading...',
            icon: Building2,
            trend: 'stable',
            color: statPalette[2],
        },
        {
            title: 'Konten Aktif',
            value: stats?.publishedContent.value || 0,
            description: stats?.publishedContent.description || 'Loading...',
            icon: Activity,
            trend: 'up',
            color: statPalette[3],
        },
    ];

    const getTrendIcon = (trend: string) => {
        if (trend === 'up')
            return <TrendingUp className="h-4 w-4 text-green-600" />;
        if (trend === 'down')
            return <TrendingDown className="h-4 w-4 text-red-600" />;
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <div className="text-lg font-medium text-muted-foreground">
                            Loading dashboard...
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Please wait while we fetch your data
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="relative h-full w-full">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute top-[-20%] right-[-20%] h-96 w-96 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15" />
                    <div className="absolute bottom-[-15%] left-[-18%] h-96 w-96 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-300/10" />
                </div>

                <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6">
                    {/* Header */}
                    <div className="rounded-3xl border bg-card p-4 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.25)] sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    Dashboard
                                </h1>
                                <p className="text-sm text-muted-foreground sm:text-base">
                                    Ringkasan paket, jadwal keberangkatan, dan
                                    status konten travel.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    {lastUpdatedAt ? (
                                        <span>
                                            Update:{' '}
                                            {format(lastUpdatedAt, 'HH:mm', {
                                                locale: id,
                                            })}
                                        </span>
                                    ) : (
                                        <span>Belum update</span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={refreshDashboard}
                                    disabled={refreshing}
                                    className="rounded-full"
                                >
                                    {refreshing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.22)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    Toolkit Akses
                                </CardTitle>
                                <CardDescription>
                                    Pintasan untuk konfigurasi utama.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {[
                                        {
                                            title: 'Menu Management',
                                            desc: 'Susun navigasi dan struktur menu.',
                                            href: menusIndex().url,
                                            icon: FolderTree,
                                        },
                                        {
                                            title: 'Role Management',
                                            desc: 'Atur akses menu per role.',
                                            href: '/admin/administrator/roles',
                                            icon: Shield,
                                        },
                                        {
                                            title: 'User Management',
                                            desc: 'Undang user dan assign role.',
                                            href: '/admin/administrator/users',
                                            icon: Users,
                                        },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.title}
                                                href={item.href}
                                                className="group rounded-2xl border border-border/60 bg-muted/30 p-4 shadow-sm transition hover:-translate-y-[2px] hover:border-primary/30 hover:shadow-md"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                                                            {item.title}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-full bg-primary/10 p-2 text-primary ring-1 ring-border/50">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                    <span>Buka</span>
                                                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.22)] lg:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    Fokus Hari Ini
                                </CardTitle>
                                <CardDescription>
                                    Prioritas aktivitas operasional hari ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-4">
                                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 shadow-sm">
                                        <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                            Aktivitas
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-foreground">
                                            {stats?.publishedContent.value ?? 0}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Konten aktif yang tampil.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 shadow-sm">
                                        <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                            Paket
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-foreground">
                                            {stats?.activePackages.value ?? 0}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Jumlah paket aktif saat ini.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 shadow-sm">
                                        <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                            Keberangkatan
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-foreground">
                                            {stats?.upcomingDepartures.value ??
                                                0}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Jadwal siap dipasarkan.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 shadow-sm">
                                        <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                            Revenue
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-foreground">
                                            {formatCurrency(
                                                stats?.estimatedRevenue.value ??
                                                    0,
                                                stats?.estimatedRevenue
                                                    .currency ?? 'IDR',
                                            )}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Estimasi dari booking registered.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Card
                                    key={index}
                                    className="rounded-2xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg"
                                    style={{ borderLeftColor: stat.color }}
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-base font-semibold text-card-foreground">
                                            {stat.title}
                                        </CardTitle>
                                        <div
                                            className="rounded-full p-2 ring-1 ring-border/50"
                                            style={{
                                                backgroundColor: `${stat.color}14`,
                                            }}
                                        >
                                            <Icon
                                                className="h-5 w-5"
                                                style={{ color: stat.color }}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-baseline gap-2">
                                            <div
                                                className="text-3xl font-bold"
                                                style={{ color: stat.color }}
                                            >
                                                {stat.value}
                                            </div>
                                            {getTrendIcon(stat.trend)}
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {stat.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Birthday Card */}
                    <div className="grid grid-cols-1">
                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                                    <Cake className="h-6 w-6 text-primary" />
                                    Keberangkatan Terdekat
                                </CardTitle>
                                <CardDescription>
                                    Jadwal keberangkatan yang perlu dipantau
                                    dalam waktu dekat.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {loading ? (
                                        <>
                                            <div className="flex items-center space-x-4">
                                                <Skeleton className="h-12 w-12 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-[250px]" />
                                                    <Skeleton className="h-4 w-[200px]" />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <Skeleton className="h-12 w-12 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-[250px]" />
                                                    <Skeleton className="h-4 w-[200px]" />
                                                </div>
                                            </div>
                                        </>
                                    ) : upcomingDepartures.length > 0 ? (
                                        upcomingDepartures.map(
                                            (departure, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center"
                                                >
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback>
                                                            {departure.title
                                                                .split(' ')
                                                                .slice(0, 2)
                                                                .map(
                                                                    (part) =>
                                                                        part[0],
                                                                )
                                                                .join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="ml-4 space-y-1">
                                                        <p className="text-sm leading-none font-medium">
                                                            {departure.title}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(
                                                                new Date(
                                                                    departure.departure_date,
                                                                ),
                                                                'dd MMMM yyyy',
                                                                { locale: id },
                                                            )}{' '}
                                                            •{' '}
                                                            {
                                                                departure.departure_city
                                                            }{' '}
                                                            •{' '}
                                                            {
                                                                departure.seats_available
                                                            }{' '}
                                                            seat
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <p className="py-4 text-center text-sm text-muted-foreground">
                                            Belum ada jadwal keberangkatan
                                            terdekat.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Operational Overview */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    Status Sistem
                                </CardTitle>
                                <CardDescription>
                                    Kesehatan layanan utama aplikasi.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {systemStatus.length > 0 ? (
                                        systemStatus.map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-4 py-3"
                                            >
                                                <p className="text-sm font-medium text-foreground">
                                                    {item.label}
                                                </p>
                                                <Badge
                                                    className={
                                                        item.color === 'green'
                                                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200'
                                                            : 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200'
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-2 text-sm text-muted-foreground">
                                            Belum ada status sistem.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    Tugas Pending
                                </CardTitle>
                                <CardDescription>
                                    Item yang perlu dicek/ditindak.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {pendingTasks.length > 0 ? (
                                        pendingTasks.map((task) => (
                                            <div
                                                key={task.label}
                                                className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-4 py-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                task.color,
                                                        }}
                                                    />
                                                    <p className="text-sm font-medium text-foreground">
                                                        {task.label}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">
                                                    {task.value}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-2 text-sm text-muted-foreground">
                                            Tidak ada tugas pending.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    Aktivitas Terbaru
                                </CardTitle>
                                <CardDescription>
                                    Ringkasan aktivitas yang terdeteksi.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity) => (
                                            <div
                                                key={activity.text}
                                                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3"
                                            >
                                                <span
                                                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            activity.color,
                                                    }}
                                                />
                                                <p className="text-sm text-foreground">
                                                    {activity.text}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-2 text-sm text-muted-foreground">
                                            Belum ada aktivitas terbaru.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Line Chart - User Growth */}
                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: '#3b82f6' }}
                                    ></div>
                                    Pertumbuhan Data
                                </CardTitle>
                                <CardDescription>
                                    User baru dan jadwal keberangkatan per bulan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={monthlyGrowth}>
                                        <defs>
                                            <linearGradient
                                                id="colorUsers"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#3b82f6"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#3b82f6"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="colorDepartures"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#f97316"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#f97316"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tick={{
                                                fill: 'hsl(var(--muted-foreground))',
                                            }}
                                            axisLine={{
                                                stroke: 'hsl(var(--border))',
                                            }}
                                        />
                                        <YAxis
                                            tick={{
                                                fill: 'hsl(var(--muted-foreground))',
                                            }}
                                            axisLine={{
                                                stroke: 'hsl(var(--border))',
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            name="Total Users"
                                            dot={false}
                                            activeDot={{ r: 6 }}
                                            fillOpacity={1}
                                            fill="url(#colorUsers)"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="departures"
                                            stroke="#f97316"
                                            strokeWidth={3}
                                            name="Keberangkatan"
                                            dot={false}
                                            activeDot={{ r: 6 }}
                                            fillOpacity={1}
                                            fill="url(#colorDepartures)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Pie Chart - Department Distribution */}
                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: '#3b82f6' }}
                                    ></div>
                                    Distribusi Paket
                                </CardTitle>
                                <CardDescription>
                                    Sebaran paket berdasarkan tipe layanan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={departmentData as any}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) =>
                                                `${String(name)}: ${(Number(percent) * 100).toFixed(0)}%`
                                            }
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            animationBegin={0}
                                            animationDuration={800}
                                        >
                                            {departmentData.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid gap-6">
                        {/* Bar Chart - Weekly Activity */}
                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: '#3b82f6' }}
                                    ></div>
                                    Aktivitas Mingguan
                                </CardTitle>
                                <CardDescription>
                                    Jadwal dan konten yang diperbarui minggu ini
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={weeklyActivity}>
                                        <defs>
                                            <linearGradient
                                                id="colorDeparturesWeekly"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#3b82f6"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#3b82f6"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="colorContents"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#f97316"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#f97316"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="hsl(var(--border))"
                                        />
                                        <XAxis
                                            dataKey="day"
                                            tick={{
                                                fill: 'hsl(var(--muted-foreground))',
                                            }}
                                            axisLine={{
                                                stroke: 'hsl(var(--border))',
                                            }}
                                        />
                                        <YAxis
                                            tick={{
                                                fill: 'hsl(var(--muted-foreground))',
                                            }}
                                            axisLine={{
                                                stroke: 'hsl(var(--border))',
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="departures"
                                            fill="url(#colorDeparturesWeekly)"
                                            name="Jadwal"
                                            radius={[8, 8, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="contents"
                                            fill="url(#colorContents)"
                                            name="Konten"
                                            radius={[8, 8, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
