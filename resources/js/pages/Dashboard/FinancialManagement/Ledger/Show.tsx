import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatDate, formatDateTime } from '@/lib/date-format';
import { formatIdr } from '@/lib/number-format';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDown,
    ArrowLeft,
    ArrowLeftRight,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock,
    FileText,
    Landmark,
    RotateCcw,
    Scale,
    ShieldAlert,
    User,
    Wallet,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type AccountDetail = {
    id: number;
    code: string;
    name: string;
    type: string;
    is_cash_account: boolean;
    cash_account_type: string | null;
};

type JournalLine = {
    id: number;
    entry_type: 'debit' | 'credit';
    amount_original: string;
    amount_idr: number;
    memo: string | null;
    account: AccountDetail;
};

type RelatedTransaction = {
    id: number;
    transaction_number: string;
    transaction_date: string | null;
    description: string;
    posted_at: string | null;
};

type TransactionDetail = {
    id: number;
    transaction_number: string;
    transaction_date: string | null;
    transaction_type: string;
    category_code: string | null;
    category_label: string | null;
    status: 'draft' | 'posted' | 'reversed';
    currency: string;
    exchange_rate: string;
    amount_original: string;
    amount_idr: number;
    description: string;
    source_type: string | null;
    source_id: number | null;
    idempotency_key: string;
    posted_at: string | null;
    posted_by: { id: number; name: string; email: string } | null;
    reversed_at: string | null;
    reversed_by: { id: number; name: string; email: string } | null;
    can_reverse: boolean;
    reversal: RelatedTransaction | null;
    reversal_of: RelatedTransaction | null;
    package: { id: number; code: string; name: string } | null;
    lines: JournalLine[];
};

type Props = {
    permissionKey: string;
    backUrl: string;
    backLabel: string;
    detailContext: 'transactions' | 'accounting';
    transaction: TransactionDetail;
};

const transactionTypeLabels: Record<string, string> = {
    opening_balance: 'Saldo Awal',
    manual_journal: 'Jurnal Umum',
    transfer: 'Transfer Dana',
    legacy_unclassified: 'Historis',
    booking_payment: 'Pembayaran Booking',
    capital_contribution: 'Setoran Modal',
    owner_withdrawal: 'Penarikan Pemilik',
    operating_expense: 'Biaya Operasional',
    other_income: 'Pendapatan Lain',
    customer_refund: 'Refund Jemaah',
    agent_commission: 'Komisi Agen',
    inventory_purchase: 'Pembelian Inventaris',
    inventory_issue: 'Pemakaian Inventaris',
    vendor_bill: 'Tagihan Vendor',
    vendor_payment: 'Pembayaran Vendor',
    vendor_advance_payment: 'Uang Muka Vendor',
    vendor_advance_application: 'Alokasi Uang Muka Vendor',
    vendor_service_use: 'Penggunaan Layanan Vendor',
    trip_revenue_recognition: 'Penutupan Finansial Trip',
    period_adjustment: 'Penyesuaian Periode',
    reversal: 'Reversal / Pembatalan',
};

const accountTypeLabels: Record<string, string> = {
    asset: 'Aset',
    liability: 'Kewajiban',
    equity: 'Ekuitas',
    revenue: 'Pendapatan',
    expense: 'Beban',
};

export default function Show({
    permissionKey,
    backUrl,
    backLabel,
    detailContext,
    transaction,
}: Props) {
    const { can } = usePermission(permissionKey);
    const [showReversalDialog, setShowReversalDialog] = useState(false);

    const reversalForm = useForm({
        reason: '',
    });

    const isTransfer = transaction.transaction_type === 'transfer';
    const sourceLine = isTransfer
        ? transaction.lines.find((line) => line.entry_type === 'credit')
        : null;
    const destLine = isTransfer
        ? transaction.lines.find((line) => line.entry_type === 'debit')
        : null;

    const totalDebit = transaction.lines
        .filter((l) => l.entry_type === 'debit')
        .reduce((sum, l) => sum + l.amount_idr, 0);

    const totalCredit = transaction.lines
        .filter((l) => l.entry_type === 'credit')
        .reduce((sum, l) => sum + l.amount_idr, 0);

    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    const handleReversal = (e: FormEvent) => {
        e.preventDefault();
        reversalForm.post(
            `/admin/financial-management/ledger/transactions/${transaction.id}/reverse`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowReversalDialog(false);
                    reversalForm.reset();
                },
            },
        );
    };

    return (
        <AppSidebarLayout>
            <Head
                title={`Transaksi ${transaction.transaction_number} - Manajemen Keuangan`}
            />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Header & Back Button */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link
                                href={backUrl}
                                className="flex items-center gap-1 font-medium hover:text-foreground"
                            >
                                <ArrowLeft className="size-4" />
                                {backLabel}
                            </Link>
                            <span>/</span>
                            <span className="text-foreground">Detail</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                                {transaction.transaction_number}
                            </h1>
                            <Badge
                                variant={
                                    transaction.status === 'posted'
                                        ? 'default'
                                        : 'secondary'
                                }
                                className={
                                    transaction.status === 'posted'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : ''
                                }
                            >
                                {transaction.status === 'posted'
                                    ? 'Diposting'
                                    : 'Direversal'}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                                {transactionTypeLabels[
                                    transaction.transaction_type
                                ] ?? transaction.transaction_type}
                            </Badge>
                            {transaction.category_label &&
                                !isTransfer &&
                                transaction.category_label !==
                                    transaction.transaction_type && (
                                    <Badge
                                        variant="secondary"
                                        className="font-normal"
                                    >
                                        {transaction.category_label}
                                    </Badge>
                                )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {can('edit') && transaction.can_reverse && (
                            <Button
                                variant="outline"
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                onClick={() => setShowReversalDialog(true)}
                            >
                                <RotateCcw className="size-4" />
                                Reversal Transaksi
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={backUrl}>
                                <ArrowLeft className="size-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Banner Jika Transaksi Telah Direversal */}
                {transaction.reversal && (
                    <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                        <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
                        <AlertDescription className="text-sm">
                            Transaksi ini telah dibatalkan (direversal) oleh{' '}
                            <Link
                                href={`/admin/financial-management/transactions/${transaction.reversal.id}?from=${detailContext}`}
                                className="font-semibold underline underline-offset-2"
                            >
                                {transaction.reversal.transaction_number}
                            </Link>{' '}
                            pada{' '}
                            {formatDateTime(transaction.reversal.posted_at)}.
                            Catatan:{' '}
                            <span className="italic">
                                {transaction.reversal.description}
                            </span>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Banner Jika Transaksi Merupakan Hasil Reversal */}
                {transaction.reversal_of && (
                    <Alert className="border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-200">
                        <RotateCcw className="size-4 text-sky-600 dark:text-sky-400" />
                        <AlertDescription className="text-sm">
                            Ini adalah transaksi pembalik (reversal) untuk{' '}
                            <Link
                                href={`/admin/financial-management/transactions/${transaction.reversal_of.id}?from=${detailContext}`}
                                className="font-semibold underline underline-offset-2"
                            >
                                {transaction.reversal_of.transaction_number}
                            </Link>
                            .
                        </AlertDescription>
                    </Alert>
                )}

                {/* Petunjuk Visual Khusus Transfer Dana */}
                {isTransfer && sourceLine && destLine && (
                    <div className="overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-b from-primary/5 via-muted/30 to-muted/10 p-5 shadow-xs">
                        <div className="mb-4 flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            <span className="flex items-center gap-1.5 text-primary">
                                <ArrowLeftRight className="size-4" />
                                Alur Perpindahan Dana Antar-Rekening
                            </span>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary normal-case">
                                {formatIdr(transaction.amount_idr)}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                            {/* Rekening Asal */}
                            <div className="rounded-xl border border-amber-500/30 bg-background p-4 shadow-xs">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <Wallet className="size-3.5 text-amber-500" />
                                        Rekening Asal
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="h-4 border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[10px] font-semibold text-amber-700 dark:text-amber-400"
                                    >
                                        Sumber Dana (-)
                                    </Badge>
                                </div>
                                <div className="text-base font-bold text-foreground">
                                    {sourceLine.account.code} ·{' '}
                                    {sourceLine.account.name}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Saldo berkurang:{' '}
                                    <strong className="font-semibold text-amber-600 dark:text-amber-400">
                                        -{formatIdr(sourceLine.amount_idr)}
                                    </strong>
                                </div>
                            </div>

                            {/* Panah Indikator */}
                            <div className="flex flex-col items-center justify-center py-1 md:py-0">
                                <div className="flex size-11 items-center justify-center rounded-full border border-primary/30 bg-primary text-primary-foreground shadow-xs">
                                    <ArrowRight className="hidden size-5 md:block" />
                                    <ArrowDown className="size-5 md:hidden" />
                                </div>
                                <span className="mt-1.5 text-xs font-bold text-primary tabular-nums">
                                    {formatIdr(transaction.amount_idr)}
                                </span>
                            </div>

                            {/* Rekening Tujuan */}
                            <div className="rounded-xl border border-emerald-500/30 bg-background p-4 shadow-xs">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <Landmark className="size-3.5 text-emerald-500" />
                                        Rekening Tujuan
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="h-4 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"
                                    >
                                        Penerima Dana (+)
                                    </Badge>
                                </div>
                                <div className="text-base font-bold text-foreground">
                                    {destLine.account.code} ·{' '}
                                    {destLine.account.name}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    Saldo bertambah:{' '}
                                    <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                                        +{formatIdr(destLine.amount_idr)}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid Informasi Utama & Metadata */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Ringkasan Finansial */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <FileText className="size-4 text-primary" />
                                Informasi Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1 rounded-lg border bg-muted/20 p-3">
                                <span className="text-xs text-muted-foreground">
                                    Nominal Transaksi (IDR)
                                </span>
                                <div className="text-xl font-bold text-foreground tabular-nums">
                                    {formatIdr(transaction.amount_idr)}
                                </div>
                                {transaction.currency !== 'IDR' && (
                                    <div className="text-xs text-muted-foreground">
                                        {transaction.currency}{' '}
                                        {transaction.amount_original} (Kurs:{' '}
                                        {transaction.exchange_rate})
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 rounded-lg border bg-muted/20 p-3">
                                <span className="text-xs text-muted-foreground">
                                    Tanggal Transaksi
                                </span>
                                <div className="flex items-center gap-2 font-medium">
                                    <CalendarDays className="size-4 text-muted-foreground" />
                                    <span>
                                        {formatDate(
                                            transaction.transaction_date,
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1 rounded-lg border bg-muted/20 p-3 sm:col-span-2">
                                <span className="text-xs text-muted-foreground">
                                    Deskripsi / Keterangan
                                </span>
                                <p className="text-sm font-medium text-foreground">
                                    {transaction.description || '—'}
                                </p>
                            </div>

                            {transaction.package && (
                                <div className="space-y-1 rounded-lg border bg-muted/20 p-3 sm:col-span-2">
                                    <span className="text-xs text-muted-foreground">
                                        Paket Trip Terkait
                                    </span>
                                    <div className="text-sm font-semibold text-foreground">
                                        {transaction.package.code} ·{' '}
                                        {transaction.package.name}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Metadata & Audit Trail */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <ShieldAlert className="size-4 text-primary" />
                                Audit & Jejak Pencatatan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-muted-foreground">
                                    Diposting oleh
                                </span>
                                <span className="flex items-center gap-1 font-medium">
                                    <User className="size-3 text-muted-foreground" />
                                    {transaction.posted_by?.name ?? 'Sistem'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-muted-foreground">
                                    Waktu posting
                                </span>
                                <span className="flex items-center gap-1 font-medium">
                                    <Clock className="size-3 text-muted-foreground" />
                                    {formatDateTime(transaction.posted_at)}
                                </span>
                            </div>
                            {transaction.reversed_at && (
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">
                                        Direversal pada
                                    </span>
                                    <span className="font-medium text-destructive">
                                        {formatDateTime(
                                            transaction.reversed_at,
                                        )}
                                    </span>
                                </div>
                            )}
                            <div className="space-y-1 pt-1">
                                <span className="text-muted-foreground">
                                    Idempotency Key
                                </span>
                                <div className="truncate rounded-md bg-muted/50 p-1.5 font-mono text-[11px] text-muted-foreground">
                                    {transaction.idempotency_key}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabel Rincian Jurnal Akuntansi (Double-Entry Breakdown) */}
                <Card>
                    <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Scale className="size-4 text-primary" />
                                Rincian Pembukuan Jurnal Akuntansi
                            </CardTitle>
                        </div>
                        <Badge
                            variant={isBalanced ? 'outline' : 'destructive'}
                            className={
                                isBalanced
                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                    : ''
                            }
                        >
                            {isBalanced ? (
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="size-3" />
                                    Jurnal Seimbang (Balanced)
                                </span>
                            ) : (
                                'Tidak Seimbang'
                            )}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12 text-center">
                                            No.
                                        </TableHead>
                                        <TableHead>Akun Keuangan</TableHead>
                                        <TableHead>Klasifikasi Akun</TableHead>
                                        <TableHead className="text-center">
                                            Posisi
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Debit (IDR)
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Kredit (IDR)
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transaction.lines.map((line, index) => {
                                        const isDebit =
                                            line.entry_type === 'debit';
                                        return (
                                            <TableRow key={line.id}>
                                                <TableCell className="text-center text-xs text-muted-foreground">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-semibold text-foreground">
                                                        {line.account.code} ·{' '}
                                                        {line.account.name}
                                                    </div>
                                                    {line.account
                                                        .is_cash_account && (
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Rekening kas / bank
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className="font-normal"
                                                    >
                                                        {accountTypeLabels[
                                                            line.account.type
                                                        ] ?? line.account.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={
                                                            isDebit
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        className={
                                                            isDebit
                                                                ? 'bg-primary'
                                                                : 'border-muted-foreground/30'
                                                        }
                                                    >
                                                        {isDebit
                                                            ? 'Debit'
                                                            : 'Kredit'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-medium tabular-nums">
                                                    {isDebit
                                                        ? formatIdr(
                                                              line.amount_idr,
                                                          )
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-medium tabular-nums">
                                                    {!isDebit
                                                        ? formatIdr(
                                                              line.amount_idr,
                                                          )
                                                        : '—'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="font-semibold">
                                        <TableCell
                                            colSpan={4}
                                            className="text-right"
                                        >
                                            Total
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-foreground tabular-nums">
                                            {formatIdr(totalDebit)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-foreground tabular-nums">
                                            {formatIdr(totalCredit)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Konfirmasi Reversal */}
            <Dialog
                open={showReversalDialog}
                onOpenChange={setShowReversalDialog}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <RotateCcw className="size-5" />
                            Konfirmasi Reversal Transaksi
                        </DialogTitle>
                        <DialogDescription>
                            Tindakan ini akan membatalkan dampak saldo dari
                            transaksi {transaction.transaction_number} dengan
                            membuat jurnal pembalik otomatis.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleReversal} className="grid gap-4 py-2">
                        {reversalForm.errors.reason && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {reversalForm.errors.reason}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="reversal-reason">
                                Alasan Pembatalan / Reversal
                            </Label>
                            <Input
                                id="reversal-reason"
                                placeholder="Contoh: Salah nominal input atau transaksi ganda"
                                value={reversalForm.data.reason}
                                onChange={(e) =>
                                    reversalForm.setData(
                                        'reason',
                                        e.target.value,
                                    )
                                }
                                required
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowReversalDialog(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={
                                    reversalForm.processing ||
                                    !reversalForm.data.reason.trim()
                                }
                            >
                                {reversalForm.processing
                                    ? 'Memproses...'
                                    : 'Ya, Buat Reversal'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
