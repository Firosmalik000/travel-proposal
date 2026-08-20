import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { initializeTheme } from './hooks/use-appearance';
import RootLayout from './layouts/root-layout';
import { initializeRequestToasts } from './lib/request-toasts';

const rawAppName = import.meta.env.VITE_APP_NAME || 'Travel Proposal';
const appName = rawAppName
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character: string) => character.toUpperCase());

type InertiaPageModule = {
    default: {
        layout?: (page: ReactNode) => ReactNode;
    };
};

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ).then((module) => {
            const typedModule = module as InertiaPageModule;
            const page = typedModule.default;
            page.layout =
                page.layout ??
                ((pageEl: ReactNode) => <RootLayout>{pageEl}</RootLayout>);
            return typedModule;
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster
                    position="top-right"
                    expand={true}
                    richColors
                    closeButton
                />
            </>,
        );

        initializeRequestToasts(
            props.initialPage.props as Record<string, unknown>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
