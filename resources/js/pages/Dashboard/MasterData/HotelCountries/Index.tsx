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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { MoreHorizontal, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Country = { id: number; name: string; is_active: boolean };
type Props = {
    countries: { data: Country[] };
    filters: { search: string };
    stats: { total: number; active: number; inactive: number };
};
type FormData = { name: string; is_active: boolean };

const toForm = (item: Country | null): FormData => ({
    name: item?.name ?? '',
    is_active: item?.is_active ?? true,
});

export default function HotelCountriesIndex({
    countries,
    filters,
    stats,
}: Props) {
    const { can } = usePermission('hotel_country');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');

    const [search, setSearch] = useState(filters.search);
    const [editingItem, setEditingItem] = useState<Country | 'new' | null>(
        null,
    );
    const form = useForm<FormData>(toForm(null));

    function submit(event: React.FormEvent): void {
        event.preventDefault();
        if (editingItem === 'new') {
            router.post('/admin/master-data/hotel-countries', form.data, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Negara berhasil ditambahkan.');
                    setEditingItem(null);
                },
            });
            return;
        }
        if (editingItem) {
            router.put(
                `/admin/master-data/hotel-countries/${editingItem.id}`,
                form.data,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Negara berhasil diperbarui.');
                        setEditingItem(null);
                    },
                },
            );
        }
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Master Negara',
                    href: '/admin/master-data/hotel-countries',
                },
            ]}
        >
            <Head title="Master Negara Hotel" />
            <div className="space-y-4 p-4 md:p-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row lg:items-start lg:justify-between">
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                        Master Negara
                    </h1>
                    {canCreate ? (
                        <Button
                            onClick={() => {
                                form.setData(toForm(null));
                                form.clearErrors();
                                setEditingItem('new');
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Negara
                        </Button>
                    ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Stat label="Total" value={stats.total} />
                    <Stat label="Active" value={stats.active} />
                    <Stat label="Inactive" value={stats.inactive} />
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari nama negara..."
                            className="pl-10"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                router.get(
                                    '/admin/master-data/hotel-countries',
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={() =>
                                router.get(
                                    '/admin/master-data/hotel-countries',
                                    { search },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                        >
                            Terapkan
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14 text-center">
                                        No
                                    </TableHead>
                                    <TableHead className="w-20 text-right">
                                        Aksi
                                    </TableHead>
                                    <TableHead>Negara</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {countries.data.length > 0 ? (
                                    countries.data.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {canEdit || canDelete ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="ml-auto"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {canEdit ? (
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        form.setData(
                                                                            toForm(
                                                                                item,
                                                                            ),
                                                                        );
                                                                        form.clearErrors();
                                                                        setEditingItem(
                                                                            item,
                                                                        );
                                                                    }}
                                                                >
                                                                    <SquarePen className="h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                            {canDelete ? (
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        if (
                                                                            window.confirm(
                                                                                `Hapus negara "${item.name}"?`,
                                                                            )
                                                                        ) {
                                                                            router.delete(
                                                                                `/admin/master-data/hotel-countries/${item.id}`,
                                                                                {
                                                                                    preserveScroll: true,
                                                                                    onSuccess:
                                                                                        () =>
                                                                                            toast.success(
                                                                                                'Negara berhasil dihapus.',
                                                                                            ),
                                                                                },
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Hapus
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {item.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            Belum ada data negara.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <Sheet
                open={editingItem !== null}
                onOpenChange={(open) => !open && setEditingItem(null)}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-xl"
                >
                    <SheetHeader>
                        <SheetTitle>
                            {editingItem === 'new'
                                ? 'Tambah Negara'
                                : 'Edit Negara'}
                        </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div>
                                <Label className="mb-1.5 block">
                                    Nama Negara
                                </Label>
                                <Input
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                />
                                {form.errors.name ? (
                                    <p className="mt-1 text-xs text-destructive">
                                        {form.errors.name}
                                    </p>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                                <Checkbox
                                    id="is_active_country"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            'is_active',
                                            checked === true,
                                        )
                                    }
                                />
                                <Label
                                    htmlFor="is_active_country"
                                    className="cursor-pointer"
                                >
                                    Aktif
                                </Label>
                            </div>
                        </div>
                        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background/95 pt-4 pb-1 backdrop-blur">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingItem(null)}
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

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 text-xl font-semibold md:text-2xl">{value}</p>
        </div>
    );
}
