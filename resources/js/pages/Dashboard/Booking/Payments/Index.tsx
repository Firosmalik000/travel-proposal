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
    payment_method: string;
    reference_number: string | null;
    notes: string | null;
    status: PaymentStatus;
    recorded_by: string | null;
    created_at: string | null;
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
const initial = {
    payment_date: new Date().toISOString().slice(0, 10),
    amount: '',
    payment_method: 'transfer',
    reference_number: '',
    notes: '',
    status: 'confirmed' as PaymentStatus,
};

export default function BookingPayments({ booking }: { booking: Booking }) {
    const [editing, setEditing] = useState<Payment | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const form = useForm(initial);
    const reminderForm = useForm<{ reminder?: string }>({});
    const status = bookingStatus[booking.payment_status];
    const confirmedLimit =
        booking.remaining_amount +
        (editing?.status === 'confirmed' ? editing.amount : 0);

    const edit = (payment: Payment) => {
        setEditing(payment);
        form.setData({
            payment_date: payment.payment_date,
            amount: String(payment.amount),
            payment_method: payment.payment_method,
            reference_number: payment.reference_number ?? '',
            notes: payment.notes ?? '',
            status: payment.status,
        });
        form.clearErrors();
        setPaymentModalOpen(true);
    };
    const reset = () => {
        setEditing(null);
        form.setData(initial);
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
            form.put(
                `/admin/booking-management/listing/${booking.id}/payments/${editing.id}`,
                options,
            );
            return;
        }
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
                                            <TableHead>Dicatat oleh</TableHead>
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
                            disabled={form.processing}
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
};

function PaymentTableRow({
    payment,
    currency,
    onEdit,
    onVoid,
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
            </TableCell>
            <TableCell>
                <p>{payment.recorded_by || '-'}</p>
                <p className="text-xs text-muted-foreground">
                    {formatDateTime(payment.created_at)}
                </p>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className={status.className}>
                    {status.label}
                </Badge>
            </TableCell>
            <TableCell className="text-right font-bold tabular-nums">
                {money(payment.amount, currency)}
            </TableCell>
            <TableCell>
                <div className="flex justify-end gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Edit pembayaran"
                        onClick={() => onEdit(payment)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    {payment.status !== 'void' ? (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            aria-label="Batalkan pembayaran"
                            onClick={() => onVoid(payment)}
                        >
                            <Ban className="h-4 w-4" />
                        </Button>
                    ) : null}
                </div>
            </TableCell>
        </TableRow>
    );
}

function PaymentMobileRow({
    payment,
    currency,
    onEdit,
    onVoid,
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
            {payment.notes ? (
                <p className="text-sm text-muted-foreground">{payment.notes}</p>
            ) : null}
            <div className="flex items-center justify-between gap-2 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                    {payment.recorded_by || '-'} ·{' '}
                    {formatDateTime(payment.created_at)}
                </p>
                <div className="flex gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(payment)}
                    >
                        <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    {payment.status !== 'void' ? (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => onVoid(payment)}
                        >
                            <Ban className="h-4 w-4" />
                        </Button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
