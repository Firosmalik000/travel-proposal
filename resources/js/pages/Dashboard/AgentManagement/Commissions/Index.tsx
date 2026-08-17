import { Button } from '@/components/ui/button';
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
import { Head, router } from '@inertiajs/react';
import { Banknote, CircleCheckBig, Clock3 } from 'lucide-react';

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
};
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
}: {
    commissions: Paginated;
    summary: Array<{
        currency: string;
        pending: number;
        approved: number;
        paid: number;
    }>;
}) {
    const updateStatus = (commission: Commission, status: string) =>
        router.put(
            `/admin/agent-management/commissions/${commission.id}`,
            { status, notes: commission.notes },
            { preserveScroll: true },
        );
    const summaryValue = (field: 'pending' | 'approved' | 'paid') =>
        summary.length > 0
            ? summary.map((row) => money(row[field], row.currency)).join(' / ')
            : money(0);
    const cards = [
        [
            'Pending',
            summaryValue('pending'),
            Clock3,
            'text-amber-700 bg-amber-100',
        ],
        [
            'Approved',
            summaryValue('approved'),
            CircleCheckBig,
            'text-sky-700 bg-sky-100',
        ],
        [
            'Paid',
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
                    title: 'Commissions',
                    href: '/admin/agent-management/commissions',
                },
            ]}
        >
            <Head title="Komisi Agent" />
            <div className="space-y-5 p-2 md:p-4">
                <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 md:flex-row md:items-center">
                    <div>
                        <p className="text-xs font-bold tracking-[.18em] text-amber-700 uppercase">
                            Revenue Sharing
                        </p>
                        <h1 className="mt-1 text-2xl font-black">
                            Commissions
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review, approve, dan tandai komisi yang sudah
                            dibayarkan.
                        </p>
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
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={item.status}
                                                onValueChange={(value) =>
                                                    updateStatus(item, value)
                                                }
                                            >
                                                <SelectTrigger className="w-36">
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
            </div>
        </AppSidebarLayout>
    );
}
