export type Registration = {
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
    participant_data_complete?: boolean;
    participant_outstanding_count?: number;
    participant_reminder?: ParticipantReminder;
    revenue?: {
        currency: string;
        amount: number;
    };
    payment: {
        status: 'unpaid' | 'partial' | 'paid';
        total_amount: number;
        paid_amount: number;
        remaining_amount: number;
        currency: string;
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

export type ParticipantReminder = {
    is_complete: boolean;
    can_remind: boolean;
    can_send_direct: boolean;
    whatsapp_url: string | null;
    outstanding_count: number;
    incomplete_participants_count: number;
    remaining_slots: number;
    missing_fields_count: number;
    missing_documents_count: number;
};

export type TravelPackageOption = {
    id: number;
    code: string | null;
    name: Record<string, string> | null;
    package_type: string | null;
    start_date?: string | null;
    end_date?: string | null;
    departure_city?: string | null;
    seats_available?: number | null;
};

export type ScheduleOption = {
    id: number;
    travel_package_id: number;
    departure_date: string | null;
    return_date: string | null;
    departure_city: string | null;
    status: string | null;
    seats_available: number | null;
};

export type BookingFormData = {
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

export type Participant = {
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

export type ParticipantFormData = {
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

export type BulkParticipantImportRow = {
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

export type ParticipantImportPreviewRow = BulkParticipantImportRow & {
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

export type ParticipantImportEditableField = keyof Pick<
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

export type ParticipantDocumentField = keyof Pick<
    ParticipantFormData,
    | 'passport_scan'
    | 'family_card_scan'
    | 'marriage_book_scan'
    | 'birth_certificate_scan'
    | 'photo'
    | 'meningitis_vaccine_scan'
>;

export type ParticipantImportDocumentFileField =
    | 'passport_scan_file'
    | 'family_card_scan_file'
    | 'marriage_book_scan_file'
    | 'birth_certificate_scan_file'
    | 'photo_file'
    | 'meningitis_vaccine_scan_file';

export type ParticipantImportDocumentPreviewField =
    | 'passport_scan_preview_url'
    | 'family_card_scan_preview_url'
    | 'marriage_book_scan_preview_url'
    | 'birth_certificate_scan_preview_url'
    | 'photo_preview_url'
    | 'meningitis_vaccine_scan_preview_url';

export type ParticipantDocumentPreviewMap = Record<
    ParticipantDocumentField,
    string | null
>;

export type ParticipantResponse = {
    booking: {
        id: number;
        booking_code: string;
        passenger_count: number;
        participants_count: number;
        remaining_slots: number;
        participant_data_complete: boolean;
        participant_outstanding_count: number;
        participant_reminder: ParticipantReminder;
    };
    participants: Participant[];
};

export type BulkParticipantImportResult = {
    createdCount: number;
    savedRowNumbers: number[];
    skippedRows: Array<{
        row: number;
        name: string;
        reason: string;
    }>;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedRegistrations = {
    data: Registration[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
};

export type Props = {
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
