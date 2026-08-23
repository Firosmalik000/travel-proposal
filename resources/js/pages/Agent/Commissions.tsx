import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AgentLayout from '@/layouts/agent-layout';
import { formatDate } from '@/lib/date-format';
import { Head } from '@inertiajs/react';
import { BadgeCheck, Download, HandCoins, Hourglass } from 'lucide-react';
import {
    PageIntro,
    PaginationLinks,
    RecordFilters,
    StatusBadge,
} from './components/PortalUi';
import type { CommissionSummary, Paginated, PortalFilters } from './types';
import { money } from './types';

type Commission = {
    id: number;
    booking_code: string | null;
    customer_name: string | null;
    package_name: string | null;
    passenger_count: number;
    fee_type: 'fixed' | 'percentage';
    fee_value: number;
    base_amount: number;
    commission_amount: number;
    currency: string;
    status: string;
    approved_at: string | null;
    paid_at: string | null;
    notes: string | null;
};

export default function Commissions({
    commissions,
    summary,
    filters,
}: {
    commissions: Paginated<Commission>;
    summary: CommissionSummary[];
    filters: PortalFilters;
}) {
    const total = (field: 'pending' | 'approved' | 'paid') =>
        summary.length
            ? summary.map((row) => money(row[field], row.currency)).join(' / ')
            : money(0);
    const cards = [
        {
            label: 'Menunggu verifikasi',
            value: total('pending'),
            icon: Hourglass,
        },
        { label: 'Siap dicairkan', value: total('approved'), icon: BadgeCheck },
        { label: 'Sudah dibayar', value: total('paid'), icon: HandCoins },
    ];
    const exportQuery = new URLSearchParams(
        Object.entries(filters).filter((entry): entry is [string, string] =>
            Boolean(entry[1]),
        ),
    ).toString();
    return (
        <AgentLayout title="Komisi Saya">
            <Head title="Komisi Saya" />
            <PageIntro
                eyebrow="Income Statement"
                title="Komisi Saya"
                description="Rekonsiliasi dasar perhitungan, status persetujuan, dan histori pembayaran komisi."
                action={
                    <Button variant="outline" asChild>
                        <a
                            href={`/agent/commissions/export${exportQuery ? `?${exportQuery}` : ''}`}
                        >
                            <Download /> Ekspor CSV
                        </a>
                    </Button>
                }
            />
            <section className="mt-5 grid gap-3 sm:grid-cols-3">
                {cards.map(({ label, value, icon: Icon }) => (
                    <Card
                        key={label}
                        className="border-[#dfd3bf] bg-[#fffaf1] dark:border-slate-700 dark:bg-slate-800"
                    >
                        <CardContent className="flex items-center gap-3 p-4">
                            <span className="rounded-xl bg-amber-100 p-2 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <Icon className="size-5" />
                            </span>
                            <span>
                                <span className="block text-xs text-slate-500">
                                    {label}
                                </span>
                                <span className="font-bold">{value}</span>
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </section>
            <div className="mt-4">
                <RecordFilters
                    route="/agent/commissions"
                    filters={filters}
                    statuses={[
                        { value: 'pending', label: 'Menunggu' },
                        { value: 'approved', label: 'Disetujui' },
                        { value: 'paid', label: 'Dibayar' },
                        { value: 'cancelled', label: 'Dibatalkan' },
                    ]}
                />
            </div>
            <Card className="mt-4 border-slate-200 dark:border-slate-700">
                <CardContent className="grid gap-3 p-3 sm:p-5">
                    {commissions.data.length === 0 ? (
                        <div className="py-12 text-center text-sm text-slate-500">
                            Tidak ada komisi yang sesuai filter.
                        </div>
                    ) : (
                        commissions.data.map((item) => (
                            <article
                                key={item.id}
                                className="grid gap-4 rounded-2xl border border-slate-200 p-4 xl:grid-cols-[1fr_auto_auto] xl:items-center dark:border-slate-700"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-mono text-sm font-bold text-[#0d5c52] dark:text-emerald-300">
                                            {item.booking_code}
                                        </p>
                                        <StatusBadge status={item.status} />
                                    </div>
                                    <h2 className="mt-2 truncate font-semibold">
                                        {item.customer_name}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {item.package_name} ·{' '}
                                        {item.passenger_count} pax
                                    </p>
                                    {item.notes && (
                                        <p className="mt-2 text-xs text-slate-500">
                                            Catatan: {item.notes}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Dasar perhitungan
                                        </p>
                                        <p className="font-semibold">
                                            {item.fee_type === 'fixed'
                                                ? `${money(item.fee_value, item.currency)} / pax`
                                                : `${item.fee_value}% dari ${money(item.base_amount, item.currency)}`}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Nominal komisi
                                        </p>
                                        <p className="font-bold text-[#0d5c52] dark:text-emerald-300">
                                            {money(
                                                item.commission_amount,
                                                item.currency,
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 xl:text-right">
                                    <p>
                                        Disetujui:{' '}
                                        {formatDate(item.approved_at)}
                                    </p>
                                    <p>Dibayar: {formatDate(item.paid_at)}</p>
                                </div>
                            </article>
                        ))
                    )}
                    <PaginationLinks page={commissions} />
                </CardContent>
            </Card>
        </AgentLayout>
    );
}
