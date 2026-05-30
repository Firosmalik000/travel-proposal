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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ClipboardList,
    Eye,
    MoreHorizontal,
    Plus,
    Search,
    SquarePen,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ActivityItem = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    created_at?: string | null;
};

type Props = {
    activities: {
        data: ActivityItem[];
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

type ActivityFormData = {
    name: string;
    description: string;
    sort_order: number;
    is_active: boolean;
};

function buildFormData(activity: ActivityItem | null): ActivityFormData {
    return {
        name: activity?.name ?? '',
        description: activity?.description ?? '',
        sort_order: activity?.sort_order ?? 1,
        is_active: activity?.is_active ?? true,
    };
}

function ActivityTableRow({
    index,
    activity,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
}: {
    index: number;
    activity: ActivityItem;
    onEdit: (activity: ActivityItem) => void;
    onDelete: (activity: ActivityItem) => void;
    canEdit: boolean;
    canDelete: boolean;
}) {
    const showActions = canEdit || canDelete;

    return (
        <tr key={activity.id} className="transition-colors hover:bg-muted/20">
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
                                aria-label={`Aksi ${activity.name || activity.code}`}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit ? (
                                <DropdownMenuItem
                                    onClick={() => onEdit(activity)}
                                >
                                    <SquarePen className="h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                            ) : null}
                            {canDelete ? (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => onDelete(activity)}
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
                    <p className="font-medium text-foreground">
                        {activity.name || activity.code}
                    </p>
                </div>
            </td>
            <td className="px-4 py-4">
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${activity.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                >
                    {activity.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
            </td>
        </tr>
    );
}

export default function ActivitiesIndex({ activities, filters, stats }: Props) {
    const { can } = usePermission('activity');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const showActions = canEdit || canDelete;
    const [search, setSearch] = useState(filters.search);
    const [editingActivity, setEditingActivity] = useState<
        ActivityItem | null | 'new'
    >(null);

    const form = useForm<ActivityFormData>(buildFormData(null));

    function updateFormField<K extends keyof ActivityFormData>(
        key: K,
        value: ActivityFormData[K],
    ) {
        form.setData((data) => ({
            ...data,
            [key]: value,
        }));
    }

    function submitFilters() {
        router.get(
            '/admin/product-management/activities',
            {
                search,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function resetFilters() {
        setSearch('');
        router.get(
            '/admin/product-management/activities',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function openCreateSheet() {
        if (!canCreate) {
            return;
        }

        form.setData(buildFormData(null));
        form.clearErrors();
        setEditingActivity('new');
    }

    function openEditSheet(activity: ActivityItem) {
        if (!canEdit) {
            return;
        }

        form.setData(buildFormData(activity));
        form.clearErrors();
        setEditingActivity(activity);
    }

    function closeSheet() {
        setEditingActivity(null);
        form.reset();
        form.clearErrors();
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();

        const payload = {
            name: form.data.name,
            description: form.data.description,
            sort_order: form.data.sort_order,
            is_active: form.data.is_active,
        };

        if (editingActivity === 'new') {
            router.post('/admin/product-management/activities', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Activity berhasil ditambahkan.');
                    closeSheet();
                },
            });

            return;
        }

        if (editingActivity) {
            router.put(
                `/admin/product-management/activities/${editingActivity.id}`,
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Activity berhasil diperbarui.');
                        closeSheet();
                    },
                },
            );
        }
    }

    function destroyActivity(activity: ActivityItem) {
        if (!canDelete) {
            return;
        }

        if (
            !window.confirm(
                `Hapus activity "${activity.name || activity.code}"?`,
            )
        ) {
            return;
        }

        router.delete(`/admin/product-management/activities/${activity.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Activity berhasil dihapus.'),
        });
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Manajemen Activity',
                    href: '/admin/product-management/activities',
                },
            ]}
        >
            <Head title="Manajemen Activity" />

            <div className="space-y-4 p-4 md:p-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Manajemen Activity
                        </h1>
                    </div>
                    {canCreate ? (
                        <Button
                            onClick={openCreateSheet}
                            className="h-10 shrink-0 rounded-xl px-4"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Activity
                        </Button>
                    ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                    Total Activity
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                                <ClipboardList className="h-4.5 w-4.5" />
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
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div>
                            <Label className="mb-1.5 block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                Cari Activity
                            </Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="h-10 rounded-lg pr-4 pl-9"
                                    placeholder="Cari code atau nama activity..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            submitFilters();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
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
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm text-muted-foreground">
                        <span>Daftar activity: {activities.total}</span>
                    </div>

                    <div className="divide-y divide-border md:hidden">
                        {activities.data.length > 0 ? (
                            activities.data.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="space-y-4 px-4 py-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <p className="font-semibold text-foreground">
                                                {activity.name || activity.code}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-muted px-3 py-2 text-right">
                                            <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                Activity
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-muted/40 p-3">
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${activity.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                                            >
                                                {activity.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p>{activity.description || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                openEditSheet(activity)
                                            }
                                        >
                                            <SquarePen className="mr-1 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                destroyActivity(activity)
                                            }
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" />
                                            Hapus
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-16 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="rounded-full bg-muted p-3">
                                        <ClipboardList className="h-6 w-6" />
                                    </div>
                                    <p>
                                        {filters.search
                                            ? 'Activity tidak ditemukan.'
                                            : 'Belum ada activity.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead className="bg-muted/35 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                <tr>
                                    <th className="w-16 px-4 py-3 text-center">
                                        No
                                    </th>
                                    <th className="w-20 px-4 py-3 text-right">
                                        Aksi
                                    </th>
                                    <th className="px-4 py-3">Activity</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {activities.data.length > 0 ? (
                                    activities.data.map((activity, index) => (
                                        <ActivityTableRow
                                            key={activity.id}
                                            index={index + 1}
                                            activity={activity}
                                            onEdit={openEditSheet}
                                            onDelete={destroyActivity}
                                            canEdit={canEdit}
                                            canDelete={canDelete}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-16 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="rounded-full bg-muted p-3">
                                                    <ClipboardList className="h-6 w-6" />
                                                </div>
                                                <p>
                                                    {filters.search
                                                        ? 'Activity tidak ditemukan.'
                                                        : 'Belum ada activity.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {activities.links.length > 3 ? (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-4">
                            {activities.links.map((link, index) =>
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
                open={editingActivity !== null}
                onOpenChange={(open) => !open && closeSheet()}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-2xl"
                >
                    <SheetHeader>
                        <SheetTitle>
                            {editingActivity === 'new'
                                ? 'Tambah Activity'
                                : 'Edit Activity'}
                        </SheetTitle>
                    </SheetHeader>

                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                            <div className="mb-4">
                                <p className="text-sm font-semibold text-foreground">
                                    Konten Activity
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <div>
                                    <Label className="mb-1.5 block">
                                        Nama Activity
                                    </Label>
                                    <Input
                                        value={form.data.name}
                                        onChange={(event) =>
                                            updateFormField(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Briefing Keberangkatan"
                                    />
                                    {form.errors.name ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.name}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <Label className="mb-1.5 block">
                                        Deskripsi Activity
                                    </Label>
                                    <Textarea
                                        rows={5}
                                        value={form.data.description}
                                        onChange={(event) =>
                                            updateFormField(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Deskripsi activity untuk itinerary package"
                                    />
                                    {form.errors.description ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.description}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="mb-1.5 block">
                                            Urutan
                                        </Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={form.data.sort_order}
                                            onChange={(event) =>
                                                form.setData(
                                                    'sort_order',
                                                    Number(
                                                        event.target.value,
                                                    ) || 1,
                                                )
                                            }
                                        />
                                        {form.errors.sort_order ? (
                                            <p className="mt-1 text-xs text-destructive">
                                                {form.errors.sort_order}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="flex items-end">
                                        <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                                            <Checkbox
                                                checked={form.data.is_active}
                                                onCheckedChange={(checked) =>
                                                    form.setData(
                                                        'is_active',
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    Activity aktif
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeSheet}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing
                                    ? 'Menyimpan...'
                                    : editingActivity === 'new'
                                      ? 'Tambah Activity'
                                      : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
