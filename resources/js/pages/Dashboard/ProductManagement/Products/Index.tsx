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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, Package, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ProductItem = {
    id: number;
    code: string;
    slug: string;
    icon: string;
    name: string;
    product_type: string;
    description: string | null;
    unit: string;
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
};

type ProductFormData = {
    code: string;
    slug: string;
    icon: string;
    name: string;
    product_type: string;
    description: string;
    unit: string;
    is_active: boolean;
};

function buildFormData(product: ProductItem | null): ProductFormData {
    return {
        code: product?.code ?? '',
        slug: product?.slug ?? '',
        icon: product?.icon ?? 'Package',
        name: product?.name ?? '',
        product_type: product?.product_type ?? '',
        description: product?.description ?? '',
        unit: product?.unit ?? '',
        is_active: product?.is_active ?? true,
    };
}

function ProductTableRow({
    product,
    onEdit,
    onDelete,
}: {
    product: ProductItem;
    onEdit: (product: ProductItem) => void;
    onDelete: (product: ProductItem) => void;
}) {
    return (
        <tr key={product.id} className="border-b border-border last:border-b-0">
            <td className="px-4 py-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                            {product.name || product.code}
                        </p>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                            {product.code}
                        </span>
                        {product.product_type ? (
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                                {product.product_type}
                            </span>
                        ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        /{product.slug || '-'} â€¢ Unit: {product.unit || '-'}
                    </p>
                </div>
            </td>
            <td className="px-4 py-4 text-muted-foreground">
                <p className="line-clamp-2 max-w-xl text-sm">
                    {product.description || '-'}
                </p>
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
            <td className="px-4 py-4">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                    >
                        <SquarePen className="mr-1 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(product)}
                    >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Hapus
                    </Button>
                </div>
            </td>
        </tr>
    );
}

export default function ProductsIndex({
    products,
    filters,
    stats,
    product_type_options: productTypeOptions,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [productType, setProductType] = useState(filters.product_type);
    const [editingProduct, setEditingProduct] = useState<
        ProductItem | null | 'new'
    >(null);

    const form = useForm<ProductFormData>(buildFormData(null));

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
        form.setData(buildFormData(null));
        form.clearErrors();
        setEditingProduct('new');
    }

    function openEditSheet(product: ProductItem) {
        form.setData(buildFormData(product));
        form.clearErrors();
        setEditingProduct(product);
    }

    function closeSheet() {
        setEditingProduct(null);
        form.reset();
        form.clearErrors();
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();

        const payload = {
            payload: {
                code: form.data.code,
                slug: form.data.slug,
                icon: form.data.icon,
                name: form.data.name,
                product_type: form.data.product_type,
                description: form.data.description,
                content: {
                    unit: form.data.unit,
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
        if (!window.confirm(`Hapus produk "${product.name || product.code}"?`)) {
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

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                            <Package className="h-3.5 w-3.5" />
                            Product Management
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Products
                        </h1>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                            Kelola master produk travel yang dipakai sebagai
                            komponen paket.
                        </p>
                    </div>
                    <Button onClick={openCreateSheet} className="shrink-0">
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Produk
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Total Produk
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <Package className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Active
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.active}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                                <Eye className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Inactive
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.inactive}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                <Eye className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div className="space-y-3">
                        <div>
                            <Label className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Cari Produk
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari berdasarkan code, nama, slug..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Filter Tipe
                            </Label>
                            <Select
                                value={productType || 'all'}
                                onValueChange={setProductType}
                            >
                                <SelectTrigger className="w-full">
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
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetFilters}
                        >
                            Reset
                        </Button>
                        <Button type="button" onClick={submitFilters}>
                            Terapkan
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="border-b border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                        <span>Total data: {products.total}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Produk</th>
                                    <th className="px-4 py-3">Deskripsi</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <ProductTableRow
                                            key={product.id}
                                            product={product}
                                            onEdit={openEditSheet}
                                            onDelete={destroyProduct}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
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
                        <SheetDescription>
                            Master produk dipakai untuk menyusun package.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-foreground">
                                    Detail Produk
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Isi data utama produk. Unit dipakai sebagai
                                    label di detail package.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label className="mb-1.5 block">
                                            Code
                                        </Label>
                                        <Input
                                            value={form.data.code}
                                            onChange={(e) =>
                                                form.setData(
                                                    'code',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="PRD-VISA"
                                        />
                                        {form.errors.code ? (
                                            <p className="mt-1 text-xs text-destructive">
                                                {form.errors.code}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div>
                                        <Label className="mb-1.5 block">
                                            Slug
                                        </Label>
                                        <Input
                                            value={form.data.slug}
                                            onChange={(e) =>
                                                form.setData(
                                                    'slug',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="visa"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label className="mb-1.5 block">
                                            Tipe Produk
                                        </Label>
                                        <Select
                                            value={form.data.product_type}
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
                                    <div>
                                        <Label className="mb-1.5 block">
                                            Icon (opsional)
                                        </Label>
                                        <Input
                                            value={form.data.icon}
                                            onChange={(e) =>
                                                form.setData(
                                                    'icon',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Package"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-1.5 block">Nama</Label>
                                    <Input
                                        value={form.data.name}
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
                                            Unit (opsional)
                                        </Label>
                                        <Input
                                            value={form.data.unit}
                                            onChange={(e) =>
                                                form.setData(
                                                    'unit',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="per jamaah"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 sm:mt-6">
                                        <Checkbox
                                            id="is_active_product"
                                            checked={form.data.is_active}
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
                            </div>
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
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}

