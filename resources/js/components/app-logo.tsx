import { useSidebar } from '@/components/ui/sidebar';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { state } = useSidebar();

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <AppLogoIcon className="size-8 object-contain" />
            </div>
            {state !== 'collapsed' ? (
                <div className="ml-2 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-tight font-semibold text-white">
                        Asfar Tour
                    </span>
                    <span className="text-[0.68rem] leading-snug text-white/75">
                        Jelas Rencananya, Terjamin Amanahnya.
                    </span>
                </div>
            ) : null}
        </>
    );
}
