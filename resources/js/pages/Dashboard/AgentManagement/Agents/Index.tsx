import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Agent = {
    id: number;
    name: string;
    email: string;
    referral_code: string;
    phone: string | null;
    bank_name: string | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
    is_active: boolean;
    bookings_count: number;
    commission_totals: Array<{ currency: string; amount: number }>;
};
const money = (value: number, currency = 'IDR') =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);

export default function AgentsIndex({ agents }: { agents: Agent[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        referral_code: '',
        phone: '',
        bank_name: '',
        bank_account_name: '',
        bank_account_number: '',
        is_active: true,
    });
    const edit = (agent: Agent) => {
        setEditingId(agent.id);
        form.clearErrors();
        form.setData({
            name: agent.name,
            email: agent.email,
            password: '',
            password_confirmation: '',
            referral_code: agent.referral_code,
            phone: agent.phone ?? '',
            bank_name: agent.bank_name ?? '',
            bank_account_name: agent.bank_account_name ?? '',
            bank_account_number: agent.bank_account_number ?? '',
            is_active: agent.is_active,
        });
    };
    const reset = () => {
        setEditingId(null);
        form.reset();
        form.setData('is_active', true);
    };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: reset };
        if (editingId) {
            form.put(`/admin/agent-management/agents/${editingId}`, options);
            return;
        }
        form.post('/admin/agent-management/agents', options);
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Agent Management',
                    href: '/admin/agent-management/agents',
                },
                { title: 'Agents', href: '/admin/agent-management/agents' },
            ]}
        >
            <Head title="Agent Management" />
            <div className="space-y-5 p-2 md:p-4">
                <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 md:flex-row md:items-center">
                    <div>
                        <p className="text-xs font-bold tracking-[.18em] text-amber-700 uppercase">
                            Referral Network
                        </p>
                        <h1 className="mt-1 text-2xl font-black">
                            Agent Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola akun, kode referral, dan rekening pencairan
                            agent.
                        </p>
                    </div>
                    <AgentManagementNav active="agents" />
                </div>
                <form
                    onSubmit={submit}
                    className="rounded-2xl border bg-card p-5 shadow-sm"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-bold">
                            {editingId ? 'Edit Agent' : 'Tambah Agent'}
                        </h2>
                        {editingId && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={reset}
                            >
                                <X className="size-4" /> Batal
                            </Button>
                        )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Field label="Nama" error={form.errors.name}>
                            <Input
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Email" error={form.errors.email}>
                            <Input
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label="Kode Referral"
                            error={form.errors.referral_code}
                        >
                            <Input
                                value={form.data.referral_code}
                                onChange={(e) =>
                                    form.setData(
                                        'referral_code',
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="AGENT-001"
                            />
                        </Field>
                        <Field label="WhatsApp" error={form.errors.phone}>
                            <Input
                                value={form.data.phone}
                                onChange={(e) =>
                                    form.setData('phone', e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            label={
                                editingId
                                    ? 'Password Baru (opsional)'
                                    : 'Password'
                            }
                            error={form.errors.password}
                        >
                            <Input
                                type="password"
                                value={form.data.password}
                                onChange={(e) =>
                                    form.setData('password', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Konfirmasi Password">
                            <Input
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(e) =>
                                    form.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Bank">
                            <Input
                                value={form.data.bank_name}
                                onChange={(e) =>
                                    form.setData('bank_name', e.target.value)
                                }
                            />
                        </Field>
                        <Field label="Nomor Rekening">
                            <Input
                                value={form.data.bank_account_number}
                                onChange={(e) =>
                                    form.setData(
                                        'bank_account_number',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label="Nama Pemilik Rekening">
                            <Input
                                value={form.data.bank_account_name}
                                onChange={(e) =>
                                    form.setData(
                                        'bank_account_name',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <label className="flex items-center gap-3 self-end rounded-xl border p-3 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) =>
                                    form.setData('is_active', e.target.checked)
                                }
                            />{' '}
                            Agent aktif
                        </label>
                    </div>
                    <Button className="mt-4" disabled={form.processing}>
                        {editingId ? (
                            <Pencil className="size-4" />
                        ) : (
                            <Plus className="size-4" />
                        )}
                        {editingId ? 'Simpan Perubahan' : 'Tambah Agent'}
                    </Button>
                </form>
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agent</TableHead>
                                <TableHead>Kode Referral</TableHead>
                                <TableHead>Kontak</TableHead>
                                <TableHead>Rekening</TableHead>
                                <TableHead>Booking</TableHead>
                                <TableHead>Total Komisi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agents.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-28 text-center text-muted-foreground"
                                    >
                                        Belum ada agent.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                agents.map((agent) => (
                                    <TableRow key={agent.id}>
                                        <TableCell>
                                            <div className="font-semibold">
                                                {agent.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {agent.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="rounded bg-muted px-2 py-1 font-bold">
                                                {agent.referral_code}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            {agent.phone ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {agent.bank_name ?? '-'}
                                            <div className="text-xs text-muted-foreground">
                                                {agent.bank_account_number ??
                                                    ''}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {agent.bookings_count}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {agent.commission_totals.length > 0
                                                ? agent.commission_totals
                                                      .map((total) =>
                                                          money(
                                                              total.amount,
                                                              total.currency,
                                                          ),
                                                      )
                                                      .join(' · ')
                                                : money(0)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    agent.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {agent.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => edit(agent)}
                                            >
                                                <Pencil className="size-4" />{' '}
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
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
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
