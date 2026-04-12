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
            }
        `}</style>
    );
}
