import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CircleDollarSign,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Payment = {
    id: number;
    payment_date: string;
    amount: number;
    payment_method: string;
    reference_number: string | null;
    notes: string | null;
    status: 'confirmed' | 'void';
};
type Booking = {
    id: number;
    booking_code: string;
    full_name: string;
    package_name: string | null;
    agreed_total_amount: number;
    paid_amount: number;
    currency: string;
    payments: Payment[];
};
const money = (amount: number, currency: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
const initial = {
    payment_date: new Date().toISOString().slice(0, 10),
    amount: '',
    payment_method: 'transfer',
    reference_number: '',
    notes: '',
    status: 'confirmed' as 'confirmed' | 'void',
};

export default function BookingPayments({ booking }: { booking: Booking }) {
    const [editing, setEditing] = useState<Payment | null>(null);
    const form = useForm(initial);
    const remaining = Math.max(
        booking.agreed_total_amount - booking.paid_amount,
        0,
    );
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
    };
    const reset = () => {
        setEditing(null);
        form.setData(initial);
        form.clearErrors();
    };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: reset };
        if (editing) {
            form.put(
                `/admin/booking-management/listing/${booking.id}/payments/${editing.id}`,
                options,
            );
        } else {
            form.post(
                `/admin/booking-management/listing/${booking.id}/payments`,
                options,
            );
        }
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Booking', href: '/admin/booking-management/listing' },
                { title: 'Pembayaran', href: '#' },
            ]}
        >
            <Head title={`Pembayaran ${booking.booking_code}`} />
            <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-5">
                    <Button variant="ghost" asChild>
                        <Link href="/admin/booking-management/customer-data">
                            <ArrowLeft className="h-4 w-4" /> Kembali
                        </Link>
                    </Button>
                    <Card>
                        <CardHeader>
                            <div className="flex flex-wrap justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        {booking.booking_code}
                                    </p>
                                    <CardTitle className="mt-1">
                                        {booking.full_name}
                                    </CardTitle>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {booking.package_name}
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        remaining === 0
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {remaining === 0 ? 'Lunas' : 'Belum Lunas'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-3">
                            {[
                                ['Total Tagihan', booking.agreed_total_amount],
                                ['Sudah Dibayar', booking.paid_amount],
                                ['Sisa Tagihan', remaining],
                            ].map(([label, amount]) => (
                                <div
                                    key={label as string}
                                    className="rounded-xl border p-4"
                                >
                                    <p className="text-xs text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="mt-1 font-bold">
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
                        <CardHeader>
                            <CardTitle>Riwayat Pembayaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Metode</TableHead>
                                        <TableHead>Referensi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Nominal
                                        </TableHead>
                                        <TableHead className="w-24" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {booking.payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {payment.payment_date}
                                            </TableCell>
                                            <TableCell>
                                                {payment.payment_method}
                                            </TableCell>
                                            <TableCell>
                                                {payment.reference_number ||
                                                    '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        payment.status ===
                                                        'confirmed'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {money(
                                                    payment.amount,
                                                    booking.currency,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            edit(payment)
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            confirm(
                                                                'Hapus pembayaran ini?',
                                                            ) &&
                                                            router.delete(
                                                                `/admin/booking-management/listing/${booking.id}/payments/${payment.id}`,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {booking.payments.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                Belum ada pembayaran.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <Card className="h-fit lg:sticky lg:top-5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CircleDollarSign className="h-5 w-5" />{' '}
                            {editing ? 'Ubah' : 'Catat'} Pembayaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Tanggal</Label>
                                <Input
                                    type="date"
                                    value={form.data.payment_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'payment_date',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.payment_date}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Nominal</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={form.data.amount}
                                    onChange={(e) =>
                                        form.setData('amount', e.target.value)
                                    }
                                />
                                <InputError message={form.errors.amount} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Metode</Label>
                                <Select
                                    value={form.data.payment_method}
                                    onValueChange={(v) =>
                                        form.setData('payment_method', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="transfer">
                                            Transfer
                                        </SelectItem>
                                        <SelectItem value="cash">
                                            Tunai
                                        </SelectItem>
                                        <SelectItem value="card">
                                            Kartu
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Lainnya
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Nomor referensi</Label>
                                <Input
                                    value={form.data.reference_number}
                                    onChange={(e) =>
                                        form.setData(
                                            'reference_number',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select
                                    value={form.data.status}
                                    onValueChange={(v: 'confirmed' | 'void') =>
                                        form.setData('status', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="confirmed">
                                            Terkonfirmasi
                                        </SelectItem>
                                        <SelectItem value="void">
                                            Dibatalkan
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Catatan</Label>
                                <Textarea
                                    value={form.data.notes}
                                    onChange={(e) =>
                                        form.setData('notes', e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1"
                                    disabled={form.processing}
                                >
                                    <Plus className="h-4 w-4" /> Simpan
                                </Button>
                                {editing && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={reset}
                                    >
                                        Batal
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
