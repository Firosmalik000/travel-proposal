export type SeoSettings = Record<string, any>;

type BreadcrumbItem = {
    name: string;
    url: string;
};

function normalizeBaseUrl(value: string | null | undefined): string {
    const base = String(value ?? '').trim();

    if (!base) {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }

        return '';
    }

    return base.replace(/\/+$/, '');
}

export function absoluteUrl(baseUrl: string, path: string): string {
    const base = normalizeBaseUrl(baseUrl);
    const cleanPath = String(path ?? '');

    if (!base) {
        return cleanPath;
    }

    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        return cleanPath;
    }

    if (!cleanPath.startsWith('/')) {
        return `${base}/${cleanPath}`;
    }

    return `${base}${cleanPath}`;
}

export function canonicalUrl(seo: SeoSettings, pageUrl: string): string {
    const base = normalizeBaseUrl(seo?.advanced?.canonicalBase);
    const urlPath = String(pageUrl ?? '').split('?')[0] ?? '/';

    return base ? absoluteUrl(base, urlPath) : urlPath;
}

export function jsonLdBreadcrumb(items: BreadcrumbItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function jsonLdProduct(params: {
    name: string;
    description: string;
    url: string;
    image?: string | null;
    currency?: string | null;
    price?: number | string | null;
}) {
    const priceNumber =
        typeof params.price === 'number'
            ? params.price
            : Number(String(params.price ?? '').replace(/[^0-9.]/g, ''));

    const offer =
        Number.isFinite(priceNumber) && priceNumber > 0
            ? {
                  '@type': 'Offer',
                  price: priceNumber,
                  priceCurrency: params.currency || 'IDR',
                  availability: 'https://schema.org/InStock',
                  url: params.url,
              }
            : undefined;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: params.name,
        description: params.description,
        url: params.url,
        image: params.image ? [params.image] : undefined,
        offers: offer,
    };
}

export function jsonLdArticle(params: {
    headline: string;
    description: string;
    url: string;
    image?: string | null;
    datePublished?: string | null;
    authorName?: string | null;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': params.url,
        },
        headline: params.headline,
        description: params.description,
        image: params.image ? [params.image] : undefined,
        datePublished: params.datePublished || undefined,
        author: params.authorName
            ? {
                  '@type': 'Person',
                  name: params.authorName,
              }
            : undefined,
    };
}
