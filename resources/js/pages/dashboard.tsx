import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
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
    Building2,
    Cake,
    Clock,
    FolderTree,
    Globe2,
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
    publicVisitors: { value: number; description: string };
    landingVisitors: { value: number; description: string };
}

interface WeeklyActivityData {
    day: string;
    public_visits: number;
    landing_visits: number;
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

function formatCompactNumber(value: number): string {
    if (!Number.isFinite(value)) {
        return '0';
    }

    return new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

export default function Dashboard() {
    const isMobile = useIsMobile();
    const [stats, setStats] = useState<Stats | null>(null);
    const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityData[]>(
        [],
    );
    const [monthlyGrowth, setMonthlyGrowth] = useState<MonthlyGrowthData[]>([]);
    const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
    const [visitPeriod, setVisitPeriod] = useState<
        'weekly' | 'monthly' | 'yearly'
    >('weekly');
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
                    weeklyRes,
                    monthlyRes,
                    deptRes,
                    birthdaysRes,
                    recentRes,
                    pendingRes,
                    statusRes,
                ] = await Promise.all([
                    axios.get(dashboardStats().url),
                    axios.get(
                        dashboardWeeklyActivity({
                            query: { period: visitPeriod },
                        }).url,
                    ),
                    axios.get(dashboardMonthlyGrowth().url),
                    axios.get(dashboardDepartmentDistribution().url),
                    axios.get(dashboardBirthdays().url),
                    axios.get(dashboardRecentActivity().url),
                    axios.get(dashboardPendingTasks().url),
                    axios.get(dashboardSystemStatus().url),
                ]);

                // Extract data from success response
                setStats(statsRes.data.data || statsRes.data);
                setWeeklyActivity(weeklyRes.data.data || weeklyRes.data);
                setMonthlyGrowth(monthlyRes.data.data || monthlyRes.data);
                setDepartmentData(deptRes.data.data || deptRes.data);
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
    }, [visitPeriod]);

    const refreshDashboard = async () => {
        setRefreshing(true);
        try {
            const [
                statsRes,
                weeklyRes,
                monthlyRes,
                deptRes,
                birthdaysRes,
                recentRes,
                pendingRes,
                statusRes,
            ] = await Promise.all([
                axios.get(dashboardStats().url),
                axios.get(
                    dashboardWeeklyActivity({
                        query: { period: visitPeriod },
                    }).url,
                ),
                axios.get(dashboardMonthlyGrowth().url),
                axios.get(dashboardDepartmentDistribution().url),
                axios.get(dashboardBirthdays().url),
                axios.get(dashboardRecentActivity().url),
                axios.get(dashboardPendingTasks().url),
                axios.get(dashboardSystemStatus().url),
            ]);

            setStats(statsRes.data.data || statsRes.data);
            setWeeklyActivity(weeklyRes.data.data || weeklyRes.data);
            setMonthlyGrowth(monthlyRes.data.data || monthlyRes.data);
            setDepartmentData(deptRes.data.data || deptRes.data);
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
            tone: 'from-emerald-500/10 to-teal-500/5',
        },
        {
            title: 'Jadwal Berangkat',
            value: stats?.upcomingDepartures.value || 0,
            description: stats?.upcomingDepartures.description || 'Loading...',
            icon: Building2,
            trend: 'stable',
            color: statPalette[2],
            tone: 'from-amber-500/10 to-orange-500/5',
        },
        {
            title: 'Pengunjung Public',
            value: stats?.publicVisitors.value || 0,
            description: stats?.publicVisitors.description || 'Loading...',
            icon: Globe2,
            trend: 'up',
            color: '#0f766e',
            tone: 'from-blue-500/10 to-cyan-500/5',
        },
        {
            title: 'Pengunjung Landing',
            value: stats?.landingVisitors.value || 0,
            description: stats?.landingVisitors.description || 'Loading...',
            icon: Globe2,
            trend: 'up',
            color: '#1d4ed8',
            tone: 'from-violet-500/10 to-indigo-500/5',
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

    const chartContainerClassName = isMobile
        ? 'w-full overflow-x-auto [&_.recharts-wrapper]:min-w-[540px]'
        : 'w-full overflow-x-auto [&_.recharts-wrapper]:min-w-[620px]';
    const hasWeeklyActivityData = weeklyActivity.length > 0;
    const hasMonthlyGrowthData = monthlyGrowth.length > 0;
    const hasDepartmentData =
        departmentData.length > 0 &&
        departmentData.some((item) => Number(item.value) > 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="h-full w-full">
                <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-4 p-4 md:p-6">
                    {/* Header */}
                    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    Dashboard
                                </h1>
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
                    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm">
                        <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                    Estimasi Revenue
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
                                    {formatCurrency(
                                        stats?.estimatedRevenue.value ?? 0,
                                        stats?.estimatedRevenue.currency ??
                                            'IDR',
                                    )}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {stats?.estimatedRevenue.description ??
                                        'Estimasi dari booking registered.'}
                                </p>
                            </div>
                            <Badge variant="secondary" className="w-fit">
                                {formatCompactNumber(
                                    stats?.estimatedRevenue.value ?? 0,
                                )}
                            </Badge>
                        </CardContent>
                    </Card>

                    <div className="order-4 grid gap-3 sm:grid-cols-3">
                        {[
                            {
                                title: 'Menu Management',
                                href: menusIndex().url,
                                icon: FolderTree,
                            },
                            {
                                title: 'Role Management',
                                href: '/admin/administrator/roles',
                                icon: Shield,
                            },
                            {
                                title: 'User Management',
                                href: '/admin/administrator/users',
                                icon: Users,
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="group rounded-xl border border-border/60 bg-card p-3 shadow-sm transition hover:border-primary/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                                            {item.title}
                                        </p>
                                        <Icon className="h-4 w-4 text-primary" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Stats Cards */}
                    <div className="order-1 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Card
                                    key={index}
                                    className={`rounded-2xl border border-border/60 bg-gradient-to-br ${stat.tone} shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md`}
                                    style={{ borderLeftColor: stat.color }}
                                >
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-semibold text-muted-foreground">
                                            {stat.title}
                                        </CardTitle>
                                        <div
                                            className="rounded-xl p-2 ring-1 ring-white/40"
                                            style={{
                                                backgroundColor: `${stat.color}22`,
                                            }}
                                        >
                                            <Icon
                                                className="h-5 w-5"
                                                style={{ color: stat.color }}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between gap-3">
                                            <div
                                                className="text-3xl font-bold tracking-tight"
                                                style={{ color: stat.color }}
                                            >
                                                {stat.value}
                                            </div>
                                            <div className="rounded-full border border-border/60 bg-muted/40 p-1.5">
                                                {getTrendIcon(stat.trend)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Birthday Card */}
                    <div className="order-5 grid grid-cols-1">
                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                                    <Cake className="h-6 w-6 text-primary" />
                                    Keberangkatan Terdekat
                                </CardTitle>
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
                                                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3 sm:items-center"
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
                                                    <div className="min-w-0 space-y-1">
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
                    <div className="order-6 grid gap-4 lg:grid-cols-3">
                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">
                                    Status Sistem
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {systemStatus.length > 0 ? (
                                        systemStatus.map((item) => (
                                            <div
                                                key={item.label}
                                                className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3"
                                            >
                                                <p className="min-w-0 text-sm font-medium text-foreground">
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
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {pendingTasks.length > 0 ? (
                                        pendingTasks.map((task) => (
                                            <div
                                                key={task.label}
                                                className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                task.color,
                                                        }}
                                                    />
                                                    <p className="min-w-0 text-sm font-medium text-foreground">
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

                    {/* Charts Kunjungan */}
                    <div className="order-2 grid gap-6">
                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                            <CardHeader>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground sm:text-xl">
                                        <div
                                            className="h-2 w-2 rounded-full"
                                            style={{
                                                backgroundColor: '#3b82f6',
                                            }}
                                        ></div>
                                        Kunjungan Website
                                    </CardTitle>
                                    <div className="flex items-center rounded-lg border border-border/60 p-1">
                                        {[
                                            {
                                                value: 'weekly',
                                                label: 'Mingguan',
                                            },
                                            {
                                                value: 'monthly',
                                                label: 'Bulanan',
                                            },
                                            {
                                                value: 'yearly',
                                                label: 'Tahunan',
                                            },
                                        ].map((period) => (
                                            <Button
                                                key={period.value}
                                                type="button"
                                                variant={
                                                    visitPeriod === period.value
                                                        ? 'default'
                                                        : 'ghost'
                                                }
                                                size="sm"
                                                className="h-8 rounded-md px-3 text-xs"
                                                onClick={() =>
                                                    setVisitPeriod(
                                                        period.value as
                                                            | 'weekly'
                                                            | 'monthly'
                                                            | 'yearly',
                                                    )
                                                }
                                            >
                                                {period.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {hasWeeklyActivityData ? (
                                    <div className={chartContainerClassName}>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <LineChart data={weeklyActivity}>
                                                <defs>
                                                    <linearGradient
                                                        id="colorPublicLine"
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
                                                        id="colorLandingLine"
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
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                />
                                                {!isMobile ? <Legend /> : null}
                                                <Line
                                                    type="monotone"
                                                    dataKey="public_visits"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    name="Public"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                    fillOpacity={1}
                                                    fill="url(#colorPublicLine)"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="landing_visits"
                                                    stroke="#f97316"
                                                    strokeWidth={3}
                                                    name="Landing"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                    fillOpacity={1}
                                                    fill="url(#colorLandingLine)"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                                        Data kunjungan belum tersedia.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="order-3 grid gap-6 md:grid-cols-2">
                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground sm:text-xl">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: '#3b82f6' }}
                                    ></div>
                                    Pertumbuhan Data
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hasMonthlyGrowthData ? (
                                    <div className={chartContainerClassName}>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <LineChart data={monthlyGrowth}>
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
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                />
                                                {!isMobile ? <Legend /> : null}
                                                <Line
                                                    type="monotone"
                                                    dataKey="users"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    name="Total Users"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="departures"
                                                    stroke="#f97316"
                                                    strokeWidth={3}
                                                    name="Keberangkatan"
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                                        Data pertumbuhan belum tersedia.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border bg-card shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground sm:text-xl">
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: '#3b82f6' }}
                                    ></div>
                                    Distribusi Paket
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hasDepartmentData ? (
                                    <div className={chartContainerClassName}>
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={departmentData as any}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={
                                                        isMobile
                                                            ? false
                                                            : ({
                                                                  name,
                                                                  percent,
                                                              }) =>
                                                                  `${String(name)}: ${(Number(percent) * 100).toFixed(0)}%`
                                                    }
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {departmentData.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-dept-${index}`}
                                                                fill={
                                                                    entry.color
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    content={<CustomTooltip />}
                                                />
                                                {!isMobile ? <Legend /> : null}
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                                        Data distribusi paket belum tersedia.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
