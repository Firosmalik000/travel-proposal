import type { PackageHighlightItem } from '@/lib/package-highlights';

export type PackageRoomPrices = {
    dbl?: number | null;
    trpl?: number | null;
    quad?: number | null;
};

export type PackageRoomOriginalPrices = {
    dbl?: number | null;
    trpl?: number | null;
    quad?: number | null;
};

export type PackageContent = {
    highlights?: PackageHighlightItem[];
    included?: { id?: string[]; en?: string[] };
    excluded?: { id?: string[]; en?: string[] };
    policy?: { id?: string; en?: string };
    hotel_product_brokers?: Record<string, string>;
    room_prices?: PackageRoomPrices;
    room_original_prices?: PackageRoomOriginalPrices;
    hpp_estimate?: PackageHppEstimate;
    currency_rate_snapshot?: CurrencyRateSnapshot;
    hpp_currency_snapshots?: Record<string, CurrencyRateSnapshot>;
};

export type CurrencyRateSnapshot = {
    currency: string;
    rate_to_idr: number;
    source: string;
    fetched_at: string | null;
};

export type PackageHppEstimate = {
    customers?: {
        single?: number;
        dbl?: number;
        trpl?: number;
        quad?: number;
    };
    customers_is_manual?: boolean;
    product_quantities?: Record<string, number>;
    product_quantities_is_manual?: Record<string, boolean>;
    hotel_allocations?: Record<
        string,
        { dbl?: number; trpl?: number; quad?: number }
    >;
    hotel_allocations_unit?: 'pax' | 'rooms';
    hotel_allocations_is_manual?: Record<string, boolean>;
    product_cost_per_customer?: number;
    hotel_total?: number;
    tour_leader_fee?: number;
    tour_leader_fee_is_manual?: boolean;
    muthawwif_fee?: number;
    muthawwif_fee_is_manual?: boolean;
    other_cost?: number;
    operational_costs?: PackageOperationalCosts;
    notes?: string | null;
    customer_count?: number;
    product_total?: number;
    revenue_total?: number;
    grand_total?: number;
    operational_total?: number;
    hpp_per_customer?: number | null;
    estimated_profit?: number;
    calculated_at?: string;
    revenue_original_total?: number;
    revenue_currency?: string;
    conversion_rate_to_idr?: number;
    conversion_rate_source?: string;
    conversion_rate_fetched_at?: string | null;
    items?: PackageHppEstimateItem[];
    warnings?: string[];
};

export type PackageOperationalCosts = {
    overhead: {
        amount: number;
        mode: 'total' | 'per_pax';
    };
    photographer: {
        count: number;
        daily_salary: number;
        days: number;
    };
    human_resources: Array<{
        id: string;
        name: string;
        salary: number;
    }>;
    tour_leader: {
        count: number;
        salary_per_trip: number;
        include_hotel: boolean;
        include_ticket_and_visa: boolean;
    };
    muthawwif: {
        count: number;
        daily_salary: number;
        days: number;
        currency: string;
        include_hotel: boolean;
    };
    marketing: {
        amount_per_pax: number;
    };
    guide_tips: Array<{
        id: string;
        country: string;
        amount_per_day: number;
        days: number;
        currency: string;
        mode: 'per_pax' | 'per_group';
    }>;
    driver_tips: Array<{
        id: string;
        country: string;
        amount: number;
        currency: string;
    }>;
};

export type PackageHppEstimateItem = {
    cost_type: 'hotel' | 'product' | 'all_in' | 'fee' | 'other';
    reference_id?: number | null;
    label: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    meta?: Record<string, string | number | boolean | null>;
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
    name: { id: string; en: string } | string;
    package_type: 'reguler' | 'hemat' | 'vip' | 'premium' | 'private';
    departure_city: string;
    start_date: string | null;
    end_date: string | null;
    seats_total: number;
    seats_available: number;
    booking_status: 'open' | 'full' | 'closed';
    departure_notes: string | null;
    duration_days: number;
    price: number;
    original_price: number | null;
    discount_type: 'percent' | 'nominal';
    discount_nominal: number | null;
    discount_label: string | null;
    discount_ends_at: string | null;
    discount_percent: number | null;
    currency: string;
    image_path: string | null;
    images?: string[];
    summary: { id: string; en: string } | string;
    content: PackageContent & Record<string, unknown>;
    is_featured: boolean;
    is_active: boolean;
    product_ids: number[];
    product_multipliers: Record<string, number>;
    custom_products: PackageSpecificProduct[];
    itineraries: Itinerary[];
    rating_avg: number | null;
    rating_count: number;
    all_in: PackageAllInConfiguration;
};

export type PackageDraftTemporaryImage = {
    id: string;
    path: string;
    original_name: string;
    mime_type: string | null;
    size: number;
};

export type PackageDraftPayload = Partial<
    Omit<
        PackageFormData,
        'images' | 'name.id' | 'name.en' | 'summary.id' | 'summary.en'
    >
> & {
    name?: { id?: string; en?: string };
    summary?: { id?: string; en?: string };
    existing_images?: string[];
};

export type PackageDraft = {
    id: number;
    package_id: number | null;
    payload: PackageDraftPayload;
    temporary_images: PackageDraftTemporaryImage[];
    base_package_updated_at: string | null;
    last_autosaved_at: string | null;
    expires_at: string | null;
    has_conflict: boolean;
};

export type PackageDraftSummary = Omit<
    PackageDraft,
    'payload' | 'temporary_images' | 'base_package_updated_at'
> & {
    name: string;
};

export type PackageAllInConfiguration = {
    enabled: boolean;
    vendor_id: number | null;
    period_id: number | null;
    broker_package_name: string;
    currency: string;
    price_per_pax: number | null;
    included_category_keys: string[];
    vendor_name_snapshot?: string;
    period_label_snapshot?: string;
    period_start_snapshot?: string;
    period_end_snapshot?: string;
};

export type ProductCategoryOption = {
    id: number;
    key: string;
    name: { id?: string; en?: string } | string;
};

export type HotelCountryOption = {
    id: number;
    name: string;
};

export type HotelCityOption = {
    id: number;
    country_id: number;
    name: string;
    country_name: string;
};

export type VendorPricePeriodOption = {
    id: number;
    label: string;
    start_date: string;
    end_date: string;
    currency: string;
    price_per_pax: number;
    notes: string | null;
    is_active: boolean;
};

export type PackageVendorOption = {
    id: number;
    name: string;
    phone: string;
    periods: VendorPricePeriodOption[];
};

export type ProductOption = {
    id: number;
    code: string;
    name: { id: string; en: string } | string;
    product_type: string;
    price?: number | null;
    currency?: string | null;
    hotel_info?: {
        city?: string | null;
        country?: string | null;
        currency?: string | null;
        pricing: Array<{
            broker_name: string | null;
            room_type: string | null;
            period_start: string | null;
            period_end: string | null;
            price: number | string | null;
        }>;
    } | null;
    is_package_specific?: boolean;
};

export type PackageSpecificProductPricing = {
    broker_name: string;
    room_type: 'DBL' | 'TRPL' | 'QUAD';
    period_start: string;
    period_end: string;
    price: number;
};

export type PackageSpecificProduct = {
    id?: number | null;
    client_key: string;
    estimate_id: number;
    name: string;
    product_type: string;
    description: string;
    currency: string;
    price: number | null;
    multiplier_per_pax: number;
    country_id: number | null;
    city_id: number | null;
    country: string;
    city: string;
    pricing: PackageSpecificProductPricing[];
};

export type CurrencyOption = {
    code: string;
    name: string;
    conversion_rate: number;
    live_conversion_rate: number;
    rate_source: string;
    rate_fetched_at: string | null;
    is_live: boolean;
};

export type ActivityOption = {
    id: number;
    code: string;
    name: { id: string; en: string } | string;
    description: { id: string; en: string } | string;
    sort_order: number;
};

export type PackageFormData = {
    slug: string;
    'name.id': string;
    'name.en': string;
    package_type: string;
    departure_city: string;
    start_date: string;
    end_date: string;
    seats_total: number;
    booking_status: 'open' | 'closed';
    departure_notes: string;
    duration_days: number;
    price: number;
    original_price: number | '';
    discount_percent: number | '';
    discount_type: 'percent' | 'nominal';
    discount_nominal: number | '';
    discount_label: string;
    discount_ends_at: string;
    currency: string;
    images: File[];
    'summary.id': string;
    'summary.en': string;
    content: PackageContent;
    itineraries: ItineraryInput[];
    product_ids: number[];
    product_multipliers: Record<string, number>;
    custom_products: PackageSpecificProduct[];
    is_featured: boolean;
    is_active: boolean;
    refresh_currency_rates?: boolean;
    all_in: PackageAllInConfiguration;
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

export const packageImageMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/webp',
] as const;
