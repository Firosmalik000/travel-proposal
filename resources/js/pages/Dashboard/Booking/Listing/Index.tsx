import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    SheetFooter as DrawerFooter,
    SheetHeader as DrawerHeader,
    SheetTitle as DrawerTitle,
    Sheet,
    SheetContent,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronDown,
    CircleDollarSign,
    Eye,
    FileText,
    ImageIcon,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    Upload,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

type Registration = {
    id: number;
    booking_type: string;
    booking_code: string;
    travel_package_id: number;
    departure_schedule_id: number | null;
    custom_unit_price?: number | null;
    custom_total_amount?: number | null;
    full_name: string;
    phone: string;
    email: string | null;
    origin_city: string;
    passenger_count: number;
    participants_count?: number;
    revenue?: {
        currency: string;
        amount: number;
    };
    notes: string | null;
    status: string;
    created_at: string | null;
    has_review?: boolean;
    review_url?: string | null;
    travel_package: {
        code: string | null;
        slug: string | null;
        name: Record<string, string> | null;
        package_type: string | null;
    };
    departure_schedule: {
        departure_date: string | null;
        return_date: string | null;
        departure_city: string | null;
        status: string | null;
    };
};

type TravelPackageOption = {
    id: number;
    code: string | null;
    name: Record<string, string> | null;
    package_type: string | null;
    start_date?: string | null;
    end_date?: string | null;
    departure_city?: string | null;
    seats_available?: number | null;
};

type ScheduleOption = {
    id: number;
    travel_package_id: number;
    departure_date: string | null;
    return_date: string | null;
    departure_city: string | null;
    status: string | null;
    seats_available: number | null;
};

type BookingFormData = {
    travel_package_id: string;
    departure_schedule_id: string;
    custom_departure_date: string;
    custom_return_date: string;
    custom_unit_price: string;
    full_name: string;
    phone: string;
    email: string;
    origin_city: string;
    passenger_count: string;
    notes: string;
    status: string;
};

type Participant = {
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
    passport_validity_years: number | null;
    passport_scan_path: string | null;
    family_card_scan_path: string | null;
    marriage_book_scan_path: string | null;
    birth_certificate_scan_path: string | null;
    photo_path: string | null;
    meningitis_vaccine_scan_path: string | null;
    has_medical_history: boolean;
    medical_history_notes: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    has_performed_umrah: boolean;
    referral_source: string | null;
};

type ParticipantFormData = {
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

type BulkParticipantImportRow = {
    full_name: string;
    gender: string | null;
    birth_place: string;
    birth_date: string;
    marital_status: string | null;
    address: string;
    needs_wheelchair: boolean;
    shirt_size: string;
    passport_ready: boolean;
    passport_issue_date: string;
    passport_expiry_date: string;
    passport_type: string | null;
    has_medical_history: boolean;
    medical_history_notes: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    has_performed_umrah: boolean;
    referral_source: string;
    passport_scan_url: string;
    family_card_scan_url: string;
    marriage_book_scan_url: string;
    birth_certificate_scan_url: string;
    photo_url: string;
    meningitis_vaccine_scan_url: string;
};

type ParticipantImportPreviewRow = BulkParticipantImportRow & {
    row_number: number;
    is_valid: boolean;
    note: string | null;
    passport_scan_file: File | null;
    family_card_scan_file: File | null;
    marriage_book_scan_file: File | null;
    birth_certificate_scan_file: File | null;
    photo_file: File | null;
    meningitis_vaccine_scan_file: File | null;
    passport_scan_preview_url: string | null;
    family_card_scan_preview_url: string | null;
    marriage_book_scan_preview_url: string | null;
    birth_certificate_scan_preview_url: string | null;
    photo_preview_url: string | null;
    meningitis_vaccine_scan_preview_url: string | null;
};

type ParticipantImportEditableField = keyof Pick<
    ParticipantImportPreviewRow,
    | 'full_name'
    | 'gender'
    | 'birth_place'
    | 'birth_date'
    | 'marital_status'
    | 'address'
    | 'needs_wheelchair'
    | 'shirt_size'
    | 'passport_ready'
    | 'passport_issue_date'
    | 'passport_expiry_date'
    | 'passport_type'
    | 'has_medical_history'
    | 'medical_history_notes'
    | 'emergency_contact_name'
    | 'emergency_contact_phone'
    | 'emergency_contact_relationship'
    | 'has_performed_umrah'
    | 'referral_source'
    | 'passport_scan_url'
    | 'family_card_scan_url'
    | 'marriage_book_scan_url'
    | 'birth_certificate_scan_url'
    | 'photo_url'
    | 'meningitis_vaccine_scan_url'
>;

type ParticipantDocumentField = keyof Pick<
    ParticipantFormData,
    | 'passport_scan'
    | 'family_card_scan'
    | 'marriage_book_scan'
    | 'birth_certificate_scan'
    | 'photo'
    | 'meningitis_vaccine_scan'
>;

type ParticipantImportDocumentFileField =
    | 'passport_scan_file'
    | 'family_card_scan_file'
    | 'marriage_book_scan_file'
    | 'birth_certificate_scan_file'
    | 'photo_file'
    | 'meningitis_vaccine_scan_file';

type ParticipantImportDocumentPreviewField =
    | 'passport_scan_preview_url'
    | 'family_card_scan_preview_url'
    | 'marriage_book_scan_preview_url'
    | 'birth_certificate_scan_preview_url'
    | 'photo_preview_url'
    | 'meningitis_vaccine_scan_preview_url';

type ParticipantDocumentPreviewMap = Record<
    ParticipantDocumentField,
    string | null
>;

type ParticipantResponse = {
    booking: {
        id: number;
        booking_code: string;
        passenger_count: number;
        participants_count: number;
        remaining_slots: number;
    };
    participants: Participant[];
};

type BulkParticipantImportResult = {
    createdCount: number;
    savedRowNumbers: number[];
    skippedRows: Array<{
        row: number;
        name: string;
        reason: string;
    }>;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedRegistrations = {
    data: Registration[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

type Props = {
    registrations: PaginatedRegistrations;
    packages: TravelPackageOption[];
    schedules: ScheduleOption[];
    revenue: {
        by_currency: Array<{
            currency: string;
            amount: number;
            pax: number;
            bookings: number;
        }>;
    };
    filters: {
        search: string;
        status: string;
        travel_package_id?: number | null;
        booking_type?: string | null;
    };
    participant_upload_max_kilobytes: number;
};

const defaultFormData: BookingFormData = {
    travel_package_id: '',
    departure_schedule_id: '',
    custom_departure_date: '',
    custom_return_date: '',
    custom_unit_price: '',
    full_name: '',
    phone: '',
    email: '',
    origin_city: '',
    passenger_count: '1',
    notes: '',
    status: 'registered',
};

const defaultParticipantFormData: ParticipantFormData = {
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

const participantDocumentFields: ParticipantDocumentField[] = [
    'passport_scan',
    'family_card_scan',
    'marriage_book_scan',
    'birth_certificate_scan',
    'photo',
    'meningitis_vaccine_scan',
];

const participantIdentityFields: Array<keyof ParticipantFormData> = [
    'full_name',
    'gender',
    'birth_place',
    'birth_date',
    'marital_status',
    'address',
    'needs_wheelchair',
    'shirt_size',
    'passport_ready',
    'passport_issue_date',
    'passport_expiry_date',
    'passport_type',
];

const participantAdditionalFields: Array<keyof ParticipantFormData> = [
    'has_medical_history',
    'medical_history_notes',
    'emergency_contact_name',
    'emergency_contact_phone',
    'emergency_contact_relationship',
    'has_performed_umrah',
    'referral_source',
];

function emptyParticipantDocumentPreviewMap(): ParticipantDocumentPreviewMap {
    return {
        passport_scan: null,
        family_card_scan: null,
        marriage_book_scan: null,
        birth_certificate_scan: null,
        photo: null,
        meningitis_vaccine_scan: null,
    };
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
    }).format(new Date(`${value}T00:00:00`));
}

function formatParticipantImportSkipSummary(
    skippedRows: Array<{
        row: number;
        name: string;
        reason: string;
    }>,
): string {
    if (skippedRows.length === 0) {
        return '';
    }

    const groupedReasons = skippedRows.reduce<Record<string, number>>(
        (carry, skippedRow) => {
            const reason = skippedRow.reason.trim();

            carry[reason] = (carry[reason] ?? 0) + 1;

            return carry;
        },
        {},
    );

    return `${skippedRows.length} peserta dilewati: ${Object.entries(
        groupedReasons,
    )
        .map(([reason, count]) => `${count} karena ${reason}`)
        .join(', ')}.`;
}

function resolveCsrfToken(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content')
            ?.trim() ?? ''
    );
}

function statusBadgeVariant(
    status: string,
): 'default' | 'secondary' | 'outline' | 'destructive' {
    if (status === 'registered') {
        return 'default';
    }

    if (status === 'cancelled') {
        return 'destructive';
    }

    return 'secondary';
}

function participantFileName(value: string | null): string {
    if (!value) {
        return '-';
    }

    const segments = value.split('/');
    const filename = segments[segments.length - 1] ?? value;

    if (filename.length <= 28) {
        return filename;
    }

    const extensionIndex = filename.lastIndexOf('.');
    const extension = extensionIndex > -1 ? filename.slice(extensionIndex) : '';
    const basename =
        extensionIndex > -1 ? filename.slice(0, extensionIndex) : filename;

    return `${basename.slice(0, 20)}...${extension}`;
}

function toAbsoluteParticipantDocumentUrl(value: string | null): string {
    if (!value) {
        return '';
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    if (value.startsWith('/')) {
        return new URL(value, window.location.origin).toString();
    }

    return value;
}

const participantDraftDocumentInputs: Array<{
    field: ParticipantDocumentField;
    fileField: ParticipantImportDocumentFileField;
    previewField: ParticipantImportDocumentPreviewField;
    urlField: keyof Pick<
        BulkParticipantImportRow,
        | 'passport_scan_url'
        | 'family_card_scan_url'
        | 'marriage_book_scan_url'
        | 'birth_certificate_scan_url'
        | 'photo_url'
        | 'meningitis_vaccine_scan_url'
    >;
    label: string;
    description: string;
    accept: string;
}> = [
    {
        field: 'passport_scan',
        fileField: 'passport_scan_file',
        previewField: 'passport_scan_preview_url',
        urlField: 'passport_scan_url',
        label: 'Scan Paspor',
        description: 'JPG, PNG, WEBP, atau PDF',
        accept: '.jpg,.jpeg,.png,.webp,.pdf',
    },
    {
        field: 'family_card_scan',
        fileField: 'family_card_scan_file',
        previewField: 'family_card_scan_preview_url',
        urlField: 'family_card_scan_url',
        label: 'Kartu Keluarga',
        description: 'Upload KK atau isi URL file',
        accept: '.jpg,.jpeg,.png,.webp,.pdf',
    },
    {
        field: 'marriage_book_scan',
        fileField: 'marriage_book_scan_file',
        previewField: 'marriage_book_scan_preview_url',
        urlField: 'marriage_book_scan_url',
        label: 'Buku Nikah',
        description: 'Opsional jika dibutuhkan',
        accept: '.jpg,.jpeg,.png,.webp,.pdf',
    },
    {
        field: 'birth_certificate_scan',
        fileField: 'birth_certificate_scan_file',
        previewField: 'birth_certificate_scan_preview_url',
        urlField: 'birth_certificate_scan_url',
        label: 'Akta Kelahiran',
        description: 'Opsional data tambahan',
        accept: '.jpg,.jpeg,.png,.webp,.pdf',
    },
    {
        field: 'photo',
        fileField: 'photo_file',
        previewField: 'photo_preview_url',
        urlField: 'photo_url',
        label: 'Pas Foto',
        description: 'Bisa upload gambar atau isi URL foto',
        accept: 'image/png,image/jpeg,image/webp',
    },
    {
        field: 'meningitis_vaccine_scan',
        fileField: 'meningitis_vaccine_scan_file',
        previewField: 'meningitis_vaccine_scan_preview_url',
        urlField: 'meningitis_vaccine_scan_url',
        label: 'Vaksin Meningitis',
        description: 'Gambar atau PDF',
        accept: '.jpg,.jpeg,.png,.webp,.pdf',
    },
];

const normalizeSpreadsheetCell = (value: unknown): string =>
    String(value ?? '')
        .trim()
        .replace(/\s+/g, ' ');

const normalizeSpreadsheetKey = (value: string): string =>
    normalizeSpreadsheetCell(value)
        .normalize('NFKD')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '');

function parseSpreadsheetBoolean(value: unknown): boolean {
    const normalized = normalizeSpreadsheetCell(value).toLowerCase();

    return [
        '1',
        'true',
        'yes',
        'ya',
        'y',
        'siap',
        'sudah',
        'sudah pernah',
    ].includes(normalized);
}

function normalizeSpreadsheetGender(value: unknown): string | null {
    const normalized = normalizeSpreadsheetCell(value).toLowerCase();

    if (
        ['male', 'laki-laki', 'lakilaki', 'pria', 'ikhwan'].includes(normalized)
    ) {
        return 'male';
    }

    if (['female', 'perempuan', 'wanita', 'akhwat'].includes(normalized)) {
        return 'female';
    }

    return null;
}

function normalizeSpreadsheetMaritalStatus(value: unknown): string | null {
    const normalized = normalizeSpreadsheetCell(value).toLowerCase();

    if (
        ['single', 'lajang', 'belummenikah', 'belum menikah'].includes(
            normalized,
        )
    ) {
        return 'single';
    }

    if (['married', 'menikah'].includes(normalized)) {
        return 'married';
    }

    if (['divorced', 'cerai'].includes(normalized)) {
        return 'divorced';
    }

    if (['widowed', 'janda', 'duda'].includes(normalized)) {
        return 'widowed';
    }

    return null;
}

function normalizeSpreadsheetPassportType(value: unknown): string | null {
    const normalized = normalizeSpreadsheetCell(value).toLowerCase();

    if (['ordinary', 'biasa'].includes(normalized)) {
        return 'ordinary';
    }

    if (['epassport', 'e-passport', 'epassport'].includes(normalized)) {
        return 'e_passport';
    }

    if (['diplomatic', 'diplomatik'].includes(normalized)) {
        return 'diplomatic';
    }

    if (['official', 'dinas'].includes(normalized)) {
        return 'official';
    }

    return null;
}

function normalizeSpreadsheetDate(value: unknown): string {
    return normalizeSpreadsheetCell(value);
}

function validateParticipantImportRows(
    rows: ParticipantImportPreviewRow[],
    existingParticipants: Participant[],
    remainingSlots: number,
): ParticipantImportPreviewRow[] {
    const existingNames = new Set(
        existingParticipants
            .map((participant) => participant.full_name.trim().toLowerCase())
            .filter(Boolean),
    );
    const payloadNames = new Set<string>();
    let acceptedCount = 0;

    return rows.map((row) => {
        const fullName = row.full_name.trim();
        const normalizedName = fullName.toLowerCase();
        let isValid = true;
        let note: string | null = null;

        if (fullName === '') {
            isValid = false;
            note = 'Nama peserta wajib diisi.';
        } else if (existingNames.has(normalizedName)) {
            isValid = false;
            note = 'Sudah ada di data peserta.';
        } else if (payloadNames.has(normalizedName)) {
            isValid = false;
            note = 'Duplikat dalam draft import.';
        } else if (acceptedCount >= remainingSlots) {
            isValid = false;
            note = 'Melebihi sisa slot pax.';
        }

        if (isValid) {
            payloadNames.add(normalizedName);
            acceptedCount++;
        }

        return {
            ...row,
            full_name: fullName,
            is_valid: isValid,
            note,
        };
    });
}

function isImageDocument(value: File | string | null): boolean {
    if (!value) {
        return false;
    }

    if (value instanceof File) {
        return value.type.startsWith('image/');
    }

    return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(value);
}

function isPdfDocument(value: File | string | null): boolean {
    if (!value) {
        return false;
    }

    if (value instanceof File) {
        return value.type === 'application/pdf';
    }

    return /\.pdf$/i.test(value);
}

function detectPassportValidityYears(
    issuedAt: string,
    expiresAt: string,
): number | null {
    if (!issuedAt || !expiresAt) {
        return null;
    }

    const issuedDate = new Date(`${issuedAt}T00:00:00`);
    const expiryDate = new Date(`${expiresAt}T00:00:00`);

    if (
        Number.isNaN(issuedDate.getTime()) ||
        Number.isNaN(expiryDate.getTime())
    ) {
        return null;
    }

    const diffMs = expiryDate.getTime() - issuedDate.getTime();
    const years = Math.round(diffMs / (1000 * 60 * 60 * 24 * 365));

    return years > 0 ? years : null;
}

function participantDocumentCount(participant: Participant): number {
    return [
        participant.passport_scan_path,
        participant.family_card_scan_path,
        participant.marriage_book_scan_path,
        participant.birth_certificate_scan_path,
        participant.photo_path,
        participant.meningitis_vaccine_scan_path,
    ].filter(Boolean).length;
}

function participantFormDocumentCount(
    formData: ParticipantFormData,
    participant: Participant | null,
): number {
    return [
        formData.passport_scan ?? participant?.passport_scan_path,
        formData.family_card_scan ?? participant?.family_card_scan_path,
        formData.marriage_book_scan ?? participant?.marriage_book_scan_path,
        formData.birth_certificate_scan ??
            participant?.birth_certificate_scan_path,
        formData.photo ?? participant?.photo_path,
        formData.meningitis_vaccine_scan ??
            participant?.meningitis_vaccine_scan_path,
    ].filter(Boolean).length;
}

function packageDisplayName(
    travelPackage: TravelPackageOption | Registration['travel_package'],
    locale: string,
): string {
    if (typeof travelPackage.name === 'string') {
        return travelPackage.name || '-';
    }

    return travelPackage.name?.[locale] ?? travelPackage.name?.id ?? '-';
}

export default function BookingListingIndex({
    registrations,
    packages,
    schedules,
    revenue,
    filters,
    participant_upload_max_kilobytes,
}: Props) {
    const locale: 'id' | 'en' = 'id';
    const { can } = usePermission('booking_listing');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const canExport = can('export');
    const registrationItems = Array.isArray(registrations?.data)
        ? registrations.data
        : [];
    const packageOptions = useMemo(
        () => (Array.isArray(packages) ? packages : []),
        [packages],
    );
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(
        filters.status || 'registered',
    );
    const [bookingTypeFilter, setBookingTypeFilter] = useState(
        filters.booking_type || 'regular',
    );
    const [packageFilter, setPackageFilter] = useState(
        filters.travel_package_id ? String(filters.travel_package_id) : 'all',
    );
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRegistration, setEditingRegistration] =
        useState<Registration | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);
    const [isParticipantsSheetOpen, setIsParticipantsSheetOpen] =
        useState(false);
    const [participantBooking, setParticipantBooking] =
        useState<Registration | null>(null);
    const [participantItems, setParticipantItems] = useState<Participant[]>([]);
    const [editingParticipant, setEditingParticipant] =
        useState<Participant | null>(null);
    const [isParticipantLoading, setIsParticipantLoading] = useState(false);
    const [isParticipantImporting, setIsParticipantImporting] = useState(false);
    const [participantImportPreviewRows, setParticipantImportPreviewRows] =
        useState<ParticipantImportPreviewRow[]>([]);
    const [participantImportFileName, setParticipantImportFileName] =
        useState('');
    const [participantDocumentPreviews, setParticipantDocumentPreviews] =
        useState<ParticipantDocumentPreviewMap>(
            emptyParticipantDocumentPreviewMap(),
        );
    const [expandedParticipantImportRows, setExpandedParticipantImportRows] =
        useState<number[]>([]);
    const [
        expandedParticipantFormSections,
        setExpandedParticipantFormSections,
    ] = useState<string[]>(['identity', 'documents', 'additional']);
    const participantImportInputRef = useRef<HTMLInputElement | null>(null);
    const participantFormContainerRef = useRef<HTMLDivElement | null>(null);
    const debouncedSearch = useDebounce(search, 300);
    const isEditingCustomBooking =
        editingRegistration?.booking_type === 'custom';

    const form = useForm<BookingFormData>(defaultFormData);
    const participantForm = useForm<ParticipantFormData>(
        defaultParticipantFormData,
    );
    const computedCustomTotal =
        isEditingCustomBooking && form.data.custom_unit_price
            ? (Number(form.data.custom_unit_price) || 0) *
              (Number(form.data.passenger_count) || 0)
            : 0;
    const computedPassportValidityYears = detectPassportValidityYears(
        participantForm.data.passport_issue_date,
        participantForm.data.passport_expiry_date,
    );
    const editingParticipantDocumentCount = editingParticipant
        ? participantDocumentCount(editingParticipant)
        : 0;
    const participantFormDocumentTotal = participantFormDocumentCount(
        participantForm.data,
        editingParticipant,
    );
    const participantCapacity = participantBooking?.passenger_count ?? 0;
    const participantCount = participantItems.length;
    const participantSlotsRemaining = Math.max(
        participantCapacity - participantCount,
        0,
    );
    const participantImportValidRows = participantImportPreviewRows.filter(
        (row) => row.is_valid,
    );
    const participantImportSkippedCount =
        participantImportPreviewRows.length - participantImportValidRows.length;
    const participantUploadMaxBytes = participant_upload_max_kilobytes * 1024;
    const participantUploadMaxLabel = `${Math.max(
        1,
        Math.round(participant_upload_max_kilobytes / 1024),
    )} MB`;
    const participantPassportScanFile = participantForm.data.passport_scan;
    const participantFamilyCardScanFile = participantForm.data.family_card_scan;
    const participantMarriageBookScanFile =
        participantForm.data.marriage_book_scan;
    const participantBirthCertificateScanFile =
        participantForm.data.birth_certificate_scan;
    const participantPhotoFile = participantForm.data.photo;
    const participantMeningitisVaccineScanFile =
        participantForm.data.meningitis_vaccine_scan;
    const participantDocumentInputs = [
        {
            field: 'passport_scan' as const,
            label: 'Scan Paspor',
            description: `JPG, PNG, WEBP, atau PDF - maks ${participantUploadMaxLabel}`,
            existing: editingParticipant?.passport_scan_path ?? null,
            error: participantForm.errors.passport_scan,
        },
        {
            field: 'family_card_scan' as const,
            label: 'Kartu Keluarga',
            description: `Upload KK terbaru - maks ${participantUploadMaxLabel}`,
            existing: editingParticipant?.family_card_scan_path ?? null,
            error: participantForm.errors.family_card_scan,
        },
        {
            field: 'marriage_book_scan' as const,
            label: 'Buku Nikah',
            description: `Opsional jika dibutuhkan - maks ${participantUploadMaxLabel}`,
            existing: editingParticipant?.marriage_book_scan_path ?? null,
            error: participantForm.errors.marriage_book_scan,
        },
        {
            field: 'birth_certificate_scan' as const,
            label: 'Akta Kelahiran',
            description: `Untuk kebutuhan data tambahan - maks ${participantUploadMaxLabel}`,
            existing: editingParticipant?.birth_certificate_scan_path ?? null,
            error: participantForm.errors.birth_certificate_scan,
        },
        {
            field: 'photo' as const,
            label: 'Pas Foto',
            description: `Disarankan latar terang - maks ${participantUploadMaxLabel}`,
            existing: editingParticipant?.photo_path ?? null,
            error: participantForm.errors.photo,
        },
        {
            field: 'meningitis_vaccine_scan' as const,
            label: 'Vaksin Meningitis',
            description: `Bisa gambar atau PDF - maks ${participantUploadMaxLabel}`,
            existing: editingParticipant?.meningitis_vaccine_scan_path ?? null,
            error: participantForm.errors.meningitis_vaccine_scan,
        },
    ];

    useEffect(() => {
        const nextPreviews = emptyParticipantDocumentPreviewMap();
        const documentFiles: Record<ParticipantDocumentField, File | null> = {
            passport_scan: participantPassportScanFile,
            family_card_scan: participantFamilyCardScanFile,
            marriage_book_scan: participantMarriageBookScanFile,
            birth_certificate_scan: participantBirthCertificateScanFile,
            photo: participantPhotoFile,
            meningitis_vaccine_scan: participantMeningitisVaccineScanFile,
        };

        participantDocumentFields.forEach((field) => {
            const file = documentFiles[field];

            if (file instanceof File) {
                nextPreviews[field] = URL.createObjectURL(file);
            }
        });

        setParticipantDocumentPreviews(nextPreviews);

        return () => {
            Object.values(nextPreviews).forEach((previewUrl) => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            });
        };
    }, [
        participantBirthCertificateScanFile,
        participantFamilyCardScanFile,
        participantMarriageBookScanFile,
        participantMeningitisVaccineScanFile,
        participantPassportScanFile,
        participantPhotoFile,
    ]);

    useEffect(() => {
        const errorFields = Object.keys(participantForm.errors) as Array<
            keyof ParticipantFormData
        >;

        if (errorFields.length === 0) {
            return;
        }

        const sectionsToOpen = new Set<string>();

        if (
            errorFields.some((field) =>
                participantIdentityFields.includes(field),
            )
        ) {
            sectionsToOpen.add('identity');
        }

        if (
            errorFields.some((field) =>
                participantDocumentFields.includes(
                    field as ParticipantDocumentField,
                ),
            )
        ) {
            sectionsToOpen.add('documents');
        }

        if (
            errorFields.some((field) =>
                participantAdditionalFields.includes(field),
            )
        ) {
            sectionsToOpen.add('additional');
        }

        if (sectionsToOpen.size > 0) {
            setExpandedParticipantFormSections((current) => [
                ...new Set([...current, ...sectionsToOpen]),
            ]);
        }

        participantFormContainerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, [participantForm.errors]);

    function formatCurrency(amount: number, currency: string): string {
        if (!Number.isFinite(amount)) {
            return '-';
        }

        try {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: currency || 'IDR',
                maximumFractionDigits: 0,
            }).format(amount);
        } catch {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            }).format(amount);
        }
    }

    const primaryRevenue = revenue?.by_currency?.[0] ?? null;

    const stats = [
        {
            label: 'Total Booking',
            value: registrations.total,
            icon: CircleDollarSign,
        },
        {
            label: 'Revenue (Estimasi)',
            value: primaryRevenue
                ? formatCurrency(primaryRevenue.amount, primaryRevenue.currency)
                : formatCurrency(0, 'IDR'),
            icon: CircleDollarSign,
        },
        {
            label: 'Registered',
            value: registrationItems.filter(
                (registration) => registration.status === 'registered',
            ).length,
            icon: CalendarDays,
        },
        {
            label: 'Total Pax',
            value: registrationItems.reduce(
                (total, registration) => total + registration.passenger_count,
                0,
            ),
            icon: Users,
        },
    ];

    function openCreateDialog(): void {
        if (!canCreate) {
            return;
        }

        setEditingRegistration(null);
        form.reset();
        form.clearErrors();
        setIsDialogOpen(true);
    }

    function openEditDialog(registration: Registration): void {
        if (!canEdit) {
            return;
        }

        setEditingRegistration(registration);

        form.setData({
            travel_package_id: String(registration.travel_package_id),
            departure_schedule_id: registration.departure_schedule_id
                ? String(registration.departure_schedule_id)
                : '',
            custom_departure_date:
                registration.booking_type === 'custom'
                    ? (registration.departure_schedule.departure_date ?? '')
                    : '',
            custom_return_date:
                registration.booking_type === 'custom'
                    ? (registration.departure_schedule.return_date ?? '')
                    : '',
            custom_unit_price:
                registration.booking_type === 'custom' &&
                typeof registration.custom_unit_price === 'number'
                    ? String(registration.custom_unit_price)
                    : '',
            full_name: registration.full_name,
            phone: registration.phone,
            email: registration.email ?? '',
            origin_city: registration.origin_city,
            passenger_count: String(registration.passenger_count),
            notes: registration.notes ?? '',
            status: registration.status,
        });
        form.clearErrors();
        setIsDialogOpen(true);
    }

    function applyFilters(
        nextSearch: string,
        nextStatus: string,
        nextBookingType: string,
        nextPackageId: string,
    ): void {
        router.get(
            '/admin/booking-management/listing',
            {
                search: nextSearch || undefined,
                status: nextStatus || 'registered',
                booking_type:
                    nextBookingType === 'regular' ? undefined : nextBookingType,
                travel_package_id:
                    nextPackageId === 'all' ? undefined : nextPackageId,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function openFilteredPdf(): void {
        if (!canExport) {
            return;
        }

        const params = new URLSearchParams();

        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        }

        if (statusFilter && statusFilter !== 'registered') {
            params.set('status', statusFilter);
        }

        if (packageFilter && packageFilter !== 'all') {
            params.set('travel_package_id', packageFilter);
        }

        if (bookingTypeFilter && bookingTypeFilter !== 'regular') {
            params.set('booking_type', bookingTypeFilter);
        }

        const url = `/admin/booking-management/listing.pdf${
            params.toString() ? `?${params.toString()}` : ''
        }`;

        window.open(url, '_blank', 'noopener,noreferrer');
    }

    useEffect(() => {
        if (
            debouncedSearch === (filters.search ?? '') &&
            statusFilter === (filters.status || 'registered') &&
            bookingTypeFilter === (filters.booking_type || 'regular') &&
            packageFilter ===
                (filters.travel_package_id
                    ? String(filters.travel_package_id)
                    : 'all')
        ) {
            return;
        }

        applyFilters(
            debouncedSearch,
            statusFilter,
            bookingTypeFilter,
            packageFilter,
        );
    }, [
        debouncedSearch,
        filters.search,
        filters.status,
        filters.travel_package_id,
        filters.booking_type,
        bookingTypeFilter,
        packageFilter,
        statusFilter,
    ]);

    function handlePackageChange(value: string): void {
        form.setData((data) => ({
            ...data,
            travel_package_id: value,
            departure_schedule_id: '',
        }));
    }

    function resetParticipantForm(): void {
        setEditingParticipant(null);
        participantForm.setData(defaultParticipantFormData);
        participantForm.clearErrors();
        setExpandedParticipantFormSections([
            'identity',
            'documents',
            'additional',
        ]);
    }

    function downloadParticipantTemplate(): void {
        const headers = [
            'full_name',
            'gender',
            'birth_place',
            'birth_date',
            'marital_status',
            'address',
            'needs_wheelchair',
            'shirt_size',
            'passport_ready',
            'passport_issue_date',
            'passport_expiry_date',
            'passport_type',
            'has_medical_history',
            'medical_history_notes',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relationship',
            'has_performed_umrah',
            'referral_source',
            'passport_scan_url',
            'family_card_scan_url',
            'marriage_book_scan_url',
            'birth_certificate_scan_url',
            'photo_url',
            'meningitis_vaccine_scan_url',
        ];
        const guideRows = [
            ['field', 'keterangan', 'contoh / nilai valid'],
            ['gender', 'Jenis kelamin', 'male | female'],
            ['birth_date', 'Tanggal lahir format spreadsheet', '1989-05-12'],
            [
                'marital_status',
                'Status pernikahan',
                'single | married | divorced | widowed',
            ],
            ['needs_wheelchair', 'Butuh kursi roda', 'yes | no'],
            ['shirt_size', 'Ukuran baju', 'XS | S | M | L | XL | XXL | XXXL'],
            ['passport_ready', 'Paspor siap', 'yes | no'],
            ['passport_issue_date', 'Tanggal terbit paspor', '2021-01-10'],
            ['passport_expiry_date', 'Tanggal habis paspor', '2031-01-10'],
            [
                'passport_type',
                'Tipe paspor',
                'ordinary | e_passport | diplomatic | official',
            ],
            ['has_medical_history', 'Ada riwayat penyakit', 'yes | no'],
            ['has_performed_umrah', 'Pernah umrah sebelumnya', 'yes | no'],
            [
                'passport_scan_url',
                'Boleh URL http(s), /storage/... atau path lokal repo',
                'docs/2.jpg atau https://example.com/passport.jpg',
            ],
            [
                'photo_url',
                'Boleh URL http(s), /storage/... atau path lokal repo',
                'docs/mock.png atau https://example.com/photo.jpg',
            ],
        ];
        const sampleRows = [
            [
                'Ahmad Fauzi',
                'male',
                'Surabaya',
                '1989-05-12',
                'married',
                'Jl. Mawar No. 10, Surabaya',
                'no',
                'L',
                'yes',
                '2021-01-10',
                '2031-01-10',
                'ordinary',
                'no',
                '',
                'Siti Aminah',
                '081234567890',
                'Istri',
                'yes',
                'Instagram',
                'docs/2.jpg',
                'docs/3.jpg',
                'docs/4.jpg',
                'docs/5.jpg',
                'docs/mock.png',
                'docs/nomer warna.jpeg',
            ],
            [
                'Nur Aisyah',
                'female',
                'Malang',
                '1993-11-21',
                'single',
                'Jl. Kenanga No. 8, Malang',
                'no',
                'M',
                'yes',
                '2022-03-14',
                '2032-03-14',
                'e_passport',
                'yes',
                'Alergi dingin',
                'Ahmad Hidayat',
                '081298765432',
                'Saudara',
                'no',
                'Google Form',
                'docs/2.jpg',
                'docs/3.jpg',
                '',
                '',
                'docs/mock.png',
                '',
            ],
            [
                'Budi Santoso',
                'male',
                'Jakarta',
                '1985-01-08',
                'married',
                'Jl. Melati No. 15, Jakarta',
                'yes',
                'XL',
                'no',
                '',
                '',
                '',
                'no',
                '',
                'Rina Santoso',
                '081277700011',
                'Istri',
                'yes',
                'Referensi teman',
                '',
                '',
                'docs/4.jpg',
                'docs/5.jpg',
                '',
                'docs/nomer warna.jpeg',
            ],
        ];

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
        const guideWorksheet = XLSX.utils.aoa_to_sheet(guideRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'participant_template',
        );
        XLSX.utils.book_append_sheet(workbook, guideWorksheet, 'petunjuk');
        XLSX.writeFile(workbook, 'participant_import_template.xlsx');
    }

    function exportParticipantSpreadsheet(): void {
        if (!participantBooking) {
            return;
        }

        const rows = participantItems.map((participant) => ({
            full_name: participant.full_name,
            gender:
                participant.gender === 'male'
                    ? 'male'
                    : participant.gender === 'female'
                      ? 'female'
                      : '',
            birth_place: participant.birth_place ?? '',
            birth_date: participant.birth_date ?? '',
            marital_status: participant.marital_status ?? '',
            address: participant.address ?? '',
            needs_wheelchair: participant.needs_wheelchair ? 'yes' : 'no',
            shirt_size: participant.shirt_size ?? '',
            passport_ready: participant.passport_ready ? 'yes' : 'no',
            passport_issue_date: participant.passport_issue_date ?? '',
            passport_expiry_date: participant.passport_expiry_date ?? '',
            passport_type: participant.passport_type ?? '',
            has_medical_history: participant.has_medical_history ? 'yes' : 'no',
            medical_history_notes: participant.medical_history_notes ?? '',
            emergency_contact_name: participant.emergency_contact_name ?? '',
            emergency_contact_phone: participant.emergency_contact_phone ?? '',
            emergency_contact_relationship:
                participant.emergency_contact_relationship ?? '',
            has_performed_umrah: participant.has_performed_umrah ? 'yes' : 'no',
            referral_source: participant.referral_source ?? '',
            passport_scan_url: toAbsoluteParticipantDocumentUrl(
                participant.passport_scan_path,
            ),
            family_card_scan_url: toAbsoluteParticipantDocumentUrl(
                participant.family_card_scan_path,
            ),
            marriage_book_scan_url: toAbsoluteParticipantDocumentUrl(
                participant.marriage_book_scan_path,
            ),
            birth_certificate_scan_url: toAbsoluteParticipantDocumentUrl(
                participant.birth_certificate_scan_path,
            ),
            photo_url: toAbsoluteParticipantDocumentUrl(participant.photo_path),
            meningitis_vaccine_scan_url: toAbsoluteParticipantDocumentUrl(
                participant.meningitis_vaccine_scan_path,
            ),
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'participants');
        XLSX.writeFile(
            workbook,
            `participants-${participantBooking.booking_code}.xlsx`,
        );
    }

    function buildParticipantImportRows(
        rows: Record<string, unknown>[],
    ): ParticipantImportPreviewRow[] {
        const draftRows = rows
            .map<ParticipantImportPreviewRow | null>((row, index) => {
                const normalizedRow = Object.entries(row).reduce<
                    Record<string, unknown>
                >((carry, [key, value]) => {
                    carry[normalizeSpreadsheetKey(key)] = value;

                    return carry;
                }, {});

                const fullName = normalizeSpreadsheetCell(
                    normalizedRow.fullname,
                );

                if (fullName === '') {
                    return null;
                }

                return {
                    row_number: index + 2,
                    full_name: fullName,
                    gender: normalizeSpreadsheetGender(normalizedRow.gender),
                    birth_place: normalizeSpreadsheetCell(
                        normalizedRow.birthplace,
                    ),
                    birth_date: normalizeSpreadsheetDate(
                        normalizedRow.birthdate,
                    ),
                    marital_status: normalizeSpreadsheetMaritalStatus(
                        normalizedRow.maritalstatus,
                    ),
                    address: normalizeSpreadsheetCell(normalizedRow.address),
                    needs_wheelchair: parseSpreadsheetBoolean(
                        normalizedRow.needswheelchair,
                    ),
                    shirt_size: normalizeSpreadsheetCell(
                        normalizedRow.shirtsize,
                    ).toUpperCase(),
                    passport_ready: parseSpreadsheetBoolean(
                        normalizedRow.passportready,
                    ),
                    passport_issue_date: normalizeSpreadsheetDate(
                        normalizedRow.passportissuedate,
                    ),
                    passport_expiry_date: normalizeSpreadsheetDate(
                        normalizedRow.passportexpirydate,
                    ),
                    passport_type: normalizeSpreadsheetPassportType(
                        normalizedRow.passporttype,
                    ),
                    has_medical_history: parseSpreadsheetBoolean(
                        normalizedRow.hasmedicalhistory,
                    ),
                    medical_history_notes: normalizeSpreadsheetCell(
                        normalizedRow.medicalhistorynotes,
                    ),
                    emergency_contact_name: normalizeSpreadsheetCell(
                        normalizedRow.emergencycontactname,
                    ),
                    emergency_contact_phone: normalizeSpreadsheetCell(
                        normalizedRow.emergencycontactphone,
                    ),
                    emergency_contact_relationship: normalizeSpreadsheetCell(
                        normalizedRow.emergencycontactrelationship,
                    ),
                    has_performed_umrah: parseSpreadsheetBoolean(
                        normalizedRow.hasperformedumrah,
                    ),
                    referral_source: normalizeSpreadsheetCell(
                        normalizedRow.referralsource,
                    ),
                    passport_scan_url: normalizeSpreadsheetCell(
                        normalizedRow.passportscanurl,
                    ),
                    family_card_scan_url: normalizeSpreadsheetCell(
                        normalizedRow.familycardscanurl,
                    ),
                    marriage_book_scan_url: normalizeSpreadsheetCell(
                        normalizedRow.marriagebookscanurl,
                    ),
                    birth_certificate_scan_url: normalizeSpreadsheetCell(
                        normalizedRow.birthcertificatescanurl,
                    ),
                    photo_url: normalizeSpreadsheetCell(normalizedRow.photourl),
                    meningitis_vaccine_scan_url: normalizeSpreadsheetCell(
                        normalizedRow.meningitisvaccinescanurl,
                    ),
                    passport_scan_file: null,
                    family_card_scan_file: null,
                    marriage_book_scan_file: null,
                    birth_certificate_scan_file: null,
                    photo_file: null,
                    meningitis_vaccine_scan_file: null,
                    passport_scan_preview_url: null,
                    family_card_scan_preview_url: null,
                    marriage_book_scan_preview_url: null,
                    birth_certificate_scan_preview_url: null,
                    photo_preview_url: null,
                    meningitis_vaccine_scan_preview_url: null,
                    is_valid: true,
                    note: null as string | null,
                };
            })
            .filter((participant): participant is ParticipantImportPreviewRow =>
                Boolean(participant),
            );

        return validateParticipantImportRows(
            draftRows,
            participantItems,
            participantSlotsRemaining,
        );
    }

    function syncParticipantCount(registrationId: number, count: number): void {
        setParticipantBooking((current) =>
            current && current.id === registrationId
                ? { ...current, participants_count: count }
                : current,
        );
    }

    async function loadParticipants(registration: Registration): Promise<void> {
        setIsParticipantLoading(true);

        try {
            const response = await fetch(
                `/admin/booking-management/listing/${registration.id}/participants`,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Gagal memuat data peserta.');
            }

            const payload = (await response.json()) as ParticipantResponse;

            setParticipantBooking({
                ...registration,
                participants_count: payload.booking.participants_count,
            });
            setParticipantItems(payload.participants);
            syncParticipantCount(
                registration.id,
                payload.booking.participants_count,
            );
        } finally {
            setIsParticipantLoading(false);
        }
    }

    function clearParticipantImportDraft(): void {
        participantImportPreviewRows.forEach((row) => {
            participantDraftDocumentInputs.forEach((documentField) => {
                const previewUrl = row[documentField.previewField];

                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            });
        });

        setParticipantImportPreviewRows([createEmptyParticipantDraftRow(2)]);
        setParticipantImportFileName('');
        setExpandedParticipantImportRows([2]);
    }

    function removeParticipantImportDraftRows(rowNumbers: number[]): void {
        if (rowNumbers.length === 0) {
            return;
        }

        const rowNumberSet = new Set(rowNumbers);
        const remainingRows = participantImportPreviewRows.filter((row) => {
            if (!rowNumberSet.has(row.row_number)) {
                return true;
            }

            participantDraftDocumentInputs.forEach((documentField) => {
                const previewUrl = row[documentField.previewField];

                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            });

            return false;
        });

        if (remainingRows.length === 0) {
            setParticipantImportPreviewRows([
                createEmptyParticipantDraftRow(2),
            ]);
            setExpandedParticipantImportRows([2]);
            setParticipantImportFileName('');

            return;
        }

        const normalizedRows = remainingRows.map((row, index) => ({
            ...row,
            row_number: index + 2,
        }));

        setParticipantImportPreviewRows(
            validateParticipantImportRows(
                normalizedRows,
                participantItems,
                participantSlotsRemaining,
            ),
        );
        setExpandedParticipantImportRows((current) => {
            const nextExpandedRows = current
                .filter((value) => !rowNumberSet.has(value))
                .map((value) => {
                    const removedBefore = rowNumbers.filter(
                        (rowNumber) => rowNumber < value,
                    ).length;

                    return value - removedBefore;
                })
                .filter(
                    (value, index, values) => values.indexOf(value) === index,
                )
                .filter((value) => value >= 2);

            return nextExpandedRows.length > 0 ? nextExpandedRows : [2];
        });
    }

    function createEmptyParticipantDraftRow(
        rowNumber = participantImportPreviewRows.length + 2,
    ): ParticipantImportPreviewRow {
        return {
            row_number: rowNumber,
            full_name: '',
            gender: null,
            birth_place: '',
            birth_date: '',
            marital_status: null,
            address: '',
            needs_wheelchair: false,
            shirt_size: '',
            passport_ready: false,
            passport_issue_date: '',
            passport_expiry_date: '',
            passport_type: null,
            has_medical_history: false,
            medical_history_notes: '',
            emergency_contact_name: '',
            emergency_contact_phone: '',
            emergency_contact_relationship: '',
            has_performed_umrah: false,
            referral_source: '',
            passport_scan_url: '',
            family_card_scan_url: '',
            marriage_book_scan_url: '',
            birth_certificate_scan_url: '',
            photo_url: '',
            meningitis_vaccine_scan_url: '',
            passport_scan_file: null,
            family_card_scan_file: null,
            marriage_book_scan_file: null,
            birth_certificate_scan_file: null,
            photo_file: null,
            meningitis_vaccine_scan_file: null,
            passport_scan_preview_url: null,
            family_card_scan_preview_url: null,
            marriage_book_scan_preview_url: null,
            birth_certificate_scan_preview_url: null,
            photo_preview_url: null,
            meningitis_vaccine_scan_preview_url: null,
            is_valid: false,
            note: 'Nama peserta wajib diisi.',
        };
    }

    function addParticipantDraftRow(): void {
        const nextRows = [
            ...participantImportPreviewRows,
            createEmptyParticipantDraftRow(),
        ].map((row, index) => ({
            ...row,
            row_number: index + 2,
        }));

        setParticipantImportPreviewRows(
            validateParticipantImportRows(
                nextRows,
                participantItems,
                participantSlotsRemaining,
            ),
        );
        setExpandedParticipantImportRows((current) => [
            ...current,
            nextRows.length + 1,
        ]);
    }

    function updateParticipantImportDraftRow(
        rowNumber: number,
        field: ParticipantImportEditableField,
        value: string | boolean | null,
    ): void {
        const nextRows = participantImportPreviewRows.map((row) =>
            row.row_number === rowNumber ? { ...row, [field]: value } : row,
        );

        setParticipantImportPreviewRows(
            validateParticipantImportRows(
                nextRows,
                participantItems,
                participantSlotsRemaining,
            ),
        );
    }

    function handleParticipantImportDraftFileChange(
        rowNumber: number,
        documentField: (typeof participantDraftDocumentInputs)[number],
        event: React.ChangeEvent<HTMLInputElement>,
    ): void {
        const file = event.target.files?.[0] ?? null;

        if (file && file.size > participantUploadMaxBytes) {
            toast.error(
                `Ukuran file ${documentField.label} maksimal ${participantUploadMaxLabel}.`,
            );
            event.target.value = '';

            return;
        }

        setParticipantImportPreviewRows((current) =>
            validateParticipantImportRows(
                current.map((row) => {
                    if (row.row_number !== rowNumber) {
                        return row;
                    }

                    const previousPreview = row[documentField.previewField];
                    if (previousPreview) {
                        URL.revokeObjectURL(previousPreview);
                    }

                    return {
                        ...row,
                        [documentField.fileField]: file,
                        [documentField.previewField]: file
                            ? URL.createObjectURL(file)
                            : null,
                    };
                }),
                participantItems,
                participantSlotsRemaining,
            ),
        );
    }

    function clearParticipantImportDraftFile(
        rowNumber: number,
        documentField: (typeof participantDraftDocumentInputs)[number],
    ): void {
        setParticipantImportPreviewRows((current) =>
            validateParticipantImportRows(
                current.map((row) => {
                    if (row.row_number !== rowNumber) {
                        return row;
                    }

                    const previousPreview = row[documentField.previewField];
                    if (previousPreview) {
                        URL.revokeObjectURL(previousPreview);
                    }

                    return {
                        ...row,
                        [documentField.fileField]: null,
                        [documentField.previewField]: null,
                    };
                }),
                participantItems,
                participantSlotsRemaining,
            ),
        );
    }

    function draftRowHasUploadedFiles(
        row: ParticipantImportPreviewRow,
    ): boolean {
        return participantDraftDocumentInputs.some(
            (documentField) => row[documentField.fileField] instanceof File,
        );
    }

    function toBulkParticipantImportPayload(
        row: ParticipantImportPreviewRow,
    ): BulkParticipantImportRow {
        return {
            full_name: row.full_name,
            gender: row.gender,
            birth_place: row.birth_place,
            birth_date: row.birth_date,
            marital_status: row.marital_status,
            address: row.address,
            needs_wheelchair: row.needs_wheelchair,
            shirt_size: row.shirt_size,
            passport_ready: row.passport_ready,
            passport_issue_date: row.passport_issue_date,
            passport_expiry_date: row.passport_expiry_date,
            passport_type: row.passport_type,
            has_medical_history: row.has_medical_history,
            medical_history_notes: row.medical_history_notes,
            emergency_contact_name: row.emergency_contact_name,
            emergency_contact_phone: row.emergency_contact_phone,
            emergency_contact_relationship: row.emergency_contact_relationship,
            has_performed_umrah: row.has_performed_umrah,
            referral_source: row.referral_source,
            passport_scan_url: row.passport_scan_url,
            family_card_scan_url: row.family_card_scan_url,
            marriage_book_scan_url: row.marriage_book_scan_url,
            birth_certificate_scan_url: row.birth_certificate_scan_url,
            photo_url: row.photo_url,
            meningitis_vaccine_scan_url: row.meningitis_vaccine_scan_url,
        };
    }

    async function saveDraftParticipantsWithoutFiles(
        bookingId: number,
        rows: ParticipantImportPreviewRow[],
        csrfToken: string,
    ): Promise<BulkParticipantImportResult> {
        if (rows.length === 0) {
            return {
                createdCount: 0,
                savedRowNumbers: [],
                skippedRows: [],
            };
        }

        const response = await fetch(
            `/admin/booking-management/listing/${bookingId}/participants/import`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken !== '' ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    _token: csrfToken,
                    participants: rows.map(toBulkParticipantImportPayload),
                }),
            },
        );

        const rawPayload = await response.text();
        let payload: {
            message?: string;
            created_count?: number;
            skipped_rows?: Array<{
                row: number;
                name: string;
                reason: string;
            }>;
            errors?: Record<string, string[]>;
        };

        try {
            payload = rawPayload
                ? (JSON.parse(rawPayload) as typeof payload)
                : {};
        } catch {
            payload = {};
        }

        if (!response.ok) {
            const validationMessages = Object.values(payload.errors ?? {})
                .flat()
                .join(' ');
            throw new Error(
                validationMessages ||
                    payload.message ||
                    'Import data peserta gagal diproses.',
            );
        }

        const skippedRows = payload.skipped_rows ?? [];
        const skippedRowNumbers = new Set(skippedRows.map((item) => item.row));
        const savedRowNumbers = rows
            .filter((_, index) => !skippedRowNumbers.has(index + 2))
            .map((row) => row.row_number);

        return {
            createdCount: payload.created_count ?? savedRowNumbers.length,
            savedRowNumbers,
            skippedRows,
        };
    }

    async function saveDraftParticipantWithFiles(
        bookingId: number,
        row: ParticipantImportPreviewRow,
        csrfToken: string,
    ): Promise<void> {
        const payload = new FormData();
        payload.append('_token', csrfToken);
        payload.append('full_name', row.full_name);
        payload.append('gender', row.gender ?? '');
        payload.append('birth_place', row.birth_place);
        payload.append('birth_date', row.birth_date);
        payload.append('marital_status', row.marital_status ?? '');
        payload.append('address', row.address);
        payload.append('needs_wheelchair', row.needs_wheelchair ? '1' : '0');
        payload.append('shirt_size', row.shirt_size);
        payload.append('passport_ready', row.passport_ready ? '1' : '0');
        payload.append('passport_issue_date', row.passport_issue_date);
        payload.append('passport_expiry_date', row.passport_expiry_date);
        payload.append('passport_type', row.passport_type ?? '');
        payload.append(
            'has_medical_history',
            row.has_medical_history ? '1' : '0',
        );
        payload.append('medical_history_notes', row.medical_history_notes);
        payload.append('emergency_contact_name', row.emergency_contact_name);
        payload.append('emergency_contact_phone', row.emergency_contact_phone);
        payload.append(
            'emergency_contact_relationship',
            row.emergency_contact_relationship,
        );
        payload.append(
            'has_performed_umrah',
            row.has_performed_umrah ? '1' : '0',
        );
        payload.append('referral_source', row.referral_source);
        payload.append('passport_scan_url', row.passport_scan_url);
        payload.append('family_card_scan_url', row.family_card_scan_url);
        payload.append('marriage_book_scan_url', row.marriage_book_scan_url);
        payload.append(
            'birth_certificate_scan_url',
            row.birth_certificate_scan_url,
        );
        payload.append('photo_url', row.photo_url);
        payload.append(
            'meningitis_vaccine_scan_url',
            row.meningitis_vaccine_scan_url,
        );

        participantDraftDocumentInputs.forEach((documentField) => {
            const selectedFile = row[documentField.fileField];

            if (selectedFile) {
                payload.append(documentField.field, selectedFile);
            }
        });

        const response = await fetch(
            `/admin/booking-management/listing/${bookingId}/participants`,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken !== '' ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                credentials: 'same-origin',
                body: payload,
            },
        );

        if (!response.ok) {
            let errorMessage = `Data peserta ${row.full_name} gagal disimpan.`;

            try {
                const errorPayload = (await response.json()) as {
                    errors?: Record<string, string[]>;
                    message?: string;
                };
                const validationMessages = Object.values(
                    errorPayload.errors ?? {},
                )
                    .flat()
                    .join(' ');

                errorMessage =
                    validationMessages || errorPayload.message || errorMessage;
            } catch {
                errorMessage = `Data peserta ${row.full_name} gagal disimpan.`;
            }

            throw new Error(errorMessage);
        }
    }

    function toggleParticipantImportRow(rowNumber: number): void {
        setExpandedParticipantImportRows((current) =>
            current.includes(rowNumber)
                ? current.filter((value) => value !== rowNumber)
                : [...current, rowNumber],
        );
    }

    function toggleParticipantFormSection(section: string): void {
        setExpandedParticipantFormSections((current) =>
            current.includes(section)
                ? current.filter((value) => value !== section)
                : [...current, section],
        );
    }

    function removeParticipantImportDraftRow(rowNumber: number): void {
        const nextRows = participantImportPreviewRows
            .filter((row) => row.row_number !== rowNumber)
            .map((row, index) => ({
                ...row,
                row_number: index + 2,
            }));

        setParticipantImportPreviewRows(
            validateParticipantImportRows(
                nextRows,
                participantItems,
                participantSlotsRemaining,
            ),
        );
        setExpandedParticipantImportRows((current) =>
            current
                .filter((value) => value !== rowNumber)
                .map((value) => (value > rowNumber ? value - 1 : value)),
        );
    }

    async function saveParticipantImportDraft(): Promise<void> {
        if (participantImportValidRows.length === 0) {
            toast.error('Tidak ada baris valid untuk diimpor.');

            return;
        }

        if (!participantBooking) {
            return;
        }

        setIsParticipantImporting(true);
        const bookingId = participantBooking.id;
        const savedRowNumbers: number[] = [];
        const skippedRows: Array<{
            row: number;
            name: string;
            reason: string;
        }> = [];

        try {
            const csrfToken = resolveCsrfToken();

            if (csrfToken === '') {
                throw new Error(
                    'Token keamanan tidak ditemukan. Silakan refresh halaman lalu coba import lagi.',
                );
            }

            const rowsWithoutFiles = participantImportValidRows.filter(
                (row) => !draftRowHasUploadedFiles(row),
            );
            const rowsWithFiles = participantImportValidRows.filter((row) =>
                draftRowHasUploadedFiles(row),
            );
            let successCount = 0;

            const bulkResult = await saveDraftParticipantsWithoutFiles(
                bookingId,
                rowsWithoutFiles,
                csrfToken,
            );
            successCount += bulkResult.createdCount;
            savedRowNumbers.push(...bulkResult.savedRowNumbers);
            skippedRows.push(...bulkResult.skippedRows);

            for (const row of rowsWithFiles) {
                await saveDraftParticipantWithFiles(bookingId, row, csrfToken);
                successCount++;
                savedRowNumbers.push(row.row_number);
            }

            refreshParticipantListing(bookingId);
            toast.success(
                skippedRows.length > 0
                    ? `${successCount} peserta berhasil disimpan. ${formatParticipantImportSkipSummary(skippedRows)}`
                    : `${successCount} peserta berhasil disimpan.`,
            );
            clearParticipantImportDraft();
        } catch (error) {
            refreshParticipantListing(bookingId);

            if (savedRowNumbers.length > 0) {
                removeParticipantImportDraftRows(savedRowNumbers);
            }

            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Import data peserta gagal diproses.',
            );
        } finally {
            setIsParticipantImporting(false);
        }
    }

    function handleParticipantImportFile(
        event: React.ChangeEvent<HTMLInputElement>,
    ): void {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !['xlsx', 'xls', 'csv'].includes(extension)) {
            toast.error('File import peserta harus berformat Excel atau CSV.');
            event.target.value = '';

            return;
        }

        const reader = new FileReader();
        reader.onload = async (loadEvent) => {
            try {
                const workbook = XLSX.read(loadEvent.target?.result, {
                    type: 'array',
                });
                const firstSheet = workbook.SheetNames[0];

                if (!firstSheet) {
                    throw new Error('Sheet spreadsheet tidak ditemukan.');
                }

                const worksheet = workbook.Sheets[firstSheet];
                const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
                    worksheet,
                    {
                        defval: '',
                        raw: false,
                    },
                );
                const participants = buildParticipantImportRows(rows);

                if (participants.length === 0) {
                    throw new Error(
                        'Tidak ada baris peserta yang bisa diimpor dari file ini.',
                    );
                }

                participantImportPreviewRows.forEach((row) => {
                    participantDraftDocumentInputs.forEach((documentField) => {
                        const previewUrl = row[documentField.previewField];

                        if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                        }
                    });
                });

                setParticipantImportPreviewRows(participants);
                setParticipantImportFileName(file.name);
                setExpandedParticipantImportRows(
                    participants
                        .slice(0, 1)
                        .map((participant) => participant.row_number),
                );
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : 'Gagal membaca file import peserta.',
                );
            } finally {
                event.target.value = '';
            }
        };

        reader.readAsArrayBuffer(file);
    }

    function openParticipantsManager(registration: Registration): void {
        if (!canEdit) {
            return;
        }

        setParticipantBooking(registration);
        setParticipantItems([]);
        resetParticipantForm();
        setParticipantImportPreviewRows([createEmptyParticipantDraftRow(2)]);
        setExpandedParticipantImportRows([2]);
        setParticipantImportFileName('');
        setIsParticipantsSheetOpen(true);
        void loadParticipants(registration);
    }

    function startEditingParticipant(participant: Participant): void {
        setEditingParticipant(participant);
        setExpandedParticipantFormSections([
            'identity',
            'documents',
            'additional',
        ]);
        participantForm.setData({
            full_name: participant.full_name ?? '',
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
            passport_scan: null,
            family_card_scan: null,
            marriage_book_scan: null,
            birth_certificate_scan: null,
            photo: null,
            meningitis_vaccine_scan: null,
            has_medical_history: participant.has_medical_history,
            medical_history_notes: participant.medical_history_notes ?? '',
            emergency_contact_name: participant.emergency_contact_name ?? '',
            emergency_contact_phone: participant.emergency_contact_phone ?? '',
            emergency_contact_relationship:
                participant.emergency_contact_relationship ?? '',
            has_performed_umrah: participant.has_performed_umrah,
            referral_source: participant.referral_source ?? '',
        });
        participantForm.clearErrors();
        requestAnimationFrame(() => {
            participantFormContainerRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        });
    }

    function refreshParticipantListing(registrationId: number): void {
        router.reload({
            only: ['registrations'],
            onSuccess: () => {
                if (
                    !participantBooking ||
                    participantBooking.id !== registrationId
                ) {
                    return;
                }

                void loadParticipants({
                    ...participantBooking,
                    id: registrationId,
                });
            },
        });
    }

    function handleParticipantFileChange(
        field: ParticipantDocumentField,
        event: React.ChangeEvent<HTMLInputElement>,
    ): void {
        const file = event.target.files?.[0] ?? null;

        if (file && file.size > participantUploadMaxBytes) {
            participantForm.setError(
                field,
                `Ukuran file maksimal ${participantUploadMaxLabel}.`,
            );
            participantForm.setData(field, null);
            event.target.value = '';

            return;
        }

        participantForm.clearErrors(field);
        participantForm.setData(field, file);
    }

    function clearParticipantFile(field: ParticipantDocumentField): void {
        participantForm.setData(field, null);
    }

    function handleParticipantSubmit(event: React.FormEvent): void {
        event.preventDefault();

        if (!participantBooking) {
            return;
        }

        const endpoint = editingParticipant
            ? `/admin/booking-management/listing/${participantBooking.id}/participants/${editingParticipant.id}`
            : `/admin/booking-management/listing/${participantBooking.id}/participants`;

        participantForm.transform((data) => ({
            ...data,
            ...(editingParticipant ? { _method: 'put' } : {}),
        }));

        participantForm.post(endpoint, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                const bookingId = participantBooking.id;

                resetParticipantForm();
                refreshParticipantListing(bookingId);
            },
            onFinish: () => {
                participantForm.transform((data) => data);
            },
        });
    }

    function handleParticipantDelete(participant: Participant): void {
        if (!participantBooking || !canEdit) {
            return;
        }

        router.delete(
            `/admin/booking-management/listing/${participantBooking.id}/participants/${participant.id}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    const bookingId = participantBooking.id;

                    if (editingParticipant?.id === participant.id) {
                        resetParticipantForm();
                    }

                    refreshParticipantListing(bookingId);
                },
            },
        );
    }

    function handleSubmit(event: React.FormEvent): void {
        event.preventDefault();

        if (editingRegistration) {
            form.put(
                `/admin/booking-management/listing/${editingRegistration.id}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsDialogOpen(false);
                        setEditingRegistration(null);
                        form.reset();
                    },
                },
            );

            return;
        }

        form.post('/admin/booking-management/listing', {
            preserveScroll: true,
            onSuccess: () => {
                setIsDialogOpen(false);
                form.reset();
            },
        });
    }

    function handleDelete(): void {
        if (!canDelete) {
            return;
        }

        if (!deleteTarget) {
            return;
        }

        form.delete(`/admin/booking-management/listing/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
            },
        });
    }

    function openParticipantsPdf(registration: Registration): void {
        if (!canExport) {
            return;
        }

        window.open(
            `/admin/booking-management/listing/${registration.id}/participants.pdf`,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function openInvoicePdf(registration: Registration): void {
        if (!canExport) {
            return;
        }

        window.open(
            `/admin/booking-management/listing/${registration.id}/invoice.pdf`,
            '_blank',
            'noopener,noreferrer',
        );
    }

    function openReviewUrl(registration: Registration): void {
        if (!registration.review_url) {
            return;
        }

        window.open(registration.review_url, '_blank', 'noopener,noreferrer');
    }

    function markAsCancelled(registration: Registration): void {
        if (!canEdit) {
            return;
        }

        router.put(
            `/admin/booking-management/listing/${registration.id}`,
            {
                travel_package_id: String(registration.travel_package_id),
                departure_schedule_id: registration.departure_schedule_id
                    ? String(registration.departure_schedule_id)
                    : '',
                full_name: registration.full_name,
                phone: registration.phone,
                email: registration.email ?? '',
                origin_city: registration.origin_city,
                passenger_count: String(registration.passenger_count),
                notes: registration.notes ?? '',
                status: 'cancelled',
            },
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Booking Listing',
                    href: '/admin/booking-management/listing',
                },
            ]}
        >
            <Head title="Booking Listing" />

            <div className="min-w-0 space-y-4 overflow-x-hidden p-4 md:p-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Booking Listing
                        </h1>
                        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                            {canExport ? (
                                <Button
                                    variant="outline"
                                    onClick={openFilteredPdf}
                                    className="w-full gap-2 md:w-auto"
                                >
                                    <FileText className="h-4 w-4" />
                                    Export PDF
                                </Button>
                            ) : null}
                            {canCreate ? (
                                <Button
                                    onClick={openCreateDialog}
                                    className="w-full md:w-auto"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Booking
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className="border-border/60 shadow-sm"
                        >
                            <CardContent className="flex items-center justify-between p-3.5">
                                <div>
                                    <p className="text-xs text-muted-foreground md:text-sm">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 text-xl font-semibold md:text-2xl">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className="rounded-full bg-muted p-2.5">
                                    <stat.icon className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="min-w-0 border-border/60 shadow-sm">
                    <CardHeader className="gap-4">
                        <div>
                            <CardTitle>Data Booking Jamaah</CardTitle>
                        </div>
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                            <div className="relative min-w-0">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari kode, nama, paket, kota..."
                                    className="pl-9"
                                />
                            </div>
                            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-[140px_180px_140px]">
                                <div className="min-w-0">
                                    <Select
                                        value={bookingTypeFilter}
                                        onValueChange={(value) => {
                                            setBookingTypeFilter(value);

                                            if (value === 'custom') {
                                                setPackageFilter('all');
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="regular">
                                                Paket
                                            </SelectItem>
                                            <SelectItem value="custom">
                                                Custom
                                            </SelectItem>
                                            <SelectItem value="all">
                                                Semua
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="min-w-0">
                                    <Select
                                        value={packageFilter}
                                        disabled={
                                            bookingTypeFilter === 'custom'
                                        }
                                        onValueChange={(value) => {
                                            setPackageFilter(value);
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Paket" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua paket
                                            </SelectItem>
                                            {packageOptions.map(
                                                (travelPackage) => (
                                                    <SelectItem
                                                        key={travelPackage.id}
                                                        value={String(
                                                            travelPackage.id,
                                                        )}
                                                    >
                                                        {packageDisplayName(
                                                            travelPackage,
                                                            locale,
                                                        )}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="min-w-0">
                                    <Select
                                        value={statusFilter}
                                        onValueChange={(value) => {
                                            setStatusFilter(value);
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua status
                                            </SelectItem>
                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="registered">
                                                Registered
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Cancelled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="min-w-0">
                        {registrationItems.length === 0 ? (
                            <div className="rounded-xl border border-dashed px-6 py-12 text-center">
                                <p className="font-medium text-foreground">
                                    {registrations.total === 0
                                        ? 'Belum ada data booking.'
                                        : 'Data booking yang dicari tidak ditemukan.'}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <Table className="min-w-[1320px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-14 text-center">
                                                No
                                            </TableHead>
                                            <TableHead className="w-20 text-right">
                                                Aksi
                                            </TableHead>
                                            <TableHead>Kode Booking</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Kota</TableHead>
                                            <TableHead className="text-center">
                                                Pax
                                            </TableHead>
                                            <TableHead>Paket</TableHead>
                                            <TableHead>Berangkat</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Revenue
                                            </TableHead>
                                            <TableHead>Masuk</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registrationItems.map(
                                            (registration, index) => (
                                                <TableRow
                                                    key={registration.id}
                                                    className={
                                                        registration.status ===
                                                        'cancelled'
                                                            ? 'bg-rose-50/80 dark:bg-rose-950/20'
                                                            : undefined
                                                    }
                                                >
                                                    <TableCell className="text-center align-top text-sm text-muted-foreground">
                                                        {(registrations.from ??
                                                            1) + index}
                                                    </TableCell>
                                                    <TableCell className="min-w-20 text-right align-top">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="ml-auto"
                                                                    aria-label={`Aksi ${registration.booking_code}`}
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {canExport ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openParticipantsPdf(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        PDF
                                                                        Peserta
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openParticipantsManager(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Kelola
                                                                        Peserta
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canExport ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openInvoicePdf(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        PDF
                                                                        Invoice
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {!registration.has_review &&
                                                                registration.review_url ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openReviewUrl(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Review
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {registration.status ===
                                                                    'registered' &&
                                                                canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            markAsCancelled(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Cancel
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openEditDialog(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canDelete ? (
                                                                    <DropdownMenuItem
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            setDeleteTarget(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Hapus
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                    <TableCell className="min-w-40 align-top">
                                                        <div className="space-y-1">
                                                            <p className="font-semibold">
                                                                {
                                                                    registration.booking_code
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                ID #
                                                                {
                                                                    registration.id
                                                                }
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="min-w-56 align-top font-medium">
                                                        {registration.full_name}
                                                    </TableCell>
                                                    <TableCell className="min-w-44 align-top text-sm text-muted-foreground">
                                                        {
                                                            registration.origin_city
                                                        }
                                                    </TableCell>
                                                    <TableCell className="min-w-20 text-center align-top font-medium whitespace-nowrap">
                                                        <div className="space-y-1">
                                                            <p>
                                                                {
                                                                    registration.passenger_count
                                                                }
                                                            </p>
                                                            <p className="text-xs font-normal text-muted-foreground">
                                                                {registration.participants_count ??
                                                                    0}
                                                                /
                                                                {
                                                                    registration.passenger_count
                                                                }{' '}
                                                                terisi
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="min-w-56 align-top">
                                                        {packageDisplayName(
                                                            registration.travel_package,
                                                            locale,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="min-w-44 align-top whitespace-nowrap">
                                                        {formatDate(
                                                            registration
                                                                .departure_schedule
                                                                .departure_date,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <Badge
                                                            variant={statusBadgeVariant(
                                                                registration.status,
                                                            )}
                                                            className="capitalize"
                                                        >
                                                            {
                                                                registration.status
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right align-top whitespace-nowrap">
                                                        {formatCurrency(
                                                            registration.revenue
                                                                ?.amount ?? 0,
                                                            registration.revenue
                                                                ?.currency ??
                                                                'IDR',
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="align-top text-sm whitespace-nowrap text-muted-foreground">
                                                        {formatDateTime(
                                                            registration.created_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="hidden min-w-20 text-right align-top">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="ml-auto"
                                                                    aria-label={`Aksi ${registration.booking_code}`}
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {canExport ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openParticipantsPdf(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        PDF
                                                                        Peserta
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openParticipantsManager(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Kelola
                                                                        Peserta
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canExport ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openInvoicePdf(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        PDF
                                                                        Invoice
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {!registration.has_review &&
                                                                registration.review_url ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openReviewUrl(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Review
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {registration.status ===
                                                                    'registered' &&
                                                                canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            markAsCancelled(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Cancel
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canEdit ? (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openEditDialog(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                                {canDelete ? (
                                                                    <DropdownMenuItem
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                            setDeleteTarget(
                                                                                registration,
                                                                            )
                                                                        }
                                                                    >
                                                                        Hapus
                                                                    </DropdownMenuItem>
                                                                ) : null}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                            <p>
                                Menampilkan{' '}
                                <span className="font-medium text-foreground">
                                    {registrations.from ?? 0}
                                </span>{' '}
                                -{' '}
                                <span className="font-medium text-foreground">
                                    {registrations.to ?? 0}
                                </span>{' '}
                                dari{' '}
                                <span className="font-medium text-foreground">
                                    {registrations.total}
                                </span>{' '}
                                booking
                            </p>
                            <div className="flex flex-wrap justify-end gap-2">
                                {registrations.links.map((link, index) => (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={link.url === null}
                                        onClick={() => {
                                            if (!link.url) {
                                                return;
                                            }

                                            router.visit(link.url, {
                                                preserveScroll: true,
                                                preserveState: true,
                                            });
                                        }}
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Sheet
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingRegistration(null);
                        form.reset();
                        form.clearErrors();
                    }
                }}
            >
                <SheetContent side="right" className="w-full p-0 sm:max-w-3xl">
                    <form
                        onSubmit={handleSubmit}
                        className="flex max-h-[90vh] flex-col overflow-hidden"
                    >
                        <div className="border-b bg-card px-4 py-4 sm:px-6">
                            <DrawerHeader className="space-y-2 p-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant={
                                            editingRegistration
                                                ? 'secondary'
                                                : 'default'
                                        }
                                    >
                                        {editingRegistration
                                            ? 'Edit'
                                            : 'Tambah'}
                                    </Badge>
                                    {editingRegistration?.booking_code ? (
                                        <span className="text-sm text-muted-foreground">
                                            {editingRegistration.booking_code}
                                        </span>
                                    ) : null}
                                </div>
                                <DrawerTitle className="text-lg sm:text-xl">
                                    {editingRegistration
                                        ? 'Edit Booking'
                                        : 'Tambah Booking'}
                                </DrawerTitle>
                            </DrawerHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                            <div className="space-y-4">
                                <div
                                    ref={participantFormContainerRef}
                                    className="rounded-2xl border bg-card p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Paket & Keberangkatan
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="travel_package_id">
                                                Paket
                                            </Label>
                                            <Select
                                                value={
                                                    form.data.travel_package_id
                                                }
                                                onValueChange={
                                                    handlePackageChange
                                                }
                                                disabled={
                                                    isEditingCustomBooking
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih paket" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {packageOptions.map(
                                                        (travelPackage) => (
                                                            <SelectItem
                                                                key={
                                                                    travelPackage.id
                                                                }
                                                                value={String(
                                                                    travelPackage.id,
                                                                )}
                                                            >
                                                                {packageDisplayName(
                                                                    travelPackage,
                                                                    locale,
                                                                )}
                                                                {travelPackage.start_date
                                                                    ? ` - ${formatDate(travelPackage.start_date)}`
                                                                    : ''}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.travel_package_id && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        form.errors
                                                            .travel_package_id
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {isEditingCustomBooking ? (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="custom_departure_date">
                                                        Tanggal berangkat
                                                    </Label>
                                                    <Input
                                                        id="custom_departure_date"
                                                        type="date"
                                                        value={
                                                            form.data
                                                                .custom_departure_date
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'custom_departure_date',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    {form.errors
                                                        .custom_departure_date ? (
                                                        <p className="text-sm text-destructive">
                                                            {
                                                                form.errors
                                                                    .custom_departure_date
                                                            }
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="custom_return_date">
                                                        Tanggal pulang
                                                    </Label>
                                                    <Input
                                                        id="custom_return_date"
                                                        type="date"
                                                        value={
                                                            form.data
                                                                .custom_return_date
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'custom_return_date',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    {form.errors
                                                        .custom_return_date ? (
                                                        <p className="text-sm text-destructive">
                                                            {
                                                                form.errors
                                                                    .custom_return_date
                                                            }
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <div className="grid gap-2 md:col-span-2">
                                                    <Label htmlFor="custom_unit_price">
                                                        Harga satuan (IDR)
                                                    </Label>
                                                    <Input
                                                        id="custom_unit_price"
                                                        type="number"
                                                        min={0}
                                                        value={
                                                            form.data
                                                                .custom_unit_price
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'custom_unit_price',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    {form.errors
                                                        .custom_unit_price ? (
                                                        <p className="text-sm text-destructive">
                                                            {
                                                                form.errors
                                                                    .custom_unit_price
                                                            }
                                                        </p>
                                                    ) : null}
                                                    <p className="text-xs text-muted-foreground">
                                                        Total otomatis:{' '}
                                                        <span className="font-medium text-foreground">
                                                            {formatCurrency(
                                                                computedCustomTotal,
                                                                'IDR',
                                                            )}
                                                        </span>{' '}
                                                        (
                                                        {
                                                            form.data
                                                                .passenger_count
                                                        }{' '}
                                                        pax x{' '}
                                                        {form.data
                                                            .custom_unit_price ||
                                                            0}
                                                        )
                                                    </p>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="rounded-2xl border bg-card p-4">
                                    <p className="text-sm font-semibold">
                                        Data Jamaah
                                    </p>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="full_name">
                                                Nama Lengkap
                                            </Label>
                                            <Input
                                                id="full_name"
                                                value={form.data.full_name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'full_name',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Nama sesuai KTP / paspor"
                                            />
                                            {form.errors.full_name && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.full_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                WhatsApp
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={form.data.phone}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: 081234567890"
                                            />
                                            {form.errors.phone && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.data.email}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="opsional"
                                            />
                                            {form.errors.email && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="origin_city">
                                                Kota Asal
                                            </Label>
                                            <Input
                                                id="origin_city"
                                                value={form.data.origin_city}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'origin_city',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Surabaya"
                                            />
                                            {form.errors.origin_city && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.origin_city}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="passenger_count">
                                                Jumlah Pax
                                            </Label>
                                            <Input
                                                id="passenger_count"
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={
                                                    form.data.passenger_count
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'passenger_count',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors.passenger_count && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        form.errors
                                                            .passenger_count
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="status">
                                                Status Booking
                                            </Label>
                                            <Select
                                                value={form.data.status}
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'status',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="registered">
                                                        Registered
                                                    </SelectItem>
                                                    <SelectItem value="cancelled">
                                                        Cancelled
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {form.errors.status && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.status}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-2 md:col-span-2">
                                            <Label htmlFor="notes">
                                                Catatan
                                            </Label>
                                            <Textarea
                                                id="notes"
                                                value={form.data.notes}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                rows={4}
                                                placeholder="Tambahkan catatan khusus booking jika diperlukan"
                                            />
                                            {form.errors.notes && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t bg-card px-4 py-4 sm:px-6">
                            <DrawerFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                        setEditingRegistration(null);
                                        form.reset();
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="w-full sm:w-auto"
                                >
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : editingRegistration
                                          ? 'Simpan Perubahan'
                                          : 'Tambah Booking'}
                                </Button>
                            </DrawerFooter>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={isParticipantsSheetOpen}
                onOpenChange={(open) => {
                    setIsParticipantsSheetOpen(open);

                    if (!open) {
                        setParticipantBooking(null);
                        setParticipantItems([]);
                        resetParticipantForm();
                        clearParticipantImportDraft();
                    }
                }}
            >
                <SheetContent side="right" className="w-full p-0 sm:max-w-5xl">
                    <form
                        onSubmit={handleParticipantSubmit}
                        className="flex max-h-[90vh] flex-col overflow-hidden"
                    >
                        <div className="border-b bg-card px-4 py-4 sm:px-6">
                            <DrawerHeader className="space-y-2 p-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">Peserta</Badge>
                                    {participantBooking?.booking_code ? (
                                        <span className="text-sm text-muted-foreground">
                                            {participantBooking.booking_code}
                                        </span>
                                    ) : null}
                                </div>
                                <DrawerTitle className="text-lg sm:text-xl">
                                    Kelola Data Peserta
                                </DrawerTitle>
                            </DrawerHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                            <div className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-3">
                                    <Card className="border-border/60 shadow-sm">
                                        <CardContent className="p-4">
                                            <p className="text-xs text-muted-foreground">
                                                Total Pax
                                            </p>
                                            <p className="mt-1 text-2xl font-semibold">
                                                {participantCapacity}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-border/60 shadow-sm">
                                        <CardContent className="p-4">
                                            <p className="text-xs text-muted-foreground">
                                                Sudah Diisi
                                            </p>
                                            <p className="mt-1 text-2xl font-semibold">
                                                {participantCount}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-border/60 shadow-sm">
                                        <CardContent className="p-4">
                                            <p className="text-xs text-muted-foreground">
                                                Sisa Slot
                                            </p>
                                            <p className="mt-1 text-2xl font-semibold">
                                                {participantSlotsRemaining}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="rounded-2xl border bg-card p-4 shadow-sm">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Data Peserta
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Tambah peserta sesuai jumlah
                                                pax.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <input
                                                ref={participantImportInputRef}
                                                type="file"
                                                accept=".xlsx,.xls,.csv"
                                                className="hidden"
                                                onChange={
                                                    handleParticipantImportFile
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={
                                                    downloadParticipantTemplate
                                                }
                                            >
                                                Template
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    participantImportInputRef.current?.click()
                                                }
                                                disabled={
                                                    isParticipantImporting ||
                                                    !participantBooking
                                                }
                                            >
                                                {isParticipantImporting
                                                    ? 'Importing...'
                                                    : 'Import Spreadsheet'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={
                                                    exportParticipantSpreadsheet
                                                }
                                                disabled={
                                                    participantItems.length ===
                                                    0
                                                }
                                            >
                                                Export
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (!participantBooking) {
                                                        return;
                                                    }

                                                    void loadParticipants(
                                                        participantBooking,
                                                    );
                                                }}
                                                disabled={
                                                    isParticipantLoading ||
                                                    !participantBooking
                                                }
                                            >
                                                Refresh
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addParticipantDraftRow}
                                            >
                                                Tambah Peserta
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {participantItems.length > 0 ? (
                                    <div className="rounded-2xl border bg-card p-4 shadow-sm">
                                        <p className="text-sm font-semibold">
                                            Peserta Tersimpan
                                        </p>
                                        <div className="mt-3 overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Nama
                                                        </TableHead>
                                                        <TableHead>
                                                            Gender
                                                        </TableHead>
                                                        <TableHead>
                                                            Paspor
                                                        </TableHead>
                                                        <TableHead>
                                                            Dokumen
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Aksi
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {participantItems.map(
                                                        (
                                                            participant,
                                                            index,
                                                        ) => (
                                                            <TableRow
                                                                key={
                                                                    participant.id
                                                                }
                                                            >
                                                                <TableCell className="align-top">
                                                                    <div className="space-y-1">
                                                                        <p className="font-medium">
                                                                            {
                                                                                participant.full_name
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Peserta
                                                                            #
                                                                            {index +
                                                                                1}
                                                                        </p>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="align-top text-sm text-muted-foreground">
                                                                    {participant.gender ===
                                                                    'female'
                                                                        ? 'Perempuan'
                                                                        : participant.gender ===
                                                                            'male'
                                                                          ? 'Laki-laki'
                                                                          : '-'}
                                                                </TableCell>
                                                                <TableCell className="align-top text-sm text-muted-foreground">
                                                                    {participant.passport_ready
                                                                        ? 'Siap'
                                                                        : 'Belum'}
                                                                </TableCell>
                                                                <TableCell className="align-top text-sm text-muted-foreground">
                                                                    {participantDocumentCount(
                                                                        participant,
                                                                    )}
                                                                    /6
                                                                </TableCell>
                                                                <TableCell className="text-right align-top">
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                startEditingParticipant(
                                                                                    participant,
                                                                                )
                                                                            }
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleParticipantDelete(
                                                                                    participant,
                                                                                )
                                                                            }
                                                                        >
                                                                            Hapus
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ) : null}

                                {participantImportPreviewRows.length > 0 ? (
                                    <div className="rounded-2xl border bg-card p-4 shadow-sm">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Draft Import Spreadsheet
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Edit dulu data hasil import
                                                    dari{' '}
                                                    {participantImportFileName ||
                                                        'spreadsheet'}{' '}
                                                    sebelum disimpan.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">
                                                    Total{' '}
                                                    {
                                                        participantImportPreviewRows.length
                                                    }
                                                </Badge>
                                                <Badge variant="secondary">
                                                    Valid{' '}
                                                    {
                                                        participantImportValidRows.length
                                                    }
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        participantImportSkippedCount >
                                                        0
                                                            ? 'destructive'
                                                            : 'outline'
                                                    }
                                                >
                                                    Dilewati{' '}
                                                    {
                                                        participantImportSkippedCount
                                                    }
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {participantImportPreviewRows.map(
                                                (row) => {
                                                    const isExpanded =
                                                        expandedParticipantImportRows.includes(
                                                            row.row_number,
                                                        );

                                                    return (
                                                        <Collapsible
                                                            key={`draft-${row.row_number}`}
                                                            open={isExpanded}
                                                            onOpenChange={() =>
                                                                toggleParticipantImportRow(
                                                                    row.row_number,
                                                                )
                                                            }
                                                            className="overflow-hidden rounded-2xl border"
                                                        >
                                                            <CollapsibleTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="flex w-full flex-col gap-3 bg-card px-4 py-4 text-left transition hover:bg-muted/20 md:flex-row md:items-center md:justify-between"
                                                                >
                                                                    <div className="flex flex-1 items-start gap-3">
                                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                                                            {
                                                                                row.row_number
                                                                            }
                                                                        </div>
                                                                        <div className="min-w-0 flex-1 space-y-1">
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <p className="truncate font-medium">
                                                                                    {row.full_name ||
                                                                                        'Nama belum diisi'}
                                                                                </p>
                                                                                <Badge
                                                                                    variant={
                                                                                        row.is_valid
                                                                                            ? 'secondary'
                                                                                            : 'destructive'
                                                                                    }
                                                                                >
                                                                                    {row.is_valid
                                                                                        ? 'Valid'
                                                                                        : 'Perlu dicek'}
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {row.gender ===
                                                                                'male'
                                                                                    ? 'Laki-laki'
                                                                                    : row.gender ===
                                                                                        'female'
                                                                                      ? 'Perempuan'
                                                                                      : 'Gender belum diisi'}{' '}
                                                                                -{' '}
                                                                                {row.birth_place ||
                                                                                    'Tempat lahir belum diisi'}
                                                                                {row.birth_date
                                                                                    ? `, ${row.birth_date}`
                                                                                    : ''}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {row.note ||
                                                                                    `Kontak darurat: ${row.emergency_contact_name || '-'} | Paspor: ${row.passport_ready ? 'Siap' : 'Belum'}`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={(
                                                                                event,
                                                                            ) => {
                                                                                event.stopPropagation();
                                                                                removeParticipantImportDraftRow(
                                                                                    row.row_number,
                                                                                );
                                                                            }}
                                                                        >
                                                                            Hapus
                                                                        </Button>
                                                                        <ChevronDown
                                                                            className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                        />
                                                                    </div>
                                                                </button>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent className="border-t bg-muted/10">
                                                                <div className="space-y-4 p-4">
                                                                    <div className="rounded-xl border border-border/60 bg-card/70 p-4">
                                                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                                                            <Badge variant="outline">
                                                                                Data
                                                                                Utama
                                                                            </Badge>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                Isi
                                                                                identitas,
                                                                                paspor,
                                                                                dan
                                                                                kontak
                                                                                peserta.
                                                                            </p>
                                                                        </div>
                                                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                                            <div className="space-y-2 xl:col-span-2">
                                                                                <Label className="text-xs">
                                                                                    Nama
                                                                                    Lengkap
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.full_name
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'full_name',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Jenis
                                                                                    Kelamin
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.gender ??
                                                                                        'none'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'gender',
                                                                                            value ===
                                                                                                'none'
                                                                                                ? null
                                                                                                : value,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Gender" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="none">
                                                                                            -
                                                                                        </SelectItem>
                                                                                        <SelectItem value="male">
                                                                                            Laki-laki
                                                                                        </SelectItem>
                                                                                        <SelectItem value="female">
                                                                                            Perempuan
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Status
                                                                                    Nikah
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.marital_status ??
                                                                                        'none'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'marital_status',
                                                                                            value ===
                                                                                                'none'
                                                                                                ? null
                                                                                                : value,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Status nikah" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="none">
                                                                                            -
                                                                                        </SelectItem>
                                                                                        <SelectItem value="single">
                                                                                            Belum
                                                                                            menikah
                                                                                        </SelectItem>
                                                                                        <SelectItem value="married">
                                                                                            Menikah
                                                                                        </SelectItem>
                                                                                        <SelectItem value="divorced">
                                                                                            Cerai
                                                                                        </SelectItem>
                                                                                        <SelectItem value="widowed">
                                                                                            Duda
                                                                                            /
                                                                                            Janda
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Tempat
                                                                                    Lahir
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.birth_place
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'birth_place',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Tanggal
                                                                                    Lahir
                                                                                </Label>
                                                                                <Input
                                                                                    type="date"
                                                                                    value={
                                                                                        row.birth_date
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'birth_date',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2 xl:col-span-2">
                                                                                <Label className="text-xs">
                                                                                    Alamat
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.address
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'address',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Ukuran
                                                                                    Baju
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.shirt_size
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'shirt_size',
                                                                                            event.target.value.toUpperCase(),
                                                                                        )
                                                                                    }
                                                                                    placeholder="M / L / XL"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Kursi
                                                                                    Roda
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.needs_wheelchair
                                                                                            ? 'yes'
                                                                                            : 'no'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'needs_wheelchair',
                                                                                            value ===
                                                                                                'yes',
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Kursi roda" />
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
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Passport
                                                                                    Ready
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.passport_ready
                                                                                            ? 'yes'
                                                                                            : 'no'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'passport_ready',
                                                                                            value ===
                                                                                                'yes',
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Paspor" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="yes">
                                                                                            Siap
                                                                                        </SelectItem>
                                                                                        <SelectItem value="no">
                                                                                            Belum
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Tgl
                                                                                    Terbit
                                                                                    Paspor
                                                                                </Label>
                                                                                <Input
                                                                                    type="date"
                                                                                    value={
                                                                                        row.passport_issue_date
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'passport_issue_date',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Tgl
                                                                                    Exp
                                                                                    Paspor
                                                                                </Label>
                                                                                <Input
                                                                                    type="date"
                                                                                    value={
                                                                                        row.passport_expiry_date
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'passport_expiry_date',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Tipe
                                                                                    Paspor
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.passport_type ??
                                                                                        'none'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'passport_type',
                                                                                            value ===
                                                                                                'none'
                                                                                                ? null
                                                                                                : value,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Tipe paspor" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="none">
                                                                                            -
                                                                                        </SelectItem>
                                                                                        <SelectItem value="ordinary">
                                                                                            Biasa
                                                                                        </SelectItem>
                                                                                        <SelectItem value="e_passport">
                                                                                            E-Passport
                                                                                        </SelectItem>
                                                                                        <SelectItem value="official">
                                                                                            Dinas
                                                                                        </SelectItem>
                                                                                        <SelectItem value="diplomatic">
                                                                                            Diplomatik
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Riwayat
                                                                                    Penyakit
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.has_medical_history
                                                                                            ? 'yes'
                                                                                            : 'no'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'has_medical_history',
                                                                                            value ===
                                                                                                'yes',
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Riwayat" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="no">
                                                                                            Tidak
                                                                                        </SelectItem>
                                                                                        <SelectItem value="yes">
                                                                                            Ada
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="space-y-2 xl:col-span-2">
                                                                                <Label className="text-xs">
                                                                                    Catatan
                                                                                    Riwayat
                                                                                </Label>
                                                                                <Textarea
                                                                                    rows={
                                                                                        2
                                                                                    }
                                                                                    value={
                                                                                        row.medical_history_notes
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'medical_history_notes',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Nama
                                                                                    Kontak
                                                                                    Darurat
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.emergency_contact_name
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'emergency_contact_name',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                    placeholder="Opsional"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Telepon
                                                                                    Darurat
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.emergency_contact_phone
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'emergency_contact_phone',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                    placeholder="0812..."
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Hubungan
                                                                                    Darurat
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.emergency_contact_relationship
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'emergency_contact_relationship',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Pernah
                                                                                    Umrah
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.has_performed_umrah
                                                                                            ? 'yes'
                                                                                            : 'no'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'has_performed_umrah',
                                                                                            value ===
                                                                                                'yes',
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Status umrah" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="no">
                                                                                            Belum
                                                                                        </SelectItem>
                                                                                        <SelectItem value="yes">
                                                                                            Sudah
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Sumber
                                                                                    Info
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.referral_source
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'referral_source',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4">
                                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                            <div>
                                                                                <p className="text-sm font-semibold">
                                                                                    Dokumen
                                                                                    Peserta
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    Bisa
                                                                                    upload
                                                                                    file
                                                                                    langsung
                                                                                    atau
                                                                                    isi
                                                                                    URL
                                                                                    dokumen
                                                                                    dari
                                                                                    import.
                                                                                </p>
                                                                            </div>
                                                                            <Badge variant="outline">
                                                                                Maks{' '}
                                                                                {
                                                                                    participantUploadMaxLabel
                                                                                }
                                                                            </Badge>
                                                                        </div>

                                                                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                                            {participantDraftDocumentInputs.map(
                                                                                (
                                                                                    documentField,
                                                                                ) => {
                                                                                    const selectedFile =
                                                                                        row[
                                                                                            documentField
                                                                                                .fileField
                                                                                        ];
                                                                                    const previewUrl =
                                                                                        row[
                                                                                            documentField
                                                                                                .previewField
                                                                                        ];
                                                                                    const currentUrl =
                                                                                        row[
                                                                                            documentField
                                                                                                .urlField
                                                                                        ];
                                                                                    const currentPreview =
                                                                                        previewUrl ??
                                                                                        currentUrl;
                                                                                    const isImagePreview =
                                                                                        isImageDocument(
                                                                                            selectedFile ??
                                                                                                currentUrl,
                                                                                        ) &&
                                                                                        currentPreview !==
                                                                                            null &&
                                                                                        currentPreview !==
                                                                                            '';
                                                                                    const isPdfPreview =
                                                                                        isPdfDocument(
                                                                                            selectedFile ??
                                                                                                currentUrl,
                                                                                        );

                                                                                    return (
                                                                                        <div
                                                                                            key={`${row.row_number}-${documentField.field}`}
                                                                                            className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm"
                                                                                        >
                                                                                            <div className="space-y-1">
                                                                                                <p className="text-sm font-semibold">
                                                                                                    {
                                                                                                        documentField.label
                                                                                                    }
                                                                                                </p>
                                                                                                <p className="text-xs text-muted-foreground">
                                                                                                    {
                                                                                                        documentField.description
                                                                                                    }{' '}
                                                                                                    -
                                                                                                    maks{' '}
                                                                                                    {
                                                                                                        participantUploadMaxLabel
                                                                                                    }
                                                                                                </p>
                                                                                            </div>

                                                                                            <div className="flex aspect-[4/3] min-h-[120px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/60 bg-muted/30">
                                                                                                {isImagePreview &&
                                                                                                currentPreview ? (
                                                                                                    <img
                                                                                                        src={
                                                                                                            currentPreview
                                                                                                        }
                                                                                                        alt={
                                                                                                            documentField.label
                                                                                                        }
                                                                                                        className="h-full w-full object-cover"
                                                                                                    />
                                                                                                ) : isPdfPreview ? (
                                                                                                    <div className="flex flex-col items-center gap-2 px-3 text-center">
                                                                                                        <FileText className="h-8 w-8 text-primary" />
                                                                                                        <p className="text-xs font-medium text-foreground">
                                                                                                            Preview
                                                                                                            PDF
                                                                                                        </p>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <div className="flex flex-col items-center gap-2 px-3 text-center">
                                                                                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                                                                        <p className="text-xs text-muted-foreground">
                                                                                                            Belum
                                                                                                            ada
                                                                                                            file
                                                                                                        </p>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>

                                                                                            <input
                                                                                                id={`draft-${row.row_number}-${documentField.field}`}
                                                                                                type="file"
                                                                                                accept={
                                                                                                    documentField.accept
                                                                                                }
                                                                                                className="hidden"
                                                                                                onChange={(
                                                                                                    event,
                                                                                                ) =>
                                                                                                    handleParticipantImportDraftFileChange(
                                                                                                        row.row_number,
                                                                                                        documentField,
                                                                                                        event,
                                                                                                    )
                                                                                                }
                                                                                            />

                                                                                            <label
                                                                                                htmlFor={`draft-${row.row_number}-${documentField.field}`}
                                                                                                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition hover:border-primary/50 hover:bg-primary/10"
                                                                                            >
                                                                                                <Upload className="h-4 w-4" />
                                                                                                Pilih
                                                                                                file
                                                                                            </label>

                                                                                            <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                                                                                                <p className="font-medium break-words text-foreground">
                                                                                                    File
                                                                                                    dipilih:{' '}
                                                                                                    {selectedFile?.name ??
                                                                                                        '-'}
                                                                                                </p>
                                                                                                <p className="mt-1 break-words text-muted-foreground">
                                                                                                    URL
                                                                                                    sumber:{' '}
                                                                                                    {currentUrl ||
                                                                                                        '-'}
                                                                                                </p>
                                                                                            </div>

                                                                                            <div className="grid gap-2">
                                                                                                <Label className="text-xs">
                                                                                                    URL
                                                                                                    Alternatif
                                                                                                </Label>
                                                                                                <Input
                                                                                                    value={
                                                                                                        currentUrl
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        event,
                                                                                                    ) =>
                                                                                                        updateParticipantImportDraftRow(
                                                                                                            row.row_number,
                                                                                                            documentField.urlField,
                                                                                                            event
                                                                                                                .target
                                                                                                                .value,
                                                                                                        )
                                                                                                    }
                                                                                                    placeholder="https://... atau /storage/..."
                                                                                                />
                                                                                            </div>

                                                                                            <div className="grid gap-2 sm:grid-cols-2">
                                                                                                {currentPreview ? (
                                                                                                    <Button
                                                                                                        type="button"
                                                                                                        variant="outline"
                                                                                                        size="sm"
                                                                                                        className="w-full"
                                                                                                        onClick={() =>
                                                                                                            window.open(
                                                                                                                currentPreview,
                                                                                                                '_blank',
                                                                                                                'noopener,noreferrer',
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                                                        Preview
                                                                                                    </Button>
                                                                                                ) : null}
                                                                                                {selectedFile ? (
                                                                                                    <Button
                                                                                                        type="button"
                                                                                                        variant="ghost"
                                                                                                        size="sm"
                                                                                                        className="w-full"
                                                                                                        onClick={() =>
                                                                                                            clearParticipantImportDraftFile(
                                                                                                                row.row_number,
                                                                                                                documentField,
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                                                        Hapus
                                                                                                        file
                                                                                                    </Button>
                                                                                                ) : null}
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                },
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CollapsibleContent>
                                                        </Collapsible>
                                                    );
                                                },
                                            )}
                                        </div>

                                        <div className="mt-4 hidden overflow-x-auto rounded-2xl border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Baris
                                                        </TableHead>
                                                        <TableHead>
                                                            Nama
                                                        </TableHead>
                                                        <TableHead>
                                                            Gender
                                                        </TableHead>
                                                        <TableHead>
                                                            Tempat Lahir
                                                        </TableHead>
                                                        <TableHead>
                                                            Tgl Lahir
                                                        </TableHead>
                                                        <TableHead>
                                                            Paspor
                                                        </TableHead>
                                                        <TableHead>
                                                            Kontak Darurat
                                                        </TableHead>
                                                        <TableHead>
                                                            Telepon
                                                        </TableHead>
                                                        <TableHead>
                                                            Status
                                                        </TableHead>
                                                        <TableHead>
                                                            Aksi
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {participantImportPreviewRows.map(
                                                        (row) => (
                                                            <>
                                                                <TableRow
                                                                    key={
                                                                        row.row_number
                                                                    }
                                                                >
                                                                    <TableCell className="align-top">
                                                                        {
                                                                            row.row_number
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="min-w-[220px] align-top">
                                                                        <Input
                                                                            value={
                                                                                row.full_name
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateParticipantImportDraftRow(
                                                                                    row.row_number,
                                                                                    'full_name',
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="min-w-[160px] align-top">
                                                                        <Select
                                                                            value={
                                                                                row.gender ??
                                                                                'none'
                                                                            }
                                                                            onValueChange={(
                                                                                value,
                                                                            ) =>
                                                                                updateParticipantImportDraftRow(
                                                                                    row.row_number,
                                                                                    'gender',
                                                                                    value ===
                                                                                        'none'
                                                                                        ? null
                                                                                        : value,
                                                                                )
                                                                            }
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Gender" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="none">
                                                                                    -
                                                                                </SelectItem>
                                                                                <SelectItem value="male">
                                                                                    Laki-laki
                                                                                </SelectItem>
                                                                                <SelectItem value="female">
                                                                                    Perempuan
                                                                                </SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </TableCell>
                                                                    <TableCell className="min-w-[180px] align-top">
                                                                        <Input
                                                                            value={
                                                                                row.birth_place
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateParticipantImportDraftRow(
                                                                                    row.row_number,
                                                                                    'birth_place',
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="min-w-[160px] align-top">
                                                                        <Input
                                                                            type="date"
                                                                            value={
                                                                                row.birth_date
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateParticipantImportDraftRow(
                                                                                    row.row_number,
                                                                                    'birth_date',
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="min-w-[150px] align-top">
                                                                        <Select
                                                                            value={
                                                                                row.passport_ready
                                                                                    ? 'yes'
                                                                                    : 'no'
                                                                            }
                                                                            onValueChange={(
                                                                                value,
                                                                            ) =>
                                                                                updateParticipantImportDraftRow(
                                                                                    row.row_number,
                                                                                    'passport_ready',
                                                                                    value ===
                                                                                        'yes',
                                                                                )
                                                                            }
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Paspor" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="yes">
                                                                                    Siap
                                                                                </SelectItem>
                                                                                <SelectItem value="no">
                                                                                    Belum
                                                                                </SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </TableCell>
                                                                    <TableCell className="min-w-[180px] align-top">
                                                                        <Input
                                                                            value={
                                                                                row.emergency_contact_name
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateParticipantImportDraftRow(
                                                                                    row.row_number,
                                                                                    'emergency_contact_name',
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="Opsional"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="min-w-[170px] align-top">
                                                                        <Input
                                                                            value={
                                                                                row.emergency_contact_phone
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateParticipantImportDraftRow(
                                                                                    row.row_number,
                                                                                    'emergency_contact_phone',
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="0812..."
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="min-w-[170px] align-top">
                                                                        <div className="space-y-2">
                                                                            <Badge
                                                                                variant={
                                                                                    row.is_valid
                                                                                        ? 'secondary'
                                                                                        : 'destructive'
                                                                                }
                                                                            >
                                                                                {row.is_valid
                                                                                    ? 'Valid'
                                                                                    : 'Perlu dicek'}
                                                                            </Badge>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {row.note ||
                                                                                    'Siap diimpor'}
                                                                            </p>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="align-top">
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                removeParticipantImportDraftRow(
                                                                                    row.row_number,
                                                                                )
                                                                            }
                                                                        >
                                                                            Hapus
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                                <TableRow
                                                                    key={`${row.row_number}-details`}
                                                                >
                                                                    <TableCell />
                                                                    <TableCell
                                                                        colSpan={
                                                                            8
                                                                        }
                                                                        className="bg-muted/15"
                                                                    >
                                                                        <div className="grid gap-3 py-3 md:grid-cols-2 xl:grid-cols-4">
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Status
                                                                                    Nikah
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.marital_status ??
                                                                                        'none'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'marital_status',
                                                                                            value ===
                                                                                                'none'
                                                                                                ? null
                                                                                                : value,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Status nikah" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="none">
                                                                                            -
                                                                                        </SelectItem>
                                                                                        <SelectItem value="single">
                                                                                            Belum
                                                                                            menikah
                                                                                        </SelectItem>
                                                                                        <SelectItem value="married">
                                                                                            Menikah
                                                                                        </SelectItem>
                                                                                        <SelectItem value="divorced">
                                                                                            Cerai
                                                                                        </SelectItem>
                                                                                        <SelectItem value="widowed">
                                                                                            Duda
                                                                                            /
                                                                                            Janda
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Ukuran
                                                                                    Baju
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.shirt_size
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'shirt_size',
                                                                                            event.target.value.toUpperCase(),
                                                                                        )
                                                                                    }
                                                                                    placeholder="M / L / XL"
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Kursi
                                                                                    Roda
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.needs_wheelchair
                                                                                            ? 'yes'
                                                                                            : 'no'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'needs_wheelchair',
                                                                                            value ===
                                                                                                'yes',
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Kursi roda" />
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
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Pernah
                                                                                    Umrah
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.has_performed_umrah
                                                                                            ? 'yes'
                                                                                            : 'no'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'has_performed_umrah',
                                                                                            value ===
                                                                                                'yes',
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Status umrah" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="no">
                                                                                            Belum
                                                                                        </SelectItem>
                                                                                        <SelectItem value="yes">
                                                                                            Sudah
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="space-y-2 xl:col-span-2">
                                                                                <Label className="text-xs">
                                                                                    Alamat
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.address
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'address',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Tgl
                                                                                    Terbit
                                                                                    Paspor
                                                                                </Label>
                                                                                <Input
                                                                                    type="date"
                                                                                    value={
                                                                                        row.passport_issue_date
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'passport_issue_date',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Tgl
                                                                                    Exp
                                                                                    Paspor
                                                                                </Label>
                                                                                <Input
                                                                                    type="date"
                                                                                    value={
                                                                                        row.passport_expiry_date
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'passport_expiry_date',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Tipe
                                                                                    Paspor
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.passport_type ??
                                                                                        'none'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'passport_type',
                                                                                            value ===
                                                                                                'none'
                                                                                                ? null
                                                                                                : value,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Tipe paspor" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="none">
                                                                                            -
                                                                                        </SelectItem>
                                                                                        <SelectItem value="ordinary">
                                                                                            Biasa
                                                                                        </SelectItem>
                                                                                        <SelectItem value="e_passport">
                                                                                            E-Passport
                                                                                        </SelectItem>
                                                                                        <SelectItem value="official">
                                                                                            Dinas
                                                                                        </SelectItem>
                                                                                        <SelectItem value="diplomatic">
                                                                                            Diplomatik
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Riwayat
                                                                                    Penyakit
                                                                                </Label>
                                                                                <Select
                                                                                    value={
                                                                                        row.has_medical_history
                                                                                            ? 'yes'
                                                                                            : 'no'
                                                                                    }
                                                                                    onValueChange={(
                                                                                        value,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'has_medical_history',
                                                                                            value ===
                                                                                                'yes',
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder="Riwayat" />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="no">
                                                                                            Tidak
                                                                                        </SelectItem>
                                                                                        <SelectItem value="yes">
                                                                                            Ada
                                                                                        </SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Hubungan
                                                                                    Darurat
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.emergency_contact_relationship
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'emergency_contact_relationship',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs">
                                                                                    Sumber
                                                                                    Info
                                                                                </Label>
                                                                                <Input
                                                                                    value={
                                                                                        row.referral_source
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'referral_source',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="space-y-2 xl:col-span-2">
                                                                                <Label className="text-xs">
                                                                                    Catatan
                                                                                    Riwayat
                                                                                </Label>
                                                                                <Textarea
                                                                                    rows={
                                                                                        2
                                                                                    }
                                                                                    value={
                                                                                        row.medical_history_notes
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        updateParticipantImportDraftRow(
                                                                                            row.row_number,
                                                                                            'medical_history_notes',
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="bg-muted/15" />
                                                                </TableRow>
                                                            </>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={
                                                    clearParticipantImportDraft
                                                }
                                            >
                                                Buang Draft
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    void saveParticipantImportDraft()
                                                }
                                                disabled={
                                                    isParticipantImporting ||
                                                    participantImportValidRows.length ===
                                                        0
                                                }
                                            >
                                                {isParticipantImporting
                                                    ? 'Menyimpan...'
                                                    : `Simpan ${participantImportValidRows.length} Peserta`}
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}

                                {editingParticipant ? (
                                    <div
                                        ref={participantFormContainerRef}
                                        className="rounded-2xl border bg-card p-4 shadow-sm"
                                    >
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Form Peserta Aktif
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Edit peserta tersimpan
                                                    dengan dokumen upload dan
                                                    preview yang lengkap.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary">
                                                    Mode edit
                                                </Badge>
                                                <Badge variant="outline">
                                                    Dokumen{' '}
                                                    {
                                                        participantFormDocumentTotal
                                                    }
                                                    /6
                                                </Badge>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleParticipantDelete(
                                                            editingParticipant,
                                                        )
                                                    }
                                                >
                                                    Hapus Peserta
                                                </Button>
                                            </div>
                                        </div>

                                        {participantForm.hasErrors ? (
                                            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                                                <p className="text-sm font-semibold text-destructive">
                                                    Data belum tersimpan. Mohon
                                                    cek validasi berikut:
                                                </p>
                                                <ul className="mt-2 grid gap-1 text-sm text-destructive">
                                                    {Object.values(
                                                        participantForm.errors,
                                                    ).map((message, index) => (
                                                        <li
                                                            key={`${message}-${index}`}
                                                        >
                                                            - {message}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null}

                                        <div className="mt-4 space-y-4">
                                            <Collapsible
                                                open={expandedParticipantFormSections.includes(
                                                    'identity',
                                                )}
                                                onOpenChange={() =>
                                                    toggleParticipantFormSection(
                                                        'identity',
                                                    )
                                                }
                                                className="overflow-hidden rounded-2xl border"
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="flex w-full flex-col gap-3 bg-card px-4 py-4 text-left transition hover:bg-muted/20 md:flex-row md:items-center md:justify-between"
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-medium">
                                                                    Identitas
                                                                </p>
                                                                <Badge variant="outline">
                                                                    {participantForm
                                                                        .data
                                                                        .full_name ||
                                                                        'Nama belum diisi'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {participantForm
                                                                    .data
                                                                    .gender ===
                                                                'male'
                                                                    ? 'Laki-laki'
                                                                    : participantForm
                                                                            .data
                                                                            .gender ===
                                                                        'female'
                                                                      ? 'Perempuan'
                                                                      : 'Gender belum dipilih'}{' '}
                                                                -{' '}
                                                                {participantForm
                                                                    .data
                                                                    .birth_place ||
                                                                    'Tempat lahir belum diisi'}
                                                                {participantForm
                                                                    .data
                                                                    .birth_date
                                                                    ? `, ${participantForm.data.birth_date}`
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                        <ChevronDown
                                                            className={`h-4 w-4 shrink-0 transition-transform ${expandedParticipantFormSections.includes('identity') ? 'rotate-180' : ''}`}
                                                        />
                                                    </button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="border-t bg-muted/10 px-4 py-4">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="grid gap-2 md:col-span-2">
                                                            <Label htmlFor="participant_full_name">
                                                                Nama Lengkap
                                                            </Label>
                                                            <Input
                                                                id="participant_full_name"
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .full_name
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'full_name',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Nama sesuai paspor"
                                                            />
                                                            {participantForm
                                                                .errors
                                                                .full_name ? (
                                                                <p className="text-sm text-destructive">
                                                                    {
                                                                        participantForm
                                                                            .errors
                                                                            .full_name
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Jenis Kelamin
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .gender
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'gender',
                                                                        value ===
                                                                            'none'
                                                                            ? ''
                                                                            : value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pilih jenis kelamin" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">
                                                                        Belum
                                                                        dipilih
                                                                    </SelectItem>
                                                                    <SelectItem value="male">
                                                                        Laki-laki
                                                                    </SelectItem>
                                                                    <SelectItem value="female">
                                                                        Perempuan
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            {participantForm
                                                                .errors
                                                                .gender ? (
                                                                <p className="text-sm text-destructive">
                                                                    {
                                                                        participantForm
                                                                            .errors
                                                                            .gender
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Status
                                                                Pernikahan
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .marital_status
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'marital_status',
                                                                        value ===
                                                                            'none'
                                                                            ? ''
                                                                            : value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pilih status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">
                                                                        Belum
                                                                        dipilih
                                                                    </SelectItem>
                                                                    <SelectItem value="single">
                                                                        Belum
                                                                        menikah
                                                                    </SelectItem>
                                                                    <SelectItem value="married">
                                                                        Menikah
                                                                    </SelectItem>
                                                                    <SelectItem value="divorced">
                                                                        Cerai
                                                                    </SelectItem>
                                                                    <SelectItem value="widowed">
                                                                        Duda /
                                                                        Janda
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            {participantForm
                                                                .errors
                                                                .marital_status ? (
                                                                <p className="text-sm text-destructive">
                                                                    {
                                                                        participantForm
                                                                            .errors
                                                                            .marital_status
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="birth_place">
                                                                Tempat Lahir
                                                            </Label>
                                                            <Input
                                                                id="birth_place"
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .birth_place
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'birth_place',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="birth_date">
                                                                Tanggal Lahir
                                                            </Label>
                                                            <Input
                                                                id="birth_date"
                                                                type="date"
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .birth_date
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'birth_date',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Ukuran Baju
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .shirt_size
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'shirt_size',
                                                                        value ===
                                                                            'none'
                                                                            ? ''
                                                                            : value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pilih ukuran" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">
                                                                        Belum
                                                                        dipilih
                                                                    </SelectItem>
                                                                    {[
                                                                        'XS',
                                                                        'S',
                                                                        'M',
                                                                        'L',
                                                                        'XL',
                                                                        'XXL',
                                                                        'XXXL',
                                                                    ].map(
                                                                        (
                                                                            size,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    size
                                                                                }
                                                                                value={
                                                                                    size
                                                                                }
                                                                            >
                                                                                {
                                                                                    size
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            {participantForm
                                                                .errors
                                                                .shirt_size ? (
                                                                <p className="text-sm text-destructive">
                                                                    {
                                                                        participantForm
                                                                            .errors
                                                                            .shirt_size
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </div>

                                                        <div className="grid gap-3">
                                                            <Label>
                                                                Butuh Kursi Roda
                                                            </Label>
                                                            <div className="flex items-center justify-between rounded-xl border px-3 py-2">
                                                                <span className="text-sm text-muted-foreground">
                                                                    Tandai jika
                                                                    butuh
                                                                    bantuan
                                                                    kursi roda.
                                                                </span>
                                                                <Switch
                                                                    checked={
                                                                        participantForm
                                                                            .data
                                                                            .needs_wheelchair
                                                                    }
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) =>
                                                                        participantForm.setData(
                                                                            'needs_wheelchair',
                                                                            checked,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-2 md:col-span-2">
                                                            <Label htmlFor="participant_address">
                                                                Alamat
                                                            </Label>
                                                            <Textarea
                                                                id="participant_address"
                                                                rows={3}
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .address
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'address',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-sm font-semibold">
                                                                Paspor
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Isi informasi
                                                                paspor peserta.
                                                            </p>
                                                        </div>
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            <div className="grid gap-3 md:col-span-2">
                                                                <Label>
                                                                    Paspor Ready
                                                                </Label>
                                                                <div className="flex items-center justify-between rounded-xl border px-3 py-2">
                                                                    <span className="text-sm text-muted-foreground">
                                                                        Tandai
                                                                        jika
                                                                        paspor
                                                                        sudah
                                                                        tersedia.
                                                                    </span>
                                                                    <Switch
                                                                        checked={
                                                                            participantForm
                                                                                .data
                                                                                .passport_ready
                                                                        }
                                                                        onCheckedChange={(
                                                                            checked,
                                                                        ) =>
                                                                            participantForm.setData(
                                                                                'passport_ready',
                                                                                checked,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label>
                                                                    Tipe Paspor
                                                                </Label>
                                                                <Select
                                                                    value={
                                                                        participantForm
                                                                            .data
                                                                            .passport_type
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        participantForm.setData(
                                                                            'passport_type',
                                                                            value ===
                                                                                'none'
                                                                                ? ''
                                                                                : value,
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Pilih tipe paspor" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="none">
                                                                            Belum
                                                                            dipilih
                                                                        </SelectItem>
                                                                        <SelectItem value="ordinary">
                                                                            Biasa
                                                                        </SelectItem>
                                                                        <SelectItem value="e_passport">
                                                                            E-Passport
                                                                        </SelectItem>
                                                                        <SelectItem value="official">
                                                                            Dinas
                                                                        </SelectItem>
                                                                        <SelectItem value="diplomatic">
                                                                            Diplomatik
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                {participantForm
                                                                    .errors
                                                                    .passport_type ? (
                                                                    <p className="text-sm text-destructive">
                                                                        {
                                                                            participantForm
                                                                                .errors
                                                                                .passport_type
                                                                        }
                                                                    </p>
                                                                ) : null}
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label htmlFor="passport_issue_date">
                                                                    Tanggal
                                                                    Terbit
                                                                    Paspor
                                                                </Label>
                                                                <Input
                                                                    id="passport_issue_date"
                                                                    type="date"
                                                                    value={
                                                                        participantForm
                                                                            .data
                                                                            .passport_issue_date
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        participantForm.setData(
                                                                            'passport_issue_date',
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                {participantForm
                                                                    .errors
                                                                    .passport_issue_date ? (
                                                                    <p className="text-sm text-destructive">
                                                                        {
                                                                            participantForm
                                                                                .errors
                                                                                .passport_issue_date
                                                                        }
                                                                    </p>
                                                                ) : null}
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label htmlFor="passport_expiry_date">
                                                                    Tanggal
                                                                    Kadaluarsa
                                                                    Paspor
                                                                </Label>
                                                                <Input
                                                                    id="passport_expiry_date"
                                                                    type="date"
                                                                    value={
                                                                        participantForm
                                                                            .data
                                                                            .passport_expiry_date
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        participantForm.setData(
                                                                            'passport_expiry_date',
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                {participantForm
                                                                    .errors
                                                                    .passport_expiry_date ? (
                                                                    <p className="text-sm text-destructive">
                                                                        {
                                                                            participantForm
                                                                                .errors
                                                                                .passport_expiry_date
                                                                        }
                                                                    </p>
                                                                ) : null}
                                                            </div>

                                                            <div className="grid gap-2">
                                                                <Label>
                                                                    Masa Berlaku
                                                                    Paspor
                                                                </Label>
                                                                <div className="rounded-xl border bg-muted/40 px-3 py-2 text-sm">
                                                                    {computedPassportValidityYears
                                                                        ? `${computedPassportValidityYears} tahun`
                                                                        : 'Akan terdeteksi otomatis'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>

                                            <Collapsible
                                                open={expandedParticipantFormSections.includes(
                                                    'documents',
                                                )}
                                                onOpenChange={() =>
                                                    toggleParticipantFormSection(
                                                        'documents',
                                                    )
                                                }
                                                className="overflow-hidden rounded-2xl border"
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="flex w-full flex-col gap-3 bg-card px-4 py-4 text-left transition hover:bg-muted/20 md:flex-row md:items-center md:justify-between"
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-medium">
                                                                    Dokumen
                                                                </p>
                                                                <Badge variant="outline">
                                                                    {
                                                                        participantFormDocumentTotal
                                                                    }
                                                                    /6 siap
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Upload dokumen
                                                                peserta dengan
                                                                tampilan preview
                                                                yang sama dan
                                                                rapi.
                                                            </p>
                                                        </div>
                                                        <ChevronDown
                                                            className={`h-4 w-4 shrink-0 transition-transform ${expandedParticipantFormSections.includes('documents') ? 'rotate-180' : ''}`}
                                                        />
                                                    </button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="border-t bg-muted/10 px-4 py-4">
                                                    <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-3">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    Ringkasan
                                                                    dokumen
                                                                    peserta
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Cek cepat
                                                                    dokumen yang
                                                                    sudah aktif
                                                                    atau baru
                                                                    dipilih.
                                                                </p>
                                                            </div>
                                                            <Badge variant="outline">
                                                                {
                                                                    participantFormDocumentTotal
                                                                }
                                                                /6 dokumen siap
                                                            </Badge>
                                                        </div>
                                                        {editingParticipant ? (
                                                            <p className="mt-2 text-xs text-muted-foreground">
                                                                Dokumen
                                                                tersimpan
                                                                sebelumnya:{' '}
                                                                {
                                                                    editingParticipantDocumentCount
                                                                }
                                                                /6
                                                            </p>
                                                        ) : null}
                                                    </div>

                                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                        {participantDocumentInputs.map(
                                                            (documentField) => {
                                                                const selectedFile =
                                                                    participantForm
                                                                        .data[
                                                                        documentField
                                                                            .field
                                                                    ];
                                                                const previewUrl =
                                                                    participantDocumentPreviews[
                                                                        documentField
                                                                            .field
                                                                    ];
                                                                const currentPreview =
                                                                    previewUrl ??
                                                                    documentField.existing;
                                                                const isImagePreview =
                                                                    isImageDocument(
                                                                        selectedFile ??
                                                                            documentField.existing,
                                                                    ) &&
                                                                    currentPreview !==
                                                                        null;
                                                                const isPdfPreview =
                                                                    isPdfDocument(
                                                                        selectedFile ??
                                                                            documentField.existing,
                                                                    );
                                                                const statusLabel =
                                                                    selectedFile
                                                                        ? 'Baru dipilih'
                                                                        : documentField.existing
                                                                          ? 'Tersimpan'
                                                                          : 'Belum ada';

                                                                return (
                                                                    <div
                                                                        key={
                                                                            documentField.field
                                                                        }
                                                                        className="flex min-w-0 flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm transition hover:border-primary/30"
                                                                    >
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <div className="space-y-1">
                                                                                <Label
                                                                                    htmlFor={
                                                                                        documentField.field
                                                                                    }
                                                                                    className="text-sm font-semibold"
                                                                                >
                                                                                    {
                                                                                        documentField.label
                                                                                    }
                                                                                </Label>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    {
                                                                                        documentField.description
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <Badge
                                                                                variant={
                                                                                    selectedFile
                                                                                        ? 'default'
                                                                                        : documentField.existing
                                                                                          ? 'secondary'
                                                                                          : 'outline'
                                                                                }
                                                                            >
                                                                                {
                                                                                    statusLabel
                                                                                }
                                                                            </Badge>
                                                                        </div>

                                                                        <div className="grid gap-4">
                                                                            <div className="flex aspect-[4/3] min-h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/60 bg-muted/30">
                                                                                {isImagePreview &&
                                                                                currentPreview ? (
                                                                                    <img
                                                                                        src={
                                                                                            currentPreview
                                                                                        }
                                                                                        alt={
                                                                                            documentField.label
                                                                                        }
                                                                                        className="h-full w-full object-cover"
                                                                                    />
                                                                                ) : isPdfPreview ? (
                                                                                    <div className="flex flex-col items-center gap-2 px-3 text-center">
                                                                                        <FileText className="h-8 w-8 text-primary" />
                                                                                        <p className="text-xs font-medium text-foreground">
                                                                                            Preview
                                                                                            PDF
                                                                                        </p>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex flex-col items-center gap-2 px-3 text-center">
                                                                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                            Belum
                                                                                            ada
                                                                                            file
                                                                                        </p>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            <div className="min-w-0 space-y-3">
                                                                                <input
                                                                                    id={
                                                                                        documentField.field
                                                                                    }
                                                                                    type="file"
                                                                                    accept={
                                                                                        documentField.field ===
                                                                                        'photo'
                                                                                            ? 'image/png,image/jpeg,image/webp'
                                                                                            : '.jpg,.jpeg,.png,.webp,.pdf'
                                                                                    }
                                                                                    className="hidden"
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        handleParticipantFileChange(
                                                                                            documentField.field,
                                                                                            event,
                                                                                        )
                                                                                    }
                                                                                />

                                                                                <label
                                                                                    htmlFor={
                                                                                        documentField.field
                                                                                    }
                                                                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition hover:border-primary/50 hover:bg-primary/10"
                                                                                >
                                                                                    <Upload className="h-4 w-4" />
                                                                                    Pilih
                                                                                    atau
                                                                                    ganti
                                                                                    file
                                                                                </label>

                                                                                <div className="rounded-xl border bg-muted/30 p-3 text-xs">
                                                                                    <p className="font-medium break-words text-foreground">
                                                                                        File
                                                                                        dipilih:{' '}
                                                                                        {selectedFile?.name ??
                                                                                            '-'}
                                                                                    </p>
                                                                                    <p className="mt-1 break-words text-muted-foreground">
                                                                                        File
                                                                                        tersimpan:{' '}
                                                                                        {participantFileName(
                                                                                            documentField.existing,
                                                                                        )}
                                                                                    </p>
                                                                                </div>

                                                                                <div className="grid gap-2 sm:grid-cols-2">
                                                                                    {currentPreview ? (
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            className="w-full"
                                                                                            onClick={() =>
                                                                                                window.open(
                                                                                                    currentPreview,
                                                                                                    '_blank',
                                                                                                    'noopener,noreferrer',
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                                            Preview
                                                                                        </Button>
                                                                                    ) : null}
                                                                                    {selectedFile ? (
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            className="w-full"
                                                                                            onClick={() =>
                                                                                                clearParticipantFile(
                                                                                                    documentField.field,
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                                            Hapus
                                                                                            pilihan
                                                                                        </Button>
                                                                                    ) : null}
                                                                                </div>

                                                                                {documentField.error ? (
                                                                                    <p className="text-sm text-destructive">
                                                                                        {
                                                                                            documentField.error
                                                                                        }
                                                                                    </p>
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>

                                            <Collapsible
                                                open={expandedParticipantFormSections.includes(
                                                    'additional',
                                                )}
                                                onOpenChange={() =>
                                                    toggleParticipantFormSection(
                                                        'additional',
                                                    )
                                                }
                                                className="overflow-hidden rounded-2xl border"
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="flex w-full flex-col gap-3 bg-card px-4 py-4 text-left transition hover:bg-muted/20 md:flex-row md:items-center md:justify-between"
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-medium">
                                                                    Info
                                                                    Tambahan
                                                                </p>
                                                                <Badge variant="outline">
                                                                    {participantForm
                                                                        .data
                                                                        .emergency_contact_name ||
                                                                        'Kontak darurat belum diisi'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Riwayat
                                                                penyakit, kontak
                                                                darurat, dan
                                                                sumber referral.
                                                            </p>
                                                        </div>
                                                        <ChevronDown
                                                            className={`h-4 w-4 shrink-0 transition-transform ${expandedParticipantFormSections.includes('additional') ? 'rotate-180' : ''}`}
                                                        />
                                                    </button>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent className="border-t bg-muted/10 px-4 py-4">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="grid gap-2 md:col-span-2">
                                                            <Label htmlFor="medical_history_notes">
                                                                Riwayat Penyakit
                                                            </Label>
                                                            <Textarea
                                                                id="medical_history_notes"
                                                                rows={3}
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .medical_history_notes
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) => {
                                                                    const value =
                                                                        event
                                                                            .target
                                                                            .value;

                                                                    participantForm.setData(
                                                                        (
                                                                            data,
                                                                        ) => ({
                                                                            ...data,
                                                                            medical_history_notes:
                                                                                value,
                                                                            has_medical_history:
                                                                                value.trim() !==
                                                                                '',
                                                                        }),
                                                                    );
                                                                }}
                                                                placeholder="Opsional, isi jika ada riwayat penyakit"
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label>
                                                                Pernah Umrah
                                                                Sebelumnya
                                                            </Label>
                                                            <Select
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .has_performed_umrah
                                                                        ? 'yes'
                                                                        : 'no'
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'has_performed_umrah',
                                                                        value ===
                                                                            'yes',
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pilih status umrah" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="no">
                                                                        Belum
                                                                        Pernah
                                                                    </SelectItem>
                                                                    <SelectItem value="yes">
                                                                        Sudah
                                                                        Pernah
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="emergency_contact_name">
                                                                Nama Kontak
                                                                Darurat
                                                            </Label>
                                                            <Input
                                                                id="emergency_contact_name"
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .emergency_contact_name
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'emergency_contact_name',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            {participantForm
                                                                .errors
                                                                .passport_expiry_date ? (
                                                                <p className="text-sm text-destructive">
                                                                    {
                                                                        participantForm
                                                                            .errors
                                                                            .passport_expiry_date
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="emergency_contact_phone">
                                                                Nomor Kontak
                                                                Darurat
                                                            </Label>
                                                            <Input
                                                                id="emergency_contact_phone"
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .emergency_contact_phone
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'emergency_contact_phone',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="emergency_contact_relationship">
                                                                Hubungan dengan
                                                                Jemaah
                                                            </Label>
                                                            <Input
                                                                id="emergency_contact_relationship"
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .emergency_contact_relationship
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'emergency_contact_relationship',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2 md:col-span-2">
                                                            <Label htmlFor="referral_source">
                                                                Dari Mana
                                                                Mengetahui Asfar
                                                                Tour
                                                            </Label>
                                                            <Input
                                                                id="referral_source"
                                                                value={
                                                                    participantForm
                                                                        .data
                                                                        .referral_source
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    participantForm.setData(
                                                                        'referral_source',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                                        Pilih data pada{' '}
                                        <span className="font-medium text-foreground">
                                            Draft Import Spreadsheet
                                        </span>{' '}
                                        untuk tambah peserta baru, atau klik{' '}
                                        <span className="font-medium text-foreground">
                                            Edit
                                        </span>{' '}
                                        pada peserta tersimpan untuk membuka
                                        form detail dan upload dokumen.
                                    </div>
                                )}
                            </div>
                        </div>

                        {editingParticipant ? (
                            <div className="border-t bg-card px-4 py-4 sm:px-6">
                                <DrawerFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={resetParticipantForm}
                                        className="w-full sm:w-auto"
                                    >
                                        Tutup Edit
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={participantForm.processing}
                                        className="w-full sm:w-auto"
                                    >
                                        {participantForm.processing
                                            ? 'Menyimpan...'
                                            : 'Simpan Peserta'}
                                    </Button>
                                </DrawerFooter>
                            </div>
                        ) : null}
                    </form>
                </SheetContent>
            </Sheet>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Booking</DialogTitle>
                        <DialogDescription>
                            Booking{' '}
                            <strong>{deleteTarget?.booking_code ?? '-'}</strong>{' '}
                            akan dihapus permanen dari listing admin.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Batal
                        </Button>
                        {canDelete ? (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={form.processing}
                            >
                                Hapus Booking
                            </Button>
                        ) : null}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
