import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { router } from '@inertiajs/react';
import {
    Building2,
    CalendarRange,
    ChevronDown,
    ChevronUp,
    Pencil,
    Phone,
    Plus,
    Settings2,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type {
    CurrencyOption,
    PackageAllInConfiguration,
    PackageVendorOption,
    ProductCategoryOption,
    VendorPricePeriodOption,
} from './types';

type Props = {
    value: PackageAllInConfiguration;
    vendors: PackageVendorOption[];
    categories: ProductCategoryOption[];
    currencies: CurrencyOption[];
    packageStartDate: string;
    packageEndDate: string;
    errors?: Record<string, string>;
    onChange: (value: PackageAllInConfiguration) => void;
};

type VendorForm = {
    id: number | null;
    name: string;
    phone: string;
};

type PeriodForm = {
    id: number | null;
    vendor_id: number | null;
    label: string;
    start_date: string;
    end_date: string;
    currency: string;
    price_per_pax: string;
    notes: string;
    is_active: boolean;
};

const emptyVendorForm: VendorForm = {
    id: null,
    name: '',
    phone: '',
};

const emptyPeriodForm: PeriodForm = {
    id: null,
    vendor_id: null,
    label: '',
    start_date: '',
    end_date: '',
    currency: 'IDR',
    price_per_pax: '',
    notes: '',
    is_active: true,
};

function resolveCategoryName(category: ProductCategoryOption): string {
    if (typeof category.name === 'string') {
        return category.name;
    }

    return category.name.id || category.name.en || category.key;
}

function formatDate(value: string): string {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
}

function formatMoney(value: number, currency: string): string {
    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(value);
    } catch {
        return `${currency} ${value.toLocaleString('id-ID')}`;
    }
}

function periodCoversPackage(
    period: VendorPricePeriodOption,
    packageStartDate: string,
    packageEndDate: string,
): boolean {
    if (!packageStartDate || !packageEndDate) {
        return true;
    }

    return (
        period.start_date <= packageStartDate &&
        period.end_date >= packageEndDate
    );
}

export function AllInPackageCard({
    value,
    vendors,
    categories,
    currencies,
    packageStartDate,
    packageEndDate,
    errors = {},
    onChange,
}: Props) {
    const [managerOpen, setManagerOpen] = useState(false);
    const [vendorFormOpen, setVendorFormOpen] = useState(false);
    const [expandedVendorId, setExpandedVendorId] = useState<number | null>(
        null,
    );
    const [vendorForm, setVendorForm] = useState<VendorForm>(emptyVendorForm);
    const [periodForm, setPeriodForm] = useState<PeriodForm>(emptyPeriodForm);
    const [savingVendor, setSavingVendor] = useState(false);
    const [savingPeriod, setSavingPeriod] = useState(false);
    const activeVendors = vendors;
    const selectedVendor = vendors.find(
        (vendor) => vendor.id === value.vendor_id,
    );
    const availablePeriods = useMemo(
        () =>
            (selectedVendor?.periods ?? []).filter(
                (period) =>
                    (period.is_active || period.id === value.period_id) &&
                    (period.id === value.period_id ||
                        periodCoversPackage(
                            period,
                            packageStartDate,
                            packageEndDate,
                        )),
            ),
        [selectedVendor, value.period_id, packageStartDate, packageEndDate],
    );
    const selectedCurrency = currencies.find(
        (currency) => currency.code === value.currency,
    );
    const conversionRateToIdr =
        value.currency === 'IDR'
            ? 1
            : Number(
                  selectedCurrency?.live_conversion_rate ??
                      selectedCurrency?.conversion_rate ??
                      0,
              );
    const convertedPriceIdr =
        Number(value.price_per_pax ?? 0) > 0 && conversionRateToIdr > 0
            ? Number(value.price_per_pax) * conversionRateToIdr
            : null;

    function update(next: Partial<PackageAllInConfiguration>) {
        onChange({ ...value, ...next });
    }

    function selectVendor(vendorId: string) {
        update({
            vendor_id: Number(vendorId),
            period_id: null,
            currency: 'IDR',
            price_per_pax: null,
        });
    }

    function selectPeriod(periodId: string) {
        const period = selectedVendor?.periods.find(
            (item) => item.id === Number(periodId),
        );
        if (!period) {
            return;
        }

        update({
            period_id: period.id,
            currency: period.currency,
            price_per_pax: period.price_per_pax,
        });
    }

    function toggleCategory(categoryKey: string, checked: boolean) {
        const nextKeys = checked
            ? [...new Set([...value.included_category_keys, categoryKey])]
            : value.included_category_keys.filter((key) => key !== categoryKey);

        update({ included_category_keys: nextKeys });
    }

    function saveVendor() {
        if (!vendorForm.name.trim() || !vendorForm.phone.trim()) {
            toast.error('Nama dan nomor telepon vendor wajib diisi.');
            return;
        }

        setSavingVendor(true);
        const url = vendorForm.id
            ? `/admin/product-management/package-vendors/${vendorForm.id}`
            : '/admin/product-management/package-vendors';
        const options = {
            preserveScroll: true,
            preserveState: true,
            only: ['vendors'],
            onSuccess: () => {
                toast.success(
                    vendorForm.id
                        ? 'Vendor diperbarui.'
                        : 'Vendor ditambahkan.',
                );
                setVendorForm(emptyVendorForm);
                setVendorFormOpen(false);
            },
            onError: () => toast.error('Data vendor belum dapat disimpan.'),
            onFinish: () => setSavingVendor(false),
        };

        if (vendorForm.id) {
            router.put(url, vendorForm, options);
        } else {
            router.post(url, vendorForm, options);
        }
    }

    function editVendor(vendor: PackageVendorOption) {
        setVendorForm({
            id: vendor.id,
            name: vendor.name,
            phone: vendor.phone,
        });
        setVendorFormOpen(true);
    }

    function deleteVendor(vendor: PackageVendorOption) {
        if (!confirm(`Hapus vendor "${vendor.name}"?`)) {
            return;
        }

        router.delete(
            `/admin/product-management/package-vendors/${vendor.id}`,
            {
                preserveScroll: true,
                preserveState: true,
                only: ['vendors'],
                onSuccess: () => toast.success('Vendor dihapus.'),
                onError: () =>
                    toast.error(
                        'Vendor masih digunakan atau belum dapat dihapus.',
                    ),
            },
        );
    }

    function startPeriod(vendor: PackageVendorOption) {
        setPeriodForm({
            ...emptyPeriodForm,
            vendor_id: vendor.id,
            start_date: packageStartDate,
            end_date: packageEndDate,
        });
    }

    function editPeriod(
        vendor: PackageVendorOption,
        period: VendorPricePeriodOption,
    ) {
        setPeriodForm({
            id: period.id,
            vendor_id: vendor.id,
            label: period.label,
            start_date: period.start_date,
            end_date: period.end_date,
            currency: period.currency,
            price_per_pax: String(period.price_per_pax),
            notes: period.notes ?? '',
            is_active: period.is_active,
        });
    }

    function savePeriod() {
        if (!periodForm.vendor_id || !periodForm.label.trim()) {
            toast.error('Vendor dan nama periode wajib diisi.');
            return;
        }

        setSavingPeriod(true);
        const baseUrl = `/admin/product-management/package-vendors/${periodForm.vendor_id}/periods`;
        const url = periodForm.id ? `${baseUrl}/${periodForm.id}` : baseUrl;
        const options = {
            preserveScroll: true,
            preserveState: true,
            only: ['vendors'],
            onSuccess: () => {
                toast.success(
                    periodForm.id
                        ? 'Periode diperbarui.'
                        : 'Periode ditambahkan.',
                );
                setPeriodForm(emptyPeriodForm);
            },
            onError: () => toast.error('Periode harga belum dapat disimpan.'),
            onFinish: () => setSavingPeriod(false),
        };

        if (periodForm.id) {
            router.put(url, periodForm, options);
        } else {
            router.post(url, periodForm, options);
        }
    }

    function deletePeriod(
        vendor: PackageVendorOption,
        period: VendorPricePeriodOption,
    ) {
        if (!confirm(`Hapus periode "${period.label}"?`)) {
            return;
        }

        router.delete(
            `/admin/product-management/package-vendors/${vendor.id}/periods/${period.id}`,
            {
                preserveScroll: true,
                preserveState: true,
                only: ['vendors'],
                onSuccess: () => toast.success('Periode dihapus.'),
                onError: () =>
                    toast.error(
                        'Periode masih digunakan atau belum dapat dihapus.',
                    ),
            },
        );
    }

    return (
        <>
            <section className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                        <div className="rounded-xl bg-primary/10 p-2 text-primary">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <Label
                                htmlFor="all-in-package"
                                className="text-sm font-semibold"
                            >
                                Paket All In
                            </Label>
                            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                Produk pada kategori tersebut otomatis dikunci
                                agar HPP tidak dihitung dua kali.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setManagerOpen(true)}
                        >
                            <Settings2 className="mr-2 h-4 w-4" />
                            Kelola Vendor
                        </Button>
                        <Switch
                            id="all-in-package"
                            checked={value.enabled}
                            onCheckedChange={(enabled) => update({ enabled })}
                        />
                    </div>
                </div>

                {value.enabled ? (
                    <div className="mt-5 space-y-4 border-t border-border/60 pt-5">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Vendor *</Label>
                                <Select
                                    value={value.vendor_id?.toString() ?? ''}
                                    onValueChange={selectVendor}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeVendors.map((vendor) => (
                                            <SelectItem
                                                key={vendor.id}
                                                value={String(vendor.id)}
                                            >
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors['all_in.vendor_id'] ? (
                                    <p className="text-xs text-destructive">
                                        {errors['all_in.vendor_id']}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-2">
                                <Label>Periode &amp; harga *</Label>
                                <Select
                                    disabled={!selectedVendor}
                                    value={value.period_id?.toString() ?? ''}
                                    onValueChange={selectPeriod}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih periode yang sesuai" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availablePeriods.map((period) => (
                                            <SelectItem
                                                key={period.id}
                                                value={String(period.id)}
                                            >
                                                {period.label} (
                                                {formatDate(period.start_date)}{' '}
                                                - {formatDate(period.end_date)})
                                                -{' '}
                                                {formatMoney(
                                                    period.price_per_pax,
                                                    period.currency,
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors['all_in.period_id'] ? (
                                    <p className="text-xs text-destructive">
                                        {errors['all_in.period_id']}
                                    </p>
                                ) : null}
                                {selectedVendor &&
                                availablePeriods.length === 0 ? (
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Belum ada periode aktif yang mencakup
                                        tanggal {formatDate(packageStartDate)} -{' '}
                                        {formatDate(packageEndDate)}.
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-2">
                                <Label>Nama broker / paket *</Label>
                                <Input
                                    value={value.broker_package_name}
                                    onChange={(event) =>
                                        update({
                                            broker_package_name:
                                                event.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Paket Land Arrangement 10 Hari"
                                />
                                {errors['all_in.broker_package_name'] ? (
                                    <p className="text-xs text-destructive">
                                        {errors['all_in.broker_package_name']}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-2">
                                <Label>Mata uang *</Label>
                                <Select
                                    value={value.currency}
                                    onValueChange={(currency) =>
                                        update({ currency })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map((currency) => (
                                            <SelectItem
                                                key={currency.code}
                                                value={currency.code}
                                            >
                                                {currency.code} -{' '}
                                                {currency.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors['all_in.currency'] ? (
                                    <p className="text-xs text-destructive">
                                        {errors['all_in.currency']}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-2 md:col-span-1 xl:col-span-2">
                                <Label>Harga All In per jamaah *</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={value.price_per_pax ?? ''}
                                    onChange={(event) =>
                                        update({
                                            price_per_pax:
                                                event.target.value === ''
                                                    ? null
                                                    : Number(
                                                          event.target.value,
                                                      ),
                                        })
                                    }
                                    placeholder="0"
                                />
                                {errors['all_in.price_per_pax'] ? (
                                    <p className="text-xs text-destructive">
                                        {errors['all_in.price_per_pax']}
                                    </p>
                                ) : null}
                                {convertedPriceIdr !== null ? (
                                    <p className="text-xs text-muted-foreground">
                                        Estimasi converter:{' '}
                                        {formatMoney(convertedPriceIdr, 'IDR')}{' '}
                                        / jamaah
                                    </p>
                                ) : value.currency !== 'IDR' ? (
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Kurs {value.currency} ke IDR belum
                                        tersedia.
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label>Kategori yang termasuk All In *</Label>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Kategori terpilih tidak dapat dipilih lagi
                                    pada tab Produk.
                                </p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                {categories.map((category) => {
                                    const checked =
                                        value.included_category_keys.includes(
                                            category.key,
                                        );

                                    return (
                                        <label
                                            key={category.key}
                                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 text-sm"
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(next) =>
                                                    toggleCategory(
                                                        category.key,
                                                        Boolean(next),
                                                    )
                                                }
                                            />
                                            <span className="font-medium">
                                                {resolveCategoryName(category)}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors['all_in.included_category_keys'] ? (
                                <p className="text-xs text-destructive">
                                    {errors['all_in.included_category_keys']}
                                </p>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </section>

            <Dialog open={managerOpen} onOpenChange={setManagerOpen}>
                <DialogContent
                    overlayClassName="bg-black/30 backdrop-blur-sm"
                    className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] gap-0 overflow-hidden p-0 sm:max-h-[92vh] sm:w-[calc(100%-3rem)] sm:max-w-4xl"
                >
                    <DialogHeader className="border-b border-border/60 px-5 py-5 pr-12 sm:px-6">
                        <DialogTitle>
                            Kelola Vendor &amp; Periode Harga
                        </DialogTitle>
                        <DialogDescription>
                            Data ini menjadi master sementara untuk semua
                            package. Periode harga selalu terhubung ke satu
                            vendor.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Daftar vendor
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {vendors.length} vendor tersimpan
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    vendorFormOpen ? 'secondary' : 'default'
                                }
                                onClick={() => {
                                    if (vendorFormOpen) {
                                        setVendorForm(emptyVendorForm);
                                    }
                                    setVendorFormOpen((open) => !open);
                                }}
                            >
                                {vendorFormOpen ? (
                                    <ChevronUp className="mr-2 h-4 w-4" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                {vendorFormOpen
                                    ? 'Tutup Form'
                                    : 'Tambah Vendor'}
                            </Button>
                        </div>

                        {vendorFormOpen ? (
                            <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-semibold">
                                        {vendorForm.id
                                            ? 'Edit Vendor'
                                            : 'Vendor Baru'}
                                    </h3>
                                    {vendorForm.id ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setVendorForm(emptyVendorForm);
                                                setVendorFormOpen(false);
                                            }}
                                        >
                                            Batal
                                        </Button>
                                    ) : null}
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="vendor-name">
                                            Nama vendor *
                                        </Label>
                                        <Input
                                            id="vendor-name"
                                            className="h-11"
                                            value={vendorForm.name}
                                            onChange={(event) =>
                                                setVendorForm((current) => ({
                                                    ...current,
                                                    name: event.target.value,
                                                }))
                                            }
                                            placeholder="Contoh: Alreda International"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vendor-phone">
                                            Nomor telepon *
                                        </Label>
                                        <Input
                                            id="vendor-phone"
                                            className="h-11"
                                            inputMode="tel"
                                            value={vendorForm.phone}
                                            onChange={(event) =>
                                                setVendorForm((current) => ({
                                                    ...current,
                                                    phone: event.target.value,
                                                }))
                                            }
                                            placeholder="Contoh: +966 54 000 0000"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    className="w-full sm:w-auto"
                                    disabled={savingVendor}
                                    onClick={saveVendor}
                                >
                                    {vendorForm.id
                                        ? 'Simpan Vendor'
                                        : 'Tambah Vendor'}
                                </Button>
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            {vendors.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                    Belum ada vendor. Tambahkan vendor pertama
                                    melalui tombol di atas.
                                </div>
                            ) : (
                                vendors.map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        className="overflow-hidden rounded-xl border border-border/70 bg-background"
                                    >
                                        <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
                                            <button
                                                type="button"
                                                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                                onClick={() =>
                                                    setExpandedVendorId(
                                                        expandedVendorId ===
                                                            vendor.id
                                                            ? null
                                                            : vendor.id,
                                                    )
                                                }
                                            >
                                                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                                                    <Building2 className="h-4 w-4" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-semibold">
                                                        {vendor.name}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        {vendor.phone}
                                                        <span aria-hidden="true">
                                                            &bull;
                                                        </span>
                                                        {vendor.periods.length}{' '}
                                                        periode
                                                    </span>
                                                </span>
                                                {expandedVendorId ===
                                                vendor.id ? (
                                                    <ChevronUp className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                                                )}
                                            </button>
                                            <div className="flex shrink-0 gap-1">
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        editVendor(vendor)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Edit vendor
                                                    </span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        deleteVendor(vendor)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Hapus vendor
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>

                                        {expandedVendorId === vendor.id ? (
                                            <div className="border-t border-border/60 px-3 pb-3 sm:px-4 sm:pb-4">
                                                <div className="flex items-center justify-between gap-3 py-3">
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        Periode harga
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            startPeriod(vendor)
                                                        }
                                                    >
                                                        <Plus className="mr-1 h-3.5 w-3.5" />
                                                        Tambah Periode
                                                    </Button>
                                                </div>

                                                <div className="divide-y divide-border/60 rounded-lg bg-muted/25 px-3">
                                                    {vendor.periods.length ===
                                                    0 ? (
                                                        <p className="py-4 text-xs text-muted-foreground">
                                                            Belum ada periode
                                                            harga.
                                                        </p>
                                                    ) : (
                                                        vendor.periods.map(
                                                            (period) => (
                                                                <div
                                                                    key={
                                                                        period.id
                                                                    }
                                                                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                                                                >
                                                                    <div>
                                                                        <p className="text-sm font-medium">
                                                                            {
                                                                                period.label
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {formatDate(
                                                                                period.start_date,
                                                                            )}{' '}
                                                                            -{' '}
                                                                            {formatDate(
                                                                                period.end_date,
                                                                            )}{' '}
                                                                            |{' '}
                                                                            {formatMoney(
                                                                                period.price_per_pax,
                                                                                period.currency,
                                                                            )}{' '}
                                                                            /
                                                                            pax
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        <Button
                                                                            type="button"
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            onClick={() =>
                                                                                editPeriod(
                                                                                    vendor,
                                                                                    period,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="text-destructive"
                                                                            onClick={() =>
                                                                                deletePeriod(
                                                                                    vendor,
                                                                                    period,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                ))
                            )}
                        </div>

                        {periodForm.vendor_id ? (
                            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <CalendarRange className="h-4 w-4 text-primary" />
                                        <h3 className="font-semibold">
                                            {periodForm.id
                                                ? 'Edit Periode Harga'
                                                : 'Periode Harga Baru'}
                                        </h3>
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            setPeriodForm(emptyPeriodForm)
                                        }
                                    >
                                        Batal
                                    </Button>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="period-label">
                                            Nama periode *
                                        </Label>
                                        <Input
                                            id="period-label"
                                            className="h-11"
                                            value={periodForm.label}
                                            onChange={(event) =>
                                                setPeriodForm((current) => ({
                                                    ...current,
                                                    label: event.target.value,
                                                }))
                                            }
                                            placeholder="Contoh: Musim Umroh 1448 H"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="period-start">
                                            Tanggal mulai *
                                        </Label>
                                        <Input
                                            id="period-start"
                                            className="h-11"
                                            type="date"
                                            value={periodForm.start_date}
                                            onChange={(event) =>
                                                setPeriodForm((current) => ({
                                                    ...current,
                                                    start_date:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="period-end">
                                            Tanggal selesai *
                                        </Label>
                                        <Input
                                            id="period-end"
                                            className="h-11"
                                            type="date"
                                            min={
                                                periodForm.start_date ||
                                                undefined
                                            }
                                            value={periodForm.end_date}
                                            onChange={(event) =>
                                                setPeriodForm((current) => ({
                                                    ...current,
                                                    end_date:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mata uang *</Label>
                                        <Select
                                            value={periodForm.currency}
                                            onValueChange={(currency) =>
                                                setPeriodForm((current) => ({
                                                    ...current,
                                                    currency,
                                                }))
                                            }
                                        >
                                            <SelectTrigger className="h-11 w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currencies.map((currency) => (
                                                    <SelectItem
                                                        key={currency.code}
                                                        value={currency.code}
                                                    >
                                                        {currency.code} -{' '}
                                                        {currency.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="period-price">
                                            Harga per jamaah *
                                        </Label>
                                        <Input
                                            id="period-price"
                                            className="h-11"
                                            type="number"
                                            min={0}
                                            value={periodForm.price_per_pax}
                                            onChange={(event) =>
                                                setPeriodForm((current) => ({
                                                    ...current,
                                                    price_per_pax:
                                                        event.target.value,
                                                }))
                                            }
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                    <label className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            checked={periodForm.is_active}
                                            onCheckedChange={(checked) =>
                                                setPeriodForm((current) => ({
                                                    ...current,
                                                    is_active: Boolean(checked),
                                                }))
                                            }
                                        />
                                        Periode aktif
                                    </label>
                                    <Button
                                        type="button"
                                        disabled={savingPeriod}
                                        onClick={savePeriod}
                                    >
                                        Simpan Periode
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
