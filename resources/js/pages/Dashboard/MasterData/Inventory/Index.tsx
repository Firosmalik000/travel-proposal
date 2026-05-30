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
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type InventoryItem = {
    id: number;
    product_id: number;
    product_code: string;
    product_name: string;
    product_type: string;
    unit: string;
    quantity: number;
    notes: string | null;
    is_active: boolean;
};

type ProductOption = {
    id: number;
    code: string;
    name: string;
    product_type: string;
};

type Props = {
    inventoryItems: { data: InventoryItem[]; total: number };
    filters: { search: string; status: string; product_type: string };
    stats: { total: number; active: number; inactive: number };
    productOptions: ProductOption[];
    productTypeOptions: Array<{ value: string; label: string }>;
};

type InventoryFormData = {
    product_id: string;
    quantity: number;
    stock_adjustment: number;
    notes: string;
    is_active: boolean;
};

function buildFormData(item: InventoryItem | null): InventoryFormData {
    return {
        product_id: item?.product_id ? String(item.product_id) : '',
        quantity: item?.quantity ?? 0,
        stock_adjustment: 0,
        notes: item?.notes ?? '',
        is_active: item?.is_active ?? true,
    };
}

export default function InventoryIndex({
    inventoryItems,
    filters,
    stats,
    productOptions,
    productTypeOptions,
}: Props) {
    const { can } = usePermission('inventory');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');

    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status || 'all');
    const [productTypeFilter, setProductTypeFilter] = useState(
        filters.product_type || 'all',
    );
    const [editingItem, setEditingItem] = useState<
        InventoryItem | 'new' | null
    >(null);
    const [productSearch, setProductSearch] = useState('');
    const form = useForm<InventoryFormData>(buildFormData(null));
    const filteredProductOptions = useMemo(() => {
        const query = productSearch.trim().toLowerCase();
        if (query === '') {
            return productOptions;
        }

        return productOptions.filter((product) =>
            `${product.code} ${product.name} ${product.product_type}`
                .toLowerCase()
                .includes(query),
        );
    }, [productOptions, productSearch]);

    function submit(event: React.FormEvent): void {
        event.preventDefault();
        if (editingItem === 'new') {
            router.post('/admin/master-data/inventory', form.data, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Data inventory berhasil ditambahkan.');
                    setEditingItem(null);
                },
            });
            return;
        }
        if (editingItem) {
            router.put(
                `/admin/master-data/inventory/${editingItem.id}`,
                form.data,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Data inventory berhasil diperbarui.');
                        setEditingItem(null);
                    },
                },
            );
        }
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { label: 'Inventory', href: '/admin/master-data/inventory' },
            ]}
        >
            <Head title="Master Data Inventory" />
            <div className="space-y-4 p-4 md:p-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Inventory
                        </h1>
                    </div>
                    {canCreate ? (
                        <Button
                            onClick={() => {
                                form.setData(buildFormData(null));
                                form.clearErrors();
                                setProductSearch('');
                                setEditingItem('new');
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Product ke Inventory
                        </Button>
                    ) : null}
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-12">
                        <div className="lg:col-span-6">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari code, nama product, tipe, atau catatan..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Aktif
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Nonaktif
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="lg:col-span-3">
                            <Select
                                value={productTypeFilter}
                                onValueChange={setProductTypeFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua tipe
                                    </SelectItem>
                                    {productTypeOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                setStatus('all');
                                setProductTypeFilter('all');
                                router.get(
                                    '/admin/master-data/inventory',
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
                            type="button"
                            onClick={() =>
                                router.get(
                                    '/admin/master-data/inventory',
                                    {
                                        search,
                                        status,
                                        product_type: productTypeFilter,
                                    },
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
                        <Table className="min-w-[980px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14 text-center">
                                        No
                                    </TableHead>
                                    <TableHead className="w-20 text-right">
                                        Aksi
                                    </TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventoryItems.data.length > 0 ? (
                                    inventoryItems.data.map((item, index) => (
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
                                                                            buildFormData(
                                                                                item,
                                                                            ),
                                                                        );
                                                                        form.clearErrors();
                                                                        setProductSearch(
                                                                            '',
                                                                        );
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
                                                                                `Hapus inventory "${item.product_name}"?`,
                                                                            )
                                                                        ) {
                                                                            router.delete(
                                                                                `/admin/master-data/inventory/${item.id}`,
                                                                                {
                                                                                    preserveScroll: true,
                                                                                    onSuccess:
                                                                                        () =>
                                                                                            toast.success(
                                                                                                'Data inventory berhasil dihapus.',
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
                                            <TableCell>
                                                <p className="font-medium">
                                                    {item.product_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.product_code}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {item.product_type || '-'}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {item.quantity}
                                            </TableCell>
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
                                            colSpan={6}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            {filters.search
                                                ? 'Data inventory tidak ditemukan.'
                                                : 'Belum ada data inventory.'}
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
                                ? 'Tambah Inventory'
                                : 'Edit Inventory'}
                        </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="grid gap-5">
                                {editingItem && editingItem !== 'new' ? (
                                    <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
                                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Stok Saat Ini
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                            {editingItem.quantity}
                                        </p>
                                    </div>
                                ) : null}
                                <div>
                                    <Label className="mb-1.5 block">
                                        Product
                                    </Label>
                                    <Select
                                        value={form.data.product_id}
                                        onValueChange={(value) =>
                                            form.setData('product_id', value)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="sticky top-0 z-10 border-b bg-popover p-2">
                                                <Input
                                                    value={productSearch}
                                                    onChange={(event) =>
                                                        setProductSearch(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Cari product..."
                                                    className="h-8"
                                                />
                                            </div>
                                            {filteredProductOptions.length >
                                            0 ? (
                                                filteredProductOptions.map(
                                                    (product) => (
                                                        <SelectItem
                                                            key={product.id}
                                                            value={String(
                                                                product.id,
                                                            )}
                                                        >
                                                            {product.code} -{' '}
                                                            {product.name}
                                                        </SelectItem>
                                                    ),
                                                )
                                            ) : (
                                                <div className="px-2 py-2 text-xs text-muted-foreground">
                                                    Product tidak ditemukan.
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.product_id ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.product_id}
                                        </p>
                                    ) : null}
                                </div>
                                <div>
                                    <Label className="mb-1.5 block">
                                        {editingItem === 'new'
                                            ? 'Stok Awal'
                                            : 'Penyesuaian Stok (+/-)'}
                                    </Label>
                                    <Input
                                        type="number"
                                        min={
                                            editingItem === 'new'
                                                ? 0
                                                : undefined
                                        }
                                        value={
                                            editingItem === 'new'
                                                ? form.data.quantity
                                                : form.data.stock_adjustment
                                        }
                                        onChange={(event) =>
                                            editingItem === 'new'
                                                ? form.setData(
                                                      'quantity',
                                                      Number(
                                                          event.target.value,
                                                      ),
                                                  )
                                                : form.setData(
                                                      'stock_adjustment',
                                                      Number(
                                                          event.target.value,
                                                      ),
                                                  )
                                        }
                                    />
                                    {form.errors.quantity ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.quantity}
                                        </p>
                                    ) : null}
                                    {form.errors.stock_adjustment ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.stock_adjustment}
                                        </p>
                                    ) : null}
                                </div>
                                <div>
                                    <Label className="mb-1.5 block">
                                        Catatan
                                    </Label>
                                    <Textarea
                                        value={form.data.notes}
                                        onChange={(event) =>
                                            form.setData(
                                                'notes',
                                                event.target.value,
                                            )
                                        }
                                        rows={4}
                                    />
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                                    <Checkbox
                                        id="is_active_inventory"
                                        checked={form.data.is_active}
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'is_active',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="is_active_inventory"
                                        className="cursor-pointer"
                                    >
                                        Aktif
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background/95 pt-4 pb-1 backdrop-blur">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingItem(null)}
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
