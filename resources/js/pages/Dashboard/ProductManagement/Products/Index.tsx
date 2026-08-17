import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Eye,
    MoreHorizontal,
    Plus,
    Search,
    SquarePen,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import ProductCategoryHotel from './ProductCategoryHotel';

type ProductItem = {
    id: number;
    code: string;
    slug: string;
    name: string;
    product_type: string;
    description: string | null;
    price: number | null;
    currency: string | null;
    currency_rate_snapshot?: {
        rate_to_idr: number;
        source: string;
        fetched_at: string | null;
    } | null;
    hotel_info?: {
        hotel_id: number;
        city: string;
        country: string;
        currency: string;
        pricing: Array<{
            room_type: string;
            period_start: string | null;
            period_end: string | null;
            price: number | string | null;
        }>;
    } | null;
    is_active: boolean;
};

type Props = {
    products: {
        data: ProductItem[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    filters: {
        search: string;
        product_type: string;
    };
    product_type_options: Array<{ value: string; label: string }>;
    product_category_hotel: {
        hotels: {
            data: Array<{
                id: number;
                code: string;
                name: string;
                description: string | null;
                currency: string;
                is_active: boolean;
                country_id: number;
                city_id: number;
                country_name: string;
                city_name: string;
                product_code: string | null;
                prices: Array<
                    {
                        room_type_id: number;
                        period_start: string;
                        period_end: string;
                        price: number;
                        broker_key?: string;
                        broker_name?: string;
                    } & { room_type_name: string }
                >;
            }>;
            total?: number;
            links: Array<{
                url: string | null;
                label: string;
                active: boolean;
            }>;
            from?: number | null;
        };
        filters: { search: string; city_id: string; status: string };
        cityStats: Array<{
            city_id: number;
            city_name: string;
            total_hotels: number;
        }>;
        countryOptions: Array<{ id: number; name: string }>;
        cityOptions: Array<{
            id: number;
            country_id: number;
            name: string;
            country_name: string;
        }>;
        roomTypeOptions: Array<{ id: number; name: string }>;
        currencyOptions: CurrencyOption[];
    };
    hotel_options: Array<{
        id: number;
        product_id: number;
        name: string;
        code: string | null;
        description: string | null;
        product_code: string | null;
        country_id: number;
        city_id: number;
        country: string | null;
        city: string | null;
        currency: string | null;
        is_active: boolean;
        pricing: Array<{
            id: number;
            broker_key: string | null;
            broker_name: string | null;
            room_type_id: number;
            room_type: string;
            period_start: string | null;
            period_end: string | null;
            price: number | string | null;
        }>;
    }>;
    hotel_country_options: Array<{ id: number; name: string }>;
    hotel_city_options: Array<{
        id: number;
        country_id: number;
        name: string;
        country_name: string;
    }>;
    hotel_room_type_options: Array<{ id: number; name: string }>;
    hotel_currency_options: CurrencyOption[];
};

type CurrencyOption = {
    code: string;
    name: string;
    conversion_rate: number;
    live_conversion_rate: number;
    rate_source: string;
    rate_fetched_at: string | null;
    is_live: boolean;
};

type ProductFormData = {
    name: string;
    product_type: string;
    description: string;
    price: string;
    currency: string;
    currency_rate_to_idr: string;
    source_hotel_id: string;
    is_active: boolean;
};

function buildFormData(
    product: ProductItem | null,
    defaultCurrency: string,
): ProductFormData {
    return {
        name: product?.name ?? '',
        product_type: product?.product_type ?? '',
        description: product?.description ?? '',
        price:
            product?.price !== null && product?.price !== undefined
                ? String(product.price)
                : '',
        currency:
            product?.currency ??
            product?.hotel_info?.currency ??
            defaultCurrency,
        currency_rate_to_idr:
            product?.currency_rate_snapshot?.rate_to_idr !== undefined
                ? String(product.currency_rate_snapshot.rate_to_idr)
                : '',
        source_hotel_id:
            product?.hotel_info?.hotel_id && product.hotel_info.hotel_id > 0
                ? String(product.hotel_info.hotel_id)
                : '',
        is_active: product?.is_active ?? true,
    };
}

function generateSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function generateProductCode(value: string): string {
    const normalized = value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40);

    return `PRD-${normalized || 'ITEM'}`;
}

function formatCurrencyAmount(
    value: number | null,
    currency: string | null = 'IDR',
): string {
    if (value === null || Number.isNaN(value)) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency || 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function resolveProductCurrency(product: ProductItem | null): string {
    if (!product) {
        return 'IDR';
    }

    return product.currency ?? product.hotel_info?.currency ?? 'IDR';
}

function isHotelProductType(productType: string): boolean {
    const normalized = productType.toLowerCase();

    return (
        normalized.includes('hotel') ||
        normalized.includes('akomodasi') ||
        normalized.includes('accommodation')
    );
}

function resolveHotelOption(
    product: ProductItem | null,
    hotelOptions: Props['hotel_options'],
): Props['hotel_options'][number] | null {
    if (!product) {
        return null;
    }

    const fromHotelId = product.hotel_info?.hotel_id
        ? hotelOptions.find(
              (hotel) => hotel.id === product.hotel_info?.hotel_id,
          )
        : null;

    if (fromHotelId) {
        return fromHotelId;
    }

    return (
        hotelOptions.find((hotel) => hotel.product_id === product.id) ?? null
    );
}

function buildHotelPricingMatrix(
    pricing: Array<{
        room_type: string;
        period_start: string | null;
        period_end: string | null;
        price: number | string | null;
    }>,
): {
    roomTypes: string[];
    periods: Array<{
        key: string;
        label: string;
        pricesByRoomType: Record<string, number | string | null>;
    }>;
} {
    const roomTypes = Array.from(
        new Set(
            pricing
                .map((row) => row.room_type.trim())
                .filter((roomType) => roomType !== ''),
        ),
    );

    const periodsMap = new Map<
        string,
        {
            key: string;
            label: string;
            pricesByRoomType: Record<string, number | string | null>;
        }
    >();

    pricing.forEach((row) => {
        const start = row.period_start ?? '-';
        const end = row.period_end ?? '-';
        const key = `${start}|${end}`;

        if (!periodsMap.has(key)) {
            periodsMap.set(key, {
                key,
                label: `${start} - ${end}`,
                pricesByRoomType: {},
            });
        }

        const roomType = row.room_type.trim();
        if (roomType !== '') {
            periodsMap.get(key)!.pricesByRoomType[roomType] = row.price;
        }
    });

    return {
        roomTypes,
        periods: Array.from(periodsMap.values()),
    };
}

function DetailField({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5">
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 text-sm text-foreground">{value || '-'}</p>
        </div>
    );
}

function ProductTableRow({
    index,
    product,
    onView,
    onEdit,
    onDelete,
    selectionMode,
    isSelected,
    onToggleSelected,
    canView,
    canEdit,
    canDelete,
    hotelCanView,
    hotelCanEdit,
    hotelCanDelete,
}: {
    index: number;
    product: ProductItem;
    onView: (product: ProductItem) => void;
    onEdit: (product: ProductItem) => void;
    onDelete: (product: ProductItem) => void;
    selectionMode: boolean;
    isSelected: boolean;
    onToggleSelected: (productId: number) => void;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    hotelCanView: boolean;
    hotelCanEdit: boolean;
    hotelCanDelete: boolean;
}) {
    const isHotelProduct = isHotelProductType(product.product_type);
    const showActions = isHotelProduct
        ? canView ||
          canEdit ||
          canDelete ||
          hotelCanView ||
          hotelCanEdit ||
          hotelCanDelete
        : canView || canEdit || canDelete;

    return (
        <tr
            key={product.id}
            className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/20"
        >
            <td className="px-4 py-4 text-center text-sm text-muted-foreground">
                {index}
            </td>
            {selectionMode ? (
                <td className="px-4 py-4 text-center">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelected(product.id)}
                        aria-label={`Pilih ${product.name || product.code}`}
                    />
                </td>
            ) : null}
            <td className="px-4 py-4 text-right">
                {showActions ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="ml-auto"
                                aria-label={`Aksi ${product.name || product.code}`}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canView || (isHotelProduct && hotelCanView) ? (
                                <DropdownMenuItem
                                    onClick={() => onView(product)}
                                >
                                    <Eye className="h-4 w-4" />
                                    Detail
                                </DropdownMenuItem>
                            ) : null}
                            {canEdit || (isHotelProduct && hotelCanEdit) ? (
                                <DropdownMenuItem
                                    onClick={() => onEdit(product)}
                                >
                                    <SquarePen className="h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            ) : null}
                            {canDelete || (isHotelProduct && hotelCanDelete) ? (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => onDelete(product)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                </DropdownMenuItem>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
            </td>
            <td className="px-4 py-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                            {product.name || product.code}
                        </p>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                            {product.code}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {product.product_type || '-'}
                </span>
            </td>
            <td className="px-4 py-4 text-sm font-medium text-foreground">
                {formatCurrencyAmount(
                    product.price,
                    resolveProductCurrency(product),
                )}
            </td>
            <td className="px-4 py-4">
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                    }`}
                >
                    {product.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
            </td>
        </tr>
    );
}

export default function ProductsIndex({
    products,
    filters,
    product_type_options: productTypeOptions,
    product_category_hotel: productCategoryHotel,
    hotel_options: hotelOptions,
    hotel_currency_options: hotelCurrencyOptions,
}: Props) {
    const { can: canProduct } = usePermission('product');
    const canCreate = canProduct('create');
    const canView = canProduct('view');
    const canEdit = canProduct('edit');
    const canDelete = canProduct('delete');
    const canViewHotel = canView;
    const canEditHotel = canEdit;
    const canDeleteHotel = canDelete;
    const [search, setSearch] = useState(filters.search);
    const [productType, setProductType] = useState(
        filters.product_type || 'hotel',
    );
    const [editingProduct, setEditingProduct] = useState<
        ProductItem | null | 'new'
    >(null);
    const [viewingProduct, setViewingProduct] = useState<ProductItem | null>(
        null,
    );
    const [activeFormTab, setActiveFormTab] = useState('general');
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
    const defaultHotelCurrency = hotelCurrencyOptions[0]?.code ?? 'IDR';
    const formProductTypeOptions = productTypeOptions;

    const form = useForm<ProductFormData>(
        buildFormData(null, defaultHotelCurrency),
    );
    const selectedCurrency = hotelCurrencyOptions.find(
        (currency) => currency.code === form.data.currency,
    );
    const selectedLiveRate = Number(
        selectedCurrency?.live_conversion_rate ??
            selectedCurrency?.conversion_rate ??
            0,
    );
    const generatedSlug = useMemo(
        () => generateSlug(form.data.name),
        [form.data.name],
    );
    const generatedCode = useMemo(
        () => generateProductCode(form.data.name),
        [form.data.name],
    );
    const isEditingExistingHotelProduct = false;
    const selectedHotelForDetail = useMemo(
        () => resolveHotelOption(viewingProduct, hotelOptions),
        [viewingProduct, hotelOptions],
    );
    const hotelPricingMatrix = useMemo(
        () =>
            buildHotelPricingMatrix(viewingProduct?.hotel_info?.pricing ?? []),
        [viewingProduct],
    );
    const activeProductType = productType || 'hotel';
    const canShowCreateButton = activeProductType !== 'hotel' && canCreate;

    function navigateToFilters(nextFilters: {
        search: string;
        product_type: string;
    }) {
        router.get('/admin/product-management/products', nextFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function submitFilters() {
        clearBulkSelection();
        navigateToFilters({ search, product_type: activeProductType });
    }

    function resetFilters() {
        setSearch('');
        setProductType('hotel');
        clearBulkSelection();
        navigateToFilters({ search: '', product_type: 'hotel' });
    }

    function selectProductType(nextProductType: string) {
        setProductType(nextProductType);
        setBulkSelectMode(false);
        setSelectedProductIds([]);
        navigateToFilters({ search, product_type: nextProductType });
    }

    function clearBulkSelection() {
        setBulkSelectMode(false);
        setSelectedProductIds([]);
    }

    function toggleSelectedProduct(productId: number) {
        setSelectedProductIds((current) =>
            current.includes(productId)
                ? current.filter((selectedId) => selectedId !== productId)
                : [...current, productId],
        );
    }

    function submitBulkDeleteProducts() {
        if (selectedProductIds.length === 0) {
            return;
        }

        if (
            !window.confirm(
                `Hapus ${selectedProductIds.length} produk terpilih?`,
            )
        ) {
            return;
        }

        router.post(
            '/admin/website-management/content/resources/products/bulk-delete',
            {
                ids: selectedProductIds,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Produk terpilih berhasil dihapus.');
                    clearBulkSelection();
                },
            },
        );
    }

    function openCreateSheet() {
        if (!canCreate) {
            return;
        }

        form.setData({
            ...buildFormData(null, defaultHotelCurrency),
            product_type: activeProductType,
            currency_rate_to_idr: String(
                hotelCurrencyOptions.find(
                    (currency) => currency.code === defaultHotelCurrency,
                )?.live_conversion_rate ?? 1,
            ),
        });
        form.clearErrors();
        setActiveFormTab('general');
        setEditingProduct('new');
    }

    function openEditSheet(product: ProductItem) {
        if (!canEdit) {
            return;
        }

        const baseForm = buildFormData(product, defaultHotelCurrency);
        const sourceHotel = resolveHotelOption(product, hotelOptions);
        form.setData({
            ...baseForm,
            source_hotel_id:
                baseForm.source_hotel_id ||
                (sourceHotel ? String(sourceHotel.id) : ''),
        });
        form.clearErrors();
        setActiveFormTab('general');
        setEditingProduct(product);
    }

    function openDetailSheet(product: ProductItem) {
        if (isHotelProductType(product.product_type)) {
            if (!canViewHotel) {
                return;
            }
        } else if (!canView) {
            return;
        }

        setViewingProduct(product);
    }

    function closeSheet() {
        setEditingProduct(null);
        form.reset();
        form.clearErrors();
        setActiveFormTab('general');
    }

    function closeDetailSheet() {
        setViewingProduct(null);
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();

        const parsedPrice = Number(form.data.price);

        if (
            form.data.price.trim() === '' ||
            Number.isNaN(parsedPrice) ||
            parsedPrice < 0
        ) {
            toast.error('Harga wajib diisi dengan angka valid.');
            return;
        }

        const payload = {
            payload: {
                code:
                    editingProduct === 'new'
                        ? generatedCode
                        : (editingProduct?.code ?? generatedCode),
                slug:
                    editingProduct === 'new'
                        ? generatedSlug
                        : (editingProduct?.slug ?? generatedSlug),
                name: form.data.name,
                product_type: form.data.product_type,
                description: form.data.description,
                content: {
                    price: parsedPrice,
                    currency: form.data.currency || defaultHotelCurrency,
                    currency_rate_to_idr: Number(
                        form.data.currency_rate_to_idr ||
                            (form.data.currency === 'IDR' ? 1 : 0),
                    ),
                },
                is_active: form.data.is_active,
            },
        };

        if (editingProduct === 'new') {
            router.post(
                '/admin/website-management/content/resources/products',
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Produk berhasil ditambahkan.');
                        closeSheet();
                    },
                },
            );

            return;
        }

        if (editingProduct) {
            router.patch(
                `/admin/website-management/content/resources/products/${editingProduct.id}`,
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Produk berhasil diperbarui.');
                        closeSheet();
                    },
                },
            );
        }
    }

    function destroyProduct(product: ProductItem) {
        if (!canDelete) {
            return;
        }

        if (
            !window.confirm(`Hapus produk "${product.name || product.code}"?`)
        ) {
            return;
        }

        router.delete(
            `/admin/website-management/content/resources/products/${product.id}`,
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Produk berhasil dihapus.'),
            },
        );
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Products',
                    href: '/admin/product-management/products',
                },
            ]}
        >
            <Head title="Products" />

            <div className="space-y-2 px-2 py-2 md:px-3 md:py-3">
                <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card p-2 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Products
                        </h1>
                    </div>
                    {canShowCreateButton ? (
                        <Button
                            type="button"
                            onClick={openCreateSheet}
                            className="h-10 shrink-0 rounded-xl px-4"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {activeProductType === 'hotel'
                                ? 'Tambah Hotel'
                                : 'Tambah Produk'}
                        </Button>
                    ) : null}
                </div>

                <div className="rounded-xl border border-border/40 bg-card p-2 shadow-sm">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div>
                            <Label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                Cari Produk
                            </Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama atau kode produk..."
                                    className="h-10 rounded-lg pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetFilters}
                                className="h-9 rounded-lg"
                            >
                                Reset
                            </Button>
                            <Button
                                type="button"
                                onClick={submitFilters}
                                className="h-9 rounded-lg"
                            >
                                Terapkan
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-border/40 bg-card p-2 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <Label className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                Kategori
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Pilih kategori untuk memfilter data produk.
                            </p>
                        </div>
                        <div className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                            Default: Hotel
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto pb-1">
                        <div className="flex min-w-max flex-nowrap gap-2">
                            {productTypeOptions.map((opt) => {
                                const isActive =
                                    activeProductType === opt.value;

                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            selectProductType(opt.value)
                                        }
                                        className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                                            isActive
                                                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {activeProductType === 'hotel' ? (
                    <ProductCategoryHotel
                        {...productCategoryHotel}
                        currencyOptions={hotelCurrencyOptions}
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border/40 bg-muted/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-sm text-muted-foreground">
                                Total data: {products.total}
                            </span>
                            {canDelete ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    {bulkSelectMode ? (
                                        <>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {selectedProductIds.length} item
                                                dipilih
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={clearBulkSelection}
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={
                                                    submitBulkDeleteProducts
                                                }
                                                disabled={
                                                    selectedProductIds.length ===
                                                    0
                                                }
                                            >
                                                Hapus Terpilih
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setBulkSelectMode(true)
                                            }
                                        >
                                            Pilih Data
                                        </Button>
                                    )}
                                </div>
                            ) : null}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-left text-sm">
                                <thead className="bg-muted/35 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    <tr>
                                        <th className="w-16 px-4 py-3 text-center">
                                            No
                                        </th>
                                        {bulkSelectMode ? (
                                            <th className="w-14 px-4 py-3 text-center">
                                                Pilih
                                            </th>
                                        ) : null}
                                        <th className="w-20 px-4 py-3 text-right">
                                            Aksi
                                        </th>
                                        <th className="px-4 py-3">Produk</th>
                                        <th className="px-4 py-3">Kategori</th>
                                        <th className="px-4 py-3">Harga</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.length > 0 ? (
                                        products.data.map((product, index) => (
                                            <ProductTableRow
                                                key={product.id}
                                                index={index + 1}
                                                product={product}
                                                onView={openDetailSheet}
                                                onEdit={openEditSheet}
                                                onDelete={destroyProduct}
                                                selectionMode={bulkSelectMode}
                                                isSelected={selectedProductIds.includes(
                                                    product.id,
                                                )}
                                                onToggleSelected={
                                                    toggleSelectedProduct
                                                }
                                                canView={canView}
                                                canEdit={canEdit}
                                                canDelete={canDelete}
                                                hotelCanView={canViewHotel}
                                                hotelCanEdit={canEditHotel}
                                                hotelCanDelete={canDeleteHotel}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={bulkSelectMode ? 7 : 6}
                                                className="px-4 py-10 text-center text-sm text-muted-foreground"
                                            >
                                                {filters.search ||
                                                (filters.product_type &&
                                                    filters.product_type !==
                                                        'hotel')
                                                    ? 'Produk tidak ditemukan.'
                                                    : 'Belum ada produk.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {products.links.length > 3 ? (
                            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/40 px-3 py-3">
                                {products.links.map((link, index) =>
                                    link.url ? (
                                        <Button
                                            key={`${link.label}-${index}`}
                                            type="button"
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                router.visit(link.url!)
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <Button
                                            key={`${link.label}-${index}`}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            <Sheet
                open={editingProduct !== null}
                onOpenChange={(open) => !open && closeSheet()}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-2xl"
                >
                    <SheetHeader>
                        <SheetTitle>
                            {editingProduct === 'new'
                                ? 'Tambah Produk'
                                : 'Edit Produk'}
                        </SheetTitle>
                    </SheetHeader>

                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="rounded-2xl border border-border/40 bg-card p-3 shadow-sm">
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-foreground">
                                    Detail Produk
                                </p>
                            </div>

                            <Tabs
                                value={activeFormTab}
                                onValueChange={setActiveFormTab}
                                className="space-y-4"
                            >
                                <TabsList>
                                    <TabsTrigger value="general">
                                        Informasi Umum
                                    </TabsTrigger>
                                    {isHotelProductType(
                                        form.data.product_type,
                                    ) ? (
                                        <TabsTrigger value="hotel">
                                            Informasi Hotel
                                        </TabsTrigger>
                                    ) : null}
                                </TabsList>

                                <TabsContent
                                    value="general"
                                    className="space-y-4"
                                >
                                    <div>
                                        <Label className="mb-1.5 block">
                                            Tipe Produk
                                        </Label>
                                        <Select
                                            value={form.data.product_type}
                                            disabled={
                                                isEditingExistingHotelProduct
                                            }
                                            onValueChange={(value) =>
                                                form.setData(
                                                    'product_type',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih tipe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formProductTypeOptions.map(
                                                    (opt) => (
                                                        <SelectItem
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="mb-1.5 block">
                                            Nama
                                        </Label>
                                        <Input
                                            value={form.data.name}
                                            readOnly={
                                                isEditingExistingHotelProduct
                                            }
                                            disabled={
                                                isEditingExistingHotelProduct
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Visa Umroh"
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-1.5 block">
                                            Deskripsi (opsional)
                                        </Label>
                                        <Textarea
                                            rows={3}
                                            value={form.data.description}
                                            readOnly={
                                                isEditingExistingHotelProduct
                                            }
                                            disabled={
                                                isEditingExistingHotelProduct
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Deskripsi singkat produk..."
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label className="mb-1.5 block">
                                                Harga
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={form.data.price}
                                                readOnly={
                                                    isEditingExistingHotelProduct
                                                }
                                                disabled={
                                                    isEditingExistingHotelProduct
                                                }
                                                onChange={(e) =>
                                                    form.setData(
                                                        'price',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="350000"
                                                required
                                            />
                                            {form.data.currency !== 'IDR' ? (
                                                <div className="mt-2 flex gap-2">
                                                    <Input
                                                        type="number"
                                                        min={0.000001}
                                                        step="any"
                                                        value={
                                                            form.data
                                                                .currency_rate_to_idr
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'currency_rate_to_idr',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Kurs ke IDR"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        disabled={
                                                            selectedLiveRate <=
                                                            0
                                                        }
                                                        onClick={() =>
                                                            form.setData(
                                                                'currency_rate_to_idr',
                                                                String(
                                                                    selectedLiveRate,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        Gunakan Kurs Live
                                                    </Button>
                                                </div>
                                            ) : null}
                                        </div>
                                        <div>
                                            <Label className="mb-1.5 block">
                                                Mata Uang
                                            </Label>
                                            <Select
                                                value={
                                                    form.data.currency || 'none'
                                                }
                                                onValueChange={(value) => {
                                                    const nextCurrency =
                                                        value === 'none'
                                                            ? defaultHotelCurrency
                                                            : value;
                                                    const nextRate =
                                                        hotelCurrencyOptions.find(
                                                            (currency) =>
                                                                currency.code ===
                                                                nextCurrency,
                                                        )
                                                            ?.live_conversion_rate ??
                                                        (nextCurrency === 'IDR'
                                                            ? 1
                                                            : 0);
                                                    form.setData((current) => ({
                                                        ...current,
                                                        currency: nextCurrency,
                                                        currency_rate_to_idr:
                                                            String(nextRate),
                                                    }));
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih mata uang" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        Pilih kurs
                                                    </SelectItem>
                                                    {hotelCurrencyOptions.map(
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
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 sm:mt-2">
                                            <Checkbox
                                                id="is_active_product"
                                                checked={form.data.is_active}
                                                disabled={
                                                    isEditingExistingHotelProduct
                                                }
                                                onCheckedChange={(checked) =>
                                                    form.setData(
                                                        'is_active',
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="is_active_product"
                                                className="cursor-pointer"
                                            >
                                                Aktif
                                            </Label>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="hotel"
                                    className="space-y-4"
                                >
                                    <div>
                                        <Label className="mb-1.5 block">
                                            Sumber Hotel (Master Hotel)
                                        </Label>
                                        <Select
                                            value={
                                                form.data.source_hotel_id ||
                                                'none'
                                            }
                                            disabled={
                                                isEditingExistingHotelProduct
                                            }
                                            onValueChange={(value) =>
                                                form.setData(
                                                    'source_hotel_id',
                                                    value === 'none'
                                                        ? ''
                                                        : value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih hotel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    Pilih hotel
                                                </SelectItem>
                                                {hotelOptions.map((hotel) => (
                                                    <SelectItem
                                                        key={hotel.id}
                                                        value={String(hotel.id)}
                                                    >
                                                        {hotel.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Informasi hotel mengikuti data hotel
                                        yang dipilih dan payload produk akan
                                        menyesuaikan struktur hotel.
                                    </p>
                                    {isEditingExistingHotelProduct ? (
                                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                            Produk kategori hotel tidak bisa
                                            diedit di sini. Silakan edit di
                                            bagian hotel.
                                        </p>
                                    ) : null}
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeSheet}
                                disabled={form.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    form.processing ||
                                    isEditingExistingHotelProduct
                                }
                            >
                                {form.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
            <Sheet
                open={viewingProduct !== null}
                onOpenChange={(open) => !open && closeDetailSheet()}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-2xl"
                >
                    <SheetHeader>
                        <SheetTitle>Detail Produk</SheetTitle>
                    </SheetHeader>

                    {viewingProduct ? (
                        <div className="mt-6 space-y-5">
                            <div className="rounded-2xl border border-border/40 bg-card p-3 shadow-sm">
                                {isHotelProductType(
                                    viewingProduct.product_type,
                                ) ? (
                                    <div className="space-y-4">
                                        <div className="rounded-xl border border-border/70 bg-muted/10 px-3 py-2.5">
                                            <p className="text-xs font-semibold text-foreground">
                                                Ringkasan Produk Hotel
                                            </p>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <DetailField
                                                label="Nama"
                                                value={viewingProduct.name}
                                            />
                                            <DetailField
                                                label="Tipe Produk"
                                                value={
                                                    viewingProduct.product_type
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {!isHotelProductType(
                                                viewingProduct.product_type,
                                            ) ? (
                                                <DetailField
                                                    label="Harga"
                                                    value={formatCurrencyAmount(
                                                        viewingProduct.price,
                                                        resolveProductCurrency(
                                                            viewingProduct,
                                                        ),
                                                    )}
                                                />
                                            ) : null}
                                            {!isHotelProductType(
                                                viewingProduct.product_type,
                                            ) ? (
                                                <DetailField
                                                    label="Mata Uang"
                                                    value={
                                                        resolveProductCurrency(
                                                            viewingProduct,
                                                        ) || '-'
                                                    }
                                                />
                                            ) : null}
                                            <DetailField
                                                label="Status"
                                                value={
                                                    viewingProduct.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'
                                                }
                                            />
                                        </div>

                                        <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5">
                                            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                Deskripsi
                                            </p>
                                            <p className="mt-1 text-sm leading-relaxed text-foreground">
                                                {viewingProduct.description ||
                                                    '-'}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border/70 bg-muted/10 px-3 py-2.5">
                                            <p className="text-xs font-semibold text-foreground">
                                                Detail Lokasi Hotel
                                            </p>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <DetailField
                                                label="Sumber Hotel"
                                                value={
                                                    selectedHotelForDetail
                                                        ? selectedHotelForDetail.name
                                                        : '-'
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <DetailField
                                                label="Kota Hotel"
                                                value={
                                                    viewingProduct.hotel_info
                                                        ?.city ?? '-'
                                                }
                                            />
                                            <DetailField
                                                label="Negara"
                                                value={
                                                    viewingProduct.hotel_info
                                                        ?.country ?? '-'
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <DetailField
                                                label="Mata Uang"
                                                value={
                                                    viewingProduct.hotel_info
                                                        ?.currency ?? '-'
                                                }
                                            />
                                        </div>
                                        <div className="rounded-xl border border-border/70 bg-muted/10 px-3 py-2.5">
                                            <p className="text-xs font-semibold text-foreground">
                                                Breakdown Harga per Period
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border/70 bg-card p-3">
                                            <Label className="mb-1.5 block">
                                                Harga per Period
                                            </Label>
                                            <div className="overflow-x-auto rounded-lg border border-border/80">
                                                <table className="min-w-full divide-y divide-border text-left text-xs">
                                                    <thead className="bg-muted/40">
                                                        <tr>
                                                            <th className="px-3 py-2 font-semibold">
                                                                Periode
                                                            </th>
                                                            {hotelPricingMatrix.roomTypes.map(
                                                                (roomType) => (
                                                                    <th
                                                                        key={
                                                                            roomType
                                                                        }
                                                                        className="px-3 py-2 font-semibold"
                                                                    >
                                                                        {
                                                                            roomType
                                                                        }
                                                                    </th>
                                                                ),
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {hotelPricingMatrix
                                                            .periods.length >
                                                        0 ? (
                                                            hotelPricingMatrix.periods.map(
                                                                (period) => (
                                                                    <tr
                                                                        key={
                                                                            period.key
                                                                        }
                                                                        className="border-t border-border"
                                                                    >
                                                                        <td className="px-3 py-2">
                                                                            {
                                                                                period.label
                                                                            }
                                                                        </td>
                                                                        {hotelPricingMatrix.roomTypes.map(
                                                                            (
                                                                                roomType,
                                                                            ) => {
                                                                                const price =
                                                                                    period
                                                                                        .pricesByRoomType[
                                                                                        roomType
                                                                                    ];

                                                                                return (
                                                                                    <td
                                                                                        key={`${period.key}-${roomType}`}
                                                                                        className="px-3 py-2"
                                                                                    >
                                                                                        {typeof price ===
                                                                                        'number'
                                                                                            ? formatCurrencyAmount(
                                                                                                  price,
                                                                                                  viewingProduct
                                                                                                      .hotel_info
                                                                                                      ?.currency ??
                                                                                                      'IDR',
                                                                                              )
                                                                                            : price ||
                                                                                              '-'}
                                                                                    </td>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </tr>
                                                                ),
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td
                                                                    colSpan={
                                                                        hotelPricingMatrix
                                                                            .roomTypes
                                                                            .length +
                                                                        1
                                                                    }
                                                                    className="px-3 py-3 text-center text-muted-foreground"
                                                                >
                                                                    Belum ada
                                                                    data pricing
                                                                    period.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <DetailField
                                                label="Nama"
                                                value={viewingProduct.name}
                                            />
                                            <DetailField
                                                label="Tipe Produk"
                                                value={
                                                    viewingProduct.product_type
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <DetailField
                                                label="Harga"
                                                value={formatCurrencyAmount(
                                                    viewingProduct.price,
                                                    resolveProductCurrency(
                                                        viewingProduct,
                                                    ),
                                                )}
                                            />
                                            <DetailField
                                                label="Status"
                                                value={
                                                    viewingProduct.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'
                                                }
                                            />
                                        </div>
                                        <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5">
                                            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                Deskripsi
                                            </p>
                                            <p className="mt-1 text-sm leading-relaxed text-foreground">
                                                {viewingProduct.description ||
                                                    '-'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
