import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { Mail, Lock, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <AuthSplitLayout
            title="Masuk Akun"
            description="Masukkan email dan kata sandi untuk melanjutkan."
            sideHeadline="Perjalanan Umroh Tertata"
            sideDescription="Akses dashboard internal untuk mengelola paket, jadwal, dan komunikasi jamaah."
        >
            <Head title="Masuk" />

            {status && (
                <div className="animate-in slide-in-from-top-2 mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] fade-in duration-300 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/80">
                            <div className="mb-5 flex items-center justify-between">
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-primary">
                                    Portal Internal
                                </span>
                                <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                                    Branding mengikuti pengaturan portal
                                </span>
                            </div>
                            <div className="grid gap-5">
                                <div className="grid gap-2.5 group/input">
                                    <Label
                                        htmlFor="email"
                                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100"
                                    >
                                        <Mail className="h-4 w-4 text-primary" />
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="nama@email.com"
                                            className="h-11 rounded-xl border-slate-300 bg-white px-10 text-sm font-medium text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2.5 group/input">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="password"
                                            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100"
                                        >
                                            <Lock className="h-4 w-4 text-primary" />
                                            Kata sandi
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="text-xs font-semibold text-primary transition-colors duration-200 hover:text-primary/80 dark:text-amber-300 dark:hover:text-amber-200"
                                                tabIndex={5}
                                            >
                                                Lupa kata sandi?
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Masukkan kata sandi"
                                            className="h-11 rounded-xl border-slate-300 bg-white px-10 pr-11 text-sm font-medium text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                            onClick={() => setShowPassword((value) => !value)}
                                            aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3 py-1 group/check">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="border-slate-300 shadow-[0_1px_2px_rgba(31,47,77,0.08)] transition-all duration-200 data-[state=checked]:border-primary data-[state=checked]:bg-primary dark:border-slate-700"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer select-none text-sm font-medium text-slate-600 transition-colors duration-200 group-hover/check:text-slate-900 dark:text-slate-300 dark:group-hover/check:text-slate-100"
                                    >
                                        Ingat saya
                                    </Label>
                                </div>

                                <div className="relative group/button pt-2">
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/35 via-primary/15 to-transparent opacity-70 blur-xl transition-all duration-300 group-hover/button:opacity-100" />
                                    <Button
                                        type="submit"
                                        className="relative flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-22px_rgba(31,47,77,0.45)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-primary/90 hover:shadow-[0_22px_50px_-24px_rgba(31,47,77,0.55)] active:translate-y-0 active:shadow-[0_12px_30px_-20px_rgba(31,47,77,0.4)]"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner className="h-4 w-4" />}
                                        <span>{processing ? 'Memproses...' : 'Masuk'}</span>
                                        {!processing && <ChevronRight className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {canRegister && (
                            <div className="text-center text-xs text-slate-600 dark:text-slate-300">
                                Belum punya akun?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={6}
                                    className="font-semibold text-primary transition-colors duration-200 hover:text-primary/80 dark:text-amber-300 dark:hover:text-amber-200"
                                >
                                    Daftar
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </AuthSplitLayout>
    );
}
