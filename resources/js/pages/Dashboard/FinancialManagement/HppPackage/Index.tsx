import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatDate } from '@/lib/date-format';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

type HppEstimate = {
    customers?: Record<string, number>;
    product_cost_per_customer: number;
    hotel_total: number;
    tour_leader_fee: number;
    muthawwif_fee: number;
    other_cost: number;
    notes: string | null;
    customer_count: number;
    product_total: number;
    revenue_total: number;
    grand_total: number;
    hpp_per_customer: number | null;
    estimated_profit: number;
    calculated_at: string | null;
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
};

type Row = {
    id: number;
    is_saved: boolean;
    travel_package_id: number;
    departure_schedule_id: number | null;
    calculation_mode: string;
    package_name: string;
    package_code: string;
    package_price: number;
    package_currency: string;
    package_conversion_rate_to_idr: number;
    package_original_price: number | null;
    package_discount_percent: number | null;
    package_room_prices: Record<string, number | null>;
    package_room_original_prices: Record<string, number | null>;
    hpp_estimate: HppEstimate | null;
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
        departure_schedule_id: number | null;
        calculation_mode?: string;
        package_name: string;
        package_code: string;
        package_price: number;
        package_currency: string;
        package_conversion_rate_to_idr: number;
        package_original_price: number | null;
        package_discount_percent: number | null;
        package_room_prices: Record<string, number | null>;
        package_room_original_prices: Record<string, number | null>;
        hpp_estimate: HppEstimate | null;
        departure_date: string | null;
        departure_city: string | null;
        total_bookings: number;
        total_customers: number;
        total_hotels_assigned: number;
        latest_calculation: {
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
    filters: {
        travel_package_id: number | null;
        departure_schedule_id: number | null;
    };
};

const formatCurrency = (value: number, currency: string): string =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency || 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

export default function HppPackageIndex({
    sourceRows,
    packages,
    filters,
}: Props) {
    const [packageFilter, setPackageFilter] = useState(
        filters.travel_package_id ? String(filters.travel_package_id) : 'all',
    );

    const applyFilters = (): void => {
        router.get(
            '/admin/product-management/hpp-estimate',
            {
                travel_package_id:
                    packageFilter === 'all' ? undefined : packageFilter,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const resetFilters = (): void => {
        setPackageFilter('all');

        router.get(
            '/admin/product-management/hpp-estimate',
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Kalkulasi Harga & HPP Estimasi',
                    href: '/admin/product-management/hpp-estimate',
                },
            ]}
        >
            <Head title="Kalkulasi Harga & HPP Estimasi" />

            <div className="space-y-4">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Kalkulasi Harga & HPP Estimasi
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Susun estimasi biaya, margin, buffer, dan harga jual
                            paket sebelum dipasarkan.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={packageFilter}
                            onValueChange={setPackageFilter}
                        >
                            <SelectTrigger className="w-[220px] rounded-xl">
                                <SelectValue placeholder="Semua Package" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Package
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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetFilters}
                            className="rounded-xl"
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            onClick={applyFilters}
                            className="rounded-xl"
                        >
                            Terapkan
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <Table className="min-w-[1000px]">
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-14 text-center">
                                    No
                                </TableHead>
                                <TableHead className="w-16 text-center">
                                    Aksi
                                </TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Keberangkatan</TableHead>
                                <TableHead className="text-center">
                                    Booking
                                </TableHead>
                                <TableHead className="text-center">
                                    Jamaah
                                </TableHead>
                                <TableHead className="text-right">
                                    HPP Estimasi
                                </TableHead>
                                <TableHead className="text-right">
                                    HPP Actual
                                </TableHead>
                                <TableHead className="text-right">
                                    Actual / Jamaah
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sourceRows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        Belum ada package keberangkatan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sourceRows.map((source, index) => {
                                    const showHref = `/admin/product-management/hpp-estimate/${source.travel_package_id}`;
                                    return (
                                        <TableRow
                                            key={`${source.travel_package_id}-${source.departure_schedule_id}`}
                                            className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/20"
                                        >
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="size-8 rounded-lg"
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="rounded-xl"
                                                    >
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={showHref}
                                                                className="flex items-center gap-2 font-medium text-primary focus:text-primary"
                                                            >
                                                                <Eye className="size-4" />
                                                                Detail HPP
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={showHref}
                                                    className="font-semibold text-foreground transition-colors hover:text-primary hover:underline"
                                                >
                                                    {source.package_name}
                                                </Link>
                                                <div className="font-mono text-xs text-muted-foreground">
                                                    {source.package_code}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">
                                                    {formatDate(
                                                        source.departure_date,
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {source.departure_city ??
                                                        '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {source.total_bookings}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {source.total_customers}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {source.hpp_estimate
                                                    ? formatCurrency(
                                                          source.hpp_estimate
                                                              .grand_total,
                                                          'IDR',
                                                      )
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(
                                                    source.latest_calculation
                                                        ?.grand_total ?? 0,
                                                    source.latest_calculation
                                                        ?.currency ?? 'IDR',
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {source.latest_calculation
                                                    ?.hpp_per_customer !==
                                                    null &&
                                                source.latest_calculation
                                                    ?.hpp_per_customer !==
                                                    undefined
                                                    ? formatCurrency(
                                                          source
                                                              .latest_calculation
                                                              .hpp_per_customer,
                                                          source
                                                              .latest_calculation
                                                              .currency,
                                                      )
                                                    : '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
