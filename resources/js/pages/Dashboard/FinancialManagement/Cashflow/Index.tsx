import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
    Download,
    MoreHorizontal,
    Plus,
    SquarePen,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type CashflowType = 'income' | 'expense';

type Attachment = {
    id: number;
    file_path: string;
    file_name: string;
    file_size: number;
};

type Cashflow = {
    id: number;
    transaction_date: string;
    type: CashflowType;
    amount: number;
    category: string;
    description: string | null;
    attachments: Attachment[];
};

type CashflowFormData = {
    transaction_date: string;
    type: CashflowType;
    amount: string;
    category: string;
    description: string;
    attachments: File[];
    deleted_attachment_ids: number[];
};

type Props = {
    cashflows: Cashflow[];
    filters: {
        date_start: string;
        date_end: string;
        category: string;
        type: 'income' | 'expense' | 'all';
    };
    summary: {
        total_income: number;
        total_expense: number;
        balance: number;
    };
    categories: string[];
};

function toCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

function defaultForm(): CashflowFormData {
    return {
        transaction_date: '',
        type: 'income',
        amount: '',
        category: '',
        description: '',
        attachments: [],
        deleted_attachment_ids: [],
    };
}

function formatFileSize(size: number): string {
    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CashflowIndex({
    cashflows,
    filters,
    summary,
    categories,
}: Props) {
    const { can } = usePermission('cashflow');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const canExport = can('export');

    const [editingItem, setEditingItem] = useState<Cashflow | 'new' | null>(
        null,
    );
    const [dateStart, setDateStart] = useState(filters.date_start ?? '');
    const [dateEnd, setDateEnd] = useState(filters.date_end ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [type, setType] = useState(filters.type ?? 'all');
    const [existingAttachments, setExistingAttachments] = useState<
        Attachment[]
    >([]);
    const [newAttachmentFiles, setNewAttachmentFiles] = useState<File[]>([]);

    const form = useForm<CashflowFormData>(defaultForm());

    const attachmentPreviews = useMemo(
        () =>
            newAttachmentFiles.map((file) => ({
                name: file.name,
                size: file.size,
                src: URL.createObjectURL(file),
            })),
        [newAttachmentFiles],
    );

    useEffect(() => {
        return () => {
            attachmentPreviews.forEach((preview) =>
                URL.revokeObjectURL(preview.src),
            );
        };
    }, [attachmentPreviews]);

    function openCreateSheet(): void {
        form.setData(defaultForm());
        form.clearErrors();
        setExistingAttachments([]);
        setNewAttachmentFiles([]);
        setEditingItem('new');
    }

    function openEditSheet(item: Cashflow): void {
        form.setData({
            transaction_date: item.transaction_date,
            type: item.type,
            amount: String(item.amount),
            category: item.category,
            description: item.description ?? '',
            attachments: [],
            deleted_attachment_ids: [],
        });
        form.clearErrors();
        setExistingAttachments(item.attachments);
        setNewAttachmentFiles([]);
        setEditingItem(item);
    }

    function applyFilters(): void {
        router.get(
            '/admin/financial-management/cashflow',
            {
                date_start: dateStart,
                date_end: dateEnd,
                category,
                type,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function resetFilters(): void {
        setDateStart('');
        setDateEnd('');
        setCategory('');
        setType('all');
        router.get(
            '/admin/financial-management/cashflow',
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    function exportPdf(): void {
        const params = new URLSearchParams();
        if (dateStart) {
            params.set('date_start', dateStart);
        }
        if (dateEnd) {
            params.set('date_end', dateEnd);
        }
        if (category) {
            params.set('category', category);
        }
        if (type !== 'all') {
            params.set('type', type);
        }

        const query = params.toString();
        const href =
            '/admin/financial-management/cashflow/pdf' +
            (query ? `?${query}` : '');
        window.open(href, '_blank');
    }

    function submit(event: React.FormEvent): void {
        event.preventDefault();

        if (editingItem === 'new') {
            router.post('/admin/financial-management/cashflow', form.data, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Data cashflow berhasil ditambahkan.');
                    setEditingItem(null);
                },
            });
            return;
        }

        if (editingItem) {
            router.post(
                `/admin/financial-management/cashflow/${editingItem.id}`,
                {
                    ...form.data,
                    _method: 'put',
                },
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Data cashflow berhasil diperbarui.');
                        setEditingItem(null);
                    },
                },
            );
        }
    }

    function removeExistingAttachment(attachmentId: number): void {
        setExistingAttachments((current) =>
            current.filter((item) => item.id !== attachmentId),
        );
        form.setData('deleted_attachment_ids', [
            ...form.data.deleted_attachment_ids,
            attachmentId,
        ]);
    }

    function removeNewAttachment(index: number): void {
        const remainingFiles = newAttachmentFiles.filter(
            (_, idx) => idx !== index,
        );
        setNewAttachmentFiles(remainingFiles);
        form.setData('attachments', remainingFiles);
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Cashflow',
                    href: '/admin/financial-management/cashflow',
                },
            ]}
        >
            <Head title="Cashflow" />

            <div className="space-y-4 p-4 md:p-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Cashflow
                        </h1>
                    </div>
                    {canCreate ? (
                        <Button onClick={openCreateSheet}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Cashflow
                        </Button>
                    ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-3.5">
                            <p className="text-xs text-muted-foreground md:text-sm">
                                Total Pemasukan
                            </p>
                            <p className="mt-1 text-xl font-semibold text-emerald-600 md:text-2xl">
                                {toCurrency(summary.total_income)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-3.5">
                            <p className="text-xs text-muted-foreground md:text-sm">
                                Total Pengeluaran
                            </p>
                            <p className="mt-1 text-xl font-semibold text-rose-600 md:text-2xl">
                                {toCurrency(summary.total_expense)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-3.5">
                            <p className="text-xs text-muted-foreground md:text-sm">
                                Saldo Cashflow
                            </p>
                            <p
                                className={`mt-1 text-xl font-semibold md:text-2xl ${summary.balance >= 0 ? 'text-foreground' : 'text-rose-600'}`}
                            >
                                {toCurrency(summary.balance)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <Input
                                type="date"
                                value={dateStart}
                                onChange={(event) =>
                                    setDateStart(event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Input
                                type="date"
                                value={dateEnd}
                                onChange={(event) =>
                                    setDateEnd(event.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Select
                                value={category || 'all'}
                                onValueChange={(value) =>
                                    setCategory(value === 'all' ? '' : value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua kategori
                                    </SelectItem>
                                    {categories.map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select
                                value={type}
                                onValueChange={(value) =>
                                    setType(
                                        value as 'income' | 'expense' | 'all',
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="income">
                                        Pemasukan
                                    </SelectItem>
                                    <SelectItem value="expense">
                                        Pengeluaran
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        {canExport ? (
                            <Button variant="outline" onClick={exportPdf}>
                                <Download className="mr-2 h-4 w-4" />
                                Export PDF
                            </Button>
                        ) : null}
                        <Button variant="outline" onClick={resetFilters}>
                            Reset
                        </Button>
                        <Button onClick={applyFilters}>Terapkan</Button>
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
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Nominal</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead>Bukti</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cashflows.length > 0 ? (
                                    cashflows.map((item, index) => (
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
                                                            {canDelete ? (
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        if (
                                                                            window.confirm(
                                                                                'Hapus data cashflow ini?',
                                                                            )
                                                                        ) {
                                                                            router.delete(
                                                                                `/admin/financial-management/cashflow/${item.id}`,
                                                                                {
                                                                                    preserveScroll: true,
                                                                                    onSuccess:
                                                                                        () =>
                                                                                            toast.success(
                                                                                                'Data cashflow berhasil dihapus.',
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
                                                    '-'
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.transaction_date}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        item.type === 'income'
                                                            ? 'default'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {item.type === 'income'
                                                        ? 'Pemasukan'
                                                        : 'Pengeluaran'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {toCurrency(item.amount)}
                                            </TableCell>
                                            <TableCell>
                                                {item.category}
                                            </TableCell>
                                            <TableCell className="max-w-xs text-muted-foreground">
                                                {item.description || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {item.attachments.length} foto
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            Belum ada data cashflow.
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
                    className="w-full overflow-y-auto sm:max-w-3xl"
                >
                    <SheetHeader>
                        <SheetTitle>
                            {editingItem === 'new'
                                ? 'Tambah Cashflow'
                                : 'Edit Cashflow'}
                        </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <Label className="mb-1.5 block">
                                        Tanggal transaksi
                                    </Label>
                                    <Input
                                        type="date"
                                        value={form.data.transaction_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'transaction_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    {form.errors.transaction_date ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.transaction_date}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <Label className="mb-1.5 block">Tipe</Label>
                                    <Select
                                        value={form.data.type}
                                        onValueChange={(value) =>
                                            form.setData(
                                                'type',
                                                value as CashflowType,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tipe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">
                                                Pemasukan
                                            </SelectItem>
                                            <SelectItem value="expense">
                                                Pengeluaran
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="mb-1.5 block">
                                        Nominal
                                    </Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={form.data.amount}
                                        onChange={(event) =>
                                            form.setData(
                                                'amount',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Contoh: 2500000"
                                    />
                                    {form.errors.amount ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.amount}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <Label className="mb-1.5 block">
                                        Kategori
                                    </Label>
                                    <Input
                                        value={form.data.category}
                                        onChange={(event) =>
                                            form.setData(
                                                'category',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Operasional"
                                    />
                                    {form.errors.category ? (
                                        <p className="mt-1 text-xs text-destructive">
                                            {form.errors.category}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="mb-4 space-y-1">
                                <p className="text-sm font-semibold text-foreground">
                                    Catatan
                                </p>
                            </div>

                            <div>
                                <Label className="mb-1.5 block">Catatan</Label>
                                <Textarea
                                    rows={4}
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="mb-4 space-y-1">
                                <p className="text-sm font-semibold text-foreground">
                                    Bukti Transaksi
                                </p>
                            </div>

                            <div>
                                <Label className="mb-1.5 block">
                                    Upload bukti transaksi
                                </Label>
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={(event) => {
                                        const files = Array.from(
                                            event.target.files ?? [],
                                        );
                                        setNewAttachmentFiles(files);
                                        form.setData('attachments', files);
                                    }}
                                />
                                {form.errors.attachments ? (
                                    <p className="mt-1 text-xs text-destructive">
                                        {form.errors.attachments}
                                    </p>
                                ) : null}
                            </div>

                            {existingAttachments.length > 0 ? (
                                <div className="mt-4 space-y-2">
                                    <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Foto bukti saat ini
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                        {existingAttachments.map(
                                            (attachment) => (
                                                <div
                                                    key={attachment.id}
                                                    className="relative overflow-hidden rounded-xl border"
                                                >
                                                    <img
                                                        src={
                                                            attachment.file_path
                                                        }
                                                        alt={
                                                            attachment.file_name
                                                        }
                                                        className="h-28 w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute top-1 right-1 rounded-full bg-black/65 p-1 text-white"
                                                        onClick={() =>
                                                            removeExistingAttachment(
                                                                attachment.id,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            ) : null}

                            {attachmentPreviews.length > 0 ? (
                                <div className="mt-4 space-y-2">
                                    <Label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        Preview foto baru
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                        {attachmentPreviews.map(
                                            (preview, index) => (
                                                <div
                                                    key={`${preview.src}-${index}`}
                                                    className="relative overflow-hidden rounded-xl border"
                                                >
                                                    <img
                                                        src={preview.src}
                                                        alt={`Preview ${index + 1}`}
                                                        className="h-28 w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute top-1 right-1 rounded-full bg-black/65 p-1 text-white"
                                                        onClick={() =>
                                                            removeNewAttachment(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                    <div className="space-y-0.5 bg-muted/35 px-2 py-1 text-[11px]">
                                                        <p className="truncate font-medium">
                                                            {preview.name}
                                                        </p>
                                                        <p className="text-muted-foreground">
                                                            {formatFileSize(
                                                                preview.size,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            ) : null}
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
