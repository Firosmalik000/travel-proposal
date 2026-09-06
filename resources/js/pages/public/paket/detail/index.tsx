import { MotionCard, MotionSection } from '@/components/public/motion';
import PublicLayout from '@/layouts/PublicLayout';
import {
    normalizePackageHighlights,
    packageHighlightIconMap,
} from '@/lib/package-highlights';
import {
    normalizePackageImagePositions,
    packageImageStyle,
} from '@/lib/package-image-position';
import {
    formatDate,
    formatPrice,
    hasPackageDiscount,
    localize,
    packageDiscountLabel,
    whatsappLinkFromSeo,
} from '@/lib/public/content';
import {
    absoluteUrl,
    canonicalUrl,
    jsonLdBreadcrumb,
    jsonLdProduct,
} from '@/lib/seo-jsonld';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface TravelPackagePageProps extends SharedData {
    travelPackage?: TravelPackageData;
}

type TravelPackageData = {
    [key: string]: any;
};

type PackageItinerary = {
    [key: string]: any;
};

type PackageSchedule = {
    [key: string]: any;
};

type PackageTestimonial = {
    [key: string]: any;
};

type RoomTypePriceRow = {
    type: 'double' | 'triple' | 'quad';
    label: string;
    sellingPrice: number;
    originalPrice: number | null;
};

const typeConfig: Record<string, { label: string; color: string }> = {
    reguler: { label: 'Reguler', color: 'bg-blue-100 text-blue-700' },
    vip: { label: 'VIP', color: 'bg-amber-100 text-amber-700' },
    private: { label: 'Private', color: 'bg-purple-100 text-purple-700' },
};

function toStringArray(val: unknown): string[] {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'string') return val.split('\n').filter(Boolean);
    return [];
}

function normalizeNumericValue(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsedValue = Number(value);

        return Number.isFinite(parsedValue) ? parsedValue : null;
    }

    return null;
}

export default function PaketDetail() {
    const locale = 'id' as const;
    const page = usePage<TravelPackagePageProps>();
    const { travelPackage, seoSettings } = page.props;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const pkg = travelPackage;
    const safePackage = pkg ?? ({} as TravelPackageData);
    const hasDiscount = hasPackageDiscount(safePackage);
    const discountLabel = packageDiscountLabel(safePackage);
    const content = safePackage.content ?? {};
    const imagePositions = normalizePackageImagePositions(
        content.gallery_positions,
    );
    const name = localize(safePackage.name, locale);
    const summary = localize(safePackage.summary, locale);
    const type = typeConfig[safePackage.package_type] ?? typeConfig.reguler;

    const packageImages = (() => {
        const gallery = Array.isArray(content.gallery) ? content.gallery : [];
        const candidates = [safePackage.image_path, ...gallery]
            .filter(
                (value: unknown): value is string => typeof value === 'string',
            )
            .map((value) => value.trim())
            .filter(Boolean);

        return Array.from(new Set(candidates));
    })();

    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const canonical = canonicalUrl(seo, page.url);
    const ogImageCandidate = packageImages[0] ?? safePackage.image_path ?? null;
    const ogImage = ogImageCandidate
        ? absoluteUrl(seo?.advanced?.canonicalBase, ogImageCandidate)
        : null;

    const breadcrumbJsonLd = jsonLdBreadcrumb([
        { name: 'Home', url: canonicalUrl(seo, '/') },
        { name: 'Paket Umroh', url: canonicalUrl(seo, '/paket-umroh') },
        { name, url: canonical },
    ]);

    const productJsonLd = jsonLdProduct({
        name,
        description: summary,
        url: canonical,
        image: ogImage,
        currency: safePackage.currency ?? 'IDR',
        price: safePackage.price ?? null,
    });

    useEffect(() => {
        if (packageImages.length <= 1) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setActiveImageIndex(
                (current) => (current + 1) % packageImages.length,
            );
        }, 2000);

        return () => window.clearInterval(intervalId);
    }, [packageImages.length]);

    const included = toStringArray(
        content.included &&
            typeof content.included === 'object' &&
            !Array.isArray(content.included)
            ? (content.included.id ?? content.included.en)
            : content.included,
    );
    const excluded = toStringArray(
        content.excluded &&
            typeof content.excluded === 'object' &&
            !Array.isArray(content.excluded)
            ? (content.excluded.id ?? content.excluded.en)
            : content.excluded,
    );
    const policy = localize(content.policy, locale);
    const roomPrices = {
        double:
            normalizeNumericValue(content?.room_prices?.dbl) ??
            normalizeNumericValue(safePackage.price) ??
            0,
        triple: normalizeNumericValue(content?.room_prices?.trpl) ?? 0,
        quad: normalizeNumericValue(content?.room_prices?.quad) ?? 0,
    };
    const roomOriginalPrices = {
        double:
            normalizeNumericValue(content?.room_original_prices?.dbl) ??
            normalizeNumericValue(safePackage.original_price) ??
            normalizeNumericValue(safePackage.price),
        triple:
            normalizeNumericValue(content?.room_original_prices?.trpl) ?? null,
        quad:
            normalizeNumericValue(content?.room_original_prices?.quad) ?? null,
    };
    const roomTypePrices: RoomTypePriceRow[] = [
        {
            type: 'double',
            label: 'Double',
            sellingPrice: roomPrices.double,
            originalPrice:
                roomOriginalPrices.double !== roomPrices.double
                    ? roomOriginalPrices.double
                    : null,
        },
        {
            type: 'triple',
            label: 'Triple',
            sellingPrice: roomPrices.triple,
            originalPrice:
                roomOriginalPrices.triple !== roomPrices.triple
                    ? roomOriginalPrices.triple
                    : null,
        },
        {
            type: 'quad',
            label: 'Quad',
            sellingPrice: roomPrices.quad,
            originalPrice:
                roomOriginalPrices.quad !== roomPrices.quad
                    ? roomOriginalPrices.quad
                    : null,
        },
    ];
    const packageHighlights = normalizePackageHighlights(content);
    const CalendarDaysIcon = packageHighlightIconMap.CalendarDays;
    const PolicyIcon = packageHighlightIconMap.ShieldCheck;
    const TestimonialIcon = packageHighlightIconMap.Users;
    const StarIcon = packageHighlightIconMap.Star;
    const itineraries = (() => {
        const rawItems = Array.isArray(safePackage.itineraries)
            ? safePackage.itineraries
            : [];

        return rawItems
            .map((item: PackageItinerary, index: number) => {
                const dayNumber = Number(item?.day_number);
                const sortOrder = Number(item?.sort_order);

                return {
                    ...item,
                    day_number:
                        Number.isFinite(dayNumber) && dayNumber > 0
                            ? dayNumber
                            : index + 1,
                    sort_order: Number.isFinite(sortOrder) ? sortOrder : null,
                    _key: String(
                        item?.id ??
                            `${item?.day_number ?? index + 1}-${item?.sort_order ?? index}`,
                    ),
                } as PackageItinerary & {
                    day_number: number;
                    sort_order: number | null;
                    _key: string;
                };
            })
            .sort((left, right) => {
                const leftSort = Number.isFinite(Number(left.sort_order))
                    ? Number(left.sort_order)
                    : Number(left.day_number);
                const rightSort = Number.isFinite(Number(right.sort_order))
                    ? Number(right.sort_order)
                    : Number(right.day_number);

                return leftSort - rightSort;
            });
    })();
    const itineraryDays = itineraries
        .map((itinerary) => {
            const activities = Array.isArray(itinerary.activities)
                ? itinerary.activities
                : itinerary.activity
                  ? [itinerary.activity]
                  : [];
            const activityLabels = activities
                .map((activity: { name?: unknown }) =>
                    localize(activity?.name, locale),
                )
                .filter(Boolean);

            return { ...itinerary, activityLabels };
        })
        .filter((itinerary) => itinerary.activityLabels.length > 0);

    const upcomingSchedules = Array.isArray(safePackage.schedules)
        ? safePackage.schedules
        : [];
    const openSchedules = upcomingSchedules.filter(
        (s: PackageSchedule) => s.status === 'open',
    );
    const nextSchedule = openSchedules[0] ?? null;
    const referralCode = new URLSearchParams(page.url.split('?')[1] ?? '').get(
        'ref',
    );
    const registrationLink = `/paket-umroh/${safePackage.slug}/daftar${referralCode ? `?ref=${encodeURIComponent(referralCode)}` : ''}`;
    const packagePdfDownloadUrl = `/paket-umroh/${safePackage.slug}/sk.pdf?download=1`;

    const whatsappMsg = `Halo, saya tertarik dengan paket *${name}* (${safePackage.code}). Mohon info lebih lanjut.`;
    const waLink = whatsappLinkFromSeo(seo, whatsappMsg);

    if (!pkg) {
        return (
            <PublicLayout>
                <Head title="Paket tidak ditemukan" />
                <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
                    Paket tidak ditemukan.
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <Head title={`${name} | Paket Umroh`}>
                <meta
                    name="description"
                    content={summary}
                    head-key="meta-description"
                />
                <meta property="og:type" content="product" head-key="og-type" />
                <meta property="og:title" content={name} head-key="og-title" />
                <meta
                    property="og:description"
                    content={summary}
                    head-key="og-description"
                />
                {canonical ? (
                    <link
                        rel="canonical"
                        href={canonical}
                        head-key="link-canonical"
                    />
                ) : null}
                {canonical ? (
                    <meta
                        property="og:url"
                        content={canonical}
                        head-key="og-url"
                    />
                ) : null}
                {ogImage ? (
                    <meta
                        property="og:image"
                        content={ogImage}
                        head-key="og-image"
                    />
                ) : null}
                <script
                    type="application/ld+json"
                    head-key="jsonld-breadcrumb"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadcrumbJsonLd),
                    }}
                />
                <script
                    type="application/ld+json"
                    head-key="jsonld-product"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(productJsonLd),
                    }}
                />
            </Head>

            {/* Hero */}
            <MotionSection className="mx-auto w-full max-w-6xl px-4 pt-5 pb-10 sm:px-6 sm:pt-8">
                <MotionCard className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-[0_18px_60px_-38px_rgba(87,28,36,0.35)]">
                    <div className="min-w-0 overflow-hidden">
                        {/* Image */}
                        <div className="relative isolate aspect-video min-w-0 overflow-hidden bg-[#0b1017] [contain:paint]">
                            <img
                                src={
                                    packageImages[activeImageIndex] ||
                                    pkg.image_path ||
                                    '/images/dummy.jpg'
                                }
                                alt={name}
                                className="absolute inset-0 block h-full w-full max-w-none object-cover object-center"
                                style={packageImageStyle(
                                    imagePositions[
                                        packageImages[activeImageIndex]
                                    ],
                                )}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/10" />
                            {/* Discount ribbon */}
                            {hasDiscount && discountLabel ? (
                                <div
                                    className={`absolute top-4 right-4 z-20 max-w-[calc(100%-2rem)] rounded-full px-4 py-2 text-xs font-bold tracking-wide text-white shadow-lg ${
                                        pkg.discount_type === 'percent'
                                            ? 'bg-red-500'
                                            : 'bg-amber-500'
                                    }`}
                                >
                                    {discountLabel}
                                </div>
                            ) : null}

                            {packageImages.length > 1 ? (
                                <div className="absolute right-0 bottom-0 left-0 z-10 p-4 sm:p-5">
                                    <div className="flex max-w-full gap-2 overflow-x-auto rounded-2xl bg-black/35 p-2 backdrop-blur-md">
                                        {packageImages.map((src, index) => (
                                            <button
                                                key={`${src}-${index}`}
                                                type="button"
                                                onClick={() =>
                                                    setActiveImageIndex(index)
                                                }
                                                aria-label={`Lihat foto ${index + 1}`}
                                                className={`aspect-video h-12 shrink-0 overflow-hidden rounded-xl ring-2 transition ${index === activeImageIndex ? 'ring-white' : 'ring-white/20 hover:ring-white/40'}`}
                                            >
                                                <img
                                                    src={
                                                        src ||
                                                        '/images/dummy.jpg'
                                                    }
                                                    alt=""
                                                    className="block h-full w-full object-cover object-center"
                                                    style={packageImageStyle(
                                                        imagePositions[src],
                                                    )}
                                                    loading="lazy"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Info */}
                        <div className="relative z-10 grid min-w-0 items-start gap-8 bg-card p-5 sm:p-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:p-9">
                            <div>
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${type.color}`}
                                    >
                                        {type.label}
                                    </span>
                                    {pkg.is_featured && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                            <StarIcon
                                                className="h-3.5 w-3.5"
                                                fill="currentColor"
                                            />
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <h1 className="public-heading mt-4 max-w-xl text-3xl leading-tight font-bold text-foreground sm:text-4xl lg:text-[2.65rem]">
                                    {name}
                                </h1>

                                {/* Rating */}
                                {pkg.rating_avg && (
                                    <div className="mt-2 flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <StarIcon
                                                key={s}
                                                className={`h-4 w-4 ${s <= Math.round(pkg.rating_avg) ? 'text-amber-400' : 'text-muted-foreground/20'}`}
                                                fill="currentColor"
                                            />
                                        ))}
                                        <span className="text-sm font-semibold">
                                            {pkg.rating_avg}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            ({pkg.rating_count} ulasan)
                                        </span>
                                    </div>
                                )}

                                {summary && (
                                    <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                                        {summary}
                                    </p>
                                )}

                                <div className="mt-6 grid grid-cols-2 divide-x divide-border/70 border-y border-border/70 py-4 text-sm">
                                    {[
                                        {
                                            id: 'departure-city',
                                            icon: 'MapPin',
                                            label:
                                                locale === 'id'
                                                    ? 'Kota Berangkat'
                                                    : 'Departure City',
                                            value: pkg.departure_city,
                                        },
                                        {
                                            id: 'duration-days',
                                            icon: 'Clock3',
                                            label:
                                                locale === 'id'
                                                    ? 'Durasi'
                                                    : 'Duration',
                                            value:
                                                locale === 'id'
                                                    ? `${pkg.duration_days} Hari`
                                                    : `${pkg.duration_days} Days`,
                                        },
                                    ].map((item) => {
                                        const InfoIcon =
                                            packageHighlightIconMap[
                                                item.icon
                                            ] ??
                                            packageHighlightIconMap.Sparkles;

                                        return (
                                            <div
                                                key={item.id}
                                                className="px-3 first:pl-0 last:pr-0 sm:px-5"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                                                        <InfoIcon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                            {item.label}
                                                        </p>
                                                        <p className="mt-1 truncate text-sm font-semibold text-foreground">
                                                            {item.value}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {packageHighlights.length > 0 ? (
                                    <div className="mt-6 space-y-3">
                                        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            {locale === 'id'
                                                ? 'Highlight Paket'
                                                : 'Package Highlights'}
                                        </p>
                                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                                            {packageHighlights
                                                .map((highlight) => ({
                                                    id: highlight.id,
                                                    icon: highlight.icon,
                                                    label: localize(
                                                        highlight.label,
                                                        locale,
                                                    ),
                                                    value: localize(
                                                        highlight.value,
                                                        locale,
                                                    ),
                                                }))
                                                .filter((item) => item.value)
                                                .map((item) => {
                                                    const HighlightIcon =
                                                        packageHighlightIconMap[
                                                            item.icon
                                                        ] ??
                                                        packageHighlightIconMap.Sparkles;

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className="px-1 py-2"
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                                                    <HighlightIcon className="h-4 w-4" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 truncate text-sm font-semibold text-foreground">
                                                                        {
                                                                            item.value
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Price + CTA */}
                            <div className="mt-7 border-t border-border pt-6 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                                    Harga mulai
                                </p>
                                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <span className="text-3xl font-extrabold text-primary sm:text-4xl">
                                        {formatPrice(
                                            pkg.price,
                                            locale,
                                            pkg.currency,
                                        )}
                                    </span>
                                    {hasDiscount ? (
                                        <span className="text-sm text-muted-foreground line-through">
                                            {formatPrice(
                                                pkg.original_price,
                                                locale,
                                                pkg.currency,
                                            )}
                                        </span>
                                    ) : null}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    per jamaah
                                </p>

                                {pkg.original_price &&
                                    pkg.discount_type === 'nominal' &&
                                    pkg.discount_nominal && (
                                        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-amber-800">
                                            <p className="text-xs font-semibold">
                                                Potongan khusus Rp
                                                {pkg.discount_nominal.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </p>
                                        </div>
                                    )}

                                {pkg.original_price &&
                                    pkg.discount_type === 'percent' &&
                                    pkg.discount_percent && (
                                        <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-rose-700">
                                            <p className="text-xs font-semibold">
                                                Diskon spesial{' '}
                                                {pkg.discount_percent}%
                                            </p>
                                        </div>
                                    )}

                                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    {roomTypePrices.map((roomType) => (
                                        <div
                                            key={roomType.type}
                                            className="rounded-2xl bg-muted/35 px-3 py-3"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                                        {roomType.label}
                                                    </p>
                                                    <p className="mt-1 text-sm font-bold text-foreground">
                                                        {formatPrice(
                                                            roomType.sellingPrice,
                                                            locale,
                                                            pkg.currency,
                                                        )}
                                                    </p>
                                                </div>
                                                {roomType.originalPrice ? (
                                                    <span className="text-[10px] text-muted-foreground line-through">
                                                        {formatPrice(
                                                            roomType.originalPrice,
                                                            locale,
                                                            pkg.currency,
                                                        )}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {nextSchedule && (
                                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                                        <CalendarDaysIcon className="h-4 w-4" />
                                        <span>
                                            Berangkat{' '}
                                            {formatDate(
                                                nextSchedule.departure_date,
                                                locale,
                                            )}{' '}
                                            - {nextSchedule.seats_available}{' '}
                                            seat tersisa
                                        </span>
                                    </p>
                                )}

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <Link
                                        href={registrationLink}
                                        className="rounded-xl bg-primary px-5 py-3.5 text-center text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:opacity-95"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                    {waLink ? (
                                        <a
                                            href={waLink}
                                            className="rounded-xl border border-border px-5 py-3.5 text-center text-sm font-semibold text-foreground transition hover:bg-muted"
                                        >
                                            Tanya Admin
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </MotionCard>
            </MotionSection>

            {/* Package content */}
            {(included.length > 0 || excluded.length > 0) && (
                <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
                    <div className="mb-6">
                        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">
                            Detail paket
                        </p>
                        <h2 className="public-heading text-2xl font-bold text-foreground sm:text-3xl">
                            Yang Anda Dapatkan
                        </h2>
                    </div>

                    <div className="grid gap-8 border-y border-border py-7 sm:grid-cols-2 sm:gap-12">
                        {included.length > 0 && (
                            <div>
                                <h3 className="mb-4 flex items-center gap-2 font-bold text-emerald-700">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs">
                                        +
                                    </span>
                                    Sudah Termasuk
                                </h3>
                                <ul className="grid gap-3">
                                    {included.map(
                                        (item: string, index: number) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3 text-sm leading-6 text-foreground"
                                            >
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                                {item}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}

                        {excluded.length > 0 && (
                            <div>
                                <h3 className="mb-4 flex items-center gap-2 font-bold text-rose-700">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs">
                                        -
                                    </span>
                                    Tidak Termasuk
                                </h3>
                                <ul className="grid gap-3">
                                    {excluded.map(
                                        (item: string, index: number) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3 text-sm leading-6 text-foreground"
                                            >
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                                                {item}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {itineraryDays.length > 0 && (
                <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
                    <div className="mb-6">
                        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">
                            Rencana perjalanan
                        </p>
                        <h2 className="public-heading text-2xl font-bold text-foreground sm:text-3xl">
                            Itinerary
                        </h2>
                    </div>

                    <div className="relative">
                        <div className="absolute top-5 bottom-5 left-5 w-px bg-border sm:left-7" />
                        <div className="grid gap-2">
                            {itineraryDays.map((itinerary) => (
                                <article
                                    key={itinerary._key}
                                    className="relative grid grid-cols-[2.5rem_1fr] gap-4 py-3 sm:grid-cols-[3.5rem_1fr] sm:gap-5"
                                >
                                    <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm sm:h-14 sm:w-14">
                                        {itinerary.day_number}
                                    </div>
                                    <div className="min-w-0 pt-1 sm:pt-2">
                                        <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                                            Hari {itinerary.day_number}
                                        </p>
                                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                                            {itinerary.activityLabels.map(
                                                (activityLabel: string) => (
                                                    <span
                                                        key={activityLabel}
                                                        className="inline-flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base"
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                        {activityLabel}
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            {/* Kebijakan */}
            {policy && (
                <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
                    <h2 className="public-heading mb-3 flex items-center gap-2 text-xl font-bold text-foreground">
                        <PolicyIcon className="h-5 w-5 text-primary" />
                        Kebijakan
                    </h2>
                    <div className="rounded-[2rem] bg-muted/30 p-6 text-sm leading-7 text-foreground sm:p-8">
                        {policy}
                        <div className="mt-4 border-t border-border/70 pt-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                                <Link
                                    href="/terms-conditions"
                                    className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background transition hover:bg-foreground/90"
                                >
                                    {locale === 'id'
                                        ? 'Baca Syarat & Ketentuan'
                                        : 'Read Terms & Conditions'}
                                </Link>
                                <a
                                    href={packagePdfDownloadUrl}
                                    className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm shadow-primary/30 transition hover:bg-primary/90"
                                >
                                    {locale === 'id'
                                        ? 'Download SK (PDF)'
                                        : 'Download SK (PDF)'}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Testimoni */}
            {pkg.testimonials?.length > 0 && (
                <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
                    <h2 className="public-heading mb-3 flex items-center gap-2 text-xl font-bold text-foreground">
                        <TestimonialIcon className="h-5 w-5 text-primary" />
                        Testimoni Jamaah
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {pkg.testimonials.map(
                            (t: PackageTestimonial, i: number) => (
                                <div
                                    key={i}
                                    className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-black/5"
                                >
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <StarIcon
                                                key={s}
                                                className={
                                                    s <= t.rating
                                                        ? 'h-4 w-4 text-amber-400'
                                                        : 'h-4 w-4 text-muted-foreground/20'
                                                }
                                                fill="currentColor"
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground italic">
                                        "{localize(t.quote, locale)}"
                                    </p>
                                    <div className="mt-3 border-t border-border pt-3">
                                        <p className="text-sm font-semibold text-foreground">
                                            {t.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {[
                                                t.origin_city,
                                                t.departure_schedule
                                                    ?.departure_date
                                                    ? `${formatDate(
                                                          t.departure_schedule
                                                              .departure_date,
                                                          locale,
                                                      )}${
                                                          t.departure_schedule
                                                              ?.departure_city
                                                              ? ` - ${t.departure_schedule.departure_city}`
                                                              : ''
                                                      }`
                                                    : null,
                                            ]
                                                .filter(Boolean)
                                                .join(' - ')}
                                        </p>
                                    </div>

                                    {Array.isArray(t.photos) &&
                                        t.photos.length > 0 && (
                                            <div className="mt-4 flex h-28 gap-2 overflow-hidden sm:h-32">
                                                {t.photos
                                                    .slice(0, 3)
                                                    .map(
                                                        (
                                                            src: string,
                                                            index: number,
                                                        ) => {
                                                            const remainingPhotos =
                                                                t.photos
                                                                    .length - 3;
                                                            const showOverlay =
                                                                index === 2 &&
                                                                remainingPhotos >
                                                                    0;

                                                            return (
                                                                <div
                                                                    key={`${src}-${index}`}
                                                                    className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-muted"
                                                                >
                                                                    <img
                                                                        src={
                                                                            src
                                                                        }
                                                                        alt={`Foto testimoni ${t.name}`}
                                                                        className="h-full w-full object-cover"
                                                                        loading="lazy"
                                                                    />
                                                                    {showOverlay ? (
                                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-base font-bold text-white">
                                                                            +
                                                                            {
                                                                                remainingPhotos
                                                                            }
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                            </div>
                                        )}
                                </div>
                            ),
                        )}
                    </div>
                </section>
            )}

            {/* CTA Bottom */}
            <MotionSection className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
                <MotionCard className="relative overflow-hidden rounded-[2rem] bg-[#25171a] px-6 py-9 text-center text-white shadow-[0_24px_70px_-30px_rgba(37,23,26,0.8)] sm:px-10 sm:py-10 sm:text-left">
                    <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
                    <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div>
                            <p className="public-heading text-2xl font-bold sm:text-3xl">
                                Langkah baik dimulai dari sini.
                            </p>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                                Amankan seat Anda, lalu tim Asfar akan
                                mendampingi proses berikutnya.
                            </p>
                        </div>
                        <Link
                            href={registrationLink}
                            className="shrink-0 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:opacity-95"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>
                </MotionCard>
            </MotionSection>
        </PublicLayout>
    );
}
