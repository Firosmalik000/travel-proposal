import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export interface LocalizedField {
    id?: string;
    en?: string;
}

export function localize(value: unknown, locale: 'id' | 'en', fallback = ''): string {
    if (typeof value === 'string') {
        return value || fallback;
    }

    if (value && typeof value === 'object') {
        const localized = value as LocalizedField;
        const preferredValue = locale === 'id' ? localized.id : localized.en;
        const alternateValue = locale === 'id' ? localized.en : localized.id;

        return preferredValue || fallback || alternateValue || '';
    }

    return fallback;
}

export function usePublicData(): Record<string, any> {
    const { publicData } = usePage<SharedData>().props;

    return (publicData as Record<string, any>) ?? {};
}

export function usePublicPageContent(slug: string): Record<string, any> | null {
    const publicData = usePublicData();

    return publicData.pages?.[slug] ?? null;
}

export function normalizePhoneNumber(value: unknown, fallback = '6281234567890'): string {
    const digits = String(value ?? '')
        .replace(/[^\d]/g, '');

    return digits || fallback;
}

export function whatsappLinkFromPhone(phone: unknown, message?: string): string {
    const baseUrl = `https://wa.me/${normalizePhoneNumber(phone)}`;

    if (! message) {
        return baseUrl;
    }

    return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(value: number | string | null | undefined, locale: 'id' | 'en', currency = 'IDR'): string {
    if (value === null || value === undefined || value === '') {
        return locale === 'id' ? 'Hubungi kami' : 'Contact us';
    }

    const numericValue = typeof value === 'number' ? value : Number(value);

    return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(numericValue);
}

export function formatDate(value: string | null | undefined, locale: 'id' | 'en'): string {
    if (! value) {
        return '';
    }

    return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(value));
}
