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
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { MoreHorizontal, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type CurrencyItem = {
    id: number;
    code: string;
    name: string;
    conversion_rate: string;
    notes: string | null;
    is_active: boolean;
    usage_count: number;
};

type Props = {
    currencies: {
        data: CurrencyItem[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: {
        search: string;
        status: 'all' | 'active' | 'inactive';
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
        used: number;
    };
};

type CurrencyFormData = {
    code: string;
    name: string;
    conversion_rate: string;
    notes: string;
    is_active: boolean;
};

const statusLabels = {
    all: 'Semua',
    active: 'Aktif',
    inactive: 'Nonaktif',
} as const;

const buildFormData = (item: CurrencyItem | null): CurrencyFormData => ({
    code: item?.code ?? '',
    name: item?.name ?? '',
    conversion_rate: item?.conversion_rate ?? '1',
    notes: item?.notes ?? '',
    is_active: item?.is_active ?? true,
});

const normalizeCode = (value: string): string =>
    value
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 3);

const formatUsage = (count: number): string =>
    count > 0 ? `${count} referensi` : 'Belum dipakai';

const formatRate = (value: string): string => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return value;
    }

    return numericValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
    });
};

export default function CurrenciesIndex({ currencies, filters, stats }: Props) {
    const { can } = usePermission('master_currency');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');

    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);
    const [editingItem, setEditingItem] = useState<CurrencyItem | 'new' | null>(
        null,
    );
    const form = useForm<CurrencyFormData>(buildFormData(null));

    const activeStatusClass = 'bg-emerald-100 text-emerald-700';
    const inactiveStatusClass = 'bg-slate-100 text-slate-700';

    function openCreateSheet(): void {
        form.setData(buildFormData(null));
        form.clearErrors();
        setEditingItem('new');
    }

    function openEditSheet(item: CurrencyItem): void {
        form.setData(buildFormData(item));
        form.clearErrors();
        setEditingItem(item);
    }

    function closeSheet(): void {
        setEditingItem(null);
        form.clearErrors();
    }

    function submit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        const payload = {
            ...form.data,
            code: normalizeCode(form.data.code),
            name: form.data.name.trim(),
            conversion_rate: form.data.conversion_rate.trim(),
            notes: form.data.notes.trim(),
        };

        if (editingItem === 'new') {
            router.post('/admin/master-data/currencies', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Currency berhasil ditambahkan.');
                    closeSheet();
                },
            });

            return;
        }

        if (editingItem) {
            router.put(
                `/admin/master-data/currencies/${editingItem.id}`,
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Currency berhasil diperbarui.');
                        closeSheet();
                    },
                },
            );
        }
    }

    function applyFilters(): void {
        router.get(
            '/admin/master-data/currencies',
            {
                search,
                status,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function resetFilters(): void {
        setSearch('');
        setStatus('all');
        router.get(
            '/admin/master-data/currencies',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }

    function deactivateCurrency(item: CurrencyItem): void {
        if (
            !window.confirm(
                `Nonaktifkan currency "${item.code} - ${item.name}"?`,
            )
        ) {
            return;
        }

        router.delete(`/admin/master-data/currencies/${item.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Currency berhasil dinonaktifkan.');
            },
        });
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Master Currency',
                    href: '/admin/master-data/currencies',
                },
            ]}
        >
            <Head title="Master Currency" />
            <div className="space-y-4 p-4 md:p-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Reference Master
                            </p>
                            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                                Master Currency
                            </h1>
                            <p className="max-w-2xl text-sm text-muted-foreground">
                                Kelola kode mata uang yang dipakai di hotel,
                                paket, dan booking. Pakai kode ISO 4217 seperti
                                IDR, USD, atau SAR agar data konsisten.
                            </p>
                        </div>
                        {canCreate ? (
                            <Button onClick={openCreateSheet}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Currency
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Total" value={stats.total} />
                    <Stat label="Aktif" value={stats.active} />
                    <Stat label="Nonaktif" value={stats.inactive} />
                    <Stat label="Dipakai" value={stats.used} />
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid gap-3 lg:grid-cols-[1.4fr,0.8fr]">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        normalizeSearch(event.target.value),
                                    )
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        applyFilters();
                                    }
                                }}
                                placeholder="Cari kode, nama, atau simbol..."
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(
                                Object.keys(statusLabels) as Array<
                                    keyof typeof statusLabels
                                >
                            ).map((item) => (
                                <Button
                                    key={item}
                                    type="button"
                                    variant={
                                        status === item ? 'default' : 'outline'
                                    }
                                    onClick={() => setStatus(item)}
                                    className="flex-1 sm:flex-none"
                                >
                                    {statusLabels[item]}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetFilters}
                        >
                            Reset
                        </Button>
                        <Button type="button" onClick={applyFilters}>
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
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Simbol</TableHead>
                                    <TableHead>Dipakai</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currencies.data.length > 0 ? (
                                    currencies.data.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {(currencies.from ?? 1) + index}
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
                                                                    onClick={() =>
                                                                        openEditSheet(
                                                                            item,
                                                                        )
                                                                    }
                                                                >
                                                                    <SquarePen className="h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                            {canDelete &&
                                                            item.is_active ? (
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        deactivateCurrency(
                                                                            item,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Nonaktifkan
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
                                            <TableCell className="font-semibold tracking-wide">
                                                {item.code}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {item.name}
                                                    </p>
                                                    {item.notes ? (
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {item.notes}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {formatRate(
                                                            item.conversion_rate,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        1 {item.code} ={' '}
                                                        {formatRate(
                                                            item.conversion_rate,
                                                        )}{' '}
                                                        IDR
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                                                    {formatUsage(
                                                        item.usage_count,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.is_active ? activeStatusClass : inactiveStatusClass}`}
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
                                            colSpan={7}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            Data currency belum ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {currencies.links.length > 3 ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
                            <p className="text-muted-foreground">
                                Menampilkan {currencies.from ?? 0} -{' '}
                                {currencies.to ?? 0} dari {currencies.total}{' '}
                                currency
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {currencies.links.map((link, index) => (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => {
                                            if (!link.url) {
                                                return;
                                            }

                                            router.get(
                                                link.url,
                                                {},
                                                {
                                                    preserveScroll: true,
                                                    preserveState: true,
                                                },
                                            );
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <Sheet
                open={editingItem !== null}
                onOpenChange={(open) => !open && closeSheet()}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-xl"
                >
                    <SheetHeader>
                        <SheetTitle>
                            {editingItem === 'new'
                                ? 'Tambah Currency'
                                : 'Edit Currency'}
                        </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="grid gap-4 md:grid-cols-[120px,1fr]">
                                <div>
                                    <Label className="mb-1.5 block">Kode</Label>
                                    <Input
                                        value={form.data.code}
                                        onChange={(event) =>
                                            form.setData(
                                                'code',
                                                normalizeCode(
                                                    event.target.value,
                                                ),
                                            )
                                        }
                                        maxLength={3}
                                        placeholder="IDR"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Gunakan 3 huruf kapital.
                                    </p>
                                    {form.errors.code ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.code}
                                        </p>
                                    ) : null}
                                </div>
                                <div>
                                    <Label className="mb-1.5 block">
                                        Nama Currency
                                    </Label>
                                    <Input
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Indonesian Rupiah"
                                    />
                                    {form.errors.name ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.name}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            <div>
                                <Label className="mb-1.5 block">
                                    Nominal Converter
                                </Label>
                                <Input
                                    type="number"
                                    min="0.000001"
                                    step="0.000001"
                                    value={form.data.conversion_rate}
                                    onChange={(event) =>
                                        form.setData(
                                            'conversion_rate',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="1"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Isi nilai tukar ke IDR. Contoh: 1 untuk IDR
                                    atau 16.500 untuk USD.
                                </p>
                                {form.errors.conversion_rate ? (
                                    <p className="mt-1 text-xs text-destructive">
                                        {form.errors.conversion_rate}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <Label className="mb-1.5 block">Catatan</Label>
                                <Textarea
                                    value={form.data.notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Opsional, misalnya untuk operasional di negara tertentu."
                                    className="min-h-28"
                                />
                                {form.errors.notes ? (
                                    <p className="mt-1 text-xs text-destructive">
                                        {form.errors.notes}
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                                <Checkbox
                                    id="is_active_currency"
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            'is_active',
                                            checked === true,
                                        )
                                    }
                                />
                                <Label
                                    htmlFor="is_active_currency"
                                    className="cursor-pointer"
                                >
                                    Aktifkan currency ini
                                </Label>
                            </div>
                        </div>

                        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background/95 pt-4 pb-1 backdrop-blur">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeSheet}
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

function normalizeSearch(value: string): string {
    return value.toUpperCase();
}
