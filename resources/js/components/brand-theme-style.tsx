import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function BrandThemeStyle() {
    const { branding } = usePage<SharedData>().props;

    return (
        <style>{`
            :root {
                --brand-primary: ${branding.palette.primary};
                --brand-secondary: ${branding.palette.secondary};
                --brand-accent: ${branding.palette.accent};
                --brand-accent-soft: ${branding.palette.accent_soft};
                --brand-surface: ${branding.palette.surface};
                --background: ${branding.palette.surface};
                --foreground: ${branding.palette.secondary};
                --card: #fff8ec;
                --card-foreground: ${branding.palette.secondary};
                --popover: #fff8ec;
                --popover-foreground: ${branding.palette.secondary};
                --primary: ${branding.palette.primary};
                --primary-foreground: #fff8ec;
                --secondary: ${branding.palette.accent_soft};
                --secondary-foreground: ${branding.palette.secondary};
                --muted: #f3dfb2;
                --muted-foreground: ${branding.palette.secondary};
                --accent: ${branding.palette.accent};
                --accent-foreground: ${branding.palette.secondary};
                --border: #e9c98f;
                --input: #e9c98f;
                --ring: ${branding.palette.primary};
                --chart-1: ${branding.palette.primary};
                --chart-2: ${branding.palette.secondary};
                --chart-3: ${branding.palette.accent};
                --chart-4: ${branding.palette.accent_soft};
                --chart-5: #b86018;
                --sidebar: #fbefda;
                --sidebar-foreground: ${branding.palette.secondary};
                --sidebar-primary: ${branding.palette.primary};
                --sidebar-primary-foreground: #fff8ec;
                --sidebar-accent: ${branding.palette.accent_soft};
                --sidebar-accent-foreground: ${branding.palette.secondary};
                --sidebar-border: #e9c98f;
                --sidebar-ring: ${branding.palette.primary};
                --auth-shell: linear-gradient(135deg, #fff5de 0%, ${branding.palette.surface} 55%, #f7d8aa 100%);
                --auth-shell-dark: linear-gradient(135deg, #2f090d 0%, #451015 55%, #5a161b 100%);
                --auth-panel: linear-gradient(135deg, ${branding.palette.secondary} 0%, ${branding.palette.primary} 58%, ${branding.palette.accent} 100%);
                --auth-card-bg: rgba(255, 255, 255, 0.94);
                --auth-card-border: rgba(15, 23, 42, 0.08);
                --auth-card-foreground: #0f172a;
                --auth-card-muted: #475569;
                --auth-field-bg: rgba(255, 255, 255, 0.98);
                --auth-field-border: rgba(148, 163, 184, 0.36);
                --auth-field-foreground: #0f172a;
                --auth-field-placeholder: #64748b;
                --auth-link: ${branding.palette.primary};
                --auth-link-hover: #7f1d1d;
                --auth-success-bg: rgba(255, 255, 255, 0.92);
                --auth-success-border: rgba(34, 120, 87, 0.18);
                --auth-success-text: #1f6d4e;
            }

            .dark {
                --background: #2f090d;
                --foreground: ${branding.palette.surface};
                --card: #471014;
                --card-foreground: ${branding.palette.surface};
                --popover: #471014;
                --popover-foreground: ${branding.palette.surface};
                --primary: ${branding.palette.accent};
                --primary-foreground: #2f090d;
                --secondary: ${branding.palette.secondary};
                --secondary-foreground: ${branding.palette.surface};
                --muted: #5a151b;
                --muted-foreground: #f1d8a5;
                --accent: ${branding.palette.accent_soft};
                --accent-foreground: #2f090d;
                --border: #6a1a20;
                --input: #6a1a20;
                --ring: ${branding.palette.accent};
                --chart-1: ${branding.palette.accent};
                --chart-2: ${branding.palette.accent_soft};
                --chart-3: ${branding.palette.primary};
                --chart-4: ${branding.palette.surface};
                --chart-5: ${branding.palette.secondary};
                --sidebar: #3a0d11;
                --sidebar-foreground: ${branding.palette.surface};
                --sidebar-primary: ${branding.palette.accent};
                --sidebar-primary-foreground: #2f090d;
                --sidebar-accent: #5a151b;
                --sidebar-accent-foreground: ${branding.palette.surface};
                --sidebar-border: #6a1a20;
                --sidebar-ring: ${branding.palette.accent};
                --auth-card-bg: rgba(17, 24, 39, 0.88);
                --auth-card-border: rgba(255, 255, 255, 0.08);
                --auth-card-foreground: #f8fafc;
                --auth-card-muted: #cbd5e1;
                --auth-field-bg: rgba(30, 41, 59, 0.92);
                --auth-field-border: rgba(148, 163, 184, 0.2);
                --auth-field-foreground: #f8fafc;
                --auth-field-placeholder: #94a3b8;
                --auth-link: ${branding.palette.accent};
                --auth-link-hover: #fde68a;
                --auth-success-bg: rgba(37, 64, 52, 0.42);
                --auth-success-border: rgba(96, 192, 150, 0.24);
                --auth-success-text: #9ae6c2;
            }
        `}</style>
    );
}
