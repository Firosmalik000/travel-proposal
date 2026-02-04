import { cn } from '@/lib/utils';
import { SVGProps } from 'react';

export default function AppLogoIcon({
    className,
    ...props
}: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('text-primary', className)}
            aria-hidden="true"
            {...props}
        >
            <rect
                x="6"
                y="8"
                width="10"
                height="32"
                rx="4"
                fill="currentColor"
            />
            <rect
                x="32"
                y="8"
                width="10"
                height="32"
                rx="4"
                fill="currentColor"
            />
            <path
                d="M16 16c4-4 12-4 16 0v16c-4 4-12 4-16 0V16z"
                fill="currentColor"
                opacity="0.25"
            />
            <circle
                cx="24"
                cy="24"
                r="6"
                fill="currentColor"
                opacity="0.6"
            />
        </svg>
    );
}
