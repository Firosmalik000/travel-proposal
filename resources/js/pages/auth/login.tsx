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
    return (
        <AuthSplitLayout
            title="Masuk Akun"
            description="Masukkan email dan kata sandi untuk melanjutkan."
            sideTitle="AMANAH HARMAIN"
            sideHeadline="Perjalanan Umroh Tertata"
            sideDescription="Akses dashboard internal untuk mengelola paket, jadwal, dan komunikasi jamaah."
        >
            <Head title="Masuk" />

            {status && (
                <div className="mb-6 rounded-xl border border-[rgba(43,69,112,0.2)] bg-white/90 px-4 py-3 text-center text-sm font-medium text-[var(--emerald-900)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] animate-in fade-in slide-in-from-top-2 duration-300">
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
                        <div className="rounded-2xl border border-[rgba(43,69,112,0.12)] bg-white/85 p-5 shadow-[0_18px_40px_rgba(31,47,77,0.08)]">
                            <div className="mb-5 flex items-center justify-between">
                                <span className="rounded-full bg-[rgba(43,69,112,0.1)] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[var(--emerald-900)]">
                                    Portal Internal
                                </span>
                                <span className="text-[0.65rem] text-[var(--ink-500)]">
                                    Amanah Haramain Travel
                                </span>
                            </div>
                            <div className="grid gap-5">
                                <div className="grid gap-2.5 group/input">
                                    <Label
                                        htmlFor="email"
                                        className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)] flex items-center gap-2"
                                    >
                                        <Mail className="h-4 w-4 text-[var(--emerald-700)]" />
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-500)]" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="nama@email.com"
                                            className="h-11 rounded-xl border border-[rgba(31,47,77,0.18)] bg-white px-10 text-sm text-[var(--emerald-900)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-200 placeholder:text-[var(--ink-500)] focus-visible:border-[var(--emerald-500)] focus-visible:ring-2 focus-visible:ring-[rgba(43,69,112,0.2)]"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2.5 group/input">
                                    <div className="flex items-center justify-between">
                                        <Label
                                            htmlFor="password"
                                            className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)] flex items-center gap-2"
                                        >
                                            <Lock className="h-4 w-4 text-[var(--emerald-700)]" />
                                            Kata sandi
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="text-xs font-semibold text-[var(--ink-600)] hover:text-[var(--emerald-700)] transition-colors duration-200"
                                                tabIndex={5}
                                            >
                                                Lupa kata sandi?
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-500)]" />
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Masukkan kata sandi"
                                            className="h-11 rounded-xl border border-[rgba(31,47,77,0.18)] bg-white px-10 text-sm text-[var(--emerald-900)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-200 placeholder:text-[var(--ink-500)] focus-visible:border-[var(--emerald-500)] focus-visible:ring-2 focus-visible:ring-[rgba(43,69,112,0.2)]"
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3 py-1 group/check">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="border-[rgba(31,47,77,0.3)] shadow-[0_1px_2px_rgba(31,47,77,0.08)] transition-all duration-200 data-[state=checked]:bg-[var(--emerald-700)] data-[state=checked]:border-[var(--emerald-700)]"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm font-medium text-[var(--ink-700)] cursor-pointer select-none transition-colors duration-200 group-hover/check:text-[var(--emerald-900)]"
                                    >
                                        Ingat saya
                                    </Label>
                                </div>

                                <div className="relative group/button pt-2">
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[rgba(43,69,112,0.35)] via-[rgba(43,69,112,0.15)] to-transparent opacity-70 blur-xl transition-all duration-300 group-hover/button:opacity-100" />
                                    <Button
                                        type="submit"
                                        className="relative flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--emerald-700)] text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(31,47,77,0.45)] transition-all duration-300 hover:translate-y-[-1px] hover:bg-[var(--emerald-800)] hover:shadow-[0_22px_50px_-24px_rgba(31,47,77,0.55)] active:translate-y-0 active:shadow-[0_12px_30px_-20px_rgba(31,47,77,0.4)]"
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
                            <div className="text-center text-xs text-[var(--ink-600)]">
                                Belum punya akun?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={6}
                                    className="font-semibold text-[var(--emerald-700)] hover:text-[var(--emerald-800)] transition-colors duration-200"
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
