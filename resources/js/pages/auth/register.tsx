import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { User, Mail, Lock, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Register() {
    return (
        <AuthLayout
            title="Create your account"
            description="Start your journey with us today"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-2.5 group/input">
                                <Label
                                    htmlFor="name"
                                    className="flex items-center gap-2 text-sm font-semibold text-[var(--auth-card-foreground)]"
                                >
                                    <User className="h-4 w-4 text-primary" />
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="John Doe"
                                    className="h-12 rounded-xl border-[var(--auth-field-border)] bg-[var(--auth-field-bg)] px-4 text-base text-[var(--auth-field-foreground)] placeholder:text-[var(--auth-field-placeholder)] transition-all duration-200 focus-visible:border-primary focus-visible:ring-primary/20"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2.5 group/input">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-2 text-sm font-semibold text-[var(--auth-card-foreground)]"
                                >
                                    <Mail className="h-4 w-4 text-primary" />
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className="h-12 rounded-xl border-[var(--auth-field-border)] bg-[var(--auth-field-bg)] px-4 text-base text-[var(--auth-field-foreground)] placeholder:text-[var(--auth-field-placeholder)] transition-all duration-200 focus-visible:border-primary focus-visible:ring-primary/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2.5 group/input">
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
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Create a strong password"
                                    className="h-12 rounded-xl border-[var(--auth-field-border)] bg-[var(--auth-field-bg)] px-4 text-base text-[var(--auth-field-foreground)] placeholder:text-[var(--auth-field-placeholder)] transition-all duration-200 focus-visible:border-primary focus-visible:ring-primary/20"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2.5 group/input">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="flex items-center gap-2 text-sm font-semibold text-[var(--auth-card-foreground)]"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Re-enter your password"
                                    className="h-12 rounded-xl border-[var(--auth-field-border)] bg-[var(--auth-field-bg)] px-4 text-base text-[var(--auth-field-foreground)] placeholder:text-[var(--auth-field-placeholder)] transition-all duration-200 focus-visible:border-primary focus-visible:ring-primary/20"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="relative group/button pt-3">
                                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary via-primary/75 to-accent opacity-75 blur transition-all duration-300 group-hover/button:opacity-100 group-hover/button:blur-md" />
                                <Button
                                    type="submit"
                                    className="relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-[1.01] hover:bg-primary/90 active:scale-[0.99]"
                                    tabIndex={5}
                                    data-test="register-user-button"
                                >
                                    {processing && <Spinner className="h-4 w-4" />}
                                    <span>{processing ? 'Creating account...' : 'Create account'}</span>
                                    {!processing && <ChevronRight className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--auth-card-border)]" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[var(--auth-card-bg)] px-3 font-medium text-[var(--auth-card-muted)]">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="inline-flex items-center gap-2 rounded-xl border border-[var(--auth-field-border)] bg-[var(--auth-field-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--auth-link)] transition-all duration-200 hover:scale-105 hover:text-[var(--auth-link-hover)]"
                            >
                                Sign in instead
                                <ChevronRight className="h-4 w-4" />
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
