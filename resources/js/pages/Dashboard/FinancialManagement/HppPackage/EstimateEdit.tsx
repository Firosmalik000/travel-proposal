import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import type {
    ActivityOption,
    CurrencyOption,
    HotelCityOption,
    HotelCountryOption,
    Package,
    PackageVendorOption,
    ProductCategoryOption,
    ProductOption,
    ProductPriceSnapshotStatus,
} from '@/pages/Dashboard/ProductManagement/Packages/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calculator, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { HppEstimateEditor } from './HppEstimateEditor';

type Props = {
    package: Package;
    productOptions: ProductOption[];
    currencies: CurrencyOption[];
    activityOptions: ActivityOption[];
    packageImageUploadMaxKilobytes: number;
    productCategories: ProductCategoryOption[];
    hotelCountries: HotelCountryOption[];
    hotelCities: HotelCityOption[];
    vendors: PackageVendorOption[];
    productPriceSnapshots: ProductPriceSnapshotStatus[];
};

const formatPrice = (value: number | null, currency: string) =>
    value === null
        ? '-'
        : new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency,
              maximumFractionDigits: 0,
          }).format(value);

function resolvePackageName(pkg: Package): string {
    if (typeof pkg.name === 'string') {
        return pkg.name.trim() || pkg.code;
    }

    return pkg.name?.id?.trim() || pkg.name?.en?.trim() || pkg.code;
}

export default function EstimateEdit({
    package: packageData,
    productOptions,
    currencies,
    activityOptions,
    packageImageUploadMaxKilobytes,
    productCategories,
    hotelCountries,
    hotelCities,
    vendors,
    productPriceSnapshots,
}: Props) {
    const indexHref = '/admin/financial-management/hpp-package';
    const currentHref = `${indexHref}/${packageData.id}/estimate/edit`;
    const title = `Edit Estimasi HPP ${resolvePackageName(packageData)}`;
    const [refreshingProductId, setRefreshingProductId] = useState<
        number | 'all' | null
    >(null);
    const staleSnapshots = productPriceSnapshots.filter(
        (snapshot) => snapshot.is_stale,
    );

    function refreshPrices(productId?: number) {
        setRefreshingProductId(productId ?? 'all');
        router.post(
            `${indexHref}/${packageData.id}/product-prices/refresh`,
            productId ? { product_ids: [productId] } : {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Harga acuan berhasil diperbarui.'),
                onError: () => toast.error('Harga acuan gagal diperbarui.'),
                onFinish: () => setRefreshingProductId(null),
            },
        );
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { label: 'HPP Package', href: indexHref },
                { label: title, href: currentHref },
            ]}
        >
            <Head title={title} />

            <div className="mx-auto w-full max-w-[1600px] space-y-5 p-3 sm:p-4 md:p-6 xl:p-8">
                <header className="flex items-center gap-3 border-b border-border/60 pb-4">
                    <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                    >
                        <Link
                            href={indexHref}
                            aria-label="Kembali ke HPP Package"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Calculator className="h-3.5 w-3.5" />
                            Financial Management / HPP Package
                        </p>
                        <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                            {title}
                        </h1>
                    </div>
                </header>

                <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/35 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Harga acuan produk
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {staleSnapshots.length > 0
                                    ? `${staleSnapshots.length} produk memiliki harga master terbaru.`
                                    : 'Semua estimasi memakai harga acuan terbaru.'}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant={
                                staleSnapshots.length > 0
                                    ? 'default'
                                    : 'outline'
                            }
                            disabled={
                                refreshingProductId !== null ||
                                productPriceSnapshots.length === 0
                            }
                            onClick={() => refreshPrices()}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${refreshingProductId === 'all' ? 'animate-spin' : ''}`}
                            />
                            Perbarui semua harga produk
                        </Button>
                    </div>

                    {staleSnapshots.length > 0 ? (
                        <div className="divide-y divide-border/60">
                            {staleSnapshots.map((snapshot) => (
                                <div
                                    key={snapshot.product_id}
                                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {snapshot.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {snapshot.product_type === 'hotel'
                                                ? 'Pricing kamar, broker, atau periode berubah'
                                                : `${formatPrice(snapshot.snapshot_price, snapshot.currency)} menjadi ${formatPrice(snapshot.current_price, snapshot.currency)}`}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={refreshingProductId !== null}
                                        onClick={() =>
                                            refreshPrices(snapshot.product_id)
                                        }
                                    >
                                        <RefreshCw
                                            className={`h-4 w-4 ${refreshingProductId === snapshot.product_id ? 'animate-spin' : ''}`}
                                        />
                                        Gunakan harga terbaru
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </section>

                <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:p-4 md:p-5 xl:p-6">
                    <HppEstimateEditor
                        package={packageData}
                        productOptions={productOptions}
                        currencies={currencies}
                        activityOptions={activityOptions}
                        packageImageUploadMaxKilobytes={
                            packageImageUploadMaxKilobytes
                        }
                        productCategories={productCategories}
                        hotelCountries={hotelCountries}
                        hotelCities={hotelCities}
                        vendors={vendors}
                        locale="id"
                        onSuccess={() => router.visit(indexHref)}
                    />
                </div>
            </div>
        </AppSidebarLayout>
    );
}
