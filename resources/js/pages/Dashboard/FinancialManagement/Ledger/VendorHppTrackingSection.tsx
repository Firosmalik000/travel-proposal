import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/date-format';
import { formatIdr } from '@/lib/number-format';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    ChartNoAxesCombined,
    CircleDollarSign,
    ReceiptText,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export type VendorBillTracking = {
    id: number;
    package_vendor_id: number | null;
    vendor_name: string;
    invoice_number: string | null;
    bill_date: string | null;
    due_date: string | null;
    status: string;
    amount_idr: number;
    paid_amount_idr: number;
    remaining_amount_idr: number;
    recognized_amount_idr: number;
    notes: string | null;
    is_overdue: boolean;
    payments: Array<{
        id: number;
        payment_date: string | null;
        amount_idr: number;
        account_label: string;
        notes: string | null;
    }>;
};

export type TripFinanceTracking = {
    id: number;
    code: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    operational_status: string;
    registered_customers: number;
    actual_hpp_idr: number;
    billed_idr: number;
    paid_idr: number;
    vendor_paid_idr: number;
    operational_paid_idr: number;
    vendor_payable_idr: number;
    remaining_actual_hpp_idr: number;
    recognized_hpp_idr: number;
    unbilled_actual_hpp_idr: number;
    bill_variance_idr: number;
    payment_percentage: number;
    open_bills: number;
    overdue_bills: number;
};

type Props = {
    summary: {
        trips?: number;
        registered_customers?: number;
        actual_hpp_idr?: number;
        billed_idr?: number;
        paid_idr?: number;
        vendor_payable_idr?: number;
        remaining_actual_hpp_idr?: number;
        open_bills?: number;
        overdue_bills?: number;
    };
    trips: TripFinanceTracking[];
};

export default function VendorHppTrackingSection({ summary, trips }: Props) {
    const [search, setSearch] = useState('');
    const filteredTrips = useMemo(() => {
        const needle = search.trim().toLocaleLowerCase('id-ID');
        return needle
            ? trips.filter((trip) =>
                  `${trip.code} ${trip.name}`
                      .toLocaleLowerCase('id-ID')
                      .includes(needle),
              )
            : trips;
    }, [search, trips]);

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    icon={ChartNoAxesCombined}
                    label="HPP aktual berjalan"
                    value={summary.actual_hpp_idr ?? 0}
                    detail={`${summary.registered_customers ?? 0} jemaah · ${summary.trips ?? 0} trip`}
                />
                <MetricCard
                    icon={ReceiptText}
                    label="Tagihan vendor"
                    value={summary.billed_idr ?? 0}
                    detail={`${summary.open_bills ?? 0} tagihan masih terbuka`}
                />
                <MetricCard
                    icon={CircleDollarSign}
                    label="Sudah dibayar"
                    value={summary.paid_idr ?? 0}
                    detail="Vendor dan operasional langsung"
                />
                <MetricCard
                    icon={AlertTriangle}
                    label="Sisa HPP belum dibayar"
                    value={summary.remaining_actual_hpp_idr ?? 0}
                    detail={`${summary.overdue_bills ?? 0} tagihan terlambat`}
                    danger={(summary.remaining_actual_hpp_idr ?? 0) > 0}
                />
            </div>

            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Hutang HPP per paket
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Buka detail untuk melihat komponen HPP, tagihan,
                                riwayat, dan melakukan pembayaran.
                            </p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari paket atau kode..."
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {filteredTrips.length === 0 ? (
                        <div className="p-10 text-center text-sm text-muted-foreground">
                            Tidak ada paket yang sesuai pencarian.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Paket</TableHead>
                                        <TableHead>Periode & jemaah</TableHead>
                                        <TableHead className="text-right">
                                            HPP aktual
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Dibayar
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Sisa HPP
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTrips.map((trip) => (
                                        <TableRow key={trip.id}>
                                            <TableCell className="min-w-56">
                                                <p className="font-semibold">
                                                    {trip.code}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {trip.name}
                                                </p>
                                            </TableCell>
                                            <TableCell className="min-w-48 text-sm">
                                                <p>
                                                    {formatDate(
                                                        trip.start_date,
                                                    )}{' '}
                                                    –{' '}
                                                    {formatDate(trip.end_date)}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {trip.registered_customers}{' '}
                                                    jemaah terdaftar
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {formatIdr(trip.actual_hpp_idr)}
                                            </TableCell>
                                            <TableCell className="text-right text-emerald-700 tabular-nums dark:text-emerald-300">
                                                {formatIdr(trip.paid_idr)}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-rose-700 tabular-nums dark:text-rose-300">
                                                {formatIdr(
                                                    trip.remaining_actual_hpp_idr,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="min-w-32 space-y-2">
                                                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-emerald-500"
                                                            style={{
                                                                width: `${trip.payment_percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>
                                                            {
                                                                trip.payment_percentage
                                                            }
                                                            %
                                                        </span>
                                                        {trip.open_bills > 0 ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="font-normal"
                                                            >
                                                                {
                                                                    trip.open_bills
                                                                }{' '}
                                                                tagihan
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link
                                                        href={`/admin/financial-management/vendor-hpp/${trip.id}`}
                                                    >
                                                        Lihat detail{' '}
                                                        <ArrowRight className="size-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({
    icon: Icon,
    label,
    value,
    detail,
    danger = false,
}: {
    icon: typeof CircleDollarSign;
    label: string;
    value: number;
    detail: string;
    danger?: boolean;
}) {
    return (
        <Card>
            <CardContent className="flex gap-3 pt-5">
                <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${danger ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-primary/10 text-primary'}`}
                >
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 truncate text-lg font-semibold tabular-nums">
                        {formatIdr(value)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {detail}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
