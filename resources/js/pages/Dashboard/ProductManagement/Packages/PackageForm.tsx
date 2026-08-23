import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime } from '@/lib/date-format';
import {
    normalizePackageContent,
    packageHighlightIconMap,
    packageHighlightIconOptions,
    type PackageHighlightItem,
} from '@/lib/package-highlights';
import { cn } from '@/lib/utils';
import packages from '@/routes/packages';
import { router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    BookOpenText,
    Calculator,
    Camera,
    Cloud,
    CloudOff,
    DollarSign,
    FileText,
    GripVertical,
    Info,
    Layers,
    Plus,
    Tag,
    Trash2,
    Upload,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AllInPackageCard } from './AllInPackageCard';
import { PackageOperationalCostCards } from './PackageOperationalCostCards';
import { PackageSpecificProductManager } from './PackageSpecificProductManager';
import { ProductSelector } from './ProductSelector';
import {
    calculateOperationalCostTotals,
    normalizePackageOperationalCosts,
} from './package-operational-costs';
import type {
    ActivityOption,
    CurrencyOption,
    HotelCityOption,
    HotelCountryOption,
    Itinerary,
    ItineraryInput,
    Package,
    PackageAllInConfiguration,
    PackageDraft,
    PackageDraftPayload,
    PackageFormData,
    PackageHppEstimate,
    PackageSpecificProduct,
    PackageVendorOption,
    ProductCategoryOption,
    ProductOption,
} from './types';
import { packageImageMimeTypes } from './types';

type Props = {
    pkg: Package | null;
    productOptions: ProductOption[];
    currencies: CurrencyOption[];
    activityOptions: ActivityOption[];
    productCategories: ProductCategoryOption[];
    hotelCountries: HotelCountryOption[];
    hotelCities: HotelCityOption[];
    vendors: PackageVendorOption[];
    packageImageUploadMaxKilobytes: number;
    draft: PackageDraft | null;
    locale: 'id' | 'en';
    editorMode?: 'package' | 'hpp';
    onSuccess: () => void;
};

function calculateEndDate(startDate: string, durationDays: number): string {
    if (!startDate) {
        return '';
    }

    const [year, month, day] = startDate.split('-').map(Number);
    if (!year || !month || !day) {
        return '';
    }

    const endDate = new Date(Date.UTC(year, month - 1, day));
    endDate.setUTCDate(endDate.getUTCDate() + Math.max(1, durationDays) - 1);

    return endDate.toISOString().slice(0, 10);
}

const indonesianDepartureCities = [
    'Jakarta',
    'Surabaya',
    'Bandung',
    'Semarang',
    'Yogyakarta',
    'Solo',
    'Malang',
    'Denpasar',
    'Medan',
    'Palembang',
    'Padang',
    'Pekanbaru',
    'Batam',
    'Balikpapan',
    'Banjarmasin',
    'Pontianak',
    'Samarinda',
    'Makassar',
    'Manado',
    'Ambon',
    'Jayapura',
    'Mataram',
    'Kupang',
    'Banda Aceh',
    'Lampung',
] as const;

const packageHighlightPresets = [
    {
        icon: 'Plane',
        label: 'Maskapai',
        placeholder: 'Contoh: Saudia Airlines',
    },
    {
        icon: 'Hotel',
        label: 'Hotel',
        placeholder: 'Contoh: Hotel bintang 3 area Aziziyah',
    },
    { icon: 'BadgeCheck', label: 'Badge', placeholder: 'Contoh: Terlaris' },
    {
        icon: 'CalendarDays',
        label: 'Periode',
        placeholder: 'Contoh: Mei - Juni 2026',
    },
] as const;

function localizedFieldValue(
    value: unknown,
    locale: 'id' | 'en',
    fallback = '',
): string {
    if (typeof value === 'string') {
        const normalized = value.trim();

        return normalized !== '' ? normalized : fallback;
    }

    if (typeof value === 'object' && value !== null) {
        const localized = (value as { id?: string; en?: string })[locale];
        const indonesian = (value as { id?: string }).id;
        const english = (value as { en?: string }).en;
        const normalized = (localized ?? indonesian ?? english ?? '').trim();

        return normalized !== '' ? normalized : fallback;
    }

    return fallback;
}

function createEmptyItinerary(dayNumber: number): ItineraryInput {
    return {
        activity_id: null,
        activity_ids: [],
        day_number: dayNumber,
        sort_order: dayNumber,
        title: { id: '', en: '' },
        description: { id: '', en: '' },
        product_ids: [],
    };
}

function normalizeItineraries(
    durationDays: number,
    itineraries: Array<Itinerary | ItineraryInput> = [],
): ItineraryInput[] {
    const localizedField = (value: unknown): { id: string; en: string } => {
        return {
            id: localizedFieldValue(value, 'id'),
            en: localizedFieldValue(value, 'en'),
        };
    };

    const itineraryByDay = new Map<number, Itinerary | ItineraryInput>();

    itineraries.forEach((itinerary) => {
        itineraryByDay.set(Number(itinerary.day_number), itinerary);
    });

    return Array.from({ length: durationDays }, (_, index) => {
        const dayNumber = index + 1;
        const existingItinerary = itineraryByDay.get(dayNumber);

        if (!existingItinerary) {
            return createEmptyItinerary(dayNumber);
        }

        return {
            id: 'id' in existingItinerary ? existingItinerary.id : undefined,
            activity_id: existingItinerary.activity_id ?? null,
            activity_ids:
                existingItinerary.activity_ids ??
                (existingItinerary.activity_id
                    ? [existingItinerary.activity_id]
                    : []),
            day_number: dayNumber,
            sort_order: Number(existingItinerary.sort_order ?? dayNumber),
            title: localizedField(existingItinerary.title),
            description: localizedField(existingItinerary.description),
            product_ids: [],
        };
    });
}

function buildFormData(pkg: Package | null): PackageFormData {
    const durationDays = pkg?.duration_days ?? 10;
    const originalPrice = pkg ? (pkg.original_price ?? pkg.price) : '';
    const discountPercent =
        pkg?.original_price && pkg.original_price > pkg.price
            ? Math.round((1 - pkg.price / pkg.original_price) * 100)
            : '';
    const nameId =
        typeof pkg?.name === 'string' ? pkg.name : (pkg?.name?.id ?? '');
    const nameEn =
        typeof pkg?.name === 'string' ? pkg.name : (pkg?.name?.en ?? nameId);
    const summaryId =
        typeof pkg?.summary === 'string'
            ? pkg.summary
            : (pkg?.summary?.id ?? '');
    const summaryEn =
        typeof pkg?.summary === 'string'
            ? pkg.summary
            : (pkg?.summary?.en ?? summaryId);

    return {
        slug: pkg?.slug ?? '',
        'name.id': nameId,
        'name.en': nameEn,
        package_type: pkg?.package_type ?? 'reguler',
        departure_city: pkg?.departure_city ?? '',
        start_date: pkg?.start_date ?? '',
        end_date: pkg?.end_date ?? '',
        seats_total: pkg?.seats_total ?? 45,
        booking_status: pkg?.booking_status === 'closed' ? 'closed' : 'open',
        departure_notes: pkg?.departure_notes ?? '',
        duration_days: durationDays,
        price: pkg?.price ?? 0,
        original_price: originalPrice,
        discount_percent: discountPercent,
        discount_label: pkg?.discount_label ?? '',
        discount_ends_at: pkg?.discount_ends_at
            ? pkg.discount_ends_at.slice(0, 16)
            : '',
        currency: pkg?.currency ?? 'IDR',
        images: [],
        'summary.id': summaryId,
        'summary.en': summaryEn,
        content: normalizePackageContent(pkg?.content ?? {}),
        itineraries: normalizeItineraries(durationDays, pkg?.itineraries ?? []),
        product_ids: pkg?.product_ids ?? [],
        product_multipliers: pkg?.product_multipliers ?? {},
        custom_products: pkg?.custom_products ?? [],
        is_featured: pkg?.is_featured ?? false,
        is_active: pkg?.is_active ?? true,
        all_in: pkg?.all_in ?? {
            enabled: false,
            vendor_id: null,
            period_id: null,
            broker_package_name: '',
            currency: 'IDR',
            price_per_pax: null,
            included_category_keys: [],
        },
    };
}

function buildDraftFormData(
    pkg: Package | null,
    payload: PackageDraftPayload,
): PackageFormData {
    const base = buildFormData(pkg);
    const {
        name,
        summary,
        existing_images: _existingImages,
        ...draftFields
    } = payload;
    void _existingImages;
    const durationDays = Math.max(
        1,
        Number(draftFields.duration_days ?? base.duration_days) || 1,
    );

    return {
        ...base,
        ...draftFields,
        'name.id': name?.id ?? base['name.id'],
        'name.en': name?.en ?? base['name.en'],
        'summary.id': summary?.id ?? base['summary.id'],
        'summary.en': summary?.en ?? base['summary.en'],
        duration_days: durationDays,
        images: [],
        content: normalizePackageContent(draftFields.content ?? base.content),
        itineraries: normalizeItineraries(
            durationDays,
            draftFields.itineraries ?? base.itineraries,
        ),
        product_ids: draftFields.product_ids ?? base.product_ids,
        product_multipliers:
            draftFields.product_multipliers ?? base.product_multipliers,
        custom_products: draftFields.custom_products ?? base.custom_products,
        all_in: {
            ...base.all_in,
            ...(draftFields.all_in ?? {}),
        },
    };
}

function buildDraftPayload(
    data: PackageFormData,
    existingImages: string[],
): PackageDraftPayload {
    const {
        images: _images,
        ['name.id']: nameId,
        ['name.en']: nameEn,
        ['summary.id']: summaryId,
        ['summary.en']: summaryEn,
        ...draftFields
    } = data;
    void _images;

    return {
        ...draftFields,
        name: { id: nameId, en: nameEn },
        summary: { id: summaryId, en: summaryEn },
        existing_images: existingImages,
    };
}

function draftImagePaths(draft: PackageDraft | null): string[] {
    if (!draft) {
        return [];
    }

    return Array.from(
        new Set([
            ...(draft.payload.existing_images ?? []),
            ...draft.temporary_images.map((image) => image.path),
        ]),
    );
}

function csrfToken(): string {
    return (
        document
            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

function buildPackageCodePreview(value: string, durationDays: number): string {
    const normalized = value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 38);

    return `ASF-${normalized || 'PACKAGE'}${durationDays > 0 ? `-${durationDays}` : ''}`;
}

function generatePackageSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function contentField(content: Record<string, unknown>, path: string): string {
    const parts = path.split('.');
    let currentValue: unknown = content;

    for (const part of parts) {
        currentValue = (currentValue as Record<string, unknown>)?.[part];
    }

    if (typeof currentValue === 'object' && currentValue !== null) {
        return (currentValue as Record<string, string>)?.id ?? '';
    }

    return typeof currentValue === 'string' ? currentValue : '';
}

function setContentField(
    content: Record<string, unknown>,
    path: string,
    localeKey: 'id' | 'en',
    value: string,
): Record<string, unknown> {
    const nextContent = { ...content };
    const parts = path.split('.');
    let currentPointer: Record<string, unknown> = nextContent;

    for (let index = 0; index < parts.length - 1; index++) {
        const currentPart = parts[index];
        currentPointer[currentPart] = {
            ...((currentPointer[currentPart] as Record<string, unknown>) ?? {}),
        };
        currentPointer = currentPointer[currentPart] as Record<string, unknown>;
    }

    const lastPart = parts[parts.length - 1];
    const existingValue = currentPointer[lastPart];

    currentPointer[lastPart] =
        typeof existingValue === 'object' && existingValue !== null
            ? {
                  ...(existingValue as Record<string, string>),
                  [localeKey]: value,
              }
            : {
                  id: localeKey === 'id' ? value : '',
                  en: localeKey === 'en' ? value : '',
              };

    return nextContent;
}

function getHotelBrokerSelections(
    content: Record<string, unknown>,
): Record<string, string> {
    const value = content.hotel_product_brokers;

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return {};
    }

    return Object.entries(value).reduce(
        (carry, [productId, brokerName]) => {
            if (typeof brokerName === 'string' && brokerName.trim() !== '') {
                carry[productId] = brokerName;
            }

            return carry;
        },
        {} as Record<string, string>,
    );
}

function setHotelBrokerSelections(
    content: Record<string, unknown>,
    selections: Record<string, string>,
): Record<string, unknown> {
    return {
        ...content,
        hotel_product_brokers: selections,
    };
}

function toLines(value: unknown): string {
    if (Array.isArray(value)) {
        return value.join('\n');
    }

    if (typeof value === 'string') {
        return value;
    }

    return '';
}

function normalizeRoomPriceValue(value: string): number | null {
    if (value.trim() === '') {
        return null;
    }

    const parsedValue = Number(value);

    if (Number.isNaN(parsedValue) || parsedValue < 0) {
        return null;
    }

    return parsedValue;
}

function calculateDiscountedPrice(
    originalPrice: number | null,
    discountPercent: number,
): number | null {
    if (originalPrice === null || originalPrice <= 0) {
        return null;
    }

    if (discountPercent <= 0) {
        return Math.round(originalPrice);
    }

    return Math.round(originalPrice * (1 - discountPercent / 100));
}

function inferOriginalRoomPrice(
    sellingPrice: number | null,
    discountPercent: number,
): number | null {
    if (sellingPrice === null || sellingPrice <= 0) {
        return null;
    }

    if (discountPercent <= 0) {
        return Math.round(sellingPrice);
    }

    const divisor = 1 - discountPercent / 100;

    if (divisor <= 0) {
        return null;
    }

    return Math.round(sellingPrice / divisor);
}

function formatCurrencyInputPreview(value: number | null): string {
    if (value === null || value <= 0) {
        return '-';
    }

    return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatEstimateCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

const estimateRoomCapacities = { dbl: 2, trpl: 3, quad: 4 } as const;

function quadFirstEstimateRoomAllocation(
    customerCount: number,
    availableRoomTypes: Array<keyof typeof estimateRoomCapacities>,
): Record<keyof typeof estimateRoomCapacities, number> {
    const allocation = { dbl: 0, trpl: 0, quad: 0 };

    if (customerCount < 1) {
        return allocation;
    }

    if (availableRoomTypes.includes('quad')) {
        allocation.quad = Math.floor(
            customerCount / estimateRoomCapacities.quad,
        );
        const remainingPax = customerCount % estimateRoomCapacities.quad;

        if (remainingPax === 3 && availableRoomTypes.includes('trpl')) {
            allocation.trpl = 1;
        } else if (remainingPax === 2 && availableRoomTypes.includes('dbl')) {
            allocation.dbl = 1;
        } else if (remainingPax === 1 && availableRoomTypes.includes('dbl')) {
            allocation.dbl = 1;
        } else if (remainingPax === 1 && availableRoomTypes.includes('trpl')) {
            allocation.trpl = 1;
        } else if (remainingPax > 0) {
            allocation.quad += 1;
        }

        return allocation;
    }

    const fallbackRoomType = availableRoomTypes.includes('trpl')
        ? 'trpl'
        : availableRoomTypes.includes('dbl')
          ? 'dbl'
          : null;
    if (fallbackRoomType) {
        allocation[fallbackRoomType] = Math.ceil(
            customerCount / estimateRoomCapacities[fallbackRoomType],
        );
    }

    return allocation;
}

function getHotelRoomCountLimit(
    allocation: Record<keyof typeof estimateRoomCapacities, number>,
    roomType: keyof typeof estimateRoomCapacities,
    customerCount: number,
): number {
    const otherAllocatedPax = (
        Object.entries(allocation) as Array<
            [keyof typeof estimateRoomCapacities, number]
        >
    ).reduce((total, [currentRoomType, roomCount]) => {
        if (currentRoomType === roomType) {
            return total;
        }

        return total + roomCount * estimateRoomCapacities[currentRoomType];
    }, 0);

    const remainingPax = Math.max(0, customerCount - otherAllocatedPax);

    return Math.ceil(remainingPax / estimateRoomCapacities[roomType]);
}

function deriveCustomerPriceComposition(
    customerCount: number,
    allocation?: Record<keyof typeof estimateRoomCapacities, number>,
): { single: number; dbl: number; trpl: number; quad: number } {
    const composition = { single: 0, dbl: 0, trpl: 0, quad: 0 };
    let remainingCustomers = Math.max(0, customerCount);

    if (!allocation) {
        composition.single = remainingCustomers;

        return composition;
    }

    (['quad', 'trpl', 'dbl'] as const).forEach((roomType) => {
        const allocatedCapacity =
            Math.max(0, Number(allocation[roomType]) || 0) *
            estimateRoomCapacities[roomType];
        const allocatedCustomers = Math.min(
            remainingCustomers,
            allocatedCapacity,
        );

        composition[roomType] = allocatedCustomers;
        remainingCustomers -= allocatedCustomers;
    });

    composition.single = remainingCustomers;

    return composition;
}

function normalizeEstimateRoomType(
    value?: string | null,
): keyof typeof estimateRoomCapacities | null {
    const normalized = (value ?? '').trim().toLowerCase();

    if (normalized === 'dbl' || normalized === 'double') {
        return 'dbl';
    }

    if (normalized === 'trpl' || normalized === 'triple') {
        return 'trpl';
    }

    if (normalized === 'quad' || normalized === 'quadruple') {
        return 'quad';
    }

    return null;
}

function SectionHeader({
    icon: Icon,
    title,
}: {
    icon: React.ElementType;
    title: string;
}) {
    return (
        <div className="mb-4 flex items-start gap-3 rounded-xl bg-muted/40 px-4 py-3">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
                <p className="text-sm font-semibold">{title}</p>
            </div>
        </div>
    );
}

function InfoSectionHeading({
    icon: Icon,
    title,
}: {
    icon: React.ElementType;
    title: string;
}) {
    return (
        <div className="flex items-start gap-3 border-t border-border/70 pt-5">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{title}</p>
            </div>
        </div>
    );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
    return <div className="space-y-3">{children}</div>;
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <Label className="mb-1.5 block text-xs font-medium text-foreground">
                {label}
            </Label>
            {children}
            {error ? (
                <p className="mt-1 text-xs font-medium text-destructive">
                    {error}
                </p>
            ) : null}
        </div>
    );
}

function ItinerarySkeleton() {
    return (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-16" />
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-32 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
            </div>
            <Skeleton className="h-28 rounded-2xl" />
        </div>
    );
}

function createEmptyHighlight(): PackageHighlightItem {
    const uniqueId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `highlight-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
        id: uniqueId,
        icon: 'Sparkles',
        label: { id: '', en: '' },
        value: { id: '', en: '' },
    };
}

function createPresetHighlight(
    label: string,
    icon: string,
): PackageHighlightItem {
    const highlight = createEmptyHighlight();

    return {
        ...highlight,
        icon,
        label: {
            id: label,
            en: label,
        },
    };
}

export function PackageForm({
    pkg,
    productOptions,
    currencies,
    activityOptions,
    productCategories,
    hotelCountries,
    hotelCities,
    vendors,
    packageImageUploadMaxKilobytes,
    draft,
    locale,
    editorMode = 'package',
    onSuccess,
}: Props) {
    const isEdit = pkg !== null;
    const isHppEditor = editorMode === 'hpp';
    const shouldResumeCreateDraft = !isEdit && !isHppEditor && draft !== null;
    const initialFormData = shouldResumeCreateDraft
        ? buildDraftFormData(null, draft.payload)
        : buildFormData(pkg);
    const initialExistingImages = shouldResumeCreateDraft
        ? draftImagePaths(draft)
        : (pkg?.images ?? []);
    const draftUrl = isEdit
        ? `/admin/product-management/packages/${pkg.id}/draft`
        : '/admin/product-management/packages/drafts/create';
    const imageInputRef = useRef<HTMLInputElement>(null);
    const itineraryLoadingTimeoutRef = useRef<number | null>(null);
    const draftSaveTimeoutRef = useRef<number | null>(null);
    const draftNavigationBypassRef = useRef(false);
    const draftSaveQueueRef = useRef<Promise<boolean>>(Promise.resolve(true));
    const lastSavedDraftSnapshotRef = useRef(
        JSON.stringify(
            buildDraftPayload(initialFormData, initialExistingImages),
        ),
    );

    const [existingImages, setExistingImages] = useState<string[]>(
        initialExistingImages,
    );
    const [currentDraft, setCurrentDraft] = useState<PackageDraft | null>(
        draft,
    );
    const [hasPendingEditDraft, setHasPendingEditDraft] = useState(
        isEdit && !isHppEditor && draft !== null,
    );
    const [draftStatus, setDraftStatus] = useState<
        'idle' | 'saving' | 'saved' | 'error'
    >(draft ? 'saved' : 'idle');
    const [isUploadingDraftImages, setIsUploadingDraftImages] = useState(false);
    const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);

    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isDragOverGallery, setIsDragOverGallery] = useState(false);
    const [draggedGalleryItemKey, setDraggedGalleryItemKey] = useState<
        string | null
    >(null);
    const [galleryDropTargetKey, setGalleryDropTargetKey] = useState<
        string | null
    >(null);
    const [activeItineraryTab, setActiveItineraryTab] = useState('day-1');
    const [activeProductCategoryKey, setActiveProductCategoryKey] = useState(
        productCategories[0]?.key ?? '',
    );
    const [itineraryActivitySearch, setItineraryActivitySearch] = useState<
        Record<number, string>
    >({});
    const [isItineraryPanelLoading, setIsItineraryPanelLoading] =
        useState(false);
    const form = useForm<PackageFormData>(initialFormData);
    const latestDraftPayload = buildDraftPayload(form.data, existingImages);
    const latestDraftSnapshot = JSON.stringify(latestDraftPayload);
    const latestDraftPayloadRef = useRef(latestDraftPayload);
    latestDraftPayloadRef.current = latestDraftPayload;
    const packageImageUploadMaxBytes = packageImageUploadMaxKilobytes * 1024;
    const packageImageUploadMaxLabel = `${Math.max(1, Math.round(packageImageUploadMaxKilobytes / 1024))} MB`;
    const galleryItems = [
        ...existingImages.map((url, index) => ({
            key: `existing-${index}`,
            kind: 'existing' as const,
            url,
        })),
        ...previewUrls.map((url, index) => ({
            key: `new-${index}`,
            kind: 'new' as const,
            url,
            file: form.data.images[index],
        })),
    ];

    useEffect(() => {
        return () => {
            if (itineraryLoadingTimeoutRef.current !== null) {
                window.clearTimeout(itineraryLoadingTimeoutRef.current);
            }
            if (draftSaveTimeoutRef.current !== null) {
                window.clearTimeout(draftSaveTimeoutRef.current);
            }
        };
    }, []);

    const saveDraft = useCallback(
        (payload: PackageDraftPayload): Promise<boolean> => {
            if (isHppEditor) {
                return Promise.resolve(true);
            }

            const snapshot = JSON.stringify(payload);
            setDraftStatus('saving');
            const queuedRequest = draftSaveQueueRef.current
                .catch(() => false)
                .then(async () => {
                    try {
                        const response = await fetch(draftUrl, {
                            method: 'PUT',
                            credentials: 'same-origin',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken(),
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                            body: JSON.stringify({ payload }),
                        });
                        const responseData = (await response.json()) as {
                            draft?: PackageDraft;
                            message?: string;
                        };

                        if (!response.ok || !responseData.draft) {
                            throw new Error(
                                responseData.message ||
                                    'Draft tidak dapat disimpan.',
                            );
                        }

                        setCurrentDraft(responseData.draft);
                        lastSavedDraftSnapshotRef.current = snapshot;
                        setDraftStatus('saved');

                        return true;
                    } catch {
                        setDraftStatus('error');

                        return false;
                    }
                });

            draftSaveQueueRef.current = queuedRequest;

            return queuedRequest;
        },
        [draftUrl, isHppEditor],
    );

    useEffect(() => {
        if (
            isHppEditor ||
            hasPendingEditDraft ||
            latestDraftSnapshot === lastSavedDraftSnapshotRef.current
        ) {
            return;
        }

        if (draftSaveTimeoutRef.current !== null) {
            window.clearTimeout(draftSaveTimeoutRef.current);
        }

        draftSaveTimeoutRef.current = window.setTimeout(() => {
            void saveDraft(latestDraftPayloadRef.current);
        }, 700);

        return () => {
            if (draftSaveTimeoutRef.current !== null) {
                window.clearTimeout(draftSaveTimeoutRef.current);
            }
        };
    }, [hasPendingEditDraft, isHppEditor, latestDraftSnapshot, saveDraft]);

    useEffect(() => {
        if (isHppEditor || hasPendingEditDraft) {
            return;
        }

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (
                latestDraftSnapshot === lastSavedDraftSnapshotRef.current &&
                form.data.images.length === 0
            ) {
                return;
            }

            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [
        form.data.images.length,
        hasPendingEditDraft,
        isHppEditor,
        latestDraftSnapshot,
    ]);

    useEffect(() => {
        if (isHppEditor || hasPendingEditDraft) {
            return;
        }

        return router.on('before', (event) => {
            const visit = event.detail.visit;
            if (draftNavigationBypassRef.current || visit.method !== 'get') {
                return;
            }

            if (form.data.images.length > 0) {
                event.preventDefault();
                toast.error(
                    'Masih ada gambar yang belum tersimpan. Hapus atau upload ulang sebelum meninggalkan halaman.',
                );

                return;
            }

            if (latestDraftSnapshot === lastSavedDraftSnapshotRef.current) {
                return;
            }

            event.preventDefault();
            void saveDraft(latestDraftPayloadRef.current).then((saved) => {
                if (!saved) {
                    toast.error(
                        'Draft belum tersimpan. Periksa koneksi lalu coba kembali.',
                    );

                    return;
                }

                draftNavigationBypassRef.current = true;
                router.visit(visit.url);
            });
        });
    }, [
        form.data.images.length,
        hasPendingEditDraft,
        isHppEditor,
        latestDraftSnapshot,
        saveDraft,
    ]);

    function switchItineraryTab(nextTab: string) {
        if (itineraryLoadingTimeoutRef.current !== null) {
            window.clearTimeout(itineraryLoadingTimeoutRef.current);
        }

        setIsItineraryPanelLoading(true);
        setActiveItineraryTab(nextTab);

        itineraryLoadingTimeoutRef.current = window.setTimeout(() => {
            setIsItineraryPanelLoading(false);
        }, 120);
    }

    function updateDurationDays(nextDurationDays: number) {
        const normalizedDurationDays = Math.max(1, nextDurationDays || 1);

        form.setData((currentData) => ({
            ...currentData,
            duration_days: normalizedDurationDays,
            end_date: currentData.start_date
                ? calculateEndDate(
                      currentData.start_date,
                      normalizedDurationDays,
                  )
                : currentData.end_date,
            itineraries: normalizeItineraries(
                normalizedDurationDays,
                currentData.itineraries,
            ),
        }));

        const selectedDayNumber = Number(
            activeItineraryTab.replace('day-', ''),
        );

        if (selectedDayNumber > normalizedDurationDays) {
            switchItineraryTab(`day-${normalizedDurationDays}`);
        }
    }

    function updateStartDate(startDate: string) {
        form.setData((currentData) => ({
            ...currentData,
            start_date: startDate,
            end_date: calculateEndDate(
                startDate,
                Number(currentData.duration_days) || 1,
            ),
        }));
    }

    function updateAllInConfiguration(
        allInConfiguration: PackageAllInConfiguration,
    ) {
        form.setData((currentData) => {
            const coveredCategoryKeys = allInConfiguration.enabled
                ? new Set(allInConfiguration.included_category_keys)
                : new Set<string>();
            const retainedProductIds = currentData.product_ids.filter(
                (productId) => {
                    const product = productOptions.find(
                        (option) => option.id === productId,
                    );

                    return (
                        product === undefined ||
                        !coveredCategoryKeys.has(product.product_type)
                    );
                },
            );
            const retainedCustomProducts = currentData.custom_products.filter(
                (product) => !coveredCategoryKeys.has(product.product_type),
            );
            const retainedProductIdKeys = new Set([
                ...retainedProductIds.map(String),
                ...retainedCustomProducts.map((product) =>
                    String(product.estimate_id),
                ),
            ]);
            const retainedMultipliers = Object.fromEntries(
                Object.entries(currentData.product_multipliers).filter(
                    ([productId]) => retainedProductIdKeys.has(productId),
                ),
            );
            const retainedHotelBrokers = Object.fromEntries(
                Object.entries(
                    getHotelBrokerSelections(currentData.content),
                ).filter(([productId]) => retainedProductIdKeys.has(productId)),
            );

            return {
                ...currentData,
                all_in: allInConfiguration,
                product_ids: retainedProductIds,
                product_multipliers: retainedMultipliers,
                custom_products: retainedCustomProducts,
                content: setHotelBrokerSelections(
                    currentData.content,
                    retainedHotelBrokers,
                ),
            };
        });
    }

    async function appendSelectedImages(selectedFiles: File[]) {
        if (selectedFiles.length === 0) {
            return;
        }

        if (hasPendingEditDraft) {
            toast.error(
                'Gunakan atau buang draft lama sebelum mengubah galeri.',
            );

            return;
        }

        const invalidTypeFiles = selectedFiles.filter(
            (file) =>
                !packageImageMimeTypes.includes(
                    file.type as (typeof packageImageMimeTypes)[number],
                ),
        );
        const oversizedFiles = selectedFiles.filter(
            (file) => file.size > packageImageUploadMaxBytes,
        );

        if (invalidTypeFiles.length > 0 || oversizedFiles.length > 0) {
            const messages: string[] = [];

            if (invalidTypeFiles.length > 0) {
                messages.push('Format gambar harus png, jpg, jpeg, atau webp.');
            }

            if (oversizedFiles.length > 0) {
                messages.push(
                    `Ukuran tiap gambar maksimal ${packageImageUploadMaxLabel}.`,
                );
            }

            const message = messages.join(' ');
            form.setError('images', message);
            toast.error(message);
            if (imageInputRef.current) {
                imageInputRef.current.value = '';
            }

            return;
        }

        form.clearErrors('images');

        if (!isHppEditor) {
            const imagePayload = new FormData();
            selectedFiles.forEach((file) =>
                imagePayload.append('images[]', file),
            );
            setIsUploadingDraftImages(true);
            setDraftStatus('saving');

            try {
                const response = await fetch(`${draftUrl}/images`, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: imagePayload,
                });
                const responseData = (await response.json()) as {
                    draft?: PackageDraft;
                    message?: string;
                    errors?: Record<string, string[]>;
                };

                if (!response.ok || !responseData.draft) {
                    throw new Error(
                        responseData.errors?.images?.[0] ||
                            responseData.message ||
                            'Gambar gagal disimpan ke draft.',
                    );
                }

                const uploadedPaths = responseData.draft.temporary_images.map(
                    (image) => image.path,
                );
                setCurrentDraft(responseData.draft);
                setExistingImages((currentImages) =>
                    Array.from(new Set([...currentImages, ...uploadedPaths])),
                );
                setDraftStatus('saved');
                toast.success(
                    `${selectedFiles.length} gambar tersimpan di draft.`,
                );

                return;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Gambar gagal disimpan ke draft.';
                form.setError('images', message);
                setDraftStatus('error');
                toast.error(message);
            } finally {
                setIsUploadingDraftImages(false);
            }
        }

        form.setData('images', [...form.data.images, ...selectedFiles]);
        setPreviewUrls((currentUrls) => [
            ...currentUrls,
            ...selectedFiles.map((file) => URL.createObjectURL(file)),
        ]);
    }

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files || []);
        void appendSelectedImages(selectedFiles);

        // Reset input value so same file can be selected again
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    }

    function handleGalleryDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragOverGallery(false);

        const selectedFiles = Array.from(event.dataTransfer.files || []);
        void appendSelectedImages(selectedFiles);
    }

    function removeNewImage(index: number) {
        const newImages = form.data.images.filter((_, i) => i !== index);
        form.setData('images', newImages);

        const urlToRemove = previewUrls[index];
        if (urlToRemove) {
            URL.revokeObjectURL(urlToRemove);
        }
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }

    async function removeExistingImage(index: number) {
        const imagePath = existingImages[index];
        const temporaryImage = currentDraft?.temporary_images.find(
            (image) => image.path === imagePath,
        );

        if (!temporaryImage || isHppEditor) {
            setExistingImages((currentImages) =>
                currentImages.filter((_, imageIndex) => imageIndex !== index),
            );

            return;
        }

        try {
            const response = await fetch(
                `${draftUrl}/images/${temporaryImage.id}`,
                {
                    method: 'DELETE',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );
            const responseData = (await response.json()) as {
                draft?: PackageDraft;
                message?: string;
            };

            if (!response.ok || !responseData.draft) {
                throw new Error(
                    responseData.message || 'Gambar draft gagal dihapus.',
                );
            }

            setCurrentDraft(responseData.draft);
            setExistingImages((currentImages) =>
                currentImages.filter((path) => path !== imagePath),
            );
            toast.success('Gambar dihapus dari draft.');
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Gambar draft gagal dihapus.',
            );
        }
    }

    function reorderGalleryItems(fromKey: string, toKey: string) {
        if (fromKey === toKey) {
            return;
        }

        const currentItems = [
            ...existingImages.map((url, index) => ({
                key: `existing-${index}`,
                kind: 'existing' as const,
                url,
            })),
            ...previewUrls.map((url, index) => ({
                key: `new-${index}`,
                kind: 'new' as const,
                url,
                file: form.data.images[index],
            })),
        ];

        const fromIndex = currentItems.findIndex(
            (item) => item.key === fromKey,
        );
        const toIndex = currentItems.findIndex((item) => item.key === toKey);

        if (fromIndex === -1 || toIndex === -1) {
            return;
        }

        const reorderedItems = [...currentItems];
        const [movedItem] = reorderedItems.splice(fromIndex, 1);
        reorderedItems.splice(toIndex, 0, movedItem);

        setExistingImages(
            reorderedItems
                .filter((item) => item.kind === 'existing')
                .map((item) => item.url),
        );
        setPreviewUrls(
            reorderedItems
                .filter((item) => item.kind === 'new')
                .map((item) => item.url),
        );
        form.setData(
            'images',
            reorderedItems
                .filter(
                    (
                        item,
                    ): item is {
                        key: string;
                        kind: 'new';
                        url: string;
                        file: File;
                    } => item.kind === 'new',
                )
                .map((item) => item.file),
        );
    }

    function updateItineraryActivities(
        dayNumber: number,
        activityIds: number[],
    ) {
        const selectedActivities = activityOptions.filter((activity) =>
            activityIds.includes(activity.id),
        );

        form.setData(
            'itineraries',
            form.data.itineraries.map((itinerary) => {
                if (itinerary.day_number !== dayNumber) {
                    return itinerary;
                }

                return {
                    ...itinerary,
                    activity_id: activityIds[0] ?? null,
                    activity_ids: activityIds,
                    title: {
                        id: selectedActivities
                            .map((activity) =>
                                localizedFieldValue(activity.name, 'id'),
                            )
                            .filter(Boolean)
                            .join(', '),
                        en: selectedActivities
                            .map((activity) =>
                                localizedFieldValue(activity.name, 'en'),
                            )
                            .filter(Boolean)
                            .join(', '),
                    },
                    description: {
                        id: selectedActivities
                            .map((activity) =>
                                localizedFieldValue(activity.description, 'id'),
                            )
                            .filter(Boolean)
                            .join('\n'),
                        en: selectedActivities
                            .map((activity) =>
                                localizedFieldValue(activity.description, 'en'),
                            )
                            .filter(Boolean)
                            .join('\n'),
                    },
                    product_ids: [],
                };
            }),
        );
    }

    function updateSelectedProducts(
        productIds: number[],
        hotelBrokerSelections: Record<string, string>,
        productMultipliers: Record<string, number>,
    ) {
        form.setData((currentData) => ({
            ...currentData,
            product_ids: productIds,
            product_multipliers: productMultipliers,
            content: {
                ...setHotelBrokerSelections(
                    currentData.content,
                    hotelBrokerSelections,
                ),
                hpp_currency_snapshots: productIds.reduce(
                    (snapshots, productId) => {
                        const currencyCode = String(
                            productOptions.find(
                                (product) => product.id === productId,
                            )?.currency ?? 'IDR',
                        ).toUpperCase();

                        if (snapshots[currencyCode]) {
                            return snapshots;
                        }

                        const liveCurrency = currencies.find(
                            (currency) => currency.code === currencyCode,
                        );

                        return {
                            ...snapshots,
                            [currencyCode]: {
                                currency: currencyCode,
                                rate_to_idr:
                                    currencyCode === 'IDR'
                                        ? 1
                                        : Number(
                                              liveCurrency?.live_conversion_rate ??
                                                  0,
                                          ),
                                source:
                                    currencyCode === 'IDR'
                                        ? 'identity'
                                        : 'live',
                                fetched_at:
                                    liveCurrency?.rate_fetched_at ?? null,
                            },
                        };
                    },
                    {
                        ...(currentData.content.hpp_currency_snapshots ?? {}),
                    },
                ),
            },
        }));
    }

    function updateSpecificProducts(
        products: PackageSpecificProduct[],
        hotelBrokerSelections: Record<string, string>,
    ) {
        form.setData((currentData) => ({
            ...currentData,
            custom_products: products,
            content: {
                ...setHotelBrokerSelections(
                    currentData.content,
                    hotelBrokerSelections,
                ),
                hpp_currency_snapshots: products.reduce(
                    (snapshots, product) => {
                        const currencyCode = product.currency.toUpperCase();
                        if (snapshots[currencyCode]) {
                            return snapshots;
                        }

                        const liveCurrency = currencies.find(
                            (currency) => currency.code === currencyCode,
                        );

                        return {
                            ...snapshots,
                            [currencyCode]: {
                                currency: currencyCode,
                                rate_to_idr:
                                    currencyCode === 'IDR'
                                        ? 1
                                        : Number(
                                              liveCurrency?.live_conversion_rate ??
                                                  liveCurrency?.conversion_rate ??
                                                  0,
                                          ),
                                source:
                                    currencyCode === 'IDR'
                                        ? 'identity'
                                        : 'live',
                                fetched_at:
                                    liveCurrency?.rate_fetched_at ?? null,
                            },
                        };
                    },
                    {
                        ...(currentData.content.hpp_currency_snapshots ?? {}),
                    },
                ),
            },
        }));
    }

    async function submit(event: React.FormEvent) {
        event.preventDefault();

        if (hasPendingEditDraft) {
            toast.error(
                'Pilih gunakan atau buang draft sebelum menyimpan package.',
            );

            return;
        }

        if (isUploadingDraftImages) {
            toast.error('Tunggu hingga gambar selesai disimpan ke draft.');

            return;
        }

        if (draftSaveTimeoutRef.current !== null) {
            window.clearTimeout(draftSaveTimeoutRef.current);
        }

        setIsSubmittingPackage(true);
        draftNavigationBypassRef.current = true;

        if (!isHppEditor) {
            const draftSaved = await saveDraft(latestDraftPayloadRef.current);
            if (!draftSaved) {
                draftNavigationBypassRef.current = false;
                setIsSubmittingPackage(false);
                toast.error(
                    'Draft gagal diamankan. Periksa koneksi sebelum menyimpan package.',
                );

                return;
            }
        }

        const submitUrl = isHppEditor
            ? `/admin/financial-management/hpp-package/${pkg?.id}/estimate`
            : isEdit
              ? packages.update(pkg.id).url
              : packages.store().url;
        const basePrice = Number(form.data.original_price) || 0;
        const discountPercentValue = Number(form.data.discount_percent) || 0;
        const hasDiscount = basePrice > 0 && discountPercentValue > 0;
        const calculatedSellingPrice = hasDiscount
            ? Math.round(basePrice * (1 - discountPercentValue / 100))
            : basePrice;
        const resolvedEstimate: PackageHppEstimate = {
            ...hppEstimate,
            customers: estimatedCustomers,
            customers_is_manual: false,
            product_quantities: estimateProductItems.reduce(
                (quantities, item) => ({
                    ...quantities,
                    [String(item.product.id)]: item.quantity,
                }),
                {} as Record<string, number>,
            ),
            product_quantities_is_manual: estimateProductItems.reduce(
                (manualStates, item) => ({
                    ...manualStates,
                    [String(item.product.id)]: item.quantityIsManual,
                }),
                {} as Record<string, boolean>,
            ),
            hotel_allocations: estimateHotelGroups.reduce(
                (allocations, group) => ({
                    ...allocations,
                    [String(group.product.id)]: group.allocation,
                }),
                {} as NonNullable<PackageHppEstimate['hotel_allocations']>,
            ),
            hotel_allocations_unit: 'rooms',
            hotel_allocations_is_manual: estimateHotelGroups.reduce(
                (manualStates, group) => ({
                    ...manualStates,
                    [String(group.product.id)]: group.allocationIsManual,
                }),
                {} as Record<string, boolean>,
            ),
            tour_leader_fee: estimatedTourLeaderFee,
            tour_leader_fee_is_manual: tourLeaderFeeIsManual,
            muthawwif_fee: estimatedMuthawwifFee,
            muthawwif_fee_is_manual: muthawwifFeeIsManual,
        };
        const resolvedContent = normalizePackageContent({
            ...form.data.content,
            hpp_estimate: resolvedEstimate,
            room_original_prices: {
                dbl:
                    normalizeRoomPriceValue(
                        String(roomOriginalPrices.dbl ?? ''),
                    ) ?? null,
                trpl:
                    normalizeRoomPriceValue(
                        String(roomOriginalPrices.trpl ?? ''),
                    ) ?? null,
                quad:
                    normalizeRoomPriceValue(
                        String(roomOriginalPrices.quad ?? ''),
                    ) ?? null,
            },
            room_prices: {
                dbl: calculateDiscountedPrice(
                    normalizeRoomPriceValue(
                        String(roomOriginalPrices.dbl ?? ''),
                    ),
                    discountPercentValue,
                ),
                trpl: calculateDiscountedPrice(
                    normalizeRoomPriceValue(
                        String(roomOriginalPrices.trpl ?? ''),
                    ),
                    discountPercentValue,
                ),
                quad: calculateDiscountedPrice(
                    normalizeRoomPriceValue(
                        String(roomOriginalPrices.quad ?? ''),
                    ),
                    discountPercentValue,
                ),
            },
        });

        const formData = new FormData();
        formData.append('_method', 'POST');
        const resolvedSlug = isEdit
            ? form.data.slug
            : generatePackageSlug(form.data['name.id'] || form.data['name.en']);
        formData.append('slug', resolvedSlug);
        formData.append('name[id]', form.data['name.id']);
        formData.append('name[en]', form.data['name.en']);
        formData.append('package_type', form.data.package_type);
        formData.append('departure_city', form.data.departure_city);
        formData.append('start_date', form.data.start_date);
        formData.append('end_date', form.data.end_date);
        formData.append('seats_total', String(form.data.seats_total));
        formData.append('booking_status', form.data.booking_status);
        formData.append('departure_notes', form.data.departure_notes);
        formData.append('duration_days', String(form.data.duration_days));
        formData.append('price', String(calculatedSellingPrice));
        formData.append('original_price', hasDiscount ? String(basePrice) : '');
        formData.append('discount_label', form.data.discount_label ?? '');
        formData.append('discount_ends_at', form.data.discount_ends_at ?? '');
        formData.append('currency', form.data.currency);
        formData.append(
            'refresh_currency_rates',
            form.data.refresh_currency_rates ? '1' : '0',
        );
        formData.append('summary[id]', form.data['summary.id']);
        formData.append('summary[en]', form.data['summary.en']);
        formData.append('content', JSON.stringify(resolvedContent));
        formData.append('itineraries', JSON.stringify(form.data.itineraries));
        formData.append(
            'product_multipliers',
            JSON.stringify(form.data.product_multipliers ?? {}),
        );
        formData.append(
            'custom_products',
            JSON.stringify(form.data.custom_products ?? []),
        );
        formData.append('all_in', JSON.stringify(form.data.all_in));
        formData.append('is_featured', form.data.is_featured ? '1' : '0');
        formData.append('is_active', form.data.is_active ? '1' : '0');
        (form.data.product_ids ?? []).forEach((productId: number) =>
            formData.append('product_ids[]', String(productId)),
        );

        // Append existing images that were kept
        existingImages.forEach((path) => {
            formData.append('existing_images[]', path);
        });

        // Append new images
        form.data.images.forEach((file) => {
            formData.append('images[]', file);
        });

        try {
            router.post(submitUrl, formData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        isHppEditor
                            ? 'Estimasi HPP diperbarui.'
                            : isEdit
                              ? 'Package diperbarui.'
                              : 'Package ditambahkan.',
                    );
                    onSuccess();
                },
                onError: (errors) => {
                    draftNavigationBypassRef.current = false;
                    console.error('[PackageForm] validation errors', {
                        submitUrl,
                        errors,
                    });

                    toast.error(
                        `Error: ${Object.entries(errors)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(' | ')}`,
                    );
                },
                onFinish: () => setIsSubmittingPackage(false),
            });
        } catch (error) {
            draftNavigationBypassRef.current = false;
            setIsSubmittingPackage(false);
            console.error('[PackageForm] submit threw', {
                submitUrl,
                error,
            });

            toast.error('Terjadi error saat menyimpan. Cek console.');
        }
    }

    const basePrice = Number(form.data.original_price) || 0;
    const discountPercent = Number(form.data.discount_percent) || 0;
    const hasDiscount = basePrice > 0 && discountPercent > 0;
    const sellingPrice = hasDiscount
        ? Math.round(basePrice * (1 - discountPercent / 100))
        : basePrice;
    const generatedCodePreview = buildPackageCodePreview(
        form.data['name.id'] || form.data['name.en'],
        Number(form.data.duration_days) || 0,
    );
    const currentItineraryDay = Number(activeItineraryTab.replace('day-', ''));

    const contentObject =
        form.data.content && typeof form.data.content === 'object'
            ? (form.data.content as Record<string, unknown>)
            : {};
    const roomPrices =
        typeof contentObject.room_prices === 'object' &&
        contentObject.room_prices !== null
            ? (contentObject.room_prices as Record<string, number | null>)
            : {};
    const roomOriginalPrices =
        typeof contentObject.room_original_prices === 'object' &&
        contentObject.room_original_prices !== null
            ? (contentObject.room_original_prices as Record<
                  string,
                  number | null
              >)
            : {};
    const effectiveRoomOriginalPrices = {
        dbl:
            roomOriginalPrices.dbl ??
            inferOriginalRoomPrice(roomPrices.dbl ?? null, discountPercent),
        trpl:
            roomOriginalPrices.trpl ??
            inferOriginalRoomPrice(roomPrices.trpl ?? null, discountPercent),
        quad:
            roomOriginalPrices.quad ??
            inferOriginalRoomPrice(roomPrices.quad ?? null, discountPercent),
    };
    const effectiveRoomSellingPrices = {
        dbl: calculateDiscountedPrice(
            effectiveRoomOriginalPrices.dbl ?? null,
            discountPercent,
        ),
        trpl: calculateDiscountedPrice(
            effectiveRoomOriginalPrices.trpl ?? null,
            discountPercent,
        ),
        quad: calculateDiscountedPrice(
            effectiveRoomOriginalPrices.quad ?? null,
            discountPercent,
        ),
    };
    const hppEstimate = (contentObject.hpp_estimate ??
        {}) as PackageHppEstimate;
    const operationalCosts = normalizePackageOperationalCosts(
        hppEstimate.operational_costs,
    );
    const hasOperationalCostConfiguration = Boolean(
        hppEstimate.operational_costs,
    );
    const estimatedCustomerCount = Math.max(
        0,
        Number(form.data.seats_total) || 0,
    );
    const selectedCurrency = currencies.find(
        (currency) => currency.code === form.data.currency.toUpperCase(),
    );
    const selectedStoredSnapshot =
        form.data.content.hpp_currency_snapshots?.[
            form.data.currency.toUpperCase()
        ];
    const currencyRateToIdr =
        form.data.currency.toUpperCase() === 'IDR'
            ? 1
            : Number(
                  selectedStoredSnapshot?.rate_to_idr ??
                      selectedCurrency?.live_conversion_rate ??
                      selectedCurrency?.conversion_rate ??
                      0,
              );
    const effectiveCurrencies = currencies.map((currency) => {
        const snapshot =
            form.data.content.hpp_currency_snapshots?.[currency.code];

        return snapshot
            ? {
                  ...currency,
                  conversion_rate: Number(snapshot.rate_to_idr),
                  live_conversion_rate: Number(snapshot.rate_to_idr),
                  rate_source: snapshot.source,
                  rate_fetched_at: snapshot.fetched_at,
                  is_live: false,
              }
            : currency;
    });
    const specificProductOptions: ProductOption[] =
        form.data.custom_products.map((product) => ({
            id: product.estimate_id,
            code: '',
            name: product.name,
            product_type: product.product_type,
            currency: product.currency,
            price: product.price,
            is_package_specific: true,
            hotel_info:
                product.product_type === 'hotel'
                    ? {
                          city: product.city,
                          country: product.country,
                          currency: product.currency,
                          pricing: product.pricing,
                      }
                    : null,
        }));
    const selectedProductsForEstimate = [
        ...productOptions.filter((product) =>
            form.data.product_ids.includes(product.id),
        ),
        ...specificProductOptions,
    ].filter(
        (product) =>
            !(
                form.data.all_in.enabled &&
                form.data.all_in.included_category_keys.includes(
                    product.product_type,
                )
            ),
    );
    const effectiveProductMultipliers = {
        ...form.data.product_multipliers,
        ...form.data.custom_products.reduce<Record<string, number>>(
            (multipliers, product) => ({
                ...multipliers,
                [String(product.estimate_id)]: Math.max(
                    1,
                    Number(product.multiplier_per_pax) || 1,
                ),
            }),
            {},
        ),
    };
    const selectedProductCurrencyCodes = Array.from(
        new Set(
            selectedProductsForEstimate
                .map((product) =>
                    String(product.currency ?? 'IDR').toUpperCase(),
                )
                .filter((currencyCode) => currencyCode !== 'IDR'),
        ),
    );
    const estimateCurrencyRates = effectiveCurrencies.reduce(
        (rates, currency) => ({
            ...rates,
            [currency.code.toUpperCase()]: Number(
                currency.live_conversion_rate ?? currency.conversion_rate ?? 0,
            ),
        }),
        {} as Record<string, number>,
    );
    const convertEstimatePriceToIdr = (
        value: number | string | null | undefined,
        currency?: string | null,
    ): number => {
        const numericValue = Number(value ?? 0);
        const currencyCode = (currency || 'IDR').toUpperCase();
        const rate =
            currencyCode === 'IDR'
                ? 1
                : Number(estimateCurrencyRates[currencyCode] ?? 0);

        return numericValue > 0 && rate > 0
            ? Math.round(numericValue * rate)
            : 0;
    };
    const estimateProductItems = selectedProductsForEstimate
        .filter((product) => product.product_type !== 'hotel')
        .map((product) => {
            const multiplier = Math.max(
                1,
                Number(effectiveProductMultipliers[String(product.id)] ?? 1),
            );
            const quantityIsManual = Boolean(
                hppEstimate.product_quantities_is_manual?.[String(product.id)],
            );
            const quantity = Math.max(
                0,
                Number(
                    quantityIsManual
                        ? (hppEstimate.product_quantities?.[
                              String(product.id)
                          ] ?? 0)
                        : estimatedCustomerCount * multiplier,
                ),
            );
            const unitPrice = convertEstimatePriceToIdr(
                product.price,
                product.currency,
            );

            return {
                product,
                multiplier,
                quantityIsManual,
                quantity,
                unitPrice,
                totalPrice: quantity * unitPrice,
            };
        });
    const selectedHotelBrokers = getHotelBrokerSelections(form.data.content);
    const estimateHotelGroups = selectedProductsForEstimate
        .filter((product) => product.product_type === 'hotel')
        .map((product) => {
            const selectedBroker = selectedHotelBrokers[String(product.id)];
            const prices = (
                Object.keys(estimateRoomCapacities) as Array<
                    keyof typeof estimateRoomCapacities
                >
            ).reduce(
                (roomPricesByType, roomType) => {
                    const matchingPricing = (product.hotel_info?.pricing ?? [])
                        .filter(
                            (pricing) =>
                                normalizeEstimateRoomType(pricing.room_type) ===
                                roomType,
                        )
                        .filter(
                            (pricing) =>
                                !selectedBroker ||
                                pricing.broker_name?.trim().toLowerCase() ===
                                    selectedBroker.trim().toLowerCase(),
                        )
                        .filter(
                            (pricing) =>
                                !form.data.start_date ||
                                (!!pricing.period_start &&
                                    !!pricing.period_end &&
                                    pricing.period_start <=
                                        form.data.start_date &&
                                    pricing.period_end >= form.data.start_date),
                        )
                        .sort((left, right) =>
                            String(right.period_start ?? '').localeCompare(
                                String(left.period_start ?? ''),
                            ),
                        )[0];

                    roomPricesByType[roomType] = {
                        pricing: matchingPricing,
                        unitPrice: convertEstimatePriceToIdr(
                            matchingPricing?.price,
                            product.currency ?? product.hotel_info?.currency,
                        ),
                    };

                    return roomPricesByType;
                },
                {} as Record<
                    keyof typeof estimateRoomCapacities,
                    {
                        pricing?: NonNullable<
                            ProductOption['hotel_info']
                        >['pricing'][number];
                        unitPrice: number;
                    }
                >,
            );
            const availableRoomTypes = (
                Object.keys(estimateRoomCapacities) as Array<
                    keyof typeof estimateRoomCapacities
                >
            ).filter((roomType) => prices[roomType].unitPrice > 0);
            const defaultAllocation = quadFirstEstimateRoomAllocation(
                estimatedCustomerCount,
                availableRoomTypes,
            );
            const storedAllocation =
                hppEstimate.hotel_allocations?.[String(product.id)];
            const allocationIsManual = Boolean(
                hppEstimate.hotel_allocations_is_manual?.[String(product.id)],
            );
            const storedAllocationUsesRooms =
                hppEstimate.hotel_allocations_unit === 'rooms';
            const allocation = (
                Object.keys(estimateRoomCapacities) as Array<
                    keyof typeof estimateRoomCapacities
                >
            ).reduce(
                (values, roomType) => ({
                    ...values,
                    [roomType]: Math.max(
                        0,
                        Number(
                            allocationIsManual
                                ? storedAllocationUsesRooms
                                    ? (storedAllocation?.[roomType] ?? 0)
                                    : Math.ceil(
                                          Number(
                                              storedAllocation?.[roomType] ?? 0,
                                          ) / estimateRoomCapacities[roomType],
                                      )
                                : defaultAllocation[roomType],
                        ),
                    ),
                }),
                {} as Record<keyof typeof estimateRoomCapacities, number>,
            );
            const multiplier = Math.max(
                1,
                Number(effectiveProductMultipliers[String(product.id)] ?? 1),
            );
            const rows = (
                Object.keys(estimateRoomCapacities) as Array<
                    keyof typeof estimateRoomCapacities
                >
            ).map((roomType) => {
                const roomCount = allocation[roomType];
                const pax = roomCount * estimateRoomCapacities[roomType];
                const quantity = roomCount * multiplier;
                const roomCountLimit = getHotelRoomCountLimit(
                    allocation,
                    roomType,
                    estimatedCustomerCount,
                );

                return {
                    roomType,
                    pax,
                    roomCount,
                    roomCountLimit,
                    quantity,
                    unitPrice: prices[roomType].unitPrice,
                    totalPrice: quantity * prices[roomType].unitPrice,
                    pricing: prices[roomType].pricing,
                };
            });
            const allocatedPax = rows.reduce(
                (total, row) => total + row.pax,
                0,
            );
            const allocationDelta = allocatedPax - estimatedCustomerCount;
            const allocationDeltaLabel =
                allocationDelta === 0
                    ? 'pas'
                    : allocationDelta > 0
                      ? `lebih ${allocationDelta} pax`
                      : `kurang ${Math.abs(allocationDelta)} pax`;

            return {
                product,
                allocationIsManual,
                defaultAllocation,
                allocation,
                rows,
                allocatedPax,
                allocationDelta,
                allocationDeltaLabel,
                totalPrice: rows.reduce(
                    (total, row) => total + row.totalPrice,
                    0,
                ),
            };
        });
    const estimatedProductTotal = estimateProductItems.reduce(
        (total, item) => total + item.totalPrice,
        0,
    );
    const estimatedHotelTotal = estimateHotelGroups.reduce(
        (total, group) => total + group.totalPrice,
        0,
    );
    const estimatedCustomers = deriveCustomerPriceComposition(
        estimatedCustomerCount,
        estimateHotelGroups[0]?.allocation,
    );
    const estimatedRevenueInPackageCurrency =
        estimatedCustomers.single * sellingPrice +
        estimatedCustomers.dbl *
            (effectiveRoomSellingPrices.dbl ?? sellingPrice) +
        estimatedCustomers.trpl *
            (effectiveRoomSellingPrices.trpl ?? sellingPrice) +
        estimatedCustomers.quad *
            (effectiveRoomSellingPrices.quad ?? sellingPrice);
    const estimatedRevenue = Math.round(
        estimatedRevenueInPackageCurrency * currencyRateToIdr,
    );
    const estimatedAllInTotal = form.data.all_in.enabled
        ? convertEstimatePriceToIdr(
              form.data.all_in.price_per_pax,
              form.data.all_in.currency,
          ) * estimatedCustomerCount
        : 0;
    const estimatedTicketAndVisaTotal = estimateProductItems
        .filter((item) => {
            const productName = localizedFieldValue(
                item.product.name,
                'id',
                item.product.code,
            ).toLowerCase();

            return (
                item.product.product_type === 'tiket' ||
                productName.includes('visa')
            );
        })
        .reduce((total, item) => total + item.totalPrice, 0);
    const estimatedOperationalTotals = calculateOperationalCostTotals(
        operationalCosts,
        estimatedCustomerCount,
        estimatedHotelTotal,
        estimatedTicketAndVisaTotal,
        (amount, currency) => convertEstimatePriceToIdr(amount, currency),
    );
    const estimatedHotelPerPax =
        estimatedCustomerCount > 0
            ? Math.floor(estimatedHotelTotal / estimatedCustomerCount)
            : 0;
    const estimatedTicketAndVisaPerPax =
        estimatedCustomerCount > 0
            ? Math.floor(estimatedTicketAndVisaTotal / estimatedCustomerCount)
            : 0;
    const tourLeaderFeeIsManual =
        hppEstimate.tour_leader_fee_is_manual ??
        Number(hppEstimate.tour_leader_fee ?? 0) > 0;
    const muthawwifFeeIsManual =
        hppEstimate.muthawwif_fee_is_manual ??
        Number(hppEstimate.muthawwif_fee ?? 0) > 0;
    const defaultTourLeaderFee =
        estimatedCustomerCount > 0
            ? Math.floor(estimatedRevenue / estimatedCustomerCount)
            : 0;
    const defaultMuthawwifFee =
        estimatedCustomerCount > 0
            ? Math.floor(estimatedHotelTotal / estimatedCustomerCount)
            : 0;
    const estimatedTourLeaderFee = hasOperationalCostConfiguration
        ? estimatedOperationalTotals.tourLeader
        : tourLeaderFeeIsManual
          ? Number(hppEstimate.tour_leader_fee ?? 0)
          : defaultTourLeaderFee;
    const estimatedMuthawwifFee = hasOperationalCostConfiguration
        ? estimatedOperationalTotals.muthawwif
        : muthawwifFeeIsManual
          ? Number(hppEstimate.muthawwif_fee ?? 0)
          : defaultMuthawwifFee;
    const estimatedAdditionalOperationalTotal = hasOperationalCostConfiguration
        ? estimatedOperationalTotals.total -
          estimatedOperationalTotals.tourLeader -
          estimatedOperationalTotals.muthawwif
        : 0;
    const estimatedGrandTotal =
        estimatedProductTotal +
        estimatedHotelTotal +
        estimatedAllInTotal +
        estimatedTourLeaderFee +
        estimatedMuthawwifFee +
        estimatedAdditionalOperationalTotal +
        Number(hppEstimate.other_cost ?? 0);
    const estimatedHppPerCustomer =
        estimatedCustomerCount > 0
            ? Math.floor(estimatedGrandTotal / estimatedCustomerCount)
            : 0;
    const estimatedProfit = estimatedRevenue - estimatedGrandTotal;
    const estimatedProfitPerCustomer =
        estimatedCustomerCount > 0
            ? Math.floor(estimatedProfit / estimatedCustomerCount)
            : 0;
    const estimatedMarginPercent =
        estimatedRevenue > 0 ? (estimatedProfit / estimatedRevenue) * 100 : 0;
    const estimatedRoomPriceBreakdown = [
        {
            key: 'single',
            label: 'Single',
            pax: estimatedCustomers.single,
            unitPrice: sellingPrice,
        },
        {
            key: 'dbl',
            label: 'Double',
            pax: estimatedCustomers.dbl,
            unitPrice: effectiveRoomSellingPrices.dbl ?? sellingPrice,
        },
        {
            key: 'trpl',
            label: 'Triple',
            pax: estimatedCustomers.trpl,
            unitPrice: effectiveRoomSellingPrices.trpl ?? sellingPrice,
        },
        {
            key: 'quad',
            label: 'Quad',
            pax: estimatedCustomers.quad,
            unitPrice: effectiveRoomSellingPrices.quad ?? sellingPrice,
        },
    ]
        .filter((item) => item.pax > 0 && item.unitPrice > 0)
        .map((item) => ({
            ...item,
            totalPrice: item.pax * item.unitPrice,
        }));
    const packageHighlights = Array.isArray(contentObject.highlights)
        ? (contentObject.highlights as PackageHighlightItem[])
        : [];
    const errors = form.errors;

    function updatePackageHighlights(nextHighlights: PackageHighlightItem[]) {
        form.setData('content', {
            ...contentObject,
            highlights: nextHighlights,
        });
    }

    function addPackageHighlight() {
        updatePackageHighlights([...packageHighlights, createEmptyHighlight()]);
    }

    function updateRoomOriginalPrice(
        roomType: 'dbl' | 'trpl' | 'quad',
        value: string,
    ) {
        const nextOriginalValue = normalizeRoomPriceValue(value);
        const nextSellingValue = calculateDiscountedPrice(
            nextOriginalValue,
            discountPercent,
        );

        form.setData('content', {
            ...contentObject,
            room_original_prices: {
                ...roomOriginalPrices,
                [roomType]: nextOriginalValue,
            },
            room_prices: {
                ...roomPrices,
                [roomType]: nextSellingValue,
            },
        });
    }

    function updateHppEstimate(nextEstimate: PackageHppEstimate) {
        form.setData('content', {
            ...contentObject,
            hpp_estimate: nextEstimate,
        });
    }

    function updateEstimatedCost(
        field: 'tour_leader_fee' | 'muthawwif_fee' | 'other_cost',
        value: string,
    ) {
        updateHppEstimate({
            ...hppEstimate,
            [field]: Math.max(0, Number(value) || 0),
            ...(field === 'tour_leader_fee'
                ? { tour_leader_fee_is_manual: true }
                : {}),
            ...(field === 'muthawwif_fee'
                ? { muthawwif_fee_is_manual: true }
                : {}),
        });
    }

    function updateEstimatedProductQuantity(productId: number, value: string) {
        updateHppEstimate({
            ...hppEstimate,
            product_quantities: {
                ...(hppEstimate.product_quantities ?? {}),
                [String(productId)]: Math.max(0, Number(value) || 0),
            },
            product_quantities_is_manual: {
                ...(hppEstimate.product_quantities_is_manual ?? {}),
                [String(productId)]: true,
            },
        });
    }

    function resetEstimatedProductQuantity(productId: number) {
        updateHppEstimate({
            ...hppEstimate,
            product_quantities_is_manual: {
                ...(hppEstimate.product_quantities_is_manual ?? {}),
                [String(productId)]: false,
            },
        });
    }

    function updateEstimatedHotelAllocation(
        productId: number,
        roomType: keyof typeof estimateRoomCapacities,
        value: string,
    ) {
        const effectiveAllocation = estimateHotelGroups.find(
            (group) => group.product.id === productId,
        )?.allocation ?? { dbl: 0, trpl: 0, quad: 0 };
        const roomCountLimit = getHotelRoomCountLimit(
            effectiveAllocation,
            roomType,
            estimatedCustomerCount,
        );
        const nextRoomCount = Math.min(
            Math.max(0, Number(value) || 0),
            roomCountLimit,
        );

        updateHppEstimate({
            ...hppEstimate,
            hotel_allocations: {
                ...(hppEstimate.hotel_allocations ?? {}),
                [String(productId)]: {
                    ...effectiveAllocation,
                    [roomType]: nextRoomCount,
                },
            },
            hotel_allocations_unit: 'rooms',
            hotel_allocations_is_manual: {
                ...(hppEstimate.hotel_allocations_is_manual ?? {}),
                [String(productId)]: true,
            },
        });
    }

    function applyQuadFirstHotelScenario(
        productId: number,
        defaultAllocation: Record<keyof typeof estimateRoomCapacities, number>,
    ) {
        if (
            Object.values(defaultAllocation).every((roomCount) => roomCount < 1)
        ) {
            toast.error('Harga room type untuk periode package belum lengkap.');

            return;
        }

        updateHppEstimate({
            ...hppEstimate,
            hotel_allocations: {
                ...(hppEstimate.hotel_allocations ?? {}),
                [String(productId)]: defaultAllocation,
            },
            hotel_allocations_unit: 'rooms',
            hotel_allocations_is_manual: {
                ...(hppEstimate.hotel_allocations_is_manual ?? {}),
                [String(productId)]: false,
            },
        });
    }

    function resetEstimatedFeeToFormula(
        fee: 'tour_leader_fee' | 'muthawwif_fee',
    ) {
        updateHppEstimate({
            ...hppEstimate,
            [fee]:
                fee === 'tour_leader_fee'
                    ? defaultTourLeaderFee
                    : defaultMuthawwifFee,
            [`${fee}_is_manual`]: false,
        });
    }

    function addPresetPackageHighlight(label: string, icon: string) {
        const hasExistingHighlight = packageHighlights.some(
            (highlight) =>
                highlight.label.id.trim().toLowerCase() === label.toLowerCase(),
        );

        if (hasExistingHighlight) {
            toast.error(`${label} sudah ada di highlight package.`);

            return;
        }

        updatePackageHighlights([
            ...packageHighlights,
            createPresetHighlight(label, icon),
        ]);
    }

    function updatePackageHighlight(
        highlightId: string,
        field: 'icon' | 'label' | 'value',
        value: string,
    ) {
        updatePackageHighlights(
            packageHighlights.map((highlight) => {
                if (highlight.id !== highlightId) {
                    return highlight;
                }

                if (field === 'icon') {
                    return {
                        ...highlight,
                        icon: value,
                    };
                }

                return {
                    ...highlight,
                    [field]: {
                        id: value,
                        en: value,
                    },
                };
            }),
        );
    }

    function removePackageHighlight(highlightId: string) {
        updatePackageHighlights(
            packageHighlights.filter(
                (highlight) => highlight.id !== highlightId,
            ),
        );
    }

    function clearLocalImagePreviews() {
        previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
        setPreviewUrls([]);
    }

    function applyPendingDraft() {
        if (!currentDraft) {
            return;
        }

        const restoredImages = draftImagePaths(currentDraft);
        const restoredData = buildDraftFormData(pkg, currentDraft.payload);
        form.setData(restoredData);
        setExistingImages(restoredImages);
        clearLocalImagePreviews();
        setHasPendingEditDraft(false);
        setDraftStatus('saved');
        lastSavedDraftSnapshotRef.current = JSON.stringify(
            buildDraftPayload(restoredData, restoredImages),
        );
        toast.success('Draft diterapkan ke form.');
    }

    async function discardDraft() {
        if (!currentDraft) {
            return;
        }

        try {
            if (draftSaveTimeoutRef.current !== null) {
                window.clearTimeout(draftSaveTimeoutRef.current);
            }
            await draftSaveQueueRef.current.catch(() => false);

            const response = await fetch(draftUrl, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                throw new Error('Draft gagal dibuang.');
            }

            const resetData = buildFormData(pkg);
            const resetImages = pkg?.images ?? [];
            form.setData(resetData);
            setExistingImages(resetImages);
            clearLocalImagePreviews();
            setCurrentDraft(null);
            setHasPendingEditDraft(false);
            setDraftStatus('idle');
            lastSavedDraftSnapshotRef.current = JSON.stringify(
                buildDraftPayload(resetData, resetImages),
            );
            toast.success('Draft berhasil dibuang.');
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Draft gagal dibuang.',
            );
        }
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            {!isHppEditor && hasPendingEditDraft && currentDraft ? (
                <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                            <div className="space-y-1">
                                <p className="font-semibold">
                                    Ada perubahan yang belum disimpan
                                </p>
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    Draft terakhir{' '}
                                    {currentDraft.last_autosaved_at
                                        ? formatDateTime(
                                              currentDraft.last_autosaved_at,
                                          )
                                        : 'baru saja'}
                                </p>
                                {currentDraft.has_conflict ? (
                                    <p className="text-sm font-semibold text-destructive">
                                        Package berubah setelah draft dibuat.
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void discardDraft()}
                            >
                                Buang Draft
                            </Button>
                            <Button type="button" onClick={applyPendingDraft}>
                                Gunakan Draft
                            </Button>
                        </div>
                    </div>
                </section>
            ) : null}

            {!isHppEditor &&
            !hasPendingEditDraft &&
            (currentDraft ||
                draftStatus === 'saving' ||
                draftStatus === 'error' ||
                isUploadingDraftImages) ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/45 px-3 py-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        {draftStatus === 'error' ? (
                            <CloudOff className="h-4 w-4 text-destructive" />
                        ) : (
                            <Cloud
                                className={cn(
                                    'h-4 w-4',
                                    draftStatus === 'saved' &&
                                        'text-emerald-600 dark:text-emerald-400',
                                )}
                            />
                        )}
                        <span>
                            {isUploadingDraftImages || draftStatus === 'saving'
                                ? 'Menyimpan draft...'
                                : draftStatus === 'error'
                                  ? 'Draft gagal disimpan.'
                                  : currentDraft?.last_autosaved_at
                                    ? `Draft tersimpan ${formatDateTime(currentDraft.last_autosaved_at)}`
                                    : null}
                        </span>
                    </div>
                    {currentDraft ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => void discardDraft()}
                        >
                            Buang draft
                        </Button>
                    ) : null}
                </div>
            ) : null}

            <fieldset
                disabled={hasPendingEditDraft}
                className="m-0 min-w-0 border-0 p-0 disabled:opacity-60"
            >
                <Tabs
                    defaultValue={isHppEditor ? 'estimasi-hpp' : 'info'}
                    className="w-full"
                >
                    {!isHppEditor ? (
                        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                            <TabsTrigger
                                value="info"
                                className="gap-1.5 text-xs"
                            >
                                <Info className="h-3.5 w-3.5" />
                                Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="gallery"
                                className="gap-1.5 text-xs"
                            >
                                <Camera className="h-3.5 w-3.5" />
                                Gallery
                            </TabsTrigger>
                            <TabsTrigger
                                value="konten"
                                className="gap-1.5 text-xs"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                Konten
                            </TabsTrigger>
                            <TabsTrigger
                                value="itinerary"
                                className="gap-1.5 text-xs"
                            >
                                <BookOpenText className="h-3.5 w-3.5" />
                                Itinerary
                            </TabsTrigger>
                            <TabsTrigger
                                value="harga"
                                className="gap-1.5 text-xs"
                            >
                                <DollarSign className="h-3.5 w-3.5" />
                                Harga
                            </TabsTrigger>
                        </TabsList>
                    ) : null}

                    <TabsContent value="info" className="mt-4">
                        <SectionHeader icon={Info} title="Informasi Dasar" />
                        <FieldGroup>
                            <div className="grid gap-3">
                                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                Kode Otomatis
                                            </p>
                                            <p className="font-mono text-sm font-semibold text-foreground">
                                                {generatedCodePreview}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                                            Auto
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Field
                                label="Nama Package *"
                                error={errors['name.id']}
                            >
                                <Input
                                    value={form.data['name.id']}
                                    onChange={(event) =>
                                        form.setData((currentData) => ({
                                            ...currentData,
                                            'name.id': event.target.value,
                                            'name.en': event.target.value,
                                        }))
                                    }
                                    placeholder="Umroh Reguler 10 Hari"
                                />
                            </Field>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <Field label="Tipe *">
                                    <Select
                                        value={form.data.package_type}
                                        onValueChange={(value) =>
                                            form.setData('package_type', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="reguler">
                                                Reguler
                                            </SelectItem>
                                            <SelectItem value="hemat">
                                                Hemat
                                            </SelectItem>
                                            <SelectItem value="vip">
                                                VIP
                                            </SelectItem>
                                            <SelectItem value="premium">
                                                Premium
                                            </SelectItem>
                                            <SelectItem value="private">
                                                Private
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field
                                    label="Kota Keberangkatan *"
                                    error={errors.departure_city}
                                >
                                    <div className="space-y-2">
                                        <Input
                                            list="indonesian-departure-cities"
                                            value={form.data.departure_city}
                                            onChange={(event) =>
                                                form.setData(
                                                    'departure_city',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Pilih atau cari kota keberangkatan"
                                        />
                                        <datalist id="indonesian-departure-cities">
                                            {indonesianDepartureCities.map(
                                                (city) => (
                                                    <option
                                                        key={city}
                                                        value={city}
                                                    />
                                                ),
                                            )}
                                        </datalist>
                                    </div>
                                </Field>
                                <Field
                                    label="Durasi (Hari) *"
                                    error={errors.duration_days}
                                >
                                    <Input
                                        type="number"
                                        min={1}
                                        value={form.data.duration_days}
                                        onChange={(event) =>
                                            updateDurationDays(
                                                Number(event.target.value) || 1,
                                            )
                                        }
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <Field
                                    label="Tanggal Berangkat *"
                                    error={errors.start_date}
                                >
                                    <Input
                                        type="date"
                                        value={form.data.start_date}
                                        onChange={(event) =>
                                            updateStartDate(event.target.value)
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Tanggal Pulang *"
                                    error={errors.end_date}
                                >
                                    <Input
                                        type="date"
                                        min={form.data.start_date || undefined}
                                        value={form.data.end_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'end_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Total Seat / Pax *"
                                    error={errors.seats_total}
                                >
                                    <Input
                                        type="number"
                                        min={1}
                                        value={form.data.seats_total}
                                        onChange={(event) =>
                                            form.setData(
                                                'seats_total',
                                                Math.max(
                                                    1,
                                                    Number(
                                                        event.target.value,
                                                    ) || 1,
                                                ),
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Status Pendaftaran *"
                                    error={errors.booking_status}
                                >
                                    <Select
                                        value={form.data.booking_status}
                                        onValueChange={(
                                            value: 'open' | 'closed',
                                        ) =>
                                            form.setData(
                                                'booking_status',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">
                                                Dibuka
                                            </SelectItem>
                                            <SelectItem value="closed">
                                                Ditutup
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>

                            <Field
                                label="Catatan Keberangkatan"
                                error={errors.departure_notes}
                            >
                                <Input
                                    value={form.data.departure_notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'departure_notes',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Meeting point Terminal 3"
                                />
                            </Field>

                            <AllInPackageCard
                                value={form.data.all_in}
                                vendors={vendors}
                                categories={productCategories}
                                currencies={effectiveCurrencies}
                                packageStartDate={form.data.start_date}
                                packageEndDate={form.data.end_date}
                                errors={errors as Record<string, string>}
                                onChange={updateAllInConfiguration}
                            />

                            <InfoSectionHeading icon={Layers} title="Produk" />

                            <div className="space-y-4">
                                {selectedProductCurrencyCodes.length > 0 ? (
                                    <div className="grid gap-3 rounded-xl bg-muted/30 p-3 sm:grid-cols-2">
                                        {selectedProductCurrencyCodes.map(
                                            (currencyCode) => {
                                                const snapshot =
                                                    form.data.content
                                                        .hpp_currency_snapshots?.[
                                                        currencyCode
                                                    ];
                                                const liveCurrency =
                                                    currencies.find(
                                                        (currency) =>
                                                            currency.code ===
                                                            currencyCode,
                                                    );

                                                return (
                                                    <div
                                                        key={currencyCode}
                                                        className="space-y-2"
                                                    >
                                                        <Label>
                                                            Kurs {currencyCode}{' '}
                                                            ke IDR
                                                        </Label>
                                                        <div className="flex flex-col gap-2 sm:flex-row">
                                                            <Input
                                                                type="number"
                                                                min={0.000001}
                                                                step="any"
                                                                value={
                                                                    snapshot?.rate_to_idr ||
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    form.setData(
                                                                        'content',
                                                                        {
                                                                            ...form
                                                                                .data
                                                                                .content,
                                                                            hpp_currency_snapshots:
                                                                                {
                                                                                    ...(form
                                                                                        .data
                                                                                        .content
                                                                                        .hpp_currency_snapshots ??
                                                                                        {}),
                                                                                    [currencyCode]:
                                                                                        {
                                                                                            currency:
                                                                                                currencyCode,
                                                                                            rate_to_idr:
                                                                                                Number(
                                                                                                    event
                                                                                                        .target
                                                                                                        .value,
                                                                                                ),
                                                                                            source: 'manual',
                                                                                            fetched_at:
                                                                                                null,
                                                                                        },
                                                                                },
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="shrink-0"
                                                                disabled={
                                                                    Number(
                                                                        liveCurrency?.live_conversion_rate ??
                                                                            0,
                                                                    ) <= 0
                                                                }
                                                                onClick={() =>
                                                                    form.setData(
                                                                        'content',
                                                                        {
                                                                            ...form
                                                                                .data
                                                                                .content,
                                                                            hpp_currency_snapshots:
                                                                                {
                                                                                    ...(form
                                                                                        .data
                                                                                        .content
                                                                                        .hpp_currency_snapshots ??
                                                                                        {}),
                                                                                    [currencyCode]:
                                                                                        {
                                                                                            currency:
                                                                                                currencyCode,
                                                                                            rate_to_idr:
                                                                                                Number(
                                                                                                    liveCurrency?.live_conversion_rate ??
                                                                                                        0,
                                                                                                ),
                                                                                            source: 'live',
                                                                                            fetched_at:
                                                                                                liveCurrency?.rate_fetched_at ??
                                                                                                null,
                                                                                        },
                                                                                },
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                Gunakan Kurs
                                                                Live
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                ) : null}

                                <ProductSelector
                                    options={productOptions}
                                    categories={productCategories}
                                    currencies={effectiveCurrencies}
                                    selected={form.data.product_ids}
                                    productMultipliers={
                                        form.data.product_multipliers
                                    }
                                    hotelBrokerSelections={getHotelBrokerSelections(
                                        form.data.content,
                                    )}
                                    locale={locale}
                                    lockedCategoryKeys={
                                        form.data.all_in.enabled
                                            ? form.data.all_in
                                                  .included_category_keys
                                            : []
                                    }
                                    activeCategoryKey={activeProductCategoryKey}
                                    onActiveCategoryChange={
                                        setActiveProductCategoryKey
                                    }
                                    onChange={updateSelectedProducts}
                                />

                                <PackageSpecificProductManager
                                    value={form.data.custom_products}
                                    categories={productCategories}
                                    currencies={effectiveCurrencies}
                                    hotelCountries={hotelCountries}
                                    hotelCities={hotelCities}
                                    packageStartDate={form.data.start_date}
                                    packageEndDate={form.data.end_date}
                                    activeCategoryKey={activeProductCategoryKey}
                                    lockedCategoryKeys={
                                        form.data.all_in.enabled
                                            ? form.data.all_in
                                                  .included_category_keys
                                            : []
                                    }
                                    hotelBrokerSelections={getHotelBrokerSelections(
                                        form.data.content,
                                    )}
                                    errors={errors as Record<string, string>}
                                    onChange={updateSpecificProducts}
                                />
                            </div>

                            <InfoSectionHeading
                                icon={Calculator}
                                title="Biaya Operasional"
                            />

                            <PackageOperationalCostCards
                                value={operationalCosts}
                                currencies={effectiveCurrencies}
                                hotelPerPax={estimatedHotelPerPax}
                                ticketAndVisaPerPax={
                                    estimatedTicketAndVisaPerPax
                                }
                                tourLeaderTotal={estimatedTourLeaderFee}
                                muthawwifTotal={estimatedMuthawwifFee}
                                onChange={(nextCosts) =>
                                    updateHppEstimate({
                                        ...hppEstimate,
                                        operational_costs: nextCosts,
                                    })
                                }
                            />

                            <InfoSectionHeading
                                icon={FileText}
                                title="Ringkasan & Publikasi"
                            />

                            <Field label="Ringkasan">
                                <Textarea
                                    rows={2}
                                    value={form.data['summary.id']}
                                    onChange={(event) =>
                                        form.setData((currentData) => ({
                                            ...currentData,
                                            'summary.id': event.target.value,
                                            'summary.en': event.target.value,
                                        }))
                                    }
                                    placeholder="Deskripsi singkat paket..."
                                />
                            </Field>

                            <div className="flex gap-6 rounded-xl border bg-muted/20 px-4 py-3">
                                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                                    <Checkbox
                                        checked={form.data.is_featured}
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'is_featured',
                                                Boolean(checked),
                                            )
                                        }
                                    />
                                    <span>Tampilkan sebagai Featured</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                                    <Checkbox
                                        checked={form.data.is_active}
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'is_active',
                                                Boolean(checked),
                                            )
                                        }
                                    />
                                    <span>Package Aktif</span>
                                </label>
                            </div>
                        </FieldGroup>
                    </TabsContent>

                    <TabsContent value="gallery" className="mt-4">
                        <SectionHeader icon={Camera} title="Gallery Package" />
                        <FieldGroup>
                            <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Foto-foto Package
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() =>
                                            imageInputRef.current?.click()
                                        }
                                    >
                                        <Plus className="h-4 w-4" />
                                        Tambah Foto
                                    </Button>
                                </div>

                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageChange}
                                />

                                <div
                                    className={[
                                        'mt-4 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-all',
                                        isDragOverGallery
                                            ? 'border-primary bg-linear-to-br from-primary/12 via-background to-primary/5 shadow-sm'
                                            : 'border-border bg-linear-to-br from-muted/30 via-background to-muted/10 hover:border-primary/40 hover:from-primary/8 hover:to-primary/4',
                                    ].join(' ')}
                                    onDragEnter={(event) => {
                                        event.preventDefault();
                                        setIsDragOverGallery(true);
                                    }}
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        if (!isDragOverGallery) {
                                            setIsDragOverGallery(true);
                                        }
                                    }}
                                    onDragLeave={(event) => {
                                        event.preventDefault();
                                        const nextTarget =
                                            event.relatedTarget as Node | null;

                                        if (
                                            nextTarget &&
                                            event.currentTarget.contains(
                                                nextTarget,
                                            )
                                        ) {
                                            return;
                                        }

                                        setIsDragOverGallery(false);
                                    }}
                                    onDrop={handleGalleryDrop}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className={[
                                                'rounded-full p-3 shadow-sm transition-all',
                                                isDragOverGallery
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-background text-primary',
                                            ].join(' ')}
                                        >
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-foreground">
                                                Drag & drop foto package di sini
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                    {galleryItems.map((item, index) => (
                                        <div
                                            key={item.key}
                                            draggable
                                            onDragStart={() => {
                                                setDraggedGalleryItemKey(
                                                    item.key,
                                                );
                                                setGalleryDropTargetKey(
                                                    item.key,
                                                );
                                            }}
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                if (
                                                    galleryDropTargetKey !==
                                                    item.key
                                                ) {
                                                    setGalleryDropTargetKey(
                                                        item.key,
                                                    );
                                                }
                                            }}
                                            onDrop={(event) => {
                                                event.preventDefault();

                                                if (draggedGalleryItemKey) {
                                                    reorderGalleryItems(
                                                        draggedGalleryItemKey,
                                                        item.key,
                                                    );
                                                }

                                                setDraggedGalleryItemKey(null);
                                                setGalleryDropTargetKey(null);
                                            }}
                                            onDragEnd={() => {
                                                setDraggedGalleryItemKey(null);
                                                setGalleryDropTargetKey(null);
                                            }}
                                            className={[
                                                'group relative h-24 overflow-hidden rounded-xl border bg-muted transition-all',
                                                draggedGalleryItemKey ===
                                                item.key
                                                    ? 'scale-[0.98] opacity-70 ring-2 ring-primary/30'
                                                    : '',
                                                galleryDropTargetKey ===
                                                    item.key &&
                                                draggedGalleryItemKey !==
                                                    item.key
                                                    ? 'ring-2 ring-primary'
                                                    : '',
                                            ].join(' ')}
                                        >
                                            <img
                                                src={item.url}
                                                alt="Gallery"
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white shadow-sm">
                                                <GripVertical className="h-3 w-3" />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() =>
                                                        item.kind === 'existing'
                                                            ? removeExistingImage(
                                                                  existingImages.findIndex(
                                                                      (url) =>
                                                                          url ===
                                                                          item.url,
                                                                  ),
                                                              )
                                                            : removeNewImage(
                                                                  previewUrls.findIndex(
                                                                      (url) =>
                                                                          url ===
                                                                          item.url,
                                                                  ),
                                                              )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="absolute top-1 left-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                                                {index === 0
                                                    ? 'Cover'
                                                    : 'Gallery'}
                                                {item.kind === 'new'
                                                    ? ' Baru'
                                                    : ''}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            imageInputRef.current?.click()
                                        }
                                        className="flex h-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                                    >
                                        <Plus className="h-5 w-5" />
                                        <span className="text-[10px] font-medium tracking-wider uppercase">
                                            Tambah Foto
                                        </span>
                                    </button>
                                </div>

                                {existingImages.length === 0 &&
                                previewUrls.length === 0 ? (
                                    <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                                        <p className="text-sm font-medium text-foreground">
                                            Belum ada foto package
                                        </p>
                                    </div>
                                ) : null}

                                <p className="mt-3 text-xs text-muted-foreground">
                                    Format: PNG, JPG, JPEG, WEBP. Maksimal{' '}
                                    {packageImageUploadMaxLabel} per gambar.
                                </p>

                                {errors.images ? (
                                    <p className="mt-1 text-xs text-destructive">
                                        {errors.images}
                                    </p>
                                ) : null}
                            </div>
                        </FieldGroup>
                    </TabsContent>

                    <TabsContent value="harga" className="mt-4">
                        <SectionHeader icon={Tag} title="Harga dan Promosi" />
                        <FieldGroup>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <Field
                                    label="Harga Base / Single (IDR) *"
                                    error={
                                        errors.original_price || errors.price
                                    }
                                >
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                                            Rp
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={100000}
                                            value={form.data.original_price}
                                            onChange={(event) => {
                                                const nextOriginalPrice = event
                                                    .target.value
                                                    ? Number(event.target.value)
                                                    : '';
                                                form.setData(
                                                    'original_price',
                                                    nextOriginalPrice,
                                                );

                                                if (!event.target.value) {
                                                    form.setData(
                                                        'discount_percent',
                                                        '',
                                                    );
                                                }
                                            }}
                                            className="pl-8"
                                            placeholder="0"
                                        />
                                    </div>
                                </Field>
                                <Field label="Diskon (%)">
                                    <div className="relative">
                                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                                            %
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={99}
                                            value={form.data.discount_percent}
                                            onChange={(event) => {
                                                const nextDiscountPercent =
                                                    event.target.value
                                                        ? Math.min(
                                                              99,
                                                              Math.max(
                                                                  0,
                                                                  Number(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                              ),
                                                          )
                                                        : '';
                                                form.setData(
                                                    'discount_percent',
                                                    nextDiscountPercent,
                                                );
                                            }}
                                            className="pr-8"
                                            placeholder="0"
                                        />
                                    </div>
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <Field label="Harga Asli Double (DBL)">
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                                            Rp
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={100000}
                                            value={
                                                effectiveRoomOriginalPrices.dbl ??
                                                ''
                                            }
                                            onChange={(event) =>
                                                updateRoomOriginalPrice(
                                                    'dbl',
                                                    event.target.value,
                                                )
                                            }
                                            className="pl-8"
                                            placeholder="Isi manual jika diperlukan"
                                        />
                                    </div>
                                </Field>
                                <Field label="Harga Asli Triple (TRPL)">
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                                            Rp
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={100000}
                                            value={
                                                effectiveRoomOriginalPrices.trpl ??
                                                ''
                                            }
                                            onChange={(event) =>
                                                updateRoomOriginalPrice(
                                                    'trpl',
                                                    event.target.value,
                                                )
                                            }
                                            className="pl-8"
                                            placeholder="Isi manual jika diperlukan"
                                        />
                                    </div>
                                </Field>
                                <Field label="Harga Asli Quad (QUAD)">
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                                            Rp
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={100000}
                                            value={
                                                effectiveRoomOriginalPrices.quad ??
                                                ''
                                            }
                                            onChange={(event) =>
                                                updateRoomOriginalPrice(
                                                    'quad',
                                                    event.target.value,
                                                )
                                            }
                                            className="pl-8"
                                            placeholder="Isi manual jika diperlukan"
                                        />
                                    </div>
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <Field label="Harga Jual Double (DBL)">
                                    <div className="flex h-11 items-center rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground">
                                        {formatCurrencyInputPreview(
                                            effectiveRoomSellingPrices.dbl ??
                                                null,
                                        )}
                                    </div>
                                </Field>
                                <Field label="Harga Jual Triple (TRPL)">
                                    <div className="flex h-11 items-center rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground">
                                        {formatCurrencyInputPreview(
                                            effectiveRoomSellingPrices.trpl ??
                                                null,
                                        )}
                                    </div>
                                </Field>
                                <Field label="Harga Jual Quad (QUAD)">
                                    <div className="flex h-11 items-center rounded-xl border border-border bg-muted/30 px-3 text-sm font-medium text-foreground">
                                        {formatCurrencyInputPreview(
                                            effectiveRoomSellingPrices.quad ??
                                                null,
                                        )}
                                    </div>
                                </Field>
                            </div>
                            <div className="rounded-2xl border border-border bg-muted/20 p-4">
                                <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                    Harga Jual Otomatis
                                </p>
                                <div className="mt-2 flex flex-wrap items-end gap-3">
                                    <p className="text-3xl font-bold text-primary">
                                        Rp{' '}
                                        {sellingPrice.toLocaleString('id-ID')}
                                    </p>
                                    {hasDiscount ? (
                                        <p className="text-sm text-muted-foreground line-through">
                                            Rp{' '}
                                            {basePrice.toLocaleString('id-ID')}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            {hasDiscount ? (
                                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                                    <div className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white">
                                        -{discountPercent}%
                                    </div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                        Diskon aktif
                                    </p>
                                </div>
                            ) : null}

                            <Field label="Label Diskon">
                                <Input
                                    value={form.data.discount_label}
                                    onChange={(event) =>
                                        form.setData(
                                            'discount_label',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: EARLY BIRD, FLASH SALE"
                                />
                            </Field>
                            <Field label="Promo Berakhir">
                                <Input
                                    type="datetime-local"
                                    value={form.data.discount_ends_at}
                                    onChange={(event) =>
                                        form.setData(
                                            'discount_ends_at',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field label="Mata Uang">
                                <Select
                                    value={form.data.currency}
                                    onValueChange={(value) => {
                                        const liveCurrency = currencies.find(
                                            (currency) =>
                                                currency.code === value,
                                        );
                                        form.setData((current) => ({
                                            ...current,
                                            currency: value,
                                            content: {
                                                ...current.content,
                                                hpp_currency_snapshots: {
                                                    ...(current.content
                                                        .hpp_currency_snapshots ??
                                                        {}),
                                                    [value]: {
                                                        currency: value,
                                                        rate_to_idr:
                                                            value === 'IDR'
                                                                ? 1
                                                                : Number(
                                                                      liveCurrency?.live_conversion_rate ??
                                                                          0,
                                                                  ),
                                                        source:
                                                            value === 'IDR'
                                                                ? 'identity'
                                                                : 'live',
                                                        fetched_at:
                                                            liveCurrency?.rate_fetched_at ??
                                                            null,
                                                    },
                                                },
                                            },
                                        }));
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map((currency) => (
                                            <SelectItem
                                                key={currency.code}
                                                value={currency.code}
                                            >
                                                {currency.code} -{' '}
                                                {currency.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.data.currency !== 'IDR' ? (
                                    <div className="mt-2 flex gap-2">
                                        <Input
                                            type="number"
                                            min={0.000001}
                                            step="any"
                                            value={currencyRateToIdr || ''}
                                            onChange={(event) => {
                                                const code =
                                                    form.data.currency.toUpperCase();
                                                form.setData('content', {
                                                    ...form.data.content,
                                                    hpp_currency_snapshots: {
                                                        ...(form.data.content
                                                            .hpp_currency_snapshots ??
                                                            {}),
                                                        [code]: {
                                                            currency: code,
                                                            rate_to_idr: Number(
                                                                event.target
                                                                    .value,
                                                            ),
                                                            source: 'manual',
                                                            fetched_at: null,
                                                        },
                                                    },
                                                });
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={
                                                Number(
                                                    selectedCurrency?.live_conversion_rate ??
                                                        0,
                                                ) <= 0
                                            }
                                            onClick={() => {
                                                const code =
                                                    form.data.currency.toUpperCase();
                                                form.setData('content', {
                                                    ...form.data.content,
                                                    hpp_currency_snapshots: {
                                                        ...(form.data.content
                                                            .hpp_currency_snapshots ??
                                                            {}),
                                                        [code]: {
                                                            currency: code,
                                                            rate_to_idr: Number(
                                                                selectedCurrency?.live_conversion_rate ??
                                                                    0,
                                                            ),
                                                            source: 'live',
                                                            fetched_at:
                                                                selectedCurrency?.rate_fetched_at ??
                                                                null,
                                                        },
                                                    },
                                                });
                                            }}
                                        >
                                            Gunakan Kurs Live
                                        </Button>
                                    </div>
                                ) : null}
                            </Field>
                        </FieldGroup>
                    </TabsContent>

                    <TabsContent value="estimasi-hpp" className="mt-4">
                        <SectionHeader
                            icon={Calculator}
                            title="Estimasi HPP Package"
                        />
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Target dan Komposisi Jamaah
                                        </p>
                                    </div>
                                    <strong className="text-sm">
                                        {estimatedCustomerCount} jamaah
                                    </strong>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-border/60 pt-3 text-sm">
                                    {(
                                        [
                                            ['single', 'Single'],
                                            ['dbl', 'Double'],
                                            ['trpl', 'Triple'],
                                            ['quad', 'Quad'],
                                        ] as const
                                    ).map(([roomType, label]) => (
                                        <span key={roomType}>
                                            <span className="text-muted-foreground">
                                                {label}
                                            </span>{' '}
                                            <strong>
                                                {estimatedCustomers[roomType]}{' '}
                                                pax
                                            </strong>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {form.data.all_in.enabled ? (
                                <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/30">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-sky-950 dark:text-sky-100">
                                                Paket All In Vendor
                                            </p>
                                            <p className="mt-1 text-xs text-sky-800 dark:text-sky-300">
                                                {form.data.all_in
                                                    .broker_package_name ||
                                                    'Nama paket vendor belum diisi'}
                                                {' - '}
                                                {form.data.all_in.included_category_keys
                                                    .map(
                                                        (categoryKey) =>
                                                            productCategories.find(
                                                                (category) =>
                                                                    category.key ===
                                                                    categoryKey,
                                                            )?.name,
                                                    )
                                                    .map((name) =>
                                                        typeof name === 'string'
                                                            ? name
                                                            : name?.id ||
                                                              name?.en,
                                                    )
                                                    .filter(Boolean)
                                                    .join(', ') ||
                                                    'Kategori belum dipilih'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-sky-700 dark:text-sky-300">
                                                {formatEstimateCurrency(
                                                    convertEstimatePriceToIdr(
                                                        form.data.all_in
                                                            .price_per_pax,
                                                        form.data.all_in
                                                            .currency,
                                                    ),
                                                )}{' '}
                                                / jamaah
                                            </p>
                                            <p className="font-semibold text-sky-950 dark:text-sky-100">
                                                {formatEstimateCurrency(
                                                    estimatedAllInTotal,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold">
                                        Breakdown Product
                                    </p>
                                    <strong className="text-sm">
                                        {formatEstimateCurrency(
                                            estimatedProductTotal,
                                        )}
                                    </strong>
                                </div>
                                {estimateProductItems.length > 0 ? (
                                    <div className="divide-y divide-border/70 rounded-xl border border-border/70">
                                        {estimateProductItems.map((item) => (
                                            <div
                                                key={item.product.id}
                                                className="grid gap-2 p-3 sm:grid-cols-[1fr_190px_150px] sm:items-end"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {localizedFieldValue(
                                                            item.product.name,
                                                            locale,
                                                            item.product.code,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatEstimateCurrency(
                                                            item.unitPrice,
                                                        )}{' '}
                                                        / unit
                                                    </p>
                                                </div>
                                                <Field label="Quantity">
                                                    <div className="flex gap-1.5">
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(event) =>
                                                                updateEstimatedProductQuantity(
                                                                    item.product
                                                                        .id,
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                        {item.quantityIsManual ? (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    resetEstimatedProductQuantity(
                                                                        item
                                                                            .product
                                                                            .id,
                                                                    )
                                                                }
                                                            >
                                                                Auto
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                </Field>
                                                <div className="sm:text-right">
                                                    <p className="text-xs text-muted-foreground">
                                                        Total
                                                    </p>
                                                    <p className="text-sm font-semibold">
                                                        {formatEstimateCurrency(
                                                            item.totalPrice,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                                        Belum ada product non-hotel yang
                                        dipilih.
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold">
                                        Breakdown Hotel
                                    </p>
                                    <strong className="text-sm">
                                        {formatEstimateCurrency(
                                            estimatedHotelTotal,
                                        )}
                                    </strong>
                                </div>
                                {estimateHotelGroups.length > 0 ? (
                                    <div className="space-y-3">
                                        {estimateHotelGroups.map(
                                            (group, index) => (
                                                <div
                                                    key={group.product.id}
                                                    className="rounded-xl border border-border/70 p-3"
                                                >
                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {localizedFieldValue(
                                                                    group
                                                                        .product
                                                                        .name,
                                                                    locale,
                                                                    group
                                                                        .product
                                                                        .code,
                                                                )}
                                                            </p>
                                                            {index === 0 ? (
                                                                <p className="mt-0.5 text-[11px] font-medium text-primary">
                                                                    Acuan
                                                                    komposisi
                                                                    harga jual
                                                                </p>
                                                            ) : null}
                                                            <p className="text-xs text-muted-foreground">
                                                                Kapasitas{' '}
                                                                {
                                                                    group.allocatedPax
                                                                }{' '}
                                                                pax, target{' '}
                                                                {
                                                                    estimatedCustomerCount
                                                                }{' '}
                                                                jamaah,{' '}
                                                                {
                                                                    group.allocationDeltaLabel
                                                                }
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                applyQuadFirstHotelScenario(
                                                                    group
                                                                        .product
                                                                        .id,
                                                                    group.defaultAllocation,
                                                                )
                                                            }
                                                        >
                                                            Skenario QUAD
                                                        </Button>
                                                    </div>
                                                    <div className="grid gap-2 md:grid-cols-3">
                                                        {group.rows.map(
                                                            (row) => (
                                                                <div
                                                                    key={
                                                                        row.roomType
                                                                    }
                                                                    className="rounded-lg bg-muted/30 p-2.5"
                                                                >
                                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                                        <strong className="text-xs uppercase">
                                                                            {
                                                                                row.roomType
                                                                            }
                                                                        </strong>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {
                                                                                row.roomCount
                                                                            }{' '}
                                                                            kamar
                                                                        </span>
                                                                    </div>
                                                                    <Field label="Jumlah kamar">
                                                                        <Input
                                                                            type="number"
                                                                            min={
                                                                                0
                                                                            }
                                                                            max={
                                                                                row.roomCountLimit
                                                                            }
                                                                            value={
                                                                                row.roomCount
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateEstimatedHotelAllocation(
                                                                                    group
                                                                                        .product
                                                                                        .id,
                                                                                    row.roomType,
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                                                                            {
                                                                                row.roomCount
                                                                            }{' '}
                                                                            kamar
                                                                            x{' '}
                                                                            {
                                                                                estimateRoomCapacities[
                                                                                    row
                                                                                        .roomType
                                                                                ]
                                                                            }{' '}
                                                                            pax
                                                                            ={' '}
                                                                            {
                                                                                row.pax
                                                                            }{' '}
                                                                            pax
                                                                        </p>
                                                                    </Field>
                                                                    <div className="mt-2 flex justify-between gap-2 text-xs">
                                                                        <span>
                                                                            {
                                                                                row.pax
                                                                            }{' '}
                                                                            pax
                                                                        </span>
                                                                        <strong>
                                                                            {formatEstimateCurrency(
                                                                                row.totalPrice,
                                                                            )}
                                                                        </strong>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
                                        Belum ada product hotel yang dipilih.
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-2xl border border-border bg-card p-4">
                                    <p className="mb-3 text-sm font-semibold">
                                        Fee dan Biaya Tambahan
                                    </p>
                                    {hasOperationalCostConfiguration ? (
                                        <div className="divide-y divide-border/60 text-sm">
                                            {[
                                                [
                                                    'SDM',
                                                    estimatedOperationalTotals.humanResources,
                                                    `${operationalCosts.human_resources.length} SDM`,
                                                ],
                                                [
                                                    'Overhead',
                                                    estimatedOperationalTotals.overhead,
                                                    operationalCosts.overhead
                                                        .mode === 'per_pax'
                                                        ? `${formatEstimateCurrency(operationalCosts.overhead.amount)} x ${estimatedCustomerCount} jamaah`
                                                        : 'Total flat',
                                                ],
                                                [
                                                    'Fotografer',
                                                    estimatedOperationalTotals.photographer,
                                                    `${operationalCosts.photographer.count} x ${formatEstimateCurrency(operationalCosts.photographer.daily_salary)} x ${operationalCosts.photographer.days} hari`,
                                                ],
                                                [
                                                    'Tour Leader',
                                                    estimatedOperationalTotals.tourLeader,
                                                    `${operationalCosts.tour_leader.count} x (gaji + hotel ${formatEstimateCurrency(operationalCosts.tour_leader.include_hotel ? estimatedHotelPerPax : 0)} + tiket/visa ${formatEstimateCurrency(operationalCosts.tour_leader.include_ticket_and_visa ? estimatedTicketAndVisaPerPax : 0)})`,
                                                ],
                                                [
                                                    'Muthawwif',
                                                    estimatedOperationalTotals.muthawwif,
                                                    `${operationalCosts.muthawwif.count} x (${operationalCosts.muthawwif.daily_salary} ${operationalCosts.muthawwif.currency} x ${operationalCosts.muthawwif.days} hari${operationalCosts.muthawwif.include_hotel ? ` + kamar hotel ${formatEstimateCurrency(estimatedHotelPerPax)}` : ''})`,
                                                ],
                                                [
                                                    'Marketing',
                                                    estimatedOperationalTotals.marketing,
                                                    estimatedCustomerCount > 0
                                                        ? `${formatEstimateCurrency(operationalCosts.marketing.amount_per_pax)} ÷ ${estimatedCustomerCount} jamaah = ${formatEstimateCurrency(Math.floor(operationalCosts.marketing.amount_per_pax / estimatedCustomerCount))} / pax`
                                                        : `${formatEstimateCurrency(operationalCosts.marketing.amount_per_pax)} ÷ 0 jamaah`,
                                                ],
                                                [
                                                    'Tips guide lokal',
                                                    estimatedOperationalTotals.guideTips,
                                                    `${operationalCosts.guide_tips.length} negara / baris`,
                                                ],
                                                [
                                                    'Tips sopir',
                                                    estimatedOperationalTotals.driverTips,
                                                    `${operationalCosts.driver_tips.length} negara / baris`,
                                                ],
                                            ].map(
                                                ([label, amount, formula]) => (
                                                    <div
                                                        key={String(label)}
                                                        className="flex items-start justify-between gap-3 py-2 first:pt-0"
                                                    >
                                                        <span className="min-w-0 text-muted-foreground">
                                                            <span className="block text-foreground">
                                                                {label}
                                                            </span>
                                                            <span className="block text-[11px] leading-4">
                                                                {formula}
                                                            </span>
                                                        </span>
                                                        <strong className="shrink-0">
                                                            {formatEstimateCurrency(
                                                                Number(amount),
                                                            )}
                                                        </strong>
                                                    </div>
                                                ),
                                            )}
                                            <div className="flex justify-between gap-3 py-2 font-semibold text-primary">
                                                <span>Total operasional</span>
                                                <strong>
                                                    {formatEstimateCurrency(
                                                        estimatedOperationalTotals.total,
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <Field label="HPP Tour Leader (IDR)">
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step={1000}
                                                        value={
                                                            estimatedTourLeaderFee
                                                        }
                                                        onChange={(event) =>
                                                            updateEstimatedCost(
                                                                'tour_leader_fee',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    {tourLeaderFeeIsManual ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                resetEstimatedFeeToFormula(
                                                                    'tour_leader_fee',
                                                                )
                                                            }
                                                        >
                                                            Rumus
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            </Field>
                                            <Field label="HPP Muthawwif (IDR)">
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step={1000}
                                                        value={
                                                            estimatedMuthawwifFee
                                                        }
                                                        onChange={(event) =>
                                                            updateEstimatedCost(
                                                                'muthawwif_fee',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    {muthawwifFeeIsManual ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                resetEstimatedFeeToFormula(
                                                                    'muthawwif_fee',
                                                                )
                                                            }
                                                        >
                                                            Rumus
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            </Field>
                                        </div>
                                    )}
                                    <div className="mt-3">
                                        <Field label="Biaya lainnya (IDR)">
                                            <Input
                                                type="number"
                                                min={0}
                                                step={1000}
                                                value={
                                                    hppEstimate.other_cost ?? ''
                                                }
                                                onChange={(event) =>
                                                    updateEstimatedCost(
                                                        'other_cost',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                    <div className="mt-3">
                                        <Field label="Catatan estimasi">
                                            <Textarea
                                                value={hppEstimate.notes ?? ''}
                                                onChange={(event) =>
                                                    updateHppEstimate({
                                                        ...hppEstimate,
                                                        notes: event.target
                                                            .value,
                                                    })
                                                }
                                                rows={3}
                                            />
                                        </Field>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 dark:bg-emerald-500/15">
                                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                        Ringkasan Perkiraan
                                    </p>
                                    <div className="mt-3 divide-y divide-emerald-500/20 text-sm">
                                        <div className="flex justify-between gap-3 py-2">
                                            <span>Target jamaah</span>
                                            <strong>
                                                {estimatedCustomerCount} pax
                                            </strong>
                                        </div>
                                        <div className="flex justify-between gap-3 py-2">
                                            <span>Total produk</span>
                                            <strong>
                                                {formatEstimateCurrency(
                                                    estimatedProductTotal,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="flex justify-between gap-3 py-2">
                                            <span>Total hotel</span>
                                            <strong>
                                                {formatEstimateCurrency(
                                                    estimatedHotelTotal,
                                                )}
                                            </strong>
                                        </div>
                                        {form.data.all_in.enabled ? (
                                            <div className="flex justify-between gap-3 py-2">
                                                <span>Paket All In</span>
                                                <strong>
                                                    {formatEstimateCurrency(
                                                        estimatedAllInTotal,
                                                    )}
                                                </strong>
                                            </div>
                                        ) : null}
                                        <div className="flex justify-between gap-3 py-2">
                                            <span>
                                                {hasOperationalCostConfiguration
                                                    ? 'Biaya operasional'
                                                    : 'Fee TL & Muthawwif'}
                                            </span>
                                            <strong>
                                                {formatEstimateCurrency(
                                                    hasOperationalCostConfiguration
                                                        ? estimatedOperationalTotals.total
                                                        : estimatedTourLeaderFee +
                                                              estimatedMuthawwifFee,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="flex justify-between gap-3 py-2">
                                            <span>Total HPP estimasi</span>
                                            <strong>
                                                {formatEstimateCurrency(
                                                    estimatedGrandTotal,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="flex justify-between gap-3 py-2">
                                            <span>HPP / jamaah</span>
                                            <strong>
                                                {formatEstimateCurrency(
                                                    estimatedCustomerCount > 0
                                                        ? Math.floor(
                                                              estimatedGrandTotal /
                                                                  estimatedCustomerCount,
                                                          )
                                                        : 0,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="flex justify-between gap-3 py-2">
                                            <span>Estimasi omzet</span>
                                            <strong>
                                                {formatEstimateCurrency(
                                                    estimatedRevenue,
                                                )}
                                            </strong>
                                        </div>
                                        <div className="flex justify-between gap-3 py-2 text-emerald-800 dark:text-emerald-200">
                                            <span>Estimasi keuntungan</span>
                                            <strong>
                                                {formatEstimateCurrency(
                                                    estimatedRevenue -
                                                        estimatedGrandTotal,
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                                <div className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Keputusan Harga Jual
                                        </p>
                                    </div>
                                    <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        Semua total dalam IDR
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-border/60 py-4 lg:grid-cols-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            HPP / jamaah
                                        </p>
                                        <p className="mt-1 text-base font-bold text-foreground sm:text-lg">
                                            {formatEstimateCurrency(
                                                estimatedHppPerCustomer,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Profit / jamaah
                                        </p>
                                        <p
                                            className={cn(
                                                'mt-1 text-base font-bold sm:text-lg',
                                                estimatedProfitPerCustomer >= 0
                                                    ? 'text-emerald-700 dark:text-emerald-300'
                                                    : 'text-destructive',
                                            )}
                                        >
                                            {formatEstimateCurrency(
                                                estimatedProfitPerCustomer,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Margin
                                        </p>
                                        <p
                                            className={cn(
                                                'mt-1 text-base font-bold sm:text-lg',
                                                estimatedMarginPercent >= 0
                                                    ? 'text-emerald-700 dark:text-emerald-300'
                                                    : 'text-destructive',
                                            )}
                                        >
                                            {estimatedMarginPercent.toLocaleString(
                                                'id-ID',
                                                {
                                                    minimumFractionDigits: 1,
                                                    maximumFractionDigits: 1,
                                                },
                                            )}
                                            %
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Total profit
                                        </p>
                                        <p
                                            className={cn(
                                                'mt-1 text-base font-bold sm:text-lg',
                                                estimatedProfit >= 0
                                                    ? 'text-emerald-700 dark:text-emerald-300'
                                                    : 'text-destructive',
                                            )}
                                        >
                                            {formatEstimateCurrency(
                                                estimatedProfit,
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-border/60 bg-muted/30 p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Komposisi harga paket
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {estimatedCustomerCount} pax
                                        </p>
                                    </div>
                                    {estimatedRoomPriceBreakdown.length > 0 ? (
                                        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                            {estimatedRoomPriceBreakdown.map(
                                                (room) => (
                                                    <div
                                                        key={room.key}
                                                        className="rounded-xl border border-border/60 bg-background p-3"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground">
                                                                    {room.label}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {room.pax}{' '}
                                                                    pax x{' '}
                                                                    {formatEstimateCurrency(
                                                                        room.unitPrice,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <strong className="text-sm">
                                                                {formatEstimateCurrency(
                                                                    room.totalPrice,
                                                                )}
                                                            </strong>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="grid gap-4 pt-4">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <Field
                                            label="Harga Base / Single (IDR) *"
                                            error={
                                                errors.original_price ||
                                                errors.price
                                            }
                                        >
                                            <div className="relative">
                                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                                                    Rp
                                                </span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step={100000}
                                                    value={
                                                        form.data.original_price
                                                    }
                                                    onChange={(event) => {
                                                        const nextOriginalPrice =
                                                            event.target.value
                                                                ? Number(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  )
                                                                : '';
                                                        form.setData(
                                                            'original_price',
                                                            nextOriginalPrice,
                                                        );

                                                        if (
                                                            !event.target.value
                                                        ) {
                                                            form.setData(
                                                                'discount_percent',
                                                                '',
                                                            );
                                                        }
                                                    }}
                                                    className="pl-8"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </Field>
                                        <Field label="Diskon (%)">
                                            <div className="relative">
                                                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                                                    %
                                                </span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={99}
                                                    value={
                                                        form.data
                                                            .discount_percent
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'discount_percent',
                                                            event.target.value
                                                                ? Math.min(
                                                                      99,
                                                                      Math.max(
                                                                          0,
                                                                          Number(
                                                                              event
                                                                                  .target
                                                                                  .value,
                                                                          ),
                                                                      ),
                                                                  )
                                                                : '',
                                                        )
                                                    }
                                                    className="pr-8"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </Field>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3">
                                        {(
                                            [
                                                ['dbl', 'Double (DBL)'],
                                                ['trpl', 'Triple (TRPL)'],
                                                ['quad', 'Quad (QUAD)'],
                                            ] as const
                                        ).map(([roomType, label]) => (
                                            <Field
                                                key={roomType}
                                                label={`Harga Asli ${label}`}
                                            >
                                                <div className="relative">
                                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground">
                                                        Rp
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step={100000}
                                                        value={
                                                            effectiveRoomOriginalPrices[
                                                                roomType
                                                            ] ?? ''
                                                        }
                                                        onChange={(event) =>
                                                            updateRoomOriginalPrice(
                                                                roomType,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="pl-8"
                                                        placeholder="Isi manual"
                                                    />
                                                </div>
                                            </Field>
                                        ))}
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {[
                                            {
                                                label: 'Single',
                                                value: sellingPrice,
                                            },
                                            {
                                                label: 'Double',
                                                value: effectiveRoomSellingPrices.dbl,
                                            },
                                            {
                                                label: 'Triple',
                                                value: effectiveRoomSellingPrices.trpl,
                                            },
                                            {
                                                label: 'Quad',
                                                value: effectiveRoomSellingPrices.quad,
                                            },
                                        ].map((roomPrice) => (
                                            <div
                                                key={roomPrice.label}
                                                className="border-l-2 border-primary/30 pl-3"
                                            >
                                                <p className="text-xs text-muted-foreground">
                                                    Harga jual {roomPrice.label}
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-foreground">
                                                    {formatCurrencyInputPreview(
                                                        roomPrice.value ?? null,
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                        <Field label="Label Diskon">
                                            <Input
                                                value={form.data.discount_label}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'discount_label',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: EARLY BIRD"
                                            />
                                        </Field>
                                        <Field label="Promo Berakhir">
                                            <Input
                                                type="datetime-local"
                                                value={
                                                    form.data.discount_ends_at
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'discount_ends_at',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field label="Mata Uang">
                                            <Select
                                                value={form.data.currency}
                                                onValueChange={(value) => {
                                                    const liveCurrency =
                                                        currencies.find(
                                                            (currency) =>
                                                                currency.code ===
                                                                value,
                                                        );
                                                    form.setData((current) => ({
                                                        ...current,
                                                        currency: value,
                                                        content: {
                                                            ...current.content,
                                                            hpp_currency_snapshots:
                                                                {
                                                                    ...(current
                                                                        .content
                                                                        .hpp_currency_snapshots ??
                                                                        {}),
                                                                    [value]: {
                                                                        currency:
                                                                            value,
                                                                        rate_to_idr:
                                                                            value ===
                                                                            'IDR'
                                                                                ? 1
                                                                                : Number(
                                                                                      liveCurrency?.live_conversion_rate ??
                                                                                          0,
                                                                                  ),
                                                                        source:
                                                                            value ===
                                                                            'IDR'
                                                                                ? 'identity'
                                                                                : 'live',
                                                                        fetched_at:
                                                                            liveCurrency?.rate_fetched_at ??
                                                                            null,
                                                                    },
                                                                },
                                                        },
                                                    }));
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currencies.map(
                                                        (currency) => (
                                                            <SelectItem
                                                                key={
                                                                    currency.code
                                                                }
                                                                value={
                                                                    currency.code
                                                                }
                                                            >
                                                                {currency.code}{' '}
                                                                -{' '}
                                                                {currency.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </div>

                                    {form.data.currency !== 'IDR' ? (
                                        <Field
                                            label={`Kurs ${form.data.currency} ke IDR`}
                                        >
                                            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                                                <Input
                                                    type="number"
                                                    min={0.000001}
                                                    step="any"
                                                    value={
                                                        currencyRateToIdr || ''
                                                    }
                                                    onChange={(event) => {
                                                        const code =
                                                            form.data.currency.toUpperCase();
                                                        form.setData(
                                                            'content',
                                                            {
                                                                ...form.data
                                                                    .content,
                                                                hpp_currency_snapshots:
                                                                    {
                                                                        ...(form
                                                                            .data
                                                                            .content
                                                                            .hpp_currency_snapshots ??
                                                                            {}),
                                                                        [code]: {
                                                                            currency:
                                                                                code,
                                                                            rate_to_idr:
                                                                                Number(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            source: 'manual',
                                                                            fetched_at:
                                                                                null,
                                                                        },
                                                                    },
                                                            },
                                                        );
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={
                                                        Number(
                                                            selectedCurrency?.live_conversion_rate ??
                                                                0,
                                                        ) <= 0
                                                    }
                                                    onClick={() => {
                                                        const code =
                                                            form.data.currency.toUpperCase();
                                                        form.setData(
                                                            'content',
                                                            {
                                                                ...form.data
                                                                    .content,
                                                                hpp_currency_snapshots:
                                                                    {
                                                                        ...(form
                                                                            .data
                                                                            .content
                                                                            .hpp_currency_snapshots ??
                                                                            {}),
                                                                        [code]: {
                                                                            currency:
                                                                                code,
                                                                            rate_to_idr:
                                                                                Number(
                                                                                    selectedCurrency?.live_conversion_rate ??
                                                                                        0,
                                                                                ),
                                                                            source: 'live',
                                                                            fetched_at:
                                                                                selectedCurrency?.rate_fetched_at ??
                                                                                null,
                                                                        },
                                                                    },
                                                            },
                                                        );
                                                    }}
                                                >
                                                    Gunakan Kurs Live
                                                </Button>
                                            </div>
                                        </Field>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="konten" className="mt-4">
                        <SectionHeader icon={FileText} title="Konten Package" />
                        <FieldGroup>
                            <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Highlight Package
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="gap-2"
                                        onClick={addPackageHighlight}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Tambah Highlight
                                    </Button>
                                </div>

                                <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4">
                                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                        Preset cepat
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {packageHighlightPresets.map(
                                            (preset) => (
                                                <Button
                                                    key={preset.label}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-full"
                                                    onClick={() =>
                                                        addPresetPackageHighlight(
                                                            preset.label,
                                                            preset.icon,
                                                        )
                                                    }
                                                >
                                                    {preset.label}
                                                </Button>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {packageHighlights.length > 0 ? (
                                        packageHighlights.map((highlight) => {
                                            const HighlightIcon =
                                                packageHighlightIconMap[
                                                    highlight.icon
                                                ] ??
                                                packageHighlightIconMap.Sparkles;
                                            const matchingPreset =
                                                packageHighlightPresets.find(
                                                    (preset) =>
                                                        preset.label.toLowerCase() ===
                                                        highlight.label.id
                                                            .trim()
                                                            .toLowerCase(),
                                                );

                                            return (
                                                <div
                                                    key={highlight.id}
                                                    className="rounded-2xl border border-border bg-background/80 p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                                                <HighlightIcon className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {highlight
                                                                        .label
                                                                        .id ||
                                                                        'Highlight baru'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-destructive"
                                                            onClick={() =>
                                                                removePackageHighlight(
                                                                    highlight.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_1fr]">
                                                        <Field label="Icon">
                                                            <Select
                                                                value={
                                                                    highlight.icon
                                                                }
                                                                onValueChange={(
                                                                    value,
                                                                ) =>
                                                                    updatePackageHighlight(
                                                                        highlight.id,
                                                                        'icon',
                                                                        value,
                                                                    )
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Pilih icon" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {packageHighlightIconOptions.map(
                                                                        (
                                                                            iconOption,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    iconOption.value
                                                                                }
                                                                                value={
                                                                                    iconOption.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    iconOption.label
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </Field>

                                                        <Field label="Label Highlight">
                                                            <Input
                                                                value={
                                                                    highlight
                                                                        .label
                                                                        .id
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updatePackageHighlight(
                                                                        highlight.id,
                                                                        'label',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Contoh: Maskapai, Hotel, Badge, Periode"
                                                            />
                                                        </Field>

                                                        <Field label="Isi Highlight">
                                                            <Input
                                                                value={
                                                                    highlight
                                                                        .value
                                                                        .id
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updatePackageHighlight(
                                                                        highlight.id,
                                                                        'value',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder={
                                                                    matchingPreset?.placeholder ??
                                                                    'Contoh: Saudia, Hilton, Early Bird, November 2026'
                                                                }
                                                            />
                                                        </Field>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                                            <p className="text-sm font-medium text-foreground">
                                                Belum ada highlight package.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Field label="Termasuk dalam Paket">
                                <Textarea
                                    rows={5}
                                    value={toLines(
                                        (
                                            form.data.content
                                                ?.included as Record<
                                                string,
                                                unknown
                                            >
                                        )?.id,
                                    )}
                                    onChange={(event) => {
                                        const lines =
                                            event.target.value.split('\n');
                                        const existingIncluded =
                                            (form.data.content
                                                ?.included as Record<
                                                string,
                                                unknown
                                            >) ?? {};
                                        form.setData('content', {
                                            ...form.data.content,
                                            included: {
                                                ...existingIncluded,
                                                id: lines,
                                            },
                                        });
                                    }}
                                    placeholder={
                                        'Tiket pesawat PP\nVisa umroh\nAkomodasi hotel bintang 4'
                                    }
                                />
                            </Field>
                            <Field label="Tidak Termasuk">
                                <Textarea
                                    rows={3}
                                    value={toLines(
                                        (
                                            form.data.content
                                                ?.excluded as Record<
                                                string,
                                                unknown
                                            >
                                        )?.id,
                                    )}
                                    onChange={(event) => {
                                        const lines =
                                            event.target.value.split('\n');
                                        const existingExcluded =
                                            (form.data.content
                                                ?.excluded as Record<
                                                string,
                                                unknown
                                            >) ?? {};
                                        form.setData('content', {
                                            ...form.data.content,
                                            excluded: {
                                                ...existingExcluded,
                                                id: lines,
                                            },
                                        });
                                    }}
                                    placeholder={
                                        'Pengeluaran pribadi\nOleh-oleh'
                                    }
                                />
                            </Field>
                            <Field label="Kebijakan">
                                <Textarea
                                    rows={3}
                                    value={contentField(
                                        form.data.content,
                                        'policy',
                                    )}
                                    onChange={(event) =>
                                        form.setData(
                                            'content',
                                            setContentField(
                                                form.data.content,
                                                'policy',
                                                'id',
                                                event.target.value,
                                            ),
                                        )
                                    }
                                    placeholder="Kebijakan pembatalan, perubahan jadwal, dan hal penting lainnya."
                                />
                            </Field>
                        </FieldGroup>
                    </TabsContent>

                    <TabsContent value="itinerary" className="mt-4 space-y-4">
                        <SectionHeader
                            icon={BookOpenText}
                            title="Itinerary Perjalanan"
                        />

                        <div className="rounded-2xl border border-border bg-muted/20 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Ringkasan itinerary
                                    </p>
                                </div>
                                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    {form.data.duration_days} hari
                                </div>
                            </div>

                            <Tabs
                                value={activeItineraryTab}
                                onValueChange={switchItineraryTab}
                                className="mt-4 space-y-4"
                            >
                                <div className="overflow-x-auto pb-1">
                                    <TabsList className="inline-flex h-auto min-w-full justify-start gap-2 rounded-2xl bg-background/80 p-2">
                                        {form.data.itineraries.map(
                                            (itinerary) => (
                                                <TabsTrigger
                                                    key={itinerary.day_number}
                                                    value={`day-${itinerary.day_number}`}
                                                    className="shrink-0 rounded-xl px-4 py-2 text-sm"
                                                >
                                                    Hari {itinerary.day_number}
                                                </TabsTrigger>
                                            ),
                                        )}
                                    </TabsList>
                                </div>

                                {form.data.itineraries.map((itinerary) => (
                                    <TabsContent
                                        key={itinerary.day_number}
                                        value={`day-${itinerary.day_number}`}
                                        className="mt-0"
                                    >
                                        {isItineraryPanelLoading &&
                                        currentItineraryDay ===
                                            itinerary.day_number ? (
                                            <ItinerarySkeleton />
                                        ) : (
                                            <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            Hari{' '}
                                                            {
                                                                itinerary.day_number
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                                        Urutan tampil #
                                                        {itinerary.sort_order}
                                                    </div>
                                                </div>

                                                <div className="space-y-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            Activity itinerary
                                                        </p>
                                                    </div>

                                                    {activityOptions.length >
                                                    0 ? (
                                                        <div className="space-y-4">
                                                            {(() => {
                                                                const searchStateKey =
                                                                    itinerary.day_number;
                                                                const searchTerm =
                                                                    (
                                                                        itineraryActivitySearch[
                                                                            searchStateKey
                                                                        ] ?? ''
                                                                    )
                                                                        .trim()
                                                                        .toLowerCase();
                                                                const availableActivities =
                                                                    activityOptions.filter(
                                                                        (
                                                                            activity,
                                                                        ) => {
                                                                            if (
                                                                                itinerary.activity_ids.includes(
                                                                                    activity.id,
                                                                                )
                                                                            ) {
                                                                                return false;
                                                                            }

                                                                            if (
                                                                                searchTerm ===
                                                                                ''
                                                                            ) {
                                                                                return true;
                                                                            }

                                                                            const searchableText =
                                                                                [
                                                                                    activity.code,
                                                                                    localizedFieldValue(
                                                                                        activity.name,
                                                                                        'id',
                                                                                    ),
                                                                                    localizedFieldValue(
                                                                                        activity.name,
                                                                                        'en',
                                                                                    ),
                                                                                    localizedFieldValue(
                                                                                        activity.description,
                                                                                        'id',
                                                                                    ),
                                                                                    localizedFieldValue(
                                                                                        activity.description,
                                                                                        'en',
                                                                                    ),
                                                                                ]
                                                                                    .filter(
                                                                                        Boolean,
                                                                                    )
                                                                                    .join(
                                                                                        ' ',
                                                                                    )
                                                                                    .toLowerCase();

                                                                            return searchableText.includes(
                                                                                searchTerm,
                                                                            );
                                                                        },
                                                                    );

                                                                return (
                                                                    <>
                                                                        <Field label="Pilih Activity">
                                                                            <Select
                                                                                key={`activity-select-${itinerary.day_number}-${itinerary.activity_ids.join('-')}`}
                                                                                onOpenChange={(
                                                                                    open,
                                                                                ) => {
                                                                                    if (
                                                                                        !open
                                                                                    ) {
                                                                                        setItineraryActivitySearch(
                                                                                            (
                                                                                                current,
                                                                                            ) => ({
                                                                                                ...current,
                                                                                                [searchStateKey]:
                                                                                                    '',
                                                                                            }),
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                onValueChange={(
                                                                                    value,
                                                                                ) => {
                                                                                    const selectedActivityId =
                                                                                        Number(
                                                                                            value,
                                                                                        );

                                                                                    if (
                                                                                        itinerary.activity_ids.includes(
                                                                                            selectedActivityId,
                                                                                        )
                                                                                    ) {
                                                                                        return;
                                                                                    }

                                                                                    updateItineraryActivities(
                                                                                        itinerary.day_number,
                                                                                        [
                                                                                            ...itinerary.activity_ids,
                                                                                            selectedActivityId,
                                                                                        ],
                                                                                    );
                                                                                    setItineraryActivitySearch(
                                                                                        (
                                                                                            current,
                                                                                        ) => ({
                                                                                            ...current,
                                                                                            [searchStateKey]:
                                                                                                '',
                                                                                        }),
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Tambah activity itinerary" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <div className="border-b border-border p-2">
                                                                                        <Input
                                                                                            value={
                                                                                                itineraryActivitySearch[
                                                                                                    searchStateKey
                                                                                                ] ??
                                                                                                ''
                                                                                            }
                                                                                            onChange={(
                                                                                                event,
                                                                                            ) =>
                                                                                                setItineraryActivitySearch(
                                                                                                    (
                                                                                                        current,
                                                                                                    ) => ({
                                                                                                        ...current,
                                                                                                        [searchStateKey]:
                                                                                                            event
                                                                                                                .target
                                                                                                                .value,
                                                                                                    }),
                                                                                                )
                                                                                            }
                                                                                            onKeyDown={(
                                                                                                event,
                                                                                            ) => {
                                                                                                event.stopPropagation();
                                                                                            }}
                                                                                            placeholder="Cari activity..."
                                                                                            className="h-8"
                                                                                        />
                                                                                    </div>
                                                                                    {availableActivities.length >
                                                                                    0 ? (
                                                                                        availableActivities.map(
                                                                                            (
                                                                                                activity,
                                                                                            ) => (
                                                                                                <SelectItem
                                                                                                    key={
                                                                                                        activity.id
                                                                                                    }
                                                                                                    value={String(
                                                                                                        activity.id,
                                                                                                    )}
                                                                                                >
                                                                                                    {localizedFieldValue(
                                                                                                        activity.name,
                                                                                                        locale,
                                                                                                        activity.code,
                                                                                                    )}
                                                                                                </SelectItem>
                                                                                            ),
                                                                                        )
                                                                                    ) : (
                                                                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                                                                            Tidak
                                                                                            ada
                                                                                            activity
                                                                                            yang
                                                                                            cocok.
                                                                                        </div>
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </Field>
                                                                    </>
                                                                );
                                                            })()}

                                                            {itinerary
                                                                .activity_ids
                                                                .length > 0 ? (
                                                                <div className="rounded-2xl border bg-background p-4">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {activityOptions
                                                                            .filter(
                                                                                (
                                                                                    activity,
                                                                                ) =>
                                                                                    itinerary.activity_ids.includes(
                                                                                        activity.id,
                                                                                    ),
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    activity,
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            activity.id
                                                                                        }
                                                                                        className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                                                                                    >
                                                                                        {localizedFieldValue(
                                                                                            activity.name,
                                                                                            locale,
                                                                                            activity.code,
                                                                                        )}
                                                                                        <button
                                                                                            type="button"
                                                                                            className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] transition hover:bg-white/25"
                                                                                            onClick={() =>
                                                                                                updateItineraryActivities(
                                                                                                    itinerary.day_number,
                                                                                                    itinerary.activity_ids.filter(
                                                                                                        (
                                                                                                            selectedId,
                                                                                                        ) =>
                                                                                                            selectedId !==
                                                                                                            activity.id,
                                                                                                    ),
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            Hapus
                                                                                        </button>
                                                                                    </span>
                                                                                ),
                                                                            )}
                                                                    </div>
                                                                    <div className="mt-3 space-y-3">
                                                                        {activityOptions
                                                                            .filter(
                                                                                (
                                                                                    activity,
                                                                                ) =>
                                                                                    itinerary.activity_ids.includes(
                                                                                        activity.id,
                                                                                    ),
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    activity,
                                                                                ) => (
                                                                                    <div
                                                                                        key={`preview-${activity.id}`}
                                                                                        className="rounded-xl border border-border bg-muted/20 p-3"
                                                                                    >
                                                                                        <p className="text-sm font-semibold text-foreground">
                                                                                            {localizedFieldValue(
                                                                                                activity.name,
                                                                                                locale,
                                                                                                activity.code,
                                                                                            )}
                                                                                        </p>
                                                                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                                                            {localizedFieldValue(
                                                                                                activity.description,
                                                                                                locale,
                                                                                                'Belum ada deskripsi activity.',
                                                                                            )}
                                                                                        </p>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center text-xs text-muted-foreground">
                                                                    Belum ada
                                                                    activity
                                                                    yang dipilih
                                                                    untuk hari
                                                                    ini.
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center text-xs text-muted-foreground">
                                                            Belum ada activity
                                                            aktif. Tambahkan
                                                            dulu lewat submenu
                                                            Product Management
                                                            &gt; Activities.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end border-t pt-4">
                    <Button
                        type="submit"
                        disabled={
                            form.processing ||
                            isSubmittingPackage ||
                            isUploadingDraftImages
                        }
                        className="min-w-32"
                    >
                        {form.processing || isSubmittingPackage ? (
                            <span className="flex items-center gap-2">
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Menyimpan...
                            </span>
                        ) : isHppEditor ? (
                            'Simpan Estimasi HPP'
                        ) : isEdit ? (
                            'Simpan Perubahan'
                        ) : (
                            'Tambah Package'
                        )}
                    </Button>
                </div>
            </fieldset>
        </form>
    );
}
