import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { type BreadcrumbItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Activity, ArrowUpRight, Building2, Cake, Clock, FolderTree, Loader2, Minus, RefreshCw, Shield, TrendingDown, TrendingUp, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { handleApiError } from "@/lib/notifications";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Dashboard",
        href: dashboard().url,
    },
];

interface Stats {
    totalUsers: { value: number; growth: number; description: string };
    activeEmployees: { value: number; newThisMonth: number; description: string };
    departments: { value: number; description: string };
    todayActivity: { value: number; description: string };
}

interface MonthlyGrowthData {
    month: string;
    users: number;
    karyawan: number;
}

interface DepartmentData {
    name: string;
    value: number;
    color: string;
}

interface WeeklyActivityData {
    day: string;
    logins: number;
    documents: number;
}

interface BirthdayData {
    nama_lengkap: string;
    tanggal_lahir: string;
    foto?: string;
    foto_url?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {label}
                        </span>
                        <span className="font-bold text-muted-foreground">
                            {payload[0].name}
                        </span>
                        {payload[1] && <span className="font-bold text-muted-foreground">
                            {payload[1].name}
                        </span>}
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Value
                        </span>
                        <span className="font-bold">
                            {payload[0].value}
                        </span>
                        {payload[1] && <span className="font-bold">
                            {payload[1].value}
                        </span>}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [monthlyGrowth, setMonthlyGrowth] = useState<MonthlyGrowthData[]>([]);
    const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
    const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityData[]>([]);
    const [birthdays, setBirthdays] = useState<BirthdayData[]>([]);
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
                ] = await Promise.all([
                    axios.get('/api/dashboard/stats'),
                    axios.get('/api/dashboard/monthly-growth'),
                    axios.get('/api/dashboard/department-distribution'),
                    axios.get('/api/dashboard/weekly-activity'),
                    axios.get('/api/dashboard/birthdays'),
                ]);

                // Extract data from success response
                setStats(statsRes.data.data || statsRes.data);
                setMonthlyGrowth(monthlyRes.data.data || monthlyRes.data);
                setDepartmentData(deptRes.data.data || deptRes.data);
                setWeeklyActivity(weeklyRes.data.data || weeklyRes.data);
                setBirthdays(birthdaysRes.data.data || birthdaysRes.data);
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
            ] = await Promise.all([
                axios.get('/api/dashboard/stats'),
                axios.get('/api/dashboard/monthly-growth'),
                axios.get('/api/dashboard/department-distribution'),
                axios.get('/api/dashboard/weekly-activity'),
                axios.get('/api/dashboard/birthdays'),
            ]);

            setStats(statsRes.data.data || statsRes.data);
            setMonthlyGrowth(monthlyRes.data.data || monthlyRes.data);
            setDepartmentData(deptRes.data.data || deptRes.data);
            setWeeklyActivity(weeklyRes.data.data || weeklyRes.data);
            setBirthdays(birthdaysRes.data.data || birthdaysRes.data);
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
            title: "Total Users",
            value: stats?.totalUsers.value || 0,
            description: stats?.totalUsers.description || "Loading...",
            icon: Users,
            trend: stats?.totalUsers.growth ? (stats.totalUsers.growth > 0 ? "up" : stats.totalUsers.growth < 0 ? "down" : "stable") : "stable",
            color: statPalette[0],
        },
        {
            title: "Karyawan Aktif",
            value: stats?.activeEmployees.value || 0,
            description: stats?.activeEmployees.description || "Loading...",
            icon: UserCheck,
            trend: "up",
            color: statPalette[1],
        },
        {
            title: "Departemen",
            value: stats?.departments.value || 0,
            description: stats?.departments.description || "Loading...",
            icon: Building2,
            trend: "stable",
            color: statPalette[2],
        },
        {
            title: "Aktivitas Hari Ini",
            value: stats?.todayActivity.value || 0,
            description: stats?.todayActivity.description || "Loading...",
            icon: Activity,
            trend: "up",
            color: statPalette[3],
        },
    ];

    const getTrendIcon = (trend: string) => {
        if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600" />;
        if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" />;
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col items-center justify-center p-6">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <div className="text-lg font-medium text-muted-foreground">Loading dashboard...</div>
                        <div className="text-sm text-muted-foreground">Please wait while we fetch your data</div>
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
                    <div className="absolute right-[-20%] top-[-20%] h-96 w-96 rounded-full bg-[#dbe7ff] blur-3xl" />
                    <div className="absolute left-[-18%] bottom-[-15%] h-96 w-96 rounded-full bg-[#fdebcf] blur-3xl" />
                </div>

                <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="rounded-3xl border border-transparent bg-white p-6 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.25)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                Dashboard
                            </h1>
                            <p className="text-sm text-slate-500 sm:text-base">
                                Ringkasan kontrol akses, aktivitas tim, dan kesehatan sistem hari ini.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {lastUpdatedAt ? (
                                    <span>Update: {format(lastUpdatedAt, "HH:mm", { locale: id })}</span>
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
                                className="rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="rounded-3xl border border-transparent bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.22)]">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Toolkit Akses</CardTitle>
                            <CardDescription>Pintasan untuk konfigurasi utama.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    {
                                        title: "Menu Management",
                                        desc: "Susun navigasi dan struktur menu.",
                                        href: "/dashboard/administrator/menus",
                                        icon: FolderTree,
                                    },
                                    {
                                        title: "User Access",
                                        desc: "Atur peran dan izin akses user.",
                                        href: "/dashboard/administrator/user-access",
                                        icon: Shield,
                                    },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-[2px] hover:border-primary/30 hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                                                </div>
                                                <div className="rounded-full bg-primary/10 p-2 text-primary ring-1 ring-border/50">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-500">
                                                <span>Buka</span>
                                                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-transparent bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.22)] lg:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Fokus Hari Ini</CardTitle>
                            <CardDescription>Prioritas aktivitas operasional hari ini.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Aktivitas</p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">{stats?.todayActivity.value ?? 0}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Aktivitas tercatat hari ini.</p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Departemen</p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">{stats?.departments.value ?? 0}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Distribusi tim per unit.</p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Karyawan Aktif</p>
                                    <p className="mt-2 text-2xl font-semibold text-foreground">{stats?.activeEmployees.value ?? 0}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Status aktif saat ini.</p>
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
                                className="rounded-2xl border border-transparent bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg"
                                style={{ borderLeftColor: stat.color }}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-semibold text-card-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <div
                                        className="rounded-full p-2 ring-1 ring-border/50"
                                        style={{ backgroundColor: `${stat.color}14` }}
                                    >
                                        <Icon className="h-5 w-5" style={{ color: stat.color }} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-3xl font-bold" style={{ color: stat.color }}>
                                            {stat.value}
                                        </div>
                                        {getTrendIcon(stat.trend)}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {stat.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Birthday Card */}
                <div className="grid grid-cols-1">
                    <Card className="rounded-3xl border border-transparent bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                                <Cake className="h-6 w-6 text-primary" />
                                Ulang Tahun Bulan Ini
                            </CardTitle>
                            <CardDescription>
                                Karyawan yang merayakan ulang tahun di bulan {format(new Date(), "MMMM", { locale: id })}.
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
                                ) : birthdays.length > 0 ? (
                                    birthdays.map((karyawan, index) => (
                                        <div key={index} className="flex items-center">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={karyawan.foto_url || undefined} alt={karyawan.nama_lengkap} />
                                                <AvatarFallback>
                                                    {karyawan.nama_lengkap
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{karyawan.nama_lengkap}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(karyawan.tanggal_lahir), "dd MMMM", { locale: id })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Tidak ada karyawan yang berulang tahun bulan ini.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 1 */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Line Chart - User Growth */}
                    <Card className="rounded-3xl border border-transparent bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#3b82f6" }}></div>
                                Aktivitas User
                            </CardTitle>
                            <CardDescription>
                                Aktivitas user dan karyawan per bulan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyGrowth}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorKaryawan" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        axisLine={{ stroke: 'hsl(var(--border))' }}
                                    />
                                    <YAxis
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        axisLine={{ stroke: 'hsl(var(--border))' }}
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
                                        dataKey="karyawan"
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        name="Karyawan"
                                        dot={false}
                                        activeDot={{ r: 6 }}
                                        fillOpacity={1}
                                        fill="url(#colorKaryawan)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Pie Chart - Department Distribution */}
                    <Card className="rounded-3xl border border-transparent bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#3b82f6" }}></div>
                                Distribusi Tim
                            </CardTitle>
                            <CardDescription>
                                Sebaran karyawan per departemen
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={departmentData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                    >
                                        {departmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
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
                    <Card className="rounded-3xl border border-transparent bg-white shadow-[0_16px_40px_-30px_rgba(15,23,42,0.2)] transition-shadow duration-200 hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#3b82f6" }}></div>
                                Aktivitas Mingguan
                            </CardTitle>
                            <CardDescription>
                                Izin keluar dan dokumen yang diproses minggu ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={weeklyActivity}>
                                    <defs>
                                        <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorDocuments" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        axisLine={{ stroke: 'hsl(var(--border))' }}
                                    />
                                    <YAxis
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        axisLine={{ stroke: 'hsl(var(--border))' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey="logins"
                                        fill="url(#colorLogins)"
                                        name="Izin Keluar"
                                        radius={[8, 8, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="documents"
                                        fill="url(#colorDocuments)"
                                        name="Dokumen"
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
