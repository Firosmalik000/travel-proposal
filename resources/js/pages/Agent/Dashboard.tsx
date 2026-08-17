import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AgentLayout from '@/layouts/agent-layout';
import { Head } from '@inertiajs/react';
import {
    Check,
    Clipboard,
    HandCoins,
    Hourglass,
    Users,
    WalletCards,
} from 'lucide-react';
import { useState } from 'react';

type Booking = {
    booking_code: string;
    customer_name: string;
    package_name: string | null;
    departure_date: string | null;
    passenger_count: number;
    total_amount: number;
    currency: string;
    booking_status: string;
    commission_amount: number;
    commission_status: string;
};

const money = (value: number, currency = 'IDR') =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);

export default function AgentDashboard({
    agent,
    bookings,
    summary,
}: {
    agent: { name: string; referral_code: string; referral_url: string };
    bookings: Booking[];
    summary: {
        total_bookings: number;
        total_pax: number;
        revenue_by_currency: Array<{ currency: string; amount: number }>;
        commissions_by_currency: Array<{
            currency: string;
            pending: number;
            approved: number;
            paid: number;
        }>;
    };
}) {
    const [copied, setCopied] = useState(false);
    const copyReferral = async () => {
        await navigator.clipboard.writeText(agent.referral_url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };
    const currencyTotals = (
        rows: Array<Record<string, number | string>>,
        field: string,
    ) =>
        rows.length > 0
            ? rows
                  .map((row) =>
                      money(Number(row[field] ?? 0), String(row.currency)),
                  )
                  .join(' / ')
            : money(0);
    const cards = [
        ['Booking Referral', summary.total_bookings, Users],
        ['Total Jamaah', `${summary.total_pax} pax`, WalletCards],
        [
            'Komisi Pending',
            currencyTotals(summary.commissions_by_currency, 'pending'),
            Hourglass,
        ],
        [
            'Komisi Dibayar',
            currencyTotals(summary.commissions_by_currency, 'paid'),
            HandCoins,
        ],
    ] as const;

    return (
        <AgentLayout>
            <Head title="Portal Agent" />
            <section className="overflow-hidden rounded-[2rem] bg-[#0e594e] p-6 text-white shadow-2xl shadow-emerald-950/20 sm:p-9">
                <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:items-end">
                    <div>
                        <p className="text-xs font-bold tracking-[.22em] text-emerald-100 uppercase">
                            Agent Performance Center
                        </p>
                        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-bold sm:text-5xl">
                            Selamat datang, {agent.name}
                        </h1>
                        <p className="mt-3 max-w-2xl text-emerald-50/80">
                            Pantau booking yang masuk dari kode referral dan
                            status pemasukan komisi Anda.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                        <p className="text-xs tracking-wider text-emerald-100 uppercase">
                            Kode referral Anda
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                            <code className="text-xl font-black tracking-widest">
                                {agent.referral_code}
                            </code>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={copyReferral}
                            >
                                {copied ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Clipboard className="size-4" />
                                )}{' '}
                                {copied ? 'Tersalin' : 'Salin Link'}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(([label, value, Icon]) => (
                    <Card
                        key={label}
                        className="border-[#ddd0ba] bg-[#fffaf0]/90"
                    >
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="rounded-2xl bg-[#ead8b8] p-3 text-[#74501d]">
                                <Icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                    {label}
                                </p>
                                <p className="mt-1 text-xl font-black">
                                    {value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>
            <section className="mt-8 overflow-hidden rounded-2xl border border-[#ddd0ba] bg-[#fffaf0] shadow-sm">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e5dac7] p-5">
                    <div>
                        <h2 className="font-serif text-2xl font-bold">
                            Booking Referral
                        </h2>
                        <p className="text-sm text-slate-500">
                            Omzet tercatat{' '}
                            {currencyTotals(
                                summary.revenue_by_currency,
                                'amount',
                            )}{' '}
                            / siap dicairkan{' '}
                            {currencyTotals(
                                summary.commissions_by_currency,
                                'approved',
                            )}
                        </p>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Booking</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Package</TableHead>
                            <TableHead>Pax</TableHead>
                            <TableHead>Nilai Booking</TableHead>
                            <TableHead>Komisi</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-32 text-center text-slate-500"
                                >
                                    Belum ada booking dari referral Anda.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking) => (
                                <TableRow key={booking.booking_code}>
                                    <TableCell className="font-mono font-bold">
                                        {booking.booking_code}
                                    </TableCell>
                                    <TableCell>
                                        {booking.customer_name}
                                    </TableCell>
                                    <TableCell>
                                        {booking.package_name}
                                        <div className="text-xs text-slate-500">
                                            {booking.departure_date ??
                                                'Jadwal menyusul'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {booking.passenger_count}
                                    </TableCell>
                                    <TableCell>
                                        {money(
                                            booking.total_amount,
                                            booking.currency,
                                        )}
                                    </TableCell>
                                    <TableCell className="font-bold text-[#0e594e]">
                                        {money(
                                            booking.commission_amount,
                                            booking.currency,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                booking.commission_status ===
                                                'paid'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {booking.commission_status.replace(
                                                '_',
                                                ' ',
                                            )}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </section>
        </AgentLayout>
    );
}
