import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { usePermission } from '@/hooks/use-permission';
import { fetchWithCsrf } from '@/lib/csrf-fetch';
import { formatDate } from '@/lib/date-format';
import { router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Loader2,
    MoreHorizontal,
    Plus,
    SquarePen,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import FormValidationSummary, {
    firstValidationMessage,
    type FormValidationErrors,
} from './FormValidationSummary';

type PriceRow = {
    room_type_id: number | string;
    period_start: string;
    period_end: string;
    price: number;
    broker_key?: string;
    broker_name?: string;
};

type ProductHotelRoomType = 'DBL' | 'TRPL' | 'QUAD';

function normalizeProductHotelRoomType(
    roomType: string | null | undefined,
): ProductHotelRoomType | null {
    const normalized = (roomType ?? '').trim().toUpperCase();

    if (normalized === 'DBL' || normalized === 'DOUBLE') {
        return 'DBL';
    }

    if (normalized === 'TRPL' || normalized === 'TRIPLE') {
        return 'TRPL';
    }

    if (normalized === 'QUAD' || normalized === 'QUADRUPLE') {
        return 'QUAD';
    }

    return null;
}

type PeriodRateRow = {
    ui_id?: string;
    broker_group_id?: string;
    broker_key?: string;
    broker_name?: string;
    period_start: string;
    period_end: string;
    dbl_price: number | null;
    trpl_price: number | null;
    quad_price: number | null;
    import_status?: ImportStatus;
    warnings?: string[];
    conflicts?: string[];
    comparison?: Record<
        ProductHotelRoomType,
        {
            existing: number | null;
            incoming: number | null;
            action: string;
        }
    >;
};

type ImportStatus =
    | 'create'
    | 'update'
    | 'new_period'
    | 'no_change'
    | 'warning'
    | 'conflict';

type HotelImportRow = {
    country: string | null;
    city: string | null;
    hotel: string;
    currency: string | null;
    period_start: string;
    period_end: string;
    dbl: number | null;
    trpl: number | null;
    quad: number | null;
    source: 'csv' | 'xls' | 'xlsx' | 'pdf';
    warnings: string[];
};

type ImportSummary = {
    hotels_detected: number;
    periods_detected: number;
    hotels_to_create: number;
    hotels_existing: number;
    periods_to_create: number;
    rates_to_update: number;
    rates_unchanged: number;
    warnings: number;
    conflicts: number;
};

type ImportResult = {
    hotels: BulkHotelForm[];
    summary: ImportSummary;
};

type QueuedPdfImportResponse = {
    status: 'queued';
    import_id: string;
    poll_after_ms?: number;
    message?: string;
};

type PdfImportStatusResponse = {
    status: 'queued' | 'processing' | 'completed' | 'failed';
    message?: string;
    result?: ImportResult;
};

type HotelPeriodRateRow = PeriodRateRow & {
    pricesByRoomType: {
        DBL: number;
        TRPL: number;
        QUAD: number;
    };
};

type HotelBrokerGroup = {
    group_id: string;
    broker_key?: string;
    broker_name: string;
    periods: Array<{
        ui_id?: string;
        period_start: string;
        period_end: string;
        pricesByRoomType: {
            DBL: number;
            TRPL: number;
            QUAD: number;
        };
    }>;
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
    prices: Array<
        PriceRow & {
            room_type_name: string;
            broker_key?: string;
            broker_name?: string;
        }
    >;
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
    currencyOptions: Array<{ code: string; name: string }>;
};

type ProductCategoryHotelProps = Props;

const getDefaultCurrency = (
    currencyOptions: Array<{ code: string; name: string }>,
): string => currencyOptions[0]?.code ?? 'IDR';

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
    existing_hotel_id?: number | null;
    existing_currency?: string | null;
    import_status?: ImportStatus;
    warnings?: string[];
    conflicts?: string[];
};

type BulkHotelPayload = {
    country_id: string;
    city_id: string;
    name: string;
    currency: string;
    is_active: boolean;
    prices: PriceRow[];
    existing_hotel_id?: number | null;
};

const blankPeriodRate = (
    brokerName = 'Broker 1',
    brokerGroupId?: string,
): PeriodRateRow => {
    const brokerKey = brokerGroupId ?? createUiId('broker');

    return {
        ui_id: createUiId('period'),
        broker_group_id: brokerKey,
        broker_key: brokerKey,
        broker_name: brokerName,
        period_start: '',
        period_end: '',
        dbl_price: 0,
        trpl_price: 0,
        quad_price: 0,
    };
};

const blankForm = (currency = 'IDR'): HotelForm => ({
    country_id: '',
    city_id: '',
    name: '',
    description: '',
    currency,
    is_active: true,
    period_rates: [blankPeriodRate()],
});

const blankBulkHotel = (currency = 'IDR'): BulkHotelForm => ({
    country_id: '',
    city_id: '',
    name: '',
    currency,
    is_active: true,
    period_rates: [blankPeriodRate()],
});

const duplicatePeriodConflictPattern =
    /^Periode .+ (muncul|digunakan) lebih dari sekali/i;

function warningMatchesResolvedRate(
    warning: string,
    roomType: ProductHotelRoomType,
): boolean {
    const normalized = warning.toUpperCase();
    const labels: Record<ProductHotelRoomType, string[]> = {
        DBL: ['RATE DOUBLE', 'RATE DBL', 'DBL TIDAK TERBACA'],
        TRPL: ['RATE TRIPLE', 'RATE TRPL', 'TRPL TIDAK TERBACA'],
        QUAD: ['RATE QUAD', 'QUAD TIDAK TERBACA'],
    };

    return labels[roomType].some((label) => normalized.includes(label));
}

function revalidateHotelDraft(hotel: BulkHotelForm): BulkHotelForm {
    const periodRates = hotel.period_rates.map((periodRate) => {
        const warnings = (periodRate.warnings ?? []).filter((warning) => {
            if (hotel.currency && /mata uang tidak terdeteksi/i.test(warning)) {
                return false;
            }
            if (
                periodRate.dbl_price !== null &&
                warningMatchesResolvedRate(warning, 'DBL')
            ) {
                return false;
            }
            if (
                periodRate.trpl_price !== null &&
                warningMatchesResolvedRate(warning, 'TRPL')
            ) {
                return false;
            }
            if (
                periodRate.quad_price !== null &&
                warningMatchesResolvedRate(warning, 'QUAD')
            ) {
                return false;
            }

            return true;
        });

        const conflicts = (periodRate.conflicts ?? []).filter(
            (conflict) => !duplicatePeriodConflictPattern.test(conflict),
        );

        return {
            ...periodRate,
            warnings,
            conflicts,
            import_status:
                conflicts.length === 0 &&
                periodRate.import_status === 'conflict'
                    ? hotel.existing_hotel_id
                        ? 'update'
                        : 'create'
                    : periodRate.import_status,
        };
    });

    const duplicateGroups = new Map<string, number[]>();
    periodRates.forEach((periodRate, index) => {
        if (!periodRate.period_start || !periodRate.period_end) {
            return;
        }

        const brokerKey = normalizeKey(
            periodRate.broker_key ||
                periodRate.broker_group_id ||
                periodRate.broker_name ||
                'broker-1',
        );
        const periodKey = `${brokerKey}|${periodRate.period_start}|${periodRate.period_end}`;
        duplicateGroups.set(periodKey, [
            ...(duplicateGroups.get(periodKey) ?? []),
            index,
        ]);
    });

    duplicateGroups.forEach((indexes) => {
        if (indexes.length < 2) {
            return;
        }

        const firstPeriod = periodRates[indexes[0]];
        const message = `Periode ${firstPeriod.period_start} sampai ${firstPeriod.period_end} digunakan lebih dari sekali. Ubah tanggal atau hapus salah satu periode.`;
        indexes.forEach((index) => {
            periodRates[index] = {
                ...periodRates[index],
                import_status: 'conflict',
                conflicts: [...(periodRates[index].conflicts ?? []), message],
            };
        });
    });

    const conflicts = (hotel.conflicts ?? []).flatMap((conflict) => {
        if (duplicatePeriodConflictPattern.test(conflict)) {
            return [];
        }
        if (hotel.currency && conflict === 'Mata uang belum ditentukan.') {
            return [];
        }
        if (
            hotel.currency &&
            conflict.startsWith('Mata uang dalam file tidak konsisten:')
        ) {
            return [];
        }
        if (
            /^Konflik mata uang: database [A-Z]{3}, file [A-Z]{3}\.$/.test(
                conflict,
            )
        ) {
            return [];
        }
        if (
            hotel.country_id &&
            hotel.city_id &&
            conflict === 'Negara atau kota belum cocok dengan data master.'
        ) {
            return [];
        }

        return [conflict];
    });

    if (!hotel.currency) {
        conflicts.push('Mata uang belum ditentukan.');
    }
    if (!hotel.country_id || !hotel.city_id) {
        conflicts.push('Negara atau kota belum cocok dengan data master.');
    }

    const hasPeriodConflict = periodRates.some(
        (periodRate) => (periodRate.conflicts?.length ?? 0) > 0,
    );
    const existingCurrency = hotel.existing_currency?.toUpperCase() ?? '';
    const incomingCurrency = hotel.currency.toUpperCase();
    const currencyWillChange = Boolean(
        hotel.existing_hotel_id &&
            existingCurrency &&
            incomingCurrency &&
            existingCurrency !== incomingCurrency,
    );
    const warnings = (hotel.warnings ?? []).filter(
        (warning) =>
            !/^Mata uang hotel existing akan diperbarui dari /i.test(warning) &&
            !/^Mata uang berbeda: database /i.test(warning),
    );

    if (currencyWillChange) {
        warnings.push(
            `Mata uang hotel existing akan diperbarui dari ${existingCurrency} menjadi ${incomingCurrency} saat disimpan.`,
        );
    }

    return {
        ...hotel,
        period_rates: periodRates,
        warnings: [
            ...new Set(
                warnings.filter((warning) => {
                    if (
                        hotel.currency &&
                        /mata uang (tidak terdeteksi|belum ditentukan)/i.test(
                            warning,
                        )
                    ) {
                        return false;
                    }
                    if (
                        hotel.country_id &&
                        hotel.city_id &&
                        /^(Negara|Kota).*(tidak ditemukan|ambigu)|^Kota belum terdeteksi/i.test(
                            warning,
                        )
                    ) {
                        return false;
                    }

                    return true;
                }),
            ),
        ],
        conflicts: [...new Set(conflicts)],
        import_status:
            conflicts.length > 0 || hasPeriodConflict
                ? 'conflict'
                : currencyWillChange
                  ? 'update'
                  : hotel.import_status === 'conflict'
                    ? hotel.existing_hotel_id
                        ? 'update'
                        : 'create'
                    : hotel.import_status,
    };
}

const createUiId = (prefix: string): string =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

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

const normalizeImportDate = (value: unknown): string => {
    const text = normalizeCell(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return text;
    }

    const matched = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
    if (!matched) {
        return text;
    }

    const year = matched[3].length === 2 ? `20${matched[3]}` : matched[3];

    return `${year}-${matched[2].padStart(2, '0')}-${matched[1].padStart(2, '0')}`;
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

type BrokerPeriodGroup = {
    group_id: string;
    broker_name: string;
    broker_key?: string;
    rows: Array<{
        index: number;
        row: PeriodRateRow;
    }>;
};

function groupPeriodRatesByBroker(
    periodRates: PeriodRateRow[],
): BrokerPeriodGroup[] {
    const groups = new Map<string, BrokerPeriodGroup>();

    periodRates.forEach((row, index) => {
        const brokerName = normalizeCell(row.broker_name || 'Broker 1');
        const key =
            normalizeKey(
                row.broker_group_id ||
                    row.broker_key ||
                    row.ui_id ||
                    brokerName,
            ) || `broker-${index}`;
        const existing = groups.get(key);

        if (existing) {
            existing.rows.push({ index, row });
            return;
        }

        groups.set(key, {
            group_id: row.broker_group_id || row.broker_key || row.ui_id || key,
            broker_key: row.broker_key || row.broker_group_id || key,
            broker_name: brokerName,
            rows: [{ index, row }],
        });
    });

    return Array.from(groups.values()).map((group) => ({
        group_id: group.group_id,
        broker_key: group.broker_key,
        broker_name: group.broker_name,
        rows: group.rows,
    }));
}

function groupHotelPricesByBroker(
    prices: Array<
        PriceRow & {
            room_type_name: string;
            broker_key?: string;
            broker_name?: string;
        }
    >,
): HotelBrokerGroup[] {
    const brokerGroups = new Map<string, HotelBrokerGroup>();

    for (const price of prices) {
        const brokerName = normalizeCell(price.broker_name || 'Broker 1');
        const brokerKey =
            normalizeKey(price.broker_key || brokerName) || 'broker-1';
        const periodKey = `${price.period_start}|${price.period_end}`;
        const brokerGroup = brokerGroups.get(brokerKey);

        if (!brokerGroup) {
            brokerGroups.set(brokerKey, {
                group_id: brokerKey,
                broker_name: brokerName,
                periods: [
                    {
                        ui_id: `period-${periodKey}`,
                        period_start: price.period_start,
                        period_end: price.period_end,
                        pricesByRoomType: {
                            DBL: 0,
                            TRPL: 0,
                            QUAD: 0,
                        },
                    },
                ],
            });
            continue;
        }

        const existingPeriod = brokerGroup.periods.find(
            (period) =>
                `${period.period_start}|${period.period_end}` === periodKey,
        );

        if (!existingPeriod) {
            brokerGroup.periods.push({
                ui_id: `period-${periodKey}`,
                period_start: price.period_start,
                period_end: price.period_end,
                pricesByRoomType: {
                    DBL: 0,
                    TRPL: 0,
                    QUAD: 0,
                },
            });
        }
    }

    for (const price of prices) {
        const brokerName = normalizeCell(price.broker_name || 'Broker 1');
        const brokerKey =
            normalizeKey(price.broker_key || brokerName) || 'broker-1';
        const brokerGroup = brokerGroups.get(brokerKey);
        if (!brokerGroup) {
            continue;
        }

        const period = brokerGroup.periods.find(
            (item) =>
                item.period_start === price.period_start &&
                item.period_end === price.period_end,
        );
        if (!period) {
            continue;
        }

        const roomTypeName = normalizeProductHotelRoomType(
            price.room_type_name,
        );
        if (roomTypeName) {
            period.pricesByRoomType[roomTypeName] = price.price;
        }
    }

    return Array.from(brokerGroups.values()).map((group) => ({
        ...group,
        periods: group.periods.sort((a, b) => {
            const aStart = a.period_start || '9999-12-31';
            const bStart = b.period_start || '9999-12-31';
            return (
                aStart.localeCompare(bStart) ||
                a.period_end.localeCompare(b.period_end)
            );
        }),
    }));
}

type BrokerPricingEditorProps = {
    title: string;
    subtitle: string;
    periodRates: PeriodRateRow[];
    onChange: (periodRates: PeriodRateRow[]) => void;
    inlineEdit?: boolean;
};

function BrokerPricingEditor({
    title,
    subtitle,
    periodRates,
    onChange,
    inlineEdit = false,
}: BrokerPricingEditorProps) {
    const [editingBrokerGroupId, setEditingBrokerGroupId] = useState<
        string | null
    >(null);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(
        null,
    );

    const brokerGroups = useMemo(
        () => groupPeriodRatesByBroker(periodRates),
        [periodRates],
    );

    function getNextBrokerName(): string {
        const existingNames = new Set(
            brokerGroups.map((group) => normalizeKey(group.broker_name)),
        );

        let candidateIndex = brokerGroups.length + 1;
        let candidateName = `Broker ${candidateIndex}`;

        while (existingNames.has(normalizeKey(candidateName))) {
            candidateIndex += 1;
            candidateName = `Broker ${candidateIndex}`;
        }

        return candidateName;
    }

    function setPeriodRate(
        index: number,
        key: keyof PeriodRateRow,
        value: string | number | null,
    ): void {
        const nextPeriodRates = [...periodRates];
        nextPeriodRates[index] = {
            ...nextPeriodRates[index],
            [key]: value,
        };
        onChange(nextPeriodRates);
    }

    function setBrokerGroupName(
        brokerGroupId: string,
        nextBrokerName: string,
    ): void {
        onChange(
            periodRates.map((periodRate) =>
                (periodRate.broker_group_id ||
                    periodRate.broker_key ||
                    periodRate.ui_id ||
                    '') === brokerGroupId
                    ? { ...periodRate, broker_name: nextBrokerName }
                    : periodRate,
            ),
        );
    }

    function addBrokerGroup(): void {
        const nextBrokerName = getNextBrokerName();
        const nextRow = blankPeriodRate(nextBrokerName);
        onChange([...periodRates, nextRow]);
        if (!inlineEdit) {
            setEditingBrokerGroupId(nextRow.broker_group_id ?? null);
            setEditingSessionId(nextRow.ui_id ?? null);
        }
    }

    function addSeasonToBroker(groupId: string): void {
        const brokerGroup = brokerGroups.find(
            (group) => group.group_id === groupId,
        );
        const brokerKey = brokerGroup?.broker_key ?? groupId;
        const nextRow = blankPeriodRate(
            brokerGroup?.broker_name ?? 'Broker 1',
            brokerKey,
        );
        nextRow.broker_group_id = brokerKey;
        nextRow.broker_key = brokerKey;
        onChange([...periodRates, nextRow]);
        if (!inlineEdit) {
            setEditingBrokerGroupId(groupId);
            setEditingSessionId(nextRow.ui_id ?? null);
        }
    }

    function removeBrokerGroup(groupId: string): void {
        const remainingRows = periodRates.filter(
            (periodRate) =>
                (periodRate.broker_group_id ||
                    periodRate.broker_key ||
                    periodRate.ui_id ||
                    '') !== groupId,
        );

        onChange(
            remainingRows.length > 0 ? remainingRows : [blankPeriodRate()],
        );
        if (!inlineEdit) {
            setEditingBrokerGroupId(null);
            setEditingSessionId(null);
        }
    }

    function removeSeasonRow(rowId: string): void {
        const remainingRows = periodRates.filter(
            (periodRate) => (periodRate.ui_id || '') !== rowId,
        );

        onChange(
            remainingRows.length > 0 ? remainingRows : [blankPeriodRate()],
        );
        if (!inlineEdit && editingSessionId === rowId) {
            setEditingSessionId(null);
        }
    }

    return (
        <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBrokerGroup}
                >
                    Tambah Broker
                </Button>
            </div>

            <div className="mt-3 space-y-3">
                {brokerGroups.map((group) => {
                    const isEditingBroker =
                        inlineEdit || editingBrokerGroupId === group.group_id;

                    return (
                        <div
                            key={group.group_id}
                            className="space-y-2 rounded-2xl border border-border/40 bg-card p-2.5 shadow-sm"
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                                    <div className="min-w-0">
                                        <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                            Broker
                                        </Label>
                                        {isEditingBroker ? (
                                            <Input
                                                className="h-9"
                                                value={group.broker_name}
                                                onChange={(event) =>
                                                    setBrokerGroupName(
                                                        group.group_id,
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        ) : (
                                            <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm font-medium">
                                                {group.broker_name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full border border-border/40 bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
                                            {group.rows.length} season
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {inlineEdit ? (
                                        <span className="rounded-full border border-border/40 bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
                                            Isi langsung
                                        </span>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setEditingBrokerGroupId(
                                                    isEditingBroker
                                                        ? null
                                                        : group.group_id,
                                                )
                                            }
                                        >
                                            {isEditingBroker
                                                ? 'Selesai'
                                                : 'Edit Broker'}
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            addSeasonToBroker(group.group_id)
                                        }
                                    >
                                        + Tambah Session
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            removeBrokerGroup(group.group_id)
                                        }
                                        aria-label="Hapus broker"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {group.rows.map(({ index, row }) => {
                                    const isEditingSession =
                                        inlineEdit ||
                                        editingSessionId === row.ui_id;
                                    const hasRowConflict =
                                        (row.conflicts?.length ?? 0) > 0;
                                    const hasRowWarning =
                                        (row.warnings?.length ?? 0) > 0;

                                    return isEditingSession ? (
                                        <div
                                            key={`${group.group_id}-${row.ui_id}`}
                                            className={`grid gap-2 rounded-xl border p-2 transition-colors sm:grid-cols-2 lg:grid-cols-12 ${
                                                hasRowConflict
                                                    ? 'border-red-400 bg-red-50 ring-2 ring-red-200/70 dark:border-red-800 dark:bg-red-950/25 dark:ring-red-950'
                                                    : hasRowWarning
                                                      ? 'border-amber-300 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/15'
                                                      : 'border-border/30 bg-background'
                                            }`}
                                        >
                                            {row.import_status ||
                                            (row.warnings?.length ?? 0) > 0 ||
                                            (row.conflicts?.length ?? 0) > 0 ? (
                                                <div
                                                    className={`space-y-1.5 rounded-lg p-2.5 sm:col-span-2 lg:col-span-12 ${
                                                        hasRowConflict
                                                            ? 'bg-red-100/80 text-red-950 dark:bg-red-950/50 dark:text-red-100'
                                                            : 'bg-amber-100/70 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100'
                                                    }`}
                                                >
                                                    <ImportStatusBadge
                                                        status={
                                                            row.import_status
                                                        }
                                                    />
                                                    {row.conflicts?.map(
                                                        (message) => (
                                                            <p
                                                                key={message}
                                                                className="text-xs font-medium break-words text-red-800 dark:text-red-200"
                                                            >
                                                                {message}
                                                            </p>
                                                        ),
                                                    )}
                                                    {row.warnings?.map(
                                                        (message) => (
                                                            <p
                                                                key={message}
                                                                className="text-xs break-words text-amber-800 dark:text-amber-200"
                                                            >
                                                                {message}
                                                            </p>
                                                        ),
                                                    )}
                                                </div>
                                            ) : null}
                                            <div className="lg:col-span-2">
                                                <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    From
                                                </Label>
                                                <Input
                                                    type="date"
                                                    className="h-9"
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
                                                <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    To
                                                </Label>
                                                <Input
                                                    type="date"
                                                    className="h-9"
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
                                                <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    DBL
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Kosong"
                                                    className={`h-9 ${
                                                        row.dbl_price === null
                                                            ? 'border-amber-400 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'
                                                            : ''
                                                    }`}
                                                    value={row.dbl_price ?? ''}
                                                    onChange={(event) =>
                                                        setPeriodRate(
                                                            index,
                                                            'dbl_price',
                                                            event.target
                                                                .value === ''
                                                                ? null
                                                                : Number(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="lg:col-span-2">
                                                <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    TRPL
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Kosong"
                                                    className={`h-9 ${
                                                        row.trpl_price === null
                                                            ? 'border-amber-400 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'
                                                            : ''
                                                    }`}
                                                    value={row.trpl_price ?? ''}
                                                    onChange={(event) =>
                                                        setPeriodRate(
                                                            index,
                                                            'trpl_price',
                                                            event.target
                                                                .value === ''
                                                                ? null
                                                                : Number(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="lg:col-span-2">
                                                <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                    Quad
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    placeholder="Kosong"
                                                    className={`h-9 ${
                                                        row.quad_price === null
                                                            ? 'border-amber-400 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'
                                                            : ''
                                                    }`}
                                                    value={row.quad_price ?? ''}
                                                    onChange={(event) =>
                                                        setPeriodRate(
                                                            index,
                                                            'quad_price',
                                                            event.target
                                                                .value === ''
                                                                ? null
                                                                : Number(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="flex items-end gap-2 lg:col-span-2">
                                                {inlineEdit ? null : (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setEditingSessionId(
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        Selesai
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="h-9 w-9"
                                                    onClick={() =>
                                                        removeSeasonRow(
                                                            row.ui_id || '',
                                                        )
                                                    }
                                                    aria-label="Hapus periode"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            key={`${group.group_id}-${row.ui_id}`}
                                            className="flex flex-col gap-2 rounded-xl border border-border/30 bg-background px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="min-w-0 space-y-0.5">
                                                <span className="block font-medium text-foreground">
                                                    {formatDate(
                                                        row.period_start,
                                                    )}
                                                    {' - '}
                                                    {formatDate(row.period_end)}
                                                </span>
                                                <span className="block text-muted-foreground">
                                                    DBL: {row.dbl_price ?? '-'}
                                                    {' / '}
                                                    TRPL:{' '}
                                                    {row.trpl_price ?? '-'}
                                                    {' / '}
                                                    Quad:{' '}
                                                    {row.quad_price ?? '-'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setEditingSessionId(
                                                            row.ui_id || null,
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-9 w-9"
                                                    onClick={() =>
                                                        removeSeasonRow(
                                                            row.ui_id || '',
                                                        )
                                                    }
                                                    aria-label="Hapus periode"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ImportSummaryItem({
    label,
    value,
    attention = false,
}: {
    label: string;
    value: number;
    attention?: boolean;
}) {
    return (
        <div
            className={`rounded-lg border px-3 py-2 ${
                attention
                    ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100'
                    : 'border-border/40 bg-muted/20'
            }`}
        >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    );
}

function ImportStatusBadge({ status }: { status?: ImportStatus }) {
    if (!status) {
        return null;
    }

    const labels: Record<ImportStatus, string> = {
        create: 'CREATE',
        update: 'UPDATE',
        new_period: 'NEW PERIOD',
        no_change: 'NO CHANGE',
        warning: 'WARNING',
        conflict: 'CONFLICT',
    };

    return (
        <Badge
            variant={status === 'conflict' ? 'destructive' : 'secondary'}
            className={
                status === 'create' || status === 'new_period'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                    : status === 'update'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                      : status === 'warning'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100'
                        : undefined
            }
        >
            {labels[status]}
        </Badge>
    );
}

function hotelStatusBadgeClass(isActive: boolean): string {
    return isActive
        ? 'bg-emerald-100 text-emerald-800'
        : 'bg-slate-100 text-slate-900';
}

export default function ProductCategoryHotel({
    hotels,
    filters,
    countryOptions,
    cityOptions,
    roomTypeOptions,
    currencyOptions,
}: ProductCategoryHotelProps) {
    const { can } = usePermission('product');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');

    const [editingHotel, setEditingHotel] = useState<HotelItem | 'new' | null>(
        null,
    );
    const [editingBrokerGroupId, setEditingBrokerGroupId] = useState<
        string | null
    >(null);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(
        null,
    );
    const [bulkOpen, setBulkOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importSummary, setImportSummary] = useState<ImportSummary | null>(
        null,
    );
    const [pdfDefaultCountryId, setPdfDefaultCountryId] = useState('');
    const [pdfDefaultCurrency, setPdfDefaultCurrency] = useState('');
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    const [selectedHotelIds, setSelectedHotelIds] = useState<number[]>([]);
    const [hotelSubmissionErrors, setHotelSubmissionErrors] =
        useState<FormValidationErrors>({});
    const [bulkSubmissionErrors, setBulkSubmissionErrors] =
        useState<FormValidationErrors>({});
    const [isSavingHotel, setIsSavingHotel] = useState(false);
    const [isSavingBulk, setIsSavingBulk] = useState(false);

    const defaultCurrency = getDefaultCurrency(currencyOptions);
    const form = useForm<HotelForm>(blankForm(defaultCurrency));
    const bulkForm = useForm<{ hotels: BulkHotelForm[] }>({
        hotels: [blankBulkHotel(defaultCurrency)],
    });
    const draftIssueSummary = useMemo(
        () =>
            bulkForm.data.hotels.reduce(
                (summary, hotel) => ({
                    conflicts:
                        summary.conflicts +
                        (hotel.conflicts?.length ?? 0) +
                        hotel.period_rates.reduce(
                            (count, period) =>
                                count + (period.conflicts?.length ?? 0),
                            0,
                        ),
                    warnings:
                        summary.warnings +
                        (hotel.warnings?.length ?? 0) +
                        hotel.period_rates.reduce(
                            (count, period) =>
                                count + (period.warnings?.length ?? 0),
                            0,
                        ),
                }),
                { conflicts: 0, warnings: 0 },
            ),
        [bulkForm.data.hotels],
    );
    const hasImportConflicts = draftIssueSummary.conflicts > 0;

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
            const normalizedRoomType = normalizeProductHotelRoomType(
                roomType.name,
            );

            if (normalizedRoomType) {
                roomTypeMap[normalizedRoomType] = roomType.id;
            }
        }
        return roomTypeMap;
    }, [roomTypeOptions]);

    function clearBulkSelection(): void {
        setBulkSelectMode(false);
        setSelectedHotelIds([]);
    }

    function toggleSelectedHotel(hotelId: number): void {
        setSelectedHotelIds((current) =>
            current.includes(hotelId)
                ? current.filter((selectedId) => selectedId !== hotelId)
                : [...current, hotelId],
        );
    }

    function submitBulkDeleteHotels(): void {
        if (selectedHotelIds.length === 0) {
            return;
        }

        if (
            !window.confirm(`Hapus ${selectedHotelIds.length} hotel terpilih?`)
        ) {
            return;
        }

        router.post(
            '/admin/product-management/products/hotels/bulk-delete',
            {
                ids: selectedHotelIds,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Hotel terpilih berhasil dihapus.');
                    clearBulkSelection();
                },
            },
        );
    }

    const brokerGroups = useMemo(
        () => groupPeriodRatesByBroker(form.data.period_rates),
        [form.data.period_rates],
    );

    function getNextBrokerName(): string {
        const existingNames = new Set(
            brokerGroups.map((group) => normalizeKey(group.broker_name)),
        );

        let candidateIndex = brokerGroups.length + 1;
        let candidateName = `Broker ${candidateIndex}`;

        while (existingNames.has(normalizeKey(candidateName))) {
            candidateIndex += 1;
            candidateName = `Broker ${candidateIndex}`;
        }

        return candidateName;
    }

    function setPeriodRate(
        index: number,
        key: keyof PeriodRateRow,
        value: string | number,
    ): void {
        const periodRates = [...form.data.period_rates];
        periodRates[index] = { ...periodRates[index], [key]: value };
        form.setData('period_rates', periodRates);
    }

    function setBrokerGroupName(
        brokerGroupId: string,
        nextBrokerName: string,
    ): void {
        form.setData(
            'period_rates',
            form.data.period_rates.map((periodRate) =>
                (periodRate.broker_group_id ||
                    periodRate.broker_key ||
                    periodRate.ui_id ||
                    '') === brokerGroupId
                    ? { ...periodRate, broker_name: nextBrokerName }
                    : periodRate,
            ),
        );
    }

    function addBrokerGroup(): void {
        const nextBrokerName = getNextBrokerName();
        const nextRow = blankPeriodRate(nextBrokerName);
        form.setData('period_rates', [...form.data.period_rates, nextRow]);
        setEditingBrokerGroupId(nextRow.broker_group_id ?? null);
        setEditingSessionId(nextRow.ui_id ?? null);
    }

    function addSeasonToBroker(groupId: string): void {
        const brokerGroup = brokerGroups.find(
            (group) => group.group_id === groupId,
        );
        const brokerKey = brokerGroup?.broker_key ?? groupId;
        const nextRow = blankPeriodRate(
            brokerGroup?.broker_name ?? 'Broker 1',
            brokerKey,
        );
        nextRow.broker_group_id = brokerKey;
        nextRow.broker_key = brokerKey;
        form.setData('period_rates', [...form.data.period_rates, nextRow]);
        setEditingBrokerGroupId(groupId);
        setEditingSessionId(nextRow.ui_id ?? null);
    }

    function removeBrokerGroup(groupId: string): void {
        const remainingRows = form.data.period_rates.filter(
            (periodRate) =>
                (periodRate.broker_group_id ||
                    periodRate.broker_key ||
                    periodRate.ui_id ||
                    '') !== groupId,
        );

        form.setData(
            'period_rates',
            remainingRows.length > 0 ? remainingRows : [blankPeriodRate()],
        );
        setEditingBrokerGroupId(null);
        setEditingSessionId(null);
    }

    function removeSeasonRow(rowId: string): void {
        const remainingRows = form.data.period_rates.filter(
            (periodRate) => (periodRate.ui_id || '') !== rowId,
        );

        form.setData(
            'period_rates',
            remainingRows.length > 0 ? remainingRows : [blankPeriodRate()],
        );
        if (editingSessionId === rowId) {
            setEditingSessionId(null);
        }
    }

    function openCreate(): void {
        form.setData(blankForm(defaultCurrency));
        form.clearErrors();
        setHotelSubmissionErrors({});
        setEditingBrokerGroupId(null);
        setEditingSessionId(null);
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
        setHotelSubmissionErrors({});
        setEditingBrokerGroupId(null);
        setEditingSessionId(null);
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

            if (dblRoomTypeId && periodRate.dbl_price !== null) {
                prices.push({
                    broker_key:
                        periodRate.broker_key || periodRate.broker_group_id,
                    broker_name: periodRate.broker_name || 'Broker 1',
                    room_type_id: dblRoomTypeId,
                    period_start: periodRate.period_start,
                    period_end: periodRate.period_end,
                    price: Number(periodRate.dbl_price),
                });
            }
            if (trplRoomTypeId && periodRate.trpl_price !== null) {
                prices.push({
                    broker_key:
                        periodRate.broker_key || periodRate.broker_group_id,
                    broker_name: periodRate.broker_name || 'Broker 1',
                    room_type_id: trplRoomTypeId,
                    period_start: periodRate.period_start,
                    period_end: periodRate.period_end,
                    price: Number(periodRate.trpl_price),
                });
            }
            if (quadRoomTypeId && periodRate.quad_price !== null) {
                prices.push({
                    broker_key:
                        periodRate.broker_key || periodRate.broker_group_id,
                    broker_name: periodRate.broker_name || 'Broker 1',
                    room_type_id: quadRoomTypeId,
                    period_start: periodRate.period_start,
                    period_end: periodRate.period_end,
                    price: Number(periodRate.quad_price),
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
        const nextHotel = {
            ...hotelsPayload[hotelIndex],
            [key]: value,
        } as BulkHotelForm;

        if (
            key === 'country_id' &&
            !cityOptions.some(
                (city) =>
                    String(city.id) === nextHotel.city_id &&
                    String(city.country_id) === value,
            )
        ) {
            nextHotel.city_id = '';
        }

        hotelsPayload[hotelIndex] = revalidateHotelDraft(nextHotel);
        bulkForm.setData('hotels', hotelsPayload);
    }

    function applyCollectiveCurrency(value: string): void {
        const currency = value === 'none' ? '' : value;
        setPdfDefaultCurrency(currency);

        if (currency === '') {
            return;
        }

        bulkForm.setData(
            'hotels',
            bulkForm.data.hotels.map((hotel) =>
                revalidateHotelDraft({ ...hotel, currency }),
            ),
        );

        // Clear old validation errors after currency change
        setBulkSubmissionErrors({});

        // Re-reconcile current draft to clear currency conflicts
        void reviewCurrentDraft();

        toast.success(`Mata uang ${currency} diterapkan ke semua draft hotel.`);
    }

    async function readImportResponse(
        response: Response,
    ): Promise<ImportResult> {
        if (response.status === 419) {
            throw new Error(
                'Sesi berakhir. Muat ulang halaman, lalu pilih kembali file import.',
            );
        }

        const body = (await response.json()) as {
            message?: string;
            errors?: FormValidationErrors;
            hotels?: BulkHotelForm[];
            summary?: ImportSummary;
        };

        if (!response.ok || !body.hotels || !body.summary) {
            throw new Error(
                body.errors
                    ? firstValidationMessage(
                          body.errors,
                          body.message ?? 'File import gagal diproses.',
                      )
                    : (body.message ?? 'File import gagal diproses.'),
            );
        }

        return { hotels: body.hotels, summary: body.summary };
    }

    function applyImportResult(result: {
        hotels: BulkHotelForm[];
        summary: ImportSummary;
    }): void {
        bulkForm.setData(
            'hotels',
            result.hotels.map((hotel) => revalidateHotelDraft(hotel)),
        );
        setImportSummary(result.summary);

        // Auto-detect currency if all hotels have same currency
        const hotelCurrencies = result.hotels
            .map((hotel) => hotel.currency)
            .filter(Boolean)
            .filter((curr, idx, arr) => arr.indexOf(curr) === idx);

        if (hotelCurrencies.length === 1) {
            const detectedCurrency = hotelCurrencies[0];
            setPdfDefaultCurrency(detectedCurrency);
            bulkForm.setData(
                'hotels',
                result.hotels.map((hotel) =>
                    revalidateHotelDraft({
                        ...hotel,
                        currency: detectedCurrency,
                    }),
                ),
            );
            toast.success(
                `Import berhasil: ${result.summary.hotels_detected} hotel, ${result.summary.periods_detected} periode, dan mata uang ${detectedCurrency} sudah diterapkan.`,
            );
        } else {
            toast.success(
                `Import berhasil: ${result.summary.hotels_detected} hotel dan ${result.summary.periods_detected} periode dimuat.`,
            );
        }

        if (result.summary.warnings > 0 || result.summary.conflicts > 0) {
            toast.warning(
                `${result.summary.warnings} warning dan ${result.summary.conflicts} conflict perlu diperiksa.`,
            );
        }
    }

    async function reconcileImportRows(rows: HotelImportRow[]): Promise<void> {
        const response = await fetchWithCsrf(
            '/admin/product-management/products/hotels/import/reconcile',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ rows }),
            },
        );

        applyImportResult(await readImportResponse(response));
    }

    async function reviewCurrentDraft(): Promise<void> {
        const rows: HotelImportRow[] = bulkForm.data.hotels.flatMap((hotel) => {
            const country = countryOptions.find(
                (item) => String(item.id) === hotel.country_id,
            );
            const city = cityOptions.find(
                (item) => String(item.id) === hotel.city_id,
            );

            return hotel.period_rates.map((period) => ({
                country: country?.name ?? null,
                city: city?.name ?? null,
                hotel: hotel.name,
                currency: hotel.currency || null,
                period_start: period.period_start,
                period_end: period.period_end,
                dbl: period.dbl_price,
                trpl: period.trpl_price,
                quad: period.quad_price,
                source: 'csv' as const,
                warnings: [],
            }));
        });

        setIsImporting(true);
        try {
            await reconcileImportRows(rows);
        } catch (error: unknown) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Draft gagal diperiksa ulang.',
            );
        } finally {
            setIsImporting(false);
        }
    }

    async function importPdfFile(file: File): Promise<void> {
        const payload = new FormData();
        payload.append('file', file);
        if (pdfDefaultCountryId !== '') {
            payload.append('default_country_id', pdfDefaultCountryId);
        }
        if (pdfDefaultCurrency !== '') {
            payload.append('default_currency', pdfDefaultCurrency);
        }

        const response = await fetchWithCsrf(
            '/admin/product-management/products/hotels/import/pdf',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: payload,
            },
        );

        if (response.status === 202) {
            const queued = (await response.json()) as QueuedPdfImportResponse;
            if (!queued.import_id) {
                throw new Error('Server tidak mengembalikan ID antrean PDF.');
            }

            toast.info(
                queued.message ??
                    'PDF masuk antrean server. Preview akan terbuka otomatis setelah selesai.',
            );
            applyImportResult(
                await waitForQueuedPdfImport(
                    queued.import_id,
                    queued.poll_after_ms ?? 3000,
                ),
            );
            return;
        }

        applyImportResult(await readImportResponse(response));
    }

    async function waitForQueuedPdfImport(
        importId: string,
        pollAfterMs: number,
    ): Promise<ImportResult> {
        const timeoutAt = Date.now() + 5 * 60 * 1000;
        const interval = Math.max(2000, pollAfterMs);

        while (Date.now() < timeoutAt) {
            await new Promise((resolve) =>
                window.setTimeout(resolve, interval),
            );

            const response = await fetchWithCsrf(
                `/admin/product-management/products/hotels/import/pdf/${encodeURIComponent(importId)}`,
                {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                },
            );
            const body = (await response.json()) as PdfImportStatusResponse;

            if (!response.ok) {
                throw new Error(
                    body.message ?? 'Status antrean PDF gagal diperiksa.',
                );
            }

            if (body.status === 'completed' && body.result) {
                return body.result;
            }

            if (body.status === 'failed') {
                throw new Error(
                    body.message ?? 'PDF gagal diproses oleh server.',
                );
            }
        }

        throw new Error(
            'PDF masih menunggu antrean server. Pastikan cron pemroses import hotel sudah aktif, lalu coba kembali.',
        );
    }

    function importBulkFile(event: React.ChangeEvent<HTMLInputElement>): void {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const extension = file.name.split('.').pop()?.toLowerCase();

        // Validate file extension
        const supportedFormats = ['pdf', 'csv', 'xls', 'xlsx'];
        if (!supportedFormats.includes(extension || '')) {
            toast.error(
                `Format file tidak didukung. Gunakan: ${supportedFormats.join(', ')}`,
            );
            event.target.value = '';
            return;
        }

        // Validate file size (max 10MB)
        const maxSizeMB = 10;
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB.`);
            event.target.value = '';
            return;
        }

        if (extension === 'pdf') {
            setIsImporting(true);
            void importPdfFile(file)
                .catch((error: unknown) =>
                    toast.error(
                        error instanceof Error
                            ? error.message
                            : 'PDF gagal diproses.',
                    ),
                )
                .finally(() => {
                    setIsImporting(false);
                    event.target.value = '';
                });
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => {
            toast.error('Gagal membaca file. Coba lagi.');
            setIsImporting(false);
            event.target.value = '';
        };

        reader.onload = async (loadEvent) => {
            setIsImporting(true);
            try {
                if (!loadEvent.target?.result) {
                    toast.error('File kosong atau tidak dapat dibaca.');
                    return;
                }

                const workbook = XLSX.read(loadEvent.target.result, {
                    type: 'array',
                });

                if (!workbook.SheetNames.length) {
                    toast.error('File Excel tidak mengandung sheet.');
                    return;
                }

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                if (!worksheet) {
                    toast.error('Tidak dapat membaca sheet.');
                    return;
                }

                const rawRows = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    raw: false,
                    defval: '',
                }) as unknown[][];

                if (rawRows.length < 2) {
                    toast.error(
                        'File import kosong atau format tidak valid. Minimal harus ada header dan 1 baris data.',
                    );
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
                        'Header wajib: country/negara, city/kota, hotel/namahotel, period_start/from/start/tanggalmulai, period_end/to/end/tanggalselesai.',
                    );
                    return;
                }

                const normalizedRows: HotelImportRow[] = [];
                let skippedRows = 0;

                for (let rowIndex = 1; rowIndex < rawRows.length; rowIndex++) {
                    const row = rawRows[rowIndex];
                    const countryName = normalizeCell(row[columnIndex.country]);
                    const cityName = normalizeCell(row[columnIndex.city]);
                    const hotelName = normalizeCell(row[columnIndex.hotel]);
                    const periodStart = normalizeImportDate(
                        row[columnIndex.periodStart],
                    );
                    const periodEnd = normalizeImportDate(
                        row[columnIndex.periodEnd],
                    );

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

                    const currencyValue =
                        normalizeCell(row[columnIndex.currency]) || 'IDR';

                    normalizedRows.push({
                        country: countryName,
                        city: cityName,
                        hotel: hotelName,
                        currency: currencyValue.toUpperCase(),
                        period_start: periodStart,
                        period_end: periodEnd,
                        dbl: toNumber(row[columnIndex.dbl]),
                        trpl: toNumber(row[columnIndex.trpl]),
                        quad: toNumber(row[columnIndex.quad]),
                        source:
                            extension === 'xls' || extension === 'xlsx'
                                ? extension
                                : 'csv',
                        warnings: [],
                    });
                }

                if (normalizedRows.length === 0) {
                    toast.error('Tidak ada data valid yang bisa diimport.');
                    return;
                }

                await reconcileImportRows(normalizedRows);
                if (skippedRows > 0) {
                    toast.warning(
                        `${skippedRows} baris kosong/tidak lengkap dilewati.`,
                    );
                }
            } catch (error: unknown) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Gagal membaca file import. Periksa format file.';

                // Better error messages for common issues
                if (errorMessage.includes('does not support')) {
                    toast.error(
                        'Format file tidak didukung. Gunakan CSV, XLS, atau XLSX.',
                    );
                } else if (errorMessage.includes('Cannot read')) {
                    toast.error('File corrupt atau format tidak valid.');
                } else {
                    toast.error(errorMessage);
                }
            } finally {
                setIsImporting(false);
                event.target.value = '';
            }
        };

        reader.readAsArrayBuffer(file);
    }

    function submit(event: React.FormEvent): void {
        event.preventDefault();
        setHotelSubmissionErrors({});
        const payload = {
            ...form.data,
            prices: buildPricesPayload(),
        };

        if (editingHotel === 'new') {
            router.post('/admin/product-management/products/hotels', payload, {
                preserveScroll: true,
                onStart: () => setIsSavingHotel(true),
                onSuccess: () => {
                    toast.success('Hotel berhasil ditambahkan.');
                    setEditingHotel(null);
                },
                onError: (errors) => {
                    setHotelSubmissionErrors(errors);
                    toast.error(
                        firstValidationMessage(
                            errors,
                            'Hotel gagal disimpan. Periksa kembali data yang diisi.',
                        ),
                    );
                },
                onFinish: () => setIsSavingHotel(false),
            });
            return;
        }

        if (editingHotel) {
            router.put(
                `/admin/product-management/products/hotels/${editingHotel.id}`,
                payload,
                {
                    preserveScroll: true,
                    onStart: () => setIsSavingHotel(true),
                    onSuccess: () => {
                        toast.success('Hotel berhasil diperbarui.');
                        setEditingHotel(null);
                    },
                    onError: (errors) => {
                        setHotelSubmissionErrors(errors);
                        toast.error(
                            firstValidationMessage(
                                errors,
                                'Hotel gagal diperbarui. Periksa kembali data yang diisi.',
                            ),
                        );
                    },
                    onFinish: () => setIsSavingHotel(false),
                },
            );
        }
    }

    function submitBulk(event: React.FormEvent): void {
        event.preventDefault();
        setBulkSubmissionErrors({});

        if (hasImportConflicts) {
            toast.error(
                `Masih ada ${draftIssueSummary.conflicts} conflict. Perbaiki baris merah sebelum menyimpan.`,
            );
            return;
        }

        const payload: { hotels: BulkHotelPayload[] } = {
            hotels: bulkForm.data.hotels.map((hotel) => ({
                country_id: hotel.country_id,
                city_id: hotel.city_id,
                existing_hotel_id: hotel.existing_hotel_id,
                name: hotel.name,
                currency: hotel.currency,
                is_active: hotel.is_active,
                prices: buildPricesFromPeriodRates(hotel.period_rates),
            })),
        };

        router.post('/admin/product-management/products/hotels/bulk', payload, {
            preserveScroll: true,
            onStart: () => setIsSavingBulk(true),
            onSuccess: (page) => {
                const flash = (page.props as Record<string, unknown>).flash as
                    | {
                          bulk_created_count?: number;
                          bulk_updated_count?: number;
                          bulk_currency_updated_count?: number;
                          bulk_new_period_count?: number;
                          bulk_unchanged_count?: number;
                          bulk_skipped_hotels?: Array<{
                              index: number;
                              name: string;
                              reason: string;
                          }>;
                      }
                    | undefined;
                const createdCount = Number(flash?.bulk_created_count ?? 0);
                const updatedCount = Number(flash?.bulk_updated_count ?? 0);
                const currencyUpdatedCount = Number(
                    flash?.bulk_currency_updated_count ?? 0,
                );
                const newPeriodCount = Number(
                    flash?.bulk_new_period_count ?? 0,
                );
                const unchangedCount = Number(flash?.bulk_unchanged_count ?? 0);
                const skippedHotels = flash?.bulk_skipped_hotels ?? [];

                toast.success(
                    `Bulk selesai: ${createdCount} hotel baru, ${updatedCount} hotel diperbarui (${currencyUpdatedCount} mata uang), ${newPeriodCount} periode baru, ${unchangedCount} tanpa perubahan.`,
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
                bulkForm.setData({ hotels: [blankBulkHotel(defaultCurrency)] });
                setImportSummary(null);
                setBulkOpen(false);
            },
            onError: (errors) => {
                setBulkSubmissionErrors(errors);
                toast.error(
                    firstValidationMessage(
                        errors,
                        'Bulk create/update gagal. Periksa field, warning, dan conflict pada draft.',
                    ),
                );
            },
            onFinish: () => setIsSavingBulk(false),
        });
    }

    const total = hotels.total ?? hotels.data.length;

    const pageContent = (
        <>
            <div className="space-y-2 px-2 py-2 md:px-3 md:py-3">
                <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {total} hotel terdaftar
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        {canDelete ? (
                            bulkSelectMode ? (
                                <>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {selectedHotelIds.length} item dipilih
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={clearBulkSelection}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={submitBulkDeleteHotels}
                                        disabled={selectedHotelIds.length === 0}
                                    >
                                        Hapus Terpilih
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setBulkSelectMode(true)}
                                >
                                    Pilih Data
                                </Button>
                            )
                        ) : null}
                        {canCreate ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setBulkOpen(true)}
                                >
                                    Bulk Create Hotel
                                </Button>
                                <Button onClick={openCreate}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Hotel
                                </Button>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="space-y-3">
                    {hotels.data.length > 0 ? (
                        hotels.data.map((hotel, index) => {
                            const hotelBrokerGroups = groupHotelPricesByBroker(
                                hotel.prices,
                            );
                            const isEditingThisHotel =
                                editingHotel !== null &&
                                editingHotel !== 'new' &&
                                editingHotel.id === hotel.id;

                            return (
                                <div
                                    key={hotel.id}
                                    className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm"
                                >
                                    <div className="flex flex-col gap-3 border-b border-border/40 p-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <span className="text-sm font-bold">
                                                    {String(
                                                        (hotels.from ?? 1) +
                                                            index,
                                                    ).padStart(2, '0')}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-semibold">
                                                        {hotel.name}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${hotelStatusBadgeClass(hotel.is_active)}`}
                                                    >
                                                        {hotel.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    <span>
                                                        {hotel.country_name} /{' '}
                                                        {hotel.city_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {bulkSelectMode ? (
                                                <Checkbox
                                                    checked={selectedHotelIds.includes(
                                                        hotel.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelectedHotel(
                                                            hotel.id,
                                                        )
                                                    }
                                                    aria-label={`Pilih ${hotel.name}`}
                                                />
                                            ) : null}
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
                                                                            `Hapus hotel "${hotel.name}"?`,
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            `/admin/product-management/products/hotels/${hotel.id}`,
                                                                            {
                                                                                preserveScroll: true,
                                                                                onSuccess:
                                                                                    () =>
                                                                                        toast.success(
                                                                                            'Hotel berhasil dihapus.',
                                                                                        ),
                                                                            },
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Hapus
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="space-y-4 border-t border-border/40 p-4">
                                        {hotelBrokerGroups.length > 0 ? (
                                            hotelBrokerGroups.map(
                                                (brokerGroup) => (
                                                    <div
                                                        key={`${hotel.id}-${brokerGroup.group_id}`}
                                                        className="flex flex-col gap-2 rounded-xl border border-border/40 bg-muted/20 p-2 lg:flex-row lg:items-center lg:justify-between"
                                                    >
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-semibold">
                                                                {
                                                                    brokerGroup.broker_name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    brokerGroup
                                                                        .periods
                                                                        .length
                                                                }{' '}
                                                                season
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                            {brokerGroup.periods.map(
                                                                (period) => (
                                                                    <span
                                                                        key={`${hotel.id}-${brokerGroup.broker_name}-${period.period_start}-${period.period_end}`}
                                                                    >
                                                                        Quad:{' '}
                                                                        {period
                                                                            .pricesByRoomType
                                                                            .QUAD ||
                                                                            '-'}
                                                                        {' / '}
                                                                        Triple:{' '}
                                                                        {period
                                                                            .pricesByRoomType
                                                                            .TRPL ||
                                                                            '-'}
                                                                        {' / '}
                                                                        Double:{' '}
                                                                        {period
                                                                            .pricesByRoomType
                                                                            .DBL ||
                                                                            '-'}
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    openEdit(
                                                                        hotel,
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-border/40 bg-muted/10 p-4 text-sm text-muted-foreground">
                                                Belum ada pricing period.
                                            </div>
                                        )}
                                    </div>

                                    {isEditingThisHotel ? (
                                        <div className="border-t border-border/40 bg-card p-3">
                                            <form
                                                onSubmit={submit}
                                                className="space-y-3 rounded-2xl border border-border/40 bg-background p-3 shadow-sm"
                                            >
                                                <FormValidationSummary
                                                    errors={
                                                        hotelSubmissionErrors
                                                    }
                                                />
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            Edit Hotel
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Ubah data hotel dan
                                                            pricing langsung di
                                                            kartu ini.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setEditingHotel(
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        Batal Edit
                                                    </Button>
                                                </div>

                                                <div className="grid gap-4 lg:grid-cols-3">
                                                    <div>
                                                        <Label className="mb-1.5 block">
                                                            Kota
                                                        </Label>
                                                        <Select
                                                            value={
                                                                form.data
                                                                    .city_id ||
                                                                'none'
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                form.setData(
                                                                    'city_id',
                                                                    value ===
                                                                        'none'
                                                                        ? ''
                                                                        : value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih kota" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">
                                                                    Pilih kota
                                                                </SelectItem>
                                                                {cityOptions.map(
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
                                                    <div>
                                                        <Label className="mb-1.5 block">
                                                            Nama Hotel
                                                        </Label>
                                                        <Input
                                                            value={
                                                                form.data.name
                                                            }
                                                            onChange={(event) =>
                                                                form.setData(
                                                                    'name',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="mb-1.5 block">
                                                            Mata Uang
                                                        </Label>
                                                        <Select
                                                            value={
                                                                form.data
                                                                    .currency ||
                                                                'none'
                                                            }
                                                            onValueChange={(
                                                                value,
                                                            ) =>
                                                                form.setData(
                                                                    'currency',
                                                                    value ===
                                                                        'none'
                                                                        ? defaultCurrency
                                                                        : value,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih kurs" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="none">
                                                                    Pilih kurs
                                                                </SelectItem>
                                                                {currencyOptions.map(
                                                                    (
                                                                        currency,
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                currency.code
                                                                            }
                                                                            value={
                                                                                currency.code
                                                                            }
                                                                        >
                                                                            {
                                                                                currency.code
                                                                            }{' '}
                                                                            -{' '}
                                                                            {
                                                                                currency.name
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold">
                                                                Pricing per
                                                                Broker
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Satu broker bisa
                                                                punya banyak
                                                                season.
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={
                                                                addBrokerGroup
                                                            }
                                                        >
                                                            Tambah Broker
                                                        </Button>
                                                    </div>

                                                    <div className="mt-3 space-y-3">
                                                        {brokerGroups.map(
                                                            (group) => {
                                                                const isEditingBroker =
                                                                    editingBrokerGroupId ===
                                                                    group.group_id;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            group.group_id
                                                                        }
                                                                        className="space-y-2 rounded-2xl border border-border/40 bg-card p-2.5 shadow-sm"
                                                                    >
                                                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                            <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                                                                                <div className="min-w-0">
                                                                                    <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                                                        Broker
                                                                                    </Label>
                                                                                    {isEditingBroker ? (
                                                                                        <Input
                                                                                            className="h-9"
                                                                                            value={
                                                                                                group.broker_name
                                                                                            }
                                                                                            onChange={(
                                                                                                event,
                                                                                            ) =>
                                                                                                setBrokerGroupName(
                                                                                                    group.group_id,
                                                                                                    event
                                                                                                        .target
                                                                                                        .value,
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm font-medium">
                                                                                            {
                                                                                                group.broker_name
                                                                                            }
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="rounded-full border border-border/40 bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
                                                                                        {
                                                                                            group
                                                                                                .rows
                                                                                                .length
                                                                                        }{' '}
                                                                                        season
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        setEditingBrokerGroupId(
                                                                                            isEditingBroker
                                                                                                ? null
                                                                                                : group.group_id,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {isEditingBroker
                                                                                        ? 'Selesai'
                                                                                        : 'Edit Broker'}
                                                                                </Button>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        addSeasonToBroker(
                                                                                            group.group_id,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    +
                                                                                    Tambah
                                                                                    Session
                                                                                </Button>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="destructive"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        removeBrokerGroup(
                                                                                            group.group_id,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Hapus
                                                                                    Broker
                                                                                </Button>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            {group.rows.map(
                                                                                ({
                                                                                    index,
                                                                                    row,
                                                                                }) => {
                                                                                    const isEditingSession =
                                                                                        editingSessionId ===
                                                                                        row.ui_id;

                                                                                    return isEditingSession ? (
                                                                                        <div
                                                                                            key={`${group.group_id}-${row.ui_id}`}
                                                                                            className="grid gap-2 rounded-xl border border-border/30 bg-background p-2 sm:grid-cols-2 lg:grid-cols-12"
                                                                                        >
                                                                                            <div className="lg:col-span-2">
                                                                                                <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                                                                    From
                                                                                                </Label>
                                                                                                <Input
                                                                                                    type="date"
                                                                                                    className="h-9"
                                                                                                    value={
                                                                                                        row.period_start
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        event,
                                                                                                    ) =>
                                                                                                        setPeriodRate(
                                                                                                            index,
                                                                                                            'period_start',
                                                                                                            event
                                                                                                                .target
                                                                                                                .value,
                                                                                                        )
                                                                                                    }
                                                                                                />
                                                                                            </div>
                                                                                            <div className="lg:col-span-2">
                                                                                                <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                                                                    To
                                                                                                </Label>
                                                                                                <Input
                                                                                                    type="date"
                                                                                                    className="h-9"
                                                                                                    value={
                                                                                                        row.period_end
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        event,
                                                                                                    ) =>
                                                                                                        setPeriodRate(
                                                                                                            index,
                                                                                                            'period_end',
                                                                                                            event
                                                                                                                .target
                                                                                                                .value,
                                                                                                        )
                                                                                                    }
                                                                                                />
                                                                                            </div>
                                                                                            <div className="lg:col-span-2">
                                                                                                <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                                                                    DBL
                                                                                                </Label>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    min={
                                                                                                        0
                                                                                                    }
                                                                                                    className="h-9"
                                                                                                    value={
                                                                                                        row.dbl_price ??
                                                                                                        ''
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        event,
                                                                                                    ) =>
                                                                                                        setPeriodRate(
                                                                                                            index,
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
                                                                                                <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                                                                    TRPL
                                                                                                </Label>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    min={
                                                                                                        0
                                                                                                    }
                                                                                                    className="h-9"
                                                                                                    value={
                                                                                                        row.trpl_price ??
                                                                                                        ''
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        event,
                                                                                                    ) =>
                                                                                                        setPeriodRate(
                                                                                                            index,
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
                                                                                                <Label className="mb-1 block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                                                                                    Quad
                                                                                                </Label>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    min={
                                                                                                        0
                                                                                                    }
                                                                                                    className="h-9"
                                                                                                    value={
                                                                                                        row.quad_price ??
                                                                                                        ''
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        event,
                                                                                                    ) =>
                                                                                                        setPeriodRate(
                                                                                                            index,
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
                                                                                            <div className="flex items-end gap-2 lg:col-span-2">
                                                                                                <Button
                                                                                                    type="button"
                                                                                                    size="sm"
                                                                                                    variant="outline"
                                                                                                    onClick={() =>
                                                                                                        setEditingSessionId(
                                                                                                            null,
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    Selesai
                                                                                                </Button>
                                                                                                <Button
                                                                                                    type="button"
                                                                                                    size="sm"
                                                                                                    variant="destructive"
                                                                                                    onClick={() =>
                                                                                                        removeSeasonRow(
                                                                                                            row.ui_id ||
                                                                                                                '',
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    Hapus
                                                                                                </Button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div
                                                                                            key={`${group.group_id}-${row.ui_id}`}
                                                                                            className="flex flex-col gap-2 rounded-xl border border-border/30 bg-background px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                                                                                        >
                                                                                            <div className="min-w-0 space-y-0.5">
                                                                                                <span className="block font-medium text-foreground">
                                                                                                    {formatDate(
                                                                                                        row.period_start,
                                                                                                    )}
                                                                                                    {
                                                                                                        ' - '
                                                                                                    }
                                                                                                    {formatDate(
                                                                                                        row.period_end,
                                                                                                    )}
                                                                                                </span>
                                                                                                <span className="block text-muted-foreground">
                                                                                                    DBL:{' '}
                                                                                                    {row.dbl_price ||
                                                                                                        '-'}
                                                                                                    {
                                                                                                        ' / '
                                                                                                    }
                                                                                                    TRPL:{' '}
                                                                                                    {row.trpl_price ||
                                                                                                        '-'}
                                                                                                    {
                                                                                                        ' / '
                                                                                                    }
                                                                                                    Quad:{' '}
                                                                                                    {row.quad_price ||
                                                                                                        '-'}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                                                                                <Button
                                                                                                    type="button"
                                                                                                    variant="outline"
                                                                                                    size="sm"
                                                                                                    onClick={() =>
                                                                                                        setEditingSessionId(
                                                                                                            row.ui_id ||
                                                                                                                null,
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    Edit
                                                                                                </Button>
                                                                                                <Button
                                                                                                    type="button"
                                                                                                    variant="destructive"
                                                                                                    size="sm"
                                                                                                    onClick={() =>
                                                                                                        removeSeasonRow(
                                                                                                            row.ui_id ||
                                                                                                                '',
                                                                                                        )
                                                                                                    }
                                                                                                >
                                                                                                    Hapus
                                                                                                </Button>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                },
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            setEditingHotel(
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        Batal
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={isSavingHotel}
                                                    >
                                                        {isSavingHotel
                                                            ? 'Menyimpan...'
                                                            : 'Simpan Perubahan'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center text-muted-foreground shadow-sm">
                            {filters.search
                                ? 'Data hotel tidak ditemukan.'
                                : 'Belum ada data hotel.'}
                        </div>
                    )}
                </div>

                {hotels.links.length > 3 ? (
                    <div className="flex flex-wrap items-center justify-end gap-2">
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

            <Sheet
                open={bulkOpen}
                onOpenChange={(open) => {
                    setBulkOpen(open);
                    if (!open) {
                        bulkForm.setData({
                            hotels: [blankBulkHotel(defaultCurrency)],
                        });
                        bulkForm.clearErrors();
                        setBulkSubmissionErrors({});
                        setImportSummary(null);
                    }
                }}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto sm:max-w-6xl"
                >
                    <SheetHeader>
                        <SheetTitle>Bulk Create & Update Hotel</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submitBulk} className="mt-6 space-y-6">
                        <FormValidationSummary errors={bulkSubmissionErrors} />

                        {/* Import Section */}
                        <div className="space-y-3 rounded-lg border border-border/40 bg-background p-4">
                            <h3 className="text-sm font-semibold">
                                Import Data
                            </h3>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <Label className="mb-2 block text-sm">
                                        Default Negara
                                    </Label>
                                    <Select
                                        value={pdfDefaultCountryId || 'none'}
                                        onValueChange={(value) =>
                                            setPdfDefaultCountryId(
                                                value === 'none' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="text-sm">
                                            <SelectValue placeholder="Tidak ditentukan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Tidak ditentukan
                                            </SelectItem>
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
                                    <Label className="mb-2 block text-sm">
                                        Mata Uang
                                    </Label>
                                    <Select
                                        value={pdfDefaultCurrency || 'none'}
                                        onValueChange={applyCollectiveCurrency}
                                    >
                                        <SelectTrigger className="text-sm">
                                            <SelectValue placeholder="Tidak ditentukan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Tidak ditentukan
                                            </SelectItem>
                                            {currencyOptions.map((currency) => (
                                                <SelectItem
                                                    key={currency.code}
                                                    value={currency.code}
                                                >
                                                    {currency.code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadBulkTemplate}
                                    className="w-full"
                                >
                                    Download Template
                                </Button>
                                <div>
                                    <Label className="mb-1.5 block text-xs font-medium">
                                        Upload File
                                    </Label>
                                    <div className="relative">
                                        <input
                                            ref={(ref) => {
                                                if (ref) {
                                                    ref.addEventListener(
                                                        'dragover',
                                                        (e) => {
                                                            e.preventDefault();
                                                            ref.classList.add(
                                                                'border-primary',
                                                                'bg-primary/5',
                                                            );
                                                        },
                                                    );
                                                    ref.addEventListener(
                                                        'dragleave',
                                                        (e) => {
                                                            e.preventDefault();
                                                            ref.classList.remove(
                                                                'border-primary',
                                                                'bg-primary/5',
                                                            );
                                                        },
                                                    );
                                                }
                                            }}
                                            type="file"
                                            aria-label="Upload CSV, Excel, atau PDF"
                                            accept=".xlsx,.xls,.csv,.pdf"
                                            onChange={importBulkFile}
                                            disabled={isImporting}
                                            className="w-full text-sm transition-colors duration-200"
                                        />
                                        {isImporting ? (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/90 text-xs font-medium">
                                                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                                Membaca...
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        bulkForm.setData('hotels', [
                                            ...bulkForm.data.hotels,
                                            blankBulkHotel(defaultCurrency),
                                        ])
                                    }
                                    className="w-full"
                                >
                                    + Tambah Baris
                                </Button>
                            </div>
                        </div>

                        {/* Summary Section */}
                        {importSummary ? (
                            <div className="rounded-lg border border-border/40 bg-background p-4">
                                <h3 className="mb-3 text-sm font-semibold">
                                    Ringkasan Import
                                </h3>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                    <ImportSummaryItem
                                        label="Hotel"
                                        value={importSummary.hotels_detected}
                                    />
                                    <ImportSummaryItem
                                        label="Periode"
                                        value={importSummary.periods_detected}
                                    />
                                    <ImportSummaryItem
                                        label="Baru"
                                        value={importSummary.hotels_to_create}
                                    />
                                    <ImportSummaryItem
                                        label="Update"
                                        value={importSummary.rates_to_update}
                                    />
                                </div>
                            </div>
                        ) : null}

                        {/* Hotels List Section */}
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
                                            className={`space-y-4 rounded-xl border p-4 transition-colors ${
                                                (hotelItem.conflicts?.length ??
                                                    0) > 0 ||
                                                hotelItem.period_rates.some(
                                                    (period) =>
                                                        (period.conflicts
                                                            ?.length ?? 0) > 0,
                                                )
                                                    ? 'border-red-300 bg-red-50/40 dark:border-red-900 dark:bg-red-950/10'
                                                    : 'border-border/40 bg-card'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                    <p className="min-w-0 text-sm font-semibold break-words">
                                                        {hotelItem.name ||
                                                            `Hotel #${hotelIndex + 1}`}
                                                    </p>
                                                    <ImportStatusBadge
                                                        status={
                                                            hotelItem.import_status
                                                        }
                                                    />
                                                </div>
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

                                            {(hotelItem.conflicts?.length ??
                                                0) > 0 ? (
                                                <div className="space-y-1.5 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100">
                                                    <div className="flex items-center gap-2 font-semibold">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        Conflict data hotel
                                                    </div>
                                                    {hotelItem.conflicts?.map(
                                                        (message) => (
                                                            <p
                                                                key={`conflict-${message}`}
                                                                className="break-words"
                                                            >
                                                                {message}
                                                            </p>
                                                        ),
                                                    )}
                                                </div>
                                            ) : null}

                                            {(hotelItem.warnings?.length ?? 0) >
                                            0 ? (
                                                <div className="space-y-1.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                                                    <div className="flex items-center gap-2 font-semibold">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        Catatan import
                                                    </div>
                                                    {hotelItem.warnings?.map(
                                                        (message) => (
                                                            <p
                                                                key={`warning-${message}`}
                                                                className="break-words"
                                                            >
                                                                {message}
                                                            </p>
                                                        ),
                                                    )}
                                                </div>
                                            ) : null}

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
                                                    <Select
                                                        value={
                                                            hotelItem.currency ||
                                                            'none'
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            setBulkHotelData(
                                                                hotelIndex,
                                                                'currency',
                                                                value === 'none'
                                                                    ? pdfDefaultCurrency ||
                                                                          defaultCurrency
                                                                    : value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih kurs" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">
                                                                Pilih kurs
                                                            </SelectItem>
                                                            {currencyOptions.map(
                                                                (currency) => (
                                                                    <SelectItem
                                                                        key={
                                                                            currency.code
                                                                        }
                                                                        value={
                                                                            currency.code
                                                                        }
                                                                    >
                                                                        {
                                                                            currency.code
                                                                        }{' '}
                                                                        -{' '}
                                                                        {
                                                                            currency.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <BrokerPricingEditor
                                                key={hotelIndex}
                                                title="Pricing per Broker"
                                                subtitle="Satu broker bisa punya banyak season."
                                                periodRates={
                                                    hotelItem.period_rates
                                                }
                                                inlineEdit
                                                onChange={(periodRates) =>
                                                    setBulkHotelData(
                                                        hotelIndex,
                                                        'period_rates',
                                                        periodRates,
                                                    )
                                                }
                                            />
                                        </div>
                                    );
                                },
                            )}
                        </div>

                        <div className="sticky bottom-0 flex flex-col gap-3 border-t bg-background/95 pt-3 pb-1 backdrop-blur sm:flex-row sm:items-center">
                            <div
                                aria-live="polite"
                                className="min-w-0 flex-1 text-xs"
                            >
                                {hasImportConflicts ? (
                                    <p className="font-medium text-red-700 dark:text-red-300">
                                        {draftIssueSummary.conflicts} conflict
                                        masih perlu diperbaiki. Baris merah
                                        menunjukkan lokasi masalah.
                                    </p>
                                ) : draftIssueSummary.warnings > 0 ? (
                                    <p className="font-medium text-amber-700 dark:text-amber-300">
                                        Draft siap disimpan dengan{' '}
                                        {draftIssueSummary.warnings} catatan.
                                        Rate kosong tidak akan dibuat.
                                    </p>
                                ) : (
                                    <p className="font-medium text-emerald-700 dark:text-emerald-300">
                                        Semua conflict sudah selesai. Draft siap
                                        disimpan.
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap justify-end gap-2">
                                {importSummary ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            void reviewCurrentDraft()
                                        }
                                        disabled={isImporting}
                                    >
                                        Periksa Ulang Draft
                                    </Button>
                                ) : null}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setBulkOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        isSavingBulk ||
                                        isImporting ||
                                        hasImportConflicts
                                    }
                                    title={
                                        hasImportConflicts
                                            ? 'Perbaiki semua baris merah sebelum menyimpan.'
                                            : undefined
                                    }
                                >
                                    {isSavingBulk
                                        ? 'Menyimpan...'
                                        : 'Simpan Semua Hotel'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <Sheet
                open={editingHotel === 'new'}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingHotel(null);
                        setHotelSubmissionErrors({});
                    }
                }}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto bg-background sm:max-w-2xl"
                >
                    <SheetHeader>
                        <SheetTitle>Tambah Hotel</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submit} className="mt-6 space-y-5">
                        <FormValidationSummary errors={hotelSubmissionErrors} />
                        <div className="space-y-3 rounded-xl border border-border/40 bg-card p-3">
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
                                            form.setData((current) => ({
                                                ...current,
                                                country_id: value,
                                                city_id: '',
                                            }))
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
                                    <Select
                                        value={form.data.currency || 'none'}
                                        onValueChange={(value) =>
                                            form.setData(
                                                'currency',
                                                value === 'none'
                                                    ? defaultCurrency
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kurs" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Pilih kurs
                                            </SelectItem>
                                            {currencyOptions.map((currency) => (
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
                            </div>
                        </div>

                        <BrokerPricingEditor
                            title="Pricing per Broker"
                            subtitle="Satu broker bisa punya banyak season."
                            periodRates={form.data.period_rates}
                            inlineEdit
                            onChange={(periodRates) =>
                                form.setData('period_rates', periodRates)
                            }
                        />

                        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-border/40 bg-background/95 pt-3 pb-1 backdrop-blur">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingHotel(null)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSavingHotel}>
                                {isSavingHotel ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );

    return pageContent;
}

function toPeriodRates(
    prices: Array<PriceRow & { room_type_name: string; broker_name?: string }>,
): HotelPeriodRateRow[] {
    const grouped: Record<string, HotelPeriodRateRow> = {};
    for (const price of prices) {
        const brokerName = normalizeCell(price.broker_name || 'Broker 1');
        const brokerKey =
            normalizeKey(price.broker_key || brokerName) || 'broker-1';
        const key = `${brokerKey}|${price.period_start}|${price.period_end}`;
        if (!grouped[key]) {
            grouped[key] = {
                ui_id: `period-${key}`,
                broker_group_id: brokerKey,
                broker_key: brokerKey,
                broker_name: brokerName,
                period_start: price.period_start,
                period_end: price.period_end,
                dbl_price: 0,
                trpl_price: 0,
                quad_price: 0,
                pricesByRoomType: {
                    DBL: 0,
                    TRPL: 0,
                    QUAD: 0,
                },
            };
        }
        const roomTypeName = normalizeProductHotelRoomType(
            price.room_type_name,
        );
        if (roomTypeName === 'DBL') {
            grouped[key].dbl_price = price.price;
            grouped[key].pricesByRoomType.DBL = price.price;
        } else if (roomTypeName === 'TRPL') {
            grouped[key].trpl_price = price.price;
            grouped[key].pricesByRoomType.TRPL = price.price;
        } else if (roomTypeName === 'QUAD') {
            grouped[key].quad_price = price.price;
            grouped[key].pricesByRoomType.QUAD = price.price;
        }
    }
    return Object.values(grouped).sort((a, b) =>
        a.period_start.localeCompare(b.period_start),
    );
}
