import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
    Banknote,
    Camera,
    ChevronDown,
    Megaphone,
    Plus,
    Trash2,
    UserRoundCheck,
    UsersRound,
} from 'lucide-react';
import type { CurrencyOption, PackageOperationalCosts } from './types';

type Props = {
    value: PackageOperationalCosts;
    currencies: CurrencyOption[];
    hotelPerPax?: number;
    ticketAndVisaPerPax?: number;
    tourLeaderTotal?: number;
    muthawwifTotal?: number;
    focHotelTotal?: number;
    focProductTotal?: number;
    focAllInTotal?: number;
    onChange: (value: PackageOperationalCosts) => void;
};

const numberValue = (value: string): number => Math.max(0, Number(value) || 0);
const createId = (): string => {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }

    return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const formatNumber = (value: number): string =>
    new Intl.NumberFormat('id-ID').format(Math.round(value || 0));

const formatCurrency = (value: number, currency: string = 'IDR'): string =>
    `${formatNumber(value)} ${currency.toUpperCase()}`;

function BreakdownLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] text-muted-foreground">{label}</span>
            <span className="text-[11px] font-medium text-foreground">
                {value}
            </span>
        </div>
    );
}

function BreakdownBox({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="mb-2 text-xs font-semibold">{title}</p>
            <div className="space-y-1.5">{children}</div>
        </div>
    );
}

function CostCard({
    icon: Icon,
    title,
    status,
    isConfigured,
    children,
}: {
    icon: React.ElementType;
    title: string;
    status: string;
    isConfigured: boolean;
    children: React.ReactNode;
}) {
    return (
        <Collapsible className="overflow-hidden rounded-xl border border-border/70 bg-card">
            <CollapsibleTrigger
                type="button"
                className="group flex min-h-14 w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-4"
            >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                        {title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                        {status}
                    </span>
                </span>
                <span
                    className={
                        isConfigured
                            ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }
                >
                    {isConfigured ? 'Sudah diisi' : 'Belum diisi'}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="border-t border-border/60 p-3 sm:p-4">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

function CostField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-w-0">
            <Label className="mb-1.5 block text-xs">{label}</Label>
            {children}
        </div>
    );
}

function CurrencySelect({
    value,
    currencies,
    onChange,
}: {
    value: string;
    currencies: CurrencyOption[];
    onChange: (value: string) => void;
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                        {currency.code}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function PackageOperationalCostCards({
    value,
    currencies,
    hotelPerPax = 0,
    ticketAndVisaPerPax = 0,
    tourLeaderTotal,
    muthawwifTotal,
    focHotelTotal = 0,
    focProductTotal = 0,
    focAllInTotal = 0,
    onChange,
}: Props) {
    const patch = <K extends keyof PackageOperationalCosts>(
        key: K,
        nextValue: PackageOperationalCosts[K],
    ) => onChange({ ...value, [key]: nextValue });
    const hasFoc = value.foc.count > 0;
    const supportComponentCount = [
        value.overhead.amount > 0,
        value.photographer.count > 0 &&
            value.photographer.daily_salary > 0 &&
            value.photographer.days > 0,
        value.human_resources.length > 0,
    ].filter(Boolean).length;
    const hasTourLeader =
        value.tour_leader.count > 0 &&
        (value.tour_leader.salary_per_trip > 0 ||
            value.tour_leader.include_hotel ||
            value.tour_leader.include_ticket_and_visa);
    const hasMuthawwif =
        value.muthawwif.count > 0 &&
        (value.muthawwif.daily_salary > 0 || value.muthawwif.include_hotel);
    const hasMarketing = value.marketing.amount_per_pax > 0;
    const tipEntryCount = value.guide_tips.length + value.driver_tips.length;

    return (
        <div className="mt-4 space-y-3">
            <CostCard
                icon={UsersRound}
                title="FOC - Free of Cost"
                status={hasFoc ? `${value.foc.count} orang FOC` : 'Opsional'}
                isConfigured={hasFoc}
            >
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:items-end">
                    <CostField label="Jumlah FOC">
                        <Input
                            type="number"
                            min={0}
                            step={1}
                            value={value.foc.count || ''}
                            onChange={(event) =>
                                patch('foc', {
                                    count: numberValue(event.target.value),
                                })
                            }
                        />
                    </CostField>
                    <BreakdownBox title="Estimasi biaya FOC">
                        <BreakdownLine
                            label="Hotel Quad"
                            value={formatCurrency(focHotelTotal)}
                        />
                        <BreakdownLine
                            label="Produk"
                            value={formatCurrency(focProductTotal)}
                        />
                        <BreakdownLine
                            label="Paket All In"
                            value={formatCurrency(focAllInTotal)}
                        />
                        <div className="border-t border-border/60 pt-1.5">
                            <BreakdownLine
                                label={`Total ${value.foc.count || 0} FOC`}
                                value={formatCurrency(
                                    focHotelTotal +
                                        focProductTotal +
                                        focAllInTotal,
                                )}
                            />
                        </div>
                    </BreakdownBox>
                </div>
            </CostCard>

            <CostCard
                icon={UsersRound}
                title="SDM + Overhead + Fotografer"
                status={
                    supportComponentCount > 0
                        ? `${supportComponentCount} komponen biaya terisi`
                        : 'Opsional'
                }
                isConfigured={supportComponentCount > 0}
            >
                <div className="space-y-3">
                    <BreakdownBox title="Overhead">
                        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                            <CostField label="Overhead total">
                                <Input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={value.overhead.amount || ''}
                                    onChange={(event) =>
                                        patch('overhead', {
                                            ...value.overhead,
                                            amount: numberValue(
                                                event.target.value,
                                            ),
                                        })
                                    }
                                />
                            </CostField>
                            <CostField label="Mode">
                                <Select
                                    value={value.overhead.mode}
                                    onValueChange={(
                                        mode: 'total' | 'per_pax',
                                    ) =>
                                        patch('overhead', {
                                            ...value.overhead,
                                            mode,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="total">
                                            Total flat
                                        </SelectItem>
                                        <SelectItem value="per_pax">
                                            Per jamaah
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </CostField>
                        </div>
                        <div className="rounded-md bg-background/70 p-2">
                            <BreakdownLine
                                label="Rumus"
                                value={
                                    value.overhead.mode === 'per_pax'
                                        ? `${formatCurrency(value.overhead.amount)} x jumlah jamaah`
                                        : formatCurrency(value.overhead.amount)
                                }
                            />
                        </div>
                    </BreakdownBox>

                    <BreakdownBox title="Fotografer">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <CostField label="Jumlah fotografer">
                                <Input
                                    type="number"
                                    min={0}
                                    value={value.photographer.count || ''}
                                    onChange={(event) =>
                                        patch('photographer', {
                                            ...value.photographer,
                                            count: numberValue(
                                                event.target.value,
                                            ),
                                        })
                                    }
                                />
                            </CostField>
                            <CostField label="Gaji fotografer / hari">
                                <Input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={
                                        value.photographer.daily_salary || ''
                                    }
                                    onChange={(event) =>
                                        patch('photographer', {
                                            ...value.photographer,
                                            daily_salary: numberValue(
                                                event.target.value,
                                            ),
                                        })
                                    }
                                />
                            </CostField>
                            <CostField label="Jumlah hari">
                                <Input
                                    type="number"
                                    min={0}
                                    value={value.photographer.days || ''}
                                    onChange={(event) =>
                                        patch('photographer', {
                                            ...value.photographer,
                                            days: numberValue(
                                                event.target.value,
                                            ),
                                        })
                                    }
                                />
                            </CostField>
                            <CostField label="Mata uang">
                                <CurrencySelect
                                    value={value.photographer.currency}
                                    currencies={currencies}
                                    onChange={(currency) =>
                                        patch('photographer', {
                                            ...value.photographer,
                                            currency,
                                        })
                                    }
                                />
                            </CostField>
                        </div>
                        <div className="rounded-md bg-background/70 p-2">
                            <BreakdownLine
                                label="Rumus"
                                value={`${value.photographer.count || 0} x ${formatCurrency(value.photographer.daily_salary, value.photographer.currency)} x ${value.photographer.days || 0} hari`}
                            />
                        </div>
                    </BreakdownBox>

                    <div className="border-t border-border/60 pt-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold">
                                SDM opsional
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    patch('human_resources', [
                                        ...value.human_resources,
                                        { id: createId(), name: '', salary: 0 },
                                    ])
                                }
                            >
                                <Plus className="mr-1 h-3.5 w-3.5" /> Kelola SDM
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            {value.human_resources.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="grid gap-2 rounded-lg bg-muted/25 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(150px,0.65fr)_auto]"
                                >
                                    <Input
                                        value={item.name}
                                        placeholder="Nama / peran SDM"
                                        onChange={(event) =>
                                            patch(
                                                'human_resources',
                                                value.human_resources.map(
                                                    (row, rowIndex) =>
                                                        rowIndex === index
                                                            ? {
                                                                  ...row,
                                                                  name: event
                                                                      .target
                                                                      .value,
                                                              }
                                                            : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        step={1000}
                                        value={item.salary || ''}
                                        placeholder="Gaji total"
                                        onChange={(event) =>
                                            patch(
                                                'human_resources',
                                                value.human_resources.map(
                                                    (row, rowIndex) =>
                                                        rowIndex === index
                                                            ? {
                                                                  ...row,
                                                                  salary: numberValue(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                              }
                                                            : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Hapus SDM ${item.name || index + 1}`}
                                        onClick={() =>
                                            patch(
                                                'human_resources',
                                                value.human_resources.filter(
                                                    (_, rowIndex) =>
                                                        rowIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CostCard>

            <CostCard
                icon={UserRoundCheck}
                title="Gaji Tour Leader"
                status={
                    hasTourLeader
                        ? `${value.tour_leader.count} orang · ${formatCurrency(tourLeaderTotal ?? 0)}`
                        : 'Opsional'
                }
                isConfigured={hasTourLeader}
            >
                <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <CostField label="Jumlah Tour Leader">
                            <Input
                                type="number"
                                min={0}
                                value={value.tour_leader.count || ''}
                                onChange={(event) =>
                                    patch('tour_leader', {
                                        ...value.tour_leader,
                                        count: numberValue(event.target.value),
                                    })
                                }
                            />
                        </CostField>
                        <CostField label="Gaji per trip">
                            <Input
                                type="number"
                                min={0}
                                step={1000}
                                value={value.tour_leader.salary_per_trip || ''}
                                onChange={(event) =>
                                    patch('tour_leader', {
                                        ...value.tour_leader,
                                        salary_per_trip: numberValue(
                                            event.target.value,
                                        ),
                                    })
                                }
                            />
                        </CostField>
                        <CostField label="Mata uang">
                            <CurrencySelect
                                value={value.tour_leader.currency}
                                currencies={currencies}
                                onChange={(currency) =>
                                    patch('tour_leader', {
                                        ...value.tour_leader,
                                        currency,
                                    })
                                }
                            />
                        </CostField>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <label className="flex items-center gap-2 text-xs">
                            <Checkbox
                                checked={value.tour_leader.include_hotel}
                                onCheckedChange={(checked) =>
                                    patch('tour_leader', {
                                        ...value.tour_leader,
                                        include_hotel: Boolean(checked),
                                    })
                                }
                            />{' '}
                            Tambahkan biaya hotel per TL
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                            <Checkbox
                                checked={
                                    value.tour_leader.include_ticket_and_visa
                                }
                                onCheckedChange={(checked) =>
                                    patch('tour_leader', {
                                        ...value.tour_leader,
                                        include_ticket_and_visa:
                                            Boolean(checked),
                                    })
                                }
                            />{' '}
                            Tambahkan tiket &amp; visa per TL
                        </label>
                    </div>
                    <BreakdownBox title="Breakdown TL">
                        <BreakdownLine
                            label="Jumlah TL"
                            value={`${value.tour_leader.count || 0} orang`}
                        />
                        <BreakdownLine
                            label="Gaji per trip"
                            value={formatCurrency(
                                value.tour_leader.salary_per_trip,
                                value.tour_leader.currency,
                            )}
                        />
                        <BreakdownLine
                            label="Hotel per TL"
                            value={
                                value.tour_leader.include_hotel
                                    ? `Rp ${formatNumber(hotelPerPax)} / pax`
                                    : 'Tidak dihitung'
                            }
                        />
                        <BreakdownLine
                            label="Tiket & visa per TL"
                            value={
                                value.tour_leader.include_ticket_and_visa
                                    ? `Rp ${formatNumber(ticketAndVisaPerPax)} / pax`
                                    : 'Tidak dihitung'
                            }
                        />
                        <div className="border-t border-border/60 pt-1.5">
                            <BreakdownLine
                                label="Total HPP TL"
                                value={formatCurrency(tourLeaderTotal ?? 0)}
                            />
                        </div>
                    </BreakdownBox>
                </div>
            </CostCard>

            <CostCard
                icon={Banknote}
                title="Gaji Muthawwif"
                status={
                    hasMuthawwif
                        ? `${value.muthawwif.count} orang · ${formatCurrency(muthawwifTotal ?? 0)}`
                        : 'Opsional'
                }
                isConfigured={hasMuthawwif}
            >
                <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <CostField label="Jumlah">
                            <Input
                                type="number"
                                min={0}
                                value={value.muthawwif.count || ''}
                                onChange={(event) =>
                                    patch('muthawwif', {
                                        ...value.muthawwif,
                                        count: numberValue(event.target.value),
                                    })
                                }
                            />
                        </CostField>
                        <CostField label="Gaji / hari">
                            <Input
                                type="number"
                                min={0}
                                value={value.muthawwif.daily_salary || ''}
                                onChange={(event) =>
                                    patch('muthawwif', {
                                        ...value.muthawwif,
                                        daily_salary: numberValue(
                                            event.target.value,
                                        ),
                                    })
                                }
                            />
                        </CostField>
                        <CostField label="Jumlah hari">
                            <Input
                                type="number"
                                min={0}
                                value={value.muthawwif.days || ''}
                                onChange={(event) =>
                                    patch('muthawwif', {
                                        ...value.muthawwif,
                                        days: numberValue(event.target.value),
                                    })
                                }
                            />
                        </CostField>
                        <CostField label="Mata uang">
                            <CurrencySelect
                                value={value.muthawwif.currency}
                                currencies={currencies}
                                onChange={(currency) =>
                                    patch('muthawwif', {
                                        ...value.muthawwif,
                                        currency,
                                    })
                                }
                            />
                        </CostField>
                    </div>
                    <label className="flex items-center gap-2 text-xs">
                        <Checkbox
                            checked={value.muthawwif.include_hotel}
                            onCheckedChange={(checked) =>
                                patch('muthawwif', {
                                    ...value.muthawwif,
                                    include_hotel: Boolean(checked),
                                })
                            }
                        />{' '}
                        Muthawwif mendapat kamar hotel
                    </label>
                    <BreakdownBox title="Breakdown Muthawwif">
                        <BreakdownLine
                            label="Jumlah"
                            value={`${value.muthawwif.count || 0} orang`}
                        />
                        <BreakdownLine
                            label="Gaji / hari"
                            value={formatCurrency(
                                value.muthawwif.daily_salary,
                                value.muthawwif.currency,
                            )}
                        />
                        <BreakdownLine
                            label="Jumlah hari"
                            value={`${value.muthawwif.days || 0} hari`}
                        />
                        <BreakdownLine
                            label="Kamar hotel"
                            value={
                                value.muthawwif.include_hotel
                                    ? `Rp ${formatNumber(hotelPerPax)} / pax`
                                    : 'Tidak dihitung'
                            }
                        />
                        <div className="border-t border-border/60 pt-1.5">
                            <BreakdownLine
                                label="Total HPP Muthawwif"
                                value={formatCurrency(muthawwifTotal ?? 0)}
                            />
                        </div>
                    </BreakdownBox>
                </div>
            </CostCard>

            <CostCard
                icon={Megaphone}
                title="Biaya Marketing"
                status={
                    hasMarketing
                        ? formatCurrency(value.marketing.amount_per_pax)
                        : 'Opsional'
                }
                isConfigured={hasMarketing}
            >
                <div className="space-y-3">
                    <CostField label="Biaya marketing total (IDR)">
                        <Input
                            type="number"
                            min={0}
                            step={1000}
                            value={value.marketing.amount_per_pax || ''}
                            onChange={(event) =>
                                patch('marketing', {
                                    amount_per_pax: numberValue(
                                        event.target.value,
                                    ),
                                })
                            }
                        />
                    </CostField>
                    <BreakdownBox title="Rumus marketing">
                        <BreakdownLine
                            label="Total budget"
                            value={formatCurrency(
                                value.marketing.amount_per_pax,
                            )}
                        />
                        <BreakdownLine
                            label="Dipakai di HPP"
                            value="÷ jumlah jamaah = beban per pax"
                        />
                    </BreakdownBox>
                </div>
            </CostCard>

            <CostCard
                icon={Camera}
                title="Tips Sopir & Guide Lokal"
                status={
                    tipEntryCount > 0
                        ? `${tipEntryCount} komponen tips`
                        : 'Opsional'
                }
                isConfigured={tipEntryCount > 0}
            >
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="text-xs font-semibold">
                                    Tips guide
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    patch('guide_tips', [
                                        ...value.guide_tips,
                                        {
                                            id: createId(),
                                            country: '',
                                            amount_per_day: 0,
                                            days: 1,
                                            currency: 'USD',
                                            mode: 'per_pax',
                                        },
                                    ])
                                }
                            >
                                <Plus className="mr-1 h-3.5 w-3.5" /> Guide
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            {value.guide_tips.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="grid gap-2 rounded-lg bg-background/70 p-2 sm:grid-cols-2 xl:grid-cols-[1fr_0.8fr_0.55fr_0.75fr_0.8fr_auto]"
                                >
                                    <Input
                                        value={item.country}
                                        placeholder="Negara"
                                        onChange={(event) =>
                                            patch(
                                                'guide_tips',
                                                value.guide_tips.map(
                                                    (row, rowIndex) =>
                                                        rowIndex === index
                                                            ? {
                                                                  ...row,
                                                                  country:
                                                                      event
                                                                          .target
                                                                          .value,
                                                              }
                                                            : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        value={item.amount_per_day || ''}
                                        placeholder="Biaya / hari"
                                        onChange={(event) =>
                                            patch(
                                                'guide_tips',
                                                value.guide_tips.map(
                                                    (row, rowIndex) =>
                                                        rowIndex === index
                                                            ? {
                                                                  ...row,
                                                                  amount_per_day:
                                                                      numberValue(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                              }
                                                            : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        value={item.days || ''}
                                        placeholder="Hari"
                                        onChange={(event) =>
                                            patch(
                                                'guide_tips',
                                                value.guide_tips.map(
                                                    (row, rowIndex) =>
                                                        rowIndex === index
                                                            ? {
                                                                  ...row,
                                                                  days: numberValue(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                              }
                                                            : row,
                                                ),
                                            )
                                        }
                                    />
                                    <CurrencySelect
                                        value={item.currency}
                                        currencies={currencies}
                                        onChange={(currency) =>
                                            patch(
                                                'guide_tips',
                                                value.guide_tips.map(
                                                    (row, rowIndex) =>
                                                        rowIndex === index
                                                            ? {
                                                                  ...row,
                                                                  currency,
                                                              }
                                                            : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Select
                                        value={item.mode}
                                        onValueChange={(
                                            mode: 'per_pax' | 'per_group',
                                        ) =>
                                            patch(
                                                'guide_tips',
                                                value.guide_tips.map(
                                                    (row, rowIndex) =>
                                                        rowIndex === index
                                                            ? {
                                                                  ...row,
                                                                  mode,
                                                              }
                                                            : row,
                                                ),
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="per_pax">
                                                Per jamaah
                                            </SelectItem>
                                            <SelectItem value="per_group">
                                                Per grup
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        aria-label="Hapus tips guide"
                                        onClick={() =>
                                            patch(
                                                'guide_tips',
                                                value.guide_tips.filter(
                                                    (_, rowIndex) =>
                                                        rowIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <BreakdownBox title="Rumus guide">
                            <BreakdownLine
                                label="Hitung"
                                value="Biaya / hari x jumlah hari x mode (per jamaah / per grup)"
                            />
                        </BreakdownBox>
                    </div>

                    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="text-xs font-semibold">
                                    Tips sopir
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    patch('driver_tips', [
                                        ...value.driver_tips,
                                        {
                                            id: createId(),
                                            country: '',
                                            amount: 0,
                                            currency: 'IDR',
                                        },
                                    ])
                                }
                            >
                                <Plus className="mr-1 h-3.5 w-3.5" /> Sopir
                            </Button>
                        </div>
                        <div className="grid gap-2">
                            {value.driver_tips.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="grid gap-2 rounded-lg bg-background/70 p-2 sm:grid-cols-[minmax(0,1fr)_minmax(130px,0.8fr)_110px_auto]"
                                >
                                    <Input
                                        value={item.country}
                                        placeholder="Negara"
                                        onChange={(event) =>
                                            patch(
                                                'driver_tips',
                                                value.driver_tips.map(
                                                    (row, rowIndex) =>
                                                        rowIndex === index
                                                            ? {
                                                                  ...row,
                                                                  country:
                                                                      event
                                                                          .target
                                                                          .value,
                                                              }
                                                            : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Input
                                        type="number"
                                        min={0}
                                        value={item.amount || ''}
                                        placeholder="Total tips"
                                        onChange={(event) =>
                                            patch(
                                                'driver_tips',
                                                value.driver_tips.map(
                                                    (row, rowIndex) =>
                                                        rowIndex === index
                                                            ? {
                                                                  ...row,
                                                                  amount: numberValue(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                              }
                                                            : row,
                                                ),
                                            )
                                        }
                                    />
                                    <CurrencySelect
                                        value={item.currency}
                                        currencies={currencies}
                                        onChange={(currency) =>
                                            patch(
                                                'driver_tips',
                                                value.driver_tips.map(
                                                    (row, rowIndex) =>
                                                        rowIndex === index
                                                            ? {
                                                                  ...row,
                                                                  currency,
                                                              }
                                                            : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        aria-label="Hapus tips sopir"
                                        onClick={() =>
                                            patch(
                                                'driver_tips',
                                                value.driver_tips.filter(
                                                    (_, rowIndex) =>
                                                        rowIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <BreakdownBox title="Rumus sopir">
                            <BreakdownLine
                                label="Hitung"
                                value="Total tips per negara / rute"
                            />
                        </BreakdownBox>
                    </div>
                </div>
            </CostCard>
        </div>
    );
}
