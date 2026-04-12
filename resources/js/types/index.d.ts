import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title?: string;
    label?: string; // Support both title and label for backward compatibility
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    branding: {
        company_name: string;
        company_subtitle: string;
        logo_path: string;
        logo_white_path: string;
        palette: {
            primary: string;
            secondary: string;
            accent: string;
            accent_soft: string;
            surface: string;
        };
    };
    seoSettings?: Record<string, unknown>;
    publicData?: Record<string, unknown>;
    url?: string;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
