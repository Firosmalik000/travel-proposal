import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AgentLayout from '@/layouts/agent-layout';
import { formatDate } from '@/lib/date-format';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Mail,
    MapPin,
    Phone,
    UsersRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { PageIntro, StatusBadge } from './components/PortalUi';
import type { AgentBooking } from './types';
import { money } from './types';

type BookingDetail = AgentBooking & {
    email: string | null;
    phone: string;
    origin_city: string;
    notes: string | null;
    return_date: string | null;
    departure_city: string | null;
    fee_type: 'fixed' | 'percentage' | null;
    fee_value: number | null;
    base_amount: number;
    approved_at: string | null;
    paid_at: string | null;
    commission_notes: string | null;
    paid_amount: number;
};

export default function BookingShow({ booking }: { booking: BookingDetail }) {
    return (
        <AgentLayout title={`Detail ${booking.booking_code}`}>
            <Head title={`Booking ${booking.booking_code}`} />
            <PageIntro
                eyebrow="Booking Detail"
                title={booking.customer_name}
                description={`${booking.package_name} · ${booking.passenger_count} jamaah`}
                action={
                    <Button variant="outline" asChild>
                        <Link href="/agent/bookings">
                            <ArrowLeft /> Kembali
                        </Link>
                    </Button>
                }
            />
            <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge status={booking.booking_status} />
                <StatusBadge status={booking.commission_status} />
            </div>
            <section className="mt-5 grid gap-4 xl:grid-cols-3">
                <InfoCard title="Customer">
                    <Row icon={Phone} label="Telepon" value={booking.phone} />
                    <Row
                        icon={Mail}
                        label="Email"
                        value={booking.email ?? '-'}
                    />
                    <Row
                        icon={MapPin}
                        label="Kota asal"
                        value={booking.origin_city}
                    />
                    <Row
                        icon={UsersRound}
                        label="Jumlah"
                        value={`${booking.passenger_count} pax`}
                    />
                </InfoCard>
                <InfoCard title="Perjalanan">
                    <Row
                        icon={MapPin}
                        label="Keberangkatan"
                        value={booking.departure_city ?? '-'}
                    />
                    <Row
                        icon={CalendarDays}
                        label="Tanggal pergi"
                        value={formatDate(booking.departure_date)}
                    />
                    <Row
                        icon={CalendarDays}
                        label="Tanggal pulang"
                        value={formatDate(booking.return_date)}
                    />
                    <p className="mt-3 text-sm text-slate-500">
                        {booking.notes ?? 'Tidak ada catatan booking.'}
                    </p>
                </InfoCard>
                <InfoCard title="Keuangan">
                    <MoneyRow
                        label="Nilai booking"
                        value={money(booking.total_amount, booking.currency)}
                    />
                    <MoneyRow
                        label="Pembayaran terkonfirmasi"
                        value={money(booking.paid_amount, booking.currency)}
                    />
                    <MoneyRow
                        label="Komisi"
                        value={money(
                            booking.commission_amount,
                            booking.currency,
                        )}
                        highlight
                    />
                    <p className="mt-3 text-xs text-slate-500">
                        Skema:{' '}
                        {booking.fee_type === 'fixed'
                            ? `${money(booking.fee_value ?? 0, booking.currency)} / pax`
                            : booking.fee_type === 'percentage'
                              ? `${booking.fee_value}% dari ${money(booking.base_amount, booking.currency)}`
                              : 'Fee belum diatur'}
                    </p>
                </InfoCard>
            </section>
            <Card className="mt-4 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Timeline Komisi</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
                    <Timeline
                        label="Dibuat"
                        value={formatDate(booking.created_at)}
                    />
                    <Timeline
                        label="Disetujui"
                        value={formatDate(booking.approved_at)}
                    />
                    <Timeline
                        label="Dibayar"
                        value={formatDate(booking.paid_at)}
                    />
                    <p className="text-slate-500 sm:col-span-3">
                        Catatan admin:{' '}
                        {booking.commission_notes ?? 'Tidak ada catatan.'}
                    </p>
                </CardContent>
            </Card>
        </AgentLayout>
    );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
    return (
        <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
                <CardTitle className="font-serif">{title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">{children}</CardContent>
        </Card>
    );
}
function Row({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Phone;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                <Icon className="size-4" />
            </span>
            <span>
                <span className="block text-xs text-slate-500">{label}</span>
                <span className="font-medium">{value}</span>
            </span>
        </div>
    );
}
function MoneyRow({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">{label}</span>
            <span
                className={
                    highlight
                        ? 'font-bold text-[#0d5c52] dark:text-emerald-300'
                        : 'font-semibold'
                }
            >
                {value}
            </span>
        </div>
    );
}
function Timeline({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 font-semibold">{value}</p>
        </div>
    );
}
