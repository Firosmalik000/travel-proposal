import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import packages from '@/routes/packages';
import { Head, router } from '@inertiajs/react';
import {
    CalendarCheck,
    Package2,
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
import type {
    ActivityOption,
    CurrencyOption,
    Package,
    ProductOption,
} from './types';

type Props = {
    packages: Package[];
    productOptions: ProductOption[];
    currencies: CurrencyOption[];
    activityOptions: ActivityOption[];
    packageImageUploadMaxKilobytes: number;
};

export default function PackagesIndex({
    packages: packageList,
    productOptions,
    currencies,
    activityOptions,
    packageImageUploadMaxKilobytes,
}: Props) {
    const locale: 'id' | 'en' = 'id';
    const { can } = usePermission('package');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const safePackageList = Array.isArray(packageList) ? packageList : [];
    const safeProductOptions = Array.isArray(productOptions)
        ? productOptions
        : [];
    const safeCurrencies = Array.isArray(currencies) ? currencies : [];
    const safeActivityOptions = Array.isArray(activityOptions)
        ? activityOptions
        : [];
    const [search, setSearch] = useState('');
    const [editingPkg, setEditingPkg] = useState<Package | null | 'new'>(null);
    const [viewingPkg, setViewingPkg] = useState<Package | null>(null);
    const [schedulePkgId, setSchedulePkgId] = useState<number | null>(null);

    const filtered = safePackageList.filter((pkg) => {
        const localizedName =
            typeof pkg.name === 'string'
                ? pkg.name
                : pkg.name?.[locale] || pkg.name?.id || '';

        return (
            localizedName.toLowerCase().includes(search.toLowerCase()) ||
            pkg.code.toLowerCase().includes(search.toLowerCase()) ||
            pkg.departure_city.toLowerCase().includes(search.toLowerCase())
        );
    });

    function handleDelete(pkg: Package) {
        if (!canDelete) {
            return;
        }

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
    const schedulePkg =
        safePackageList.find((pkg) => pkg.id === schedulePkgId) ?? null;
    const editingPackageName = editingPackage
        ? editingPackage.name?.[locale] ||
          editingPackage.name?.id ||
          editingPackage.code
        : null;
    function openCreatePackage(): void {
        if (!canCreate) {
            return;
        }

        setEditingPkg('new');
    }

    function openEditPackage(pkg: Package): void {
        if (!canEdit) {
            return;
        }

        setEditingPkg(pkg);
    }

    function openViewPackage(pkg: Package): void {
        setViewingPkg(pkg);
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { label: 'Package Management', href: packages.index().url },
            ]}
        >
            <Head title="Package Management" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm md:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Package Management
                        </h1>
                        {canCreate ? (
                            <Button
                                size="default"
                                onClick={openCreatePackage}
                                className="shrink-0"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Package
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-border/60 bg-card p-4 shadow-sm"
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

                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="relative w-full max-w-md">
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
                </div>

                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-background py-20 text-center">
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
                            canCreate ? (
                                <Button
                                    className="mt-4"
                                    onClick={openCreatePackage}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Package Pertama
                                </Button>
                            ) : null
                        ) : null}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((pkg) => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                locale={locale}
                                onView={openViewPackage}
                                onEdit={openEditPackage}
                                onDelete={handleDelete}
                                onManageSchedules={(selectedPackage) =>
                                    setSchedulePkgId(selectedPackage.id)
                                }
                                canEdit={canEdit}
                                canDelete={canDelete}
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
                    className="w-full bg-background sm:max-w-4xl"
                >
                    <SheetHeader>
                        <SheetTitle className="text-xl">
                            {editingPkg === 'new'
                                ? 'Tambah Package Baru'
                                : editingPackageName}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <PackageForm
                            pkg={editingPackage}
                            productOptions={safeProductOptions}
                            currencies={safeCurrencies}
                            activityOptions={safeActivityOptions}
                            packageImageUploadMaxKilobytes={
                                packageImageUploadMaxKilobytes
                            }
                            locale={locale}
                            onSuccess={() => setEditingPkg(null)}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <Sheet
                open={viewingPkg !== null}
                onOpenChange={(open) => !open && setViewingPkg(null)}
            >
                <SheetContent
                    side="right"
                    className="w-full bg-background sm:max-w-2xl"
                >
                    <SheetHeader>
                        <SheetTitle className="text-lg">
                            Detail Package:{' '}
                            {viewingPkg?.name?.[locale] || viewingPkg?.code}
                        </SheetTitle>
                    </SheetHeader>
                    {viewingPkg ? (
                        <div className="space-y-4 overflow-y-auto px-6 py-5 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Kode
                                    </p>
                                    <p className="font-semibold">
                                        {viewingPkg.code}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Tipe
                                    </p>
                                    <p className="font-semibold capitalize">
                                        {viewingPkg.package_type}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Durasi
                                    </p>
                                    <p className="font-semibold">
                                        {viewingPkg.duration_days} hari
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground">
                                        Kota Keberangkatan
                                    </p>
                                    <p className="font-semibold">
                                        {viewingPkg.departure_city}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">
                                    Ringkasan
                                </p>
                                <p className="mt-1">
                                    {viewingPkg.summary?.[locale] ||
                                        viewingPkg.summary?.id ||
                                        '-'}
                                </p>
                            </div>

                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">
                                    Itinerary
                                </p>
                                <p className="mt-1 font-semibold">
                                    {viewingPkg.itineraries?.length ?? 0} hari
                                    itinerary
                                </p>
                            </div>
                        </div>
                    ) : null}
                </SheetContent>
            </Sheet>

            <Sheet
                open={schedulePkg !== null}
                onOpenChange={(open) => !open && setSchedulePkgId(null)}
            >
                <SheetContent
                    side="right"
                    className="w-full bg-background sm:max-w-xl"
                >
                    <SheetHeader>
                        <SheetTitle className="text-lg">
                            Jadwal:{' '}
                            {schedulePkg?.name?.[locale] || schedulePkg?.code}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        {schedulePkg ? (
                            <SchedulePanel pkg={schedulePkg} />
                        ) : null}
                    </div>
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
