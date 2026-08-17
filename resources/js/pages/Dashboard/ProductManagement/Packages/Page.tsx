import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import packages from '@/routes/packages';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BedDouble,
    BookOpenText,
    Calculator,
    CalendarDays,
    CircleDollarSign,
    Layers,
    Pencil,
    Users,
} from 'lucide-react';
import { PackageForm } from './PackageForm';
import type {
    ActivityOption,
    CurrencyOption,
    Package,
    PackageVendorOption,
    ProductCategoryOption,
    ProductOption,
} from './types';

type PageMode = 'create' | 'edit' | 'detail';

type Props = {
    mode: PageMode;
    package: Package | null;
    productOptions: ProductOption[];
    currencies: CurrencyOption[];
    activityOptions: ActivityOption[];
    packageImageUploadMaxKilobytes: number;
    productCategories: ProductCategoryOption[];
    vendors: PackageVendorOption[];
};

function resolveText(
    value: { id?: string; en?: string } | string | null | undefined,
    fallback = '-',
): string {
    if (typeof value === 'string') {
        return value.trim() || fallback;
    }

    return value?.id?.trim() || value?.en?.trim() || fallback;
}

function formatDate(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
}

function formatMoney(value: number | null | undefined, currency = 'IDR') {
    if (value === null || value === undefined) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1 border-b border-border/60 py-3 last:border-b-0 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-5">
            <dt className="text-xs font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="text-sm font-semibold text-foreground">{value}</dd>
        </div>
    );
}

function PackageDetail({
    pkg,
    productOptions,
    productCategories,
}: {
    pkg: Package;
    productOptions: ProductOption[];
    productCategories: ProductCategoryOption[];
}) {
    const selectedProducts = productOptions.filter((product) =>
        pkg.product_ids.includes(product.id),
    );
    const hppEstimate = pkg.content.hpp_estimate;
    const roomOriginalPrices = pkg.content.room_original_prices ?? {};
    const roomPrices = pkg.content.room_prices ?? {};
    const pricingRows = [
        {
            label: 'Base / Single',
            original: pkg.original_price,
            selling: pkg.price,
        },
        {
            label: 'Double',
            original: roomOriginalPrices.dbl,
            selling: roomPrices.dbl,
        },
        {
            label: 'Triple',
            original: roomOriginalPrices.trpl,
            selling: roomPrices.trpl,
        },
        {
            label: 'Quad',
            original: roomOriginalPrices.quad,
            selling: roomPrices.quad,
        },
    ];
    const allInCategoryNames = pkg.all_in.included_category_keys
        .map((categoryKey) =>
            productCategories.find((category) => category.key === categoryKey),
        )
        .filter((category): category is ProductCategoryOption =>
            Boolean(category),
        )
        .map((category) => resolveText(category.name, category.key));

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                <div className="grid md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
                    <div className="aspect-[16/9] overflow-hidden bg-muted md:aspect-auto md:min-h-56">
                        <img
                            src={pkg.image_path || '/images/dummy.jpg'}
                            alt={resolveText(pkg.name, pkg.code)}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col justify-between gap-5 p-4 sm:p-5 lg:p-6">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary capitalize">
                                    {pkg.package_type}
                                </span>
                                <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>
                                <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground capitalize">
                                    Booking {pkg.booking_status}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                {resolveText(pkg.name, pkg.code)}
                            </h2>
                            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                                {resolveText(
                                    pkg.summary,
                                    'Belum ada ringkasan package.',
                                )}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm lg:grid-cols-4">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Berangkat
                                </p>
                                <p className="font-semibold">
                                    {formatDate(pkg.start_date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Kota
                                </p>
                                <p className="font-semibold">
                                    {pkg.departure_city}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Durasi
                                </p>
                                <p className="font-semibold">
                                    {pkg.duration_days} hari
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Seat
                                </p>
                                <p className="font-semibold">
                                    {pkg.seats_available} / {pkg.seats_total}{' '}
                                    tersedia
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    <TabsTrigger value="info" className="gap-1.5 text-xs">
                        <CalendarDays className="h-3.5 w-3.5" /> Info
                    </TabsTrigger>
                    <TabsTrigger value="produk" className="gap-1.5 text-xs">
                        <Layers className="h-3.5 w-3.5" /> Produk
                    </TabsTrigger>
                    <TabsTrigger value="itinerary" className="gap-1.5 text-xs">
                        <BookOpenText className="h-3.5 w-3.5" /> Itinerary
                    </TabsTrigger>
                    <TabsTrigger value="harga" className="gap-1.5 text-xs">
                        <CircleDollarSign className="h-3.5 w-3.5" /> Harga
                    </TabsTrigger>
                    <TabsTrigger value="hpp" className="gap-1.5 text-xs">
                        <Calculator className="h-3.5 w-3.5" /> Estimasi HPP
                    </TabsTrigger>
                </TabsList>

                <div className="mt-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5 lg:p-6">
                    <TabsContent value="info" className="mt-0">
                        <dl>
                            <DetailRow label="Kode" value={pkg.code} />
                            <DetailRow label="Slug" value={pkg.slug} />
                            <DetailRow
                                label="Periode"
                                value={`${formatDate(pkg.start_date)} - ${formatDate(pkg.end_date)}`}
                            />
                            <DetailRow
                                label="Kota keberangkatan"
                                value={pkg.departure_city}
                            />
                            <DetailRow
                                label="Kapasitas"
                                value={`${pkg.seats_total} seat, ${pkg.seats_available} tersedia`}
                            />
                            <DetailRow
                                label="Catatan keberangkatan"
                                value={pkg.departure_notes || '-'}
                            />
                            <DetailRow
                                label="Paket All In"
                                value={
                                    pkg.all_in.enabled
                                        ? `${pkg.all_in.vendor_name_snapshot || 'Vendor'} - ${pkg.all_in.broker_package_name}`
                                        : 'Tidak digunakan'
                                }
                            />
                        </dl>
                    </TabsContent>

                    <TabsContent value="harga" className="mt-0 space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {pricingRows.map(({ label, original, selling }) => (
                                <div
                                    key={String(label)}
                                    className="border-b border-border/60 py-3 sm:border-b-0 sm:border-l sm:py-1 sm:pl-4 first:sm:border-l-0 first:sm:pl-0"
                                >
                                    <p className="text-xs font-medium text-muted-foreground">
                                        {label}
                                    </p>
                                    <p className="mt-1 text-lg font-bold">
                                        {formatMoney(
                                            selling === null ||
                                                selling === undefined
                                                ? null
                                                : Number(selling),
                                            pkg.currency,
                                        )}
                                    </p>
                                    {original &&
                                    Number(original) !== Number(selling) ? (
                                        <p className="text-xs text-muted-foreground line-through">
                                            {formatMoney(
                                                Number(original),
                                                pkg.currency,
                                            )}
                                        </p>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="produk" className="mt-0">
                        {pkg.all_in.enabled ? (
                            <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 dark:border-sky-900 dark:bg-sky-950/30">
                                <p className="text-sm font-semibold text-sky-950 dark:text-sky-100">
                                    Ditanggung Paket All In Vendor
                                </p>
                                <p className="mt-1 text-xs text-sky-800 dark:text-sky-300">
                                    {pkg.all_in.vendor_name_snapshot ||
                                        'Vendor'}{' '}
                                    - {pkg.all_in.broker_package_name} -{' '}
                                    {allInCategoryNames.join(', ') ||
                                        'Kategori belum tersedia'}
                                </p>
                                <p className="mt-2 text-sm font-semibold text-sky-950 dark:text-sky-100">
                                    {formatMoney(
                                        pkg.all_in.price_per_pax,
                                        pkg.all_in.currency,
                                    )}{' '}
                                    / jamaah
                                </p>
                            </div>
                        ) : null}
                        {selectedProducts.length > 0 ? (
                            <div className="divide-y divide-border/60">
                                {selectedProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {resolveText(
                                                    product.name,
                                                    product.code,
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {product.product_type}
                                            </p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="font-semibold">
                                                x
                                                {pkg.product_multipliers[
                                                    String(product.id)
                                                ] ?? 1}{' '}
                                                / pax
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatMoney(
                                                    product.price ?? null,
                                                    product.currency ?? 'IDR',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Belum ada produk dipilih.
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent value="itinerary" className="mt-0">
                        {pkg.itineraries.length > 0 ? (
                            <div className="divide-y divide-border/60">
                                {pkg.itineraries.map((itinerary) => (
                                    <div
                                        key={itinerary.id}
                                        className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[80px_minmax(0,1fr)]"
                                    >
                                        <p className="text-xs font-bold text-primary">
                                            Hari {itinerary.day_number}
                                        </p>
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {resolveText(
                                                    itinerary.title,
                                                    `Hari ${itinerary.day_number}`,
                                                )}
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                                {resolveText(
                                                    itinerary.description,
                                                    'Belum ada deskripsi.',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Belum ada itinerary.
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent value="hpp" className="mt-0">
                        {hppEstimate ? (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Estimasi jamaah
                                        </p>
                                        <p className="mt-1 flex items-center gap-1.5 text-lg font-bold">
                                            <Users className="h-4 w-4" />
                                            {hppEstimate.customer_count ?? 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Produk
                                        </p>
                                        <p className="mt-1 text-lg font-bold">
                                            {formatMoney(
                                                hppEstimate.product_total ?? 0,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Hotel
                                        </p>
                                        <p className="mt-1 flex items-center gap-1.5 text-lg font-bold">
                                            <BedDouble className="h-4 w-4" />
                                            {formatMoney(
                                                hppEstimate.hotel_total ?? 0,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            HPP / jamaah
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-primary">
                                            {formatMoney(
                                                hppEstimate.hpp_per_customer ??
                                                    0,
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {hppEstimate.warnings?.length ? (
                                    <div className="border-t border-border/60 pt-4 text-sm text-amber-700 dark:text-amber-300">
                                        {hppEstimate.warnings.join(' ')}
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Estimasi HPP belum dihitung.
                            </p>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

export default function PackagePage({
    mode,
    package: packageData,
    productOptions,
    currencies,
    activityOptions,
    packageImageUploadMaxKilobytes,
    productCategories,
    vendors,
}: Props) {
    const { can } = usePermission('package');
    const isDetail = mode === 'detail';
    const title =
        mode === 'create'
            ? 'Tambah Package'
            : mode === 'edit'
              ? `Edit ${resolveText(packageData?.name, packageData?.code)}`
              : `Detail ${resolveText(packageData?.name, packageData?.code)}`;
    const createHref = '/admin/product-management/packages/create';
    const currentHref = packageData
        ? isDetail
            ? packages.show(packageData.id).url
            : packages.edit(packageData.id).url
        : createHref;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { label: 'Package Management', href: packages.index().url },
                { label: title, href: currentHref },
            ]}
        >
            <Head title={title} />

            <div className="mx-auto w-full max-w-[1600px] space-y-5 p-3 sm:p-4 md:p-6 xl:p-8">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            asChild
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                        >
                            <Link
                                href={packages.index().url}
                                aria-label="Kembali ke daftar package"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-muted-foreground">
                                Product Management / Package
                            </p>
                            <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                                {title}
                            </h1>
                        </div>
                    </div>
                    {isDetail && packageData && can('edit') ? (
                        <Button asChild>
                            <Link
                                href={`/admin/product-management/packages/${packageData.id}/edit`}
                            >
                                <Pencil className="mr-2 h-4 w-4" /> Edit Package
                            </Link>
                        </Button>
                    ) : null}
                </header>

                {isDetail && packageData ? (
                    <PackageDetail
                        pkg={packageData}
                        productOptions={productOptions}
                        productCategories={productCategories}
                    />
                ) : (
                    <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-4 md:p-5 xl:p-6">
                        <PackageForm
                            pkg={mode === 'edit' ? packageData : null}
                            productOptions={productOptions}
                            currencies={currencies}
                            activityOptions={activityOptions}
                            packageImageUploadMaxKilobytes={
                                packageImageUploadMaxKilobytes
                            }
                            productCategories={productCategories}
                            vendors={vendors}
                            locale="id"
                            onSuccess={() => router.visit(packages.index().url)}
                        />
                    </div>
                )}
            </div>
        </AppSidebarLayout>
    );
}
