import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { type ComponentProps } from 'react';
import { type SharedData } from '@/types';

export default function AppLogoIcon({
    className,
    ...props
}: ComponentProps<'img'>) {
    const { branding } = usePage<SharedData>().props;

    return (
        <>
            <img
                src={branding.logo_path}
                alt={branding.company_name}
                className={cn('object-contain dark:hidden', className)}
                {...props}
            />
            <img
                src={branding.logo_white_path}
                alt={branding.company_name}
                className={cn('hidden object-contain dark:block', className)}
                {...props}
            />
        </>
    );
}
