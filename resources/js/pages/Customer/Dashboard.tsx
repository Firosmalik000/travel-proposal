import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import { formatDateTime } from '@/lib/date-format';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CircleDollarSign,
    Clock3,
    PlaneTakeoff,
    Users,
} from 'lucide-react';

type Booking = {
    id: number;
    record_type: 'booking' | 'registration';
    booking_code: string;
    status: string;
    package_name: string | null;
    package_url: string | null;
    detail_url: string | null;
    departure_date: string | null;
    passenger_count: number;
    participants_count: number;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    payment_status: string;
    currency: string;
    updated_at: string | null;
};

type Summary = {
    total_bookings: number;
    total_spent: number;
    total_due: number;
    remaining_payment: number;
    incomplete_participant_orders: number;
    remaining_participant_slots: number;
    latest_booking_code: string | null;
    latest_booking_status: string | null;
    latest_booking_status_at: string | null;
};

type DashboardCard = {
    label: string;
    value: string | number;
    icon: typeof PlaneTakeoff;
    note: string;
};

const money = (amount: number, currency: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);

const statusLabel: Record<string, string> = {
    registered: 'Terdaftar',
    pending: 'Menunggu Konfirmasi',
    cancelled: 'Dibatalkan',
};

const paymentStatusLabel: Record<string, string> = {
    unpaid: 'Belum Dibayar',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
};

export default function CustomerDashboard({
    bookings,
    summary,
}: {
    bookings: Booking[];
    summary: Summary;
}) {
    const { auth } = usePage().props as unknown as {
        auth?: { user?: { name?: string } };
    };

    const cards: DashboardCard[] = [
        {
            label: 'Total Pesanan',
            value: summary.total_bookings,
            icon: PlaneTakeoff,
            note: 'Semua booking yang terhubung ke akun ini',
        },
        {
            label: 'Total Pengeluaran',
            value: money(summary.total_spent, 'IDR'),
            icon: CircleDollarSign,
            note: 'Total pembayaran yang sudah terkonfirmasi',
        },
        {
            label: 'Jumlah Harus Dibayar',
            value: money(summary.total_due, 'IDR'),
            icon: CalendarDays,
            note: 'Total tagihan dari booking aktif',
        },
        {
            label: 'Sisa Pembayaran',
            value: money(summary.remaining_payment, 'IDR'),
            icon: CircleDollarSign,
            note: 'Sisa tagihan yang belum lunas',
        },
        {
            label: 'Data Peserta Belum Lengkap',
            value: `${summary.incomplete_participant_orders} booking`,
            icon: Users,
            note:
                summary.remaining_participant_slots > 0
                    ? `${summary.remaining_participant_slots} slot belum diisi`
                    : 'Semua data peserta lengkap',
        },
        {
            label: 'Status Booking Terbaru',
            value: summary.latest_booking_status
                ? (statusLabel[summary.latest_booking_status] ??
                  summary.latest_booking_status)
                : '-',
            icon: Clock3,
            note: summary.latest_booking_code
                ? `${summary.latest_booking_code} · ${formatDateTime(summary.latest_booking_status_at)}`
                : 'Belum ada booking yang diperbarui',
        },
    ];

    return (
        <CustomerLayout title="Dashboard Customer">
            <Head title="Portal Customer" />

            <section className="rounded-3xl bg-[#0d5c52] p-5 text-white shadow-2xl shadow-emerald-950/15 sm:p-6">
                <h1 className="font-serif text-2xl font-bold sm:text-3xl">
                    Assalamu'alaikum, {auth?.user?.name}
                </h1>
                <Button
                    asChild
                    className="mt-4 rounded-full bg-[#e1b86a] px-4 text-sm text-[#173c36] hover:bg-[#d7aa54]"
                >
                    <Link href="/customer/bookings">Lihat Booking</Link>
                </Button>
            </section>

            <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map(({ label, value, icon: Icon, note }) => (
                    <Card
                        key={label}
                        className="border-[#dfd3bf] bg-[#fffaf1]/90 shadow-sm dark:border-[#334155] dark:bg-[#202836]"
                    >
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="rounded-xl bg-[#ead8b8] p-2.5 text-[#74501d]">
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                                    {label}
                                </p>
                                <p className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">
                                    {value}
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {note}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section className="mt-8">
                <div className="mb-3">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Booking Terbaru
                    </h2>
                </div>
                <div className="grid gap-3">
                    {bookings.map((booking) => (
                        <Card
                            key={`${booking.record_type}-${booking.id}`}
                            className="border-[#dfd3bf] bg-[#fffaf1] shadow-sm dark:border-[#334155] dark:bg-[#202836]"
                        >
                            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                            {booking.package_name}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className="text-[11px]"
                                        >
                                            {statusLabel[booking.status] ??
                                                booking.status}
                                        </Badge>
                                        {booking.record_type === 'booking' ? (
                                            <Badge
                                                variant="outline"
                                                className="text-[11px]"
                                            >
                                                {paymentStatusLabel[
                                                    booking.payment_status
                                                ] ?? booking.payment_status}
                                            </Badge>
                                        ) : null}
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        {booking.booking_code} ·{' '}
                                        {booking.departure_date ??
                                            'Jadwal menyusul'}{' '}
                                        · {booking.participants_count}/
                                        {booking.passenger_count} peserta
                                    </p>
                                    {booking.record_type === 'booking' ? (
                                        <p className="mt-1 text-xs font-medium text-slate-600 tabular-nums dark:text-slate-300">
                                            Terbayar{' '}
                                            {money(
                                                booking.paid_amount,
                                                booking.currency,
                                            )}{' '}
                                            dari{' '}
                                            {money(
                                                booking.total_amount,
                                                booking.currency,
                                            )}{' '}
                                            · Sisa{' '}
                                            {money(
                                                booking.remaining_amount,
                                                booking.currency,
                                            )}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {booking.detail_url ? (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full text-xs"
                                        >
                                            <Link href={booking.detail_url}>
                                                Detail Pesanan
                                            </Link>
                                        </Button>
                                    ) : null}
                                    {booking.package_url ? (
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full text-xs"
                                        >
                                            <Link href={booking.package_url}>
                                                Detail Paket
                                            </Link>
                                        </Button>
                                    ) : null}
                                    {booking.record_type === 'booking' ? (
                                        <Button
                                            asChild
                                            size="sm"
                                            className="rounded-full bg-[#0d5c52] px-4 hover:bg-[#08483f]"
                                        >
                                            <Link
                                                href={
                                                    booking.detail_url ??
                                                    '/customer/bookings'
                                                }
                                            >
                                                Buka
                                            </Link>
                                        </Button>
                                    ) : (
                                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                            Menunggu verifikasi
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {bookings.length === 0 && (
                        <Card className="border-dashed border-[#cdbd9f] bg-transparent dark:border-[#475569]">
                            <CardContent className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                                Belum ada booking yang terhubung ke akun ini.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </CustomerLayout>
    );
}
