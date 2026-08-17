import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomerLayout from '@/layouts/customer-layout';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';

export default function CustomerPassword() {
    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/customer/password', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <CustomerLayout title="Keamanan Akun">
            <Head title="Ubah Password" />
            <div className="mx-auto max-w-xl">
                <div className="mb-6">
                    <p className="text-sm font-bold tracking-[.18em] text-[#0d5c52] uppercase">
                        Keamanan Akun
                    </p>
                    <h1 className="mt-2 font-serif text-3xl font-bold">
                        Ubah Password
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Gunakan password yang mudah Anda ingat tetapi sulit
                        ditebak orang lain.
                    </p>
                </div>
                <Card className="border-[#dfd3bf] bg-[#fffaf1] dark:border-[#334155] dark:bg-[#202836]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-[#0d5c52]" />{' '}
                            Password Baru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label>Password saat ini</Label>
                                <Input
                                    type="password"
                                    value={form.data.current_password}
                                    onChange={(e) =>
                                        form.setData(
                                            'current_password',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.current_password}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Password baru</Label>
                                <Input
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) =>
                                        form.setData('password', e.target.value)
                                    }
                                />
                                <InputError message={form.errors.password} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Konfirmasi password baru</Label>
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
                            </div>
                            <Button
                                disabled={form.processing}
                                className="bg-[#0d5c52] hover:bg-[#08483f]"
                            >
                                <KeyRound className="h-4 w-4" />{' '}
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
