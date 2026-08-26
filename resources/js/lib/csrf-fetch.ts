function cookieValue(name: string): string | null {
    const prefix = `${encodeURIComponent(name)}=`;
    const value = document.cookie
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(prefix))
        ?.slice(prefix.length);

    if (!value) {
        return null;
    }

    try {
        return decodeURIComponent(value);
    } catch {
        return null;
    }
}

function csrfHeader(): Record<string, string> {
    const xsrfToken = cookieValue('XSRF-TOKEN');

    if (xsrfToken) {
        return { 'X-XSRF-TOKEN': xsrfToken };
    }

    const metaToken = document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content');

    return metaToken ? { 'X-CSRF-TOKEN': metaToken } : {};
}

export function fetchWithCsrf(
    input: RequestInfo | URL,
    init: RequestInit = {},
): Promise<Response> {
    const headers = new Headers(init.headers);

    Object.entries(csrfHeader()).forEach(([name, value]) => {
        headers.set(name, value);
    });

    return fetch(input, {
        ...init,
        headers,
        credentials: 'same-origin',
    });
}
