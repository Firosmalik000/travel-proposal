export type Schedule = {
    id: number;
    departure_date: string;
    return_date: string | null;
    departure_city: string;
    seats_total: number;
    seats_available: number;
    status: 'open' | 'full' | 'closed';
    notes: string | null;
    is_active: boolean;
};

export type Package = {
    id: number;
    code: string;
    slug: string;
    name: { id: string; en: string };
    package_type: 'reguler' | 'vip' | 'private';
    departure_city: string;
    duration_days: number;
    price: number;
    original_price: number | null;
    discount_label: string | null;
    discount_ends_at: string | null;
    discount_percent: number | null;
    currency: string;
    image_path: string | null;
    summary: { id: string; en: string };
    content: Record<string, unknown>;
    is_featured: boolean;
    is_active: boolean;
    product_ids: number[];
    schedules: Schedule[];
    rating_avg: number | null;
    rating_count: number;
};

export type ProductOption = {
    id: number;
    code: string;
    name: { id: string; en: string };
    product_type: string;
};

export type PackageFormData = {
    code: string;
    slug: string;
    'name.id': string;
    'name.en': string;
    package_type: string;
    departure_city: string;
    duration_days: number;
    price: number;
    original_price: number | '';
    discount_label: string;
    discount_ends_at: string;
    currency: string;
    image: File | null;
    'summary.id': string;
    'summary.en': string;
    content: Record<string, unknown>;
    product_ids: number[];
    is_featured: boolean;
    is_active: boolean;
};

export type ScheduleFormData = {
    departure_date: string;
    return_date: string;
    departure_city: string;
    seats_total: number;
    seats_available: number;
    status: string;
    notes: string;
    is_active: boolean;
};
