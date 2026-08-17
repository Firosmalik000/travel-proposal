import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    CircleUserRound,
    Clock3,
    CreditCard,
    Eye,
    MapPin,
    Package2,
    Phone,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import type {
    CustomerBooking,
    CustomerDataFilters,
    PackageGroup,
    ParticipantSlot,
    ScheduleGroup,
} from './types';

type Props = {
    filters: CustomerDataFilters;
    selectedPackage: PackageGroup;
};

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}

function statusLabel(status: string | null): string {
    switch (status) {
        case 'registered':
            return 'Registered';
        case 'pending':
            return 'Pending';
        case 'open':
            return 'Open';
        case 'closed':
            return 'Closed';
        default:
            return status ? status.replaceAll('_', ' ') : '-';
    }
}

function ParticipantSlotCard({ slot }: { slot: ParticipantSlot }) {
    return (
        <div
            className={`rounded-2xl border p-4 ${
                slot.is_filled
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-dashed border-border/70 bg-muted/20'
            }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-sm font-semibold shadow-sm">
                    {slot.slot_number}
                </div>
                {slot.is_filled ? (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Terisi
                    </Badge>
                ) : (
                    <Badge variant="secondary">
                        <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                        Belum Terisi
                    </Badge>
                )}
            </div>

            {slot.participant ? (
                <div className="mt-4 space-y-3">
                    <div>
                        <div className="font-semibold">
                            {slot.participant.full_name}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                            {[
                                slot.participant.gender === 'male'
                                    ? 'Laki-laki'
                                    : slot.participant.gender === 'female'
                                      ? 'Perempuan'
                                      : null,
                                slot.participant.birth_place,
                                slot.participant.birth_date
                                    ? formatDate(slot.participant.birth_date)
                                    : null,
                            ]
                                .filter(Boolean)
                                .join(' / ') || '-'}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-background/80 p-3">
                            <div className="text-xs text-muted-foreground">
                                Passport
                            </div>
                            <div className="mt-1 font-medium">
                                {slot.participant.passport_ready
                                    ? 'Siap'
                                    : 'Belum Siap'}
                            </div>
                        </div>
                        <div className="rounded-xl bg-background/80 p-3">
                            <div className="text-xs text-muted-foreground">
                                Ukuran Baju
                            </div>
                            <div className="mt-1 font-medium">
                                {slot.participant.shirt_size ?? '-'}
                            </div>
                        </div>
                        <div className="rounded-xl bg-background/80 p-3">
                            <div className="text-xs text-muted-foreground">
                                Kontak Darurat
                            </div>
                            <div className="mt-1 font-medium">
                                {slot.participant.emergency_contact_name ?? '-'}
                            </div>
                        </div>
                        <div className="rounded-xl bg-background/80 p-3">
                            <div className="text-xs text-muted-foreground">
                                Status
                            </div>
                            <div className="mt-1 font-medium">
                                {slot.participant.marital_status ?? '-'}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function BookingCard({
    booking,
    onViewPax,
}: {
    booking: CustomerBooking;
    onViewPax: (booking: CustomerBooking) => void;
}) {
    return (
        <Card className="overflow-hidden border-border/60 py-0 shadow-none">
            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                        <CircleUserRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">
                                {booking.booking_code}
                            </span>
                            <Badge variant="outline">
                                {statusLabel(booking.status)}
                            </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                            <span>{booking.full_name}</span>
                            <span className="inline-flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {booking.phone}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                        {booking.passenger_count} Pax
                    </Badge>
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        {booking.participants_count} Terisi
                    </Badge>
                    <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                        {booking.remaining_slots} Belum
                    </Badge>
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={`/admin/booking-management/listing/${booking.id}/payments`}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pembayaran
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onViewPax(booking)}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Data Pax
                    </Button>
                </div>
            </div>
        </Card>
    );
}

function ScheduleCard({
    schedule,
    onViewPax,
}: {
    schedule: ScheduleGroup;
    onViewPax: (booking: CustomerBooking) => void;
}) {
    return (
        <Collapsible>
            <Card className="overflow-hidden border-border/60 py-0 shadow-sm">
                <CollapsibleTrigger className="group w-full text-left">
                    <div className="flex flex-col gap-3 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-background">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-semibold">
                                    {formatDate(schedule.departure_date)} -{' '}
                                    {formatDate(schedule.return_date)}
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {schedule.departure_city ?? '-'}
                                    </span>
                                    <Badge variant="outline">
                                        {statusLabel(schedule.status)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                {schedule.booking_count} Booking
                            </Badge>
                            <Badge variant="secondary">
                                {schedule.customers} Pax
                            </Badge>
                            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="space-y-3 border-t border-border/60 p-4">
                        {schedule.bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onViewPax={onViewPax}
                            />
                        ))}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

export default function BookingCustomerDataShow({
    filters,
    selectedPackage,
}: Props) {
    const [selectedBooking, setSelectedBooking] =
        useState<CustomerBooking | null>(null);

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Data Customer',
                    href: '/admin/booking-management/customer-data',
                },
                {
                    title: selectedPackage.name,
                    href: `/admin/booking-management/customer-data/${selectedPackage.id}`,
                },
            ]}
        >
            <Head title={`Data Customer - ${selectedPackage.name}`} />

            <div className="space-y-4 p-3 md:p-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="icon">
                            <Link
                                href={`/admin/booking-management/customer-data?status=${filters.status}`}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                            <Package2 className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {selectedPackage.name}
                                </h1>
                                {selectedPackage.code ? (
                                    <Badge variant="outline">
                                        {selectedPackage.code}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                            {selectedPackage.schedules.length} Jadwal
                        </Badge>
                        <Badge variant="secondary">
                            {selectedPackage.booking_count} Booking
                        </Badge>
                        <Badge variant="secondary">
                            <Users className="mr-1.5 h-3.5 w-3.5" />
                            {selectedPackage.customers} Pax
                        </Badge>
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                            {selectedPackage.participants} Terisi
                        </Badge>
                        <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                            {selectedPackage.remaining} Belum Terisi
                        </Badge>
                    </div>
                </div>

                <div className="space-y-3">
                    {selectedPackage.schedules.map((schedule) => (
                        <ScheduleCard
                            key={`${selectedPackage.id}-${schedule.id ?? 'none'}`}
                            schedule={schedule}
                            onViewPax={setSelectedBooking}
                        />
                    ))}
                </div>
            </div>

            <Sheet
                open={selectedBooking !== null}
                onOpenChange={(open) => !open && setSelectedBooking(null)}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-4xl">
                    {selectedBooking ? (
                        <div className="space-y-5">
                            <SheetHeader>
                                <SheetTitle className="flex flex-wrap items-center gap-2">
                                    <span>{selectedBooking.booking_code}</span>
                                    <Badge variant="outline">
                                        {statusLabel(selectedBooking.status)}
                                    </Badge>
                                </SheetTitle>
                            </SheetHeader>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                <div className="rounded-xl border bg-muted/20 p-3">
                                    <div className="text-xs text-muted-foreground">
                                        Pemesan
                                    </div>
                                    <div className="mt-1 font-medium">
                                        {selectedBooking.full_name}
                                    </div>
                                </div>
                                <div className="rounded-xl border bg-muted/20 p-3">
                                    <div className="text-xs text-muted-foreground">
                                        Total Pax
                                    </div>
                                    <div className="mt-1 font-medium">
                                        {selectedBooking.passenger_count}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                                    <div className="text-xs text-emerald-700 dark:text-emerald-300">
                                        Terisi
                                    </div>
                                    <div className="mt-1 font-medium text-emerald-700 dark:text-emerald-300">
                                        {selectedBooking.participants_count}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                                    <div className="text-xs text-amber-700 dark:text-amber-300">
                                        Belum Terisi
                                    </div>
                                    <div className="mt-1 font-medium text-amber-700 dark:text-amber-300">
                                        {selectedBooking.remaining_slots}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {selectedBooking.slots.map((slot) => (
                                    <ParticipantSlotCard
                                        key={slot.slot_number}
                                        slot={slot}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
