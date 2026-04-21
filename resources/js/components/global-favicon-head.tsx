import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

function resolveImageMimeType(path: string): string | undefined {
    const cleanPath = path.split('?')[0]?.toLowerCase() ?? '';

    if (cleanPath.endsWith('.png')) {
        return 'image/png';
    }

    if (cleanPath.endsWith('.svg')) {
        return 'image/svg+xml';
    }

    if (cleanPath.endsWith('.webp')) {
        return 'image/webp';
    }

    if (cleanPath.endsWith('.jpg') || cleanPath.endsWith('.jpeg')) {
        return 'image/jpeg';
    }

    if (cleanPath.endsWith('.ico')) {
        return 'image/x-icon';
    }

    return undefined;
}

export default function GlobalFaviconHead() {
    const { branding, publicBranding } = usePage<SharedData>().props;
    const resolvedLogoPath = publicBranding?.logo_path ?? branding.logo_path;
    const resolvedFaviconPath =
        publicBranding?.favicon_path ?? resolvedLogoPath;
    const faviconHref = `${resolvedFaviconPath}${resolvedFaviconPath.includes('?') ? '&' : '?'}v=${encodeURIComponent(resolvedFaviconPath)}`;
    const faviconType = resolveImageMimeType(resolvedFaviconPath);

    return (
        <Head>
            <link
                rel="icon"
                href={faviconHref}
                type={faviconType}
                sizes="32x32"
                head-key="favicon-icon"
            />
            <link
                rel="shortcut icon"
                href={faviconHref}
                type={faviconType}
                head-key="favicon-shortcut"
            />
            <link
                rel="apple-touch-icon"
                href={faviconHref}
                head-key="favicon-apple"
            />
        </Head>
    );
}
