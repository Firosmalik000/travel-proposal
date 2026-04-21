import { MotionCard, MotionSection } from '@/components/public-motion';
import { usePublicLocale } from '@/contexts/public-locale';
import PublicLayout from '@/layouts/PublicLayout';
import {
    normalizePackageHighlights,
    packageHighlightIconMap,
} from '@/lib/package-highlights';
import {
    formatDate,
    formatPrice,
    localize,
    whatsappLinkFromSeo,
} from '@/lib/public-content';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface TravelPackagePageProps extends SharedData {
    travelPackage?: Record<string, any>;
}

const typeConfig: Record<string, { label: string; color: string }> = {
    reguler: { label: 'Reguler', color: 'bg-blue-100 text-blue-700' },
    vip: { label: 'VIP', color: 'bg-amber-100 text-amber-700' },
    private: { label: 'Private', color: 'bg-purple-100 text-purple-700' },
};

const productTypeEmoji: Record<string, string> = {
    dokumen: '📄',
    transportasi: '✈️',
    akomodasi: '🏨',
    layanan: '🛎️',
    perlengkapan: '🎒',
};

function toStringArray(val: unknown): string[] {
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === 'string') return val.split('\n').filter(Boolean);
    return [];
}

export default function PaketDetail() {
    const { locale } = usePublicLocale();
    const { travelPackage, seoSettings } =
        usePage<TravelPackagePageProps>().props;
    const seo = (seoSettings as Record<string, any>) ?? {};
    const whatsappLink = whatsappLinkFromSeo(seo);

    if (!travelPackage) {
        return (
            <PublicLayout>
                <Head title="Paket tidak ditemukan" />
                <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
                    Paket tidak ditemukan.
                </div>
            </PublicLayout>
        );
    }

    const pkg = travelPackage;
    const content = pkg.content ?? {};
    const name = localize(pkg.name, locale);
    const summary = localize(pkg.summary, locale);
    const type = typeConfig[pkg.package_type] ?? typeConfig.reguler;

    const included = toStringArray(
        content.included?.[locale] ?? content.included?.id,
    );
    const excluded = toStringArray(
        content.excluded?.[locale] ?? content.excluded?.id,
    );
    const policy = localize(content.policy, locale);
    const packageHighlights = normalizePackageHighlights(content);
    const itineraries = [...(pkg.itineraries ?? [])].sort(
        (leftItem: any, rightItem: any) =>
            (leftItem.sort_order ?? leftItem.day_number) -
            (rightItem.sort_order ?? rightItem.day_number),
    );

    const openSchedules = (pkg.schedules ?? []).filter(
        (s: any) => s.status === 'open',
    );
    const nextSchedule = openSchedules[0] ?? null;
    const registrationLink = `/paket-umroh/${pkg.slug}/daftar${nextSchedule?.id ? `?schedule=${nextSchedule.id}` : ''}`;

    const whatsappMsg = encodeURIComponent(
        `Halo, saya tertarik dengan paket *${name}* (${pkg.code}). Mohon info lebih lanjut.`,
    );
    const waLink = whatsappLinkFromSeo(seo, whatsappMsg);

    return (
        <PublicLayout>
            <Head title={`${name} | Paket Umroh`}>
                <meta name="description" content={summary} />
            </Head>

            {/* ── Hero ── */}
            <MotionSection className="mx-auto w-full max-w-6xl px-4 pt-6 pb-6 sm:px-6">
                <MotionCard className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                    <div className="grid lg:grid-cols-2">
                        {/* Image */}
                        <div className="relative h-64 overflow-hidden lg:h-auto lg:min-h-[420px]">
                            <img
                                src={pkg.image_path || '/images/dummy.jpg'}
                                alt={name}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent lg:bg-gradient-to-r" />
                            {/* Discount ribbon */}
                            {pkg.original_price && (
                                <div className="absolute top-4 right-4 rounded-xl bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                                    {pkg.discount_label ||
                                        `HEMAT ${pkg.discount_percent}%`}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-between p-6 lg:p-8">
                            <div>
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${type.color}`}
                                    >
                                        {type.label}
                                    </span>
                                    {pkg.is_featured && (
                                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                            ★ Featured
                                        </span>
                                    )}
                                    <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
                                        {pkg.code}
                                    </span>
                                </div>

                                <h1 className="public-heading mt-3 text-2xl font-bold text-foreground sm:text-3xl">
                                    {name}
                                </h1>

                                {/* Rating */}
                                {pkg.rating_avg && (
                                    <div className="mt-2 flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <span
                                                key={s}
                                                className={`text-lg ${s <= Math.round(pkg.rating_avg) ? 'text-amber-400' : 'text-muted-foreground/20'}`}
                                            >
                                                ★
                                            </span>
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
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        {summary}
                                    </p>
                                )}

                                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
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
                                                className="rounded-2xl border border-border bg-muted/35 px-3 py-3"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
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
                                    <div className="mt-3 space-y-2">
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
                                                            className="rounded-2xl border border-border bg-background/80 px-3 py-3"
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
                            <div className="mt-6 border-t border-border pt-5">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-extrabold text-primary">
                                        {formatPrice(
                                            pkg.price,
                                            locale,
                                            pkg.currency,
                                        )}
                                    </span>
                                    {pkg.original_price && (
                                        <span className="text-base text-muted-foreground line-through">
                                            {formatPrice(
                                                pkg.original_price,
                                                locale,
                                                pkg.currency,
                                            )}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    per jamaah
                                </p>

                                {nextSchedule && (
                                    <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                                        📅 Berangkat{' '}
                                        {formatDate(
                                            nextSchedule.departure_date,
                                            locale,
                                        )}{' '}
                                        · {nextSchedule.seats_available} seat
                                        tersisa
                                    </p>
                                )}

                                <div className="mt-4 flex gap-3">
                                    <Link
                                        href={registrationLink}
                                        className="flex-1 rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                    {waLink ? (
                                        <a
                                            href={waLink}
                                            className="flex-1 rounded-xl border border-border py-3 text-center text-sm font-semibold text-foreground transition hover:bg-muted"
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

            {/* ── Jadwal ── */}
            {pkg.schedules?.length > 0 && (
                <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
                    <h2 className="public-heading mb-3 text-xl font-bold text-foreground">
                        📅 Jadwal Keberangkatan
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {pkg.schedules.map((s: any, i: number) => {
                            const statusColor =
                                s.status === 'open'
                                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                                    : s.status === 'full'
                                      ? 'text-amber-600 bg-amber-50'
                                      : 'text-red-600 bg-red-50';
                            const seatPct =
                                s.seats_total > 0
                                    ? Math.round(
                                          (s.seats_available / s.seats_total) *
                                              100,
                                      )
                                    : 0;
                            return (
                                <div
                                    key={i}
                                    className="rounded-xl border border-border bg-card p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-foreground">
                                            {s.departure_date}
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
                                        >
                                            {s.status === 'open'
                                                ? 'Open'
                                                : s.status === 'full'
                                                  ? 'Full'
                                                  : 'Closed'}
                                        </span>
                                    </div>
                                    {s.return_date && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Pulang: {s.return_date}
                                        </p>
                                    )}
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        📍 {s.departure_city}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full ${seatPct > 50 ? 'bg-emerald-500' : seatPct > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${seatPct}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {s.seats_available}/{s.seats_total}{' '}
                                            seat
                                        </span>
                                    </div>
                                    {s.notes && (
                                        <p className="mt-1.5 text-xs text-muted-foreground italic">
                                            {s.notes}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── Included / Excluded ── */}
            {itineraries.length > 0 && (
                <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
                    <div className="mb-3">
                        <h2 className="public-heading text-xl font-bold text-foreground">
                            Itinerary Perjalanan
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Daftar activity yang dijalankan pada setiap hari
                            perjalanan.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead className="bg-muted/40">
                                    <tr className="text-left">
                                        <th className="px-4 py-3 font-semibold text-foreground sm:px-5">
                                            Hari
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-foreground sm:px-5">
                                            Activity
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {itineraries.map((itinerary: any) => (
                                        <tr
                                            key={itinerary.day_number}
                                            className="align-top"
                                        >
                                            <td className="px-4 py-4 sm:px-5">
                                                <div className="inline-flex items-center justify-center rounded-2xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
                                                    Hari {itinerary.day_number}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 sm:px-5">
                                                {Array.isArray(
                                                    itinerary.activities,
                                                ) &&
                                                itinerary.activities.length >
                                                    0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {itinerary.activities.map(
                                                            (activity: any) => (
                                                                <span
                                                                    key={
                                                                        activity.id
                                                                    }
                                                                    className="inline-flex rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                                                                >
                                                                    {localize(
                                                                        activity.name,
                                                                        locale,
                                                                    )}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : itinerary.activity ? (
                                                    <span className="inline-flex rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
                                                        {localize(
                                                            itinerary.activity
                                                                .name,
                                                            locale,
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Belum ada activity yang
                                                        di-assign untuk hari
                                                        ini.
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {(included.length > 0 || excluded.length > 0) && (
                <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {included.length > 0 && (
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/20">
                                <h2 className="mb-3 font-bold text-emerald-700 dark:text-emerald-300">
                                    ✅ Sudah Termasuk
                                </h2>
                                <ul className="space-y-2">
                                    {included.map((item: string, i: number) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-sm text-foreground"
                                        >
                                            <span className="mt-0.5 text-emerald-500">
                                                ✓
                                            </span>{' '}
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {excluded.length > 0 && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/20">
                                <h2 className="mb-3 font-bold text-red-700 dark:text-red-300">
                                    ❌ Tidak Termasuk
                                </h2>
                                <ul className="space-y-2">
                                    {excluded.map((item: string, i: number) => (
                                        <li
                                            key={i}
                                            className="flex items-start gap-2 text-sm text-foreground"
                                        >
                                            <span className="mt-0.5 text-red-400">
                                                ✗
                                            </span>{' '}
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── Produk dalam Paket ── */}
            {pkg.products?.length > 0 && (
                <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
                    <h2 className="public-heading mb-3 text-xl font-bold text-foreground">
                        📦 Komponen Paket
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {pkg.products.map((p: any, i: number) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                            >
                                <span className="text-2xl">
                                    {productTypeEmoji[p.product_type] ?? '📦'}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {localize(p.name, locale)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Kebijakan ── */}
            {policy && (
                <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
                    <h2 className="public-heading mb-3 text-xl font-bold text-foreground">
                        📋 Kebijakan
                    </h2>
                    <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm leading-relaxed text-foreground">
                        {policy}
                    </div>
                </section>
            )}

            {/* ── Testimoni ── */}
            {pkg.testimonials?.length > 0 && (
                <section className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
                    <h2 className="public-heading mb-3 text-xl font-bold text-foreground">
                        💬 Testimoni Jamaah
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {pkg.testimonials.map((t: any, i: number) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-border bg-card p-5"
                            >
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <span
                                            key={s}
                                            className={
                                                s <= t.rating
                                                    ? 'text-amber-400'
                                                    : 'text-muted-foreground/20'
                                            }
                                        >
                                            ★
                                        </span>
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
                                        {t.origin_city}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── CTA Bottom ── */}
            <MotionSection className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
                <MotionCard className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-primary px-6 py-8 text-center text-primary-foreground sm:flex-row sm:text-left">
                    <div>
                        <p className="text-lg font-bold">
                            Siap berangkat umroh?
                        </p>
                        <p className="mt-1 text-sm opacity-80">
                            Hubungi kami sekarang untuk booking dan informasi
                            lebih lanjut.
                        </p>
                    </div>
                    <Link
                        href={registrationLink}
                        className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary transition hover:bg-white/90"
                    >
                        Daftar Sekarang
                    </Link>
                </MotionCard>
            </MotionSection>
        </PublicLayout>
    );
}
