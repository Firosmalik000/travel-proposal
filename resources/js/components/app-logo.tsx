import { useSidebar } from '@/components/ui/sidebar';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { branding } = usePage<SharedData>().props;
    const { state } = useSidebar();

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <AppLogoIcon className="size-8 object-contain" />
            </div>
            {state !== 'collapsed' ? (
                <div className="ml-2 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold">
                        {branding.company_name}
                    </span>
                    <span className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
                        {branding.company_subtitle}
                    </span>
                </div>
            ) : null}
        </>
    );
}
