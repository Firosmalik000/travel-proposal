import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatDate, formatDateTime } from '@/lib/date-format';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Calculator,
    Calendar,
    Layers,
    MapPin,
    Package as PackageIcon,
    Pencil,
    RotateCw,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

type HppEstimate = {
    customer_count: number;
    product_cost_per_customer: number;
    product_total: number;
    hotel_total: number;
    tour_leader_fee: number;
    muthawwif_fee: number;
    other_cost: number;
    revenue_total: number;
    grand_total: number;
    hpp_per_customer: number | null;
    estimated_profit: number;
    calculated_at?: string | null;
    items?: Array<{
        cost_type: 'hotel' | 'product' | 'all_in' | 'foc' | 'fee' | 'other';
        reference_id?: number | null;
        label: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        meta?: Record<string, unknown>;
    }>;
    warnings?: string[];
    notes?: string | null;
};

type ActualCalculation = {
    id: number;
    is_saved: boolean;
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
    package_currency: string;
    package_conversion_rate_to_idr: number;
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
};

type HistoryCalculation = {
    id: number;
    calculation_mode: string;
    grand_total: number;
    hpp_per_customer: number | null;
    currency: string;
    calculated_at: string | null;
    notes: string | null;
};

type Props = {
    package: {
        id: number;
        name: string;
        code: string;
        price: number;
        currency: string;
        original_price: number | null;
        discount_percent: number | null;
        room_prices: Record<string, number | null>;
        room_original_prices: Record<string, number | null>;
        departure_date: string | null;
        departure_city: string | null;
        booking_count: number;
        customer_count: number;
        total_hotels_assigned: number;
    };
    actual: ActualCalculation;
    hppEstimate: HppEstimate | null;
    history: HistoryCalculation[];
};

type FeeForm = {
    tour_leader_fee: string;
    muthawwif_fee: string;
};

const formatCurrency = (
    value: number | null | undefined,
    currency: string = 'IDR',
): string => {
    if (value === null || value === undefined) {
        return '-';
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency || 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
};

export default function HppPackageShow({
    package: pkg,
    actual,
    hppEstimate,
    history,
}: Props) {
    const { can } = usePermission('hpp_package');
    const [recalculating, setRecalculating] = useState(false);

    // Default fee logic
    const defaults = useMemo(() => {
        const gross =
            pkg.price *
            actual.package_conversion_rate_to_idr *
            actual.items.length;
        const pax = pkg.customer_count > 0 ? pkg.customer_count : 1;
        return {
            tourLeaderFee: Math.floor(gross / pax),
            muthawwifFee: Math.floor(actual.hotel_total / pax),
        };
    }, [pkg, actual]);

    const feeForm = useForm<FeeForm>({
        tour_leader_fee: String(
            actual.tour_leader_fee > 0
                ? actual.tour_leader_fee
                : defaults.tourLeaderFee,
        ),
        muthawwif_fee: String(
            actual.muthawwif_fee > 0
                ? actual.muthawwif_fee
                : defaults.muthawwifFee,
        ),
    });

    const isFeeSaved = actual.tour_leader_fee > 0 || actual.muthawwif_fee > 0;
    const isFeeChanged =
        feeForm.data.tour_leader_fee !==
            String(
                actual.tour_leader_fee > 0
                    ? actual.tour_leader_fee
                    : defaults.tourLeaderFee,
            ) ||
        feeForm.data.muthawwif_fee !==
            String(
                actual.muthawwif_fee > 0
                    ? actual.muthawwif_fee
                    : defaults.muthawwifFee,
            );

    // Financial calculations
    const grossRevenue = useMemo(() => {
        return (
            pkg.price *
            actual.package_conversion_rate_to_idr *
            pkg.customer_count
        );
    }, [pkg, actual]);

    const actualProfit = useMemo(() => {
        return grossRevenue - actual.grand_total;
    }, [grossRevenue, actual.grand_total]);

    const estimatedProfit = hppEstimate?.estimated_profit ?? 0;

    const profitVariance = useMemo(() => {
        if (!hppEstimate) return null;
        return actualProfit - estimatedProfit;
    }, [actualProfit, estimatedProfit, hppEstimate]);

    // Breakdown components for actual
    const hotelItems = useMemo(
        () => actual.items.filter((item) => item.cost_type === 'hotel'),
        [actual.items],
    );
    const productItems = useMemo(
        () => actual.items.filter((item) => item.cost_type === 'product'),
        [actual.items],
    );
    const allInItems = useMemo(
        () => actual.items.filter((item) => item.cost_type === 'all_in'),
        [actual.items],
    );
    const otherItems = useMemo(
        () =>
            actual.items.filter(
                (item) =>
                    !['hotel', 'product', 'all_in'].includes(item.cost_type),
            ),
        [actual.items],
    );

    const submitFeeUpdate = (e: React.FormEvent): void => {
        e.preventDefault();
        const tlFee = Number(feeForm.data.tour_leader_fee) || 0;
        const mtFee = Number(feeForm.data.muthawwif_fee) || 0;

        if (actual.id <= 0) {
            router.post(
                '/admin/product-management/hpp-estimate',
                {
                    travel_package_id: pkg.id,
                    departure_schedule_id: null,
                    calculation_mode: actual.calculation_mode,
                    manual_adjustment: actual.manual_adjustment,
                    notes: actual.notes ?? '',
                    tour_leader_fee: tlFee,
                    muthawwif_fee: mtFee,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(
                            'Fee Tour Leader dan Muthawwif berhasil disimpan.',
                        );
                    },
                },
            );
            return;
        }

        router.put(
            `/admin/product-management/hpp-estimate/${actual.id}`,
            {
                tour_leader_fee: tlFee,
                muthawwif_fee: mtFee,
                notes: actual.notes ?? '',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        'Fee Tour Leader dan Muthawwif berhasil diperbarui.',
                    );
                },
            },
        );
    };

    const handleResetFee = (): void => {
        feeForm.setData({
            tour_leader_fee: String(defaults.tourLeaderFee),
            muthawwif_fee: String(defaults.muthawwifFee),
        });
    };

    const handleRecalculate = (): void => {
        if (!actual.id) return;
        setRecalculating(true);
        router.post(
            `/admin/product-management/hpp-estimate/${actual.id}/recalculate`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Perhitungan HPP berhasil diperbarui.');
                },
                onFinish: () => {
                    setRecalculating(false);
                },
            },
        );
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Kalkulasi Harga & HPP Estimasi',
                    href: '/admin/product-management/hpp-estimate',
                },
                {
                    title: pkg.name,
                    href: `/admin/product-management/hpp-estimate/${pkg.id}`,
                },
            ]}
        >
            <Head title={`HPP - ${pkg.name}`} />

            <div className="space-y-6">
                {/* Header Bar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5">
                        <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="mt-0.5 shrink-0 rounded-xl"
                        >
                            <Link
                                href="/admin/product-management/hpp-estimate"
                                aria-label="Kembali ke daftar HPP"
                            >
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div className="min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                    {pkg.name}
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className="font-mono text-xs font-semibold"
                                >
                                    {pkg.code}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {actual.currency}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="size-3.5" />
                                    {formatDate(pkg.departure_date)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="size-3.5" />
                                    {pkg.departure_city || '-'}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Users className="size-3.5" />
                                    {pkg.customer_count} Jamaah (
                                    {pkg.booking_count} Booking)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {actual.id > 0 && can('edit') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRecalculate}
                                disabled={recalculating}
                                className="rounded-xl"
                            >
                                <RotateCw
                                    className={`size-3.5 ${recalculating ? 'animate-spin' : ''}`}
                                />
                                Hitung Ulang
                            </Button>
                        )}
                        {can('edit') && (
                            <Button asChild size="sm" className="rounded-xl">
                                <Link
                                    href={`/admin/product-management/hpp-estimate/${pkg.id}/estimate/edit`}
                                >
                                    <Pencil className="size-3.5" />
                                    Edit Estimasi HPP
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Key Metric Cards */}
                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card 1: Harga Jual */}
                    <Card className="rounded-2xl border-border/70 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                Harga Paket
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <TagIcon className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-2xl font-bold tracking-tight text-foreground">
                                {formatCurrency(pkg.price, pkg.currency)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                    Omzet: {formatCurrency(grossRevenue, 'IDR')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: HPP Estimasi */}
                    <Card className="rounded-2xl border-border/70 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                HPP Estimasi
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Calculator className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-2xl font-bold tracking-tight text-foreground">
                                {hppEstimate
                                    ? formatCurrency(
                                          hppEstimate.grand_total,
                                          'IDR',
                                      )
                                    : '-'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                    {hppEstimate?.hpp_per_customer
                                        ? `${formatCurrency(hppEstimate.hpp_per_customer, 'IDR')} / pax`
                                        : 'Belum dihitung'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3: HPP Actual */}
                    <Card className="rounded-2xl border-border/70 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                HPP Actual
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Wallet className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div className="text-2xl font-bold tracking-tight text-foreground">
                                {formatCurrency(
                                    actual.grand_total,
                                    actual.currency,
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                    {actual.hpp_per_customer
                                        ? `${formatCurrency(actual.hpp_per_customer, actual.currency)} / pax`
                                        : '-'}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                        actual.is_saved
                                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                            : 'border-border text-muted-foreground'
                                    }`}
                                >
                                    {actual.is_saved ? 'Tersimpan' : 'Draft'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 4: Keuntungan Margin */}
                    <Card className="rounded-2xl border-border/70 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                Keuntungan Realisasi
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <div
                                className={`text-2xl font-bold tracking-tight ${
                                    actualProfit >= 0
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                }`}
                            >
                                {formatCurrency(actualProfit, actual.currency)}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>
                                    Estimasi Margin:{' '}
                                    {formatCurrency(estimatedProfit, 'IDR')}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Fee TL & Muthawwif Quick Form */}
                <Card className="rounded-2xl border-border/70 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div className="space-y-0.5">
                            <CardTitle className="text-base font-semibold">
                                Fee Tour Leader & Muthawwif
                            </CardTitle>
                        </div>
                        <Badge
                            variant="outline"
                            className={`text-xs ${
                                isFeeChanged
                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                    : isFeeSaved
                                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                      : 'border-border text-muted-foreground'
                            }`}
                        >
                            {isFeeChanged
                                ? 'Belum Disimpan'
                                : isFeeSaved
                                  ? 'Tersimpan'
                                  : 'Nilai Default'}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={submitFeeUpdate}
                            className="flex flex-col gap-4 sm:flex-row sm:items-end"
                        >
                            <div className="flex-1 space-y-1.5">
                                <Label
                                    htmlFor="tl_fee"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Tour Leader Fee (Rp)
                                </Label>
                                <Input
                                    id="tl_fee"
                                    type="number"
                                    min={0}
                                    value={feeForm.data.tour_leader_fee}
                                    onChange={(e) =>
                                        feeForm.setData(
                                            'tour_leader_fee',
                                            e.target.value,
                                        )
                                    }
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <Label
                                    htmlFor="mt_fee"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Muthawwif Fee (Rp)
                                </Label>
                                <Input
                                    id="mt_fee"
                                    type="number"
                                    min={0}
                                    value={feeForm.data.muthawwif_fee}
                                    onChange={(e) =>
                                        feeForm.setData(
                                            'muthawwif_fee',
                                            e.target.value,
                                        )
                                    }
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="default"
                                    onClick={handleResetFee}
                                    className="rounded-xl"
                                >
                                    Reset Default
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={feeForm.processing}
                                    className="rounded-xl"
                                >
                                    Simpan Fee
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Detail Tabs */}
                <Tabs defaultValue="comparison" className="space-y-4">
                    <TabsList className="h-10 w-full justify-start rounded-xl border border-border/60 bg-muted/40 p-1">
                        <TabsTrigger
                            value="comparison"
                            className="rounded-lg px-4 text-xs font-medium"
                        >
                            Komparasi HPP
                        </TabsTrigger>
                        <TabsTrigger
                            value="actual"
                            className="rounded-lg px-4 text-xs font-medium"
                        >
                            Rincian Actual
                        </TabsTrigger>
                        <TabsTrigger
                            value="estimate"
                            className="rounded-lg px-4 text-xs font-medium"
                        >
                            Rincian Estimasi
                        </TabsTrigger>
                        {history.length > 0 && (
                            <TabsTrigger
                                value="history"
                                className="rounded-lg px-4 text-xs font-medium"
                            >
                                Riwayat ({history.length})
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Tab 1: Comparison Table */}
                    <TabsContent value="comparison" className="space-y-4">
                        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="font-semibold">
                                            Komponen Biaya
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Estimasi Awal
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Realisasi Actual
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">
                                            Selisih
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Total Biaya Hotel
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(
                                                hppEstimate?.hotel_total,
                                                'IDR',
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(
                                                actual.hotel_total,
                                                actual.currency,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {hppEstimate ? (
                                                <span
                                                    className={
                                                        actual.hotel_total <=
                                                        hppEstimate.hotel_total
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }
                                                >
                                                    {formatCurrency(
                                                        actual.hotel_total -
                                                            hppEstimate.hotel_total,
                                                        'IDR',
                                                    )}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Total Biaya Produk & Layanan
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(
                                                hppEstimate?.product_total,
                                                'IDR',
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(
                                                actual.product_total,
                                                actual.currency,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {hppEstimate ? (
                                                <span
                                                    className={
                                                        actual.product_total <=
                                                        hppEstimate.product_total
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }
                                                >
                                                    {formatCurrency(
                                                        actual.product_total -
                                                            hppEstimate.product_total,
                                                        'IDR',
                                                    )}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Fee Tour Leader
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(
                                                hppEstimate?.tour_leader_fee,
                                                'IDR',
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(
                                                actual.tour_leader_fee,
                                                actual.currency,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {hppEstimate ? (
                                                <span
                                                    className={
                                                        actual.tour_leader_fee <=
                                                        hppEstimate.tour_leader_fee
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }
                                                >
                                                    {formatCurrency(
                                                        actual.tour_leader_fee -
                                                            hppEstimate.tour_leader_fee,
                                                        'IDR',
                                                    )}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell className="font-medium">
                                            Fee Muthawwif
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(
                                                hppEstimate?.muthawwif_fee,
                                                'IDR',
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(
                                                actual.muthawwif_fee,
                                                actual.currency,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {hppEstimate ? (
                                                <span
                                                    className={
                                                        actual.muthawwif_fee <=
                                                        hppEstimate.muthawwif_fee
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }
                                                >
                                                    {formatCurrency(
                                                        actual.muthawwif_fee -
                                                            hppEstimate.muthawwif_fee,
                                                        'IDR',
                                                    )}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow className="border-t-2 border-border/80 bg-muted/20 font-semibold">
                                        <TableCell>Total HPP</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(
                                                hppEstimate?.grand_total,
                                                'IDR',
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-foreground">
                                            {formatCurrency(
                                                actual.grand_total,
                                                actual.currency,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {hppEstimate ? (
                                                <span
                                                    className={
                                                        actual.grand_total <=
                                                        hppEstimate.grand_total
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }
                                                >
                                                    {formatCurrency(
                                                        actual.grand_total -
                                                            hppEstimate.grand_total,
                                                        'IDR',
                                                    )}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow className="font-semibold">
                                        <TableCell>HPP per Jamaah</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(
                                                hppEstimate?.hpp_per_customer,
                                                'IDR',
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-foreground">
                                            {formatCurrency(
                                                actual.hpp_per_customer,
                                                actual.currency,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {hppEstimate &&
                                            actual.hpp_per_customer &&
                                            hppEstimate.hpp_per_customer ? (
                                                <span
                                                    className={
                                                        actual.hpp_per_customer <=
                                                        hppEstimate.hpp_per_customer
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }
                                                >
                                                    {formatCurrency(
                                                        actual.hpp_per_customer -
                                                            hppEstimate.hpp_per_customer,
                                                        'IDR',
                                                    )}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>

                                    <TableRow className="bg-emerald-500/5 font-semibold text-emerald-700 dark:text-emerald-400">
                                        <TableCell>
                                            Keuntungan (Margin)
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(
                                                hppEstimate?.estimated_profit,
                                                'IDR',
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(
                                                actualProfit,
                                                actual.currency,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {profitVariance !== null ? (
                                                <span
                                                    className={
                                                        profitVariance >= 0
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-rose-600 dark:text-rose-400'
                                                    }
                                                >
                                                    {formatCurrency(
                                                        profitVariance,
                                                        'IDR',
                                                    )}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    {/* Tab 2: Actual Breakdown */}
                    <TabsContent value="actual" className="space-y-4">
                        {/* Hotels */}
                        <Card className="rounded-2xl border-border/70 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div className="flex items-center gap-2">
                                    <Building2 className="size-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Komponen Hotel
                                    </CardTitle>
                                </div>
                                <span className="font-semibold text-foreground">
                                    {formatCurrency(
                                        actual.hotel_total,
                                        actual.currency,
                                    )}
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                {hotelItems.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        Belum ada data komponen hotel.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20">
                                                <TableHead>
                                                    Nama Hotel / Kamar
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    Kuantitas
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Harga Satuan
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Total Biaya
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {hotelItems.map((item, idx) => (
                                                <TableRow key={`hotel-${idx}`}>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">
                                                            {item.label}
                                                        </div>
                                                        {item.description && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    item.description
                                                                }
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            item.unit_price,
                                                            actual.currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(
                                                            item.total_price,
                                                            actual.currency,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {/* Products */}
                        <Card className="rounded-2xl border-border/70 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div className="flex items-center gap-2">
                                    <PackageIcon className="size-4 text-primary" />
                                    <CardTitle className="text-base font-semibold">
                                        Produk & Inventori
                                    </CardTitle>
                                </div>
                                <span className="font-semibold text-foreground">
                                    {formatCurrency(
                                        actual.product_total,
                                        actual.currency,
                                    )}
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                {productItems.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        Belum ada data produk atau perlengkapan.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20">
                                                <TableHead>
                                                    Nama Produk
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    Kuantitas
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Harga Satuan
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Total Biaya
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {productItems.map((item, idx) => (
                                                <TableRow key={`prod-${idx}`}>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">
                                                            {item.label}
                                                        </div>
                                                        {item.description && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    item.description
                                                                }
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            item.unit_price,
                                                            actual.currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(
                                                            item.total_price,
                                                            actual.currency,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {/* All-in or Other Items if available */}
                        {allInItems.length > 0 && (
                            <Card className="rounded-2xl border-border/70 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <div className="flex items-center gap-2">
                                        <Layers className="size-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Paket All In Vendor
                                        </CardTitle>
                                    </div>
                                    <span className="font-semibold text-foreground">
                                        {formatCurrency(
                                            allInItems.reduce(
                                                (acc, curr) =>
                                                    acc + curr.total_price,
                                                0,
                                            ),
                                            actual.currency,
                                        )}
                                    </span>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20">
                                                <TableHead>Komponen</TableHead>
                                                <TableHead className="text-center">
                                                    Kuantitas
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Harga Satuan
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Total Biaya
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allInItems.map((item, idx) => (
                                                <TableRow key={`allin-${idx}`}>
                                                    <TableCell className="font-medium text-foreground">
                                                        {item.label}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            item.unit_price,
                                                            actual.currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(
                                                            item.total_price,
                                                            actual.currency,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}

                        {otherItems.length > 0 && (
                            <Card className="rounded-2xl border-border/70 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <div className="flex items-center gap-2">
                                        <Layers className="size-4 text-primary" />
                                        <CardTitle className="text-base font-semibold">
                                            Biaya &amp; Komponen Lainnya
                                        </CardTitle>
                                    </div>
                                    <span className="font-semibold text-foreground">
                                        {formatCurrency(
                                            otherItems.reduce(
                                                (acc, curr) =>
                                                    acc + curr.total_price,
                                                0,
                                            ),
                                            actual.currency,
                                        )}
                                    </span>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20">
                                                <TableHead>Komponen</TableHead>
                                                <TableHead className="text-center">
                                                    Kuantitas
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Harga Satuan
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Total Biaya
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {otherItems.map((item, idx) => (
                                                <TableRow key={`other-${idx}`}>
                                                    <TableCell className="font-medium text-foreground">
                                                        {item.label}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            item.unit_price,
                                                            actual.currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(
                                                            item.total_price,
                                                            actual.currency,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Tab 3: Estimated Breakdown */}
                    <TabsContent value="estimate" className="space-y-4">
                        <Card className="rounded-2xl border-border/70 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-base font-semibold">
                                    Rincian Komponen Estimasi HPP
                                </CardTitle>
                                {hppEstimate && (
                                    <span className="text-sm font-semibold">
                                        Target: {hppEstimate.customer_count} Pax
                                    </span>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {!hppEstimate ||
                                !hppEstimate.items ||
                                hppEstimate.items.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        Belum ada rincian estimasi HPP
                                        tersimpan.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20">
                                                <TableHead>
                                                    Komponen Biaya
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    Kategori
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    Kuantitas
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Harga Satuan
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Total Biaya
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {hppEstimate.items.map(
                                                (item, idx) => (
                                                    <TableRow
                                                        key={`est-item-${idx}`}
                                                    >
                                                        <TableCell className="font-medium text-foreground">
                                                            {item.label}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[11px] capitalize"
                                                            >
                                                                {item.cost_type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {item.quantity}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatCurrency(
                                                                item.unit_price,
                                                                'IDR',
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {formatCurrency(
                                                                item.total_price,
                                                                'IDR',
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 4: Calculation History */}
                    {history.length > 0 && (
                        <TabsContent value="history" className="space-y-4">
                            <Card className="rounded-2xl border-border/70 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold">
                                        Riwayat Snapshot Perhitungan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/20">
                                                <TableHead>
                                                    Waktu Kalkulasi
                                                </TableHead>
                                                <TableHead>Mode</TableHead>
                                                <TableHead className="text-right">
                                                    Grand Total
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    HPP / Pax
                                                </TableHead>
                                                <TableHead>Catatan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {history.map((h) => (
                                                <TableRow key={`hist-${h.id}`}>
                                                    <TableCell className="font-medium text-foreground">
                                                        {formatDateTime(
                                                            h.calculated_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono text-[11px]"
                                                        >
                                                            {h.calculation_mode}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(
                                                            h.grand_total,
                                                            h.currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(
                                                            h.hpp_per_customer,
                                                            h.currency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {h.notes || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </AppSidebarLayout>
    );
}

function TagIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
            <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
        </svg>
    );
}
