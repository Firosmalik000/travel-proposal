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
    const cards = [
        {
            label: 'Klik referral',
            value: summary.referral_clicks,
            icon: MousePointerClick,
        },
        {
            label: 'Visitor unik',
            value: summary.unique_visitors,
            icon: UsersRound,
        },
        { label: 'Lead aktif', value: summary.pending_leads, icon: UsersRound },
        { label: 'Booking', value: summary.total_bookings, icon: BadgeCheck },
        {
            label: 'Total jamaah',
            value: `${summary.total_pax} pax`,
            icon: WalletCards,
        },
        {
            label: 'Konversi pipeline',
            value: `${summary.conversion_rate}%`,
            icon: ChartNoAxesCombined,
        },
        {
            label: 'Komisi pending',
            value: totals(summary.commissions_by_currency, 'pending'),
            icon: Hourglass,
        },
        {
            label: 'Siap dicairkan',
            value: totals(summary.commissions_by_currency, 'approved'),
            icon: HandCoins,
        },
        {
            label: 'Sudah dibayar',
            value: totals(summary.commissions_by_currency, 'paid'),
            icon: BadgeCheck,
        },
    ];

    return (
        <AgentLayout title="Dashboard Agent">
            <Head title="Portal Agent" />
            <PageIntro
                eyebrow="Agent Performance Center"
                title={`Selamat datang, ${agent.name}`}
                description="Pantau alur referral dari lead hingga komisi dibayar dalam satu ruang kerja."
                action={
                    <Button asChild>
                        <Link href="/agent/packages">
                            Promosikan Package <ArrowRight />
                        </Link>
                    </Button>
                }
            />

            <section className="mt-5 overflow-hidden rounded-[1.75rem] bg-[#0d5c52] p-5 text-white shadow-xl shadow-emerald-950/15 sm:p-7">
                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-100 uppercase">
                            Link referral utama
                        </p>
                        <p className="mt-2 font-mono text-sm break-all text-white/80">
                            {agent.referral_url}
                        </p>
                        <p className="mt-3 text-2xl font-black tracking-[0.12em]">
                            {agent.referral_code}
                        </p>
                    </div>
                    <ReferralShare
                        url={agent.referral_url}
                        qrUrl={agent.qr_url}
                    />
                </div>
            </section>

            {!summary.payout_profile_complete && (
                <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100">
                    <div>
                        <p className="font-semibold">
                            Lengkapi rekening payout
                        </p>
                        <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/80">
                            Data bank diperlukan agar komisi yang disetujui
                            dapat diproses tanpa penundaan.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/agent/account">Lengkapi sekarang</Link>
                    </Button>
                </section>
            )}

            <section className="mt-5 grid gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
                {cards.map(({ label, value, icon: Icon }) => (
                    <Card
                        key={label}
                        className="border-[#dfd3bf] bg-[#fffaf1]/90 shadow-sm dark:border-[#334155] dark:bg-[#202836]"
                    >
                        <CardContent className="flex items-center gap-3 p-4">
                            <span className="rounded-xl bg-[#ead8b8] p-2.5 text-[#74501d] dark:bg-amber-950/40 dark:text-amber-300">
                                <Icon className="size-5" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                    {label}
                                </span>
                                <span className="mt-0.5 block text-lg font-semibold break-words text-slate-900 dark:text-white">
                                    {value}
                                </span>
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </section>

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

            <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
                Omzet booking aktif:{' '}
                {totals(summary.revenue_by_currency, 'amount')}
            </p>
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
