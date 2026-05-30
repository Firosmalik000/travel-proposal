import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

type SeoData = Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};
}

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
    const seo = (page.props.seoSettings as SeoData) ?? {};
    const seoGeneral = asRecord(seo.general);
    const seoAdvanced = asRecord(seo.advanced);
    const seoSocial = asRecord(seo.social);
    const seoContact = asRecord(seo.contact);
    const socialAccountsRaw = seoSocial.accounts;
    const siteNameData = asRecord(seoGeneral.siteName);
    const taglineData = asRecord(seoGeneral.tagline);
    const defaultDescriptionData = asRecord(seoGeneral.defaultDescription);
    const ogTitleData = asRecord(seoSocial.ogTitle);
    const ogDescriptionData = asRecord(seoSocial.ogDescription);

    const base = normalizeBaseUrl(
        safeString(seoAdvanced.canonicalBase) || undefined,
    );
    const urlPath = safeString(page.url).split('?')[0] ?? '/';
    const canonical = base ? absoluteUrl(base, urlPath) : urlPath;

    const locale = 'id';
    const siteName = safeString(
        siteNameData[locale],
        safeString(siteNameData.id, safeString(siteNameData.en, '')),
    );
    const tagline = safeString(
        taglineData[locale],
        safeString(taglineData.id, safeString(taglineData.en, '')),
    );
    const description = safeString(
        defaultDescriptionData[locale],
        safeString(
            defaultDescriptionData.id,
            safeString(defaultDescriptionData.en, ''),
        ),
    );
    const keywords = safeString(seoGeneral.keywords);

    const robots = safeString(seoAdvanced.robotsDefault, 'index, follow');

    const ogTitle = safeString(
        ogTitleData[locale],
        safeString(ogTitleData.id, safeString(ogTitleData.en, siteName)),
    );
    const ogDescription = safeString(
        ogDescriptionData[locale],
        safeString(
            ogDescriptionData.id,
            safeString(ogDescriptionData.en, description),
        ),
    );

    const ogImagePath =
        safeString(asRecord(seoSocial.ogImage).url) ||
        safeString(asRecord(seoContact.logo).url);
    const ogImage = ogImagePath ? absoluteUrl(base, ogImagePath) : '';

    const socialAccounts = Array.isArray(socialAccountsRaw)
        ? (socialAccountsRaw as Array<Record<string, unknown>>)
        : [];
    const sameAs = socialAccounts
        .map((account) => safeString(account?.url))
        .filter(Boolean);

    const phone = safeString(seoContact.phone);
    const email = safeString(seoContact.email);

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

            {safeString(seoAdvanced.googleVerification) ? (
                <meta
                    name="google-site-verification"
                    content={safeString(seoAdvanced.googleVerification)}
                    head-key="google-site-verification"
                />
            ) : null}
            {safeString(seoAdvanced.bingVerification) ? (
                <meta
                    name="msvalidate.01"
                    content={safeString(seoAdvanced.bingVerification)}
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
