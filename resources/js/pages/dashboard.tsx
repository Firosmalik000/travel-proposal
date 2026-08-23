import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatDateWithDay, formatTime } from '@/lib/date-format';
import { handleApiError } from '@/lib/notifications';
import { dashboard } from '@/routes';
import {
    birthdays,
    departmentDistribution,
    monthlyGrowth,
    pendingTasks as pendingTasksRoute,
    recentActivity as recentActivityRoute,
    stats as statsRoute,
    systemStatus as systemStatusRoute,
    weeklyActivity,
} from '@/routes/dashboard';
import { index as menusIndex } from '@/routes/menus';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    Activity,
    CalendarDays,
    CircleDollarSign,
    Clock3,
    FolderTree,
    Globe2,
    Layers3,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    type ComponentType,
    type ReactNode,
    useCallback,
    useEffect,
    useState,
} from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
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
    { title: 'Dashboard', href: dashboard().url },
];

interface Stats {
    totalUsers: { value: number; growth: number; description: string };
    upcomingDepartures: { value: number; description: string };
    estimatedRevenue: { value: number; currency: string; description: string };
    publicVisitors: { value: number; description: string };
    landingVisitors: { value: number; description: string };
}
interface VisitData {
    day: string;
    public_visits: number;
    landing_visits: number;
}
interface GrowthData {
    month: string;
    users: number;
    departures: number;
}
interface DistributionData extends Record<string, unknown> {
    name: string;
    value: number;
    color: string;
}
interface DepartureData {
    title: string;
    departure_date: string;
    departure_city: string;
    seats_available: number;
}
interface ActivityData {
    text: string;
    color: string;
}
interface TaskData {
    label: string;
    value: number;
    color: string;
}
interface StatusData {
    label: string;
    status: string;
    color: string;
}
interface TooltipItem {
    name?: string;
    value?: number | string;
    color?: string;
}

const periods = [
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' },
    { value: 'yearly', label: 'Tahunan' },
] as const;

const quickActions = [
    { title: 'Menu', href: menusIndex().url, icon: FolderTree },
    { title: 'Roles', href: '/admin/administrator/roles', icon: ShieldCheck },
    { title: 'Users', href: '/admin/administrator/users', icon: Users },
];

function formatCurrency(amount: number, currency = 'IDR'): string {
    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(Number.isFinite(amount) ? amount : 0);
    } catch {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    }
}

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: TooltipItem[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="min-w-36 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
            <p className="mb-2 text-xs font-bold text-slate-500">{label}</p>
            {payload.map((item) => (
                <div
                    key={item.name}
                    className="flex items-center justify-between gap-5 text-xs"
                >
                    <span className="flex items-center gap-2 text-slate-500">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                    </span>
                    <strong className="text-slate-950 dark:text-white">
                        {item.value ?? 0}
                    </strong>
                </div>
            ))}
        </div>
    );
}

function Panel({
    title,
    meta,
    icon: Icon,
    children,
    className = '',
}: {
    title: string;
    meta: string;
    icon: ComponentType<{ className?: string }>;
    children: ReactNode;
    className?: string;
}) {
    return (
        <article
            className={`rounded-3xl bg-white p-5 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.32)] ring-1 ring-slate-200/70 sm:p-6 dark:bg-slate-900 dark:ring-slate-800 ${className}`}
        >
            <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                    <h2 className="truncate font-bold text-slate-950 dark:text-white">
                        {title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {meta}
                    </p>
                </div>
            </div>
            {children}
        </article>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="grid h-full min-h-28 place-items-center rounded-2xl bg-slate-50 text-xs font-semibold text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            {label}
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [visits, setVisits] = useState<VisitData[]>([]);
    const [growth, setGrowth] = useState<GrowthData[]>([]);
    const [distribution, setDistribution] = useState<DistributionData[]>([]);
    const [departures, setDepartures] = useState<DepartureData[]>([]);
    const [activities, setActivities] = useState<ActivityData[]>([]);
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [statuses, setStatuses] = useState<StatusData[]>([]);
    const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>(
        'weekly',
    );
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

    const loadDashboard = useCallback(
        async (refresh = false) => {
            if (refresh) setRefreshing(true);
            try {
                const responses = await Promise.all([
                    axios.get(statsRoute().url),
                    axios.get(weeklyActivity({ query: { period } }).url),
                    axios.get(monthlyGrowth().url),
                    axios.get(departmentDistribution().url),
                    axios.get(birthdays().url),
                    axios.get(recentActivityRoute().url),
                    axios.get(pendingTasksRoute().url),
                    axios.get(systemStatusRoute().url),
                ]);
                const data = responses.map(
                    (response) => response.data.data || response.data,
                );
                setStats(data[0]);
                setVisits(data[1]);
                setGrowth(data[2]);
                setDistribution(data[3]);
                setDepartures(data[4]);
                setActivities(data[5]);
                setTasks(data[6]);
                setStatuses(data[7]);
                setUpdatedAt(new Date());
            } catch (error) {
                handleApiError(error);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [period],
    );

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </span>
                        <p className="text-sm font-bold">
                            Menyiapkan dashboard
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const cards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers.value ?? 0,
            meta: `${stats?.totalUsers.growth ?? 0}% bulan ini`,
            icon: Users,
            tone: 'from-cyan-50 to-white dark:from-cyan-950/35 dark:to-slate-900',
            accent: 'text-cyan-700 dark:text-cyan-300',
        },
        {
            title: 'Keberangkatan',
            value: stats?.upcomingDepartures.value ?? 0,
            meta: 'Paket mendatang',
            icon: CalendarDays,
            tone: 'from-amber-50 to-white dark:from-amber-950/35 dark:to-slate-900',
            accent: 'text-amber-700 dark:text-amber-300',
        },
        {
            title: 'Pengunjung Public',
            value: stats?.publicVisitors.value ?? 0,
            meta: 'Hari ini',
            icon: Globe2,
            tone: 'from-blue-50 to-white dark:from-blue-950/35 dark:to-slate-900',
            accent: 'text-blue-700 dark:text-blue-300',
        },
        {
            title: 'Pengunjung Landing',
            value: stats?.landingVisitors.value ?? 0,
            meta: 'Hari ini',
            icon: Sparkles,
            tone: 'from-rose-50 to-white dark:from-rose-950/35 dark:to-slate-900',
            accent: 'text-rose-700 dark:text-rose-300',
        },
    ];
    const healthy = statuses.every((status) => status.color === 'green');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <main className="relative min-h-full overflow-hidden bg-[#f6f8fb] dark:bg-[#0f131a]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_8%_10%,rgba(200,0,18,0.08),transparent_28%),radial-gradient(circle_at_85%_5%,rgba(15,118,110,0.08),transparent_24%)]" />
                <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-3 sm:p-4 md:gap-6 md:p-6 xl:p-8">
                    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-primary uppercase">
                                <span className="h-px w-7 bg-primary" /> Command
                                center
                            </p>
                            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
                                Dashboard
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {formatDateWithDay(new Date())}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.title}
                                        href={action.href}
                                        className="hidden h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:text-primary sm:flex dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800"
                                    >
                                        <Icon className="h-4 w-4" />{' '}
                                        {action.title}
                                    </Link>
                                );
                            })}
                            <Button
                                className="h-10 rounded-xl px-4 shadow-lg shadow-primary/15"
                                disabled={refreshing}
                                onClick={() => void loadDashboard(true)}
                            >
                                {refreshing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                                Refresh
                            </Button>
                        </div>
                    </header>

                    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <article
                                    key={card.title}
                                    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.tone} p-5 shadow-[0_12px_35px_-22px_rgba(15,23,42,0.36)] ring-1 ring-slate-200/70 transition hover:-translate-y-1 dark:ring-slate-800`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                                {card.title}
                                            </p>
                                            <p className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">
                                                {card.value.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </p>
                                            <p
                                                className={`mt-2 text-xs font-bold ${card.accent}`}
                                            >
                                                {card.meta}
                                            </p>
                                        </div>
                                        <span
                                            className={`grid h-11 w-11 place-items-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 dark:bg-white/10 ${card.accent}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.7fr)]">
                        <Panel
                            title="Kunjungan Website"
                            meta="Public dan landing"
                            icon={Activity}
                            className="overflow-hidden"
                        >
                            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                                <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                                    {periods.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                setPeriod(option.value)
                                            }
                                            className={`rounded-lg px-3 py-2 text-[11px] font-bold transition sm:text-xs ${period === option.value ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-2 h-[300px] sm:h-[350px]">
                                {visits.length ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <AreaChart
                                            data={visits}
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: -22,
                                                bottom: 0,
                                            }}
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="publicFill"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="#2563eb"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="#2563eb"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="landingFill"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="#e11d48"
                                                        stopOpacity={0.25}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="#e11d48"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid
                                                vertical={false}
                                                stroke="#94a3b8"
                                                strokeOpacity={0.18}
                                            />
                                            <XAxis
                                                dataKey="day"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: '#64748b',
                                                    fontSize: 11,
                                                }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                                tick={{
                                                    fill: '#64748b',
                                                    fontSize: 11,
                                                }}
                                            />
                                            <Tooltip
                                                content={<ChartTooltip />}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="public_visits"
                                                name="Public"
                                                stroke="#2563eb"
                                                strokeWidth={3}
                                                fill="url(#publicFill)"
                                                dot={false}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="landing_visits"
                                                name="Landing"
                                                stroke="#e11d48"
                                                strokeWidth={3}
                                                fill="url(#landingFill)"
                                                dot={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyState label="Data kunjungan belum tersedia" />
                                )}
                            </div>
                            <div className="flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                <span className="flex items-center gap-2">
                                    <i className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                    Public
                                </span>
                                <span className="flex items-center gap-2">
                                    <i className="h-2.5 w-2.5 rounded-full bg-rose-600" />
                                    Landing
                                </span>
                                <span className="ml-auto flex items-center gap-1.5">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {updatedAt
                                        ? formatTime(updatedAt)
                                        : '--:--'}
                                </span>
                            </div>
                        </Panel>

                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                            <article className="relative overflow-hidden rounded-3xl bg-[#171c2b] p-6 text-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.65)] dark:bg-black">
                                <div className="absolute top-0 right-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-primary/35 blur-3xl" />
                                <div className="relative">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold tracking-[0.16em] text-white/55 uppercase">
                                            Estimasi revenue
                                        </p>
                                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-amber-300 ring-1 ring-white/10">
                                            <CircleDollarSign className="h-5 w-5" />
                                        </span>
                                    </div>
                                    <p className="mt-8 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                                        {formatCurrency(
                                            stats?.estimatedRevenue.value ?? 0,
                                            stats?.estimatedRevenue.currency,
                                        )}
                                    </p>
                                    <p className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-300">
                                        <TrendingUp className="h-4 w-4" />
                                        Booking registered
                                    </p>
                                </div>
                            </article>
                            <Panel
                                title={
                                    healthy
                                        ? 'Semua berjalan normal'
                                        : 'Perlu perhatian'
                                }
                                meta="System health"
                                icon={ShieldCheck}
                            >
                                <div className="mt-5 grid gap-2">
                                    {statuses.map((status) => (
                                        <div
                                            key={status.label}
                                            className="flex justify-between py-1.5 text-sm"
                                        >
                                            <span className="text-slate-500 dark:text-slate-400">
                                                {status.label}
                                            </span>
                                            <strong
                                                className={
                                                    status.color === 'green'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-rose-600'
                                                }
                                            >
                                                {status.status}
                                            </strong>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        </div>
                    </section>

                    <section className="grid gap-5 lg:grid-cols-2">
                        <Panel
                            title="Pertumbuhan Data"
                            meta="6 bulan terakhir"
                            icon={TrendingUp}
                        >
                            <div className="mt-4 h-[300px]">
                                {growth.length ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <LineChart
                                            data={growth}
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: -22,
                                            }}
                                        >
                                            <CartesianGrid
                                                vertical={false}
                                                stroke="#94a3b8"
                                                strokeOpacity={0.18}
                                            />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: '#64748b',
                                                    fontSize: 11,
                                                }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                                tick={{
                                                    fill: '#64748b',
                                                    fontSize: 11,
                                                }}
                                            />
                                            <Tooltip
                                                content={<ChartTooltip />}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="users"
                                                name="Users"
                                                stroke="#0f766e"
                                                strokeWidth={3}
                                                dot={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="departures"
                                                name="Keberangkatan"
                                                stroke="#f59e0b"
                                                strokeWidth={3}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyState label="Data pertumbuhan belum tersedia" />
                                )}
                            </div>
                        </Panel>
                        <Panel
                            title="Distribusi Paket"
                            meta="Paket aktif"
                            icon={Layers3}
                        >
                            <div className="mt-4 grid h-[300px] items-center sm:grid-cols-[minmax(0,1fr)_170px]">
                                {distribution.some((item) => item.value > 0) ? (
                                    <>
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={distribution}
                                                    innerRadius={65}
                                                    outerRadius={98}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {distribution.map(
                                                        (item) => (
                                                            <Cell
                                                                key={item.name}
                                                                fill={
                                                                    item.color
                                                                }
                                                            />
                                                        ),
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    content={<ChartTooltip />}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="hidden gap-3 sm:grid">
                                            {distribution.map((item) => (
                                                <div
                                                    key={item.name}
                                                    className="flex justify-between gap-3 text-xs"
                                                >
                                                    <span className="flex items-center gap-2 truncate text-slate-500">
                                                        <i
                                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    item.color,
                                                            }}
                                                        />
                                                        {item.name}
                                                    </span>
                                                    <strong>
                                                        {item.value}
                                                    </strong>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="sm:col-span-2">
                                        <EmptyState label="Data paket belum tersedia" />
                                    </div>
                                )}
                            </div>
                        </Panel>
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)_minmax(280px,0.8fr)]">
                        <Panel
                            title="Keberangkatan Terdekat"
                            meta={`${departures.length} jadwal`}
                            icon={CalendarDays}
                        >
                            <div className="mt-5 grid gap-2.5">
                                {departures.length ? (
                                    departures.map((departure) => (
                                        <div
                                            key={`${departure.title}-${departure.departure_date}`}
                                            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60"
                                        >
                                            <Avatar className="h-10 w-10 rounded-xl">
                                                <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-bold text-primary">
                                                    {departure.title
                                                        .split(' ')
                                                        .slice(0, 2)
                                                        .map((part) => part[0])
                                                        .join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold">
                                                    {departure.title}
                                                </p>
                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                    {departure.departure_city ||
                                                        'Kota belum diatur'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold">
                                                    {formatDate(
                                                        departure.departure_date,
                                                    )}
                                                </p>
                                                <p
                                                    className={`mt-1 text-[11px] font-bold ${departure.seats_available <= 10 ? 'text-rose-600' : 'text-emerald-600'}`}
                                                >
                                                    {departure.seats_available}{' '}
                                                    seat
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState label="Belum ada keberangkatan terdekat" />
                                )}
                            </div>
                        </Panel>
                        <Panel
                            title="Perlu Ditangani"
                            meta="Tugas pending"
                            icon={Clock3}
                        >
                            <div className="mt-5 grid gap-2">
                                {tasks.length ? (
                                    tasks.map((task) => (
                                        <div
                                            key={task.label}
                                            className="flex items-center justify-between gap-3 py-2.5"
                                        >
                                            <span className="flex min-w-0 items-center gap-3 truncate text-sm text-slate-600 dark:text-slate-300">
                                                <i
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            task.color,
                                                    }}
                                                />
                                                {task.label}
                                            </span>
                                            <Badge className="rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200">
                                                {task.value}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState label="Tidak ada tugas pending" />
                                )}
                            </div>
                        </Panel>
                        <Panel
                            title="Aktivitas Terbaru"
                            meta="Live update"
                            icon={Activity}
                        >
                            <div className="mt-5 grid gap-4">
                                {activities.length ? (
                                    activities.map((activity) => (
                                        <div
                                            key={activity.text}
                                            className="flex items-start gap-3"
                                        >
                                            <i
                                                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-slate-100 dark:ring-slate-800"
                                                style={{
                                                    backgroundColor:
                                                        activity.color,
                                                }}
                                            />
                                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                {activity.text}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState label="Belum ada aktivitas terbaru" />
                                )}
                            </div>
                        </Panel>
                    </section>

                    <section className="grid grid-cols-3 gap-2 sm:hidden">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-[11px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"
                                >
                                    <Icon className="h-4 w-4 text-primary" />
                                    {action.title}
                                </Link>
                            );
                        })}
                    </section>
                </div>
            </main>
        </AppLayout>
    );
}
