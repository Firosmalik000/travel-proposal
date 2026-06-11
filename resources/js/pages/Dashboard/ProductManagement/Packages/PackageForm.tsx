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
import {
    normalizePackageContent,
    packageHighlightIconMap,
    packageHighlightIconOptions,
    type PackageHighlightItem,
} from '@/lib/package-highlights';
import packages from '@/routes/packages';
import { router, useForm } from '@inertiajs/react';
import {
    BookOpenText,
    Camera,
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
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ProductSelector } from './ProductSelector';
import type {
    ActivityOption,
    Itinerary,
    ItineraryInput,
    Package,
    PackageFormData,
    ProductOption,
} from './types';
import { packageImageMimeTypes } from './types';

type Props = {
    pkg: Package | null;
    productOptions: ProductOption[];
    activityOptions: ActivityOption[];
    packageImageUploadMaxKilobytes: number;
    locale: 'id' | 'en';
    onSuccess: () => void;
};

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
        is_featured: pkg?.is_featured ?? false,
        is_active: pkg?.is_active ?? true,
    };
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

function toLines(value: unknown): string {
    if (Array.isArray(value)) {
        return value.join('\n');
    }

    if (typeof value === 'string') {
        return value;
    }

    return '';
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
    activityOptions,
    packageImageUploadMaxKilobytes,
    locale,
    onSuccess,
}: Props) {
    const initialFormData = buildFormData(pkg);
    const isEdit = pkg !== null;
    const imageInputRef = useRef<HTMLInputElement>(null);
    const itineraryLoadingTimeoutRef = useRef<number | null>(null);

    const [existingImages, setExistingImages] = useState<string[]>(
        pkg?.images ?? [],
    );

    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isDragOverGallery, setIsDragOverGallery] = useState(false);
    const [draggedGalleryItemKey, setDraggedGalleryItemKey] = useState<
        string | null
    >(null);
    const [galleryDropTargetKey, setGalleryDropTargetKey] = useState<
        string | null
    >(null);
    const [activeItineraryTab, setActiveItineraryTab] = useState('day-1');
    const [itineraryActivitySearch, setItineraryActivitySearch] = useState<
        Record<number, string>
    >({});
    const [isItineraryPanelLoading, setIsItineraryPanelLoading] =
        useState(false);
    const form = useForm<PackageFormData>(initialFormData);
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
        };
    }, []);

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

    function appendSelectedImages(selectedFiles: File[]) {
        if (selectedFiles.length === 0) {
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

        const newImages = [...form.data.images, ...selectedFiles];
        form.clearErrors('images');
        form.setData('images', newImages);

        const newPreviewUrls = selectedFiles.map((file) =>
            URL.createObjectURL(file),
        );
        setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files || []);
        appendSelectedImages(selectedFiles);

        // Reset input value so same file can be selected again
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    }

    function handleGalleryDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragOverGallery(false);

        const selectedFiles = Array.from(event.dataTransfer.files || []);
        appendSelectedImages(selectedFiles);
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

    function removeExistingImage(index: number) {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));

        // Mark for deletion on backend if needed, but for now we'll just handle it by what's NOT in the payload
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

    function submit(event: React.FormEvent) {
        event.preventDefault();

        const submitUrl = isEdit
            ? packages.update(pkg.id).url
            : packages.store().url;
        const basePrice = Number(form.data.original_price) || 0;
        const discountPercentValue = Number(form.data.discount_percent) || 0;
        const hasDiscount = basePrice > 0 && discountPercentValue > 0;
        const calculatedSellingPrice = hasDiscount
            ? Math.round(basePrice * (1 - discountPercentValue / 100))
            : basePrice;

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
        formData.append('duration_days', String(form.data.duration_days));
        formData.append('price', String(calculatedSellingPrice));
        formData.append('original_price', hasDiscount ? String(basePrice) : '');
        formData.append('discount_label', form.data.discount_label ?? '');
        formData.append('discount_ends_at', form.data.discount_ends_at ?? '');
        formData.append('currency', form.data.currency);
        formData.append('summary[id]', form.data['summary.id']);
        formData.append('summary[en]', form.data['summary.en']);
        formData.append('content', JSON.stringify(form.data.content));
        formData.append('itineraries', JSON.stringify(form.data.itineraries));
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
                        isEdit ? 'Package diperbarui.' : 'Package ditambahkan.',
                    );
                    onSuccess();
                },
                onError: (errors) => {
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
            });
        } catch (error) {
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
    const savingsAmount = hasDiscount ? basePrice - sellingPrice : 0;
    const generatedCodePreview = buildPackageCodePreview(
        form.data['name.id'] || form.data['name.en'],
        Number(form.data.duration_days) || 0,
    );
    const currentItineraryDay = Number(activeItineraryTab.replace('day-', ''));

    const contentObject =
        form.data.content && typeof form.data.content === 'object'
            ? (form.data.content as Record<string, unknown>)
            : {};
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

    return (
        <form onSubmit={submit}>
            <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 sm:grid-cols-6">
                    <TabsTrigger value="info" className="gap-1.5 text-xs">
                        <Info className="h-3.5 w-3.5" />
                        Info
                    </TabsTrigger>
                    <TabsTrigger value="gallery" className="gap-1.5 text-xs">
                        <Camera className="h-3.5 w-3.5" />
                        Gallery
                    </TabsTrigger>
                    <TabsTrigger value="harga" className="gap-1.5 text-xs">
                        <DollarSign className="h-3.5 w-3.5" />
                        Harga
                    </TabsTrigger>
                    <TabsTrigger value="konten" className="gap-1.5 text-xs">
                        <FileText className="h-3.5 w-3.5" />
                        Konten
                    </TabsTrigger>
                    <TabsTrigger value="itinerary" className="gap-1.5 text-xs">
                        <BookOpenText className="h-3.5 w-3.5" />
                        Itinerary
                    </TabsTrigger>
                    <TabsTrigger value="produk" className="gap-1.5 text-xs">
                        <Layers className="h-3.5 w-3.5" />
                        Produk
                    </TabsTrigger>
                </TabsList>

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
                        <Field label="Nama Package *" error={errors['name.id']}>
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
                                        <SelectItem value="vip">VIP</SelectItem>
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
                                        event.currentTarget.contains(nextTarget)
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
                                        <p className="text-xs text-muted-foreground">
                                            Bisa pilih banyak file sekaligus
                                            atau klik tombol tambah foto.
                                        </p>
                                        <p className="text-[11px] font-medium tracking-[0.18em] text-primary/80 uppercase">
                                            Cover mengikuti urutan foto paling
                                            pertama
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
                                            setDraggedGalleryItemKey(item.key);
                                            setGalleryDropTargetKey(item.key);
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
                                            draggedGalleryItemKey === item.key
                                                ? 'scale-[0.98] opacity-70 ring-2 ring-primary/30'
                                                : '',
                                            galleryDropTargetKey === item.key &&
                                            draggedGalleryItemKey !== item.key
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
                                            {index === 0 ? 'Cover' : 'Gallery'}
                                            {item.kind === 'new' ? ' Baru' : ''}
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
                                label="Harga Asli (IDR) *"
                                error={errors.original_price || errors.price}
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
                                            const nextDiscountPercent = event
                                                .target.value
                                                ? Math.min(
                                                      99,
                                                      Math.max(
                                                          0,
                                                          Number(
                                                              event.target
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

                        <div className="rounded-2xl border border-border bg-muted/20 p-4">
                            <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                Harga Jual Otomatis
                            </p>
                            <div className="mt-2 flex flex-wrap items-end gap-3">
                                <p className="text-3xl font-bold text-primary">
                                    Rp {sellingPrice.toLocaleString('id-ID')}
                                </p>
                                {hasDiscount ? (
                                    <p className="text-sm text-muted-foreground line-through">
                                        Rp {basePrice.toLocaleString('id-ID')}
                                    </p>
                                ) : null}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {hasDiscount
                                    ? `Diskon ${discountPercent}% aktif. Hemat Rp ${savingsAmount.toLocaleString('id-ID')}.`
                                    : 'Tidak ada diskon. Harga asli dipakai sebagai harga jual utama.'}
                            </p>
                        </div>

                        {hasDiscount ? (
                            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                                <div className="rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white">
                                    -{discountPercent}%
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                        Diskon aktif
                                    </p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                        Hemat Rp{' '}
                                        {savingsAmount.toLocaleString('id-ID')}
                                    </p>
                                </div>
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
                            <Input
                                value={form.data.currency}
                                onChange={(event) =>
                                    form.setData('currency', event.target.value)
                                }
                                maxLength={3}
                                className="w-24 font-mono uppercase"
                            />
                        </Field>
                    </FieldGroup>
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
                                    {packageHighlightPresets.map((preset) => (
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
                                    ))}
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
                                                                {highlight.label
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
                                                                highlight.label
                                                                    .id
                                                            }
                                                            onChange={(event) =>
                                                                updatePackageHighlight(
                                                                    highlight.id,
                                                                    'label',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Contoh: Maskapai, Hotel, Badge, Periode"
                                                        />
                                                    </Field>

                                                    <Field label="Isi Highlight">
                                                        <Input
                                                            value={
                                                                highlight.value
                                                                    .id
                                                            }
                                                            onChange={(event) =>
                                                                updatePackageHighlight(
                                                                    highlight.id,
                                                                    'value',
                                                                    event.target
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
                                        form.data.content?.included as Record<
                                            string,
                                            unknown
                                        >
                                    )?.id,
                                )}
                                onChange={(event) => {
                                    const lines =
                                        event.target.value.split('\n');
                                    const existingIncluded =
                                        (form.data.content?.included as Record<
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
                                        form.data.content?.excluded as Record<
                                            string,
                                            unknown
                                        >
                                    )?.id,
                                )}
                                onChange={(event) => {
                                    const lines =
                                        event.target.value.split('\n');
                                    const existingExcluded =
                                        (form.data.content?.excluded as Record<
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
                                placeholder={'Pengeluaran pribadi\nOleh-oleh'}
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
                                    {form.data.itineraries.map((itinerary) => (
                                        <TabsTrigger
                                            key={itinerary.day_number}
                                            value={`day-${itinerary.day_number}`}
                                            className="shrink-0 rounded-xl px-4 py-2 text-sm"
                                        >
                                            Hari {itinerary.day_number}
                                        </TabsTrigger>
                                    ))}
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
                                                        {itinerary.day_number}
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

                                                {activityOptions.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {(() => {
                                                            const searchStateKey =
                                                                itinerary.day_number;
                                                            const searchTerm = (
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

                                                        {itinerary.activity_ids
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
                                                                activity yang
                                                                dipilih untuk
                                                                hari ini.
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-border bg-background px-4 py-5 text-center text-xs text-muted-foreground">
                                                        Belum ada activity
                                                        aktif. Tambahkan dulu
                                                        lewat submenu Product
                                                        Management &gt;
                                                        Activities.
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

                <TabsContent value="produk" className="mt-4">
                    <SectionHeader icon={Layers} title="Produk dalam Package" />
                    <ProductSelector
                        options={productOptions}
                        selected={form.data.product_ids}
                        locale={locale}
                        onChange={(productIds) =>
                            form.setData('product_ids', productIds)
                        }
                    />
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
                <p className="text-xs text-muted-foreground">
                    {form.isDirty ? 'Ada perubahan yang belum disimpan' : ''}
                </p>
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="min-w-32"
                >
                    {form.processing ? (
                        <span className="flex items-center gap-2">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Menyimpan...
                        </span>
                    ) : isEdit ? (
                        'Simpan Perubahan'
                    ) : (
                        'Tambah Package'
                    )}
                </Button>
            </div>
        </form>
    );
}
