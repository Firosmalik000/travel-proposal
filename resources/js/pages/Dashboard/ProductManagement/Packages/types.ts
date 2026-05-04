import type { PackageHighlightItem } from '@/lib/package-highlights';

export type PackageContent = {
    highlights?: PackageHighlightItem[];
    included?: { id?: string[]; en?: string[] };
    excluded?: { id?: string[]; en?: string[] };
    policy?: { id?: string; en?: string };
};

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

export type Itinerary = {
    id: number;
    activity_id: number | null;
    activity_ids: number[];
    day_number: number;
    sort_order: number;
    title: { id: string; en: string };
    description: { id: string; en: string };
    activity?: ActivityOption | null;
    activities?: ActivityOption[];
    product_ids: number[];
    products?: ProductOption[];
};

export type Package = {
    id: number;
    code: string;
    slug: string;
    name: { id: string; en: string };
    package_type: 'reguler' | 'hemat' | 'vip' | 'premium' | 'private';
    departure_city: string;
    duration_days: number;
    price: number;
    original_price: number | null;
    discount_label: string | null;
    discount_ends_at: string | null;
    discount_percent: number | null;
    currency: string;
    image_path: string | null;
    images?: string[];
    summary: { id: string; en: string };
    content: Record<string, any>;
    is_featured: boolean;
    is_active: boolean;
    product_ids: number[];
    schedules: Schedule[];
    itineraries: Itinerary[];
    rating_avg: number | null;
    rating_count: number;
};

export type ProductOption = {
    id: number;
    code: string;
    name: { id: string; en: string };
    product_type: string;
};

export type ActivityOption = {
    id: number;
    code: string;
    name: { id: string; en: string };
    description: { id: string; en: string };
    sort_order: number;
};

export type PackageFormData = {
    slug: string;
    'name.id': string;
    'name.en': string;
    package_type: string;
    departure_city: string;
    duration_days: number;
    price: number;
    original_price: number | '';
    discount_percent: number | '';
    discount_label: string;
    discount_ends_at: string;
    currency: string;
    images: File[];
    'summary.id': string;
    'summary.en': string;
    content: PackageContent;
    itineraries: ItineraryInput[];
    product_ids: number[];
    is_featured: boolean;
    is_active: boolean;
};

export type ItineraryInput = {
    id?: number;
    activity_id: number | null;
    activity_ids: number[];
    day_number: number;
    sort_order: number;
    title: { id: string; en: string };
    description: { id: string; en: string };
    product_ids: number[];
};

export type PackageHighlightInput = PackageHighlightItem;

export type ScheduleFormData = {
    departure_date: string;
    return_date: string;
    departure_city: string;
    seats_total: number;
    status: string;
    notes: string;
    is_active: boolean;
};
