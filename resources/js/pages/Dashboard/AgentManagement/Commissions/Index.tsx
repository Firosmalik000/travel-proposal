import { Button } from '@/components/ui/button';
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
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AgentManagementNav from '@/pages/Dashboard/AgentManagement/AgentManagementNav';
import { Head, router, useForm } from '@inertiajs/react';
import { Banknote, CircleCheckBig, Clock3 } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Commission = {
    id: number;
    agent_name: string;
    referral_code: string;
    booking_code: string;
    customer_name: string;
    passenger_count: number;
    booking_status: string;
    paid_amount: number;
    package_name: string;
    fee_type: string;
    fee_value: number;
    base_amount: number;
    commission_amount: number;
    currency: string;
    status: string;
    notes: string | null;
    transaction_number: string | null;
    financial_account_id: number | null;
};
type CashAccount = { id: number; code: string; name: string; currency: string };
type Paginated = {
    data: Commission[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
};
const money = (value: number, currency = 'IDR') =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);

export default function CommissionsIndex({
    commissions,
    summary,
    cashAccounts,
    today,
}: {
    commissions: Paginated;
    summary: Array<{
        currency: string;
        pending: number;
        approved: number;
        paid: number;
    }>;
    cashAccounts: CashAccount[];
    today: string;
}) {
    const [paying, setPaying] = useState<Commission | null>(null);
    const paymentForm = useForm({
        status: 'paid',
        financial_account_id: '',
        payment_date: today,
        exchange_rate: '1',
        amount_idr: '',
        notes: '',
    });
    const commissionError = (paymentForm.errors as Record<string, string>)
        .commission;
    const updateStatus = (commission: Commission, status: string) => {
        if (status === 'paid') {
            paymentForm.setData({
                status: 'paid',
                financial_account_id: '',
                payment_date: today,
                exchange_rate: '1',
                amount_idr:
                    commission.currency === 'IDR'
                        ? String(commission.commission_amount)
                        : '',
                notes: commission.notes ?? '',
            });
            paymentForm.clearErrors();
            setPaying(commission);
            return;
        }
        router.put(
            `/admin/agent-management/commissions/${commission.id}`,
            { status, notes: commission.notes },
            { preserveScroll: true },
        );
    };
    const submitPayment = (event: FormEvent) => {
        event.preventDefault();
        if (!paying) return;
        paymentForm.put(`/admin/agent-management/commissions/${paying.id}`, {
            preserveScroll: true,
            onSuccess: () => setPaying(null),
        });
    };
    const reversePayment = (commission: Commission) => {
        const reason = window.prompt(
            'Alasan koreksi pembayaran komisi (minimal 5 karakter):',
        );
        if (!reason) return;
        router.post(
            `/admin/agent-management/commissions/${commission.id}/reverse-payment`,
            { reason },
            { preserveScroll: true },
        );
    };
    const summaryValue = (field: 'pending' | 'approved' | 'paid') =>
        summary.length > 0
            ? summary.map((row) => money(row[field], row.currency)).join(' / ')
            : money(0);
    const cards = [
        [
            'Menunggu Persetujuan',
            summaryValue('pending'),
            Clock3,
            'text-amber-700 bg-amber-100',
        ],
        [
            'Siap Dibayarkan',
            summaryValue('approved'),
            CircleCheckBig,
            'text-sky-700 bg-sky-100',
        ],
        [
            'Selesai Dibayar',
            summaryValue('paid'),
            Banknote,
            'text-emerald-700 bg-emerald-100',
        ],
    ] as const;
    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Agent Management',
                    href: '/admin/agent-management/agents',
                },
                {
                    title: 'Komisi Agen',
                    href: '/admin/agent-management/commissions',
                },
            ]}
        >
            <Head title="Komisi Agen" />
            <div className="space-y-5 p-2 md:p-4">
                <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Komisi Agen
                        </h1>
                    </div>
                    <AgentManagementNav active="commissions" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {cards.map(([label, value, Icon, color]) => (
                        <div
                            key={label}
                            className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm"
                        >
                            <div className={`rounded-xl p-3 ${color}`}>
                                <Icon className="size-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    {label}
                                </p>
                                <p className="text-xl font-black">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agent</TableHead>
                                <TableHead>Booking</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Pembayaran</TableHead>
                                <TableHead>Dasar</TableHead>
                                <TableHead>Komisi</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commissions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-28 text-center text-muted-foreground"
                                    >
                                        Belum ada komisi.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                commissions.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-semibold">
                                                {item.agent_name}
                                            </div>
                                            <code className="text-xs">
                                                {item.referral_code}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-mono font-semibold">
                                                {item.booking_code}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.customer_name} ·{' '}
                                                {item.passenger_count} pax
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.package_name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold">
                                                {money(
                                                    item.paid_amount,
                                                    item.currency,
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.booking_status}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {money(
                                                item.base_amount,
                                                item.currency,
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                {item.fee_type === 'fixed'
                                                    ? `${money(item.fee_value, item.currency)} / pax`
                                                    : `${item.fee_value}%`}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold text-emerald-700">
                                            {money(
                                                item.commission_amount,
                                                item.currency,
                                            )}
                                            {item.transaction_number && (
                                                <div className="text-xs font-normal text-muted-foreground">
                                                    {item.transaction_number}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={item.status}
                                                onValueChange={(value) =>
                                                    updateStatus(item, value)
                                                }
                                            >
                                                <SelectTrigger
                                                    className="w-36"
                                                    disabled={
                                                        item.status === 'paid'
                                                    }
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">
                                                        Pending
                                                    </SelectItem>
                                                    <SelectItem value="approved">
                                                        Approved
                                                    </SelectItem>
                                                    <SelectItem value="paid">
                                                        Paid
                                                    </SelectItem>
                                                    <SelectItem value="cancelled">
                                                        Cancelled
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {item.status === 'paid' && (
                                                <Button
                                                    className="mt-2 w-36"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        reversePayment(item)
                                                    }
                                                >
                                                    Koreksi bayar
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {commissions.links.length > 3 && (
                        <div className="flex flex-wrap gap-2 border-t p-4">
                            {commissions.links.map((link) => (
                                <Button
                                    key={link.label}
                                    size="sm"
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.visit(link.url)
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <Dialog
                    open={paying !== null}
                    onOpenChange={(open) => {
                        if (!open && !paymentForm.processing) setPaying(null);
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Bayar komisi agen</DialogTitle>
                            <DialogDescription>
                                {paying?.booking_code} · {paying?.agent_name} ·{' '}
                                {paying
                                    ? money(
                                          paying.commission_amount,
                                          paying.currency,
                                      )
                                    : ''}
                            </DialogDescription>
                        </DialogHeader>
                        <form className="grid gap-4" onSubmit={submitPayment}>
                            {commissionError && (
                                <p className="text-sm text-destructive">
                                    {commissionError}
                                </p>
                            )}
                            <div className="grid gap-2">
                                <Label>Rekening pembayar</Label>
                                <Select
                                    value={
                                        paymentForm.data.financial_account_id
                                    }
                                    onValueChange={(value) =>
                                        paymentForm.setData(
                                            'financial_account_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih rekening operasional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cashAccounts
                                            .filter(
                                                (account) =>
                                                    account.currency ===
                                                    paying?.currency,
                                            )
                                            .map((account) => (
                                                <SelectItem
                                                    key={account.id}
                                                    value={String(account.id)}
                                                >
                                                    {account.code} ·{' '}
                                                    {account.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {paymentForm.errors.financial_account_id && (
                                    <p className="text-xs text-destructive">
                                        {
                                            paymentForm.errors
                                                .financial_account_id
                                        }
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Tanggal pembayaran</Label>
                                    <Input
                                        type="date"
                                        value={paymentForm.data.payment_date}
                                        onChange={(event) =>
                                            paymentForm.setData(
                                                'payment_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    {paymentForm.errors.payment_date && (
                                        <p className="text-xs text-destructive">
                                            {paymentForm.errors.payment_date}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Kurs ke IDR</Label>
                                    <Input
                                        type="number"
                                        min="0.00000001"
                                        step="0.00000001"
                                        value={paymentForm.data.exchange_rate}
                                        onChange={(event) => {
                                            const rate = event.target.value;
                                            paymentForm.setData(
                                                'exchange_rate',
                                                rate,
                                            );
                                            if (paying)
                                                paymentForm.setData(
                                                    'amount_idr',
                                                    String(
                                                        Math.round(
                                                            paying.commission_amount *
                                                                Number(rate),
                                                        ),
                                                    ),
                                                );
                                        }}
                                        readOnly={paying?.currency === 'IDR'}
                                    />
                                    {paymentForm.errors.exchange_rate && (
                                        <p className="text-xs text-destructive">
                                            {paymentForm.errors.exchange_rate}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Nilai pembayaran (IDR)</Label>
                                <Input
                                    value={paymentForm.data.amount_idr}
                                    readOnly
                                />
                                {paymentForm.errors.amount_idr && (
                                    <p className="text-xs text-destructive">
                                        {paymentForm.errors.amount_idr}
                                    </p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setPaying(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    disabled={
                                        paymentForm.processing ||
                                        cashAccounts.filter(
                                            (account) =>
                                                account.currency ===
                                                paying?.currency,
                                        ).length === 0
                                    }
                                >
                                    Posting pembayaran
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppSidebarLayout>
    );
}
