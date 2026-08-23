import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AgentLayout from '@/layouts/agent-layout';
import { formatDate } from '@/lib/date-format';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import {
    PageIntro,
    PaginationLinks,
    RecordFilters,
    StatusBadge,
} from './components/PortalUi';
import type { AgentBooking, Paginated, PortalFilters } from './types';
import { money } from './types';

export default function Bookings({
    bookings,
    filters,
}: {
    bookings: Paginated<AgentBooking>;
    filters: PortalFilters;
}) {
    return (
        <AgentLayout title="Booking Referral">
            <Head title="Booking Referral" />
            <PageIntro
                eyebrow="Customer Conversion"
                title="Booking Referral"
                description="Pantau status booking, nilai transaksi, dan komisi untuk setiap customer referral."
            />
            <div className="mt-5">
                <RecordFilters
                    route="/agent/bookings"
                    filters={filters}
                    statuses={[
                        { value: 'registered', label: 'Terdaftar' },
                        { value: 'completed', label: 'Selesai' },
                        { value: 'cancelled', label: 'Dibatalkan' },
                    ]}
                />
            </div>
            <Card className="mt-4 border-slate-200 dark:border-slate-700">
                <CardContent className="grid gap-3 p-3 sm:p-5">
                    {bookings.data.length === 0 ? (
                        <Empty />
                    ) : (
                        bookings.data.map((booking) => (
                            <article
                                key={booking.id}
                                className="grid gap-4 rounded-2xl border border-slate-200 p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center dark:border-slate-700"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-mono text-sm font-bold text-[#0d5c52] dark:text-emerald-300">
                                            {booking.booking_code}
                                        </p>
                                        <StatusBadge
                                            status={booking.booking_status}
                                        />
                                    </div>
                                    <h2 className="mt-2 truncate font-semibold">
                                        {booking.customer_name}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {booking.package_name} ·{' '}
                                        {booking.passenger_count} pax ·{' '}
                                        {formatDate(booking.departure_date)}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm lg:text-right">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Nilai booking
                                        </p>
                                        <p className="font-semibold">
                                            {money(
                                                booking.total_amount,
                                                booking.currency,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Komisi
                                        </p>
                                        <p className="font-semibold text-[#0d5c52] dark:text-emerald-300">
                                            {money(
                                                booking.commission_amount,
                                                booking.currency,
                                            )}
                                        </p>
                                        <StatusBadge
                                            status={booking.commission_status}
                                        />
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={booking.detail_url}>
                                        Detail <ArrowRight />
                                    </Link>
                                </Button>
                            </article>
                        ))
                    )}
                    <PaginationLinks page={bookings} />
                </CardContent>
            </Card>
        </AgentLayout>
    );
}

function Empty() {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
            Tidak ada booking yang sesuai filter.
        </div>
    );
}
