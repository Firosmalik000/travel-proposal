import {
    BadgeCheck,
    Building2,
    CalendarDays,
    Clock3,
    Hotel,
    MapPin,
    Plane,
    ShieldCheck,
    Sparkles,
    Star,
    Users,
    type LucideIcon,
} from 'lucide-react';

export type LocalizedText = {
    id: string;
    en: string;
};

export type PackageHighlightItem = {
    id: string;
    icon: string;
    label: LocalizedText;
    value: LocalizedText;
};

export const packageHighlightIconMap: Record<string, LucideIcon> = {
    Plane,
    Hotel,
    BadgeCheck,
    CalendarDays,
    MapPin,
    Clock3,
    ShieldCheck,
    Sparkles,
    Building2,
    Star,
    Users,
};

export const packageHighlightIconOptions = [
    { value: 'Plane', label: 'Pesawat / Maskapai' },
    { value: 'Hotel', label: 'Hotel / Akomodasi' },
    { value: 'BadgeCheck', label: 'Badge / Benefit' },
    { value: 'CalendarDays', label: 'Periode / Jadwal' },
    { value: 'MapPin', label: 'Lokasi / Kota' },
    { value: 'Clock3', label: 'Durasi / Waktu' },
    { value: 'ShieldCheck', label: 'Proteksi / Legalitas' },
    { value: 'Sparkles', label: 'Highlight Premium' },
    { value: 'Building2', label: 'Gedung / Fasilitas' },
    { value: 'Star', label: 'Unggulan / Rating' },
    { value: 'Users', label: 'Rombongan / Jamaah' },
] as const;

function toLocalizedText(value: unknown): LocalizedText {
    if (typeof value === 'string') {
        return {
            id: value,
            en: value,
        };
    }

    if (typeof value === 'object' && value !== null) {
        const localizedValue = value as Record<string, unknown>;

        return {
            id: String(localizedValue.id ?? ''),
            en: String(localizedValue.en ?? localizedValue.id ?? ''),
        };
    }

    return {
        id: '',
        en: '',
    };
}

function hasText(value: LocalizedText): boolean {
    return Boolean(value.id.trim() || value.en.trim());
}

function normalizeHighlightItem(
    item: unknown,
    index: number,
): PackageHighlightItem | null {
    if (typeof item !== 'object' || item === null) {
        return null;
    }

    const highlightItem = item as Record<string, unknown>;
    const label = toLocalizedText(highlightItem.label);
    const value = toLocalizedText(highlightItem.value);

    if (!hasText(label) && !hasText(value)) {
        return null;
    }

    return {
        id: String(highlightItem.id ?? `highlight-${index + 1}`),
        icon: String(highlightItem.icon ?? 'Sparkles'),
        label,
        value,
    };
}

function legacyHighlightContent(
    content: Record<string, any>,
): PackageHighlightItem[] {
    return [
        {
            id: 'legacy-airline',
            icon: 'Plane',
            label: { id: 'Maskapai', en: 'Airline' },
            value: toLocalizedText(content.airline),
        },
        {
            id: 'legacy-hotel',
            icon: 'Hotel',
            label: { id: 'Hotel', en: 'Hotel' },
            value: toLocalizedText(content.hotel),
        },
        {
            id: 'legacy-badge',
            icon: 'BadgeCheck',
            label: { id: 'Badge', en: 'Badge' },
            value: toLocalizedText(content.badge),
        },
        {
            id: 'legacy-period',
            icon: 'CalendarDays',
            label: { id: 'Periode', en: 'Period' },
            value: toLocalizedText(content.period),
        },
    ].filter((item) => hasText(item.value));
}

export function normalizePackageHighlights(
    content: Record<string, any>,
): PackageHighlightItem[] {
    const contentHighlights = Array.isArray(content.highlights)
        ? content.highlights
              .map((item, index) => normalizeHighlightItem(item, index))
              .filter((item): item is PackageHighlightItem => item !== null)
        : [];

    if (contentHighlights.length > 0) {
        return contentHighlights;
    }

    return legacyHighlightContent(content);
}

export function normalizePackageContent(
    content: Record<string, any>,
): Record<string, any> {
    return {
        ...content,
        highlights: normalizePackageHighlights(content),
    };
}
