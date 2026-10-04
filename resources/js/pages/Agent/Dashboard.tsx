import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AgentLayout from '@/layouts/agent-layout';
import { formatDate } from '@/lib/date-format';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    ChartNoAxesCombined,
    HandCoins,
    Hourglass,
    MousePointerClick,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { PageIntro, ReferralShare, StatusBadge } from './components/PortalUi';
import type {
    AgentBooking,
    AgentLead,
    CommissionSummary,
    CurrencyTotal,
} from './types';
import { money } from './types';

const totals = (
    rows: CommissionSummary[] | CurrencyTotal[],
    field: 'amount' | 'pending' | 'approved' | 'paid',
) =>
    rows.length
        ? rows
              .map((row) => {
                  const value =
                      field === 'amount'
                          ? (row as CurrencyTotal).amount
                          : (row as CommissionSummary)[field];
                  return money(value, row.currency);
              })
              .join(' / ')
        : money(0);

export default function Dashboard({
    agent,
    summary,
    recentLeads,
    recentBookings,
}: {
    agent: {
        name: string;
        referral_code: string;
        referral_url: string;
        qr_url: string;
    };
    summary: {
        pending_leads: number;
        referral_clicks: number;
        unique_visitors: number;
        total_bookings: number;
        total_pax: number;
        conversion_rate: number;
        payout_profile_complete: boolean;
        revenue_by_currency: CurrencyTotal[];
        commissions_by_currency: CommissionSummary[];
    };
    recentLeads: AgentLead[];
    recentBookings: AgentBooking[];
}) {
    const commissionCards = [
        {
            label: 'Menunggu Verifikasi',
            value: totals(summary.commissions_by_currency, 'pending'),
            icon: Hourglass,
            color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
            border: 'border-amber-200/80 dark:border-amber-900/50',
        },
        {
            label: 'Siap Dicairkan',
            value: totals(summary.commissions_by_currency, 'approved'),
            icon: HandCoins,
            color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
            border: 'border-sky-200/80 dark:border-sky-900/50',
        },
        {
            label: 'Sudah Dibayar',
            value: totals(summary.commissions_by_currency, 'paid'),
            icon: BadgeCheck,
            color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
            border: 'border-emerald-200/80 dark:border-emerald-900/50',
        },
    ];

    const referralMetrics = [
        {
            label: 'Total Booking',
            value: summary.total_bookings,
            icon: BadgeCheck,
        },
        {
            label: 'Total Jamaah',
            value: `${summary.total_pax} pax`,
            icon: WalletCards,
        },
        { label: 'Lead Aktif', value: summary.pending_leads, icon: UsersRound },
        {
            label: 'Pengunjung Unik',
            value: summary.unique_visitors,
            icon: UsersRound,
        },
        {
            label: 'Klik Link',
            value: summary.referral_clicks,
            icon: MousePointerClick,
        },
        {
            label: 'Tingkat Konversi',
            value: `${summary.conversion_rate}%`,
            icon: ChartNoAxesCombined,
        },
    ];

    return (
        <AgentLayout title="Dashboard Agen">
            <Head title="Portal Agen" />
            <PageIntro
                title={`Halo, ${agent.name}`}
                action={
                    <Button asChild>
                        <Link href="/agent/packages">
                            Katalog Paket <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                }
            />

            <section className="mt-5 overflow-hidden rounded-2xl bg-[#0d5c52] p-5 text-white shadow-lg sm:p-6">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="min-w-0">
                        <span className="text-[11px] font-bold tracking-[0.16em] text-emerald-200 uppercase">
                            Link Referral Anda
                        </span>
                        <p className="mt-1 font-mono text-sm break-all text-white/90">
                            {agent.referral_url}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="rounded-lg bg-white/15 px-3 py-1 font-mono text-lg font-black tracking-wider text-white">
                                {agent.referral_code}
                            </span>
                            {summary.revenue_by_currency.length > 0 && (
                                <span className="text-xs text-emerald-100/90">
                                    Omzet booking aktif:{' '}
                                    <strong className="font-semibold text-white">
                                        {totals(
                                            summary.revenue_by_currency,
                                            'amount',
                                        )}
                                    </strong>
                                </span>
                            )}
                        </div>
                    </div>
                    <ReferralShare
                        url={agent.referral_url}
                        qrUrl={agent.qr_url}
                    />
                </div>
            </section>

            {!summary.payout_profile_complete && (
                <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800/80 dark:bg-amber-950/30 dark:text-amber-100">
                    <div>
                        <p className="text-sm font-semibold">
                            Rekening Bank Belum Lengkap
                        </p>
                        <p className="text-xs text-amber-800/90 dark:text-amber-200/80">
                            Lengkapi nomor rekening bank untuk mempercepat
                            pencairan komisi Anda.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/agent/account">Lengkapi Rekening</Link>
                    </Button>
                </section>
            )}

            <div className="mt-6">
                <h2 className="text-sm font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400">
                    Ringkasan Komisi
                </h2>
                <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
                    {commissionCards.map(
                        ({ label, value, icon: Icon, color, border }) => (
                            <Card
                                key={label}
                                className={`border ${border} bg-card shadow-xs transition-shadow hover:shadow-sm`}
                            >
                                <CardContent className="flex items-center gap-3.5 p-4">
                                    <span
                                        className={`rounded-xl p-2.5 ${color}`}
                                    >
                                        <Icon className="size-5" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-xs font-medium text-muted-foreground">
                                            {label}
                                        </span>
                                        <span className="mt-0.5 block text-lg font-bold break-words text-foreground">
                                            {value}
                                        </span>
                                    </span>
                                </CardContent>
                            </Card>
                        ),
                    )}
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-sm font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400">
                    Statistik Referral
                </h2>
                <div className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {referralMetrics.map(({ label, value, icon: Icon }) => (
                        <Card
                            key={label}
                            className="border-slate-200/80 bg-card shadow-xs dark:border-slate-800"
                        >
                            <CardContent className="p-3.5">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="text-xs">{label}</span>
                                    <Icon className="size-3.5" />
                                </div>
                                <p className="mt-1.5 text-base font-bold text-foreground">
                                    {value}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <section className="mt-5 grid gap-4 xl:grid-cols-2">
                <ActivityCard
                    title="Lead terbaru"
                    href="/agent/leads"
                    empty="Belum ada lead referral."
                >
                    {recentLeads.map((lead) => (
                        <div
                            key={lead.id}
                            className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-700"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-semibold">
                                    {lead.customer_name}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                    {lead.reference} · {lead.package_name} ·{' '}
                                    {formatDate(lead.created_at)}
                                </p>
                            </div>
                            <StatusBadge status={lead.status} />
                        </div>
                    ))}
                </ActivityCard>
                <ActivityCard
                    title="Booking terbaru"
                    href="/agent/bookings"
                    empty="Belum ada booking referral."
                >
                    {recentBookings.map((booking) => (
                        <Link
                            key={booking.id}
                            href={booking.detail_url}
                            className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-slate-700"
                        >
                            <div className="min-w-0">
                                <p className="truncate font-semibold">
                                    {booking.customer_name}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                    {booking.booking_code} ·{' '}
                                    {booking.package_name}
                                </p>
                            </div>
                            <StatusBadge status={booking.booking_status} />
                        </Link>
                    ))}
                </ActivityCard>
            </section>
        </AgentLayout>
    );
}

function ActivityCard({
    title,
    href,
    empty,
    children,
}: {
    title: string;
    href: string;
    empty: string;
    children: ReactNode;
}) {
    const hasItems = Array.isArray(children)
        ? children.length > 0
        : Boolean(children);
    return (
        <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold">{title}</h2>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={href}>
                            Lihat semua <ArrowRight />
                        </Link>
                    </Button>
                </div>
                <div className="mt-2">
                    {hasItems ? (
                        children
                    ) : (
                        <p className="py-8 text-center text-sm text-slate-500">
                            {empty}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
