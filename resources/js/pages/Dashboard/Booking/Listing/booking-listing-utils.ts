import type {
    BulkParticipantImportRow,
    Participant,
    ParticipantDocumentField,
    ParticipantDocumentPreviewMap,
    ParticipantFormData,
    ParticipantImportDocumentFileField,
    ParticipantImportDocumentPreviewField,
    ParticipantImportPreviewRow,
    Registration,
    TravelPackageOption,
} from './booking-listing-types';

export function emptyParticipantDocumentPreviewMap(): ParticipantDocumentPreviewMap {
    return {
        passport_scan: null,
        family_card_scan: null,
        marriage_book_scan: null,
        birth_certificate_scan: null,
        photo: null,
        meningitis_vaccine_scan: null,
    };
}

export function formatParticipantImportSkipSummary(
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

export function resolveCsrfToken(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content')
            ?.trim() ?? ''
    );
}

export function statusBadgeVariant(
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

export const paymentStatusMeta = {
    unpaid: {
        label: 'Belum dibayar',
        className:
            'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200',
    },
    partial: {
        label: 'Dibayar sebagian',
        className:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
    },
    paid: {
        label: 'Lunas',
        className:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
    },
} as const;

export function participantFileName(value: string | null): string {
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

export function toAbsoluteParticipantDocumentUrl(value: string | null): string {
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

export const participantDraftDocumentInputs: Array<{
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

export const normalizeSpreadsheetCell = (value: unknown): string =>
    String(value ?? '')
        .trim()
        .replace(/\s+/g, ' ');

export const normalizeSpreadsheetKey = (value: string): string =>
    normalizeSpreadsheetCell(value)
        .normalize('NFKD')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '');

export function parseSpreadsheetBoolean(value: unknown): boolean {
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

export function normalizeSpreadsheetGender(value: unknown): string | null {
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

export function normalizeSpreadsheetMaritalStatus(
    value: unknown,
): string | null {
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

export function normalizeSpreadsheetPassportType(
    value: unknown,
): string | null {
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

export function normalizeSpreadsheetDate(value: unknown): string {
    return normalizeSpreadsheetCell(value);
}

export function validateParticipantImportRows(
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

export function isImageDocument(value: File | string | null): boolean {
    if (!value) {
        return false;
    }

    if (value instanceof File) {
        return value.type.startsWith('image/');
    }

    return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(value);
}

export function isPdfDocument(value: File | string | null): boolean {
    if (!value) {
        return false;
    }

    if (value instanceof File) {
        return value.type === 'application/pdf';
    }

    return /\.pdf$/i.test(value);
}

export function detectPassportValidityYears(
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

export function participantDocumentCount(participant: Participant): number {
    return [
        participant.passport_scan_path,
        participant.family_card_scan_path,
        participant.marriage_book_scan_path,
        participant.birth_certificate_scan_path,
        participant.photo_path,
        participant.meningitis_vaccine_scan_path,
    ].filter(Boolean).length;
}

export function participantFormDocumentCount(
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

export function packageDisplayName(
    travelPackage: TravelPackageOption | Registration['travel_package'],
    locale: string,
): string {
    if (typeof travelPackage.name === 'string') {
        return travelPackage.name || '-';
    }

    return travelPackage.name?.[locale] ?? travelPackage.name?.id ?? '-';
}
