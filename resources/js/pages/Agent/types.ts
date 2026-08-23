export type CurrencyTotal = { currency: string; amount: number };
export type CommissionSummary = {
    currency: string;
    pending: number;
    approved: number;
    paid: number;
};
export type AgentBooking = {
    id: number;
    booking_code: string;
    customer_name: string;
    package_name: string | null;
    departure_date: string | null;
    passenger_count: number;
    total_amount: number;
    currency: string;
    booking_status: string;
    commission_amount: number;
    commission_status: string;
    created_at: string | null;
    detail_url: string;
};
export type AgentLead = {
    id: number;
    reference: string;
    customer_name: string;
    phone: string;
    package_name: string | null;
    departure_date: string | null;
    passenger_count: number;
    status: string;
    created_at: string | null;
};
export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};
export type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};
export type PortalFilters = {
    search?: string;
    status?: string;
    from?: string;
    to?: string;
};

export const money = (value: number, currency = 'IDR') =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);

export const statusLabel: Record<string, string> = {
    pending: 'Menunggu',
    registered: 'Terdaftar',
    approved: 'Disetujui',
    paid: 'Dibayar',
    cancelled: 'Dibatalkan',
    rejected: 'Ditolak',
    completed: 'Selesai',
    not_configured: 'Fee belum diatur',
};
