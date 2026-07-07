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
            description="Akses aman untuk tim internal mengelola operasional harian."
        >
            <Head title="Masuk" />

            {status && (
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-medium text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200">
                    {status}
                </div>
            )}

            <Form
                action={store.url()}
                method="post"
                resetOnSuccess={['password']}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-5">
                            <div className="space-y-2.5">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="h-11 rounded-xl border-slate-200 bg-white shadow-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-slate-800 dark:text-slate-100"
                                    >
                                        Kata sandi
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-medium text-slate-500 transition hover:text-primary dark:text-slate-400"
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
                                        className="h-11 rounded-xl border-slate-200 bg-white pr-11 shadow-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 dark:border-slate-700 dark:bg-slate-900"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
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
                                </div>
                                <InputError message={errors.password} />

                                <div className="flex items-center gap-3 pt-1">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer text-sm text-slate-600 dark:text-slate-400"
                                    >
                                        Ingat saya
                                    </Label>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="h-11 w-full rounded-xl bg-slate-900 text-white shadow-none transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
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
