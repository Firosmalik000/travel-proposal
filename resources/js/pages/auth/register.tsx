import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';
import { Head } from '@inertiajs/react';

export default function Register() {
    return (
        <AuthSimpleLayout
            title="Registrasi Dinonaktifkan"
            description="Pendaftaran akun baru saat ini tidak tersedia. Silakan hubungi administrator."
        >
            <Head title="Register" />
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                Registrasi akun tidak tersedia pada portal ini.
            </div>
        </AuthSimpleLayout>
    );
}
