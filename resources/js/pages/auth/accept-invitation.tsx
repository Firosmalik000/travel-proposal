import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, ChevronRight, Lock, Mail, User } from 'lucide-react';
import type { FormEvent } from 'react';

type Props = {
    email: string;
    token: string;
};

export default function AcceptInvitation({ email, token }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/invitation/${token}`, {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Terima Undangan"
            description="Atur password untuk akun kamu"
        >
            <Head title="Terima Undangan" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-4">
                    <div className="group/input grid gap-2.5">
                        <Label
                            htmlFor="name"
                            className="flex items-center gap-2 text-sm font-semibold text-[var(--auth-card-foreground)]"
                        >
                            <User className="h-4 w-4 text-primary" />
                            Nama
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="h-12 rounded-xl border-[var(--auth-field-border)] bg-[var(--auth-field-bg)] px-4 text-base text-[var(--auth-field-foreground)] transition-all duration-200 placeholder:text-[var(--auth-field-placeholder)] focus-visible:border-primary focus-visible:ring-primary/20"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="group/input grid gap-2.5">
                        <Label
                            htmlFor="email"
                            className="flex items-center gap-2 text-sm font-semibold text-[var(--auth-card-foreground)]"
                        >
                            <Mail className="h-4 w-4 text-primary" />
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            readOnly
                            className="h-12 cursor-not-allowed rounded-xl border-[var(--auth-field-border)] bg-[var(--auth-field-bg)] px-4 text-base text-[var(--auth-field-foreground)] opacity-80"
                        />
                    </div>

                    <div className="group/input grid gap-2.5">
                        <Label
                            htmlFor="password"
                            className="flex items-center gap-2 text-sm font-semibold text-[var(--auth-card-foreground)]"
                        >
                            <Lock className="h-4 w-4 text-primary" />
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="h-12 rounded-xl border-[var(--auth-field-border)] bg-[var(--auth-field-bg)] px-4 text-base text-[var(--auth-field-foreground)] transition-all duration-200 placeholder:text-[var(--auth-field-placeholder)] focus-visible:border-primary focus-visible:ring-primary/20"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="group/input grid gap-2.5">
                        <Label
                            htmlFor="password_confirmation"
                            className="flex items-center gap-2 text-sm font-semibold text-[var(--auth-card-foreground)]"
                        >
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            Konfirmasi password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            className="h-12 rounded-xl border-[var(--auth-field-border)] bg-[var(--auth-field-bg)] px-4 text-base text-[var(--auth-field-foreground)] transition-all duration-200 placeholder:text-[var(--auth-field-placeholder)] focus-visible:border-primary focus-visible:ring-primary/20"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="group/button relative pt-3">
                        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary via-primary/75 to-accent opacity-75 blur transition-all duration-300 group-hover/button:opacity-100 group-hover/button:blur-md" />
                        <Button
                            type="submit"
                            className="relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.01] hover:bg-primary/90 active:scale-[0.99]"
                            disabled={processing}
                        >
                            {processing && <Spinner className="h-4 w-4" />}
                            <span>
                                {processing ? 'Memproses...' : 'Buat akun'}
                            </span>
                            {!processing && (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
