import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Eye,
    FolderKanban,
    Plus,
    Search,
    SquarePen,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type CategoryItem = {
    id: number;
    key: string;
    name: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
};

type Props = {
    categories: {
        data: CategoryItem[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
    filters: {
        search: string;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
};

type CategoryFormData = {
    key: string;
    name: string;
    description: string;
    sort_order: number;
    is_active: boolean;
};

function buildFormData(category: CategoryItem | null): CategoryFormData {
    return {
        key: category?.key ?? '',
        name: category?.name ?? '',
        description: category?.description ?? '',
        sort_order: category?.sort_order ?? 1,
        is_active: category?.is_active ?? true,
    };
}

function CategoryTableRow({
    category,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
}: {
    category: CategoryItem;
    onEdit: (category: CategoryItem) => void;
    onDelete: (category: CategoryItem) => void;
    canEdit: boolean;
    canDelete: boolean;
}) {
    const showActions = canEdit || canDelete;

    return (
        <tr
            key={category.id}
            className="border-b border-border last:border-b-0"
        >
            <td className="px-4 py-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                            {category.name || category.key}
                        </p>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                            {category.key}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Urutan: {category.sort_order}
                    </p>
                </div>
            </td>
            <td className="px-4 py-4 text-muted-foreground">
                <p className="line-clamp-2 max-w-xl text-sm">
                    {category.description || '-'}
                </p>
            </td>
            <td className="px-4 py-4">
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        category.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                    }`}
                >
                    {category.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
            </td>
            <td className="px-4 py-4">
                {showActions ? (
                    <div className="flex justify-end gap-2">
                        {canEdit ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(category)}
                            >
                                <SquarePen className="mr-1 h-4 w-4" />
                                Edit
                            </Button>
                        ) : null}
                        {canDelete ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(category)}
                            >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Hapus
                            </Button>
                        ) : null}
                    </div>
                ) : null}
            </td>
        </tr>
    );
}

export default function ProductCategoriesIndex({
    categories,
    filters,
    stats,
}: Props) {
    const { can } = usePermission('product_category');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const showActions = canEdit || canDelete;
    const [search, setSearch] = useState(filters.search);
    const [editingCategory, setEditingCategory] = useState<
        CategoryItem | null | 'new'
    >(null);

    const form = useForm<CategoryFormData>(buildFormData(null));

    function submitFilters() {
        router.get(
            '/admin/product-management/categories',
            { search },
            { preserveState: true, preserveScroll: true },
        );
    }

    function resetFilters() {
        setSearch('');
        router.get(
            '/admin/product-management/categories',
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
        setEditingCategory('new');
    }

    function openEditSheet(category: CategoryItem) {
        if (!canEdit) {
            return;
        }

        form.setData(buildFormData(category));
        form.clearErrors();
        setEditingCategory(category);
    }

    function closeSheet() {
        setEditingCategory(null);
        form.reset();
        form.clearErrors();
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();

        const payload = {
            payload: {
                key: form.data.key,
                name: form.data.name,
                description: form.data.description,
                sort_order: form.data.sort_order,
                is_active: form.data.is_active,
            },
        };

        if (editingCategory === 'new') {
            router.post(
                '/admin/website-management/content/resources/product_categories',
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Kategori berhasil ditambahkan.');
                        closeSheet();
                    },
                },
            );

            return;
        }

        if (editingCategory) {
            router.patch(
                `/admin/website-management/content/resources/product_categories/${editingCategory.id}`,
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Kategori berhasil diperbarui.');
                        closeSheet();
                    },
                },
            );
        }
    }

    function destroyCategory(category: CategoryItem) {
        if (!canDelete) {
            return;
        }

        if (
            !window.confirm(
                `Hapus kategori "${category.name || category.key}"?`,
            )
        ) {
            return;
        }

        router.delete(
            `/admin/website-management/content/resources/product_categories/${category.id}`,
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Kategori berhasil dihapus.'),
            },
        );
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Product Categories',
                    href: '/admin/product-management/categories',
                },
            ]}
        >
            <Head title="Product Categories" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                            <FolderKanban className="h-3.5 w-3.5" />
                            Product Management
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Product Categories
                        </h1>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                            Kelola kategori master untuk mengelompokkan produk
                            travel. Kategori ini dipakai sebagai tipe produk.
                        </p>
                    </div>
                    {canCreate ? (
                        <Button onClick={openCreateSheet} className="shrink-0">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kategori
                        </Button>
                    ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Total Kategori
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                <FolderKanban className="h-5 w-5" />
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
                                Cari Kategori
                            </Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari berdasarkan key, nama, atau deskripsi..."
                                    className="pl-10"
                                />
                            </div>
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
                        <span>Total data: {categories.total}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-muted/30 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3">Deskripsi</th>
                                    <th className="px-4 py-3">Status</th>
                                    {showActions ? (
                                        <th className="px-4 py-3 text-right">
                                            Aksi
                                        </th>
                                    ) : null}
                                </tr>
                            </thead>
                            <tbody>
                                {categories.data.length > 0 ? (
                                    categories.data.map((category) => (
                                        <CategoryTableRow
                                            key={category.id}
                                            category={category}
                                            onEdit={openEditSheet}
                                            onDelete={destroyCategory}
                                            canEdit={canEdit}
                                            canDelete={canDelete}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={showActions ? 4 : 3}
                                            className="px-4 py-10 text-center text-sm text-muted-foreground"
                                        >
                                            {filters.search
                                                ? 'Kategori tidak ditemukan.'
                                                : 'Belum ada kategori.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {categories.links.length > 3 ? (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-4">
                            {categories.links.map((link, index) =>
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
                open={editingCategory !== null}
                onOpenChange={(open) => !open && closeSheet()}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-2xl"
                >
                    <SheetHeader>
                        <SheetTitle>
                            {editingCategory === 'new'
                                ? 'Tambah Kategori'
                                : 'Edit Kategori'}
                        </SheetTitle>
                        <SheetDescription>
                            Kategori dipakai untuk mengisi field tipe produk.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-foreground">
                                    Detail Kategori
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Isi key, nama, dan deskripsi kategori.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <div>
                                    <Label className="mb-1.5 block">Key</Label>
                                    <Input
                                        value={form.data.key}
                                        onChange={(e) =>
                                            form.setData('key', e.target.value)
                                        }
                                        placeholder="contoh: layanan"
                                    />
                                    {form.errors.key ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.key}
                                        </p>
                                    ) : null}
                                </div>
                                <div>
                                    <Label className="mb-1.5 block">Nama</Label>
                                    <Input
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        placeholder="Layanan"
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
                                        placeholder="Deskripsi singkat kategori..."
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label className="mb-1.5 block">
                                            Urutan
                                        </Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={form.data.sort_order}
                                            onChange={(e) =>
                                                form.setData(
                                                    'sort_order',
                                                    Number(e.target.value),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 sm:mt-6">
                                        <Checkbox
                                            id="is_active_category"
                                            checked={form.data.is_active}
                                            onCheckedChange={(checked) =>
                                                form.setData(
                                                    'is_active',
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="is_active_category"
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
