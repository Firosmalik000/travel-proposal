import GlobalFaviconHead from '@/components/global-favicon-head';
import { formatMonth } from '@/lib/date-format';
import {
    getPublicSocialAccounts,
    localize,
    usePublicData,
    usePublicPageContent,
    whatsappLinkFromSeo,
} from '@/lib/public/content';
import PackageSalesExperience from '@/pages/public/landing/package/package-sales-experience';
import type { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

type CmsRecord = Record<string, unknown>;

interface LandingPackagePageProps extends SharedData {
    travelPackage: CmsRecord;
}

function text(value: unknown, fallback = ''): string {
    return String(value ?? fallback).trim();
}

function splitLines(value: unknown): string[] {
    return text(value)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

function asRecord(value: unknown): CmsRecord {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as CmsRecord)
        : {};
}

function toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map((item) => text(item)).filter(Boolean);
    }

    if (typeof value === 'string') {
        return splitLines(value);
    }

    if (value && typeof value === 'object') {
        return splitLines(localize(value, 'id'));
    }

    return [];
}

function toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function resolveRoomPrice(
    roomPrices: CmsRecord,
    keys: string[],
    basePrice: number | null,
): number | null {
    for (const key of keys) {
        const value = toNumber(roomPrices[key]);

        if (value !== null) {
            return value;
        }
    }

    return basePrice;
}

function hasRoomPrice(roomPrices: CmsRecord, keys: string[]): boolean {
    return keys.some((key) => toNumber(roomPrices[key]) !== null);
}

function monthFromSchedule(value: unknown): string {
    const date = text(value);

    if (!date) {
        return 'Agustus';
    }

    return formatMonth(date, { fallback: 'Agustus' });
}

export default function LandingPackageDetail() {
    const page = usePage<LandingPackagePageProps>();
    const { travelPackage, seoSettings, branding, publicBranding } = page.props;
    const publicData = usePublicData();
    const landingPage = usePublicPageContent('home_landing_mockup');
    const landingContent = asRecord(landingPage?.content);
    const packageContent = asRecord(travelPackage.content);
    const packageDetails = asRecord(landingContent.package_details);
    const includedContent = asRecord(landingContent.included);
    const excludedContent = asRecord(landingContent.excluded);
    const reasonsContent = asRecord(landingContent.reasons);
    const faqContent = asRecord(landingContent.faq);
    const ctaContent = asRecord(landingContent.cta);

    const companyName = text(branding?.company_name, 'Asfar Tour');
    const companySubtitle = text(branding?.company_subtitle, 'Haji & Umrah');
    const logoPath =
        publicBranding?.logo_path ?? branding?.logo_path ?? '/logo.svg';
    const packageName = localize(travelPackage.name, 'id', 'Paket Umroh');
    const summary = localize(
        travelPackage.summary,
        'id',
        'Paket umroh nyaman dengan pelayanan lengkap untuk perjalanan ibadah Anda.',
    );
    const currency = text(travelPackage.currency, 'IDR');
    const schedules = Array.isArray(travelPackage.schedules)
        ? (travelPackage.schedules as CmsRecord[])
        : [];
    const firstSchedule = schedules[0] ?? {};
    const departureDate = text(firstSchedule.departure_date);
    const durationDays = Number(travelPackage.duration_days ?? 0);
    const roomPrices = asRecord(packageContent.room_prices);
    const basePrice = toNumber(travelPackage.price);
    const hasCustomRoomPrice = hasRoomPrice(roomPrices, [
        'quad',
        'trpl',
        'triple',
        'dbl',
        'double',
    ]);
    const roomRows = (
        hasCustomRoomPrice
            ? [
                  {
                      label: 'Quad',
                      room: 'Kamar Berempat',
                      price: resolveRoomPrice(roomPrices, ['quad'], basePrice),
                  },
                  {
                      label: 'Triple',
                      room: 'Kamar Bertiga',
                      price: resolveRoomPrice(
                          roomPrices,
                          ['trpl', 'triple'],
                          basePrice,
                      ),
                  },
                  {
                      label: 'Double',
                      room: 'Kamar Berdua',
                      price: resolveRoomPrice(
                          roomPrices,
                          ['dbl', 'double'],
                          basePrice,
                      ),
                  },
              ]
            : [
                  {
                      label: 'Harga',
                      room: 'Harga Paket',
                      price: basePrice,
                  },
              ]
    ).filter((row) => row.price !== null);
    const primaryPrice = roomRows[0]?.price ?? basePrice;
    const includedItems =
        toStringArray(packageContent.included).length > 0
            ? toStringArray(packageContent.included)
            : toStringArray(includedContent.items);
    const excludedItems =
        toStringArray(packageContent.excluded).length > 0
            ? toStringArray(packageContent.excluded)
            : toStringArray(excludedContent.items);
    const featureCards = [
        {
            icon: 'plane',
            title: 'Penerbangan',
            description:
                localize(packageContent.airline, 'id') || 'Penerbangan nyaman',
        },
        {
            icon: 'hotel',
            title: 'Hotel Makkah',
            description:
                localize(packageContent.hotel_makkah, 'id') ||
                localize(packageContent.hotel, 'id') ||
                'Hotel sesuai paket',
        },
        {
            icon: 'hotel',
            title: 'Hotel Madinah',
            description:
                localize(packageContent.hotel_madinah, 'id') ||
                'Hotel sesuai paket',
        },
        {
            icon: 'soup',
            title: 'Konsumsi',
            description: localize(packageContent.meals, 'id') || 'Makan 3x',
        },
    ];
    const trustPoints = Array.isArray(
        asRecord(landingContent.hero).checklist_items,
    )
        ? (asRecord(landingContent.hero).checklist_items as unknown[])
              .map((item) => text(item))
              .filter(Boolean)
        : ['Izin Resmi Kemenag RI', '10+ Tahun Pengalaman', 'FREE Konsultasi'];
    const reasonItems = Array.isArray(reasonsContent.items)
        ? (reasonsContent.items as CmsRecord[])
        : [];
    const reasonStats = Array.isArray(reasonsContent.stats)
        ? (reasonsContent.stats as CmsRecord[])
        : [];
    const testimonials =
        Array.isArray(travelPackage.testimonials) &&
        travelPackage.testimonials.length > 0
            ? (travelPackage.testimonials as CmsRecord[])
            : Array.isArray(publicData.testimonials)
              ? (publicData.testimonials as CmsRecord[])
              : [];
    const faqs = Array.isArray(publicData.faqs)
        ? (publicData.faqs as CmsRecord[])
        : [];
    const itineraries = Array.isArray(travelPackage.itineraries)
        ? (travelPackage.itineraries as CmsRecord[])
        : [];
    const socialAccounts = getPublicSocialAccounts(seoSettings ?? {});
    const whatsappHref =
        whatsappLinkFromSeo(
            seoSettings ?? {},
            `Assalamualaikum, saya ingin konsultasi ${packageName}.`,
        ) || '#';

    return (
        <>
            <GlobalFaviconHead />
            <Head title={`${packageName} | ${companyName}`} />
            <PackageSalesExperience
                brand={{
                    name: companyName,
                    subtitle: companySubtitle,
                    logoPath,
                }}
                offer={{
                    name: packageName,
                    summary,
                    currency,
                    departureDate,
                    departureMonth: monthFromSchedule(departureDate),
                    durationDays,
                    imagePath: text(travelPackage.image_path),
                    primaryPrice,
                    roomRows,
                }}
                copy={{
                    packageTitle: text(packageDetails.title, 'Paket Umroh'),
                    packageHeading: text(
                        packageDetails.heading,
                        'Perjalanan Ibadah yang',
                    ),
                    packageHighlight: text(
                        packageDetails.heading2,
                        'Terencana dan Menenangkan',
                    ),
                    packageDescription: text(
                        packageDetails.description,
                        'Direct flight, hotel strategis, mutawif berpengalaman, dan dokumentasi profesional - semua sudah termasuk.',
                    ),
                    includedTitle: text(
                        includedContent.title,
                        'Termasuk dalam Paket',
                    ),
                    includedLabel: text(
                        includedContent.status_label,
                        'Included',
                    ),
                    excludedTitle: text(
                        excludedContent.title,
                        'Tidak Termasuk',
                    ),
                    excludedLabel: text(
                        excludedContent.status_label,
                        'Excluded',
                    ),
                    faqTitle: text(
                        faqContent.title,
                        'Pertanyaan yang Sering Diajukan',
                    ),
                    faqHeading: text(
                        faqContent.heading_prefix,
                        'Masih Ada yang',
                    ),
                    faqHighlight: text(
                        faqContent.heading_highlight,
                        'Ingin Ditanyakan?',
                    ),
                    ctaBadge: text(
                        ctaContent.badge,
                        'Jangan Tunda Niat Baik Anda',
                    ),
                    ctaTitle: text(
                        ctaContent.title,
                        'Mulai Langkah Baik Hari Ini',
                    ),
                    ctaDescription: text(
                        ctaContent.description,
                        'Konsultasikan persiapan ibadah Anda sekarang bersama tim Asfar Tour.',
                    ),
                    ctaButton: text(
                        ctaContent.button_label,
                        'Konsultasi via WhatsApp',
                    ),
                }}
                featureCards={featureCards}
                trustPoints={trustPoints}
                includedItems={includedItems}
                excludedItems={excludedItems}
                reasonItems={reasonItems}
                reasonStats={reasonStats}
                testimonials={testimonials}
                faqs={faqs}
                itineraries={itineraries}
                socialAccounts={socialAccounts}
                whatsappHref={whatsappHref}
            />
        </>
    );
}
