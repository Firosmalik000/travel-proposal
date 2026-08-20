export type Participant = {
    slot_number: number;
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
    has_medical_history: boolean;
    medical_history_notes: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    has_performed_umrah: boolean;
    referral_source: string | null;
    documents_count: number;
    documents_total: number;
    documents: {
        key: string;
        label: string;
        url: string | null;
    }[];
    missing_fields: string[];
    missing_documents: string[];
    missing_count: number;
    is_complete: boolean;
};

export type ParticipantSlot = {
    slot_number: number;
    is_filled: boolean;
    participant: Participant | null;
};

export type CustomerBooking = {
    id: number;
    booking_code: string;
    full_name: string;
    phone: string;
    email: string | null;
    origin_city: string;
    status: string;
    passenger_count: number;
    participants_count: number;
    remaining_slots: number;
    completion_percent: number;
    complete_participants_count: number;
    incomplete_participants_count: number;
    missing_fields_count: number;
    missing_documents_count: number;
    outstanding_count: number;
    is_complete: boolean;
    created_at: string | null;
    package: {
        id: number;
        code: string | null;
        name: string;
        package_type: string | null;
    };
    schedule: {
        id: number | null;
        departure_date: string | null;
        return_date: string | null;
        departure_city: string | null;
        status: string | null;
    };
    slots: ParticipantSlot[];
};

export type ScheduleGroup = {
    id: number | null;
    departure_date: string | null;
    return_date: string | null;
    departure_city: string | null;
    status: string | null;
    booking_count: number;
    customers: number;
    participants: number;
    remaining: number;
    bookings: CustomerBooking[];
};

export type PackageGroup = {
    id: number;
    code: string | null;
    name: string;
    package_type: string | null;
    booking_count: number;
    customers: number;
    participants: number;
    remaining: number;
    completion_percent: number;
    incomplete_booking_count: number;
    bookings: CustomerBooking[];
    schedules: ScheduleGroup[];
};

export type CustomerDataFilters = {
    search: string;
    status: string;
    travel_package_id: number | null;
};

export type CustomerDataSummary = {
    packages: number;
    bookings: number;
    customers: number;
    participants: number;
    remaining: number;
};
