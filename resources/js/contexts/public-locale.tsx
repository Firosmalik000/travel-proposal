import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

export type PublicLocale = 'id' | 'en';

interface PublicLocaleContextValue {
    locale: PublicLocale;
    setLocale: (locale: PublicLocale) => void;
}

const PublicLocaleContext = createContext<PublicLocaleContextValue | null>(null);

const STORAGE_KEY = 'public_locale';

const getInitialLocale = (fallback: PublicLocale): PublicLocale => {
    if (typeof window === 'undefined') {
        return fallback;
    }

    const stored = localStorage.getItem(STORAGE_KEY) as PublicLocale | null;
    if (stored === 'id' || stored === 'en') {
        return stored;
    }

    const docLang = document.documentElement.lang;
    if (docLang?.startsWith('en')) {
        return 'en';
    }

    return fallback;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

export function PublicLocaleProvider({
    children,
    defaultLocale = 'id',
}: {
    children: React.ReactNode;
    defaultLocale?: PublicLocale;
}) {
    const [locale, setLocaleState] = useState<PublicLocale>(() =>
        getInitialLocale(defaultLocale),
    );

    const setLocale = useCallback((next: PublicLocale) => {
        setLocaleState(next);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, next);
        }
        setCookie(STORAGE_KEY, next);
        if (typeof document !== 'undefined') {
            document.documentElement.lang = next;
        }
    }, []);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
        }
    }, [locale]);

    return (
        <PublicLocaleContext.Provider value={{ locale, setLocale }}>
            {children}
        </PublicLocaleContext.Provider>
    );
}

export function usePublicLocale() {
    const context = useContext(PublicLocaleContext);
    if (!context) {
        throw new Error('usePublicLocale must be used within PublicLocaleProvider');
    }
    return context;
}
