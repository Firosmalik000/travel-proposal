import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, User, Lock, CheckCircle } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { Link } from '@inertiajs/react';
import { send } from '@/routes/verification';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
}

interface Props {
    user: User;
    mustVerifyEmail: boolean;
    status?: string;
}

export default function AccountTab({ user, mustVerifyEmail, status }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        _method: 'PATCH',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        post('/settings/profile/account', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Informasi akun berhasil diperbarui');
                setData('password', ''); // Clear password field
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Gagal memperbarui informasi akun');
                setIsSubmitting(false);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email verification alert */}
            {mustVerifyEmail && user.email_verified_at === null && (
                <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950">
                    <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                        Email Anda belum diverifikasi.{' '}
                        <Link
                            href={send()}
                            as="button"
                            className="font-medium underline hover:no-underline"
                        >
                            Klik di sini untuk mengirim ulang email verifikasi
                        </Link>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                Link verifikasi baru telah dikirim ke email Anda
                            </div>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Email verified status */}
            {user.email_verified_at !== null && (
                <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                        Email Anda telah diverifikasi
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Username <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Username"
                        required
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="email@example.com"
                        required
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Jika Anda mengubah email, verifikasi akan direset
                    </p>
                </div>

                {/* Password */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password Baru
                    </Label>
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Minimal 8 karakter"
                    />
                    {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="show-password"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor="show-password" className="text-sm text-muted-foreground cursor-pointer">
                            Tampilkan password
                        </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Kosongkan jika tidak ingin mengubah password
                    </p>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSubmitting || processing}>
                    {(isSubmitting || processing) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan Perubahan
                </Button>
            </div>
        </form>
    );
}
