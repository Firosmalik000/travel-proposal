import {
    IslamicOrnamentOttomanAccent,
    IslamicOrnamentZellige,
} from '@/components/public-ornaments';
import { usePublicLocale } from '@/contexts/public-locale';
import PublicLayout from '@/layouts/PublicLayout';
import {
    formatDate,
    formatPrice,
    localize,
    usePublicData,
    usePublicPageContent,
    whatsappLinkFromSeo,
} from '@/lib/public-content';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const content = {
    id: {
        title: 'Paket Umroh 2026',
        description:
            'Pilih paket umroh sesuai bulan, kota keberangkatan, durasi, dan preferensi hotel.',
        filters: {
            month: 'Bulan Keberangkatan',
            city: 'Kota Keberangkatan',
            duration: 'Durasi',
            budget: 'Budget Maksimal',
            hotel: 'Tipe Hotel',
            airline: 'Maskapai',
            all: 'Semua',
            budgetPlaceholder: 'Contoh: 35000000',
            hotels: ['Hemat', 'Reguler', 'Premium'],
            airlines: ['Garuda Indonesia', 'Saudia', 'Menyesuaikan jadwal'],
        },
        cards: {
            detail: 'Detail Paket',
            ask: 'Tanya Seat',
        },
        summary: {
            showing: 'Menampilkan',
            resultSingle: 'paket',
            resultPlural: 'paket',
            reset: 'Reset Filter',
            emptyTitle: 'Belum ada paket yang cocok',
            emptyDescription:
                'Coba ubah filter atau hubungi admin untuk paket custom.',
        },
        note: 'Harga dapat berbeda sesuai tipe kamar (quad, triple, double).',
        floatingWhatsapp: 'WhatsApp',
    },
    en: {
        title: 'Umrah Packages 2026',
        description:
            'Choose packages by departure month, city, duration, and hotel preference.',
        filters: {
            month: 'Departure Month',
            city: 'Departure City',
            duration: 'Duration',
            budget: 'Max Budget',
            hotel: 'Hotel Type',
            airline: 'Airline',
            all: 'All',
            budgetPlaceholder: 'Example: 35000000',
            hotels: ['Economy', 'Regular', 'Premium'],
            airlines: ['Garuda Indonesia', 'Saudia', 'Flexible by schedule'],
        },
        cards: {
            detail: 'Package Details',
            ask: 'Check Availability',
        },
        summary: {
            showing: 'Showing',
            resultSingle: 'package',
            resultPlural: 'packages',
            reset: 'Reset Filters',
            emptyTitle: 'No packages match your filters',
            emptyDescription:
                'Try adjusting the filters or contact the admin for a custom package.',
        },
        note: 'Prices may vary depending on room type (quad, triple, double).',
        floatingWhatsapp: 'WhatsApp',
    },
};

type PackageCard = {
    slug?: string;
    title: string;
    originalPrice?: string;
    discountLabel?: string;
    ratingAvg?: number | null;
    ratingCount?: number;
    price: string;
    numericPrice: number;
    date: string;
    departureMonth: string;
    city: string;
    hotel: string;
    airline: string;
    durationLabel: string;
    durationDays: number;
    notes: string;
    image: string;
};

export default function Paket() {
    const { locale } = usePublicLocale();
    const publicData = usePublicData();
    const paketPage = usePublicPageContent('paket-umroh');
    const { seoSettings } = usePage<SharedData>().props;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const t = content[locale];
    const whatsappLink = whatsappLinkFromSeo(seo);

    const packages: PackageCard[] = Array.isArray(publicData.packages)
        ? publicData.packages.map((item: Record<string, any>) => {
              const firstSchedule = Array.isArray(item.schedules)
                  ? item.schedules[0]
                  : null;
              const departureDate = String(firstSchedule?.departure_date ?? '');
              const fallbackHotel = localize(
                  item.content?.hotel,
                  locale,
                  item.package_type ?? '',
              );
              const fallbackAirline = localize(
                  item.content?.airline,
                  locale,
                  locale === 'id'
                      ? 'Menyesuaikan jadwal'
                      : 'Flexible by schedule',
              );

              return {
                  slug: item.slug,
                  title: localize(item.name, locale),
                  price: formatPrice(item.price, locale, item.currency),
                  numericPrice: Number(item.price ?? 0),
                  originalPrice: item.original_price
                      ? formatPrice(item.original_price, locale, item.currency)
                      : undefined,
                  discountLabel:
                      item.discount_label ??
                      (item.discount_percent
                          ? `HEMAT ${item.discount_percent}%`
                          : undefined),
                  ratingAvg: item.rating_avg ?? null,
                  ratingCount: Number(item.rating_count ?? 0),
                  date: formatDate(departureDate, locale),
                  departureMonth: departureDate
                      ? formatMonthYear(departureDate, locale)
                      : '',
                  city: String(item.departure_city ?? ''),
                  hotel: fallbackHotel,
                  airline: fallbackAirline,
                  durationLabel: `${item.duration_days} ${locale === 'id' ? 'Hari' : 'Days'}`,
                  durationDays: Number(item.duration_days ?? 0),
                  notes: (item.products ?? [])
                      .map((product: Record<string, any>) =>
                          localize(product.name, locale),
                      )
                      .join(' | '),
                  image: item.image_path || '/images/dummy.jpg',
              };
          })
        : [];

    const months = uniqueOptions(
        Array.isArray(paketPage?.content?.filters?.months)
            ? paketPage?.content?.filters?.months
            : [],
        packages.map((item) => item.departureMonth).filter(Boolean),
    );
    const cities = uniqueOptions(
        Array.isArray(paketPage?.content?.filters?.cities)
            ? paketPage?.content?.filters?.cities
            : [],
        packages.map((item) => item.city).filter(Boolean),
    );
    const durations = uniqueOptions(
        Array.isArray(paketPage?.content?.filters?.durations)
            ? paketPage?.content?.filters?.durations
            : [],
        packages.map((item) => item.durationLabel).filter(Boolean),
    );
    const hotels = uniqueOptions(
        t.filters.hotels,
        packages.map((item) => item.hotel).filter(Boolean),
    );
    const airlines = uniqueOptions(
        t.filters.airlines,
        packages.map((item) => item.airline).filter(Boolean),
    );

    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDuration, setSelectedDuration] = useState('');
    const [selectedHotel, setSelectedHotel] = useState('');
    const [selectedAirline, setSelectedAirline] = useState('');
    const [budgetValue, setBudgetValue] = useState('');

    const filteredPackages = packages.filter((item) => {
        const maxBudget = Number(budgetValue);
        const passesMonth =
            !selectedMonth || item.departureMonth === selectedMonth;
        const passesCity = !selectedCity || item.city === selectedCity;
        const passesDuration =
            !selectedDuration || item.durationLabel === selectedDuration;
        const passesHotel = !selectedHotel || item.hotel === selectedHotel;
        const passesAirline =
            !selectedAirline || item.airline === selectedAirline;
        const passesBudget =
            !budgetValue ||
            (Number.isFinite(maxBudget) && item.numericPrice <= maxBudget);

        return (
            passesMonth &&
            passesCity &&
            passesDuration &&
            passesHotel &&
            passesAirline &&
            passesBudget
        );
    });

    const detailLabel = localize(
        paketPage?.content?.cards?.detail,
        locale,
        t.cards.detail,
    );
    const askLabel = localize(
        paketPage?.content?.cards?.ask,
        locale,
        t.cards.ask,
    );
    const note = localize(paketPage?.content?.note, locale, t.note);

    const resetFilters = (): void => {
        setSelectedMonth('');
        setSelectedCity('');
        setSelectedDuration('');
        setSelectedHotel('');
        setSelectedAirline('');
        setBudgetValue('');
    };

    return (
        <PublicLayout>
            <Head title={localize(paketPage?.title, locale, t.title)}>
                <meta
                    name="description"
                    content={localize(
                        paketPage?.excerpt,
                        locale,
                        t.description,
                    )}
                />
            </Head>

            <main className="relative bg-background">
                <section className="relative isolate overflow-hidden py-6 sm:py-10">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <IslamicOrnamentZellige className="absolute top-[-26%] right-[-10%] h-[18rem] w-[18rem] rotate-[12deg] text-primary/15 sm:h-[22rem] sm:w-[22rem]" />
                        <IslamicOrnamentOttomanAccent className="absolute bottom-[-36%] left-[-12%] h-[20rem] w-[20rem] -rotate-[10deg] text-accent/15 sm:h-[26rem] sm:w-[26rem]" />
                    </div>
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="rounded-[24px] border border-border bg-card/90 px-5 py-6 shadow-lg sm:rounded-[36px] sm:px-8 sm:py-10">
                            <h1 className="public-heading text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
                                {localize(paketPage?.title, locale, t.title)}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {localize(
                                    paketPage?.excerpt,
                                    locale,
                                    t.description,
                                )}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="relative isolate overflow-hidden pb-16">
                    <div className="pointer-events-none absolute inset-0 -z-10">
                        <IslamicOrnamentOttomanAccent className="absolute top-[-34%] left-[10%] h-[18rem] w-[18rem] rotate-[16deg] text-primary/12 sm:h-[22rem] sm:w-[22rem]" />
                    </div>

                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="grid gap-5 rounded-3xl border border-border bg-card/90 p-5 shadow-sm sm:grid-cols-2 sm:p-7 md:grid-cols-2 lg:grid-cols-3">
                    <FilterSelect
                        label={t.filters.month}
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        options={months}
                        allLabel={t.filters.all}
                    />
                    <FilterSelect
                        label={t.filters.city}
                        value={selectedCity}
                        onChange={setSelectedCity}
                        options={cities}
                        allLabel={t.filters.all}
                    />
                    <FilterSelect
                        label={t.filters.duration}
                        value={selectedDuration}
                        onChange={setSelectedDuration}
                        options={durations}
                        allLabel={t.filters.all}
                    />
                    <label className="text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase sm:text-xs">
                        {t.filters.budget}
                        <input
                            className="mt-2.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
                            placeholder={t.filters.budgetPlaceholder}
                            value={budgetValue}
                            onChange={(event) =>
                                setBudgetValue(
                                    event.target.value.replace(/[^\d]/g, ''),
                                )
                            }
                        />
                    </label>
                    <FilterSelect
                        label={t.filters.hotel}
                        value={selectedHotel}
                        onChange={setSelectedHotel}
                        options={hotels}
                        allLabel={t.filters.all}
                    />
                    <FilterSelect
                        label={t.filters.airline}
                        value={selectedAirline}
                        onChange={setSelectedAirline}
                        options={airlines}
                        allLabel={t.filters.all}
                    />
                        </div>

                        <div className="mt-5 flex flex-col gap-4 rounded-[20px] border border-border bg-card/80 px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-medium">
                                {t.summary.showing}{' '}
                                <span className="font-bold text-foreground">
                                    {filteredPackages.length}
                                </span>{' '}
                                {filteredPackages.length === 1
                                    ? t.summary.resultSingle
                                    : t.summary.resultPlural}
                            </p>
                            <button
                                type="button"
                                className="inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted sm:w-auto"
                                onClick={resetFilters}
                            >
                                {t.summary.reset}
                            </button>
                        </div>

                        {filteredPackages.length === 0 ? (
                            <div className="mt-8 rounded-3xl border border-dashed border-border bg-card/70 px-6 py-10 text-center shadow-sm">
                                <h2 className="public-heading text-xl font-semibold text-foreground">
                                    {t.summary.emptyTitle}
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {t.summary.emptyDescription}
                                </p>
                                <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                                        onClick={resetFilters}
                                    >
                                        {t.summary.reset}
                                    </button>
                                    <a
                                        href={whatsappLink}
                                        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                                    >
                                        {askLabel}
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredPackages.map((item) => (
                                    <div
                                        key={item.title + item.date}
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                                    >
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden bg-muted/40">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                                    {/* Discount badge */}
                                    {item.discountLabel && (
                                        <span className="absolute top-3 right-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow">
                                            {item.discountLabel}
                                        </span>
                                    )}

                                    {/* City + duration overlay */}
                                    <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between">
                                        <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                                            📍 {item.city}
                                        </span>
                                        <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                                            🕐 {item.durationLabel}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-1 flex-col p-5">
                                    {/* Title */}
                                    <h3 className="public-heading line-clamp-2 text-base leading-snug font-bold text-foreground">
                                        {item.title}
                                    </h3>

                                    {/* Rating */}
                                    {item.ratingAvg && (
                                        <div className="mt-1.5 flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <span
                                                    key={s}
                                                    className={`text-sm ${s <= Math.round(item.ratingAvg!) ? 'text-amber-400' : 'text-muted-foreground/30'}`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                            <span className="ml-1 text-xs font-medium text-foreground">
                                                {item.ratingAvg}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                ({item.ratingCount} ulasan)
                                            </span>
                                        </div>
                                    )}

                                    {/* Meta info */}
                                    <div className="mt-3 space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="w-4 text-center">
                                                ✈
                                            </span>
                                            <span>{item.airline}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="w-4 text-center">
                                                🏨
                                            </span>
                                            <span>{item.hotel}</span>
                                        </div>
                                        {item.date && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="w-4 text-center">
                                                    📅
                                                </span>
                                                <span>
                                                    Berangkat {item.date}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="my-4 border-t border-border" />

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-extrabold text-primary">
                                            {item.price}
                                        </span>
                                        {item.originalPrice && (
                                            <span className="text-sm text-muted-foreground line-through">
                                                {item.originalPrice}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        per jamaah
                                    </p>

                                    {/* CTA buttons — pushed to bottom */}
                                    <div className="mt-4 flex gap-2">
                                        <Link
                                            href={
                                                item.slug
                                                    ? `/paket-umroh/${item.slug}`
                                                    : '/paket-umroh'
                                            }
                                            className="flex-1 rounded-xl border border-border py-2.5 text-center text-xs font-semibold text-foreground transition hover:bg-muted"
                                        >
                                            {detailLabel}
                                        </Link>
                                        {whatsappLinkFromSeo(
                                            seo,
                                            buildPackageInquiryMessage(
                                                locale,
                                                item,
                                            ),
                                        ) ? (
                                            <a
                                                href={whatsappLinkFromSeo(
                                                    seo,
                                                    buildPackageInquiryMessage(
                                                        locale,
                                                        item,
                                                    ),
                                                )}
                                                className="flex-1 rounded-xl bg-primary py-2.5 text-center text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                                            >
                                                {askLabel}
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="mt-4 text-sm text-muted-foreground">
                            {note}
                        </p>
                    </div>
                </section>
            </main>

            {whatsappLink ? (
                <a
                    href={whatsappLink}
                    className="fixed right-6 bottom-6 z-50 inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg md:hidden"
                >
                    {t.floatingWhatsapp}
                </a>
            ) : null}
        </PublicLayout>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
    allLabel,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    allLabel: string;
}) {
    return (
        <label className="text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase sm:text-xs">
            {label}
            <select
                className="mt-2.5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="">{allLabel}</option>
                {options.map((item) => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>
        </label>
    );
}

function uniqueOptions(...groups: string[][]): string[] {
    return [
        ...new Set(groups.flat().filter((item) => item && item.trim() !== '')),
    ];
}

function formatMonthYear(value: string, locale: 'id' | 'en'): string {
    return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        month: 'long',
        year: 'numeric',
    }).format(new Date(value));
}

function buildPackageInquiryMessage(
    locale: 'id' | 'en',
    item: PackageCard,
): string {
    if (locale === 'en') {
        return [
            'Hello, I want to ask about this package:',
            `Package: ${item.title}`,
            `Departure city: ${item.city}`,
            `Departure date: ${item.date || '-'}`,
            `Price: ${item.price}`,
        ].join('\n');
    }

    return [
        'Halo, saya ingin tanya paket berikut:',
        `Paket: ${item.title}`,
        `Kota berangkat: ${item.city}`,
        `Tanggal berangkat: ${item.date || '-'}`,
        `Harga: ${item.price}`,
    ].join('\n');
}
