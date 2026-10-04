import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permission';
import { router, useForm } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';
import { toast } from 'sonner';

export type TransactionType = {
    id: number;
    code: string;
    name: string;
    applies_to: 'transfer' | 'manual_journal';
    description: string | null;
    is_active: boolean;
    is_system: boolean;
    sort_order: number;
    transactions_count: number;
};

type Props = {
    types: TransactionType[];
    can: ReturnType<typeof usePermission>['can'];
    isSuperAdmin: boolean;
};

const appliesToLabels: Record<TransactionType['applies_to'], string> = {
    transfer: 'Perpindahan dana',
    manual_journal: 'Jurnal manual',
};

export default function TransactionTypesSection({
    types,
    can,
    isSuperAdmin,
}: Props) {
    const [editingType, setEditingType] = useState<TransactionType | null>(
        null,
    );
    const [showForm, setShowForm] = useState(false);
    const form = useForm({
        code: '',
        name: '',
        applies_to: 'transfer' as TransactionType['applies_to'],
        description: '',
        is_active: true,
        sort_order: '0',
    });

    const openForm = (type?: TransactionType) => {
        setEditingType(type ?? null);
        form.setData(
            type
                ? {
                      code: type.code,
                      name: type.name,
                      applies_to: type.applies_to,
                      description: type.description ?? '',
                      is_active: type.is_active,
                      sort_order: type.sort_order.toString(),
                  }
                : {
                      code: '',
                      name: '',
                      applies_to: 'transfer',
                      description: '',
                      is_active: true,
                      sort_order: '0',
                  },
        );
        form.clearErrors();
        setShowForm(true);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    editingType
                        ? 'Jenis transaksi diperbarui.'
                        : 'Jenis transaksi ditambahkan.',
                );
                setShowForm(false);
                form.reset();
            },
        };

        if (editingType) {
            form.put(
                `/admin/financial-management/ledger/transaction-types/${editingType.id}`,
                options,
            );
        } else {
            form.post(
                '/admin/financial-management/ledger/transaction-types',
                options,
            );
        }
    };

    const destroyType = (type: TransactionType) => {
        if (
            !window.confirm(
                `Hapus jenis transaksi “${type.name}”? Tindakan ini hanya diizinkan jika jenis belum pernah digunakan.`,
            )
        ) {
            return;
        }

        router.delete(
            `/admin/financial-management/ledger/transaction-types/${type.id}`,
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Jenis transaksi dihapus.'),
            },
        );
    };

    const formError = (form.errors as Record<string, string>).transaction_type;

    return (
        <div className="grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 font-semibold">
                        <Tags className="size-4" />
                        Master jenis transaksi
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Atur pilihan jenis untuk perpindahan dana dan jurnal
                        manual agar pencatatan serta audit konsisten.
                    </p>
                </div>
                {isSuperAdmin && can('create') && (
                    <Button className="min-h-11" onClick={() => openForm()}>
                        <Plus className="size-4" />
                        Tambah jenis
                    </Button>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <Summary label="Total jenis" value={types.length} />
                <Summary
                    label="Jenis aktif"
                    value={types.filter((type) => type.is_active).length}
                />
                <Summary
                    label="Jenis custom"
                    value={types.filter((type) => !type.is_system).length}
                />
            </div>

            <Alert>
                <AlertDescription>
                    Jenis bawaan sistem dilindungi. Jenis yang sudah dipakai
                    transaksi tidak dapat dihapus; nonaktifkan agar histori
                    audit tetap utuh.
                </AlertDescription>
            </Alert>

            <Card>
                <CardContent className="overflow-x-auto p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-14 text-center">
                                    Aksi
                                </TableHead>
                                <TableHead>Jenis transaksi</TableHead>
                                <TableHead>Digunakan untuk</TableHead>
                                <TableHead className="text-right">
                                    Histori
                                </TableHead>
                                <TableHead className="text-center">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {types.map((type) => (
                                <TableRow key={type.id}>
                                    <TableCell className="text-center">
                                        {!type.is_system &&
                                        isSuperAdmin &&
                                        (can('edit') || can('delete')) ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        aria-label={`Aksi ${type.name}`}
                                                        className="size-9"
                                                        size="icon"
                                                        variant="ghost"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    {can('edit') && (
                                                        <DropdownMenuItem
                                                            className="cursor-pointer gap-2"
                                                            onClick={() =>
                                                                openForm(type)
                                                            }
                                                        >
                                                            <Pencil className="size-4" />
                                                            Edit jenis
                                                        </DropdownMenuItem>
                                                    )}
                                                    {can('delete') &&
                                                        type.transactions_count ===
                                                            0 && (
                                                            <DropdownMenuItem
                                                                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                                                                onClick={() =>
                                                                    destroyType(
                                                                        type,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Hapus jenis
                                                            </DropdownMenuItem>
                                                        )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="grid gap-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium">
                                                    {type.name}
                                                </span>
                                                {type.is_system && (
                                                    <Badge variant="secondary">
                                                        Sistem
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {type.code}
                                            </span>
                                            {type.description && (
                                                <span className="max-w-xl text-xs text-muted-foreground">
                                                    {type.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {appliesToLabels[type.applies_to]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {type.transactions_count}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge
                                            variant={
                                                type.is_active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {type.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog
                open={showForm}
                onOpenChange={(open) => {
                    setShowForm(open);
                    if (!open) form.clearErrors();
                }}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingType
                                ? 'Edit jenis transaksi'
                                : 'Tambah jenis transaksi'}
                        </DialogTitle>
                        <DialogDescription>
                            Jenis aktif akan tersedia pada form transaksi yang
                            sesuai.
                        </DialogDescription>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={submit}>
                        {formError && (
                            <Alert variant="destructive">
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        )}
                        <FormField error={form.errors.name} label="Nama jenis">
                            <Input
                                aria-label="Nama jenis"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                        </FormField>
                        {!editingType && (
                            <FormField
                                error={form.errors.code}
                                label="Kode jenis (opsional)"
                            >
                                <Input
                                    aria-label="Kode jenis"
                                    placeholder="Dibuat otomatis dari nama"
                                    value={form.data.code}
                                    onChange={(event) =>
                                        form.setData('code', event.target.value)
                                    }
                                />
                            </FormField>
                        )}
                        <FormField
                            error={form.errors.applies_to}
                            label="Digunakan untuk"
                        >
                            <Select
                                value={form.data.applies_to}
                                onValueChange={(value) =>
                                    form.setData(
                                        'applies_to',
                                        value as TransactionType['applies_to'],
                                    )
                                }
                            >
                                <SelectTrigger aria-label="Digunakan untuk">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="transfer">
                                        Perpindahan dana
                                    </SelectItem>
                                    <SelectItem value="manual_journal">
                                        Jurnal manual
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField
                            error={form.errors.description}
                            label="Keterangan"
                        >
                            <Input
                                aria-label="Keterangan"
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                        </FormField>
                        <FormField
                            error={form.errors.sort_order}
                            label="Urutan tampil"
                        >
                            <Input
                                aria-label="Urutan tampil"
                                min="0"
                                type="number"
                                value={form.data.sort_order}
                                onChange={(event) =>
                                    form.setData(
                                        'sort_order',
                                        event.target.value,
                                    )
                                }
                            />
                        </FormField>
                        <div className="flex min-h-11 items-center justify-between gap-4 rounded-lg border p-3">
                            <div>
                                <Label htmlFor="transaction-type-active">
                                    Aktif
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Jenis aktif tersedia pada form transaksi.
                                </p>
                            </div>
                            <Switch
                                checked={form.data.is_active}
                                id="transaction-type-active"
                                onCheckedChange={(checked) =>
                                    form.setData('is_active', checked)
                                }
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowForm(false)}
                            >
                                Batal
                            </Button>
                            <Button disabled={form.processing}>
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan jenis'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Summary({ label, value }: { label: string; value: number }) {
    return (
        <Card>
            <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                    {value}
                </p>
            </CardContent>
        </Card>
    );
}

function FormField({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
