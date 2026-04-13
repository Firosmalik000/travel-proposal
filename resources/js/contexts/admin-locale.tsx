import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type AdminLocale = 'id' | 'en';

interface AdminLocaleContextValue {
    locale: AdminLocale;
    setLocale: (locale: AdminLocale) => void;
}

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null);

const STORAGE_KEY = 'admin_ui_locale';

const getInitialLocale = (): AdminLocale => {
    if (typeof window === 'undefined') {
        return 'id';
    }

    const stored = localStorage.getItem(STORAGE_KEY) as AdminLocale | null;

    if (stored === 'id' || stored === 'en') {
        return stored;
    }

    return 'id';
};

export function AdminLocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<AdminLocale>(getInitialLocale);

    const setLocale = useCallback((next: AdminLocale) => {
        setLocaleState(next);

        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, next);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, locale);
        }
    }, [locale]);

    return <AdminLocaleContext.Provider value={{ locale, setLocale }}>{children}</AdminLocaleContext.Provider>;
}

export function useAdminLocale() {
    const context = useContext(AdminLocaleContext);

    if (!context) {
        throw new Error('useAdminLocale must be used within AdminLocaleProvider');
    }

    return context;
}
