import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthSimpleLayout
            title="Portal Admin"
            description="Login khusus tim internal untuk mengelola operasional."
        >
            <Head title="Masuk" />

            {status && (
                <div className="mb-6 animate-in rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] duration-300 fade-in slide-in-from-top-2 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <Form
                action={store.url()}
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="h-11 rounded-xl"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Kata sandi</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-medium"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
                                        className="h-11 rounded-xl pr-11"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                        onClick={() =>
                                            setShowPassword((value) => !value)
                                        }
                                        aria-label={
                                            showPassword
                                                ? 'Sembunyikan password'
                                                : 'Lihat password'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3 py-1">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer text-sm text-muted-foreground"
                                    >
                                        Ingat saya
                                    </Label>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="h-11 w-full rounded-xl"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && (
                                            <Spinner className="h-4 w-4" />
                                        )}
                                        <span>
                                            {processing
                                                ? 'Memproses...'
                                                : 'Masuk'}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Form>
        </AuthSimpleLayout>
    );
}
