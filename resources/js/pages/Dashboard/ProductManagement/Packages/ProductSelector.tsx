import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CurrencyOption, ProductOption } from './types';

type Props = {
    options: ProductOption[];
    currencies: CurrencyOption[];
    selected: number[];
    productMultipliers: Record<string, number>;
    hotelBrokerSelections: Record<string, string>;
    locale: 'id' | 'en';
    onChange: (
        ids: number[],
        hotelBrokerSelections: Record<string, string>,
        productMultipliers: Record<string, number>,
    ) => void;
};

type HotelPricingSession = NonNullable<
    ProductOption['hotel_info']
>['pricing'][number];

type HotelBrokerGroup = {
    brokerName: string;
    roomTypes: string[];
    sessions: Array<{
        periodLabel: string;
        pricesByRoomType: Record<string, number | string | null>;
    }>;
};

const typeConfig: Record<string, { label: string; accent: string }> = {
    hotel: {
        label: 'Hotel',
        accent: 'border-blue-200 bg-blue-50/70 text-blue-700',
    },
    tiket: {
        label: 'Tiket',
        accent: 'border-emerald-200 bg-emerald-50/70 text-emerald-700',
    },
    merchandise: {
        label: 'Merchandise',
        accent: 'border-fuchsia-200 bg-fuchsia-50/70 text-fuchsia-700',
    },
    perlengkapan: {
        label: 'Perlengkapan',
        accent: 'border-rose-200 bg-rose-50/70 text-rose-700',
    },
};

const defaultAccentClass =
    'border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200';

function normalizeType(productType?: string | null): string {
    return productType?.trim() ? productType : 'lainnya';
}

function formatCurrencyIDR(value?: number | string | null): string {
    const numericValue =
        typeof value === 'string' ? Number(value) : (value ?? null);

    if (numericValue === null || Number.isNaN(numericValue)) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(numericValue));
}

function formatCurrencyValue(
    value: number | string | null | undefined,
    currencyCode = 'IDR',
): string {
    const numericValue =
        typeof value === 'string' ? Number(value) : (value ?? null);

    if (numericValue === null || Number.isNaN(numericValue)) {
        return '-';
    }

    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currencyCode || 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(numericValue));
    } catch {
        return `${currencyCode || 'IDR'} ${new Intl.NumberFormat('id-ID', {
            maximumFractionDigits: 0,
        }).format(Number(numericValue))}`;
    }
}

function formatDateLabel(value?: string | null): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatPeriod(start?: string | null, end?: string | null): string {
    const formattedStart = formatDateLabel(start);
    const formattedEnd = formatDateLabel(end);

    if (formattedStart && formattedEnd) {
        return `${formattedStart} - ${formattedEnd}`;
    }

    if (formattedStart) {
        return `Mulai ${formattedStart}`;
    }

    if (formattedEnd) {
        return `Sampai ${formattedEnd}`;
    }

    return 'Periode belum tersedia';
}

function groupHotelPricingByBroker(
    pricing: HotelPricingSession[],
): HotelBrokerGroup[] {
    const grouped = pricing.reduce(
        (carry, session) => {
            const brokerName = session.broker_name?.trim() || 'Broker';

            if (!carry[brokerName]) {
                carry[brokerName] = [];
            }

            carry[brokerName].push(session);

            return carry;
        },
        {} as Record<string, HotelPricingSession[]>,
    );

    const preferredRoomTypeOrder = ['DBL', 'TRPL', 'QUAD', 'QUINT'];

    return Object.entries(grouped).map(([brokerName, sessions]) => {
        const normalizedSessions = sessions.map((session) => ({
            ...session,
            normalizedRoomType: (session.room_type || 'ROOM')
                .trim()
                .toUpperCase(),
        }));

        const roomTypes = [
            ...new Set(
                normalizedSessions.map((session) => session.normalizedRoomType),
            ),
        ].sort((left, right) => {
            const leftIndex = preferredRoomTypeOrder.indexOf(left);
            const rightIndex = preferredRoomTypeOrder.indexOf(right);

            if (leftIndex !== -1 || rightIndex !== -1) {
                return (
                    (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) -
                    (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex)
                );
            }

            return left.localeCompare(right);
        });

        const sessionMap = normalizedSessions.reduce(
            (carry, session) => {
                const periodLabel = formatPeriod(
                    session.period_start,
                    session.period_end,
                );

                if (!carry[periodLabel]) {
                    carry[periodLabel] = {};
                }

                carry[periodLabel][session.normalizedRoomType] = session.price;

                return carry;
            },
            {} as Record<string, Record<string, number | string | null>>,
        );

        return {
            brokerName,
            roomTypes,
            sessions: Object.entries(sessionMap).map(
                ([periodLabel, pricesByRoomType]) => ({
                    periodLabel,
                    pricesByRoomType,
                }),
            ),
        };
    });
}

export function ProductSelector({
    options,
    currencies,
    selected,
    productMultipliers,
    hotelBrokerSelections,
    locale,
    onChange,
}: Props) {
    const [activeType, setActiveType] = useState('');
    const [searchByType, setSearchByType] = useState<Record<string, string>>(
        {},
    );
    const [expandedHotelIds, setExpandedHotelIds] = useState<number[]>([]);

    function productDisplayName(product: ProductOption): string {
        if (typeof product.name === 'string') {
            return product.name;
        }

        return product.name?.[locale] || product.name?.id || product.code;
    }

    const currencyMap = useMemo(() => {
        return currencies.reduce(
            (carry, currency) => {
                carry[currency.code.toUpperCase()] = currency;

                return carry;
            },
            {} as Record<string, CurrencyOption>,
        );
    }, [currencies]);

    function convertToIdr(
        value: number | string | null | undefined,
        currencyCode?: string | null,
    ): number | null {
        const numericValue =
            typeof value === 'string' ? Number(value) : (value ?? null);

        if (numericValue === null || Number.isNaN(numericValue)) {
            return null;
        }

        const normalizedCurrency = (currencyCode || 'IDR').toUpperCase();

        if (normalizedCurrency === 'IDR') {
            return Number(numericValue);
        }

        const currency = currencyMap[normalizedCurrency];

        if (!currency || !Number.isFinite(currency.conversion_rate)) {
            return null;
        }

        return Number(numericValue) * Number(currency.conversion_rate);
    }

    function renderConvertedIdr(
        value: number | string | null | undefined,
        currencyCode?: string | null,
    ): string | null {
        const normalizedCurrency = (currencyCode || 'IDR').toUpperCase();

        if (normalizedCurrency === 'IDR') {
            return null;
        }

        const convertedValue = convertToIdr(value, normalizedCurrency);

        return convertedValue === null
            ? null
            : `~ ${formatCurrencyIDR(convertedValue)}`;
    }

    const availableTypes = useMemo(() => {
        return [
            ...new Set(
                options.map((product) => normalizeType(product.product_type)),
            ),
        ].sort((left, right) =>
            (typeConfig[left]?.label ?? left).localeCompare(
                typeConfig[right]?.label ?? right,
            ),
        );
    }, [options]);

    const resolvedActiveType =
        availableTypes.length === 0
            ? ''
            : availableTypes.includes(activeType)
              ? activeType
              : availableTypes[0];

    const optionsByType = useMemo(() => {
        return options.reduce(
            (groupedOptions, product) => {
                const typeKey = normalizeType(product.product_type);

                if (!groupedOptions[typeKey]) {
                    groupedOptions[typeKey] = [];
                }

                groupedOptions[typeKey].push(product);

                return groupedOptions;
            },
            {} as Record<string, ProductOption[]>,
        );
    }, [options]);

    const selectedProducts = useMemo(
        () => options.filter((product) => selected.includes(product.id)),
        [options, selected],
    );

    const selectedProductsByType = useMemo(() => {
        return selectedProducts.reduce(
            (groupedProducts, product) => {
                const typeKey = normalizeType(product.product_type);

                if (!groupedProducts[typeKey]) {
                    groupedProducts[typeKey] = [];
                }

                groupedProducts[typeKey].push(product);

                return groupedProducts;
            },
            {} as Record<string, ProductOption[]>,
        );
    }, [selectedProducts]);

    function updateSearch(typeKey: string, value: string) {
        setSearchByType((current) => ({
            ...current,
            [typeKey]: value,
        }));
    }

    function addProduct(productId: number) {
        if (selected.includes(productId)) {
            return;
        }

        const nextBrokerSelections = { ...hotelBrokerSelections };
        const nextProductMultipliers = {
            ...productMultipliers,
            [String(productId)]: Math.max(
                1,
                Number(productMultipliers[String(productId)] ?? 1),
            ),
        };
        const selectedProduct = options.find(
            (product) => product.id === productId,
        );

        if (selectedProduct?.product_type === 'hotel') {
            const brokerGroups = groupHotelPricingByBroker(
                selectedProduct.hotel_info?.pricing ?? [],
            );
            const autoSelectedBroker = brokerGroups[0]?.brokerName;

            if (autoSelectedBroker) {
                nextBrokerSelections[String(productId)] = autoSelectedBroker;
            }
        }

        onChange(
            [...selected, productId],
            nextBrokerSelections,
            nextProductMultipliers,
        );
    }

    function removeProduct(productId: number) {
        const nextBrokerSelections = { ...hotelBrokerSelections };
        const nextProductMultipliers = { ...productMultipliers };
        delete nextBrokerSelections[String(productId)];
        delete nextProductMultipliers[String(productId)];

        onChange(
            selected.filter((selectedId) => selectedId !== productId),
            nextBrokerSelections,
            nextProductMultipliers,
        );
        setExpandedHotelIds((current) =>
            current.filter((hotelId) => hotelId !== productId),
        );
    }

    function toggleHotelCard(productId: number, isOpen: boolean) {
        setExpandedHotelIds((current) =>
            isOpen
                ? current.includes(productId)
                    ? current
                    : [...current, productId]
                : current.filter((hotelId) => hotelId !== productId),
        );
    }

    function updateHotelBroker(productId: number, brokerName: string) {
        onChange(
            selected,
            {
                ...hotelBrokerSelections,
                [String(productId)]: brokerName,
            },
            productMultipliers,
        );
    }

    function updateProductMultiplier(productId: number, value: string) {
        const parsedMultiplier = Number(value);
        const normalizedMultiplier =
            Number.isFinite(parsedMultiplier) && parsedMultiplier >= 1
                ? Math.floor(parsedMultiplier)
                : 1;

        onChange(selected, hotelBrokerSelections, {
            ...productMultipliers,
            [String(productId)]: normalizedMultiplier,
        });
    }

    if (options.length === 0) {
        return (
            <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
                Belum ada produk aktif. Tambahkan produk di menu Product
                Management.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border bg-muted/20 px-4 py-3 text-sm">
                <span className="font-medium text-foreground">
                    {selectedProducts.length}
                </span>{' '}
                produk dipilih untuk package ini.
            </div>

            <Tabs
                value={resolvedActiveType}
                onValueChange={setActiveType}
                className="w-full"
            >
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-2 md:grid-cols-4">
                    {availableTypes.map((typeKey) => {
                        const cfg = typeConfig[typeKey] ?? {
                            label: typeKey,
                            accent: defaultAccentClass,
                        };
                        const totalSelected =
                            selectedProductsByType[typeKey]?.length ?? 0;

                        return (
                            <TabsTrigger
                                key={typeKey}
                                value={typeKey}
                                className="flex h-auto items-center justify-between rounded-xl px-3 py-2 text-left"
                            >
                                <span className="truncate text-xs font-semibold">
                                    {cfg.label}
                                </span>
                                <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.accent}`}
                                >
                                    {totalSelected}
                                </span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {availableTypes.map((typeKey) => {
                    const cfg = typeConfig[typeKey] ?? {
                        label: typeKey,
                        accent: defaultAccentClass,
                    };
                    const search = searchByType[typeKey] ?? '';
                    const normalizedSearch = search.trim().toLowerCase();
                    const typeOptions = optionsByType[typeKey] ?? [];
                    const filteredProducts = typeOptions.filter((product) => {
                        if (selected.includes(product.id)) {
                            return false;
                        }

                        const searchableText = [
                            productDisplayName(product),
                            product.code,
                            product.hotel_info?.city,
                            product.hotel_info?.country,
                        ]
                            .filter(Boolean)
                            .join(' ')
                            .toLowerCase();

                        return (
                            normalizedSearch === '' ||
                            searchableText.includes(normalizedSearch)
                        );
                    });
                    const selectedProductsInType =
                        selectedProductsByType[typeKey] ?? [];

                    return (
                        <TabsContent
                            key={typeKey}
                            value={typeKey}
                            className="space-y-4"
                        >
                            <div className="rounded-2xl border bg-background p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-foreground">
                                        Combo box
                                    </p>
                                    <Select
                                        value=""
                                        onValueChange={(value) => {
                                            if (value === '__empty__') {
                                                return;
                                            }

                                            addProduct(Number(value));
                                            updateSearch(typeKey, '');
                                        }}
                                    >
                                        <SelectTrigger className="h-10 w-full text-sm">
                                            <SelectValue
                                                placeholder={`Pilih ${cfg.label.toLowerCase()}`}
                                            />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-80">
                                            <div className="sticky top-0 z-10 border-b bg-background p-2">
                                                <div className="relative">
                                                    <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        className="h-9 pl-8 text-sm"
                                                        placeholder={`Cari ${cfg.label.toLowerCase()}...`}
                                                        value={search}
                                                        onChange={(event) =>
                                                            updateSearch(
                                                                typeKey,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        onKeyDown={(event) => {
                                                            event.stopPropagation();
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {filteredProducts.length === 0 ? (
                                                <div className="px-3 py-3 text-sm text-muted-foreground">
                                                    Tidak ada option yang cocok.
                                                </div>
                                            ) : (
                                                filteredProducts.map(
                                                    (product) => (
                                                        <SelectItem
                                                            key={product.id}
                                                            value={String(
                                                                product.id,
                                                            )}
                                                        >
                                                            {`${productDisplayName(product)}${
                                                                product.price
                                                                    ? ` - ${formatCurrencyValue(
                                                                          product.price,
                                                                          product.currency ||
                                                                              'IDR',
                                                                      )}${
                                                                          renderConvertedIdr(
                                                                              product.price,
                                                                              product.currency,
                                                                          )
                                                                              ? ` (${renderConvertedIdr(
                                                                                    product.price,
                                                                                    product.currency,
                                                                                )})`
                                                                              : ''
                                                                      }`
                                                                    : ''
                                                            }`}
                                                        </SelectItem>
                                                    ),
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-muted/20 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Product terpilih {cfg.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Dipisah per tab category.
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${cfg.accent}`}
                                    >
                                        {selectedProductsInType.length} dipilih
                                    </span>
                                </div>

                                {selectedProductsInType.length === 0 ? (
                                    <div className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                                        Belum ada product{' '}
                                        {cfg.label.toLowerCase()} yang dipilih.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedProductsInType.map(
                                            (product) => {
                                                const hotelPricingGroups =
                                                    product.product_type ===
                                                        'hotel' &&
                                                    (product.hotel_info?.pricing
                                                        .length ?? 0) > 0
                                                        ? groupHotelPricingByBroker(
                                                              product.hotel_info
                                                                  ?.pricing ??
                                                                  [],
                                                          )
                                                        : [];
                                                const selectedBrokerName =
                                                    hotelBrokerSelections[
                                                        String(product.id)
                                                    ] ??
                                                    hotelPricingGroups[0]
                                                        ?.brokerName ??
                                                    '';
                                                const selectedMultiplier =
                                                    Math.max(
                                                        1,
                                                        Number(
                                                            productMultipliers[
                                                                String(
                                                                    product.id,
                                                                )
                                                            ] ?? 1,
                                                        ),
                                                    );
                                                const activeBrokerGroup =
                                                    hotelPricingGroups.find(
                                                        (brokerGroup) =>
                                                            brokerGroup.brokerName ===
                                                            selectedBrokerName,
                                                    ) ?? hotelPricingGroups[0];

                                                return product.product_type ===
                                                    'hotel' &&
                                                    hotelPricingGroups.length >
                                                        0 ? (
                                                    <Collapsible
                                                        key={product.id}
                                                        open={expandedHotelIds.includes(
                                                            product.id,
                                                        )}
                                                        onOpenChange={(open) =>
                                                            toggleHotelCard(
                                                                product.id,
                                                                open,
                                                            )
                                                        }
                                                        className="rounded-xl border bg-background"
                                                    >
                                                        <div className="px-4 py-3">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-foreground">
                                                                        {productDisplayName(
                                                                            product,
                                                                        )}
                                                                    </p>
                                                                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                                        {product
                                                                            .hotel_info
                                                                            ?.city && (
                                                                            <span className="inline-flex items-center gap-1">
                                                                                <MapPin className="h-3.5 w-3.5" />
                                                                                {
                                                                                    product
                                                                                        .hotel_info
                                                                                        .city
                                                                                }
                                                                                {product
                                                                                    .hotel_info
                                                                                    ?.country
                                                                                    ? `, ${product.hotel_info.country}`
                                                                                    : ''}
                                                                            </span>
                                                                        )}
                                                                        <span>
                                                                            {
                                                                                hotelPricingGroups.length
                                                                            }{' '}
                                                                            broker
                                                                        </span>
                                                                        <span>
                                                                            Mata
                                                                            uang:{' '}
                                                                            {(
                                                                                product
                                                                                    .hotel_info
                                                                                    ?.currency ||
                                                                                product.currency ||
                                                                                'IDR'
                                                                            ).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center gap-2 rounded-lg border px-2 py-1">
                                                                        <span className="text-[11px] font-medium text-muted-foreground">
                                                                            x /
                                                                            pax
                                                                        </span>
                                                                        <Input
                                                                            type="number"
                                                                            min={
                                                                                1
                                                                            }
                                                                            value={String(
                                                                                selectedMultiplier,
                                                                            )}
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateProductMultiplier(
                                                                                    product.id,
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="h-7 w-16 border-0 bg-transparent px-1 text-right text-xs font-semibold shadow-none focus-visible:ring-0"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeProduct(
                                                                                product.id,
                                                                            )
                                                                        }
                                                                        className="rounded-lg border px-2.5 py-1 text-xs font-medium transition hover:bg-muted"
                                                                    >
                                                                        Hapus
                                                                    </button>
                                                                    <CollapsibleTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg border transition hover:bg-muted data-[state=open]:rotate-180">
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    </CollapsibleTrigger>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <CollapsibleContent className="border-t px-4 py-3">
                                                            <div className="grid gap-3 lg:grid-cols-[200px_minmax(0,1fr)]">
                                                                <div className="space-y-2">
                                                                    <div className="space-y-1">
                                                                        {hotelPricingGroups.map(
                                                                            (
                                                                                brokerGroup,
                                                                            ) => (
                                                                                <label
                                                                                    key={`${product.id}-${brokerGroup.brokerName}-radio`}
                                                                                    className="flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 transition hover:bg-muted/50"
                                                                                >
                                                                                    <input
                                                                                        type="radio"
                                                                                        name={`hotel-broker-${product.id}`}
                                                                                        value={
                                                                                            brokerGroup.brokerName
                                                                                        }
                                                                                        checked={
                                                                                            selectedBrokerName ===
                                                                                            brokerGroup.brokerName
                                                                                        }
                                                                                        onChange={() =>
                                                                                            updateHotelBroker(
                                                                                                product.id,
                                                                                                brokerGroup.brokerName,
                                                                                            )
                                                                                        }
                                                                                        className="mt-0.5 h-4 w-4"
                                                                                    />
                                                                                    <div className="min-w-0">
                                                                                        <p className="text-sm font-medium text-foreground">
                                                                                            {
                                                                                                brokerGroup.brokerName
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                </label>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {activeBrokerGroup ? (
                                                                    <div className="overflow-x-auto">
                                                                        <div className="space-y-2">
                                                                            <div
                                                                                className="grid min-w-[520px] rounded-lg border border-dashed bg-muted/10 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase"
                                                                                style={{
                                                                                    gridTemplateColumns: `minmax(150px, 1.4fr) repeat(${activeBrokerGroup.roomTypes.length}, minmax(90px, 1fr))`,
                                                                                }}
                                                                            >
                                                                                <div className="px-3 py-2">
                                                                                    Session
                                                                                </div>
                                                                                {activeBrokerGroup.roomTypes.map(
                                                                                    (
                                                                                        roomType,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={`${product.id}-${activeBrokerGroup.brokerName}-${roomType}-head`}
                                                                                            className="border-l px-3 py-2 text-center"
                                                                                        >
                                                                                            {
                                                                                                roomType
                                                                                            }
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                            {activeBrokerGroup.sessions.map(
                                                                                (
                                                                                    session,
                                                                                    index,
                                                                                ) => (
                                                                                    <div
                                                                                        key={`${product.id}-${activeBrokerGroup.brokerName}-${index}`}
                                                                                        className="grid min-w-[520px] rounded-lg border bg-muted/15"
                                                                                        style={{
                                                                                            gridTemplateColumns: `minmax(150px, 1.4fr) repeat(${activeBrokerGroup.roomTypes.length}, minmax(90px, 1fr))`,
                                                                                        }}
                                                                                    >
                                                                                        <div className="px-3 py-3 text-xs leading-5 text-muted-foreground">
                                                                                            {
                                                                                                session.periodLabel
                                                                                            }
                                                                                        </div>
                                                                                        {activeBrokerGroup.roomTypes.map(
                                                                                            (
                                                                                                roomType,
                                                                                            ) => (
                                                                                                <div
                                                                                                    key={`${product.id}-${activeBrokerGroup.brokerName}-${index}-${roomType}`}
                                                                                                    className="border-l px-3 py-3 text-center"
                                                                                                >
                                                                                                    <div className="text-sm font-semibold text-foreground">
                                                                                                        {formatCurrencyValue(
                                                                                                            session
                                                                                                                .pricesByRoomType[
                                                                                                                roomType
                                                                                                            ],
                                                                                                            product
                                                                                                                .hotel_info
                                                                                                                ?.currency ||
                                                                                                                product.currency ||
                                                                                                                'IDR',
                                                                                                        )}
                                                                                                    </div>
                                                                                                    {renderConvertedIdr(
                                                                                                        session
                                                                                                            .pricesByRoomType[
                                                                                                            roomType
                                                                                                        ],
                                                                                                        product
                                                                                                            .hotel_info
                                                                                                            ?.currency ||
                                                                                                            product.currency,
                                                                                                    ) ? (
                                                                                                        <div className="mt-1 text-[11px] text-muted-foreground">
                                                                                                            {renderConvertedIdr(
                                                                                                                session
                                                                                                                    .pricesByRoomType[
                                                                                                                    roomType
                                                                                                                ],
                                                                                                                product
                                                                                                                    .hotel_info
                                                                                                                    ?.currency ||
                                                                                                                    product.currency,
                                                                                                            )}
                                                                                                        </div>
                                                                                                    ) : null}
                                                                                                </div>
                                                                                            ),
                                                                                        )}
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                                                                        Belum
                                                                        ada
                                                                        broker
                                                                        yang
                                                                        bisa
                                                                        ditampilkan.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                ) : (
                                                    <div
                                                        key={product.id}
                                                        className="rounded-2xl border bg-background p-4"
                                                    >
                                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {productDisplayName(
                                                                        product,
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        product.code
                                                                    }
                                                                </p>
                                                                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                                                    <p>
                                                                        Harga:{' '}
                                                                        <span className="font-medium text-foreground">
                                                                            {formatCurrencyValue(
                                                                                product.price,
                                                                                product.currency ||
                                                                                    'IDR',
                                                                            )}
                                                                        </span>
                                                                    </p>
                                                                    {renderConvertedIdr(
                                                                        product.price,
                                                                        product.currency,
                                                                    ) ? (
                                                                        <p>
                                                                            Estimasi
                                                                            IDR:{' '}
                                                                            <span className="font-medium text-foreground">
                                                                                {renderConvertedIdr(
                                                                                    product.price,
                                                                                    product.currency,
                                                                                )}
                                                                            </span>
                                                                        </p>
                                                                    ) : null}
                                                                    <p>
                                                                        Mata
                                                                        uang:{' '}
                                                                        <span className="font-medium text-foreground">
                                                                            {(
                                                                                product.currency ||
                                                                                'IDR'
                                                                            ).toUpperCase()}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2 rounded-lg border px-2 py-1">
                                                                    <span className="text-[11px] font-medium text-muted-foreground">
                                                                        x / pax
                                                                    </span>
                                                                    <Input
                                                                        type="number"
                                                                        min={1}
                                                                        value={String(
                                                                            Math.max(
                                                                                1,
                                                                                Number(
                                                                                    productMultipliers[
                                                                                        String(
                                                                                            product.id,
                                                                                        )
                                                                                    ] ??
                                                                                        1,
                                                                                ),
                                                                            ),
                                                                        )}
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateProductMultiplier(
                                                                                product.id,
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="h-7 w-16 border-0 bg-transparent px-1 text-right text-xs font-semibold shadow-none focus-visible:ring-0"
                                                                    />
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeProduct(
                                                                            product.id,
                                                                        )
                                                                    }
                                                                    className="w-fit rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-muted"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    );
                })}
            </Tabs>
        </div>
    );
}
