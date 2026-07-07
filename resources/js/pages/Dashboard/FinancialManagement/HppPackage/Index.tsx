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
    calculation_mode: string;
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
        calculation_mode?: string;
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
            calculation_mode: string;
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
    calculationModes: Array<{ value: string; label: string }>;
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
    calculation_mode: string;
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

const formatDate = (value: string | null | undefined): string => {
    if (!value) {
        return '-';
    }

    const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T00:00:00`
        : value;
    const parsedDate = new Date(normalizedValue);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsedDate);
};

const formatDateTime = (value: string | null | undefined): string => {
    if (!value) {
        return '-';
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(parsedDate);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const getMetaString = (
    meta: Record<string, unknown> | undefined,
    key: string,
): string | null => {
    if (!meta) {
        return null;
    }

    const value = meta[key];

    return typeof value === 'string' && value.trim() !== '' ? value : null;
};

const getMetaNumber = (
    meta: Record<string, unknown> | undefined,
    key: string,
): number | null => {
    if (!meta) {
        return null;
    }

    const value = meta[key];

    return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const calculationModeLabel = (value: string): string => {
    if (value === 'per_pax_multiplier') {
        return 'Per Pax Multiplier';
    }

    if (value === 'legacy_assignment') {
        return 'Legacy Assignment';
    }

    return value;
};

const buildHotelMetaRows = (
    meta: Record<string, unknown> | undefined,
): string[] => {
    const originalCurrency = getMetaString(meta, 'original_currency');
    const originalUnitPrice = getMetaNumber(meta, 'original_unit_price');
    const conversionRate = getMetaNumber(meta, 'conversion_rate_to_idr');
    const brokerName = getMetaString(meta, 'broker_name');
    const roomType = getMetaString(meta, 'room_type');
    const roomCount = getMetaNumber(meta, 'room_count');
    const multiplierPerPax = getMetaNumber(meta, 'multiplier_per_pax');
    const periodStart = getMetaString(meta, 'period_start');
    const periodEnd = getMetaString(meta, 'period_end');
    const details: string[] = [];

    if (brokerName) {
        details.push(`Broker: ${brokerName}`);
    }

    if (
        originalCurrency &&
        originalCurrency !== 'IDR' &&
        originalUnitPrice !== null
    ) {
        details.push(
            `Harga asli: ${formatCurrency(originalUnitPrice, originalCurrency)}`,
        );
    }

    if (
        originalCurrency &&
        originalCurrency !== 'IDR' &&
        conversionRate !== null
    ) {
        details.push(
            `Kurs: 1 ${originalCurrency} = ${formatCurrency(conversionRate, 'IDR')}`,
        );
    }

    if (roomType) {
        details.push(`Tipe kamar: ${roomType.toUpperCase()}`);
    }

    if (roomCount !== null) {
        details.push(`${roomCount} kamar`);
    }

    if (multiplierPerPax !== null) {
        details.push(`${multiplierPerPax}x per pax`);
    }

    if (periodStart || periodEnd) {
        details.push(
            `Sesi: ${formatDate(periodStart)} - ${formatDate(periodEnd)}`,
        );
    }

    return details;
};

const buildProductMetaRows = (
    meta: Record<string, unknown> | undefined,
): string[] => {
    const originalCurrency = getMetaString(meta, 'original_currency');
    const originalUnitPrice = getMetaNumber(meta, 'original_unit_price');
    const conversionRate = getMetaNumber(meta, 'conversion_rate_to_idr');
    const multiplierPerPax = getMetaNumber(meta, 'multiplier_per_pax');
    const customerCount = getMetaNumber(meta, 'customer_count');
    const details: string[] = [];

    if (
        originalCurrency &&
        originalCurrency !== 'IDR' &&
        originalUnitPrice !== null
    ) {
        details.push(
            `Harga asli: ${formatCurrency(originalUnitPrice, originalCurrency)}`,
        );
    }

    if (
        originalCurrency &&
        originalCurrency !== 'IDR' &&
        conversionRate !== null
    ) {
        details.push(
            `Kurs: 1 ${originalCurrency} = ${formatCurrency(conversionRate, 'IDR')}`,
        );
    }

    if (multiplierPerPax !== null && customerCount !== null) {
        details.push(`${multiplierPerPax}x per pax x ${customerCount} pax`);
    }

    return details;
};

const buildHotelFormula = (
    item: Row['items'][number],
    currency: string,
): string => {
    const itemMeta = isRecord(item.meta) ? item.meta : undefined;
    const roomType = getMetaString(itemMeta, 'room_type');
    const roomCount = getMetaNumber(itemMeta, 'room_count') ?? item.quantity;

    return `${roomCount} kamar${roomType ? ` ${roomType.toUpperCase()}` : ''} x ${formatCurrency(item.unit_price, currency)}`;
};

const buildProductFormula = (
    item: Row['items'][number],
    currency: string,
): string => {
    const itemMeta = isRecord(item.meta) ? item.meta : undefined;
    const multiplierPerPax = getMetaNumber(itemMeta, 'multiplier_per_pax');
    const customerCount = getMetaNumber(itemMeta, 'customer_count');

    if (multiplierPerPax !== null && customerCount !== null) {
        return `${multiplierPerPax}x/pax x ${customerCount} pax = ${item.quantity} x ${formatCurrency(item.unit_price, currency)}`;
    }

    return `${item.quantity} x ${formatCurrency(item.unit_price, currency)}`;
};

const mapSourceToRow = (source: Props['sourceRows'][number]): Row => ({
    id: source.latest_calculation?.id ?? 0,
    travel_package_id: source.travel_package_id,
    departure_schedule_id: source.departure_schedule_id,
    calculation_mode:
        source.latest_calculation?.calculation_mode ??
        source.calculation_mode ??
        'legacy_assignment',
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
    calculationModes,
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
        calculation_mode: 'per_pax_multiplier',
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
            calculation_mode: 'per_pax_multiplier',
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
    const currencyWarnings = useMemo(
        () =>
            (viewing?.warnings ?? []).filter((warning) =>
                warning.toLowerCase().includes('converter aktif ke idr'),
            ),
        [viewing],
    );
    const generalWarnings = useMemo(
        () =>
            (viewing?.warnings ?? []).filter(
                (warning) =>
                    !warning.toLowerCase().includes('converter aktif ke idr'),
            ),
        [viewing],
    );
    const hotelRoomSummary = useMemo(() => {
        const summary = new Map<
            string,
            {
                roomType: string;
                roomCount: number;
                totalPrice: number;
            }
        >();

        hotelDetailItems.forEach((item) => {
            const itemMeta = isRecord(item.meta) ? item.meta : undefined;
            const roomType = getMetaString(itemMeta, 'room_type') ?? 'lainnya';
            const roomCount = getMetaNumber(itemMeta, 'room_count') ?? 0;
            const existingSummary = summary.get(roomType) ?? {
                roomType,
                roomCount: 0,
                totalPrice: 0,
            };

            existingSummary.roomCount += roomCount;
            existingSummary.totalPrice += item.total_price;

            summary.set(roomType, existingSummary);
        });

        return Array.from(summary.values()).sort((first, second) =>
            first.roomType.localeCompare(second.roomType),
        );
    }, [hotelDetailItems]);
    const lineItemBreakdown = useMemo(
        () =>
            (viewing?.items ?? []).map((item) => ({
                id: item.id,
                category: item.cost_type === 'hotel' ? 'Hotel' : 'Product',
                label: item.label,
                formula:
                    item.cost_type === 'hotel'
                        ? buildHotelFormula(item, viewing?.currency ?? 'IDR')
                        : buildProductFormula(item, viewing?.currency ?? 'IDR'),
                detailRows:
                    item.cost_type === 'hotel'
                        ? buildHotelMetaRows(
                              isRecord(item.meta) ? item.meta : undefined,
                          )
                        : buildProductMetaRows(
                              isRecord(item.meta) ? item.meta : undefined,
                          ),
                totalPrice: item.total_price,
            })),
        [viewing],
    );

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
                            <Label>Mode Kalkulasi</Label>
                            <Select
                                value={generateForm.data.calculation_mode}
                                onValueChange={(value) =>
                                    generateForm.setData(
                                        'calculation_mode',
                                        value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih mode kalkulasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    {calculationModes.map((mode) => (
                                        <SelectItem
                                            key={mode.value}
                                            value={mode.value}
                                        >
                                            {mode.label}
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
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                                    Semua total dihitung dalam IDR
                                </span>
                                <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                                    Currency hasil kalkulasi: {viewing.currency}
                                </span>
                            </div>
                            {currencyWarnings.length > 0 ? (
                                <Alert className="border-rose-200 bg-rose-50/90 text-rose-900">
                                    <AlertDescription>
                                        <div className="mb-2 text-sm font-semibold">
                                            Converter currency belum lengkap.
                                            Total HPP belum final sebelum semua
                                            rate tersedia di master currency.
                                        </div>
                                        <ul className="list-disc space-y-1 pl-4 text-sm leading-6">
                                            {currencyWarnings.map((warning) => (
                                                <li key={warning}>{warning}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            ) : null}
                            {generalWarnings.length > 0 ? (
                                <Alert className="border-amber-200 bg-amber-50/80 text-amber-950">
                                    <AlertDescription>
                                        <ul className="list-disc space-y-1 pl-4 text-sm leading-6">
                                            {generalWarnings.map((warning) => (
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
                                        Mode:{' '}
                                        {calculationModeLabel(
                                            viewing.calculation_mode,
                                        )}
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
                                        {formatDate(viewing.departure_date)} -{' '}
                                        {viewing.departure_city ?? '-'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Booking: {viewing.booking_count} |
                                        Jamaah: {viewing.customer_count}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Dihitung:{' '}
                                        {formatDateTime(viewing.calculated_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
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
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Manual Adjustment
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {formatCurrency(
                                            viewing.manual_adjustment,
                                            viewing.currency,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        HPP per Customer
                                    </p>
                                    <p className="font-semibold text-foreground">
                                        {viewing.hpp_per_customer !== null
                                            ? formatCurrency(
                                                  viewing.hpp_per_customer,
                                                  viewing.currency,
                                              )
                                            : '-'}
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
                                    <div className="space-y-3 rounded-xl border border-border/70 bg-card p-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-medium">
                                                Ringkasan Pengambilan Customer
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Breakdown apa saja yang customer
                                                ambil dan total biaya per item.
                                            </p>
                                        </div>
                                        <div className="overflow-hidden rounded-lg border border-border/60">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Kategori
                                                        </TableHead>
                                                        <TableHead>
                                                            Item
                                                        </TableHead>
                                                        <TableHead>
                                                            Rumus
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Total
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {lineItemBreakdown.map(
                                                        (item) => (
                                                            <TableRow
                                                                key={item.id}
                                                            >
                                                                <TableCell className="align-top text-xs text-muted-foreground">
                                                                    {
                                                                        item.category
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="align-top">
                                                                    <div className="space-y-1">
                                                                        <p className="font-medium text-foreground">
                                                                            {
                                                                                item.label
                                                                            }
                                                                        </p>
                                                                        {item
                                                                            .detailRows
                                                                            .length >
                                                                        0 ? (
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {item.detailRows.map(
                                                                                    (
                                                                                        detail,
                                                                                    ) => (
                                                                                        <span
                                                                                            key={`${item.id}-${detail}`}
                                                                                            className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                                                                                        >
                                                                                            {
                                                                                                detail
                                                                                            }
                                                                                        </span>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="align-top text-sm text-muted-foreground">
                                                                    {
                                                                        item.formula
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-right align-top font-semibold text-foreground">
                                                                    {formatCurrency(
                                                                        item.totalPrice,
                                                                        viewing.currency,
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
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
                                                {hotelRoomSummary.length > 0 ? (
                                                    <div className="grid gap-2 sm:grid-cols-3">
                                                        {hotelRoomSummary.map(
                                                            (summary) => (
                                                                <div
                                                                    key={
                                                                        summary.roomType
                                                                    }
                                                                    className="rounded-lg bg-muted/35 px-3 py-2"
                                                                >
                                                                    <p className="text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
                                                                        {
                                                                            summary.roomType
                                                                        }
                                                                    </p>
                                                                    <p className="text-sm font-semibold text-foreground">
                                                                        {
                                                                            summary.roomCount
                                                                        }{' '}
                                                                        kamar
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatCurrency(
                                                                            summary.totalPrice,
                                                                            viewing.currency,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : null}
                                                {hotelDetailItems.map(
                                                    (item) => {
                                                        const itemMeta =
                                                            isRecord(item.meta)
                                                                ? item.meta
                                                                : undefined;
                                                        const detailRows =
                                                            buildHotelMetaRows(
                                                                itemMeta,
                                                            );

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className="rounded-lg border border-border/60 bg-background px-3 py-2.5"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0 space-y-1">
                                                                        <p className="font-medium text-foreground">
                                                                            {
                                                                                item.label
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {
                                                                                item.quantity
                                                                            }{' '}
                                                                            room
                                                                            x{' '}
                                                                            {formatCurrency(
                                                                                item.unit_price,
                                                                                viewing.currency,
                                                                            )}
                                                                        </p>
                                                                        {detailRows.length >
                                                                        0 ? (
                                                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                                                {detailRows.map(
                                                                                    (
                                                                                        detail,
                                                                                    ) => (
                                                                                        <span
                                                                                            key={`${item.id}-${detail}`}
                                                                                            className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                                                                                        >
                                                                                            {
                                                                                                detail
                                                                                            }
                                                                                        </span>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                    <span className="shrink-0 text-sm font-semibold text-foreground">
                                                                        {formatCurrency(
                                                                            item.total_price,
                                                                            viewing.currency,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    },
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
                                                    (item) => {
                                                        const itemMeta =
                                                            isRecord(item.meta)
                                                                ? item.meta
                                                                : undefined;
                                                        const detailRows =
                                                            buildProductMetaRows(
                                                                itemMeta,
                                                            );

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className="rounded-lg border border-border/60 bg-background px-3 py-2.5"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0 space-y-1">
                                                                        <p className="font-medium text-foreground">
                                                                            {
                                                                                item.label
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {
                                                                                item.quantity
                                                                            }{' '}
                                                                            x{' '}
                                                                            {formatCurrency(
                                                                                item.unit_price,
                                                                                viewing.currency,
                                                                            )}
                                                                        </p>
                                                                        {detailRows.length >
                                                                        0 ? (
                                                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                                                {detailRows.map(
                                                                                    (
                                                                                        detail,
                                                                                    ) => (
                                                                                        <span
                                                                                            key={`${item.id}-${detail}`}
                                                                                            className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                                                                                        >
                                                                                            {
                                                                                                detail
                                                                                            }
                                                                                        </span>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        ) : null}
                                                                    </div>
                                                                    <span className="shrink-0 text-sm font-semibold text-foreground">
                                                                        {formatCurrency(
                                                                            item.total_price,
                                                                            viewing.currency,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    },
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
