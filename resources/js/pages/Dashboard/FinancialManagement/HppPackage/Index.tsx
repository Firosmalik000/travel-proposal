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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Calculator, Eye, MoreHorizontal } from 'lucide-react';
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
    package_room_prices: Record<string, number | null>;
    package_room_original_prices: Record<string, number | null>;
    departure_date: string | null;
    departure_city: string | null;
    booking_count: number;
    customer_count: number;
    hotel_total: number;
    product_total: number;
    manual_adjustment: number;
    tour_leader_fee: number;
    muthawwif_fee: number;
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
        package_room_prices: Record<string, number | null>;
        package_room_original_prices: Record<string, number | null>;
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
            tour_leader_fee: number;
            muthawwif_fee: number;
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

type FeeForm = {
    tour_leader_fee: string;
    muthawwif_fee: string;
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
    package_room_prices: source.package_room_prices ?? {},
    package_room_original_prices: source.package_room_original_prices ?? {},
    departure_date: source.departure_date,
    departure_city: source.departure_city,
    booking_count: source.total_bookings,
    customer_count: source.total_customers,
    hotel_total: source.latest_calculation?.hotel_total ?? 0,
    product_total: source.latest_calculation?.product_total ?? 0,
    manual_adjustment: source.latest_calculation?.manual_adjustment ?? 0,
    tour_leader_fee: source.latest_calculation?.tour_leader_fee ?? 0,
    muthawwif_fee: source.latest_calculation?.muthawwif_fee ?? 0,
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
    const [viewing, setViewing] = useState<Row | null>(null);
    const [isFeeSaved, setIsFeeSaved] = useState(false);
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
    const feeForm = useForm<FeeForm>({
        tour_leader_fee: '0',
        muthawwif_fee: '0',
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

    const resolveFeeDefaults = (
        row: Row,
    ): {
        tourLeaderFee: number;
        muthawwifFee: number;
    } => {
        const grossRevenue = row.package_price * row.customer_count;

        return {
            tourLeaderFee:
                row.customer_count > 0
                    ? Math.floor(grossRevenue / row.customer_count)
                    : 0,
            muthawwifFee:
                row.customer_count > 0
                    ? Math.floor(row.hotel_total / row.customer_count)
                    : 0,
        };
    };

    const openDetail = (source: Props['sourceRows'][number]): void => {
        const row = mapSourceToRow(source);
        const defaults = resolveFeeDefaults(row);
        const hasSavedFee = row.tour_leader_fee > 0 || row.muthawwif_fee > 0;

        setViewing(row);
        setIsFeeSaved(hasSavedFee);
        feeForm.setData({
            tour_leader_fee: String(
                row.tour_leader_fee > 0
                    ? row.tour_leader_fee
                    : defaults.tourLeaderFee,
            ),
            muthawwif_fee: String(
                row.muthawwif_fee > 0
                    ? row.muthawwif_fee
                    : defaults.muthawwifFee,
            ),
        });
    };

    const submitFeeUpdate = (event: React.FormEvent): void => {
        event.preventDefault();
        if (!viewing) {
            return;
        }

        const defaults = resolveFeeDefaults(viewing);
        const tourLeaderFee =
            feeForm.data.tour_leader_fee.trim() === ''
                ? defaults.tourLeaderFee
                : Number(feeForm.data.tour_leader_fee);
        const muthawwifFee =
            feeForm.data.muthawwif_fee.trim() === ''
                ? defaults.muthawwifFee
                : Number(feeForm.data.muthawwif_fee);
        const nextGrandTotal =
            viewing.hotel_total +
            viewing.product_total +
            viewing.manual_adjustment +
            tourLeaderFee +
            muthawwifFee;

        const requestData = {
            travel_package_id: viewing.travel_package_id,
            departure_schedule_id: viewing.departure_schedule_id,
            calculation_mode: viewing.calculation_mode,
            manual_adjustment: viewing.manual_adjustment,
            notes: viewing.notes ?? '',
            tour_leader_fee: tourLeaderFee,
            muthawwif_fee: muthawwifFee,
        };

        if (viewing.id <= 0) {
            router.post(
                '/admin/financial-management/hpp-package',
                requestData,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            'Fee TL dan muthawwif berhasil disimpan.',
                        );
                        setIsFeeSaved(true);
                        setViewing(null);
                    },
                },
            );

            return;
        }

        router.put(
            `/admin/financial-management/hpp-package/${viewing.id}`,
            {
                tour_leader_fee: tourLeaderFee,
                muthawwif_fee: muthawwifFee,
                notes: viewing.notes ?? '',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Fee TL dan muthawwif berhasil disimpan.');
                    setIsFeeSaved(true);
                    setViewing((current) =>
                        current
                            ? {
                                  ...current,
                                  tour_leader_fee: tourLeaderFee,
                                  muthawwif_fee: muthawwifFee,
                                  grand_total: nextGrandTotal,
                                  hpp_per_customer:
                                      current.customer_count > 0
                                          ? Math.floor(
                                                nextGrandTotal /
                                                    current.customer_count,
                                            )
                                          : null,
                              }
                            : current,
                    );
                },
            },
        );
    };

    const resetFeeToDefault = (): void => {
        if (!viewing) {
            return;
        }

        const defaults = resolveFeeDefaults(viewing);

        setViewing((current) =>
            current
                ? {
                      ...current,
                      tour_leader_fee: 0,
                      muthawwif_fee: 0,
                      grand_total:
                          current.hotel_total +
                          current.product_total +
                          current.manual_adjustment,
                      hpp_per_customer:
                          current.customer_count > 0
                              ? Math.floor(
                                    (current.hotel_total +
                                        current.product_total +
                                        current.manual_adjustment) /
                                        current.customer_count,
                                )
                              : null,
                  }
                : current,
        );
        setIsFeeSaved(false);

        feeForm.setData({
            tour_leader_fee: String(defaults.tourLeaderFee),
            muthawwif_fee: String(defaults.muthawwifFee),
        });
    };

    const feeDefaults = viewing ? resolveFeeDefaults(viewing) : null;
    const feeSavedValues = viewing
        ? {
              tourLeaderFee: viewing.tour_leader_fee,
              muthawwifFee: viewing.muthawwif_fee,
          }
        : null;
    const isFeeCustomized =
        viewing !== null && feeDefaults !== null
            ? feeForm.data.tour_leader_fee.trim() !==
                  String(
                      isFeeSaved
                          ? (feeSavedValues?.tourLeaderFee ??
                                feeDefaults.tourLeaderFee)
                          : feeDefaults.tourLeaderFee,
                  ) ||
              feeForm.data.muthawwif_fee.trim() !==
                  String(
                      isFeeSaved
                          ? (feeSavedValues?.muthawwifFee ??
                                feeDefaults.muthawwifFee)
                          : feeDefaults.muthawwifFee,
                  )
            : false;
    const isSavedFeeApplied =
        viewing !== null && isFeeSaved && !isFeeCustomized;
    const originalGrandTotal = useMemo(() => {
        if (!viewing) {
            return 0;
        }

        return Math.max(
            viewing.grand_total -
                (viewing.tour_leader_fee + viewing.muthawwif_fee),
            0,
        );
    }, [viewing]);
    const originalHppPerCustomer = useMemo(() => {
        if (!viewing || viewing.customer_count <= 0) {
            return null;
        }

        return Math.floor(originalGrandTotal / viewing.customer_count);
    }, [originalGrandTotal, viewing]);
    const grossRevenue = useMemo(() => {
        if (!viewing) {
            return 0;
        }

        return viewing.package_price * viewing.customer_count;
    }, [viewing]);
    const savedHppPerCustomer = useMemo(() => {
        if (!viewing || viewing.customer_count <= 0) {
            return null;
        }

        return Math.floor(viewing.grand_total / viewing.customer_count);
    }, [viewing]);
    const savedFeeProfit = useMemo(() => {
        if (!viewing) {
            return 0;
        }

        return grossRevenue - viewing.grand_total;
    }, [grossRevenue, viewing]);
    const currentTotalProfit = useMemo(() => {
        if (!viewing) {
            return 0;
        }

        return grossRevenue - originalGrandTotal;
    }, [grossRevenue, originalGrandTotal, viewing]);

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
            <div className="space-y-4 p-3 md:p-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
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

                <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
                    <div className="grid gap-2 md:grid-cols-2">
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
                                            {pkg.name}
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
                                                    <DropdownMenuItem
                                                        className="font-medium text-primary focus:text-primary"
                                                        onClick={() =>
                                                            openDetail(source)
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Detail
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {source.package_name}
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
                                            {pkg.name}
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
                open={viewing !== null}
                onOpenChange={(open) => !open && setViewing(null)}
            >
                <SheetContent className="w-full overflow-y-auto bg-background sm:max-w-3xl">
                    <SheetHeader className="border-b border-border/60 pb-4">
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

                            <Tabs defaultValue="summary" className="space-y-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="summary">
                                        Ringkasan Customer
                                    </TabsTrigger>
                                    <TabsTrigger value="breakdown">
                                        Breakdown Biaya
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                    value="summary"
                                    className="space-y-4"
                                >
                                    <div className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 shadow-sm">
                                        <div className="grid gap-4 p-3 lg:grid-cols-[1.25fr_0.95fr]">
                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <div>
                                                        <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                                            {
                                                                viewing.package_name
                                                            }
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDate(
                                                                viewing.departure_date,
                                                            )}{' '}
                                                            -{' '}
                                                            {viewing.departure_city ??
                                                                '-'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid gap-2 text-sm sm:grid-cols-2">
                                                    <div className="rounded-xl border border-border/70 bg-background/80 p-2.5">
                                                        <p className="text-xs text-muted-foreground">
                                                            Booking
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                                            {
                                                                viewing.booking_count
                                                            }
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Total transaksi
                                                            booking yang
                                                            dihitung
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-border/70 bg-background/80 p-2.5">
                                                        <p className="text-xs text-muted-foreground">
                                                            Jamaah
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                                            {
                                                                viewing.customer_count
                                                            }
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            Total passenger dari
                                                            booking valid
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-border/70 bg-background/80 p-2.5">
                                                        <p className="text-xs text-muted-foreground">
                                                            Harga Jual Package
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                                            {formatCurrency(
                                                                viewing.package_price,
                                                                viewing.currency,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                                                        <p className="text-xs text-muted-foreground">
                                                            Harga Asli Package
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                                            {viewing.package_original_price !==
                                                            null
                                                                ? formatCurrency(
                                                                      viewing.package_original_price,
                                                                      viewing.currency,
                                                                  )
                                                                : '-'}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-border/70 bg-background/80 p-2.5 sm:col-span-2">
                                                        <p className="text-xs text-muted-foreground">
                                                            Diskon Package
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold text-foreground">
                                                            {viewing.package_discount_percent !==
                                                                null &&
                                                            viewing.package_discount_percent >
                                                                0
                                                                ? `${viewing.package_discount_percent}%`
                                                                : '0%'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <form
                                                    className="space-y-3 rounded-2xl border border-border/70 bg-card p-3"
                                                    onSubmit={submitFeeUpdate}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="text-sm font-medium">
                                                            Fee TL &amp;
                                                            Muthawwif
                                                        </div>
                                                        <div className="rounded-full border border-border/70 bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                                                            {isFeeCustomized
                                                                ? 'Ada perubahan belum disimpan'
                                                                : isSavedFeeApplied
                                                                  ? 'Fee tersimpan'
                                                                  : 'Default aktif'}
                                                        </div>
                                                    </div>
                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                        <div className="grid gap-1.5">
                                                            <Label>
                                                                Tour Leader Fee
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={
                                                                    feeForm.data
                                                                        .tour_leader_fee
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    feeForm.setData(
                                                                        'tour_leader_fee',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="grid gap-1.5">
                                                            <Label>
                                                                Muthawwif Fee
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={
                                                                    feeForm.data
                                                                        .muthawwif_fee
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    feeForm.setData(
                                                                        'muthawwif_fee',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <div className="flex flex-wrap gap-2">
                                                            {isSavedFeeApplied ? (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={
                                                                        resetFeeToDefault
                                                                    }
                                                                >
                                                                    Reset ke
                                                                    Default
                                                                </Button>
                                                            ) : null}
                                                            <Button
                                                                type="submit"
                                                                disabled={
                                                                    feeForm.processing
                                                                }
                                                            >
                                                                Simpan Fee
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="min-w-0 rounded-2xl border border-border/70 bg-background p-3 shadow-sm">
                                                    <p className="text-xs leading-tight tracking-wide text-muted-foreground uppercase">
                                                        HPP Asli
                                                    </p>
                                                    <p className="mt-2 text-2xl leading-tight font-semibold break-words text-foreground">
                                                        {formatCurrency(
                                                            originalGrandTotal,
                                                            viewing.currency,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                                                        Sebelum fee TL &amp;
                                                        Muthawwif
                                                    </p>
                                                </div>
                                                <div className="min-w-0 rounded-2xl border border-border/70 bg-background p-3 shadow-sm">
                                                    <p className="text-xs leading-tight tracking-wide text-muted-foreground uppercase">
                                                        HPP / Jamaah Asli
                                                    </p>
                                                    <p className="mt-2 text-2xl leading-tight font-semibold break-words text-foreground">
                                                        {originalHppPerCustomer !==
                                                        null
                                                            ? formatCurrency(
                                                                  originalHppPerCustomer,
                                                                  viewing.currency,
                                                              )
                                                            : '-'}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                                                        Sebelum fee TL &amp;
                                                        Muthawwif
                                                    </p>
                                                </div>
                                                <div className="min-w-0 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 shadow-sm dark:bg-emerald-500/15">
                                                    <p className="text-xs leading-tight tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                                        Total Keuntungan
                                                    </p>
                                                    <p className="mt-2 text-2xl leading-tight font-semibold break-words text-emerald-800 dark:text-emerald-200">
                                                        {formatCurrency(
                                                            isSavedFeeApplied
                                                                ? savedFeeProfit
                                                                : currentTotalProfit,
                                                            viewing.currency,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-snug text-emerald-700/80 dark:text-emerald-200/80">
                                                        Omzet kotor dikurangi
                                                        HPP
                                                    </p>
                                                </div>
                                            </div>

                                            {isSavedFeeApplied ? (
                                                <div className="space-y-2">
                                                    <div className="min-w-0 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 shadow-sm dark:bg-emerald-500/15">
                                                        <p className="text-xs leading-tight tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                                            HPP Setelah Fee
                                                        </p>
                                                        <p className="mt-2 text-2xl leading-tight font-semibold break-words text-emerald-800 dark:text-emerald-200">
                                                            {formatCurrency(
                                                                viewing.grand_total,
                                                                viewing.currency,
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-xs leading-snug text-emerald-700/80 dark:text-emerald-200/80">
                                                            Setelah fee TL &amp;
                                                            Muthawwif
                                                        </p>
                                                    </div>
                                                    <div className="min-w-0 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 shadow-sm dark:bg-emerald-500/15">
                                                        <p className="text-xs leading-tight tracking-wide text-emerald-700 uppercase dark:text-emerald-300">
                                                            HPP / Jamaah Setelah
                                                            Fee
                                                        </p>
                                                        <p className="mt-2 text-2xl leading-tight font-semibold break-words text-emerald-800 dark:text-emerald-200">
                                                            {savedHppPerCustomer !==
                                                            null
                                                                ? formatCurrency(
                                                                      savedHppPerCustomer,
                                                                      viewing.currency,
                                                                  )
                                                                : '-'}
                                                        </p>
                                                        <p className="mt-1 text-xs leading-snug text-emerald-700/80 dark:text-emerald-200/80">
                                                            Setelah fee TL &amp;
                                                            Muthawwif
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-2.5 py-2 text-sm text-muted-foreground">
                                                        Total keuntungan setelah
                                                        fee:{' '}
                                                        <span className="font-semibold text-foreground">
                                                            {formatCurrency(
                                                                savedFeeProfit,
                                                                viewing.currency,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-2.5 py-2 text-sm text-muted-foreground">
                                                    Fee TL &amp; Muthawwif belum
                                                    disimpan, jadi HPP setelah
                                                    fee belum ditampilkan.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="breakdown"
                                    className="space-y-3"
                                >
                                    {viewing.items.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                                            Belum ada hasil kalkulasi HPP untuk
                                            baris ini. Silakan klik Generate
                                            terlebih dahulu.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="rounded-xl border border-border/70 bg-card p-3">
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm font-medium">
                                                        Breakdown Fee
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Fee ini masuk ke HPP
                                                        setelah disimpan.
                                                    </p>
                                                </div>

                                                {isSavedFeeApplied ? (
                                                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                                        <div className="rounded-lg bg-muted/35 px-3 py-2">
                                                            <p className="text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
                                                                Tour Leader
                                                            </p>
                                                            <p className="mt-1 text-sm font-semibold text-foreground">
                                                                {formatCurrency(
                                                                    viewing.tour_leader_fee,
                                                                    viewing.currency,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-lg bg-muted/35 px-3 py-2">
                                                            <p className="text-[11px] tracking-[0.24em] text-muted-foreground uppercase">
                                                                Muthawwif
                                                            </p>
                                                            <p className="mt-1 text-sm font-semibold text-foreground">
                                                                {formatCurrency(
                                                                    viewing.muthawwif_fee,
                                                                    viewing.currency,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-lg bg-emerald-500/10 px-3 py-2">
                                                            <p className="text-[11px] tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
                                                                Total Fee
                                                            </p>
                                                            <p className="mt-1 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                                                                {formatCurrency(
                                                                    viewing.tour_leader_fee +
                                                                        viewing.muthawwif_fee,
                                                                    viewing.currency,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                                                        Fee belum disimpan, jadi
                                                        breakdown fee belum
                                                        ditampilkan.
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2 rounded-xl border border-border/70 bg-card p-3">
                                                <div className="text-sm font-medium">
                                                    Breakdown Hotel
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Harga room type mengikuti
                                                    periode hotel yang aktif.
                                                </p>
                                                {hotelDetailItems.length ===
                                                0 ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        Tidak ada komponen
                                                        hotel.
                                                    </p>
                                                ) : (
                                                    <>
                                                        {hotelRoomSummary.length >
                                                        0 ? (
                                                            <div className="grid gap-2 sm:grid-cols-3">
                                                                {hotelRoomSummary.map(
                                                                    (
                                                                        summary,
                                                                    ) => (
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
                                                                    isRecord(
                                                                        item.meta,
                                                                    )
                                                                        ? item.meta
                                                                        : undefined;
                                                                const detailRows =
                                                                    buildHotelMetaRows(
                                                                        itemMeta,
                                                                    );

                                                                return (
                                                                    <div
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        className="rounded-lg border border-border/60 bg-background px-2.5 py-2"
                                                                    >
                                                                        <div className="flex items-start justify-between gap-2.5">
                                                                            <div className="min-w-0 space-y-0.5">
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
                                                                                    <div className="flex flex-wrap gap-1 pt-1">
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
                                                        <div className="mt-1.5 border-t border-border/70 pt-1.5 text-sm font-semibold">
                                                            Subtotal Hotel:{' '}
                                                            {formatCurrency(
                                                                hotelDetailItems.reduce(
                                                                    (
                                                                        total,
                                                                        item,
                                                                    ) =>
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
                                                <p className="text-xs text-muted-foreground">
                                                    Product dihitung per jamaah
                                                    sesuai customer count.
                                                </p>
                                                {productDetailItems.length ===
                                                0 ? (
                                                    <p className="text-sm text-muted-foreground">
                                                        Tidak ada komponen
                                                        product.
                                                    </p>
                                                ) : (
                                                    <>
                                                        {productDetailItems.map(
                                                            (item) => {
                                                                const itemMeta =
                                                                    isRecord(
                                                                        item.meta,
                                                                    )
                                                                        ? item.meta
                                                                        : undefined;
                                                                const detailRows =
                                                                    buildProductMetaRows(
                                                                        itemMeta,
                                                                    );

                                                                return (
                                                                    <div
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        className="rounded-lg border border-border/60 bg-background px-2.5 py-2"
                                                                    >
                                                                        <div className="flex items-start justify-between gap-2.5">
                                                                            <div className="min-w-0 space-y-0.5">
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
                                                                                    <div className="flex flex-wrap gap-1 pt-1">
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
                                                        <div className="mt-1.5 border-t border-border/70 pt-1.5 text-sm font-semibold">
                                                            Subtotal Product:{' '}
                                                            {formatCurrency(
                                                                productDetailItems.reduce(
                                                                    (
                                                                        total,
                                                                        item,
                                                                    ) =>
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
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
