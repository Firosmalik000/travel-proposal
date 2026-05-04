import { Button } from '@/components/ui/button';
import {
    Calendar,
    Clock,
    MapPin,
    Package as PackageIcon,
    Pencil,
    Star,
    Trash2,
    Zap,
} from 'lucide-react';
import type { Package as PackageType } from './types';

type Props = {
    pkg: PackageType;
    locale: 'id' | 'en';
    onEdit: (pkg: PackageType) => void;
    onDelete: (pkg: PackageType) => void;
    onManageSchedules: (pkg: PackageType) => void;
    canEdit: boolean;
    canDelete: boolean;
};

const typeConfig: Record<
    string,
    { label: string; color: string; dot: string }
> = {
    reguler: {
        label: 'Reguler',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        dot: 'bg-blue-500',
    },
    hemat: {
        label: 'Hemat',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        dot: 'bg-green-500',
    },
    vip: {
        label: 'VIP',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        dot: 'bg-amber-500',
    },
    premium: {
        label: 'Premium',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        dot: 'bg-orange-500',
    },
    private: {
        label: 'Private',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        dot: 'bg-purple-500',
    },
};

export function PackageCard({
    pkg,
    locale,
    onEdit,
    onDelete,
    onManageSchedules,
    canEdit,
    canDelete,
}: Props) {
    const name = pkg.name?.[locale] || pkg.name?.id || pkg.code;
    const type = typeConfig[pkg.package_type] ?? typeConfig.reguler;
    const schedules = Array.isArray(pkg.schedules) ? pkg.schedules : [];
    const activeSchedules = schedules.filter(
        (schedule) => schedule.is_active && schedule.status === 'open',
    ).length;
    const nextDeparture = schedules
        .filter((schedule) => schedule.is_active && schedule.status === 'open')
        .sort((a, b) => a.departure_date.localeCompare(b.departure_date))[0];

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

            <div className="flex gap-0">
                <div className="relative hidden w-36 shrink-0 overflow-hidden sm:block lg:w-44">
                    <img
                        src={pkg.image_path || '/images/dummy.jpg'}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                    ★ Featured
                                </span>
                            ) : null}
                            <span className="ml-auto font-mono text-xs text-muted-foreground">
                                {pkg.code}
                            </span>
                        </div>

                        <h3 className="mt-1.5 truncate text-base font-bold text-foreground">
                            {name}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />{' '}
                                {pkg.departure_city}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />{' '}
                                {pkg.duration_days} hari
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <PackageIcon className="h-3 w-3" />{' '}
                                {pkg.product_ids.length} produk
                            </span>
                            {pkg.rating_avg ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                    <Star className="h-3 w-3 fill-current" />{' '}
                                    {pkg.rating_avg}{' '}
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
                            {nextDeparture ? (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                    <Calendar className="h-3 w-3" />
                                    Berangkat {
                                        nextDeparture.departure_date
                                    } • {nextDeparture.seats_available} seat
                                    tersisa
                                </p>
                            ) : (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {activeSchedules === 0
                                        ? 'Belum ada jadwal'
                                        : `${activeSchedules} jadwal open`}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 text-xs"
                                onClick={() => onManageSchedules(pkg)}
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Jadwal</span>
                                {activeSchedules > 0 ? (
                                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                        {activeSchedules}
                                    </span>
                                ) : null}
                            </Button>
                            {canEdit ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5 text-xs"
                                    onClick={() => onEdit(pkg)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">
                                        Edit
                                    </span>
                                </Button>
                            ) : null}
                            {canDelete ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => onDelete(pkg)}
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
