import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAdminLocale } from '@/contexts/admin-locale';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import packages from '@/routes/packages';
import { Package2, Plus, Search, Tag, TrendingUp, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PackageCard } from './PackageCard';
import { PackageForm } from './PackageForm';
import { SchedulePanel } from './SchedulePanel';
import type { Package, ProductOption } from './types';

type Props = {
    packages: Package[];
    productOptions: ProductOption[];
};

export default function PackagesIndex({ packages: packageList, productOptions }: Props) {
    const { locale } = useAdminLocale();
    const [search, setSearch] = useState('');
    const [editingPkg, setEditingPkg] = useState<Package | null | 'new'>(null);
    const [schedulePkg, setSchedulePkg] = useState<Package | null>(null);

    const filtered = packageList.filter((p) => {
        const name = p.name?.[locale] || p.name?.id || '';
        return (
            name.toLowerCase().includes(search.toLowerCase()) ||
            p.code.toLowerCase().includes(search.toLowerCase()) ||
            p.departure_city.toLowerCase().includes(search.toLowerCase())
        );
    });

    function handleDelete(pkg: Package) {
        if (!confirm(`Hapus package "${pkg.name?.id || pkg.code}"? Semua jadwal terkait juga akan dihapus.`)) return;
        router.delete(packages.destroy(pkg.id).url, {
            onSuccess: () => toast.success('Package dihapus.'),
            onError: () => toast.error('Gagal menghapus package.'),
        });
    }

    const stats = [
        {
            label: 'Total Package',
            value: packageList.length,
            icon: Package2,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
        },
        {
            label: 'Aktif',
            value: packageList.filter((p) => p.is_active).length,
            icon: TrendingUp,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        },
        {
            label: 'Sedang Promo',
            value: packageList.filter((p) => p.original_price !== null).length,
            icon: Tag,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-950/40',
        },
        {
            label: 'Jadwal Open',
            value: packageList.reduce((acc, p) => acc + p.schedules.filter((s) => s.status === 'open' && s.is_active).length, 0),
            icon: CalendarCheck,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50 dark:bg-violet-950/40',
        },
    ];

    return (
        <AppSidebarLayout breadcrumbs={[{ label: 'Package Management', href: packages.index().url }]}>
            <Head title="Package Management" />

            <div className="space-y-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Package Management</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola paket umroh — harga, diskon, produk, dan jadwal keberangkatan.
                        </p>
                    </div>
                    <Button size="default" onClick={() => setEditingPkg('new')} className="shrink-0">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Package
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {stats.map((s) => (
                        <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                                <div className={`rounded-lg p-1.5 ${s.bg}`}>
                                    <s.icon className={`h-4 w-4 ${s.color}`} />
                                </div>
                            </div>
                            <p className="mt-2 text-2xl font-bold">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-10 pl-9 pr-4"
                        placeholder="Cari nama, kode, atau kota keberangkatan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {filtered.length} hasil
                        </span>
                    )}
                </div>

                {/* Package List */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 py-20 text-center">
                        <div className="mb-4 rounded-full bg-muted p-4">
                            <Package2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground">
                            {search ? 'Tidak ada package yang cocok' : 'Belum ada package'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {search ? 'Coba kata kunci lain.' : 'Klik "Tambah Package" untuk mulai.'}
                        </p>
                        {!search && (
                            <Button className="mt-4" onClick={() => setEditingPkg('new')}>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Package Pertama
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                locale={locale}
                                onEdit={(p) => setEditingPkg(p)}
                                onDelete={handleDelete}
                                onManageSchedules={(p) => setSchedulePkg(p)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Package Form Sheet */}
            <Sheet open={editingPkg !== null} onOpenChange={(open) => !open && setEditingPkg(null)}>
                <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader className="pb-2">
                        <SheetTitle className="text-lg">
                            {editingPkg === 'new' ? '✦ Tambah Package Baru' : `Edit: ${(editingPkg as Package)?.name?.id}`}
                        </SheetTitle>
                        <SheetDescription>
                            {editingPkg === 'new' ? 'Isi detail paket umroh baru.' : 'Perbarui informasi package.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-2 px-1">
                        <PackageForm
                            pkg={editingPkg === 'new' ? null : (editingPkg as Package)}
                            productOptions={productOptions}
                            locale={locale}
                            onSuccess={() => setEditingPkg(null)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Schedule Sheet */}
            <Sheet open={schedulePkg !== null} onOpenChange={(open) => !open && setSchedulePkg(null)}>
                <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader className="pb-2">
                        <SheetTitle className="text-lg">
                            🗓 Jadwal: {schedulePkg?.name?.[locale] || schedulePkg?.code}
                        </SheetTitle>
                        <SheetDescription>Kelola jadwal keberangkatan untuk package ini.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-2 px-1">
                        {schedulePkg && <SchedulePanel pkg={schedulePkg} />}
                    </div>
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
