import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

export default function LandingPlaceholder() {
    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Website Management', href: '#' },
                {
                    label: 'Landing Management',
                    href: '/admin/website-management/landing',
                },
            ]}
        >
            <Head title="Landing Management" />

            <div className="p-4 md:p-6">
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 shadow-sm">
                    <h1 className="text-xl font-bold text-foreground">
                        Landing Management
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Halaman ini sengaja dikosongkan dulu karena ranah
                        management landing dipisah dari Website Management.
                    </p>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
