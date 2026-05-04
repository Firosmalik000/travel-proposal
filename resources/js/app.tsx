import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { initializeTheme } from './hooks/use-appearance';
import RootLayout from './layouts/root-layout';

const rawAppName = import.meta.env.VITE_APP_NAME || 'Travel Proposal';
const appName = rawAppName
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character: string) => character.toUpperCase());

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ).then((module: any) => {
            const page: any = module.default;
            page.layout =
                page.layout ??
                ((pageEl: React.ReactNode) => (
                    <RootLayout>{pageEl}</RootLayout>
                ));
            return module;
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
                <Toaster
                    position="top-right"
                    expand={true}
                    richColors
                    closeButton
                />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
