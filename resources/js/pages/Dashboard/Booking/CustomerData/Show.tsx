import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    CircleUserRound,
    Clock3,
    ExternalLink,
    Eye,
    FileCheck2,
    FileText,
    MapPin,
    Package2,
    Phone,
    UserRound,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import type {
    CustomerBooking,
    CustomerDataFilters,
    Participant,
    ParticipantSlot,
} from './types';

type Props = {
    filters: CustomerDataFilters;
    booking: CustomerBooking;
};

type ParticipantDocument = Participant['documents'][number];

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(value));
}

function genderLabel(value: string | null): string {
    if (value === 'male') {
        return 'Laki-laki';
    }

    if (value === 'female') {
        return 'Perempuan';
    }

    return '-';
}

function maritalStatusLabel(value: string | null): string {
    const labels: Record<string, string> = {
        single: 'Belum menikah',
        married: 'Menikah',
        divorced: 'Cerai',
        widowed: 'Duda/Janda',
    };

    return value ? (labels[value] ?? value) : '-';
}

function DocumentsCollapsible({
    participant,
    onViewDocument,
}: {
    participant: Participant;
    onViewDocument: (document: ParticipantDocument) => void;
}) {
    return (
        <Collapsible
            defaultOpen
            className="group/documents rounded-xl border bg-background/80"
        >
            <CollapsibleTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 p-3 text-left"
                >
                    <span className="flex items-center gap-2">
                        <FileCheck2 className="size-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">
                            Dokumen Peserta
                        </span>
                        <Badge variant="outline">
                            {participant.documents_count}/
                            {participant.documents_total}
                        </Badge>
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/documents:rotate-180" />
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="grid gap-2 border-t p-3 sm:grid-cols-2 xl:grid-cols-3">
                    {participant.documents.map((document) => (
                        <div
                            key={document.key}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${document.url ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-dashed bg-muted/20'}`}
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <div
                                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${document.url ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}
                                >
                                    <FileText className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {document.label}
                                    </p>
                                    <p
                                        className={`text-xs ${document.url ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}
                                    >
                                        {document.url
                                            ? 'Tersedia'
                                            : 'Belum diunggah'}
                                    </p>
                                </div>
                            </div>
                            {document.url ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onViewDocument(document)}
                                >
                                    <Eye className="size-4" />
                                    <span className="sr-only sm:not-sr-only">
                                        Lihat
                                    </span>
                                </Button>
                            ) : null}
                        </div>
                    ))}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

function ParticipantCard({
    slot,
    onViewDocument,
}: {
    slot: ParticipantSlot;
    onViewDocument: (document: ParticipantDocument) => void;
}) {
    if (!slot.participant) {
        return (
            <Card className="border-dashed border-amber-500/50 bg-amber-500/5">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-dashed border-amber-500/50 bg-background text-lg font-bold text-amber-700 dark:text-amber-300">
                        {slot.slot_number}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">
                                Peserta {slot.slot_number}
                            </p>
                            <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                                <Clock3 className="size-3" /> Belum Diisi
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const participant = slot.participant;
    const missingItems = [
        ...participant.missing_fields,
        ...participant.missing_documents,
    ];

    return (
        <Collapsible
            defaultOpen={slot.slot_number === 1}
            className="group/participant"
        >
            <Card
                className={
                    participant.is_complete
                        ? 'overflow-hidden border-emerald-500/40 bg-emerald-500/5 py-0'
                        : 'overflow-hidden border-amber-500/40 bg-amber-500/5 py-0'
                }
            >
                <CollapsibleTrigger asChild>
                    <button
                        type="button"
                        className="flex w-full flex-col gap-3 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <div
                                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${participant.is_complete ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}
                            >
                                <UserRound className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-semibold">
                                        {participant.full_name}
                                    </p>
                                    <Badge
                                        className={
                                            participant.is_complete
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                                                : 'bg-amber-500 text-white hover:bg-amber-500'
                                        }
                                    >
                                        {participant.is_complete ? (
                                            <CheckCircle2 className="size-3" />
                                        ) : (
                                            <AlertCircle className="size-3" />
                                        )}
                                        {participant.is_complete
                                            ? 'Data Lengkap'
                                            : 'Belum Lengkap'}
                                    </Badge>
                                </div>
                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    <span>Peserta {slot.slot_number}</span>
                                    <span>
                                        {genderLabel(participant.gender)}
                                    </span>
                                    <span>
                                        {participant.documents_count}/
                                        {participant.documents_total} dokumen
                                    </span>
                                </div>
                            </div>
                        </div>
                        <span className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground sm:justify-end">
                            <span className="group-data-[state=open]/participant:hidden">
                                Buka detail
                            </span>
                            <span className="hidden group-data-[state=open]/participant:inline">
                                Tutup detail
                            </span>
                            <ChevronDown className="size-4 transition-transform group-data-[state=open]/participant:rotate-180" />
                        </span>
                    </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="space-y-4 border-t border-border/60 p-4">
                        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border bg-background/80 p-3">
                                <span className="text-xs text-muted-foreground">
                                    Jenis Kelamin
                                </span>
                                <p className="mt-1 font-medium">
                                    {genderLabel(participant.gender)}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-3">
                                <span className="text-xs text-muted-foreground">
                                    Tempat, Tanggal Lahir
                                </span>
                                <p className="mt-1 font-medium">
                                    {participant.birth_place || '-'},{' '}
                                    {formatDate(participant.birth_date)}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-3">
                                <span className="text-xs text-muted-foreground">
                                    Status
                                </span>
                                <p className="mt-1 font-medium">
                                    {maritalStatusLabel(
                                        participant.marital_status,
                                    )}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-3">
                                <span className="text-xs text-muted-foreground">
                                    Ukuran Baju
                                </span>
                                <p className="mt-1 font-medium">
                                    {participant.shirt_size || '-'}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-3 sm:col-span-2">
                                <span className="text-xs text-muted-foreground">
                                    Alamat
                                </span>
                                <p className="mt-1 font-medium">
                                    {participant.address || '-'}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-3">
                                <span className="text-xs text-muted-foreground">
                                    Kontak Darurat
                                </span>
                                <p className="mt-1 font-medium">
                                    {participant.emergency_contact_name || '-'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {participant.emergency_contact_phone || '-'}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-background/80 p-3">
                                <span className="text-xs text-muted-foreground">
                                    Paspor
                                </span>
                                <p className="mt-1 font-medium">
                                    {participant.passport_ready
                                        ? 'Siap'
                                        : 'Belum siap'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Berlaku sampai{' '}
                                    {formatDate(
                                        participant.passport_expiry_date,
                                    )}
                                </p>
                            </div>
                        </div>

                        <DocumentsCollapsible
                            participant={participant}
                            onViewDocument={onViewDocument}
                        />

                        {!participant.is_complete ? (
                            <Collapsible className="group/missing rounded-xl border border-amber-500/30 bg-amber-500/10">
                                <CollapsibleTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between gap-3 p-3 text-left"
                                    >
                                        <span className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
                                            <AlertCircle className="size-4" />{' '}
                                            {missingItems.length} data perlu
                                            dilengkapi
                                        </span>
                                        <ChevronDown className="size-4 text-amber-700 transition-transform group-data-[state=open]/missing:rotate-180 dark:text-amber-300" />
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="flex flex-wrap gap-2 border-t border-amber-500/20 p-3">
                                        {missingItems.map((item) => (
                                            <Badge
                                                key={item}
                                                variant="outline"
                                                className="border-amber-500/40 bg-background/70"
                                            >
                                                {item}
                                            </Badge>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ) : null}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

export default function BookingCustomerDataShow({ filters, booking }: Props) {
    const [documentPreview, setDocumentPreview] =
        useState<ParticipantDocument | null>(null);
    const completeParticipants = booking.slots.filter(
        (slot) => slot.participant?.is_complete,
    ).length;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Data Peserta',
                    href: '/admin/booking-management/customer-data',
                },
                {
                    title: booking.package.name,
                    href: '/admin/booking-management/customer-data',
                },
                {
                    title: booking.booking_code,
                    href: `/admin/booking-management/customer-data/${booking.id}?status=${filters.status}`,
                },
            ]}
        >
            <Head title={`Data Peserta - ${booking.booking_code}`} />

            <div className="space-y-4 p-3 md:p-4">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                        >
                            <Link
                                href={`/admin/booking-management/customer-data?status=${filters.status}`}
                                aria-label="Kembali ke data peserta"
                            >
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                            <CircleUserRound className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {booking.booking_code}
                                </h1>
                                <Badge variant="outline">
                                    {booking.status}
                                </Badge>
                            </div>
                            <p className="mt-1 font-medium">
                                {booking.full_name}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                    <Phone className="size-3" />
                                    {booking.phone}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="size-3" />
                                    {booking.origin_city || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs sm:min-w-md">
                        <div className="rounded-xl border bg-muted/20 p-3">
                            <strong className="block text-base">
                                {booking.passenger_count}
                            </strong>
                            Total Pax
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
                            <strong className="block text-base">
                                {completeParticipants}
                            </strong>
                            Lengkap
                        </div>
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
                            <strong className="block text-base">
                                {booking.passenger_count - completeParticipants}
                            </strong>
                            Belum
                        </div>
                    </div>
                </div>

                <Card className="border-border/60">
                    <CardContent className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="flex items-start gap-3">
                            <Package2 className="mt-0.5 size-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Package
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {booking.package.name}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Keberangkatan
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {formatDate(
                                        booking.schedule.departure_date,
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Users className="mt-0.5 size-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Data Peserta Diisi
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {booking.participants_count}/
                                    {booking.passenger_count} peserta
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 size-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Status Kelengkapan
                                </p>
                                <p className="mt-1 text-sm font-medium">
                                    {completeParticipants ===
                                    booking.passenger_count
                                        ? 'Semua lengkap'
                                        : `${booking.passenger_count - completeParticipants} peserta belum lengkap`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-3">
                    {booking.slots.map((slot) => (
                        <ParticipantCard
                            key={slot.slot_number}
                            slot={slot}
                            onViewDocument={setDocumentPreview}
                        />
                    ))}
                </div>
            </div>

            <Dialog
                open={documentPreview !== null}
                onOpenChange={(open) => !open && setDocumentPreview(null)}
            >
                <DialogContent className="h-[90vh] max-w-6xl gap-0 overflow-hidden p-0">
                    <DialogHeader className="border-b p-4 pr-12">
                        <DialogTitle>
                            {documentPreview?.label ?? 'Dokumen Peserta'}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Pratinjau dokumen peserta
                        </DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 flex-1 bg-muted/30 p-2 sm:p-4">
                        {documentPreview?.url ? (
                            <iframe
                                src={documentPreview.url}
                                title={documentPreview.label}
                                className="h-full w-full rounded-lg border bg-white"
                            />
                        ) : null}
                    </div>
                    <div className="flex justify-end border-t p-3">
                        {documentPreview?.url ? (
                            <Button asChild variant="outline">
                                <a
                                    href={documentPreview.url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink className="size-4" /> Buka Tab
                                    Baru
                                </a>
                            </Button>
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
