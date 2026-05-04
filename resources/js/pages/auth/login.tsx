import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { ChevronRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
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
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-950/80">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <span className="rounded-full border border-amber-200/70 bg-gradient-to-r from-primary/12 to-amber-100 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.24em] text-primary uppercase shadow-[0_10px_22px_-18px_rgba(148,88,42,0.45)] dark:border-amber-300/10 dark:from-primary/18 dark:to-amber-300/10">
                                    Portal Internal
                                </span>
                                <span className="text-[0.65rem] text-slate-500 dark:text-slate-400">
                                    Branding mengikuti pengaturan portal
                                </span>
                            </div>
                            <div className="grid gap-5">
                                <div className="group/input grid gap-2.5">
                                    <Label
                                        htmlFor="email"
                                        className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-slate-800 uppercase dark:text-slate-100"
                                    >
                                        <Mail className="h-4 w-4 text-primary" />
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="nama@email.com"
                                            className="h-11 rounded-xl border-slate-300/90 bg-white/90 px-10 text-sm font-medium text-slate-900 shadow-[0_10px_24px_-20px_rgba(148,88,42,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="group/input grid gap-2.5">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="password"
                                            className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-slate-800 uppercase dark:text-slate-100"
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
                                        <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Masukkan kata sandi"
                                            className="h-11 rounded-xl border-slate-300/90 bg-white/90 px-10 pr-11 text-sm font-medium text-slate-900 shadow-[0_10px_24px_-20px_rgba(148,88,42,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder:text-slate-500"
                                        />
                                        <button
                                            type="button"
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                                            onClick={() =>
                                                setShowPassword(
                                                    (value) => !value,
                                                )
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
                                </div>

                                <div className="group/check flex items-center space-x-3 py-1">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="border-slate-300 shadow-[0_1px_2px_rgba(31,47,77,0.08)] transition-all duration-200 data-[state=checked]:border-primary data-[state=checked]:bg-primary dark:border-slate-700"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="cursor-pointer text-sm font-medium text-slate-600 transition-colors duration-200 select-none group-hover/check:text-slate-900 dark:text-slate-300 dark:group-hover/check:text-slate-100"
                                    >
                                        Ingat saya
                                    </Label>
                                </div>

                                <div className="group/button relative pt-2">
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/40 via-amber-200/40 to-transparent opacity-80 blur-xl transition-all duration-300 group-hover/button:opacity-100" />
                                    <Button
                                        type="submit"
                                        className="relative flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-primary)_92%,white_8%)_0%,color-mix(in_srgb,var(--brand-accent)_76%,var(--brand-primary)_24%)_100%)] text-sm font-semibold text-primary-foreground shadow-[0_20px_44px_-22px_rgba(148,88,42,0.5)] transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_24px_54px_-24px_rgba(148,88,42,0.58)] hover:brightness-105 active:translate-y-0 active:shadow-[0_12px_30px_-20px_rgba(148,88,42,0.42)]"
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
                                        {!processing && (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Form>
        </AuthSplitLayout>
    );
}
