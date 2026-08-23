import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AgentLayout from '@/layouts/agent-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, KeyRound, Save, UserRound } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

type Profile = {
    name: string;
    email: string;
    phone: string | null;
    referral_code: string;
    bank_name: string | null;
    bank_account_name: string | null;
    bank_account_number: string | null;
};

export default function Account({ profile }: { profile: Profile }) {
    const form = useForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone ?? '',
        bank_name: profile.bank_name ?? '',
        bank_account_name: profile.bank_account_name ?? '',
        bank_account_number: profile.bank_account_number ?? '',
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/agent/account', { preserveScroll: true });
    };
    return (
        <AgentLayout title="Profil & Rekening">
            <Head title="Profil Agent" />
            <div className="mx-auto max-w-4xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold tracking-[.18em] text-[#0d5c52] uppercase dark:text-emerald-300">
                            Account Center
                        </p>
                        <h1 className="mt-2 font-serif text-3xl font-bold">
                            Profil & Rekening
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Pastikan informasi payout sesuai dengan rekening
                            penerima komisi.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/agent/password">
                            <KeyRound /> Ubah Password
                        </Link>
                    </Button>
                </div>
                <form
                    onSubmit={submit}
                    className="mt-5 grid gap-4 lg:grid-cols-2"
                >
                    <FormCard title="Informasi Agent" icon={UserRound}>
                        <Field
                            label="Nama"
                            value={form.data.name}
                            onChange={(value) => form.setData('name', value)}
                            error={form.errors.name}
                        />
                        <Field
                            label="Email"
                            type="email"
                            value={form.data.email}
                            onChange={(value) => form.setData('email', value)}
                            error={form.errors.email}
                        />
                        <Field
                            label="Nomor WhatsApp"
                            value={form.data.phone}
                            onChange={(value) => form.setData('phone', value)}
                            error={form.errors.phone}
                        />
                        <div className="grid gap-2">
                            <Label>Kode referral</Label>
                            <Input value={profile.referral_code} disabled />
                            <p className="text-xs text-slate-500">
                                Kode referral hanya dapat diubah oleh
                                administrator.
                            </p>
                        </div>
                    </FormCard>
                    <FormCard title="Rekening Payout" icon={Building2}>
                        <Field
                            label="Nama bank"
                            value={form.data.bank_name}
                            onChange={(value) =>
                                form.setData('bank_name', value)
                            }
                            error={form.errors.bank_name}
                        />
                        <Field
                            label="Nomor rekening"
                            value={form.data.bank_account_number}
                            onChange={(value) =>
                                form.setData('bank_account_number', value)
                            }
                            error={form.errors.bank_account_number}
                        />
                        <Field
                            label="Nama pemilik rekening"
                            value={form.data.bank_account_name}
                            onChange={(value) =>
                                form.setData('bank_account_name', value)
                            }
                            error={form.errors.bank_account_name}
                        />
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                            Perubahan rekening akan menjadi data tujuan payout
                            berikutnya. Hubungi admin jika ada transaksi yang
                            sedang diproses.
                        </div>
                    </FormCard>
                    <div className="lg:col-span-2">
                        <Button
                            disabled={form.processing}
                            className="w-full sm:w-auto"
                        >
                            <Save />{' '}
                            {form.processing
                                ? 'Menyimpan...'
                                : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AgentLayout>
    );
}

function FormCard({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: typeof UserRound;
    children: ReactNode;
}) {
    return (
        <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="size-5 text-[#0d5c52] dark:text-emerald-300" />{' '}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">{children}</CardContent>
        </Card>
    );
}
function Field({
    label,
    value,
    onChange,
    error,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            <InputError message={error} />
        </div>
    );
}
