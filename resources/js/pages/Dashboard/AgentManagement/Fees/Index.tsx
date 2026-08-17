import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Save, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Option = {
    id: number;
    name: string;
    referral_code?: string;
    code?: string;
    currency?: string;
};
type Fee = {
    id: number;
    agent_profile_id: number;
    package_id: number;
    agent_name: string;
    referral_code: string;
    package_code: string;
    package_name: string;
    currency: string;
    fee_type: 'fixed' | 'percentage';
    fee_value: number;
    is_active: boolean;
};
const money = (value: number, currency: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);

export default function AgentFeesIndex({
    agents,
    packages,
    fees,
}: {
    agents: Option[];
    packages: Option[];
    fees: Fee[];
}) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const form = useForm({
        agent_profile_id: '',
        package_id: '',
        fee_type: 'fixed' as 'fixed' | 'percentage',
        fee_value: '',
        is_active: true,
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/admin/agent-management/fees', {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                form.reset();
                form.setData('is_active', true);
            },
        });
    };
    const editFee = (fee: Fee) => {
        setEditingId(fee.id);
        form.clearErrors();
        form.setData({
            agent_profile_id: String(fee.agent_profile_id),
            package_id: String(fee.package_id),
            fee_type: fee.fee_type,
            fee_value: String(fee.fee_value),
            is_active: fee.is_active,
        });
    };
    const cancelEdit = () => {
        setEditingId(null);
        form.reset();
        form.setData('is_active', true);
    };
    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Agent Management',
                    href: '/admin/agent-management/agents',
                },
                {
                    title: 'Fee per Package',
                    href: '/admin/agent-management/fees',
                },
            ]}
        >
            <Head title="Fee Agent per Package" />
            <div className="space-y-5 p-2 md:p-4">
                <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 md:flex-row md:items-center">
                    <div>
                        <p className="text-xs font-bold tracking-[.18em] text-amber-700 uppercase">
                            Commission Rules
                        </p>
                        <h1 className="mt-1 text-2xl font-black">
                            Fee per Package
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Nominal tetap dihitung per pax; persentase dihitung
                            dari total booking.
                        </p>
                    </div>
                    <AgentManagementNav active="fees" />
                </div>
                <form
                    onSubmit={submit}
                    className="grid gap-4 rounded-2xl border bg-card p-5 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_1fr_180px_200px_auto] xl:items-end"
                >
                    <div className="space-y-2">
                        <Label>Agent</Label>
                        <Select
                            value={form.data.agent_profile_id}
                            onValueChange={(value) =>
                                form.setData('agent_profile_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih agent" />
                            </SelectTrigger>
                            <SelectContent>
                                {agents.map((agent) => (
                                    <SelectItem
                                        key={agent.id}
                                        value={String(agent.id)}
                                    >
                                        {agent.name} · {agent.referral_code}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.agent_profile_id} />
                    </div>
                    <div className="space-y-2">
                        <Label>Package</Label>
                        <Select
                            value={form.data.package_id}
                            onValueChange={(value) =>
                                form.setData('package_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih package" />
                            </SelectTrigger>
                            <SelectContent>
                                {packages.map((pkg) => (
                                    <SelectItem
                                        key={pkg.id}
                                        value={String(pkg.id)}
                                    >
                                        {pkg.code} · {pkg.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.package_id} />
                    </div>
                    <div className="space-y-2">
                        <Label>Jenis Fee</Label>
                        <Select
                            value={form.data.fee_type}
                            onValueChange={(value: 'fixed' | 'percentage') =>
                                form.setData('fee_type', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">
                                    Nominal / pax
                                </SelectItem>
                                <SelectItem value="percentage">
                                    Persentase
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>
                            {form.data.fee_type === 'fixed'
                                ? 'Nominal Fee'
                                : 'Persentase (%)'}
                        </Label>
                        <Input
                            type="number"
                            min="0"
                            step={form.data.fee_type === 'fixed' ? '1' : '0.01'}
                            value={form.data.fee_value}
                            onChange={(e) =>
                                form.setData('fee_value', e.target.value)
                            }
                        />
                        <InputError message={form.errors.fee_value} />
                    </div>
                    <label className="flex h-10 items-center gap-3 rounded-lg border px-3 text-sm font-medium xl:col-start-4">
                        <input
                            type="checkbox"
                            checked={form.data.is_active}
                            onChange={(event) =>
                                form.setData('is_active', event.target.checked)
                            }
                        />
                        Aturan fee aktif
                    </label>
                    <Button disabled={form.processing}>
                        <Save className="size-4" /> Simpan Fee
                    </Button>
                    {editingId !== null && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="xl:col-start-5"
                        >
                            <X className="size-4" /> Batal Edit
                        </Button>
                    )}
                </form>
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agent</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Nilai Fee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fees.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-28 text-center text-muted-foreground"
                                    >
                                        Belum ada aturan fee.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fees.map((fee) => (
                                    <TableRow key={fee.id}>
                                        <TableCell>
                                            <div className="font-semibold">
                                                {fee.agent_name}
                                            </div>
                                            <code className="text-xs">
                                                {fee.referral_code}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => editFee(fee)}
                                            >
                                                <Pencil className="size-4" />
                                                Edit
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold">
                                                {fee.package_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {fee.package_code}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {fee.fee_type === 'fixed'
                                                ? 'Nominal / pax'
                                                : 'Persentase booking'}
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {fee.fee_type === 'fixed'
                                                ? money(
                                                      fee.fee_value,
                                                      fee.currency,
                                                  )
                                                : `${fee.fee_value}%`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    fee.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {fee.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </Badge>
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
