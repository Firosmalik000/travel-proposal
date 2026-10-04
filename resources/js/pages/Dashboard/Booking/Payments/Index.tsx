import InputError from '@/components/input-error';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatDate, formatDateTime } from '@/lib/date-format';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Ban,
    CircleDollarSign,
    Clock3,
    Mail,
    MoreHorizontal,
    Pencil,
    Plus,
    WalletCards,
} from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

type PaymentStatus = 'pending' | 'confirmed' | 'void';
type BookingPaymentStatus = 'unpaid' | 'partial' | 'paid';
type Payment = {
    id: number;
    payment_date: string;
    amount: number;
    currency: string | null;
    exchange_rate: string | null;
    amount_idr: number | null;
    refunded_amount: number;
    refunds: Array<{
        id: number;
        transaction_number: string;
        status: string;
        amount: number;
    }>;
    financial_account_id: number | null;
    financial_account: { code: string; name: string } | null;
    payment_method: string;
    reference_number: string | null;
    notes: string | null;
    attachment_path?: string | null;
    attachment_override_reason: string | null;
    status: PaymentStatus;
    ledger: { transaction_number: string; status: string } | null;
    recorded_by: string | null;
    created_at: string | null;
};
type ReceiverAccount = {
    id: number;
    code: string;
    name: string;
    currency: string;
    cash_account_type: string;
};
type Booking = {
    id: number;
    booking_code: string;
    full_name: string;
    email: string | null;
    package_name: string | null;
    agreed_total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    payment_status: BookingPaymentStatus;
    can_send_reminder: boolean;
    currency: string;
    payments: Payment[];
};

const money = (amount: number, currency: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
const transactionStatus: Record<
    PaymentStatus,
    { label: string; className: string }
> = {
    pending: {
        label: 'Menunggu verifikasi',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    confirmed: {
        label: 'Terverifikasi',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
    void: {
        label: 'Dibatalkan',
        className: 'border-slate-200 bg-slate-100 text-slate-500',
    },
};
const bookingStatus: Record<
    BookingPaymentStatus,
    { label: string; className: string }
> = {
    unpaid: {
        label: 'Belum dibayar',
        className: 'border-rose-200 bg-rose-50 text-rose-700',
    },
    partial: {
        label: 'Dibayar sebagian',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    paid: {
        label: 'Lunas',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
};
const createIdempotencyKey = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `payment-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const initialPayment = (currency: string, financialAccountId?: number) => ({
    payment_date: new Date().toISOString().slice(0, 10),
    amount: '',
    currency,
    exchange_rate: '1',
    financial_account_id: financialAccountId?.toString() ?? '',
    payment_method: 'transfer',
    reference_number: '',
    notes: '',
    status: 'confirmed' as PaymentStatus,
    attachment: null as File | null,
    attachment_override_reason: '',
    idempotency_key: createIdempotencyKey(),
});

export default function BookingPayments({
    booking,
    receiverAccounts,
}: {
    booking: Booking;
    receiverAccounts: ReceiverAccount[];
}) {
    const defaultReceiverAccount =
        receiverAccounts.find(
            (account) => account.cash_account_type === 'customer_funds',
        ) ?? receiverAccounts[0];
    const [editing, setEditing] = useState<Payment | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [refunding, setRefunding] = useState<Payment | null>(null);
    const form = useForm(
        initialPayment(booking.currency, defaultReceiverAccount?.id),
    );
    const reminderForm = useForm<{ reminder?: string }>({});
    const refundForm = useForm({
        financial_account_id: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        amount_original: '',
        description: '',
        idempotency_key: createIdempotencyKey(),
    });
    const refundError = (refundForm.errors as Record<string, string>).refund;
    const status = bookingStatus[booking.payment_status];
    const confirmedLimit =
        booking.remaining_amount +
        (editing?.status === 'confirmed' ? editing.amount : 0);

    const edit = (payment: Payment) => {
        setEditing(payment);
        form.setData({
            payment_date: payment.payment_date,
            amount: String(payment.amount),
            currency: payment.currency ?? booking.currency,
            exchange_rate: payment.exchange_rate ?? '1',
            financial_account_id:
                payment.financial_account_id?.toString() ?? '',
            payment_method: payment.payment_method,
            reference_number: payment.reference_number ?? '',
            notes: payment.notes ?? '',
            status: payment.status,
            attachment: null,
            attachment_override_reason:
                payment.attachment_override_reason ?? '',
            idempotency_key: createIdempotencyKey(),
        });
        form.clearErrors();
        setPaymentModalOpen(true);
    };
    const reset = () => {
        setEditing(null);
        form.transform((data) => data);
        form.setData(
            initialPayment(booking.currency, defaultReceiverAccount?.id),
        );
        form.clearErrors();
    };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPaymentModalOpen(false);
            },
        };
        if (editing) {
            form.transform((data) => ({
                ...data,
                _method: 'put',
            }));
            form.post(
                `/admin/booking-management/listing/${booking.id}/payments/${editing.id}`,
                options,
            );
            return;
        }
        form.transform((data) => data);
        form.post(
            `/admin/booking-management/listing/${booking.id}/payments`,
            options,
        );
    };
    const createPayment = () => {
        reset();
        setPaymentModalOpen(true);
    };
    const voidPayment = (payment: Payment) => {
        if (
            window.confirm(
                'Batalkan pembayaran ini? Transaksi tetap tersimpan di riwayat.',
            )
        ) {
            router.delete(
                `/admin/booking-management/listing/${booking.id}/payments/${payment.id}`,
                { preserveScroll: true },
            );
        }
    };
    const openRefund = (payment: Payment) => {
        setRefunding(payment);
        refundForm.setData({
            financial_account_id:
                payment.financial_account_id?.toString() ?? '',
            transaction_date: new Date().toISOString().slice(0, 10),
            amount_original: '',
            description: '',
            idempotency_key: createIdempotencyKey(),
        });
        refundForm.clearErrors();
    };
    const submitRefund = (event: FormEvent) => {
        event.preventDefault();
        if (!refunding) return;
        refundForm.post(
            `/admin/booking-management/listing/${booking.id}/payments/${refunding.id}/refund`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRefunding(null);
                    refundForm.setData(
                        'idempotency_key',
                        createIdempotencyKey(),
                    );
                },
            },
        );
    };
    const reverseRefund = (payment: Payment, transactionId: number) => {
        const reason = window.prompt(
            'Alasan koreksi refund (minimal 5 karakter):',
        );
        if (!reason) return;
        router.post(
            `/admin/booking-management/listing/${booking.id}/payments/${payment.id}/refund/${transactionId}/reverse`,
            { reason },
            { preserveScroll: true },
        );
    };
    const sendReminder = () => {
        if (window.confirm(`Kirim reminder pembayaran ke ${booking.email}?`)) {
            reminderForm.post(
                `/admin/booking-management/listing/${booking.id}/payments/reminder`,
                { preserveScroll: true },
            );
        }
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Booking', href: '/admin/booking-management/listing' },
                { title: 'Riwayat Pembayaran', href: '#' },
            ]}
        >
            <Head title={`Pembayaran ${booking.booking_code}`} />
            <div className="mx-auto w-full max-w-[1500px] p-3 sm:p-5">
                <main className="min-w-0 space-y-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/booking-management/listing">
                            <ArrowLeft className="h-4 w-4" /> Kembali ke listing
                        </Link>
                    </Button>
                    <Card className="overflow-hidden">
                        <CardHeader className="border-b bg-muted/25">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        {booking.booking_code}
                                    </p>
                                    <CardTitle className="mt-1 truncate text-xl">
                                        {booking.full_name}
                                    </CardTitle>
                                    <p className="mt-1 truncate text-sm text-muted-foreground">
                                        {booking.package_name ||
                                            'Package tidak tersedia'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {booking.can_send_reminder ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            disabled={reminderForm.processing}
                                            onClick={sendReminder}
                                        >
                                            <Mail className="h-4 w-4" />
                                            {reminderForm.processing
                                                ? 'Mengirim...'
                                                : 'Kirim Reminder'}
                                        </Button>
                                    ) : null}
                                    <Badge
                                        variant="outline"
                                        className={status.className}
                                    >
                                        {status.label}
                                    </Badge>
                                </div>
                            </div>
                            {reminderForm.errors.reminder ? (
                                <p className="text-sm text-destructive">
                                    {reminderForm.errors.reminder}
                                </p>
                            ) : null}
                        </CardHeader>
                        <CardContent className="grid gap-px bg-border p-0 sm:grid-cols-3">
                            {[
                                ['Total tagihan', booking.agreed_total_amount],
                                ['Terverifikasi', booking.paid_amount],
                                ['Sisa tagihan', booking.remaining_amount],
                            ].map(([label, amount]) => (
                                <div
                                    key={label as string}
                                    className="bg-card px-4 py-4 sm:px-5"
                                >
                                    <p className="text-xs text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="mt-1 text-lg font-bold tabular-nums">
                                        {money(
                                            amount as number,
                                            booking.currency,
                                        )}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <WalletCards className="h-5 w-5" /> Riwayat
                                    pembayaran
                                </CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {booking.payments.length} transaksi tercatat
                                </p>
                            </div>
                            <Button
                                type="button"
                                className="w-full sm:w-auto"
                                onClick={createPayment}
                            >
                                <Plus className="h-4 w-4" /> Catat Pembayaran
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="hidden overflow-x-auto md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>
                                                Metode & referensi
                                            </TableHead>
                                            <TableHead>
                                                Rekening & jurnal
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Nominal
                                            </TableHead>
                                            <TableHead className="w-24" />
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {booking.payments.map((payment) => (
                                            <PaymentTableRow
                                                key={payment.id}
                                                payment={payment}
                                                currency={booking.currency}
                                                onEdit={edit}
                                                onVoid={voidPayment}
                                                onRefund={openRefund}
                                                onReverseRefund={reverseRefund}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="divide-y md:hidden">
                                {booking.payments.map((payment) => (
                                    <PaymentMobileRow
                                        key={payment.id}
                                        payment={payment}
                                        currency={booking.currency}
                                        onEdit={edit}
                                        onVoid={voidPayment}
                                        onRefund={openRefund}
                                        onReverseRefund={reverseRefund}
                                    />
                                ))}
                            </div>
                            {booking.payments.length === 0 ? (
                                <div className="px-4 py-12 text-center">
                                    <Clock3 className="mx-auto h-8 w-8 text-muted-foreground/50" />
                                    <p className="mt-3 font-medium">
                                        Belum ada pembayaran
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Transaksi pertama akan muncul di sini.
                                    </p>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Dialog
                open={paymentModalOpen}
                onOpenChange={(open) => {
                    if (!form.processing) {
                        setPaymentModalOpen(open);

                        if (!open) {
                            reset();
                        }
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
                    <DialogHeader className="border-b bg-muted/30 px-5 py-4 pr-12 text-left sm:px-6">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <CircleDollarSign className="h-5 w-5 text-primary" />
                            {editing ? 'Ubah Pembayaran' : 'Catat Pembayaran'}
                        </DialogTitle>
                        <DialogDescription>
                            {booking.booking_code} · {booking.full_name}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        id="payment-form"
                        onSubmit={submit}
                        className="grid max-h-[calc(90vh-9rem)] gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-6"
                    >
                        {form.errors.idempotency_key ? (
                            <div className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive sm:col-span-2">
                                {form.errors.idempotency_key}
                            </div>
                        ) : null}
                        {form.data.status === 'confirmed' &&
                        receiverAccounts.length === 0 ? (
                            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 sm:col-span-2">
                                Belum ada rekening kas/bank aktif yang dapat
                                menerima pembayaran. Tambahkan atau aktifkan
                                rekening terlebih dahulu di Akun &amp; Ledger.
                            </div>
                        ) : null}
                        <Field
                            label="Tanggal pembayaran"
                            error={form.errors.payment_date}
                        >
                            <Input
                                type="date"
                                value={form.data.payment_date}
                                onChange={(event) =>
                                    form.setData(
                                        'payment_date',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label>Nominal</Label>
                                {confirmedLimit > 0 ? (
                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-primary hover:underline"
                                        onClick={() =>
                                            form.setData(
                                                'amount',
                                                String(confirmedLimit),
                                            )
                                        }
                                    >
                                        Isi sisa tagihan
                                    </button>
                                ) : null}
                            </div>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                                    {booking.currency}
                                </span>
                                <Input
                                    type="number"
                                    min="1"
                                    max={
                                        form.data.status === 'confirmed' &&
                                        confirmedLimit > 0
                                            ? confirmedLimit
                                            : undefined
                                    }
                                    className="pl-14"
                                    value={form.data.amount}
                                    onChange={(event) =>
                                        form.setData(
                                            'amount',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <InputError message={form.errors.amount} />
                        </div>
                        <Field
                            label="Metode"
                            error={form.errors.payment_method}
                        >
                            <Select
                                value={form.data.payment_method}
                                onValueChange={(value) =>
                                    form.setData('payment_method', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="transfer">
                                        Transfer bank
                                    </SelectItem>
                                    <SelectItem value="cash">Tunai</SelectItem>
                                    <SelectItem value="card">Kartu</SelectItem>
                                    <SelectItem value="other">
                                        Lainnya
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Status" error={form.errors.status}>
                            <Select
                                value={form.data.status}
                                onValueChange={(value: PaymentStatus) =>
                                    form.setData('status', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">
                                        Menunggu verifikasi
                                    </SelectItem>
                                    <SelectItem value="confirmed">
                                        Terverifikasi
                                    </SelectItem>
                                    <SelectItem value="void">
                                        Dibatalkan
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        {form.data.status === 'confirmed' ? (
                            <Field
                                label="Rekening penerima"
                                error={form.errors.financial_account_id}
                            >
                                <Select
                                    value={form.data.financial_account_id}
                                    onValueChange={(value) =>
                                        form.setData(
                                            'financial_account_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih rekening kas/bank" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {receiverAccounts.map((account) => (
                                            <SelectItem
                                                key={account.id}
                                                value={account.id.toString()}
                                            >
                                                {account.code} · {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                        ) : null}
                        <Field label="Mata uang" error={form.errors.currency}>
                            <Input value={form.data.currency} readOnly />
                        </Field>
                        {form.data.currency !== 'IDR' ? (
                            <Field
                                label="Kurs ke IDR"
                                error={form.errors.exchange_rate}
                            >
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    min="0.00000001"
                                    step="0.00000001"
                                    value={form.data.exchange_rate}
                                    onChange={(event) =>
                                        form.setData(
                                            'exchange_rate',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        ) : null}
                        <Field
                            label="Nomor referensi"
                            error={form.errors.reference_number}
                        >
                            <Input
                                value={form.data.reference_number}
                                onChange={(event) =>
                                    form.setData(
                                        'reference_number',
                                        event.target.value,
                                    )
                                }
                                placeholder="Opsional"
                            />
                        </Field>
                        <Field
                            label="Bukti pembayaran"
                            error={form.errors.attachment}
                        >
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    form.setData(
                                        'attachment',
                                        event.target.files?.[0] || null,
                                    )
                                }
                            />
                        </Field>
                        {form.data.status === 'confirmed' &&
                        !editing?.attachment_path ? (
                            <Field
                                label="Alasan tanpa bukti"
                                error={form.errors.attachment_override_reason}
                            >
                                <Input
                                    value={form.data.attachment_override_reason}
                                    onChange={(event) =>
                                        form.setData(
                                            'attachment_override_reason',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Isi hanya jika bukti belum tersedia"
                                />
                            </Field>
                        ) : null}
                        <div className="sm:col-span-2">
                            <Field label="Catatan" error={form.errors.notes}>
                                <Textarea
                                    value={form.data.notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Tambahkan keterangan pembayaran bila diperlukan"
                                    className="min-h-24 resize-y"
                                />
                            </Field>
                        </div>

                        <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm sm:col-span-2">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">
                                    Sisa tagihan saat ini
                                </span>
                                <strong className="whitespace-nowrap tabular-nums">
                                    {money(
                                        booking.remaining_amount,
                                        booking.currency,
                                    )}
                                </strong>
                            </div>
                            {form.data.status === 'confirmed' ? (
                                <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
                                    Setelah diverifikasi, dana otomatis masuk ke
                                    rekening pilihan dan tercatat sebagai Uang
                                    Muka Jemaah di ledger.
                                </p>
                            ) : null}
                        </div>
                    </form>

                    <DialogFooter className="border-t bg-background px-5 py-4 sm:px-6">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={() => {
                                reset();
                                setPaymentModalOpen(false);
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            form="payment-form"
                            disabled={
                                form.processing ||
                                (form.data.status === 'confirmed' &&
                                    receiverAccounts.length === 0)
                            }
                        >
                            <Plus className="h-4 w-4" />
                            {form.processing
                                ? 'Menyimpan...'
                                : editing
                                  ? 'Simpan Perubahan'
                                  : 'Simpan Pembayaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog
                open={refunding !== null}
                onOpenChange={(open) => {
                    if (!open && !refundForm.processing) setRefunding(null);
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Catat refund jemaah</DialogTitle>
                        <DialogDescription>
                            {booking.booking_code} · Maksimal{' '}
                            {refunding
                                ? money(
                                      refunding.amount -
                                          refunding.refunded_amount,
                                      booking.currency,
                                  )
                                : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <form className="grid gap-4" onSubmit={submitRefund}>
                        {refundError && (
                            <p className="text-sm text-destructive">
                                {refundError}
                            </p>
                        )}
                        <Field
                            label="Rekening pengirim"
                            error={refundForm.errors.financial_account_id}
                        >
                            <Select
                                value={refundForm.data.financial_account_id}
                                onValueChange={(value) =>
                                    refundForm.setData(
                                        'financial_account_id',
                                        value,
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih rekening" />
                                </SelectTrigger>
                                <SelectContent>
                                    {receiverAccounts.map((account) => (
                                        <SelectItem
                                            key={account.id}
                                            value={String(account.id)}
                                        >
                                            {account.code} · {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                                label="Tanggal refund"
                                error={refundForm.errors.transaction_date}
                            >
                                <Input
                                    type="date"
                                    value={refundForm.data.transaction_date}
                                    onChange={(event) =>
                                        refundForm.setData(
                                            'transaction_date',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label={`Nominal (${booking.currency})`}
                                error={refundForm.errors.amount_original}
                            >
                                <Input
                                    type="number"
                                    min="1"
                                    max={
                                        refunding
                                            ? refunding.amount -
                                              refunding.refunded_amount
                                            : undefined
                                    }
                                    value={refundForm.data.amount_original}
                                    onChange={(event) =>
                                        refundForm.setData(
                                            'amount_original',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                        </div>
                        <Field
                            label="Alasan refund"
                            error={refundForm.errors.description}
                        >
                            <Input
                                value={refundForm.data.description}
                                onChange={(event) =>
                                    refundForm.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                        </Field>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRefunding(null)}
                            >
                                Batal
                            </Button>
                            <Button disabled={refundForm.processing}>
                                Posting refund
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}

function Field({
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
            <InputError message={error} />
        </div>
    );
}

type PaymentRowProps = {
    payment: Payment;
    currency: string;
    onEdit: (payment: Payment) => void;
    onVoid: (payment: Payment) => void;
    onRefund: (payment: Payment) => void;
    onReverseRefund: (payment: Payment, transactionId: number) => void;
};

function PaymentTableRow({
    payment,
    currency,
    onEdit,
    onVoid,
    onRefund,
    onReverseRefund,
}: PaymentRowProps) {
    const status = transactionStatus[payment.status];
    return (
        <TableRow
            className={payment.status === 'void' ? 'opacity-60' : undefined}
        >
            <TableCell className="whitespace-nowrap">
                {formatDate(payment.payment_date)}
            </TableCell>
            <TableCell>
                <p className="font-medium capitalize">
                    {payment.payment_method}
                </p>
                <p className="text-xs text-muted-foreground">
                    {payment.reference_number || '-'}
                </p>
                {payment.notes ? (
                    <p className="mt-1 max-w-64 text-xs text-muted-foreground">
                        {payment.notes}
                    </p>
                ) : null}
                {payment.attachment_path ? (
                    <a
                        href={payment.attachment_path}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                    >
                        Lihat bukti
                    </a>
                ) : null}
                <p className="text-xs text-muted-foreground">
                    {payment.recorded_by || '-'} ·{' '}
                    {formatDateTime(payment.created_at)}
                </p>
            </TableCell>
            <TableCell>
                <p className="font-medium">
                    {payment.financial_account
                        ? `${payment.financial_account.code} · ${payment.financial_account.name}`
                        : 'Belum dipetakan'}
                </p>
                <p className="text-xs text-muted-foreground">
                    {payment.ledger?.transaction_number ?? 'Belum ada jurnal'}
                </p>
                {payment.refunded_amount > 0 && (
                    <p className="text-xs text-amber-700">
                        Direfund {money(payment.refunded_amount, currency)}
                    </p>
                )}
                {payment.refunds
                    .filter((refund) => refund.status === 'posted')
                    .map((refund) => (
                        <button
                            key={refund.id}
                            type="button"
                            className="block text-xs text-amber-700 underline"
                            onClick={() => onReverseRefund(payment, refund.id)}
                        >
                            Koreksi {refund.transaction_number}
                        </button>
                    ))}
            </TableCell>
            <TableCell>
                <Badge variant="outline" className={status.className}>
                    {status.label}
                </Badge>
                {payment.status === 'confirmed' ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {payment.ledger?.status === 'posted'
                            ? 'Ledger tercatat'
                            : 'Perlu rekonsiliasi'}
                    </p>
                ) : null}
            </TableCell>
            <TableCell className="text-right font-bold tabular-nums">
                {money(payment.amount, currency)}
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Aksi pembayaran ${money(payment.amount, currency)}`}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(payment)}>
                            <Pencil className="h-4 w-4" /> Edit pembayaran
                        </DropdownMenuItem>
                        {payment.status === 'confirmed' &&
                            payment.amount > payment.refunded_amount &&
                            payment.ledger?.status === 'posted' && (
                                <DropdownMenuItem
                                    onClick={() => onRefund(payment)}
                                >
                                    <CircleDollarSign className="h-4 w-4" />{' '}
                                    Catat refund
                                </DropdownMenuItem>
                            )}
                        {payment.status !== 'void' ? (
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onVoid(payment)}
                            >
                                <Ban className="h-4 w-4" /> Batalkan pembayaran
                            </DropdownMenuItem>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function PaymentMobileRow({
    payment,
    currency,
    onEdit,
    onVoid,
    onRefund,
    onReverseRefund,
}: PaymentRowProps) {
    const status = transactionStatus[payment.status];
    return (
        <article
            className={`grid gap-3 p-4 ${payment.status === 'void' ? 'opacity-60' : ''}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-bold tabular-nums">
                        {money(payment.amount, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {formatDate(payment.payment_date)}
                    </p>
                </div>
                <Badge variant="outline" className={status.className}>
                    {status.label}
                </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-xs text-muted-foreground">Metode</p>
                    <p className="capitalize">{payment.payment_method}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Referensi</p>
                    <p className="truncate">
                        {payment.reference_number || '-'}
                    </p>
                </div>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <p className="font-medium">
                    {payment.financial_account
                        ? `${payment.financial_account.code} · ${payment.financial_account.name}`
                        : 'Rekening belum dipetakan'}
                </p>
                <p className="text-xs text-muted-foreground">
                    {payment.ledger?.transaction_number ??
                        (payment.status === 'confirmed'
                            ? 'Perlu rekonsiliasi ledger'
                            : 'Belum ada jurnal')}
                </p>
            </div>
            {payment.notes ? (
                <p className="text-sm text-muted-foreground">{payment.notes}</p>
            ) : null}
            {payment.attachment_path ? (
                <div>
                    <a
                        href={payment.attachment_path}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-primary hover:underline"
                    >
                        Lihat bukti pembayaran
                    </a>
                </div>
            ) : null}
            <div className="flex items-center justify-between gap-2 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                    {payment.recorded_by || '-'} ·{' '}
                    {formatDateTime(payment.created_at)}
                </p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Aksi pembayaran ${money(payment.amount, currency)}`}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(payment)}>
                            <Pencil className="h-4 w-4" /> Edit pembayaran
                        </DropdownMenuItem>
                        {payment.status === 'confirmed' &&
                            payment.amount > payment.refunded_amount &&
                            payment.ledger?.status === 'posted' && (
                                <DropdownMenuItem
                                    onClick={() => onRefund(payment)}
                                >
                                    <CircleDollarSign className="h-4 w-4" />{' '}
                                    Catat refund
                                </DropdownMenuItem>
                            )}
                        {payment.refunds
                            .filter((refund) => refund.status === 'posted')
                            .map((refund) => (
                                <DropdownMenuItem
                                    key={refund.id}
                                    onClick={() =>
                                        onReverseRefund(payment, refund.id)
                                    }
                                >
                                    <Ban className="h-4 w-4" /> Koreksi{' '}
                                    {refund.transaction_number}
                                </DropdownMenuItem>
                            ))}
                        {payment.status !== 'void' ? (
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onVoid(payment)}
                            >
                                <Ban className="h-4 w-4" /> Batalkan pembayaran
                            </DropdownMenuItem>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </article>
    );
}
