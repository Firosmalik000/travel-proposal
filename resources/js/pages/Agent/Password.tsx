import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AgentLayout from '@/layouts/agent-layout';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';

export default function Password() {
    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/agent/password', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };
    return (
        <AgentLayout title="Keamanan Akun">
            <Head title="Ubah Password Agent" />
            <div className="mx-auto max-w-xl">
                <p className="text-xs font-bold tracking-[.18em] text-[#0d5c52] uppercase dark:text-emerald-300">
                    Keamanan Akun
                </p>
                <h1 className="mt-2 font-serif text-3xl font-bold">
                    Ubah Password
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Gunakan password unik yang tidak digunakan pada akun lain.
                </p>
                <Card className="mt-5 border-[#dfd3bf] bg-[#fffaf1] dark:border-slate-700 dark:bg-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-[#0d5c52]" />{' '}
                            Password Baru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4">
                            <PasswordField
                                label="Password saat ini"
                                value={form.data.current_password}
                                onChange={(value) =>
                                    form.setData('current_password', value)
                                }
                                error={form.errors.current_password}
                            />
                            <PasswordField
                                label="Password baru"
                                value={form.data.password}
                                onChange={(value) =>
                                    form.setData('password', value)
                                }
                                error={form.errors.password}
                            />
                            <PasswordField
                                label="Konfirmasi password"
                                value={form.data.password_confirmation}
                                onChange={(value) =>
                                    form.setData('password_confirmation', value)
                                }
                            />
                            <Button disabled={form.processing}>
                                <KeyRound />{' '}
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AgentLayout>
    );
}
function PasswordField({
    label,
    value,
    onChange,
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input
                type="password"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                autoComplete="new-password"
            />
            <InputError message={error} />
        </div>
    );
}
