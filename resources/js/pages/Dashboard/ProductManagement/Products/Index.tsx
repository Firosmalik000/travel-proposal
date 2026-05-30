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
    Package,
    Plus,
    Search,
    SquarePen,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type ProductItem = {
    id: number;
    code: string;
    slug: string;
    name: string;
    product_type: string;
    description: string | null;
    price: number | null;
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
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
    product_type_options: Array<{ value: string; label: string }>;
    hotel_options: Array<{
        id: number;
        product_id: number;
        name: string;
        product_code: string | null;
        country: string | null;
        city: string | null;
        currency: string | null;
        pricing: Array<{
            room_type: string;
            period_start: string | null;
            period_end: string | null;
            price: number | string | null;
        }>;
    }>;
};

type ProductFormData = {
    name: string;
    product_type: string;
    description: string;
    price: string;
    source_hotel_id: string;
    is_active: boolean;
};

function buildFormData(product: ProductItem | null): ProductFormData {
    return {
        name: product?.name ?? '',
        product_type: product?.product_type ?? '',
        description: product?.description ?? '',
        price:
            product?.price !== null && product?.price !== undefined
                ? String(product.price)
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

function formatCurrencyIDR(value: number | null): string {
    if (value === null || Number.isNaN(value)) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function isHotelProductType(productType: string): boolean {
    const normalized = productType.toLowerCase();

    return (
        normalized.includes('hotel') ||
        normalized.includes('akomodasi') ||
        normalized.includes('accommodation')
    );
}

function buildHotelContent(
    sourceHotelId: string,
    hotelOptions: Props['hotel_options'],
    editingProduct: ProductItem | null | 'new',
): Record<string, unknown> {
    const selectedHotel = hotelOptions.find(
        (hotel) => String(hotel.id) === sourceHotelId,
    );

    if (selectedHotel) {
        return {
            hotel_id: selectedHotel.id,
            country: selectedHotel.country ?? '',
            city: selectedHotel.city ?? '',
            currency: selectedHotel.currency ?? 'IDR',
            pricing: selectedHotel.pricing ?? [],
        };
    }

    if (
        editingProduct &&
        editingProduct !== 'new' &&
        editingProduct.hotel_info
    ) {
        return {
            hotel_id: editingProduct.hotel_info.hotel_id,
            country: editingProduct.hotel_info.country,
            city: editingProduct.hotel_info.city,
            currency: editingProduct.hotel_info.currency,
            pricing: editingProduct.hotel_info.pricing ?? [],
        };
    }

    return {};
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
    canView,
    canEdit,
    canDelete,
}: {
    index: number;
    product: ProductItem;
    onView: (product: ProductItem) => void;
    onEdit: (product: ProductItem) => void;
    onDelete: (product: ProductItem) => void;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
}) {
    const showActions = canView || canEdit || canDelete;

    return (
        <tr
            key={product.id}
            className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/20"
        >
            <td className="px-4 py-4 text-center text-sm text-muted-foreground">
                {index}
            </td>
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
                            {canView ? (
                                <DropdownMenuItem
                                    onClick={() => onView(product)}
                                >
                                    <Eye className="h-4 w-4" />
                                    Detail
                                </DropdownMenuItem>
                            ) : null}
                            {canEdit ? (
                                <DropdownMenuItem
                                    onClick={() => onEdit(product)}
                                >
                                    <SquarePen className="h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            ) : null}
                            {canDelete ? (
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
                {formatCurrencyIDR(product.price)}
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
    stats,
    product_type_options: productTypeOptions,
    hotel_options: hotelOptions,
}: Props) {
    const { can } = usePermission('product');
    const canCreate = can('create');
    const canView = can('view');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const [search, setSearch] = useState(filters.search);
    const [productType, setProductType] = useState(filters.product_type);
    const [editingProduct, setEditingProduct] = useState<
        ProductItem | null | 'new'
    >(null);
    const [viewingProduct, setViewingProduct] = useState<ProductItem | null>(
        null,
    );
    const [activeFormTab, setActiveFormTab] = useState('general');

    const form = useForm<ProductFormData>(buildFormData(null));
    const generatedSlug = useMemo(
        () => generateSlug(form.data.name),
        [form.data.name],
    );
    const generatedCode = useMemo(
        () => generateProductCode(form.data.name),
        [form.data.name],
    );
    const isEditingExistingHotelProduct =
        editingProduct !== null &&
        editingProduct !== 'new' &&
        isHotelProductType(editingProduct.product_type);
    const selectedHotelForDetail = useMemo(
        () => resolveHotelOption(viewingProduct, hotelOptions),
        [viewingProduct, hotelOptions],
    );
    const hotelPricingMatrix = useMemo(
        () =>
            buildHotelPricingMatrix(viewingProduct?.hotel_info?.pricing ?? []),
        [viewingProduct],
    );

    function submitFilters() {
        router.get(
            '/admin/product-management/products',
            { search, product_type: productType },
            { preserveState: true, preserveScroll: true },
        );
    }

    function resetFilters() {
        setSearch('');
        setProductType('all');
        router.get(
            '/admin/product-management/products',
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    function openCreateSheet() {
        if (!canCreate) {
            return;
        }

        form.setData(buildFormData(null));
        form.clearErrors();
        setActiveFormTab('general');
        setEditingProduct('new');
    }

    function openEditSheet(product: ProductItem) {
        if (!canEdit) {
            return;
        }

        const baseForm = buildFormData(product);
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
        if (!canView) {
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

        if (isEditingExistingHotelProduct) {
            toast.error(
                'Produk hotel dikelola dari menu Master Data Hotel. Silakan edit di sana.',
            );
            return;
        }

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
                    ...(isHotelProductType(form.data.product_type)
                        ? buildHotelContent(
                              form.data.source_hotel_id,
                              hotelOptions,
                              editingProduct,
                          )
                        : {}),
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

            <div className="space-y-4 p-4 md:p-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Products
                        </h1>
                    </div>
                    {canCreate ? (
                        <Button
                            onClick={openCreateSheet}
                            className="h-10 shrink-0 rounded-xl px-4"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Produk
                        </Button>
                    ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    Total Produk
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                <Package className="h-4.5 w-4.5" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    Active
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {stats.active}
                                </p>
                            </div>
                            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                                <Eye className="h-4.5 w-4.5" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    Inactive
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {stats.inactive}
                                </p>
                            </div>
                            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
                                <Eye className="h-4.5 w-4.5" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px_auto] lg:items-end">
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
                        <div>
                            <Label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                Kategori
                            </Label>
                            <Select
                                value={productType || 'all'}
                                onValueChange={setProductType}
                            >
                                <SelectTrigger className="h-10 w-full rounded-lg">
                                    <SelectValue placeholder="Semua kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua kategori
                                    </SelectItem>
                                    {productTypeOptions.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                        <span>Total data: {products.total}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border text-left text-sm">
                            <thead className="bg-muted/35 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                <tr>
                                    <th className="w-16 px-4 py-3 text-center">
                                        No
                                    </th>
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
                                            canView={canView}
                                            canEdit={canEdit}
                                            canDelete={canDelete}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-10 text-center text-sm text-muted-foreground"
                                        >
                                            {filters.search ||
                                            (filters.product_type &&
                                                filters.product_type !== 'all')
                                                ? 'Produk tidak ditemukan.'
                                                : 'Belum ada produk.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {products.links.length > 3 ? (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-4">
                            {products.links.map((link, index) =>
                                link.url ? (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => router.visit(link.url!)}
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
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
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
                                                {productTypeOptions.map(
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
                                                <SelectValue placeholder="Pilih hotel dari master data" />
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
                                                        {hotel.name} (
                                                        {hotel.product_code ??
                                                            '-'}
                                                        )
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Informasi hotel akan diambil dari menu
                                        Master Data Hotel dan payload produk
                                        akan mengikuti struktur sinkron hotel.
                                    </p>
                                    {isEditingExistingHotelProduct ? (
                                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                            Produk kategori hotel tidak bisa
                                            diedit di sini. Silakan edit dari
                                            menu Master Data / Hotel.
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
                            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
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
                                                    value={formatCurrencyIDR(
                                                        viewingProduct.price,
                                                    )}
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
                                                        ? `${selectedHotelForDetail.name} (${selectedHotelForDetail.product_code ?? '-'})`
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
                                                                                            ? formatCurrencyIDR(
                                                                                                  price,
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
                                                value={formatCurrencyIDR(
                                                    viewingProduct.price,
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
