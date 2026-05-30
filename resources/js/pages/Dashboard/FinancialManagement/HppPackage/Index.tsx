import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
    Calculator,
    Eye,
    MoreHorizontal,
    RotateCcw,
    SquarePen,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type Row = {
    id: number;
    travel_package_id: number;
    departure_schedule_id: number | null;
    package_name: string;
    package_code: string;
    package_price: number;
    package_original_price: number | null;
    package_discount_percent: number | null;
    departure_date: string | null;
    departure_city: string | null;
    booking_count: number;
    customer_count: number;
    hotel_total: number;
    product_total: number;
    manual_adjustment: number;
    grand_total: number;
    hpp_per_customer: number | null;
    currency: string;
    warnings: string[];
    notes: string | null;
    calculated_at: string | null;
    items: Array<{
        id: number;
        cost_type: string;
        label: string;
        description: string | null;
        quantity: number;
        unit_price: number;
        total_price: number;
        meta?: Record<string, unknown>;
    }>;
};

type Props = {
    rows: Row[];
    sourceRows: Array<{
        travel_package_id: number;
        departure_schedule_id: number;
        package_name: string;
        package_code: string;
        package_price: number;
        package_original_price: number | null;
        package_discount_percent: number | null;
        departure_date: string | null;
        departure_city: string | null;
        total_bookings: number;
        total_customers: number;
        total_hotels_assigned: number;
        latest_calculation: {
            id: number;
            calculated_at: string | null;
            hotel_total: number;
            product_total: number;
            manual_adjustment: number;
            grand_total: number;
            hpp_per_customer: number | null;
            currency: string;
            warnings: string[];
            notes: string | null;
            items: Array<{
                id: number;
                cost_type: string;
                label: string;
                description: string | null;
                quantity: number;
                unit_price: number;
                total_price: number;
                meta?: Record<string, unknown>;
            }>;
        } | null;
    }>;
    packages: Array<{ id: number; code: string; name: string }>;
    schedules: Array<{
        id: number;
        travel_package_id: number;
        departure_date: string | null;
        departure_city: string | null;
    }>;
    filters: {
        travel_package_id: number | null;
        departure_schedule_id: number | null;
    };
};

type GenerateForm = {
    travel_package_id: string;
    departure_schedule_id: string;
    notes: string;
};

type UpdateForm = {
    package_price: string;
    notes: string;
};

const formatCurrency = (value: number, currency: string): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency || 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const mapSourceToRow = (source: Props['sourceRows'][number]): Row => ({
    id: source.latest_calculation?.id ?? 0,
    travel_package_id: source.travel_package_id,
    departure_schedule_id: source.departure_schedule_id,
    package_name: source.package_name,
    package_code: source.package_code,
    package_price: source.package_price,
    package_original_price: source.package_original_price,
    package_discount_percent: source.package_discount_percent,
    departure_date: source.departure_date,
    departure_city: source.departure_city,
    booking_count: source.total_bookings,
    customer_count: source.total_customers,
    hotel_total: source.latest_calculation?.hotel_total ?? 0,
    product_total: source.latest_calculation?.product_total ?? 0,
    manual_adjustment: source.latest_calculation?.manual_adjustment ?? 0,
    grand_total: source.latest_calculation?.grand_total ?? 0,
    hpp_per_customer: source.latest_calculation?.hpp_per_customer ?? null,
    currency: source.latest_calculation?.currency ?? 'IDR',
    warnings: source.latest_calculation?.warnings ?? [],
    notes: source.latest_calculation?.notes ?? null,
    calculated_at: source.latest_calculation?.calculated_at ?? null,
    items: source.latest_calculation?.items ?? [],
});

export default function HppPackageIndex({
    rows: _rows,
    sourceRows,
    packages,
    schedules,
    filters,
}: Props) {
    const { can } = usePermission('hpp_package');
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Row | null>(null);
    const [viewing, setViewing] = useState<Row | null>(null);
    const [packageFilter, setPackageFilter] = useState(
        filters.travel_package_id ? String(filters.travel_package_id) : 'all',
    );
    const [scheduleFilter, setScheduleFilter] = useState(
        filters.departure_schedule_id
            ? String(filters.departure_schedule_id)
            : 'all',
    );

    const generateForm = useForm<GenerateForm>({
        travel_package_id: '',
        departure_schedule_id: 'all',
        notes: '',
    });
    const updateForm = useForm<UpdateForm>({
        package_price: '0',
        notes: '',
    });

    const scheduleOptions = useMemo(() => {
        if (!generateForm.data.travel_package_id) {
            return schedules;
        }

        return schedules.filter(
            (schedule) =>
                schedule.travel_package_id ===
                Number(generateForm.data.travel_package_id),
        );
    }, [generateForm.data.travel_package_id, schedules]);

    const applyFilters = (): void => {
        router.get(
            '/admin/financial-management/hpp-package',
            {
                travel_package_id:
                    packageFilter === 'all' ? undefined : packageFilter,
                departure_schedule_id:
                    scheduleFilter === 'all' ? undefined : scheduleFilter,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const resetFilters = (): void => {
        setPackageFilter('all');
        setScheduleFilter('all');

        router.get(
            '/admin/financial-management/hpp-package',
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    const submitGenerate = (event: React.FormEvent): void => {
        event.preventDefault();

        if (!generateForm.data.travel_package_id) {
            toast.error('Pilih package terlebih dahulu.');
            return;
        }

        router.post(
            '/admin/financial-management/hpp-package',
            {
                ...generateForm.data,
                manual_adjustment: 0,
                departure_schedule_id:
                    generateForm.data.departure_schedule_id === 'all'
                        ? null
                        : generateForm.data.departure_schedule_id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('HPP package berhasil dibuat.');
                    setShowCreate(false);
                    generateForm.reset();
                },
            },
        );
    };

    const openEdit = (row: Row): void => {
        setEditing(row);
        updateForm.setData({
            package_price: String(row.package_price || 0),
            notes: row.notes ?? '',
        });
    };

    const submitEdit = (event: React.FormEvent): void => {
        event.preventDefault();
        if (!editing) {
            return;
        }

        router.put(
            `/admin/financial-management/hpp-package/${editing.id}`,
            {
                package_price: Number(updateForm.data.package_price || 0),
                notes: updateForm.data.notes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Harga package berhasil diperbarui.');
                    setEditing(null);
                },
            },
        );
    };

    const recalculate = (row: Row): void => {
        router.post(
            `/admin/financial-management/hpp-package/${row.id}/recalculate`,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('HPP package berhasil dihitung ulang.'),
            },
        );
    };

    const generateFromSource = (source: Props['sourceRows'][number]): void => {
        generateForm.setData({
            travel_package_id: String(source.travel_package_id),
            departure_schedule_id: String(source.departure_schedule_id),
            notes: '',
        });
        setShowCreate(true);
    };

    const hotelDetailItems = useMemo(
        () =>
            (viewing?.items ?? []).filter((item) => item.cost_type === 'hotel'),
        [viewing],
    );
    const productDetailItems = useMemo(
        () =>
            (viewing?.items ?? []).filter(
                (item) => item.cost_type === 'product',
            ),
        [viewing],
    );
    const grossRevenue = useMemo(() => {
        if (!viewing) {
            return 0;
        }

        return viewing.package_price * viewing.customer_count;
    }, [viewing]);
    const estimatedProfit = useMemo(() => {
        if (!viewing) {
            return 0;
        }

        return grossRevenue - viewing.grand_total;
    }, [grossRevenue, viewing]);

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Financial Management',
                    href: '/admin/financial-management/financial-report',
                },
                {
                    title: 'Cost Calculation / HPP Package',
                    href: '/admin/financial-management/hpp-package',
                },
            ]}
        >
            <Head title="Cost Calculation / HPP Package" />
            <div className="space-y-5 p-4 md:p-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                        Cost Calculation / HPP Package
                    </h1>
                    {can('create') ? (
                        <Button onClick={() => setShowCreate(true)}>
                            <Calculator className="mr-2 h-4 w-4" />
                            Generate HPP
                        </Button>
                    ) : null}
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label>Package</Label>
                            <Select
                                value={packageFilter}
                                onValueChange={setPackageFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua package" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua package
                                    </SelectItem>
                                    {packages.map((pkg) => (
                                        <SelectItem
                                            key={pkg.id}
                                            value={String(pkg.id)}
                                        >
                                            {pkg.code} - {pkg.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Jadwal</Label>
                            <Select
                                value={scheduleFilter}
                                onValueChange={setScheduleFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua jadwal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua jadwal
                                    </SelectItem>
                                    {schedules.map((schedule) => (
                                        <SelectItem
                                            key={schedule.id}
                                            value={String(schedule.id)}
                                        >
                                            {schedule.departure_date ?? '-'} -{' '}
                                            {schedule.departure_city ?? '-'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                    <Table className="min-w-[1200px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-14 text-center">
                                    No
                                </TableHead>
                                <TableHead className="w-20 text-right">
                                    Aksi
                                </TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Jadwal</TableHead>
                                <TableHead>Booking</TableHead>
                                <TableHead>Jamaah</TableHead>
                                <TableHead>Total HPP</TableHead>
                                <TableHead>HPP/Jamaah</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sourceRows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={12}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        Belum ada data booking/jadwal untuk
                                        dihitung.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sourceRows.map((source, index) => (
                                    <TableRow
                                        key={`${source.travel_package_id}-${source.departure_schedule_id}`}
                                        className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/20"
                                    >
                                        <TableCell className="text-center text-sm text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="ml-auto"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {source.latest_calculation ? (
                                                        <>
                                                            <DropdownMenuItem
                                                                className="font-medium text-primary focus:text-primary"
                                                                onClick={() =>
                                                                    setViewing(
                                                                        mapSourceToRow(
                                                                            source,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                Detail
                                                            </DropdownMenuItem>
                                                            {can('edit') ? (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        openEdit(
                                                                            mapSourceToRow(
                                                                                source,
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    <SquarePen className="h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                            {can('create') ? (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        recalculate(
                                                                            mapSourceToRow(
                                                                                source,
                                                                            ),
                                                                        )
                                                                    }
                                                                >
                                                                    <RotateCcw className="h-4 w-4" />
                                                                    Hitung Ulang
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                        </>
                                                    ) : can('create') ? (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                generateFromSource(
                                                                    source,
                                                                )
                                                            }
                                                        >
                                                            <Calculator className="h-4 w-4" />
                                                            Generate
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {source.package_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {source.package_code}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {source.departure_date ?? '-'} -{' '}
                                            {source.departure_city ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {source.total_bookings}
                                        </TableCell>
                                        <TableCell>
                                            {source.total_customers}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {source.latest_calculation
                                                ? formatCurrency(
                                                      source.latest_calculation
                                                          .grand_total,
                                                      source.latest_calculation
                                                          .currency,
                                                  )
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {source.latest_calculation
                                                ?.hpp_per_customer !== null &&
                                            source.latest_calculation
                                                ?.hpp_per_customer !== undefined
                                                ? formatCurrency(
                                                      source.latest_calculation
                                                          .hpp_per_customer,
                                                      source.latest_calculation
                                                          .currency,
                                                  )
                                                : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Sheet open={showCreate} onOpenChange={setShowCreate}>
                <SheetContent className="w-full overflow-y-auto bg-background sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>Generate HPP Package</SheetTitle>
                    </SheetHeader>
                    <form className="mt-6 space-y-4" onSubmit={submitGenerate}>
                        <div className="grid gap-2">
                            <Label>Package</Label>
                            <Select
                                value={generateForm.data.travel_package_id}
                                onValueChange={(value) =>
                                    generateForm.setData(
                                        'travel_package_id',
                                        value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih package" />
                                </SelectTrigger>
                                <SelectContent>
                                    {packages.map((pkg) => (
                                        <SelectItem
                                            key={pkg.id}
                                            value={String(pkg.id)}
                                        >
                                            {pkg.code} - {pkg.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Jadwal</Label>
                            <Select
                                value={generateForm.data.departure_schedule_id}
                                onValueChange={(value) =>
                                    generateForm.setData(
                                        'departure_schedule_id',
                                        value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua jadwal package ini" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua jadwal
                                    </SelectItem>
                                    {scheduleOptions.map((schedule) => (
                                        <SelectItem
                                            key={schedule.id}
                                            value={String(schedule.id)}
                                        >
                                            {schedule.departure_date ?? '-'} -{' '}
                                            {schedule.departure_city ?? '-'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Catatan</Label>
                            <Textarea
                                value={generateForm.data.notes}
                                onChange={(event) =>
                                    generateForm.setData(
                                        'notes',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={generateForm.processing}
                            >
                                Generate
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <SheetContent className="w-full overflow-y-auto bg-background sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>Edit Harga Package</SheetTitle>
                    </SheetHeader>
                    {editing ? (
                        <form className="mt-6 space-y-4" onSubmit={submitEdit}>
                            <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Harga Jual Saat Ini
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {formatCurrency(
                                            editing.package_price,
                                            editing.currency,
                                        )}
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Harga Jual Baru</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={updateForm.data.package_price}
                                        onChange={(event) =>
                                            updateForm.setData(
                                                'package_price',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Catatan</Label>
                                <Textarea
                                    value={updateForm.data.notes}
                                    onChange={(event) =>
                                        updateForm.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={updateForm.processing}
                                >
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    ) : null}
                </SheetContent>
            </Sheet>

            <Sheet
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <SheetContent className="w-full overflow-y-auto bg-background sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>Detail HPP Package</SheetTitle>
                    </SheetHeader>
                    {viewing ? (
                        <div className="mt-6 space-y-4">
                            {viewing.warnings.length > 0 ? (
                                <Alert>
                                    <AlertDescription>
                                        <ul className="list-disc pl-5">
                                            {viewing.warnings.map((warning) => (
                                                <li key={warning}>{warning}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            ) : null}
                            <div className="grid gap-3 rounded-xl border border-border/70 bg-card p-3 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Package
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {viewing.package_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {viewing.package_code}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Harga Package:{' '}
                                        {formatCurrency(
                                            viewing.package_price,
                                            viewing.currency,
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Harga Asli:{' '}
                                        {viewing.package_original_price !== null
                                            ? formatCurrency(
                                                  viewing.package_original_price,
                                                  viewing.currency,
                                              )
                                            : '-'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Diskon:{' '}
                                        {viewing.package_discount_percent !==
                                            null &&
                                        viewing.package_discount_percent > 0
                                            ? `${viewing.package_discount_percent}%`
                                            : '0%'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Jadwal
                                    </p>
                                    <p className="font-medium text-foreground">
                                        {viewing.departure_date ?? '-'} -{' '}
                                        {viewing.departure_city ?? '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 text-sm sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Hotel
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {formatCurrency(
                                            viewing.hotel_total,
                                            viewing.currency,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Product
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {formatCurrency(
                                            viewing.product_total,
                                            viewing.currency,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Grand Total
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {formatCurrency(
                                            viewing.grand_total,
                                            viewing.currency,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Omzet Kotor (Harga x Jamaah)
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {formatCurrency(
                                            grossRevenue,
                                            viewing.currency,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Keuntungan (Omzet - HPP)
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {formatCurrency(
                                            estimatedProfit,
                                            viewing.currency,
                                        )}
                                    </p>
                                </div>
                            </div>
                            {viewing.items.length === 0 ? (
                                <div className="rounded-md border p-3 text-sm text-muted-foreground">
                                    Belum ada hasil kalkulasi HPP untuk baris
                                    ini. Silakan klik Generate terlebih dahulu.
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2 rounded-xl border border-border/70 bg-card p-3">
                                        <div className="text-sm font-medium">
                                            Breakdown Hotel (per room type)
                                        </div>
                                        {hotelDetailItems.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Tidak ada komponen hotel.
                                            </p>
                                        ) : (
                                            <>
                                                {hotelDetailItems.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                                                        >
                                                            <span>
                                                                {item.label} (
                                                                {item.quantity}{' '}
                                                                room x{' '}
                                                                {formatCurrency(
                                                                    item.unit_price,
                                                                    viewing.currency,
                                                                )}
                                                                )
                                                            </span>
                                                            <span>
                                                                {formatCurrency(
                                                                    item.total_price,
                                                                    viewing.currency,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                                <div className="mt-2 border-t border-border/70 pt-2 text-sm font-semibold">
                                                    Subtotal Hotel:{' '}
                                                    {formatCurrency(
                                                        hotelDetailItems.reduce(
                                                            (total, item) =>
                                                                total +
                                                                item.total_price,
                                                            0,
                                                        ),
                                                        viewing.currency,
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="space-y-2 rounded-xl border border-border/70 bg-card p-3">
                                        <div className="text-sm font-medium">
                                            Breakdown Product Package
                                        </div>
                                        {productDetailItems.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                Tidak ada komponen product.
                                            </p>
                                        ) : (
                                            <>
                                                {productDetailItems.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
                                                        >
                                                            <span>
                                                                {item.label} (
                                                                {item.quantity}{' '}
                                                                x{' '}
                                                                {formatCurrency(
                                                                    item.unit_price,
                                                                    viewing.currency,
                                                                )}
                                                                )
                                                            </span>
                                                            <span>
                                                                {formatCurrency(
                                                                    item.total_price,
                                                                    viewing.currency,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                                <div className="mt-2 border-t border-border/70 pt-2 text-sm font-semibold">
                                                    Subtotal Product:{' '}
                                                    {formatCurrency(
                                                        productDetailItems.reduce(
                                                            (total, item) =>
                                                                total +
                                                                item.total_price,
                                                            0,
                                                        ),
                                                        viewing.currency,
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
