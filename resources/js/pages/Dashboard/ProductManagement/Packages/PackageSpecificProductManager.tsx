import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type {
    CurrencyOption,
    HotelCityOption,
    HotelCountryOption,
    PackageSpecificProduct,
    PackageSpecificProductPricing,
    ProductCategoryOption,
} from './types';

type Props = {
    value: PackageSpecificProduct[];
    categories: ProductCategoryOption[];
    currencies: CurrencyOption[];
    hotelCountries: HotelCountryOption[];
    hotelCities: HotelCityOption[];
    packageStartDate: string;
    packageEndDate: string;
    activeCategoryKey: string;
    lockedCategoryKeys: string[];
    hotelBrokerSelections: Record<string, string>;
    errors: Record<string, string>;
    onChange: (
        products: PackageSpecificProduct[],
        hotelBrokerSelections: Record<string, string>,
    ) => void;
};

let temporaryEstimateId = -1;

function categoryName(category: ProductCategoryOption): string {
    if (typeof category.name === 'string') {
        return category.name;
    }

    return category.name.id || category.name.en || category.key;
}

function money(value: number | null, currency: string): string {
    if (value === null || !Number.isFinite(value)) {
        return '-';
    }

    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(value);
    } catch {
        return `${currency} ${new Intl.NumberFormat('id-ID').format(value)}`;
    }
}

function emptyPricing(
    startDate: string,
    endDate: string,
): PackageSpecificProductPricing {
    return {
        broker_name: 'Broker 1',
        room_type: 'DBL',
        period_start: startDate,
        period_end: endDate,
        price: 0,
    };
}

type HotelPricingSession = {
    broker_name: string;
    period_start: string;
    period_end: string;
    dbl_price: number;
    trpl_price: number;
    quad_price: number;
};

function groupPricingSessions(
    pricing: PackageSpecificProductPricing[],
): HotelPricingSession[] {
    const sessions = new Map<string, HotelPricingSession>();

    pricing.forEach((row) => {
        const key = `${row.broker_name.trim()}|${row.period_start}|${row.period_end}`;
        const session = sessions.get(key) ?? {
            broker_name: row.broker_name,
            period_start: row.period_start,
            period_end: row.period_end,
            dbl_price: 0,
            trpl_price: 0,
            quad_price: 0,
        };

        if (row.room_type === 'DBL') {
            session.dbl_price = Number(row.price) || 0;
        } else if (row.room_type === 'TRPL') {
            session.trpl_price = Number(row.price) || 0;
        } else {
            session.quad_price = Number(row.price) || 0;
        }

        sessions.set(key, session);
    });

    return [...sessions.values()];
}

function flattenPricingSessions(
    sessions: HotelPricingSession[],
): PackageSpecificProductPricing[] {
    return sessions.flatMap((session) =>
        (
            [
                ['DBL', session.dbl_price],
                ['TRPL', session.trpl_price],
                ['QUAD', session.quad_price],
            ] as const
        ).map(([roomType, price]) => ({
            broker_name: session.broker_name,
            room_type: roomType,
            period_start: session.period_start,
            period_end: session.period_end,
            price,
        })),
    );
}

function emptyPricingSession(
    startDate: string,
    endDate: string,
    brokerName = 'Broker 1',
): HotelPricingSession {
    return {
        broker_name: brokerName,
        period_start: startDate,
        period_end: endDate,
        dbl_price: 0,
        trpl_price: 0,
        quad_price: 0,
    };
}

function emptyProduct(
    categoryKey: string,
    startDate: string,
    endDate: string,
): PackageSpecificProduct {
    const estimateId = temporaryEstimateId--;

    return {
        id: null,
        client_key: `new-${Date.now()}-${Math.abs(estimateId)}`,
        estimate_id: estimateId,
        name: '',
        product_type: categoryKey,
        description: '',
        currency: 'IDR',
        price: 0,
        multiplier_per_pax: 1,
        country_id: null,
        city_id: null,
        country: '',
        city: '',
        pricing:
            categoryKey === 'hotel' ? [emptyPricing(startDate, endDate)] : [],
    };
}

export function PackageSpecificProductManager({
    value,
    categories,
    currencies,
    hotelCountries,
    hotelCities,
    packageStartDate,
    packageEndDate,
    activeCategoryKey,
    lockedCategoryKeys,
    hotelBrokerSelections,
    errors,
    onChange,
}: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [draft, setDraft] = useState<PackageSpecificProduct | null>(null);
    const activeCategory =
        categories.find((category) => category.key === activeCategoryKey) ??
        categories[0];
    const resolvedActiveCategoryKey = activeCategory?.key ?? '';
    const activeCategoryLabel = activeCategory
        ? categoryName(activeCategory)
        : 'Produk';
    const isActiveCategoryLocked = lockedCategoryKeys.includes(
        resolvedActiveCategoryKey,
    );
    const visibleProducts = value.filter(
        (product) => product.product_type === resolvedActiveCategoryKey,
    );
    const categoryMap = useMemo(
        () =>
            Object.fromEntries(
                categories.map((category) => [
                    category.key,
                    categoryName(category),
                ]),
            ),
        [categories],
    );
    const customProductError = Object.entries(errors).find(([key]) =>
        key.startsWith('custom_products'),
    )?.[1];
    const availableHotelCities = draft?.country_id
        ? hotelCities.filter((city) => city.country_id === draft.country_id)
        : [];

    function openCreate() {
        const categoryKey = resolvedActiveCategoryKey;

        if (!categoryKey) {
            toast.error('Kategori produk belum tersedia.');
            return;
        }

        if (isActiveCategoryLocked) {
            toast.error(
                `Kategori ${activeCategoryLabel} sedang ditanggung oleh Paket All In.`,
            );
            return;
        }

        setDraft(emptyProduct(categoryKey, packageStartDate, packageEndDate));
        setDialogOpen(true);
    }

    function openEdit(product: PackageSpecificProduct) {
        const inferredCountry = product.country_id
            ? hotelCountries.find(
                  (country) => country.id === product.country_id,
              )
            : hotelCountries.find(
                  (country) =>
                      country.name.toLocaleLowerCase('id-ID') ===
                      product.country.toLocaleLowerCase('id-ID'),
              );
        const inferredCity = product.city_id
            ? hotelCities.find((city) => city.id === product.city_id)
            : hotelCities.find(
                  (city) =>
                      city.country_id === inferredCountry?.id &&
                      city.name.toLocaleLowerCase('id-ID') ===
                          product.city.toLocaleLowerCase('id-ID'),
              );

        setDraft({
            ...product,
            country_id: inferredCountry?.id ?? null,
            city_id: inferredCity?.id ?? null,
            country: inferredCountry?.name ?? product.country,
            city: inferredCity?.name ?? product.city,
            pricing: product.pricing.map((pricing) => ({ ...pricing })),
        });
        setDialogOpen(true);
    }

    function closeDialog() {
        setDialogOpen(false);
        setDraft(null);
    }

    function updateDraft<K extends keyof PackageSpecificProduct>(
        key: K,
        nextValue: PackageSpecificProduct[K],
    ) {
        setDraft((current) =>
            current ? { ...current, [key]: nextValue } : current,
        );
    }

    function updatePricingSession(
        index: number,
        nextSession: HotelPricingSession,
    ) {
        if (!draft) {
            return;
        }

        updateDraft(
            'pricing',
            flattenPricingSessions(
                groupPricingSessions(draft.pricing).map(
                    (session, sessionIndex) =>
                        sessionIndex === index ? nextSession : session,
                ),
            ),
        );
    }

    function addPricingSession(useNewBroker: boolean) {
        if (!draft) {
            return;
        }

        const sessions = groupPricingSessions(draft.pricing);
        const brokerName = useNewBroker
            ? `Broker ${new Set(sessions.map((item) => item.broker_name)).size + 1}`
            : (sessions.at(-1)?.broker_name ?? 'Broker 1');

        updateDraft(
            'pricing',
            flattenPricingSessions([
                ...sessions,
                emptyPricingSession(
                    packageStartDate,
                    packageEndDate,
                    brokerName,
                ),
            ]),
        );
    }

    function removePricingSession(index: number) {
        if (!draft) {
            return;
        }

        updateDraft(
            'pricing',
            flattenPricingSessions(
                groupPricingSessions(draft.pricing).filter(
                    (_, sessionIndex) => sessionIndex !== index,
                ),
            ),
        );
    }

    function saveDraft() {
        if (!draft) {
            return;
        }

        if (!draft.name.trim()) {
            toast.error('Nama produk khusus wajib diisi.');
            return;
        }

        if (lockedCategoryKeys.includes(draft.product_type)) {
            toast.error('Kategori ini sedang ditanggung oleh Paket All In.');
            return;
        }

        if (draft.product_type === 'hotel') {
            if (!draft.country_id || !draft.city_id) {
                toast.error('Negara dan kota hotel wajib dipilih.');
                return;
            }

            const invalidPricing =
                draft.pricing.length === 0 ||
                draft.pricing.some(
                    (pricing) =>
                        !pricing.broker_name.trim() ||
                        !pricing.period_start ||
                        !pricing.period_end ||
                        pricing.period_end < pricing.period_start ||
                        Number(pricing.price) < 0,
                );

            if (invalidPricing) {
                toast.error(
                    'Lengkapi broker, periode, tipe kamar, dan harga hotel.',
                );
                return;
            }

            const pricingKeys = draft.pricing.map((pricing) =>
                [
                    pricing.broker_name.trim().toLocaleLowerCase('id-ID'),
                    pricing.room_type,
                    pricing.period_start,
                    pricing.period_end,
                ].join('|'),
            );
            if (new Set(pricingKeys).size !== pricingKeys.length) {
                toast.error(
                    'Broker, session, dan tipe kamar tidak boleh duplikat.',
                );
                return;
            }
        } else if (draft.price === null || Number(draft.price) < 0) {
            toast.error('Harga produk khusus wajib diisi.');
            return;
        }

        const normalizedDraft: PackageSpecificProduct = {
            ...draft,
            name: draft.name.trim(),
            description: draft.description.trim(),
            currency: draft.currency.toUpperCase(),
            multiplier_per_pax: Math.max(
                1,
                Math.floor(Number(draft.multiplier_per_pax) || 1),
            ),
            price: draft.product_type === 'hotel' ? null : Number(draft.price),
            country_id:
                draft.product_type === 'hotel' ? draft.country_id : null,
            city_id: draft.product_type === 'hotel' ? draft.city_id : null,
            country:
                draft.product_type === 'hotel'
                    ? (hotelCountries.find(
                          (country) => country.id === draft.country_id,
                      )?.name ?? '')
                    : '',
            city:
                draft.product_type === 'hotel'
                    ? (hotelCities.find((city) => city.id === draft.city_id)
                          ?.name ?? '')
                    : '',
            pricing:
                draft.product_type === 'hotel'
                    ? flattenPricingSessions(
                          groupPricingSessions(draft.pricing),
                      )
                    : [],
        };
        const nextProducts = value.some(
            (product) => product.client_key === normalizedDraft.client_key,
        )
            ? value.map((product) =>
                  product.client_key === normalizedDraft.client_key
                      ? normalizedDraft
                      : product,
              )
            : [...value, normalizedDraft];
        const nextBrokerSelections = { ...hotelBrokerSelections };
        const productKey = String(normalizedDraft.estimate_id);

        if (normalizedDraft.product_type === 'hotel') {
            const brokerNames = [
                ...new Set(
                    normalizedDraft.pricing
                        .map((pricing) => pricing.broker_name.trim())
                        .filter(Boolean),
                ),
            ];

            if (!brokerNames.includes(nextBrokerSelections[productKey] ?? '')) {
                nextBrokerSelections[productKey] = brokerNames[0] ?? '';
            }
        } else {
            delete nextBrokerSelections[productKey];
        }

        onChange(nextProducts, nextBrokerSelections);
        closeDialog();
        toast.success(
            normalizedDraft.id
                ? 'Produk khusus diperbarui.'
                : 'Produk khusus ditambahkan.',
        );
    }

    function removeProduct(product: PackageSpecificProduct) {
        if (
            !window.confirm(
                `Hapus ${product.name} dari produk khusus package ini?`,
            )
        ) {
            return;
        }

        const nextBrokerSelections = { ...hotelBrokerSelections };
        delete nextBrokerSelections[String(product.estimate_id)];
        onChange(
            value.filter((item) => item.client_key !== product.client_key),
            nextBrokerSelections,
        );
    }

    function setHotelBroker(
        product: PackageSpecificProduct,
        brokerName: string,
    ) {
        onChange(value, {
            ...hotelBrokerSelections,
            [String(product.estimate_id)]: brokerName,
        });
    }

    return (
        <section className="border-t border-border/70 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">
                        Produk Khusus {activeCategoryLabel}
                    </h3>
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={openCreate}
                    disabled={!activeCategory || isActiveCategoryLocked}
                >
                    <Plus className="h-4 w-4" /> Tambah {activeCategoryLabel}
                </Button>
            </div>

            {isActiveCategoryLocked ? (
                <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
                    Kategori {activeCategoryLabel} sudah ditanggung vendor
                    melalui Paket All In.
                </div>
            ) : null}

            {customProductError ? (
                <p className="mt-3 text-sm text-destructive">
                    {customProductError}
                </p>
            ) : null}

            {visibleProducts.length > 0 ? (
                <div className="mt-4 divide-y divide-border/70 rounded-xl border border-border/70">
                    {visibleProducts.map((product) => {
                        const brokerNames = [
                            ...new Set(
                                product.pricing
                                    .map((pricing) => pricing.broker_name)
                                    .filter(Boolean),
                            ),
                        ];

                        return (
                            <div
                                key={product.client_key}
                                className="grid gap-3 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-semibold">
                                            {product.name}
                                        </p>
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                            Khusus package
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {categoryMap[product.product_type] ??
                                            product.product_type}
                                        {' · '}
                                        {product.product_type === 'hotel'
                                            ? `${product.city}, ${product.country}`
                                            : money(
                                                  product.price,
                                                  product.currency,
                                              )}
                                        {' · '}x{product.multiplier_per_pax} /
                                        pax
                                    </p>
                                    {product.product_type === 'hotel' &&
                                    brokerNames.length > 0 ? (
                                        <div className="mt-2 max-w-60">
                                            <Select
                                                value={
                                                    hotelBrokerSelections[
                                                        String(
                                                            product.estimate_id,
                                                        )
                                                    ] ?? brokerNames[0]
                                                }
                                                onValueChange={(brokerName) =>
                                                    setHotelBroker(
                                                        product,
                                                        brokerName,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Pilih broker" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brokerNames.map(
                                                        (brokerName) => (
                                                            <SelectItem
                                                                key={brokerName}
                                                                value={
                                                                    brokerName
                                                                }
                                                            >
                                                                {brokerName}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-1 sm:justify-end">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        aria-label={`Edit ${product.name}`}
                                        onClick={() => openEdit(product)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        aria-label={`Hapus ${product.name}`}
                                        onClick={() => removeProduct(product)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border/80 px-4 py-5 text-sm text-muted-foreground">
                    <Building2 className="h-5 w-5 shrink-0" />
                    Belum ada produk khusus {activeCategoryLabel.toLowerCase()}{' '}
                    untuk package ini.
                </div>
            )}

            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-5xl">
                    <DialogHeader className="border-b bg-muted/25 px-5 py-4 pr-12 text-left sm:px-6">
                        <DialogTitle>
                            {draft?.id
                                ? 'Edit Produk Khusus'
                                : 'Tambah Produk Khusus'}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Produk ini hanya dapat digunakan oleh package yang
                            sedang dibuat atau diedit.
                        </DialogDescription>
                    </DialogHeader>

                    {draft ? (
                        <div className="grid max-h-[calc(92vh-9rem)] gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-6">
                            <div className="grid gap-2 sm:col-span-2">
                                <Label>Nama Produk</Label>
                                <Input
                                    value={draft.name}
                                    onChange={(event) =>
                                        updateDraft('name', event.target.value)
                                    }
                                    placeholder="Contoh: Tiket Kereta Cepat Haramain"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Kategori</Label>
                                <div className="flex h-10 items-center rounded-md border border-input bg-muted/35 px-3 text-sm font-medium text-foreground">
                                    {categoryMap[draft.product_type] ??
                                        draft.product_type}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Mata Uang</Label>
                                <Select
                                    value={draft.currency}
                                    onValueChange={(currency) =>
                                        updateDraft('currency', currency)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih mata uang" />
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

                            {draft.product_type === 'hotel' ? (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Negara</Label>
                                        <Select
                                            value={
                                                draft.country_id
                                                    ? String(draft.country_id)
                                                    : undefined
                                            }
                                            onValueChange={(countryId) => {
                                                const nextCountryId =
                                                    Number(countryId);
                                                const country =
                                                    hotelCountries.find(
                                                        (item) =>
                                                            item.id ===
                                                            nextCountryId,
                                                    );
                                                updateDraft(
                                                    'country_id',
                                                    nextCountryId,
                                                );
                                                updateDraft('city_id', null);
                                                updateDraft(
                                                    'country',
                                                    country?.name ?? '',
                                                );
                                                updateDraft('city', '');
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih negara" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hotelCountries.map(
                                                    (country) => (
                                                        <SelectItem
                                                            key={country.id}
                                                            value={String(
                                                                country.id,
                                                            )}
                                                        >
                                                            {country.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Kota</Label>
                                        <Select
                                            value={
                                                draft.city_id
                                                    ? String(draft.city_id)
                                                    : undefined
                                            }
                                            disabled={!draft.country_id}
                                            onValueChange={(cityId) => {
                                                const nextCityId =
                                                    Number(cityId);
                                                const city = hotelCities.find(
                                                    (item) =>
                                                        item.id === nextCityId,
                                                );
                                                updateDraft(
                                                    'city_id',
                                                    nextCityId,
                                                );
                                                updateDraft(
                                                    'city',
                                                    city?.name ?? '',
                                                );
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kota" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableHotelCities.map(
                                                    (city) => (
                                                        <SelectItem
                                                            key={city.id}
                                                            value={String(
                                                                city.id,
                                                            )}
                                                        >
                                                            {city.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            ) : (
                                <div className="grid gap-2">
                                    <Label>Harga Satuan</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={draft.price ?? ''}
                                        onChange={(event) =>
                                            updateDraft(
                                                'price',
                                                Number(event.target.value),
                                            )
                                        }
                                    />
                                </div>
                            )}

                            <div
                                className={cn(
                                    'grid gap-2',
                                    draft.product_type !== 'hotel' &&
                                        'sm:col-start-2',
                                )}
                            >
                                <Label>
                                    {draft.product_type === 'hotel'
                                        ? 'Jumlah Malam / Pax'
                                        : 'Jumlah / Pax'}
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={draft.multiplier_per_pax}
                                    onChange={(event) =>
                                        updateDraft(
                                            'multiplier_per_pax',
                                            Number(event.target.value),
                                        )
                                    }
                                />
                            </div>

                            <div className="grid gap-2 sm:col-span-2">
                                <Label>Catatan</Label>
                                <Textarea
                                    value={draft.description}
                                    onChange={(event) =>
                                        updateDraft(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Opsional"
                                    className="min-h-20 resize-y"
                                />
                            </div>

                            {draft.product_type === 'hotel' ? (
                                <div className="space-y-3 border-t border-border/70 pt-4 sm:col-span-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Broker, Session & Harga Kamar
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Satu session memuat harga DBL,
                                                TRPL, dan QUAD.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    addPricingSession(false)
                                                }
                                            >
                                                <Plus className="h-4 w-4" />
                                                Tambah Session
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    addPricingSession(true)
                                                }
                                            >
                                                <Plus className="h-4 w-4" />
                                                Tambah Broker
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-xl border border-border/70">
                                        <div className="hidden grid-cols-[1fr_1.35fr_0.72fr_0.72fr_0.72fr_2.5rem] gap-2 bg-muted/45 px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:grid">
                                            <span>Broker</span>
                                            <span>Session</span>
                                            <span>DBL</span>
                                            <span>TRPL</span>
                                            <span>QUAD</span>
                                            <span />
                                        </div>
                                        {groupPricingSessions(
                                            draft.pricing,
                                        ).map((session, index) => (
                                            <div
                                                key={`${draft.client_key}-${index}`}
                                                className="grid gap-3 border-t border-border/60 p-3 first:border-t-0 sm:grid-cols-2 lg:grid-cols-[1fr_1.35fr_0.72fr_0.72fr_0.72fr_2.5rem] lg:items-end lg:gap-2"
                                            >
                                                <div className="grid gap-1.5">
                                                    <Label className="lg:sr-only">
                                                        Broker
                                                    </Label>
                                                    <Input
                                                        value={
                                                            session.broker_name
                                                        }
                                                        onChange={(event) =>
                                                            updatePricingSession(
                                                                index,
                                                                {
                                                                    ...session,
                                                                    broker_name:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                },
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label className="lg:sr-only">
                                                        Session
                                                    </Label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input
                                                            aria-label="Tanggal mulai session"
                                                            type="date"
                                                            value={
                                                                session.period_start
                                                            }
                                                            onChange={(event) =>
                                                                updatePricingSession(
                                                                    index,
                                                                    {
                                                                        ...session,
                                                                        period_start:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                        <Input
                                                            aria-label="Tanggal selesai session"
                                                            type="date"
                                                            value={
                                                                session.period_end
                                                            }
                                                            onChange={(event) =>
                                                                updatePricingSession(
                                                                    index,
                                                                    {
                                                                        ...session,
                                                                        period_end:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                {(
                                                    [
                                                        ['dbl_price', 'DBL'],
                                                        ['trpl_price', 'TRPL'],
                                                        ['quad_price', 'QUAD'],
                                                    ] as const
                                                ).map(([field, label]) => (
                                                    <div
                                                        key={field}
                                                        className="grid gap-1.5"
                                                    >
                                                        <Label className="lg:sr-only">
                                                            Harga {label}
                                                        </Label>
                                                        <Input
                                                            aria-label={`Harga ${label}`}
                                                            type="number"
                                                            min={0}
                                                            value={
                                                                session[field]
                                                            }
                                                            onChange={(event) =>
                                                                updatePricingSession(
                                                                    index,
                                                                    {
                                                                        ...session,
                                                                        [field]:
                                                                            Number(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    aria-label="Hapus session harga"
                                                    onClick={() =>
                                                        removePricingSession(
                                                            index,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    <DialogFooter className="border-t bg-background px-5 py-4 sm:px-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDialog}
                        >
                            Batal
                        </Button>
                        <Button type="button" onClick={saveDraft}>
                            Simpan Produk
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
