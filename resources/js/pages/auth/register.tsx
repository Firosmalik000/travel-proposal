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
                                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                                >
                                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                                    className="h-12 pl-4 pr-4 text-base bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2.5 group/input">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                                >
                                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                                    className="h-12 pl-4 pr-4 text-base bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2.5 group/input">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                                >
                                    <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                                    className="h-12 pl-4 pr-4 text-base bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2.5 group/input">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                                    className="h-12 pl-4 pr-4 text-base bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700 transition-all duration-200 focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="relative group/button pt-3">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl opacity-75 blur transition-all duration-300 group-hover/button:opacity-100 group-hover/button:blur-md" />
                                <Button
                                    type="submit"
                                    className="relative w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
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
                                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-900 px-3 text-gray-500 dark:text-gray-400 font-medium">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="text-center">
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-xl transition-all duration-200 hover:scale-105"
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
