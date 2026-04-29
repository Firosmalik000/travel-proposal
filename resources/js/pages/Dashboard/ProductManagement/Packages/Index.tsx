import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import packages from '@/routes/packages';
import { Head, router } from '@inertiajs/react';
import {
    CalendarCheck,
    Clock3,
    Layers3,
    MapPin,
    Package2,
    Percent,
    Plus,
    Search,
    Tag,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PackageCard } from './PackageCard';
import { PackageForm } from './PackageForm';
import { SchedulePanel } from './SchedulePanel';
import type { ActivityOption, Package, ProductOption } from './types';

type Props = {
    packages: Package[];
    productOptions: ProductOption[];
    activityOptions: ActivityOption[];
};

export default function PackagesIndex({
    packages: packageList,
    productOptions,
    activityOptions,
}: Props) {
    const locale: 'id' | 'en' = 'id';
    const safePackageList = Array.isArray(packageList) ? packageList : [];
    const safeProductOptions = Array.isArray(productOptions)
        ? productOptions
        : [];
    const safeActivityOptions = Array.isArray(activityOptions)
        ? activityOptions
        : [];
    const [search, setSearch] = useState('');
    const [editingPkg, setEditingPkg] = useState<Package | null | 'new'>(null);
    const [schedulePkg, setSchedulePkg] = useState<Package | null>(null);

    const filtered = safePackageList.filter((pkg) => {
        const localizedName =
            typeof pkg.name === 'string'
                ? pkg.name
                : (pkg.name?.[locale] || pkg.name?.id || '');

        return (
            localizedName.toLowerCase().includes(search.toLowerCase()) ||
            pkg.code.toLowerCase().includes(search.toLowerCase()) ||
            pkg.departure_city.toLowerCase().includes(search.toLowerCase())
        );
    });

    function handleDelete(pkg: Package) {
        if (
            !confirm(
                `Hapus package "${pkg.name?.id || pkg.code}"? Semua jadwal terkait juga akan dihapus.`,
            )
        ) {
            return;
        }

        router.delete(packages.destroy(pkg.id).url, {
            onSuccess: () => toast.success('Package dihapus.'),
            onError: () => toast.error('Gagal menghapus package.'),
        });
    }

    const stats = [
        {
            label: 'Total Package',
            value: safePackageList.length,
            icon: Package2,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
        },
        {
            label: 'Aktif',
            value: safePackageList.filter((pkg) => pkg.is_active).length,
            icon: TrendingUp,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        },
        {
            label: 'Sedang Promo',
            value: safePackageList.filter((pkg) => pkg.original_price !== null)
                .length,
            icon: Tag,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-950/40',
        },
        {
            label: 'Jadwal Open',
            value: safePackageList.reduce(
                (total, pkg) =>
                    total +
                    (Array.isArray(pkg.schedules) ? pkg.schedules : []).filter(
                        (schedule) =>
                            schedule.status === 'open' && schedule.is_active,
                    ).length,
                0,
            ),
            icon: CalendarCheck,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50 dark:bg-violet-950/40',
        },
    ];

    const editingPackage = editingPkg === 'new' ? null : editingPkg;
    const editingPackageName = editingPackage
        ? editingPackage.name?.[locale] ||
          editingPackage.name?.id ||
          editingPackage.code
        : null;
    const editingPackageMeta = editingPackage
        ? [
              { icon: MapPin, label: editingPackage.departure_city },
              { icon: Clock3, label: `${editingPackage.duration_days} hari` },
              {
                  icon: Layers3,
                  label: `${editingPackage.product_ids.length} produk`,
              },
              {
                  icon: CalendarCheck,
                  label: `${editingPackage.schedules.length} jadwal`,
              },
          ]
        : [];

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { label: 'Package Management', href: packages.index().url },
            ]}
        >
            <Head title="Package Management" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Package Management
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola paket umroh, harga promo, produk, itinerary,
                            dan jadwal keberangkatan.
                        </p>
                    </div>
                    <Button
                        size="default"
                        onClick={() => setEditingPkg('new')}
                        className="shrink-0"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Package
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border bg-card p-4 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground">
                                    {stat.label}
                                </p>
                                <div className={`rounded-lg p-1.5 ${stat.bg}`}>
                                    <stat.icon
                                        className={`h-4 w-4 ${stat.color}`}
                                    />
                                </div>
                            </div>
                            <p className="mt-2 text-2xl font-bold">
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-10 pr-4 pl-9"
                        placeholder="Cari nama, kode, atau kota keberangkatan..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    {search ? (
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                            {filtered.length} hasil
                        </span>
                    ) : null}
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 py-20 text-center">
                        <div className="mb-4 rounded-full bg-muted p-4">
                            <Package2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground">
                            {search
                                ? 'Tidak ada package yang cocok'
                                : 'Belum ada package'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {search
                                ? 'Coba kata kunci lain.'
                                : 'Klik "Tambah Package" untuk mulai.'}
                        </p>
                        {!search ? (
                            <Button
                                className="mt-4"
                                onClick={() => setEditingPkg('new')}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Package Pertama
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                locale={locale}
                                onEdit={(selectedPackage) =>
                                    setEditingPkg(selectedPackage)
                                }
                                onDelete={handleDelete}
                                onManageSchedules={(selectedPackage) =>
                                    setSchedulePkg(selectedPackage)
                                }
                            />
                        ))}
                    </div>
                )}
            </div>

            <Sheet
                open={editingPkg !== null}
                onOpenChange={(open) => !open && setEditingPkg(null)}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto border-l-0 bg-transparent p-0 shadow-none sm:max-w-[880px]"
                >
                    <div className="flex min-h-full flex-col bg-background">
                        <div className="border-b border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(190,24,93,0.10),_transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] px-6 py-6">
                            <SheetHeader className="p-0 pr-10">
                                <div className="mb-4 inline-flex w-fit items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-rose-700 uppercase">
                                    {editingPkg === 'new'
                                        ? 'Package Builder'
                                        : 'Package Editor'}
                                </div>
                                <SheetTitle className="text-2xl font-semibold tracking-tight text-foreground">
                                    {editingPkg === 'new'
                                        ? 'Tambah Package Baru'
                                        : editingPackageName}
                                </SheetTitle>
                                <SheetDescription className="mt-2 max-w-2xl text-sm leading-relaxed">
                                    {editingPkg === 'new'
                                        ? 'Susun paket umroh baru dengan struktur yang lebih rapi, dari identitas, harga, assign itinerary, sampai produk dan jadwal.'
                                        : 'Perbarui seluruh detail package dari satu panel kerja yang lebih fokus, lebih nyaman, dan lebih mudah dibaca.'}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {editingPkg === 'new' ? (
                                    <>
                                        <span className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-border">
                                            Draft baru
                                        </span>
                                        <span className="rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-border">
                                            Siap isi detail package
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        {editingPackageMeta.map((item) => (
                                            <span
                                                key={item.label}
                                                className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm ring-1 ring-border"
                                            >
                                                <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                                {item.label}
                                            </span>
                                        ))}
                                        {editingPackage?.discount_percent ? (
                                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                                                <Percent className="h-3.5 w-3.5" />
                                                Diskon{' '}
                                                {
                                                    editingPackage.discount_percent
                                                }
                                                %
                                            </span>
                                        ) : null}
                                    </>
                                )}
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-3">
                                <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm">
                                    <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                                        Harga Utama
                                    </p>
                                    <p className="mt-2 text-xl font-semibold text-foreground">
                                        {editingPackage
                                            ? `${editingPackage.currency} ${editingPackage.price.toLocaleString('id-ID')}`
                                            : 'Akan dihitung otomatis'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {editingPackage
                                            ? 'Harga aktif yang tampil di public.'
                                            : 'Isi harga asli dan diskon di tab Harga.'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm">
                                    <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                                        Harga Coret
                                    </p>
                                    <p className="mt-2 text-xl font-semibold text-foreground">
                                        {editingPackage?.original_price
                                            ? `${editingPackage.currency} ${editingPackage.original_price.toLocaleString('id-ID')}`
                                            : 'Tidak ada'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {editingPackage?.original_price
                                            ? 'Muncul saat package punya diskon aktif.'
                                            : 'Kosong jika package tidak sedang promo.'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm">
                                    <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                                        Status Package
                                    </p>
                                    <p className="mt-2 text-xl font-semibold text-foreground">
                                        {editingPackage
                                            ? editingPackage.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'
                                            : 'Draft'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {editingPackage
                                            ? 'Status publish package saat ini.'
                                            : 'Simpan package jika data utama sudah siap.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-[linear-gradient(180deg,rgba(248,250,252,0.86),rgba(255,255,255,1))] px-6 py-6">
                            <div className="mx-auto max-w-4xl rounded-[2rem] border border-border/70 bg-card/96 p-5 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur">
                                <PackageForm
                                    pkg={editingPackage}
                                    productOptions={safeProductOptions}
                                    activityOptions={safeActivityOptions}
                                    locale={locale}
                                    onSuccess={() => setEditingPkg(null)}
                                />
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet
                open={schedulePkg !== null}
                onOpenChange={(open) => !open && setSchedulePkg(null)}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-xl"
                >
                    <SheetHeader className="pb-2">
                        <SheetTitle className="text-lg">
                            Jadwal:{' '}
                            {schedulePkg?.name?.[locale] || schedulePkg?.code}
                        </SheetTitle>
                        <SheetDescription>
                            Kelola jadwal keberangkatan untuk package ini.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-2 px-1">
                        {schedulePkg ? (
                            <SchedulePanel pkg={schedulePkg} />
                        ) : null}
                    </div>
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
