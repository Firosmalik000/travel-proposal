import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

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

function absoluteUrl(base: string, path: string): string {
    if (!base) {
        return path;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    if (!path.startsWith('/')) {
        return `${base}/${path}`;
    }

    return `${base}${path}`;
}

function safeString(value: unknown, fallback = ''): string {
    const text = String(value ?? '').trim();

    return text || fallback;
}

export default function PublicSeoHead() {
    const page = usePage<SharedData>();
    const seo = (page.props.seoSettings as Record<string, any>) ?? {};

    const base = normalizeBaseUrl(seo.advanced?.canonicalBase);
    const urlPath = safeString(page.url).split('?')[0] ?? '/';
    const canonical = base ? absoluteUrl(base, urlPath) : urlPath;

    const locale = 'id';
    const siteName = safeString(
        seo.general?.siteName?.[locale],
        safeString(
            seo.general?.siteName?.id,
            safeString(seo.general?.siteName?.en, ''),
        ),
    );
    const tagline = safeString(
        seo.general?.tagline?.[locale],
        safeString(
            seo.general?.tagline?.id,
            safeString(seo.general?.tagline?.en, ''),
        ),
    );
    const description = safeString(
        seo.general?.defaultDescription?.[locale],
        safeString(
            seo.general?.defaultDescription?.id,
            safeString(seo.general?.defaultDescription?.en, ''),
        ),
    );
    const keywords = safeString(seo.general?.keywords);

    const robots = safeString(seo.advanced?.robotsDefault, 'index, follow');

    const ogTitle = safeString(
        seo.social?.ogTitle?.[locale],
        safeString(
            seo.social?.ogTitle?.id,
            safeString(seo.social?.ogTitle?.en, siteName),
        ),
    );
    const ogDescription = safeString(
        seo.social?.ogDescription?.[locale],
        safeString(
            seo.social?.ogDescription?.id,
            safeString(seo.social?.ogDescription?.en, description),
        ),
    );

    const ogImagePath =
        safeString(seo.social?.ogImage?.url) ||
        safeString(seo.contact?.logo?.url);
    const ogImage = ogImagePath ? absoluteUrl(base, ogImagePath) : '';

    const socialAccounts = Array.isArray(seo.social?.accounts)
        ? (seo.social.accounts as Array<Record<string, any>>)
        : [];
    const sameAs = socialAccounts
        .map((account) => safeString(account?.url))
        .filter(Boolean);

    const phone = safeString(seo.contact?.phone);
    const email = safeString(seo.contact?.email);

    const jsonLdOrg = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName || undefined,
        url: base || undefined,
        logo: ogImage || undefined,
        sameAs: sameAs.length ? sameAs : undefined,
        contactPoint:
            phone || email
                ? [
                      {
                          '@type': 'ContactPoint',
                          telephone: phone || undefined,
                          email: email || undefined,
                          contactType: 'customer service',
                      },
                  ]
                : undefined,
    };

    const jsonLdWebsite = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName || undefined,
        url: base || undefined,
    };

    return (
        <Head>
            <meta
                name="description"
                content={description}
                head-key="meta-description"
            />
            {keywords ? (
                <meta
                    name="keywords"
                    content={keywords}
                    head-key="meta-keywords"
                />
            ) : null}
            <meta name="robots" content={robots} head-key="meta-robots" />

            {canonical ? (
                <link
                    rel="canonical"
                    href={canonical}
                    head-key="link-canonical"
                />
            ) : null}

            <meta property="og:type" content="website" head-key="og-type" />
            {siteName ? (
                <meta
                    property="og:site_name"
                    content={siteName}
                    head-key="og-site-name"
                />
            ) : null}
            <meta
                property="og:title"
                content={ogTitle || siteName || ''}
                head-key="og-title"
            />
            <meta
                property="og:description"
                content={ogDescription || description || ''}
                head-key="og-description"
            />
            {canonical ? (
                <meta property="og:url" content={canonical} head-key="og-url" />
            ) : null}
            {ogImage ? (
                <meta
                    property="og:image"
                    content={ogImage}
                    head-key="og-image"
                />
            ) : null}

            <meta
                name="twitter:card"
                content={ogImage ? 'summary_large_image' : 'summary'}
                head-key="twitter-card"
            />
            <meta
                name="twitter:title"
                content={ogTitle || siteName || ''}
                head-key="twitter-title"
            />
            <meta
                name="twitter:description"
                content={ogDescription || description || ''}
                head-key="twitter-description"
            />
            {ogImage ? (
                <meta
                    name="twitter:image"
                    content={ogImage}
                    head-key="twitter-image"
                />
            ) : null}

            {safeString(seo.advanced?.googleVerification) ? (
                <meta
                    name="google-site-verification"
                    content={safeString(seo.advanced?.googleVerification)}
                    head-key="google-site-verification"
                />
            ) : null}
            {safeString(seo.advanced?.bingVerification) ? (
                <meta
                    name="msvalidate.01"
                    content={safeString(seo.advanced?.bingVerification)}
                    head-key="bing-site-verification"
                />
            ) : null}

            {base ? (
                <script
                    type="application/ld+json"
                    head-key="jsonld-org"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLdOrg),
                    }}
                />
            ) : null}
            {base ? (
                <script
                    type="application/ld+json"
                    head-key="jsonld-website"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jsonLdWebsite),
                    }}
                />
            ) : null}

            {tagline ? (
                <meta
                    name="application-name"
                    content={tagline}
                    head-key="app-name"
                />
            ) : null}
        </Head>
    );
}
