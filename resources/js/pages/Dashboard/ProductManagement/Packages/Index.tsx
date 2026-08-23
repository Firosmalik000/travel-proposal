import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatDateTime } from '@/lib/date-format';
import packages from '@/routes/packages';
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarCheck,
    FileClock,
    Package2,
    Plus,
    Search,
    Tag,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PackageCard } from './PackageCard';
import type { Package, PackageDraftSummary } from './types';

type Props = {
    packages: Package[];
    packageDrafts: PackageDraftSummary[];
    createDraft: PackageDraftSummary | null;
};

function resolvePackageName(
    name: Package['name'],
    locale: 'id' | 'en',
    fallback: string,
): string {
    if (typeof name === 'string') {
        const trimmedName = name.trim();

        if (trimmedName === '') {
            return fallback;
        }

        try {
            const parsedName = JSON.parse(trimmedName) as Record<
                string,
                string
            > | null;

            if (parsedName && typeof parsedName === 'object') {
                return (
                    parsedName[locale] ||
                    parsedName.id ||
                    parsedName.en ||
                    fallback
                );
            }
        } catch {
            return trimmedName;
        }

        return trimmedName;
    }

    if (name && typeof name === 'object') {
        return name[locale] || name.id || name.en || fallback;
    }

    return fallback;
}

export default function PackagesIndex({
    packages: packageList,
    packageDrafts,
    createDraft,
}: Props) {
    const locale: 'id' | 'en' = 'id';
    const { can } = usePermission('package');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const safePackageList = Array.isArray(packageList) ? packageList : [];
    const [search, setSearch] = useState('');
    const [visibleCreateDraft, setVisibleCreateDraft] = useState(createDraft);
    const draftsByPackageId = new Map(
        packageDrafts.map((draft) => [draft.package_id, draft]),
    );

    const filtered = safePackageList.filter((pkg) => {
        const localizedName = resolvePackageName(pkg.name, locale, '');

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
                `Hapus package "${resolvePackageName(pkg.name, locale, pkg.code)}"?`,
            )
        ) {
            return;
        }

        router.delete(packages.destroy(pkg.id).url, {
            onSuccess: () => toast.success('Package dihapus.'),
            onError: () => toast.error('Gagal menghapus package.'),
        });
    }

    async function discardCreateDraft() {
        if (!confirm('Buang seluruh isian draft package baru ini?')) {
            return;
        }

        try {
            const response = await fetch(
                '/admin/product-management/packages/drafts/create',
                {
                    method: 'DELETE',
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector<HTMLMetaElement>(
                                    'meta[name="csrf-token"]',
                                )
                                ?.getAttribute('content') ?? '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (!response.ok) {
                throw new Error();
            }

            setVisibleCreateDraft(null);
            toast.success('Draft package baru dibuang.');
        } catch {
            toast.error('Draft package baru gagal dibuang.');
        }
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
            label: 'Pendaftaran Dibuka',
            value: safePackageList.filter(
                (pkg) => pkg.booking_status === 'open' && pkg.is_active,
            ).length,
            icon: CalendarCheck,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50 dark:bg-violet-950/40',
        },
    ];

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
                            <Button asChild size="default" className="shrink-0">
                                <Link href="/admin/product-management/packages/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Package
                                </Link>
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

                {visibleCreateDraft && canCreate ? (
                    <section className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-950 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-sky-900 dark:bg-sky-950/35 dark:text-sky-100">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">
                                <FileClock className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold">
                                    Package baru belum selesai
                                </p>
                                <p className="truncate text-sm text-sky-800 dark:text-sky-200">
                                    {visibleCreateDraft.name} · tersimpan{' '}
                                    {visibleCreateDraft.last_autosaved_at
                                        ? formatDateTime(
                                              visibleCreateDraft.last_autosaved_at,
                                          )
                                        : 'baru saja'}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void discardCreateDraft()}
                            >
                                Buang
                            </Button>
                            <Button asChild>
                                <Link href="/admin/product-management/packages/create">
                                    Lanjutkan Draft
                                </Link>
                            </Button>
                        </div>
                    </section>
                ) : null}

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
                                <Button asChild className="mt-4">
                                    <Link href="/admin/product-management/packages/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Package Pertama
                                    </Link>
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
                                onDelete={handleDelete}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                draft={draftsByPackageId.get(pkg.id) ?? null}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
