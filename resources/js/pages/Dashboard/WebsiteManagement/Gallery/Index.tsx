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
import { Eye, ImagePlus, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type GalleryItemRow = {
    id: number;
    title: string;
    category: string | null;
    description: string | null;
    image_path: string;
    sort_order: number;
    is_active: boolean;
};

type Props = {
    items: GalleryItemRow[];
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
};

type GalleryFormData = {
    title: string;
    category: string;
    description: string;
    sort_order: number;
    is_active: boolean;
    image: File | null;
    _method?: 'PATCH';
};

function buildFormData(item: GalleryItemRow | null): GalleryFormData {
    return {
        title: item?.title ?? '',
        category: item?.category ?? '',
        description: item?.description ?? '',
        sort_order: item?.sort_order ?? 1,
        is_active: item?.is_active ?? true,
        image: null,
    };
}

function GalleryTableRow({
    item,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
}: {
    item: GalleryItemRow;
    onEdit: (item: GalleryItemRow) => void;
    onDelete: (item: GalleryItemRow) => void;
    canEdit: boolean;
    canDelete: boolean;
}) {
    const showActions = canEdit || canDelete;

    return (
        <tr key={item.id} className="border-b border-border last:border-b-0">
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-14 w-20 overflow-hidden rounded-xl border border-border bg-muted">
                        <img
                            src={item.image_path || '/images/dummy.jpg'}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-foreground">
                            {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {item.category || 'Tanpa kategori'} • Urutan{' '}
                            {item.sort_order}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 text-muted-foreground">
                <p className="line-clamp-2 max-w-xl text-sm">
                    {item.description || '-'}
                </p>
            </td>
            <td className="px-4 py-4">
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                    }`}
                >
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
            </td>
            <td className="px-4 py-4 text-right">
                {showActions ? (
                    <div className="inline-flex items-center gap-2">
                        {canEdit ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(item)}
                                className="h-9 rounded-xl"
                            >
                                <SquarePen className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        ) : null}
                        {canDelete ? (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(item)}
                                className="h-9 rounded-xl"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                            </Button>
                        ) : null}
                    </div>
                ) : null}
            </td>
        </tr>
    );
}

export default function GalleryManagement({ items, stats }: Props) {
    const { can } = usePermission('gallery_management');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const showActions = canEdit || canDelete;
    const [search, setSearch] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState<GalleryItemRow | null>(null);

    const form = useForm<GalleryFormData>(buildFormData(null));

    const imagePreviewUrl = useMemo(() => {
        if (!form.data.image) {
            return null;
        }

        return URL.createObjectURL(form.data.image);
    }, [form.data.image]);

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();
        if (!needle) {
            return items;
        }

        return items.filter((item) =>
            `${item.title} ${item.category ?? ''} ${item.description ?? ''}`
                .toLowerCase()
                .includes(needle),
        );
    }, [items, search]);

    const openCreate = () => {
        if (!canCreate) {
            return;
        }

        setEditing(null);
        form.setData(buildFormData(null));
        setDrawerOpen(true);
    };

    const openEdit = (item: GalleryItemRow) => {
        if (!canEdit) {
            return;
        }

        setEditing(item);
        form.setData({ ...buildFormData(item), _method: 'PATCH' });
        setDrawerOpen(true);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setEditing(null);
        form.reset();
    };

    const submit = () => {
        if (editing) {
            form.post(`/admin/website-management/gallery/${editing.id}`, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Foto galeri berhasil diperbarui.');
                    closeDrawer();
                },
            });

            return;
        }

        form.post('/admin/website-management/gallery', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                toast.success('Foto galeri berhasil ditambahkan.');
                closeDrawer();
            },
        });
    };

    const destroyItem = (item: GalleryItemRow) => {
        if (!canDelete) {
            return;
        }

        if (!window.confirm('Hapus foto galeri ini?')) {
            return;
        }

        router.delete(`/admin/website-management/gallery/${item.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Foto galeri berhasil dihapus.'),
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Gallery',
                    href: '/admin/website-management/gallery',
                },
            ]}
        >
            <Head title="Gallery" />

            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold text-foreground">
                            Gallery
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Upload foto galeri untuk halaman publik{' '}
                            <span className="font-medium text-foreground">
                                /galeri
                            </span>
                            .
                        </p>
                    </div>
                    {canCreate ? (
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Foto
                        </Button>
                    ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        ['Total Foto', stats.total],
                        ['Aktif', stats.active],
                        ['Nonaktif', stats.inactive],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        {label}
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-foreground">
                                        {value}
                                    </p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <Eye className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari judul / kategori..."
                                className="h-10 pl-9"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Total ditampilkan: {filtered.length}
                        </p>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    <th className="px-4 py-3">Foto</th>
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
                                {filtered.length > 0 ? (
                                    filtered.map((item) => (
                                        <GalleryTableRow
                                            key={item.id}
                                            item={item}
                                            onEdit={openEdit}
                                            onDelete={destroyItem}
                                            canEdit={canEdit}
                                            canDelete={canDelete}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={showActions ? 4 : 3}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            Belum ada foto galeri.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent className="w-full max-w-xl sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>
                            {editing
                                ? 'Edit Foto Galeri'
                                : 'Tambah Foto Galeri'}
                        </SheetTitle>
                        <SheetDescription>
                            Foto yang diupload akan tampil di halaman{' '}
                            <span className="font-medium text-foreground">
                                /galeri
                            </span>
                            .
                        </SheetDescription>
                    </SheetHeader>

                    <form
                        className="mt-6 space-y-5"
                        onSubmit={(e) => {
                            e.preventDefault();
                            submit();
                        }}
                    >
                        <div className="space-y-2">
                            <Label>Judul</Label>
                            <Input
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                                placeholder="Contoh: Jamaah di Madinah"
                            />
                            {form.errors.title ? (
                                <p className="text-xs text-destructive">
                                    {form.errors.title}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label>Kategori (opsional)</Label>
                            <Input
                                value={form.data.category}
                                onChange={(e) =>
                                    form.setData('category', e.target.value)
                                }
                                placeholder="Contoh: galeri"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Deskripsi (opsional)</Label>
                            <Textarea
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                                rows={4}
                                placeholder="Catatan singkat untuk admin."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Urutan</Label>
                                <Input
                                    type="number"
                                    value={form.data.sort_order}
                                    onChange={(e) =>
                                        form.setData(
                                            'sort_order',
                                            Number(e.target.value || 0),
                                        )
                                    }
                                    min={0}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Aktif</Label>
                                <div className="flex h-10 items-center gap-2 rounded-lg border border-border px-3">
                                    <Checkbox
                                        checked={form.data.is_active}
                                        onCheckedChange={(v) =>
                                            form.setData(
                                                'is_active',
                                                Boolean(v),
                                            )
                                        }
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        Tampilkan di publik
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>
                                {editing ? 'Ganti Foto (opsional)' : 'Foto'}
                            </Label>
                            {!editing && !imagePreviewUrl ? (
                                <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
                                    Belum ada foto dipilih.
                                </div>
                            ) : null}
                            {editing && !imagePreviewUrl ? (
                                <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                                    <img
                                        src={
                                            editing.image_path ||
                                            '/images/dummy.jpg'
                                        }
                                        alt={editing.title}
                                        className="h-56 w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            ) : null}
                            {imagePreviewUrl ? (
                                <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                                    <img
                                        src={imagePreviewUrl}
                                        alt="Preview foto galeri"
                                        className="h-56 w-full object-cover"
                                    />
                                </div>
                            ) : null}
                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 p-4 transition hover:bg-muted/30">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ImagePlus className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Pilih file gambar
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG / JPG / WEBP, max 5MB
                                    </p>
                                </div>
                                <Input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="hidden"
                                    onChange={(e) =>
                                        form.setData(
                                            'image',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </label>
                            {form.data.image ? (
                                <p className="text-xs text-muted-foreground">
                                    Dipilih: {form.data.image.name}
                                </p>
                            ) : null}
                            {form.errors.image ? (
                                <p className="text-xs text-destructive">
                                    {form.errors.image}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDrawer}
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
