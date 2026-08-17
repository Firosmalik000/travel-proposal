import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CircleDollarSign,
    ClipboardCheck,
    PlaneTakeoff,
} from 'lucide-react';

type Booking = {
    booking_code: string;
    status: string;
    package_name: string | null;
    departure_date: string | null;
    passenger_count: number;
    participants_count: number;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    payment_status: string;
    currency: string;
};
type Summary = {
    total_bookings: number;
    active_bookings: number;
    remaining_payment: number;
    remaining_participants: number;
};

const money = (amount: number, currency: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
const statusLabel: Record<string, string> = {
    registered: 'Terdaftar',
    pending: 'Menunggu',
    cancelled: 'Dibatalkan',
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
    const cards = [
        ['Total Booking', summary.total_bookings, PlaneTakeoff],
        ['Booking Aktif', summary.active_bookings, CalendarDays],
        [
            'Sisa Pembayaran',
            money(summary.remaining_payment, 'IDR'),
            CircleDollarSign,
        ],
        [
            'Data Belum Lengkap',
            `${summary.remaining_participants} peserta`,
            ClipboardCheck,
        ],
    ] as const;

    return (
        <CustomerLayout title="Dashboard Customer">
            <Head title="Portal Customer" />
            <section className="overflow-hidden rounded-[2rem] bg-[#0d5c52] p-6 text-white shadow-2xl shadow-emerald-950/15 sm:p-9">
                <p className="text-sm font-semibold tracking-[.22em] text-emerald-100 uppercase">
                    Perjalanan Anda
                </p>
                <h1 className="mt-3 max-w-3xl font-serif text-3xl font-bold sm:text-5xl">
                    Assalamu'alaikum, {auth?.user?.name}
                </h1>
                <p className="mt-3 max-w-2xl text-emerald-50/80">
                    Pantau booking, pembayaran, dan kelengkapan data peserta
                    dari satu tempat.
                </p>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(([label, value, Icon]) => (
                    <Card
                        key={label}
                        className="border-[#dfd3bf] bg-[#fffaf1]/90 shadow-sm dark:border-[#334155] dark:bg-[#202836]"
                    >
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="rounded-2xl bg-[#ead8b8] p-3 text-[#74501d]">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                                    {label}
                                </p>
                                <p className="mt-1 text-xl font-bold">
                                    {value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section id="booking-saya" className="mt-10 scroll-mt-24">
                <div className="mb-4">
                    <h2 className="font-serif text-2xl font-bold">
                        Booking Saya
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Semua perjalanan yang terhubung dengan akun ini.
                    </p>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                    {bookings.map((booking) => (
                        <Card
                            key={booking.booking_code}
                            className="overflow-hidden border-[#dfd3bf] bg-[#fffaf1] shadow-md shadow-stone-900/5 dark:border-[#334155] dark:bg-[#202836]"
                        >
                            <CardContent className="p-0">
                                <div className="border-b border-[#e8ddcc] p-5 dark:border-[#334155]">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold tracking-[.16em] text-[#0d5c52] uppercase">
                                                {booking.booking_code}
                                            </p>
                                            <h3 className="mt-2 font-serif text-xl font-bold">
                                                {booking.package_name}
                                            </h3>
                                        </div>
                                        <Badge>
                                            {statusLabel[booking.status] ??
                                                booking.status}
                                        </Badge>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                                        Berangkat:{' '}
                                        {booking.departure_date ??
                                            'Jadwal menyusul'}{' '}
                                        · {booking.passenger_count} pax
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-px bg-[#e8ddcc] dark:bg-[#334155]">
                                    <div className="bg-[#fffaf1] p-4 dark:bg-[#202836]">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Pembayaran
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {money(
                                                booking.paid_amount,
                                                booking.currency,
                                            )}
                                        </p>
                                        <p className="text-xs text-rose-700">
                                            Sisa{' '}
                                            {money(
                                                booking.remaining_amount,
                                                booking.currency,
                                            )}
                                        </p>
                                    </div>
                                    <div className="bg-[#fffaf1] p-4 dark:bg-[#202836]">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Data Peserta
                                        </p>
                                        <p className="mt-1 font-semibold">
                                            {booking.participants_count} dari{' '}
                                            {booking.passenger_count}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            peserta terisi
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <Button
                                        className="w-full bg-[#0d5c52] hover:bg-[#08483f]"
                                        asChild
                                    >
                                        <Link
                                            href={`/customer/bookings/${booking.booking_code}`}
                                        >
                                            Buka Detail{' '}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {bookings.length === 0 && (
                        <Card className="border-dashed border-[#cdbd9f] bg-transparent lg:col-span-2 dark:border-[#475569]">
                            <CardContent className="py-16 text-center text-slate-500 dark:text-slate-400">
                                Belum ada booking resmi yang terhubung ke akun
                                ini.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </CustomerLayout>
    );
}
