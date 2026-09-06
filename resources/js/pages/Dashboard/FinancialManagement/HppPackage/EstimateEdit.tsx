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
} from '@/pages/Dashboard/ProductManagement/Packages/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calculator } from 'lucide-react';
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
};

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
}: Props) {
    const indexHref = '/admin/financial-management/hpp-package';
    const currentHref = `${indexHref}/${packageData.id}/estimate/edit`;
    const title = `Edit Estimasi HPP ${resolvePackageName(packageData)}`;

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
