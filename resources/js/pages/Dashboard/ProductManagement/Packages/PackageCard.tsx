import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date-format';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    ExternalLink,
    Eye,
    FileClock,
    MapPin,
    Package as PackageIcon,
    Pencil,
    Star,
    Trash2,
    Zap,
} from 'lucide-react';
import type { PackageDraftSummary, Package as PackageType } from './types';

type Props = {
    pkg: PackageType;
    locale: 'id' | 'en';
    onDelete: (pkg: PackageType) => void;
    canEdit: boolean;
    canDelete: boolean;
    draft: PackageDraftSummary | null;
};

const typeConfig: Record<
    string,
    { label: string; color: string; dot: string }
> = {
    reguler: {
        label: 'Reguler',
        color: 'bg-muted text-foreground',
        dot: 'bg-primary',
    },
    hemat: {
        label: 'Hemat',
        color: 'bg-muted text-foreground',
        dot: 'bg-primary',
    },
    vip: {
        label: 'VIP',
        color: 'bg-muted text-foreground',
        dot: 'bg-primary',
    },
    premium: {
        label: 'Premium',
        color: 'bg-muted text-foreground',
        dot: 'bg-primary',
    },
    private: {
        label: 'Private',
        color: 'bg-muted text-foreground',
        dot: 'bg-primary',
    },
};

function resolvePackageName(
    name: PackageType['name'],
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

export function PackageCard({
    pkg,
    locale,
    onDelete,
    canEdit,
    canDelete,
    draft,
}: Props) {
    const name = resolvePackageName(pkg.name, locale, pkg.code);
    const type = typeConfig[pkg.package_type] ?? typeConfig.reguler;
    const landingPreviewPath = `/landing/${pkg.slug || pkg.id}`;

    return (
        <div
            className={[
                'group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200',
                'hover:-translate-y-0.5 hover:shadow-md',
                !pkg.is_active ? 'opacity-60' : '',
            ].join(' ')}
        >
            {pkg.original_price ? (
                <div className="absolute top-0 right-0 z-10">
                    <div className="flex items-center gap-1 rounded-bl-xl bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                        <Zap className="h-3 w-3" />
                        {pkg.discount_label || `HEMAT ${pkg.discount_percent}%`}
                    </div>
                </div>
            ) : null}

            <div className="flex items-stretch gap-0">
                <div className="relative hidden min-h-[180px] w-36 shrink-0 self-stretch overflow-hidden sm:block lg:w-44">
                    <img
                        src={pkg.image_path || '/images/dummy.jpg'}
                        alt={name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                    {!pkg.is_active ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                                Nonaktif
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${type.color}`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${type.dot}`}
                                />
                                {type.label}
                            </span>
                            {pkg.is_featured ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
                                    Featured
                                </span>
                            ) : null}
                            {draft ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                    <FileClock className="h-3 w-3" />
                                    Draft perubahan
                                </span>
                            ) : null}
                        </div>

                        <h3 className="mt-1.5 truncate text-base font-bold text-foreground">
                            {name}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {pkg.departure_city}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {pkg.duration_days} hari
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <PackageIcon className="h-3 w-3" />
                                {pkg.product_ids.length} produk
                            </span>
                            {pkg.rating_avg ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                    <Star className="h-3 w-3 fill-current" />
                                    {pkg.rating_avg}
                                    <span className="font-normal text-muted-foreground">
                                        ({pkg.rating_count})
                                    </span>
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-extrabold text-primary">
                                    {pkg.currency}{' '}
                                    {pkg.price.toLocaleString('id-ID')}
                                </span>
                                {pkg.original_price ? (
                                    <span className="text-sm text-muted-foreground line-through">
                                        {pkg.original_price.toLocaleString(
                                            'id-ID',
                                        )}
                                    </span>
                                ) : null}
                            </div>
                            {pkg.start_date ? (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    <Calendar className="h-3 w-3" />
                                    Berangkat {formatDate(
                                        pkg.start_date,
                                    )} - {pkg.seats_available} seat tersisa
                                </p>
                            ) : (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Tanggal keberangkatan belum diisi
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 border-emerald-200 bg-emerald-50 text-xs text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                                title="Buka landing promo paket"
                            >
                                <a
                                    href={landingPreviewPath}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">
                                        Landing
                                    </span>
                                </a>
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 text-xs"
                                title="Detail"
                            >
                                <Link
                                    href={`/admin/product-management/packages/${pkg.id}`}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">
                                        Detail
                                    </span>
                                </Link>
                            </Button>
                            {canEdit ? (
                                <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5 text-xs"
                                    title="Edit"
                                >
                                    <Link
                                        href={`/admin/product-management/packages/${pkg.id}/edit`}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">
                                            Edit
                                        </span>
                                    </Link>
                                </Button>
                            ) : null}
                            {canDelete ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => onDelete(pkg)}
                                    title="Hapus"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
