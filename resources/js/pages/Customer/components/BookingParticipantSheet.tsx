import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    ChevronDown,
    ExternalLink,
    FileCheck2,
    FileText,
    HeartPulse,
    IdCard,
    Pencil,
    Save,
    Upload,
    UserRound,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

export type ParticipantDocumentField =
    | 'passport_scan'
    | 'family_card_scan'
    | 'marriage_book_scan'
    | 'birth_certificate_scan'
    | 'photo'
    | 'meningitis_vaccine_scan';

export type BookingParticipant = {
    id: number;
    full_name: string;
    gender: string | null;
    birth_place: string | null;
    birth_date: string | null;
    marital_status: string | null;
    address: string | null;
    needs_wheelchair: boolean;
    shirt_size: string | null;
    passport_ready: boolean;
    passport_issue_date: string | null;
    passport_expiry_date: string | null;
    passport_type: string | null;
    has_medical_history: boolean;
    medical_history_notes: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    has_performed_umrah: boolean;
    referral_source: string | null;
    is_complete: boolean;
    missing_count: number;
    missing_fields_count: number;
    missing_documents_count: number;
    documents_count: number;
    documents_total: number;
    documents: Record<ParticipantDocumentField, string | null>;
};

type ParticipantForm = {
    full_name: string;
    gender: string;
    birth_place: string;
    birth_date: string;
    marital_status: string;
    address: string;
    needs_wheelchair: boolean;
    shirt_size: string;
    passport_ready: boolean;
    passport_issue_date: string;
    passport_expiry_date: string;
    passport_type: string;
    passport_scan: File | null;
    family_card_scan: File | null;
    marriage_book_scan: File | null;
    birth_certificate_scan: File | null;
    photo: File | null;
    meningitis_vaccine_scan: File | null;
    has_medical_history: boolean;
    medical_history_notes: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    has_performed_umrah: boolean;
    referral_source: string;
};

const emptyForm: ParticipantForm = {
    full_name: '',
    gender: '',
    birth_place: '',
    birth_date: '',
    marital_status: '',
    address: '',
    needs_wheelchair: false,
    shirt_size: '',
    passport_ready: false,
    passport_issue_date: '',
    passport_expiry_date: '',
    passport_type: '',
    passport_scan: null,
    family_card_scan: null,
    marriage_book_scan: null,
    birth_certificate_scan: null,
    photo: null,
    meningitis_vaccine_scan: null,
    has_medical_history: false,
    medical_history_notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    has_performed_umrah: false,
    referral_source: '',
};

const documentFields: Array<{
    field: ParticipantDocumentField;
    label: string;
    accept: string;
}> = [
    {
        field: 'passport_scan',
        label: 'Scan Paspor',
        accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
    {
        field: 'family_card_scan',
        label: 'Kartu Keluarga',
        accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
    {
        field: 'marriage_book_scan',
        label: 'Buku Nikah',
        accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
    {
        field: 'birth_certificate_scan',
        label: 'Akta Kelahiran',
        accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
    {
        field: 'photo',
        label: 'Pas Foto',
        accept: 'image/jpeg,image/png,image/webp',
    },
    {
        field: 'meningitis_vaccine_scan',
        label: 'Vaksin Meningitis',
        accept: 'image/jpeg,image/png,image/webp,application/pdf',
    },
];

function participantFormData(
    participant: BookingParticipant | null,
): ParticipantForm {
    if (!participant) {
        return { ...emptyForm };
    }

    return {
        ...emptyForm,
        full_name: participant.full_name,
        gender: participant.gender ?? '',
        birth_place: participant.birth_place ?? '',
        birth_date: participant.birth_date ?? '',
        marital_status: participant.marital_status ?? '',
        address: participant.address ?? '',
        needs_wheelchair: participant.needs_wheelchair,
        shirt_size: participant.shirt_size ?? '',
        passport_ready: participant.passport_ready,
        passport_issue_date: participant.passport_issue_date ?? '',
        passport_expiry_date: participant.passport_expiry_date ?? '',
        passport_type: participant.passport_type ?? '',
        has_medical_history: participant.has_medical_history,
        medical_history_notes: participant.medical_history_notes ?? '',
        emergency_contact_name: participant.emergency_contact_name ?? '',
        emergency_contact_phone: participant.emergency_contact_phone ?? '',
        emergency_contact_relationship:
            participant.emergency_contact_relationship ?? '',
        has_performed_umrah: participant.has_performed_umrah,
        referral_source: participant.referral_source ?? '',
    };
}

function SectionHeader({
    icon: Icon,
    title,
    open,
    completed = false,
}: {
    icon: typeof IdCard;
    title: string;
    open: boolean;
    completed?: boolean;
}) {
    return (
        <div className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                <Icon className="size-4 text-[#0d5c52]" /> {title}
                {completed ? (
                    <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                        <CheckCircle2 className="size-3" /> Terisi
                    </Badge>
                ) : null}
            </span>
            <ChevronDown
                className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
            />
        </div>
    );
}

export default function BookingParticipantSheet({
    bookingId,
    slotNumber,
    participant,
    open,
    onOpenChange,
}: {
    bookingId: number;
    slotNumber: number;
    participant: BookingParticipant | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<ParticipantForm>(participantFormData(participant));
    const [sections, setSections] = useState([
        'identity',
        'passport',
        'additional',
    ]);
    const existingPhotoUrl = participant?.documents.photo ?? null;
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        existingPhotoUrl,
    );
    const [documentPreviews, setDocumentPreviews] = useState<
        Record<ParticipantDocumentField, string | null>
    >({
        passport_scan: participant?.documents.passport_scan ?? null,
        family_card_scan: participant?.documents.family_card_scan ?? null,
        marriage_book_scan: participant?.documents.marriage_book_scan ?? null,
        birth_certificate_scan:
            participant?.documents.birth_certificate_scan ?? null,
        photo: existingPhotoUrl,
        meningitis_vaccine_scan:
            participant?.documents.meningitis_vaccine_scan ?? null,
    });
    const generatedPreviewUrls = useRef<string[]>([]);

    useEffect(() => {
        const previewUrls = generatedPreviewUrls.current;

        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

    const createFilePreview = (file: File): string => {
        const previewUrl = URL.createObjectURL(file);
        generatedPreviewUrls.current.push(previewUrl);

        return previewUrl;
    };

    const toggleSection = (section: string) => {
        setSections((current) =>
            current.includes(section)
                ? current.filter((item) => item !== section)
                : [...current, section],
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const url = participant
            ? `/customer/bookings/${bookingId}/participants/${participant.id}`
            : `/customer/bookings/${bookingId}/participants`;

        form.post(url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-2xl lg:max-w-3xl">
                <SheetHeader className="sticky top-0 z-20 border-b bg-background/95 px-5 py-4 backdrop-blur">
                    <div className="flex items-center gap-3 pr-8">
                        <div className="grid size-10 place-items-center rounded-xl bg-[#e4f1ed] text-[#0d5c52] dark:bg-emerald-950/40">
                            <IdCard className="size-5" />
                        </div>
                        <div>
                            <SheetTitle>
                                {participant ? 'Ubah' : 'Isi'} Peserta{' '}
                                {slotNumber}
                            </SheetTitle>
                        </div>
                    </div>
                </SheetHeader>

                <form onSubmit={submit} className="grid gap-4 p-4 sm:p-5">
                    {form.hasErrors ? (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                            Periksa kembali field yang ditandai sebelum
                            menyimpan.
                        </div>
                    ) : null}

                    <section
                        className={`overflow-hidden rounded-2xl border p-4 transition-colors ${
                            photoPreview
                                ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                                : 'border-dashed bg-muted/20'
                        }`}
                    >
                        <div className="grid gap-4 sm:grid-cols-[9rem_1fr] sm:items-center">
                            <div className="relative mx-auto size-36 overflow-hidden rounded-2xl border-4 border-white bg-muted shadow-md dark:border-slate-800">
                                {photoPreview ? (
                                    <img
                                        src={photoPreview}
                                        alt={`Pas foto ${form.data.full_name || `peserta ${slotNumber}`}`}
                                        className="size-full object-cover object-top"
                                    />
                                ) : (
                                    <div className="grid size-full place-items-center text-muted-foreground">
                                        <UserRound className="size-14 stroke-[1.25]" />
                                    </div>
                                )}
                                {photoPreview ? (
                                    <span className="absolute right-2 bottom-2 grid size-7 place-items-center rounded-full bg-emerald-600 text-white shadow">
                                        <CheckCircle2 className="size-4" />
                                    </span>
                                ) : null}
                            </div>
                            <div className="min-w-0 text-center sm:text-left">
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                    <p className="text-sm font-semibold">
                                        Pas Foto Peserta
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className={
                                            photoPreview
                                                ? 'border-emerald-200 bg-white text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                : ''
                                        }
                                    >
                                        {photoPreview
                                            ? 'Sudah Terisi'
                                            : 'Belum Terisi'}
                                    </Badge>
                                </div>
                                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                                    <Button
                                        asChild
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                    >
                                        <label
                                            htmlFor="participant-photo"
                                            className="cursor-pointer"
                                        >
                                            <Camera className="size-4" />
                                            {photoPreview
                                                ? 'Ganti Foto'
                                                : 'Pilih Foto'}
                                        </label>
                                    </Button>
                                    {existingPhotoUrl ? (
                                        <Button
                                            asChild
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                        >
                                            <a
                                                href={existingPhotoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <ExternalLink className="size-4" />{' '}
                                                Lihat Penuh
                                            </a>
                                        </Button>
                                    ) : null}
                                </div>
                                <input
                                    id="participant-photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0] ?? null;

                                        form.setData('photo', file);
                                        setPhotoPreview(
                                            file
                                                ? createFilePreview(file)
                                                : existingPhotoUrl,
                                        );
                                    }}
                                />
                                <InputError message={form.errors.photo} />
                            </div>
                        </div>
                    </section>

                    <Collapsible
                        open={sections.includes('identity')}
                        onOpenChange={() => toggleSection('identity')}
                        className={`overflow-hidden rounded-2xl border bg-card ${
                            form.data.full_name
                                ? 'border-emerald-200 dark:border-emerald-900/60'
                                : ''
                        }`}
                    >
                        <CollapsibleTrigger asChild>
                            <button
                                type="button"
                                className="w-full hover:bg-muted/40"
                            >
                                <SectionHeader
                                    icon={IdCard}
                                    title="Identitas Peserta"
                                    open={sections.includes('identity')}
                                    completed={Boolean(form.data.full_name)}
                                />
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t p-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="participant-full-name">
                                        Nama Lengkap
                                    </Label>
                                    <Input
                                        id="participant-full-name"
                                        value={form.data.full_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'full_name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Nama sesuai identitas atau paspor"
                                        required
                                    />
                                    <InputError
                                        message={form.errors.full_name}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Jenis Kelamin</Label>
                                    <Select
                                        value={form.data.gender || 'none'}
                                        onValueChange={(value) =>
                                            form.setData(
                                                'gender',
                                                value === 'none' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Belum dipilih
                                            </SelectItem>
                                            <SelectItem value="male">
                                                Laki-laki
                                            </SelectItem>
                                            <SelectItem value="female">
                                                Perempuan
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors.gender} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status Pernikahan</Label>
                                    <Select
                                        value={
                                            form.data.marital_status || 'none'
                                        }
                                        onValueChange={(value) =>
                                            form.setData(
                                                'marital_status',
                                                value === 'none' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Belum dipilih
                                            </SelectItem>
                                            <SelectItem value="single">
                                                Belum Menikah
                                            </SelectItem>
                                            <SelectItem value="married">
                                                Menikah
                                            </SelectItem>
                                            <SelectItem value="divorced">
                                                Cerai
                                            </SelectItem>
                                            <SelectItem value="widowed">
                                                Duda/Janda
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={form.errors.marital_status}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="participant-birth-place">
                                        Tempat Lahir
                                    </Label>
                                    <Input
                                        id="participant-birth-place"
                                        value={form.data.birth_place}
                                        onChange={(event) =>
                                            form.setData(
                                                'birth_place',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.birth_place}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="participant-birth-date">
                                        Tanggal Lahir
                                    </Label>
                                    <Input
                                        id="participant-birth-date"
                                        type="date"
                                        value={form.data.birth_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'birth_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.birth_date}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Ukuran Baju</Label>
                                    <Select
                                        value={form.data.shirt_size || 'none'}
                                        onValueChange={(value) =>
                                            form.setData(
                                                'shirt_size',
                                                value === 'none' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Belum dipilih
                                            </SelectItem>
                                            {[
                                                'XS',
                                                'S',
                                                'M',
                                                'L',
                                                'XL',
                                                'XXL',
                                                'XXXL',
                                            ].map((size) => (
                                                <SelectItem
                                                    key={size}
                                                    value={size}
                                                >
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={form.errors.shirt_size}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Kebutuhan Kursi Roda</Label>
                                    <Select
                                        value={
                                            form.data.needs_wheelchair
                                                ? 'yes'
                                                : 'no'
                                        }
                                        onValueChange={(value) =>
                                            form.setData(
                                                'needs_wheelchair',
                                                value === 'yes',
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">
                                                Tidak
                                            </SelectItem>
                                            <SelectItem value="yes">
                                                Ya
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="participant-address">
                                        Alamat Lengkap
                                    </Label>
                                    <Textarea
                                        id="participant-address"
                                        rows={3}
                                        value={form.data.address}
                                        onChange={(event) =>
                                            form.setData(
                                                'address',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={form.errors.address} />
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible
                        open={sections.includes('passport')}
                        onOpenChange={() => toggleSection('passport')}
                        className={`overflow-hidden rounded-2xl border bg-card ${
                            form.data.passport_ready ||
                            documentFields.some(
                                ({ field }) =>
                                    Boolean(form.data[field]) ||
                                    Boolean(participant?.documents[field]),
                            )
                                ? 'border-emerald-200 dark:border-emerald-900/60'
                                : ''
                        }`}
                    >
                        <CollapsibleTrigger asChild>
                            <button
                                type="button"
                                className="w-full hover:bg-muted/40"
                            >
                                <SectionHeader
                                    icon={FileCheck2}
                                    title="Paspor & Dokumen"
                                    open={sections.includes('passport')}
                                    completed={
                                        form.data.passport_ready ||
                                        documentFields.some(
                                            ({ field }) =>
                                                Boolean(form.data[field]) ||
                                                Boolean(
                                                    participant?.documents[
                                                        field
                                                    ],
                                                ),
                                        )
                                    }
                                />
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="grid gap-4 border-t p-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Status Paspor</Label>
                                    <Select
                                        value={
                                            form.data.passport_ready
                                                ? 'ready'
                                                : 'not_ready'
                                        }
                                        onValueChange={(value) =>
                                            form.setData(
                                                'passport_ready',
                                                value === 'ready',
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="not_ready">
                                                Belum Siap
                                            </SelectItem>
                                            <SelectItem value="ready">
                                                Sudah Siap
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Jenis Paspor</Label>
                                    <Select
                                        value={
                                            form.data.passport_type || 'none'
                                        }
                                        onValueChange={(value) =>
                                            form.setData(
                                                'passport_type',
                                                value === 'none' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Belum dipilih
                                            </SelectItem>
                                            <SelectItem value="ordinary">
                                                Paspor Biasa
                                            </SelectItem>
                                            <SelectItem value="e_passport">
                                                E-Paspor
                                            </SelectItem>
                                            <SelectItem value="diplomatic">
                                                Diplomatik
                                            </SelectItem>
                                            <SelectItem value="official">
                                                Dinas
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={form.errors.passport_type}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="passport-issue-date">
                                        Tanggal Terbit
                                    </Label>
                                    <Input
                                        id="passport-issue-date"
                                        type="date"
                                        value={form.data.passport_issue_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'passport_issue_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            form.errors.passport_issue_date
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="passport-expiry-date">
                                        Tanggal Kedaluwarsa
                                    </Label>
                                    <Input
                                        id="passport-expiry-date"
                                        type="date"
                                        value={form.data.passport_expiry_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'passport_expiry_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            form.errors.passport_expiry_date
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {documentFields
                                    .filter(({ field }) => field !== 'photo')
                                    .map(({ field, label, accept }) => {
                                        const selectedFile = form.data[field];
                                        const existingUrl =
                                            participant?.documents[field] ??
                                            null;
                                        const previewUrl =
                                            documentPreviews[field];
                                        const isFilled = Boolean(
                                            selectedFile || previewUrl,
                                        );

                                        return (
                                            <div
                                                key={field}
                                                className={`rounded-xl border p-3 transition-colors ${
                                                    isFilled
                                                        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                                                        : 'border-dashed'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <Label
                                                        htmlFor={`document-${field}`}
                                                    >
                                                        {label}
                                                    </Label>
                                                    {isFilled ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-emerald-200 bg-white text-[10px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                        >
                                                            <CheckCircle2 className="size-3" />{' '}
                                                            Terisi
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                                <label
                                                    htmlFor={`document-${field}`}
                                                    className={`group relative mt-3 flex h-44 cursor-pointer overflow-hidden rounded-xl border transition-colors ${
                                                        isFilled
                                                            ? 'border-emerald-200 bg-white dark:border-emerald-900 dark:bg-slate-950'
                                                            : 'items-center justify-center border-dashed bg-muted/25 hover:bg-muted/50'
                                                    }`}
                                                >
                                                    {previewUrl ? (
                                                        <>
                                                            <iframe
                                                                src={previewUrl}
                                                                title={`Preview ${label}`}
                                                                className="pointer-events-none size-full border-0 bg-white"
                                                            />
                                                            <span className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1.5 rounded-lg bg-slate-950/75 px-3 py-2 text-xs font-semibold text-white shadow backdrop-blur-sm transition group-hover:bg-[#0d5c52]">
                                                                <Pencil className="size-3.5" />{' '}
                                                                Klik untuk
                                                                mengganti
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="grid place-items-center gap-2 p-5 text-center text-muted-foreground">
                                                            <span className="grid size-10 place-items-center rounded-full bg-background shadow-sm">
                                                                <Upload className="size-4" />
                                                            </span>
                                                            <span className="text-xs font-semibold text-foreground">
                                                                Pilih {label}
                                                            </span>
                                                        </span>
                                                    )}
                                                </label>
                                                <input
                                                    id={`document-${field}`}
                                                    type="file"
                                                    accept={accept}
                                                    className="hidden"
                                                    onChange={(event) => {
                                                        const file =
                                                            event.target
                                                                .files?.[0] ??
                                                            null;

                                                        form.setData(
                                                            field,
                                                            file,
                                                        );
                                                        setDocumentPreviews(
                                                            (current) => ({
                                                                ...current,
                                                                [field]: file
                                                                    ? createFilePreview(
                                                                          file,
                                                                      )
                                                                    : existingUrl,
                                                            }),
                                                        );
                                                    }}
                                                />
                                                <div className="mt-2 flex min-h-8 items-center justify-between gap-2">
                                                    <span className="min-w-0 truncate text-[11px] text-muted-foreground">
                                                        {selectedFile?.name ??
                                                            (existingUrl
                                                                ? 'File tersimpan'
                                                                : 'Belum ada file')}
                                                    </span>
                                                    {previewUrl ? (
                                                        <Button
                                                            asChild
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 shrink-0 px-2 text-xs"
                                                        >
                                                            <a
                                                                href={
                                                                    previewUrl
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                {field ===
                                                                'passport_scan' ? (
                                                                    <FileText className="size-3.5" />
                                                                ) : (
                                                                    <ExternalLink className="size-3.5" />
                                                                )}
                                                                Lihat penuh
                                                            </a>
                                                        </Button>
                                                    ) : null}
                                                </div>
                                                <InputError
                                                    message={form.errors[field]}
                                                />
                                            </div>
                                        );
                                    })}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible
                        open={sections.includes('additional')}
                        onOpenChange={() => toggleSection('additional')}
                        className={`overflow-hidden rounded-2xl border bg-card ${
                            form.data.emergency_contact_name ||
                            form.data.medical_history_notes
                                ? 'border-emerald-200 dark:border-emerald-900/60'
                                : ''
                        }`}
                    >
                        <CollapsibleTrigger asChild>
                            <button
                                type="button"
                                className="w-full hover:bg-muted/40"
                            >
                                <SectionHeader
                                    icon={HeartPulse}
                                    title="Kesehatan & Kontak Darurat"
                                    open={sections.includes('additional')}
                                    completed={Boolean(
                                        form.data.emergency_contact_name ||
                                            form.data.medical_history_notes,
                                    )}
                                />
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-t p-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="medical-history">
                                        Riwayat Penyakit
                                    </Label>
                                    <Textarea
                                        id="medical-history"
                                        rows={3}
                                        value={form.data.medical_history_notes}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            form.setData((data) => ({
                                                ...data,
                                                medical_history_notes: value,
                                                has_medical_history:
                                                    value.trim() !== '',
                                            }));
                                        }}
                                        placeholder="Kosongkan jika tidak ada"
                                    />
                                    <InputError
                                        message={
                                            form.errors.medical_history_notes
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="emergency-name">
                                        Nama Kontak Darurat
                                    </Label>
                                    <Input
                                        id="emergency-name"
                                        value={form.data.emergency_contact_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'emergency_contact_name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            form.errors.emergency_contact_name
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="emergency-phone">
                                        Nomor Kontak Darurat
                                    </Label>
                                    <Input
                                        id="emergency-phone"
                                        value={
                                            form.data.emergency_contact_phone
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'emergency_contact_phone',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            form.errors.emergency_contact_phone
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="emergency-relationship">
                                        Hubungan
                                    </Label>
                                    <Input
                                        id="emergency-relationship"
                                        value={
                                            form.data
                                                .emergency_contact_relationship
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'emergency_contact_relationship',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Orang tua, pasangan, saudara"
                                    />
                                    <InputError
                                        message={
                                            form.errors
                                                .emergency_contact_relationship
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Pernah Umrah Sebelumnya</Label>
                                    <Select
                                        value={
                                            form.data.has_performed_umrah
                                                ? 'yes'
                                                : 'no'
                                        }
                                        onValueChange={(value) =>
                                            form.setData(
                                                'has_performed_umrah',
                                                value === 'yes',
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no">
                                                Belum Pernah
                                            </SelectItem>
                                            <SelectItem value="yes">
                                                Sudah Pernah
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label htmlFor="referral-source">
                                        Sumber Informasi
                                    </Label>
                                    <Input
                                        id="referral-source"
                                        value={form.data.referral_source}
                                        onChange={(event) =>
                                            form.setData(
                                                'referral_source',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Keluarga, media sosial, agen, atau lainnya"
                                    />
                                    <InputError
                                        message={form.errors.referral_source}
                                    />
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t bg-background/95 py-3 backdrop-blur">
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            Peserta {slotNumber}
                        </p>
                        <div className="ml-auto flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-[#0d5c52] hover:bg-[#0a4a42]"
                            >
                                <Save className="size-4" />
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Peserta'}
                            </Button>
                        </div>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
