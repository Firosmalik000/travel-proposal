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
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatDate } from '@/lib/date-format';
import { formatIdr } from '@/lib/number-format';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Banknote,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    CircleDollarSign,
    Clock,
    CreditCard,
    Layers,
    Plus,
    Receipt,
    ReceiptText,
    Users,
    Wallet,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { VendorBillTracking } from './VendorHppTrackingSection';

type HppItem = {
    label: string;
    cost_type: string;
    calculation_basis: 'per_pax' | 'per_room' | 'collective';
    quantity: number;
    unit_price: number;
    total_price: number;
};

type TripDetail = {
    id: number;
    code: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    registered_customers: number;
    actual_hpp_idr: number;
    billed_idr: number;
    paid_idr: number;
    vendor_paid_idr: number;
    operational_paid_idr: number;
    vendor_payable_idr: number;
    remaining_actual_hpp_idr: number;
    unbilled_actual_hpp_idr: number;
    payment_percentage: number;
    open_bills: number;
    overdue_bills: number;
    hpp_items: HppItem[];
    bills: VendorBillTracking[];
    operational_payments: Array<{
        id: number;
        transaction_date: string | null;
        amount_idr: number;
        description: string | null;
        account_label: string;
    }>;
};

type Props = {
    trip: TripDetail;
    today: string;
    paymentAccounts: Array<{
        id: number;
        code: string;
        name: string;
        account_number: string | null;
        balance_idr: number;
    }>;
};

const basisLabels: Record<HppItem['calculation_basis'], string> = {
    per_pax: 'Per jemaah',
    per_room: 'Per kamar',
    collective: 'Kolektif',
};

function idempotencyKey(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function VendorHppShow({ trip, today, paymentAccounts }: Props) {
    const { can } = usePermission('finance_vendor_hpp');
    const [payingBill, setPayingBill] = useState<VendorBillTracking | null>(
        null,
    );
    const [payingItem, setPayingItem] = useState<HppItem | null>(null);
    const [showOperationalPayment, setShowOperationalPayment] = useState(false);
    const [activeTab, setActiveTab] = useState('hpp');

    const billPaymentForm = useForm({
        amount_idr: '',
        payment_date: today,
        financial_account_id: '',
        notes: '',
        idempotency_key: idempotencyKey('vendor-payment'),
    });

    const operationalPaymentForm = useForm({
        transaction_type: 'operating_expense',
        financial_account_id: '',
        package_id: String(trip.id),
        transaction_date: today,
        currency: 'IDR',
        exchange_rate: '1',
        amount_original: '',
        amount_idr: '',
        description: '',
        idempotency_key: idempotencyKey('hpp-operational'),
    });

    const openBillPayment = (bill: VendorBillTracking) => {
        setPayingBill(bill);
        billPaymentForm.setData({
            amount_idr: String(bill.remaining_amount_idr),
            payment_date: today,
            financial_account_id: '',
            notes: `Pembayaran ${bill.vendor_name}${bill.invoice_number ? ` · ${bill.invoice_number}` : ''}`,
            idempotency_key: idempotencyKey('vendor-payment'),
        });
        billPaymentForm.clearErrors();
    };

    const openOperationalPayment = (item?: HppItem) => {
        const selectedItem = item ?? null;
        setPayingItem(selectedItem);
        setShowOperationalPayment(true);
        operationalPaymentForm.setData({
            transaction_type: 'operating_expense',
            financial_account_id: '',
            package_id: String(trip.id),
            transaction_date: today,
            currency: 'IDR',
            exchange_rate: '1',
            amount_original: selectedItem
                ? String(selectedItem.total_price)
                : '',
            amount_idr: selectedItem ? String(selectedItem.total_price) : '',
            description: selectedItem
                ? `${selectedItem.label} · ${trip.code}`
                : `Biaya operasional · ${trip.code}`,
            idempotency_key: idempotencyKey('hpp-operational'),
        });
        operationalPaymentForm.clearErrors();
    };

    const submitBillPayment = (event: FormEvent) => {
        event.preventDefault();
        if (!payingBill) return;

        billPaymentForm.post(
            `/admin/financial-management/ledger/vendor-bills/${payingBill.id}/payments`,
            {
                preserveScroll: true,
                onSuccess: () => setPayingBill(null),
            },
        );
    };

    const submitOperationalPayment = (event: FormEvent) => {
        event.preventDefault();
        operationalPaymentForm.post(
            `/admin/financial-management/vendor-hpp/${trip.id}/operational-payments`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPayingItem(null);
                    setShowOperationalPayment(false);
                },
            },
        );
    };

    const getBillStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                        Lunas
                    </Badge>
                );
            case 'partially_paid':
                return (
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                        Sebagian
                    </Badge>
                );
            case 'open':
            default:
                return (
                    <Badge variant="outline" className="text-muted-foreground">
                        Belum dibayar
                    </Badge>
                );
        }
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'HPP & Hutang Vendor',
                    href: '/admin/financial-management/vendor-hpp',
                },
                {
                    title: trip.code,
                    href: `/admin/financial-management/vendor-hpp/${trip.id}`,
                },
            ]}
        >
            <Head title={`Hutang HPP - ${trip.code}`} />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5">
                        <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="shrink-0 rounded-xl"
                        >
                            <Link
                                href="/admin/financial-management/vendor-hpp"
                                aria-label="Kembali ke daftar hutang HPP"
                            >
                                <ArrowLeft className="size-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                                    {trip.name}
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className="font-mono text-xs font-semibold"
                                >
                                    {trip.code}
                                </Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays className="size-4 text-muted-foreground/80" />
                                    {formatDate(trip.start_date)} –{' '}
                                    {formatDate(trip.end_date)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Users className="size-4 text-muted-foreground/80" />
                                    {trip.registered_customers} jemaah terdaftar
                                </span>
                            </div>
                        </div>
                    </div>
                    {can('create') ? (
                        <Button
                            onClick={() => openOperationalPayment()}
                            className="rounded-xl shadow-xs"
                        >
                            <Banknote className="size-4" />
                            Catat biaya langsung
                        </Button>
                    ) : null}
                </div>

                {/* Summary Metrics */}
                <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={CircleDollarSign}
                        label="HPP Aktual"
                        value={trip.actual_hpp_idr}
                        detail="Total estimasi kebutuhan trip"
                        iconBg="bg-primary/10 text-primary"
                    />
                    <SummaryCard
                        icon={CheckCircle2}
                        label="Sudah Dibayar"
                        value={trip.paid_idr}
                        detail={`Vendor ${formatIdr(trip.vendor_paid_idr)} · Langsung ${formatIdr(trip.operational_paid_idr)}`}
                        iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        success
                    />
                    <SummaryCard
                        icon={AlertTriangle}
                        label="Sisa HPP"
                        value={trip.remaining_actual_hpp_idr}
                        detail={`${trip.payment_percentage}% biaya terealisasi`}
                        iconBg="bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        danger={trip.remaining_actual_hpp_idr > 0}
                    />
                    <SummaryCard
                        icon={ReceiptText}
                        label="Hutang Vendor"
                        value={trip.vendor_payable_idr}
                        detail={`${trip.open_bills} tagihan belum lunas`}
                        iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                </div>

                {/* Tabbed Section */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-4"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <TabsList className="inline-flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1 sm:w-auto">
                            <TabsTrigger
                                value="hpp"
                                className="gap-2 rounded-lg px-3.5 py-2 text-xs font-medium sm:text-sm"
                            >
                                <Layers className="size-4" />
                                <span>Rincian HPP Aktual</span>
                                <span className="rounded-full bg-muted-foreground/15 px-2 py-0.5 text-xs font-semibold tabular-nums">
                                    {trip.hpp_items.length}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="bills"
                                className="gap-2 rounded-lg px-3.5 py-2 text-xs font-medium sm:text-sm"
                            >
                                <Receipt className="size-4" />
                                <span>Tagihan Vendor</span>
                                <span className="rounded-full bg-muted-foreground/15 px-2 py-0.5 text-xs font-semibold tabular-nums">
                                    {trip.bills.length}
                                </span>
                                {trip.open_bills > 0 ? (
                                    <span
                                        className="size-2 rounded-full bg-amber-500"
                                        title={`${trip.open_bills} tagihan belum lunas`}
                                    />
                                ) : null}
                            </TabsTrigger>
                            <TabsTrigger
                                value="operational"
                                className="gap-2 rounded-lg px-3.5 py-2 text-xs font-medium sm:text-sm"
                            >
                                <Wallet className="size-4" />
                                <span>Biaya Langsung</span>
                                <span className="rounded-full bg-muted-foreground/15 px-2 py-0.5 text-xs font-semibold tabular-nums">
                                    {trip.operational_payments.length}
                                </span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab 1: Rincian HPP Aktual */}
                    <TabsContent value="hpp" className="mt-0">
                        <Card className="overflow-hidden border shadow-xs">
                            <CardContent className="p-0">
                                {trip.hpp_items.length === 0 ? (
                                    <div className="p-12 text-center text-sm text-muted-foreground">
                                        Belum ada komponen HPP yang tercatat
                                        untuk paket ini.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="font-semibold">
                                                        Komponen
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Dasar Hitung
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Qty
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Harga Satuan
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Total
                                                    </TableHead>
                                                    {can('create') ? (
                                                        <TableHead className="text-right font-semibold">
                                                            Aksi
                                                        </TableHead>
                                                    ) : null}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {trip.hpp_items.map(
                                                    (item, index) => (
                                                        <TableRow
                                                            key={`${item.label}-${index}`}
                                                        >
                                                            <TableCell className="font-medium">
                                                                {item.label}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        basisLabels[
                                                                            item
                                                                                .calculation_basis
                                                                        ]
                                                                    }
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right tabular-nums">
                                                                {item.quantity}
                                                            </TableCell>
                                                            <TableCell className="text-right text-muted-foreground tabular-nums">
                                                                {formatIdr(
                                                                    item.unit_price,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right font-semibold tabular-nums">
                                                                {formatIdr(
                                                                    item.total_price,
                                                                )}
                                                            </TableCell>
                                                            {can('create') ? (
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-8 gap-1 text-xs hover:bg-muted"
                                                                        onClick={() =>
                                                                            openOperationalPayment(
                                                                                item,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Plus className="size-3.5" />
                                                                        Bayar
                                                                        langsung
                                                                    </Button>
                                                                </TableCell>
                                                            ) : null}
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow className="bg-muted/30">
                                                    <TableCell
                                                        colSpan={4}
                                                        className="font-semibold text-foreground"
                                                    >
                                                        Total HPP Aktual
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-foreground tabular-nums">
                                                        {formatIdr(
                                                            trip.actual_hpp_idr,
                                                        )}
                                                    </TableCell>
                                                    {can('create') ? (
                                                        <TableCell />
                                                    ) : null}
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 2: Tagihan Vendor */}
                    <TabsContent value="bills" className="mt-0">
                        <Card className="overflow-hidden border shadow-xs">
                            <CardContent className="p-0">
                                {trip.bills.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                            <Receipt className="size-6 text-muted-foreground" />
                                        </div>
                                        <p className="mt-3 font-medium">
                                            Belum ada tagihan vendor
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            HPP aktual belum ditagihkan sebesar{' '}
                                            <span className="font-semibold text-foreground">
                                                {formatIdr(
                                                    trip.unbilled_actual_hpp_idr,
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="font-semibold">
                                                        Vendor & Invoice
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Jatuh Tempo
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Tagihan
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Dibayar
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Sisa Hutang
                                                    </TableHead>
                                                    {can('create') ? (
                                                        <TableHead className="text-right font-semibold">
                                                            Aksi
                                                        </TableHead>
                                                    ) : null}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {trip.bills.map((bill) => (
                                                    <TableRow key={bill.id}>
                                                        <TableCell>
                                                            <p className="font-medium text-foreground">
                                                                {
                                                                    bill.vendor_name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {bill.invoice_number ||
                                                                    'Tanpa invoice'}{' '}
                                                                ·{' '}
                                                                {formatDate(
                                                                    bill.bill_date,
                                                                )}
                                                            </p>
                                                            {bill.payments
                                                                .length > 0 ? (
                                                                <details className="group mt-2 text-xs">
                                                                    <summary className="inline-flex cursor-pointer items-center gap-1 font-medium text-primary select-none hover:underline">
                                                                        <span>
                                                                            {
                                                                                bill
                                                                                    .payments
                                                                                    .length
                                                                            }{' '}
                                                                            riwayat
                                                                            pembayaran
                                                                        </span>
                                                                        <ChevronDown className="size-3.5 transition-transform duration-200 group-open:rotate-180" />
                                                                    </summary>
                                                                    <div className="mt-2 space-y-1.5 rounded-lg border bg-muted/20 p-2.5 text-muted-foreground">
                                                                        {bill.payments.map(
                                                                            (
                                                                                payment,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        payment.id
                                                                                    }
                                                                                    className="flex items-center justify-between gap-2 text-xs"
                                                                                >
                                                                                    <span>
                                                                                        {formatDate(
                                                                                            payment.payment_date,
                                                                                        )}{' '}
                                                                                        ·{' '}
                                                                                        {
                                                                                            payment.account_label
                                                                                        }
                                                                                    </span>
                                                                                    <span className="font-medium text-foreground tabular-nums">
                                                                                        {formatIdr(
                                                                                            payment.amount_idr,
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </details>
                                                            ) : null}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {formatDate(
                                                                    bill.due_date,
                                                                )}
                                                            </div>
                                                            {bill.is_overdue ? (
                                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                                                                    <Clock className="size-3" />
                                                                    Terlambat
                                                                </span>
                                                            ) : null}
                                                        </TableCell>
                                                        <TableCell>
                                                            {getBillStatusBadge(
                                                                bill.status,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatIdr(
                                                                bill.amount_idr,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right text-emerald-600 tabular-nums dark:text-emerald-400">
                                                            {formatIdr(
                                                                bill.paid_amount_idr,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold tabular-nums">
                                                            {bill.remaining_amount_idr >
                                                            0 ? (
                                                                <span className="text-foreground">
                                                                    {formatIdr(
                                                                        bill.remaining_amount_idr,
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    Lunas
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        {can('create') ? (
                                                            <TableCell className="text-right">
                                                                {bill.remaining_amount_idr >
                                                                0 ? (
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 rounded-lg text-xs"
                                                                        onClick={() =>
                                                                            openBillPayment(
                                                                                bill,
                                                                            )
                                                                        }
                                                                    >
                                                                        <CreditCard className="size-3.5" />
                                                                        Bayar
                                                                    </Button>
                                                                ) : null}
                                                            </TableCell>
                                                        ) : null}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Biaya Operasional Langsung */}
                    <TabsContent value="operational" className="mt-0">
                        <Card className="overflow-hidden border shadow-xs">
                            <CardContent className="p-0">
                                {trip.operational_payments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                            <Wallet className="size-6 text-muted-foreground" />
                                        </div>
                                        <p className="mt-3 font-medium">
                                            Belum ada biaya operasional langsung
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Pengeluaran yang dibayar langsung
                                            tanpa invoice vendor akan tercatat
                                            di sini.
                                        </p>
                                        {can('create') ? (
                                            <Button
                                                onClick={() =>
                                                    openOperationalPayment()
                                                }
                                                variant="outline"
                                                size="sm"
                                                className="mt-4 gap-1.5 rounded-lg"
                                            >
                                                <Plus className="size-4" />
                                                Catat biaya langsung
                                            </Button>
                                        ) : null}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="font-semibold">
                                                        Tanggal
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Keterangan
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Akun Pembayar
                                                    </TableHead>
                                                    <TableHead className="text-right font-semibold">
                                                        Nominal
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {trip.operational_payments.map(
                                                    (payment) => (
                                                        <TableRow
                                                            key={payment.id}
                                                        >
                                                            <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                                {formatDate(
                                                                    payment.transaction_date,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="font-medium text-foreground">
                                                                {payment.description ||
                                                                    'Biaya operasional trip'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="font-normal"
                                                                >
                                                                    {
                                                                        payment.account_label
                                                                    }
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                                                                {formatIdr(
                                                                    payment.amount_idr,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow className="bg-muted/30">
                                                    <TableCell
                                                        colSpan={3}
                                                        className="font-semibold text-foreground"
                                                    >
                                                        Total Biaya Langsung
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                                                        {formatIdr(
                                                            trip.operational_paid_idr,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal Pembayaran Tagihan Vendor */}
            <PaymentDialog
                open={payingBill !== null}
                onOpenChange={(open) => !open && setPayingBill(null)}
                title={`Bayar ${payingBill?.vendor_name ?? 'tagihan vendor'}`}
                description={`Sisa tagihan: ${formatIdr(payingBill?.remaining_amount_idr ?? 0)}`}
                amount={billPaymentForm.data.amount_idr}
                date={billPaymentForm.data.payment_date}
                accountId={billPaymentForm.data.financial_account_id}
                notes={billPaymentForm.data.notes}
                accounts={paymentAccounts}
                errors={billPaymentForm.errors}
                processing={billPaymentForm.processing}
                onAmountChange={(value) =>
                    billPaymentForm.setData('amount_idr', value)
                }
                onDateChange={(value) =>
                    billPaymentForm.setData('payment_date', value)
                }
                onAccountChange={(value) =>
                    billPaymentForm.setData('financial_account_id', value)
                }
                onNotesChange={(value) =>
                    billPaymentForm.setData('notes', value)
                }
                onSubmit={submitBillPayment}
                submitLabel="Bayar tagihan"
            />

            {/* Modal Pencatatan Biaya Langsung */}
            <PaymentDialog
                open={showOperationalPayment}
                onOpenChange={(open) => {
                    setShowOperationalPayment(open);
                    if (!open) setPayingItem(null);
                }}
                title={
                    payingItem
                        ? `Bayar langsung · ${payingItem.label}`
                        : 'Catat biaya operasional langsung'
                }
                description="Pengeluaran operasional langsung dari bank atau kas perusahaan."
                amount={operationalPaymentForm.data.amount_idr}
                date={operationalPaymentForm.data.transaction_date}
                accountId={operationalPaymentForm.data.financial_account_id}
                notes={operationalPaymentForm.data.description}
                accounts={paymentAccounts}
                errors={operationalPaymentForm.errors}
                processing={operationalPaymentForm.processing}
                onAmountChange={(value) => {
                    operationalPaymentForm.setData('amount_idr', value);
                    operationalPaymentForm.setData('amount_original', value);
                }}
                onDateChange={(value) =>
                    operationalPaymentForm.setData('transaction_date', value)
                }
                onAccountChange={(value) =>
                    operationalPaymentForm.setData(
                        'financial_account_id',
                        value,
                    )
                }
                onNotesChange={(value) =>
                    operationalPaymentForm.setData('description', value)
                }
                onSubmit={submitOperationalPayment}
                submitLabel="Catat pengeluaran"
            />
        </AppSidebarLayout>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    detail,
    iconBg,
    success = false,
    danger = false,
}: {
    icon: typeof CircleDollarSign;
    label: string;
    value: number;
    detail: string;
    iconBg: string;
    success?: boolean;
    danger?: boolean;
}) {
    return (
        <Card className="overflow-hidden border shadow-xs">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-muted-foreground">
                        {label}
                    </span>
                    <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
                    >
                        <Icon className="size-4" />
                    </div>
                </div>
                <p
                    className={`mt-2 text-xl font-bold tracking-tight tabular-nums sm:text-2xl ${
                        success
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : danger
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-foreground'
                    }`}
                >
                    {formatIdr(value)}
                </p>
                <p className="mt-1.5 truncate text-xs text-muted-foreground">
                    {detail}
                </p>
            </CardContent>
        </Card>
    );
}

type PaymentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    amount: string;
    date: string;
    accountId: string;
    notes: string;
    accounts: Props['paymentAccounts'];
    errors: Partial<Record<string, string>>;
    processing: boolean;
    onAmountChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onAccountChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onSubmit: (event: FormEvent) => void;
    submitLabel: string;
};

function PaymentDialog({
    open,
    onOpenChange,
    title,
    description,
    amount,
    date,
    accountId,
    notes,
    accounts,
    errors,
    processing,
    onAmountChange,
    onDateChange,
    onAccountChange,
    onNotesChange,
    onSubmit,
    submitLabel,
}: PaymentDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor={`${submitLabel}-amount`}>
                            Nominal (IDR)
                        </Label>
                        <Input
                            id={`${submitLabel}-amount`}
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(event) =>
                                onAmountChange(event.target.value)
                            }
                            required
                        />
                        {errors.amount_idr ? (
                            <p className="text-xs text-destructive">
                                {errors.amount_idr}
                            </p>
                        ) : null}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={`${submitLabel}-date`}>
                            Tanggal pembayaran
                        </Label>
                        <Input
                            id={`${submitLabel}-date`}
                            type="date"
                            value={date}
                            onChange={(event) =>
                                onDateChange(event.target.value)
                            }
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Akun bank / kas pembayar</Label>
                        <Select
                            value={accountId}
                            onValueChange={onAccountChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih akun pembayaran" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((account) => (
                                    <SelectItem
                                        key={account.id}
                                        value={String(account.id)}
                                    >
                                        {account.code} · {account.name} (Saldo:{' '}
                                        {formatIdr(account.balance_idr)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.financial_account_id ? (
                            <p className="text-xs text-destructive">
                                {errors.financial_account_id}
                            </p>
                        ) : null}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={`${submitLabel}-notes`}>
                            Keterangan
                        </Label>
                        <Input
                            id={`${submitLabel}-notes`}
                            value={notes}
                            onChange={(event) =>
                                onNotesChange(event.target.value)
                            }
                            required
                        />
                        {errors.notes || errors.description ? (
                            <p className="text-xs text-destructive">
                                {errors.notes || errors.description}
                            </p>
                        ) : null}
                    </div>
                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || accounts.length === 0}
                        >
                            {processing ? 'Menyimpan...' : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
