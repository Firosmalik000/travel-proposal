import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { MoreHorizontal, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

type PriceRow = {
    room_type_id: number | string;
    period_start: string;
    period_end: string;
    price: number;
};

type PeriodRateRow = {
    period_start: string;
    period_end: string;
    dbl_price: number;
    trpl_price: number;
    quad_price: number;
};

type HotelItem = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    currency: string;
    is_active: boolean;
    country_id: number;
    city_id: number;
    country_name: string;
    city_name: string;
    product_code: string | null;
    prices: Array<PriceRow & { room_type_name: string }>;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    hotels: {
        data: HotelItem[];
        total?: number;
        links: PaginationLink[];
        from?: number | null;
    };
    filters: { search: string; city_id: string; status: string };
    cityStats: Array<{
        city_id: number;
        city_name: string;
        total_hotels: number;
    }>;
    countryOptions: Array<{ id: number; name: string }>;
    cityOptions: Array<{
        id: number;
        country_id: number;
        name: string;
        country_name: string;
    }>;
    roomTypeOptions: Array<{ id: number; name: string }>;
};

type HotelForm = {
    country_id: string;
    city_id: string;
    name: string;
    description: string;
    currency: string;
    is_active: boolean;
    period_rates: PeriodRateRow[];
};

type BulkHotelForm = {
    country_id: string;
    city_id: string;
    name: string;
    currency: string;
    is_active: boolean;
    period_rates: PeriodRateRow[];
};

type BulkHotelPayload = {
    country_id: string;
    city_id: string;
    name: string;
    currency: string;
    is_active: boolean;
    prices: PriceRow[];
};

const blankPeriodRate = (): PeriodRateRow => ({
    period_start: '',
    period_end: '',
    dbl_price: 0,
    trpl_price: 0,
    quad_price: 0,
});

const blankForm = (): HotelForm => ({
    country_id: '',
    city_id: '',
    name: '',
    description: '',
    currency: 'IDR',
    is_active: true,
    period_rates: [blankPeriodRate()],
});

const blankBulkHotel = (): BulkHotelForm => ({
    country_id: '',
    city_id: '',
    name: '',
    currency: 'IDR',
    is_active: true,
    period_rates: [blankPeriodRate()],
});

const normalizeCell = (value: unknown): string =>
    String(value ?? '')
        .trim()
        .replace(/\s+/g, ' ');

const normalizeKey = (value: string): string =>
    normalizeCell(value)
        .normalize('NFKD')
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '');

const toNumber = (value: unknown): number => {
    const cleaned = String(value ?? '')
        .trim()
        .replace(/,/g, '')
        .replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
};

function downloadBulkTemplate(): void {
    const headers = [
        'country',
        'city',
        'hotel',
        'currency',
        'period_start',
        'period_end',
        'dbl',
        'trpl',
        'quad',
    ];
    const sampleRows = [
        [
            'Arab Saudi',
            'Mekkah',
            'Azka Al Maqam',
            'IDR',
            '2026-06-01',
            '2026-07-31',
            590,
            680,
            770,
        ],
        [
            'Arab Saudi',
            'Mekkah',
            'Azka Al Maqam',
            'IDR',
            '2026-08-01',
            '2026-09-01',
            620,
            720,
            820,
        ],
        [
            'Arab Saudi',
            'Madinah',
            'Taibah Front',
            'IDR',
            '2026-06-30',
            '2026-08-14',
            700,
            825,
            950,
        ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'hotel_bulk_template');
    XLSX.writeFile(workbook, 'hotel_bulk_template.xlsx');
}

export default function HotelIndex({
    hotels,
    filters,
    cityStats,
    countryOptions,
    cityOptions,
    roomTypeOptions,
}: Props) {
    const { can } = usePermission('hotel');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');

    const [search, setSearch] = useState(filters.search);
    const [cityId, setCityId] = useState(filters.city_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [editingHotel, setEditingHotel] = useState<HotelItem | 'new' | null>(
        null,
    );
    const [bulkOpen, setBulkOpen] = useState(false);

    const form = useForm<HotelForm>(blankForm());
    const bulkForm = useForm<{ hotels: BulkHotelForm[] }>({
        hotels: [blankBulkHotel()],
    });

    const citySelection = useMemo(
        () =>
            cityOptions.filter(
                (city) =>
                    form.data.country_id === '' ||
                    String(city.country_id) === form.data.country_id,
            ),
        [cityOptions, form.data.country_id],
    );

    const roomTypeIdMap = useMemo(() => {
        const roomTypeMap: Record<string, number> = {};
        for (const roomType of roomTypeOptions) {
            roomTypeMap[roomType.name.trim().toUpperCase()] = roomType.id;
        }
        return roomTypeMap;
    }, [roomTypeOptions]);

    function setPeriodRate(
        index: number,
        key: keyof PeriodRateRow,
        value: string | number,
    ): void {
        const periodRates = [...form.data.period_rates];
        periodRates[index] = { ...periodRates[index], [key]: value };
        form.setData('period_rates', periodRates);
    }

    function openCreate(): void {
        form.setData(blankForm());
        form.clearErrors();
        setEditingHotel('new');
    }

    function openEdit(hotel: HotelItem): void {
        form.setData({
            country_id: String(hotel.country_id),
            city_id: String(hotel.city_id),
            name: hotel.name,
            description: hotel.description ?? '',
            currency: hotel.currency,
            is_active: hotel.is_active,
            period_rates: toPeriodRates(hotel.prices),
        });
        form.clearErrors();
        setEditingHotel(hotel);
    }

    function buildPricesFromPeriodRates(
        periodRates: PeriodRateRow[],
    ): PriceRow[] {
        const dblRoomTypeId = roomTypeIdMap.DBL;
        const trplRoomTypeId = roomTypeIdMap.TRPL;
        const quadRoomTypeId = roomTypeIdMap.QUAD;
        const prices: PriceRow[] = [];

        for (const periodRate of periodRates) {
            if (!periodRate.period_start || !periodRate.period_end) {
                continue;
            }

            if (dblRoomTypeId) {
                prices.push({
                    room_type_id: dblRoomTypeId,
                    period_start: periodRate.period_start,
                    period_end: periodRate.period_end,
                    price: Number(periodRate.dbl_price || 0),
                });
            }
            if (trplRoomTypeId) {
                prices.push({
                    room_type_id: trplRoomTypeId,
                    period_start: periodRate.period_start,
                    period_end: periodRate.period_end,
                    price: Number(periodRate.trpl_price || 0),
                });
            }
            if (quadRoomTypeId) {
                prices.push({
                    room_type_id: quadRoomTypeId,
                    period_start: periodRate.period_start,
                    period_end: periodRate.period_end,
                    price: Number(periodRate.quad_price || 0),
                });
            }
        }

        return prices;
    }

    function buildPricesPayload(): PriceRow[] {
        return buildPricesFromPeriodRates(form.data.period_rates);
    }

    function setBulkHotelData(
        hotelIndex: number,
        key: keyof BulkHotelForm,
        value: string | boolean | PeriodRateRow[],
    ): void {
        const hotelsPayload = [...bulkForm.data.hotels];
        hotelsPayload[hotelIndex] = {
            ...hotelsPayload[hotelIndex],
            [key]: value,
        } as BulkHotelForm;
        bulkForm.setData('hotels', hotelsPayload);
    }

    function setBulkPeriodRate(
        hotelIndex: number,
        periodIndex: number,
        key: keyof PeriodRateRow,
        value: string | number,
    ): void {
        const hotelsPayload = [...bulkForm.data.hotels];
        const periodRates = [...hotelsPayload[hotelIndex].period_rates];
        periodRates[periodIndex] = {
            ...periodRates[periodIndex],
            [key]: value,
        };
        hotelsPayload[hotelIndex] = {
            ...hotelsPayload[hotelIndex],
            period_rates: periodRates,
        };
        bulkForm.setData('hotels', hotelsPayload);
    }

    function importBulkFile(event: React.ChangeEvent<HTMLInputElement>): void {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'pdf') {
            toast.error(
                'Import PDF belum didukung otomatis. Gunakan format Excel/CSV untuk auto-generate.',
            );
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            try {
                const workbook = XLSX.read(loadEvent.target?.result, {
                    type: 'array',
                });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rawRows = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    raw: false,
                    defval: '',
                }) as unknown[][];

                if (rawRows.length < 2) {
                    toast.error('File import kosong atau format tidak valid.');
                    return;
                }

                const headerRow = rawRows[0].map((cell) =>
                    normalizeKey(String(cell)),
                );
                const columnIndex = {
                    country: headerRow.findIndex((header) =>
                        ['country', 'negara'].includes(header),
                    ),
                    city: headerRow.findIndex((header) =>
                        ['city', 'kota'].includes(header),
                    ),
                    hotel: headerRow.findIndex((header) =>
                        ['hotel', 'hotelname', 'namahotel'].includes(header),
                    ),
                    currency: headerRow.findIndex((header) =>
                        ['currency', 'matauang', 'curr'].includes(header),
                    ),
                    periodStart: headerRow.findIndex((header) =>
                        [
                            'periodstart',
                            'from',
                            'start',
                            'tanggalmulai',
                        ].includes(header),
                    ),
                    periodEnd: headerRow.findIndex((header) =>
                        ['periodend', 'to', 'end', 'tanggalselesai'].includes(
                            header,
                        ),
                    ),
                    dbl: headerRow.findIndex((header) =>
                        ['dbl', 'double'].includes(header),
                    ),
                    trpl: headerRow.findIndex((header) =>
                        ['trpl', 'triple'].includes(header),
                    ),
                    quad: headerRow.findIndex((header) =>
                        ['quad', 'quadruple'].includes(header),
                    ),
                };

                if (
                    columnIndex.country === -1 ||
                    columnIndex.city === -1 ||
                    columnIndex.hotel === -1 ||
                    columnIndex.periodStart === -1 ||
                    columnIndex.periodEnd === -1
                ) {
                    toast.error(
                        'Header wajib: country, city, hotel, period_start/from, period_end/to.',
                    );
                    return;
                }

                const countryMap = new Map(
                    countryOptions.map((country) => [
                        normalizeKey(country.name),
                        String(country.id),
                    ]),
                );
                const cityMap = new Map(
                    cityOptions.map((city) => [
                        `${city.country_id}|${normalizeKey(city.name)}`,
                        String(city.id),
                    ]),
                );
                const cityGlobalMap = new Map<string, string[]>();
                for (const city of cityOptions) {
                    const cityKey = normalizeKey(city.name);
                    const list = cityGlobalMap.get(cityKey) ?? [];
                    list.push(String(city.id));
                    cityGlobalMap.set(cityKey, list);
                }

                const groupedHotels = new Map<string, BulkHotelForm>();
                let skippedRows = 0;
                let unresolvedLocationRows = 0;

                for (let rowIndex = 1; rowIndex < rawRows.length; rowIndex++) {
                    const row = rawRows[rowIndex];
                    const countryName = normalizeCell(row[columnIndex.country]);
                    const cityName = normalizeCell(row[columnIndex.city]);
                    const hotelName = normalizeCell(row[columnIndex.hotel]);
                    const periodStart = normalizeCell(
                        row[columnIndex.periodStart],
                    );
                    const periodEnd = normalizeCell(row[columnIndex.periodEnd]);

                    if (
                        countryName === '' ||
                        cityName === '' ||
                        hotelName === '' ||
                        periodStart === '' ||
                        periodEnd === ''
                    ) {
                        skippedRows++;
                        continue;
                    }

                    const normalizedCountryKey = normalizeKey(countryName);
                    const normalizedCityKey = normalizeKey(cityName);
                    let countryId = countryMap.get(normalizedCountryKey) ?? '';
                    let cityId =
                        countryId !== ''
                            ? (cityMap.get(
                                  `${countryId}|${normalizedCityKey}`,
                              ) ?? '')
                            : '';

                    if (cityId === '') {
                        const cityCandidates =
                            cityGlobalMap.get(normalizedCityKey) ?? [];
                        if (cityCandidates.length === 1) {
                            cityId = cityCandidates[0];
                            const matchedCity = cityOptions.find(
                                (city) => String(city.id) === cityId,
                            );
                            if (matchedCity) {
                                countryId = String(matchedCity.country_id);
                            }
                        }
                    }
                    const currencyValue =
                        normalizeCell(row[columnIndex.currency]) || 'IDR';
                    const periodRate: PeriodRateRow = {
                        period_start: periodStart,
                        period_end: periodEnd,
                        dbl_price: toNumber(row[columnIndex.dbl]),
                        trpl_price: toNumber(row[columnIndex.trpl]),
                        quad_price: toNumber(row[columnIndex.quad]),
                    };

                    if (countryId === '' || cityId === '') {
                        unresolvedLocationRows++;
                    }

                    const groupKey = `${countryId}|${cityId}|${hotelName}|${currencyValue}`;
                    const existing = groupedHotels.get(groupKey);
                    if (existing) {
                        existing.period_rates.push(periodRate);
                    } else {
                        groupedHotels.set(groupKey, {
                            country_id: countryId,
                            city_id: cityId,
                            name: hotelName,
                            currency: currencyValue.toUpperCase(),
                            is_active: true,
                            period_rates: [periodRate],
                        });
                    }
                }

                const importedHotels = Array.from(groupedHotels.values());
                if (importedHotels.length === 0) {
                    toast.error('Tidak ada data valid yang bisa diimport.');
                    return;
                }

                bulkForm.setData('hotels', importedHotels);
                toast.success(
                    `Import berhasil: ${importedHotels.length} hotel draft dimuat${skippedRows > 0 ? `, ${skippedRows} baris dilewati` : ''}.`,
                );
                if (unresolvedLocationRows > 0) {
                    toast.error(
                        `${unresolvedLocationRows} baris belum match negara/kota. Cek penamaan master data.`,
                    );
                }
            } catch {
                toast.error('Gagal membaca file import. Periksa format file.');
            } finally {
                event.target.value = '';
            }
        };

        reader.readAsArrayBuffer(file);
    }

    function submit(event: React.FormEvent): void {
        event.preventDefault();
        const payload = {
            ...form.data,
            prices: buildPricesPayload(),
        };

        if (editingHotel === 'new') {
            router.post('/admin/master-data/hotels', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Hotel berhasil ditambahkan.');
                    setEditingHotel(null);
                },
            });
            return;
        }

        if (editingHotel) {
            router.put(
                `/admin/master-data/hotels/${editingHotel.id}`,
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Hotel berhasil diperbarui.');
                        setEditingHotel(null);
                    },
                },
            );
        }
    }

    function submitBulk(event: React.FormEvent): void {
        event.preventDefault();

        const payload: { hotels: BulkHotelPayload[] } = {
            hotels: bulkForm.data.hotels.map((hotel) => ({
                country_id: hotel.country_id,
                city_id: hotel.city_id,
                name: hotel.name,
                currency: hotel.currency,
                is_active: hotel.is_active,
                prices: buildPricesFromPeriodRates(hotel.period_rates),
            })),
        };

        router.post('/admin/master-data/hotels/bulk', payload, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = (page.props as Record<string, unknown>).flash as
                    | {
                          bulk_created_count?: number;
                          bulk_skipped_hotels?: Array<{
                              index: number;
                              name: string;
                              reason: string;
                          }>;
                      }
                    | undefined;
                const createdCount = Number(flash?.bulk_created_count ?? 0);
                const skippedHotels = flash?.bulk_skipped_hotels ?? [];

                toast.success(
                    `Bulk selesai. Data baru tersimpan: ${createdCount}.`,
                );
                if (skippedHotels.length > 0) {
                    const skippedPreview = skippedHotels
                        .slice(0, 8)
                        .map(
                            (item) =>
                                `#${item.index} ${item.name} (${item.reason})`,
                        )
                        .join('; ');
                    const suffix =
                        skippedHotels.length > 8
                            ? `; dan ${skippedHotels.length - 8} data lainnya`
                            : '';
                    toast.error(
                        `Data tidak disimpan (${skippedHotels.length}): ${skippedPreview}${suffix}`,
                    );
                }
                bulkForm.setData({ hotels: [blankBulkHotel()] });
                setBulkOpen(false);
            },
            onError: () => {
                toast.error(
                    'Bulk create gagal. Ada data hotel yang sudah ada, termasuk yang nonaktif.',
                );
            },
        });
    }

    const total = hotels.total ?? hotels.data.length;

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { label: 'Hotel', href: '/admin/master-data/hotels' },
            ]}
        >
            <Head title="Master Data Hotel" />
            <div className="space-y-4 p-4 md:p-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Hotel
                        </h1>
                    </div>
                    {canCreate ? (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setBulkOpen(true)}
                            >
                                Bulk Create Hotel
                            </Button>
                            <Button onClick={openCreate}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Hotel
                            </Button>
                        </div>
                    ) : null}
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Total Hotel
                    </p>
                    <p className="mt-1 text-xl font-semibold md:text-2xl">
                        {total}
                    </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <p className="text-sm font-semibold">
                        Jumlah Hotel per Kota
                    </p>
                    <div className="mt-3 grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] gap-2">
                        {cityStats.length > 0 ? (
                            cityStats.map((cityStat) => (
                                <div
                                    key={cityStat.city_id}
                                    className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2"
                                >
                                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                                        {cityStat.city_name}
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {cityStat.total_hotels}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Belum ada data kota.
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-12">
                        <div className="lg:col-span-6">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari nama hotel, code, negara, atau kota..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                            <Select value={cityId} onValueChange={setCityId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua kota" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua kota
                                    </SelectItem>
                                    {cityOptions.map((city) => (
                                        <SelectItem
                                            key={city.id}
                                            value={String(city.id)}
                                        >
                                            {city.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="lg:col-span-3">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Aktif
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Nonaktif
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                setCityId('all');
                                setStatus('all');
                                router.get(
                                    '/admin/master-data/hotels',
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={() =>
                                router.get(
                                    '/admin/master-data/hotels',
                                    {
                                        search,
                                        city_id: cityId,
                                        status,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                        >
                            Terapkan
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[980px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14 text-center">
                                        No
                                    </TableHead>
                                    <TableHead className="w-20 text-right">
                                        Aksi
                                    </TableHead>
                                    <TableHead>Hotel</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hotels.data.length > 0 ? (
                                    hotels.data.map((hotel, index) => (
                                        <TableRow key={hotel.id}>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {(hotels.from ?? 1) + index}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {canEdit || canDelete ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="ml-auto"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {canEdit ? (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        openEdit(
                                                                            hotel,
                                                                        )
                                                                    }
                                                                >
                                                                    <SquarePen className="h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                            {canDelete ? (
                                                                <DropdownMenuItem
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        if (
                                                                            window.confirm(
                                                                                `Nonaktifkan hotel \"${hotel.name}\"?`,
                                                                            )
                                                                        ) {
                                                                            router.delete(
                                                                                `/admin/master-data/hotels/${hotel.id}`,
                                                                                {
                                                                                    preserveScroll: true,
                                                                                    onSuccess:
                                                                                        () =>
                                                                                            toast.success(
                                                                                                'Hotel berhasil dinonaktifkan.',
                                                                                            ),
                                                                                },
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Nonaktifkan
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">
                                                    {hotel.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {hotel.code}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {hotel.country_name} /{' '}
                                                {hotel.city_name}
                                            </TableCell>
                                            <TableCell>
                                                {hotel.product_code ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                {
                                                    toPeriodRates(hotel.prices)
                                                        .length
                                                }{' '}
                                                period
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${hotel.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {hotel.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            {filters.search
                                                ? 'Data hotel tidak ditemukan.'
                                                : 'Belum ada data hotel.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {hotels.links.length > 3 ? (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-4">
                            {hotels.links.map((link, index) =>
                                link.url ? (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => router.visit(link.url!)}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            <Sheet
                open={bulkOpen}
                onOpenChange={(open) => {
                    setBulkOpen(open);
                    if (!open) {
                        bulkForm.setData({ hotels: [blankBulkHotel()] });
                        bulkForm.clearErrors();
                    }
                }}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-6xl"
                >
                    <SheetHeader>
                        <SheetTitle>Bulk Create Hotel</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submitBulk} className="mt-6 space-y-4">
                        <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                            <div className="grid gap-2 md:grid-cols-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={downloadBulkTemplate}
                                    className="w-full"
                                >
                                    Download Template
                                </Button>
                                <Input
                                    type="file"
                                    accept=".xlsx,.xls,.csv,.pdf"
                                    onChange={importBulkFile}
                                    className="w-full"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        bulkForm.setData('hotels', [
                                            ...bulkForm.data.hotels,
                                            blankBulkHotel(),
                                        ])
                                    }
                                    className="w-full"
                                >
                                    Tambah Baris Hotel
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {bulkForm.data.hotels.map(
                                (hotelItem, hotelIndex) => {
                                    const bulkCityOptions = cityOptions.filter(
                                        (city) =>
                                            hotelItem.country_id === '' ||
                                            String(city.country_id) ===
                                                hotelItem.country_id,
                                    );

                                    return (
                                        <div
                                            key={hotelIndex}
                                            className="space-y-4 rounded-xl border border-border/60 p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold">
                                                    Hotel #{hotelIndex + 1}
                                                </p>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="destructive"
                                                    disabled={
                                                        bulkForm.data.hotels
                                                            .length === 1
                                                    }
                                                    onClick={() =>
                                                        bulkForm.setData(
                                                            'hotels',
                                                            bulkForm.data.hotels.filter(
                                                                (_, index) =>
                                                                    index !==
                                                                    hotelIndex,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Hapus Hotel
                                                </Button>
                                            </div>

                                            <div className="grid gap-3 lg:grid-cols-12">
                                                <div className="lg:col-span-3">
                                                    <Label className="mb-1.5 block">
                                                        Negara
                                                    </Label>
                                                    <Select
                                                        value={
                                                            hotelItem.country_id
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            setBulkHotelData(
                                                                hotelIndex,
                                                                'country_id',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih negara" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {countryOptions.map(
                                                                (country) => (
                                                                    <SelectItem
                                                                        key={
                                                                            country.id
                                                                        }
                                                                        value={String(
                                                                            country.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            country.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="lg:col-span-3">
                                                    <Label className="mb-1.5 block">
                                                        Kota
                                                    </Label>
                                                    <Select
                                                        value={
                                                            hotelItem.city_id
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            setBulkHotelData(
                                                                hotelIndex,
                                                                'city_id',
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih kota" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {bulkCityOptions.map(
                                                                (city) => (
                                                                    <SelectItem
                                                                        key={
                                                                            city.id
                                                                        }
                                                                        value={String(
                                                                            city.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            city.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="lg:col-span-3">
                                                    <Label className="mb-1.5 block">
                                                        Nama Hotel
                                                    </Label>
                                                    <Input
                                                        value={hotelItem.name}
                                                        onChange={(event) =>
                                                            setBulkHotelData(
                                                                hotelIndex,
                                                                'name',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="lg:col-span-3">
                                                    <Label className="mb-1.5 block">
                                                        Mata Uang
                                                    </Label>
                                                    <Input
                                                        value={
                                                            hotelItem.currency
                                                        }
                                                        onChange={(event) =>
                                                            setBulkHotelData(
                                                                hotelIndex,
                                                                'currency',
                                                                event.target.value.toUpperCase(),
                                                            )
                                                        }
                                                        maxLength={3}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3 rounded-lg border border-border/50 p-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold">
                                                        Pricing per Period
                                                        (DBL/TRPL/Quad)
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const hotelsPayload =
                                                                [
                                                                    ...bulkForm
                                                                        .data
                                                                        .hotels,
                                                                ];
                                                            hotelsPayload[
                                                                hotelIndex
                                                            ] = {
                                                                ...hotelsPayload[
                                                                    hotelIndex
                                                                ],
                                                                period_rates: [
                                                                    ...hotelsPayload[
                                                                        hotelIndex
                                                                    ]
                                                                        .period_rates,
                                                                    blankPeriodRate(),
                                                                ],
                                                            };
                                                            bulkForm.setData(
                                                                'hotels',
                                                                hotelsPayload,
                                                            );
                                                        }}
                                                    >
                                                        Tambah Period
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {hotelItem.period_rates.map(
                                                        (
                                                            periodRow,
                                                            periodIndex,
                                                        ) => (
                                                            <div
                                                                key={
                                                                    periodIndex
                                                                }
                                                                className="grid gap-2 rounded-lg border border-border/40 p-3 lg:grid-cols-12"
                                                            >
                                                                <div className="lg:col-span-2">
                                                                    <Label className="mb-1 block text-xs">
                                                                        From
                                                                    </Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={
                                                                            periodRow.period_start
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setBulkPeriodRate(
                                                                                hotelIndex,
                                                                                periodIndex,
                                                                                'period_start',
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="lg:col-span-2">
                                                                    <Label className="mb-1 block text-xs">
                                                                        To
                                                                    </Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={
                                                                            periodRow.period_end
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setBulkPeriodRate(
                                                                                hotelIndex,
                                                                                periodIndex,
                                                                                'period_end',
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="lg:col-span-2">
                                                                    <Label className="mb-1 block text-xs">
                                                                        DBL
                                                                    </Label>
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        value={
                                                                            periodRow.dbl_price
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setBulkPeriodRate(
                                                                                hotelIndex,
                                                                                periodIndex,
                                                                                'dbl_price',
                                                                                Number(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="lg:col-span-2">
                                                                    <Label className="mb-1 block text-xs">
                                                                        TRPL
                                                                    </Label>
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        value={
                                                                            periodRow.trpl_price
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setBulkPeriodRate(
                                                                                hotelIndex,
                                                                                periodIndex,
                                                                                'trpl_price',
                                                                                Number(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="lg:col-span-2">
                                                                    <Label className="mb-1 block text-xs">
                                                                        Quad
                                                                    </Label>
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        value={
                                                                            periodRow.quad_price
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setBulkPeriodRate(
                                                                                hotelIndex,
                                                                                periodIndex,
                                                                                'quad_price',
                                                                                Number(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="flex items-end lg:col-span-2">
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        disabled={
                                                                            hotelItem
                                                                                .period_rates
                                                                                .length ===
                                                                            1
                                                                        }
                                                                        onClick={() => {
                                                                            const hotelsPayload =
                                                                                [
                                                                                    ...bulkForm
                                                                                        .data
                                                                                        .hotels,
                                                                                ];
                                                                            hotelsPayload[
                                                                                hotelIndex
                                                                            ] =
                                                                                {
                                                                                    ...hotelsPayload[
                                                                                        hotelIndex
                                                                                    ],
                                                                                    period_rates:
                                                                                        hotelsPayload[
                                                                                            hotelIndex
                                                                                        ].period_rates.filter(
                                                                                            (
                                                                                                _,
                                                                                                rowIndex,
                                                                                            ) =>
                                                                                                rowIndex !==
                                                                                                periodIndex,
                                                                                        ),
                                                                                };
                                                                            bulkForm.setData(
                                                                                'hotels',
                                                                                hotelsPayload,
                                                                            );
                                                                        }}
                                                                    >
                                                                        Hapus
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>

                        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t bg-background/95 pt-4 pb-1 backdrop-blur">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setBulkOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={bulkForm.processing}
                            >
                                {bulkForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Semua Hotel'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={editingHotel !== null}
                onOpenChange={(open) => !open && setEditingHotel(null)}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto bg-background sm:max-w-2xl"
                >
                    <SheetHeader>
                        <SheetTitle>
                            {editingHotel === 'new'
                                ? 'Tambah Hotel'
                                : 'Edit Hotel'}
                        </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4">
                            <p className="text-sm font-semibold text-foreground">
                                Informasi Hotel
                            </p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="mb-1.5 block">
                                        Negara
                                    </Label>
                                    <Select
                                        value={form.data.country_id}
                                        onValueChange={(value) =>
                                            form.setData('country_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih negara" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryOptions.map((country) => (
                                                <SelectItem
                                                    key={country.id}
                                                    value={String(country.id)}
                                                >
                                                    {country.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-1.5 block">Kota</Label>
                                    <Select
                                        value={form.data.city_id}
                                        onValueChange={(value) =>
                                            form.setData('city_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kota" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {citySelection.map((city) => (
                                                <SelectItem
                                                    key={city.id}
                                                    value={String(city.id)}
                                                >
                                                    {city.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-1.5 block">
                                        Nama Hotel
                                    </Label>
                                    <Input
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1.5 block">
                                        Mata Uang
                                    </Label>
                                    <Input
                                        value={form.data.currency}
                                        onChange={(event) =>
                                            form.setData(
                                                'currency',
                                                event.target.value.toUpperCase(),
                                            )
                                        }
                                        maxLength={3}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="mb-1.5 block">
                                    Deskripsi
                                </Label>
                                <Textarea
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">
                                    Pricing per Period (DBL/TRPL/Quad)
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        form.setData('period_rates', [
                                            ...form.data.period_rates,
                                            blankPeriodRate(),
                                        ])
                                    }
                                >
                                    Tambah Period
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {form.data.period_rates.map((row, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 lg:grid-cols-12"
                                    >
                                        <div className="lg:col-span-2">
                                            <Label className="mb-1 block text-xs">
                                                From
                                            </Label>
                                            <Input
                                                type="date"
                                                value={row.period_start}
                                                onChange={(event) =>
                                                    setPeriodRate(
                                                        index,
                                                        'period_start',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <Label className="mb-1 block text-xs">
                                                To
                                            </Label>
                                            <Input
                                                type="date"
                                                value={row.period_end}
                                                onChange={(event) =>
                                                    setPeriodRate(
                                                        index,
                                                        'period_end',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <Label className="mb-1 block text-xs">
                                                DBL
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={row.dbl_price}
                                                onChange={(event) =>
                                                    setPeriodRate(
                                                        index,
                                                        'dbl_price',
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <Label className="mb-1 block text-xs">
                                                TRPL
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={row.trpl_price}
                                                onChange={(event) =>
                                                    setPeriodRate(
                                                        index,
                                                        'trpl_price',
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <Label className="mb-1 block text-xs">
                                                Quad
                                            </Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={row.quad_price}
                                                onChange={(event) =>
                                                    setPeriodRate(
                                                        index,
                                                        'quad_price',
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex items-end lg:col-span-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                disabled={
                                                    form.data.period_rates
                                                        .length === 1
                                                }
                                                onClick={() =>
                                                    form.setData(
                                                        'period_rates',
                                                        form.data.period_rates.filter(
                                                            (_, rowIndex) =>
                                                                rowIndex !==
                                                                index,
                                                        ),
                                                    )
                                                }
                                            >
                                                Hapus
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-border/70 bg-background/95 pt-4 pb-1 backdrop-blur">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingHotel(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}

function toPeriodRates(
    prices: Array<PriceRow & { room_type_name: string }>,
): PeriodRateRow[] {
    const grouped: Record<string, PeriodRateRow> = {};
    for (const price of prices) {
        const key = `${price.period_start}|${price.period_end}`;
        if (!grouped[key]) {
            grouped[key] = {
                period_start: price.period_start,
                period_end: price.period_end,
                dbl_price: 0,
                trpl_price: 0,
                quad_price: 0,
            };
        }
        const roomTypeName = price.room_type_name.trim().toUpperCase();
        if (roomTypeName === 'DBL') {
            grouped[key].dbl_price = price.price;
        } else if (roomTypeName === 'TRPL') {
            grouped[key].trpl_price = price.price;
        } else if (roomTypeName === 'QUAD') {
            grouped[key].quad_price = price.price;
        }
    }
    return Object.values(grouped).sort((a, b) =>
        a.period_start.localeCompare(b.period_start),
    );
}
