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
import CustomerLayout from '@/layouts/customer-layout';
import { formatDate, formatDateTime } from '@/lib/date-format';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Download,
    Eye,
    FileText,
    ReceiptText,
    Search,
    WalletCards,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export type CustomerPaymentInvoice = {
    id: number;
    invoice_number: string;
    payment_date: string | null;
    amount: number;
    payment_method: string;
    reference_number: string | null;
    notes: string | null;
    status: 'pending' | 'confirmed';
    recorded_at: string | null;
    total_amount: number;
    paid_after: number;
    remaining_after: number;
    download_url: string;
};

type PaymentHistoryBooking = {
    booking_code: string;
    package_name: string;
    payment_status: string;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    currency: string;
    payments: CustomerPaymentInvoice[];
};

const money = (amount: number, currency: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);

const methodLabel: Record<string, string> = {
    transfer: 'Transfer Bank',
    bank_transfer: 'Transfer Bank',
    cash: 'Tunai',
    debit_card: 'Kartu Debit',
    credit_card: 'Kartu Kredit',
    qris: 'QRIS',
    e_wallet: 'Dompet Digital',
};

const paymentStatusLabel: Record<string, string> = {
    unpaid: 'Belum Dibayar',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
};

export default function PaymentHistory({
    booking,
}: {
    booking: PaymentHistoryBooking;
}) {
    const [selectedInvoice, setSelectedInvoice] =
        useState<CustomerPaymentInvoice | null>(null);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<'all' | 'confirmed' | 'pending'>(
        'all',
    );

    const filteredInvoices = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return booking.payments.filter((invoice) => {
            const matchesStatus = status === 'all' || invoice.status === status;
            const matchesQuery =
                normalizedQuery === '' ||
                [
                    invoice.invoice_number,
                    invoice.reference_number,
                    methodLabel[invoice.payment_method] ??
                        invoice.payment_method,
                ].some((value) =>
                    String(value ?? '')
                        .toLowerCase()
                        .includes(normalizedQuery),
                );

            return matchesStatus && matchesQuery;
        });
    }, [booking.payments, query, status]);

    return (
        <CustomerLayout title="Riwayat Pembayaran">
            <Head title={`Riwayat Pembayaran ${booking.booking_code}`} />

            <div className="mx-auto w-full max-w-[1500px] space-y-5">
                <Button variant="ghost" asChild className="-ml-3">
                    <Link href="/customer/bookings">
                        <ArrowLeft className="size-4" /> Kembali ke Booking Saya
                    </Link>
                </Button>

                <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#123f39_0%,#0d5c52_100%)] text-white shadow-xl shadow-emerald-950/10">
                    <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.16em] text-emerald-100 uppercase">
                                <WalletCards className="size-4" /> Riwayat
                                Pembayaran
                            </div>
                            <h1 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">
                                {booking.package_name}
                            </h1>
                            <p className="mt-2 text-sm text-emerald-50/80">
                                {booking.booking_code} ·{' '}
                                {booking.payments.length} invoice pembayaran
                            </p>
                        </div>
                        <Badge className="w-fit border-white/20 bg-white/10 px-3 py-1.5 text-white hover:bg-white/10">
                            {paymentStatusLabel[booking.payment_status] ??
                                booking.payment_status}
                        </Badge>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-3">
                    {[
                        ['Total Tagihan', booking.total_amount],
                        ['Sudah Terverifikasi', booking.paid_amount],
                        ['Sisa Tagihan', booking.remaining_amount],
                    ].map(([label, amount]) => (
                        <Card key={String(label)} className="shadow-sm">
                            <CardContent className="p-4 sm:p-5">
                                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    {label}
                                </p>
                                <p className="mt-2 text-xl font-bold tabular-nums">
                                    {money(Number(amount), booking.currency)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <Card className="overflow-hidden shadow-sm">
                    <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
                        <div>
                            <h2 className="text-lg font-bold">
                                Daftar Invoice
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Satu invoice dibuat untuk setiap pembayaran yang
                                dicatat.
                            </p>
                        </div>
                        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-[minmax(16rem,22rem)_12rem]">
                            <div className="relative">
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={query}
                                    onChange={(event) =>
                                        setQuery(event.target.value)
                                    }
                                    placeholder="Cari invoice, referensi, atau metode..."
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value as
                                            | 'all'
                                            | 'confirmed'
                                            | 'pending',
                                    )
                                }
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="all">Semua Status</option>
                                <option value="confirmed">
                                    Pembayaran Berhasil
                                </option>
                                <option value="pending">
                                    Menunggu Konfirmasi
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[980px] text-sm">
                            <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-5 py-3">Invoice</th>
                                    <th className="px-5 py-3">Tanggal</th>
                                    <th className="px-5 py-3">Metode</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">
                                        Nominal
                                    </th>
                                    <th className="px-5 py-3 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredInvoices.map((invoice) => (
                                    <InvoiceTableRow
                                        key={invoice.id}
                                        invoice={invoice}
                                        currency={booking.currency}
                                        onDetail={() =>
                                            setSelectedInvoice(invoice)
                                        }
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="divide-y md:hidden">
                        {filteredInvoices.map((invoice) => (
                            <InvoiceMobileCard
                                key={invoice.id}
                                invoice={invoice}
                                currency={booking.currency}
                                onDetail={() => setSelectedInvoice(invoice)}
                            />
                        ))}
                    </div>

                    {filteredInvoices.length === 0 ? (
                        <div className="grid place-items-center gap-2 px-4 py-14 text-center">
                            <ReceiptText className="size-9 text-muted-foreground/40" />
                            <p className="font-semibold">
                                Invoice tidak ditemukan
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Ubah kata pencarian atau filter status.
                            </p>
                        </div>
                    ) : null}
                </Card>
            </div>

            <InvoiceDetailDialog
                invoice={selectedInvoice}
                currency={booking.currency}
                open={selectedInvoice !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedInvoice(null);
                }}
            />
        </CustomerLayout>
    );
}

function InvoiceTableRow({
    invoice,
    currency,
    onDetail,
}: {
    invoice: CustomerPaymentInvoice;
    currency: string;
    onDetail: () => void;
}) {
    return (
        <tr className="transition-colors hover:bg-muted/25">
            <td className="px-5 py-4">
                <p className="font-bold">{invoice.invoice_number}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    {invoice.reference_number || 'Tanpa nomor referensi'}
                </p>
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
                {formatDate(invoice.payment_date)}
            </td>
            <td className="px-5 py-4 whitespace-nowrap">
                {methodLabel[invoice.payment_method] ?? invoice.payment_method}
            </td>
            <td className="px-5 py-4">
                <InvoiceStatus invoice={invoice} />
            </td>
            <td className="px-5 py-4 text-right font-bold whitespace-nowrap tabular-nums">
                {money(invoice.amount, currency)}
            </td>
            <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={onDetail}>
                        <Eye className="size-4" /> Detail
                    </Button>
                    <Button asChild size="sm">
                        <a href={invoice.download_url}>
                            <Download className="size-4" /> Unduh
                        </a>
                    </Button>
                </div>
            </td>
        </tr>
    );
}

function InvoiceMobileCard({
    invoice,
    currency,
    onDetail,
}: {
    invoice: CustomerPaymentInvoice;
    currency: string;
    onDetail: () => void;
}) {
    return (
        <article className="grid gap-4 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate font-bold">
                        {invoice.invoice_number}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(invoice.payment_date)}
                    </p>
                </div>
                <InvoiceStatus invoice={invoice} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Metode</p>
                    <p className="mt-1 font-medium">
                        {methodLabel[invoice.payment_method] ??
                            invoice.payment_method}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Nominal</p>
                    <p className="mt-1 font-bold tabular-nums">
                        {money(invoice.amount, currency)}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={onDetail}>
                    <Eye className="size-4" /> Lihat Detail
                </Button>
                <Button asChild size="sm">
                    <a href={invoice.download_url}>
                        <Download className="size-4" /> Unduh Invoice
                    </a>
                </Button>
            </div>
        </article>
    );
}

function InvoiceStatus({ invoice }: { invoice: CustomerPaymentInvoice }) {
    const confirmed = invoice.status === 'confirmed';
    return (
        <Badge
            variant="outline"
            className={
                confirmed
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
            }
        >
            {confirmed ? 'Pembayaran Berhasil' : 'Menunggu Konfirmasi'}
        </Badge>
    );
}

function InvoiceDetailDialog({
    invoice,
    currency,
    open,
    onOpenChange,
}: {
    invoice: CustomerPaymentInvoice | null;
    currency: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    if (!invoice) return null;
    const confirmed = invoice.status === 'confirmed';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                overlayClassName="bg-slate-950/20 backdrop-blur-[2px]"
                className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl"
            >
                <div
                    className={`p-6 text-white ${confirmed ? 'bg-[#0d5c52]' : 'bg-amber-600'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="grid size-11 place-items-center rounded-full bg-white/15">
                            {confirmed ? (
                                <CheckCircle2 className="size-6" />
                            ) : (
                                <Clock3 className="size-6" />
                            )}
                        </div>
                        <DialogHeader className="gap-1 text-left">
                            <DialogTitle className="text-xl text-white">
                                {confirmed
                                    ? 'Pembayaran Berhasil'
                                    : 'Menunggu Konfirmasi'}
                            </DialogTitle>
                            <DialogDescription className="text-white/75">
                                {invoice.invoice_number}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6">
                    <div>
                        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            Nominal Transaksi
                        </p>
                        <p className="mt-2 text-3xl font-bold tabular-nums">
                            {money(invoice.amount, currency)}
                        </p>
                    </div>

                    <div className="grid gap-x-6 gap-y-4 rounded-2xl bg-muted/45 p-4 sm:grid-cols-2">
                        {[
                            [
                                'Tanggal Pembayaran',
                                formatDate(invoice.payment_date),
                            ],
                            [
                                'Metode',
                                methodLabel[invoice.payment_method] ??
                                    invoice.payment_method,
                            ],
                            [
                                'Nomor Referensi',
                                invoice.reference_number || '-',
                            ],
                            ['Dicatat', formatDateTime(invoice.recorded_at)],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <p className="text-xs text-muted-foreground">
                                    {label}
                                </p>
                                <p className="mt-1 text-sm font-semibold break-words">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="divide-y rounded-2xl border px-4">
                        {[
                            ['Total Tagihan', invoice.total_amount],
                            ['Terbayar Setelah Transaksi', invoice.paid_after],
                            ['Sisa Setelah Transaksi', invoice.remaining_after],
                        ].map(([label, amount]) => (
                            <div
                                key={String(label)}
                                className="flex justify-between gap-4 py-3 text-sm"
                            >
                                <span className="text-muted-foreground">
                                    {label}
                                </span>
                                <span className="font-bold tabular-nums">
                                    {money(Number(amount), currency)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {invoice.notes ? (
                        <div className="rounded-2xl border border-dashed p-4">
                            <p className="text-xs text-muted-foreground">
                                Catatan
                            </p>
                            <p className="mt-1 text-sm whitespace-pre-wrap">
                                {invoice.notes}
                            </p>
                        </div>
                    ) : null}

                    <div className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        <FileText className="mt-0.5 size-5 shrink-0" />
                        <p>
                            {confirmed
                                ? 'Pembayaran telah diverifikasi dan sudah mengurangi sisa tagihan.'
                                : 'Pembayaran sudah dicatat dan sedang menunggu verifikasi admin. Nominal belum mengurangi sisa tagihan.'}
                        </p>
                    </div>
                </div>

                <DialogFooter className="border-t p-4 sm:p-5">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Tutup
                    </Button>
                    <Button asChild>
                        <a href={invoice.download_url}>
                            <Download className="size-4" /> Unduh Invoice PDF
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
