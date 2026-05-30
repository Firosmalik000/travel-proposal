import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

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
                
                /* Main Layout */
                --background: color-mix(in srgb, ${branding.palette.surface} 96%, ${branding.palette.secondary} 4%);
                --foreground: #2d1810;
                
                --card: #ffffff;
                --card-foreground: #2d1810;
                
                --popover: #ffffff;
                --popover-foreground: #2d1810;
                
                /* Mapping Primary & Secondary */
                --primary: ${branding.palette.primary};
                --primary-foreground: #ffffff;
                
                --secondary: ${branding.palette.secondary};
                --secondary-foreground: #ffffff;
                
                --muted: color-mix(in srgb, ${branding.palette.secondary} 10%, white);
                --muted-foreground: ${branding.palette.secondary}d9;
                
                /* Mapping Accents */
                --accent: ${branding.palette.accent};
                --accent-foreground: #ffffff;
                
                --border: ${branding.palette.secondary}33;
                --input: ${branding.palette.secondary}40;
                --ring: ${branding.palette.secondary};
                
                --radius: 1rem;

                /* Sidebar - Using Secondary & Accents */
                --sidebar: color-mix(in srgb, ${branding.palette.secondary} 8%, #ffffff);
                --sidebar-foreground: #1f2937;
                --sidebar-primary: ${branding.palette.secondary};
                --sidebar-primary-foreground: #ffffff;
                --sidebar-accent: color-mix(in srgb, ${branding.palette.secondary} 12%, #ffffff);
                --sidebar-accent-foreground: #1f2937;
                --sidebar-border: color-mix(in srgb, ${branding.palette.secondary} 18%, #d1d5db);
                --sidebar-ring: ${branding.palette.secondary};

                /* Admin Specific Elements */
                --admin-header-bg: color-mix(in srgb, ${branding.palette.surface} 98%, ${branding.palette.secondary} 2%);
                --admin-card-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
                
                /* Interactive Colors */
                --active-item-bg: ${branding.palette.secondary}2e;
                --hover-item-bg: ${branding.palette.secondary}20;
            }

            .dark {
                --background: #0f131a;
                --foreground: #eef2f8;

                --card: #171d27;
                --card-foreground: #eef2f8;

                --popover: #171d27;
                --popover-foreground: #eef2f8;

                --primary: ${branding.palette.secondary};
                --primary-foreground: #ffffff;

                --secondary: color-mix(in srgb, ${branding.palette.secondary} 62%, #111827);
                --secondary-foreground: #e5e7eb;

                --muted: #202836;
                --muted-foreground: #a9b3c4;

                --accent: ${branding.palette.accent};
                --accent-foreground: #111826;

                --border: #2c3648;
                --input: #2c3648;
                --ring: ${branding.palette.secondary};

                --sidebar: color-mix(in srgb, ${branding.palette.secondary} 26%, #0f172a);
                --sidebar-foreground: #fff7f5;
                --sidebar-primary: ${branding.palette.secondary};
                --sidebar-primary-foreground: #ffffff;
                --sidebar-accent: color-mix(in srgb, ${branding.palette.secondary} 24%, #111827);
                --sidebar-accent-foreground: #fff7f5;
                --sidebar-border: color-mix(in srgb, ${branding.palette.secondary} 30%, #111827);
                --sidebar-ring: ${branding.palette.secondary};

                --admin-header-bg: color-mix(in srgb, ${branding.palette.secondary} 26%, #111827);
            }
            
            /* Apply custom backgrounds to specific elements */
            .bg-accent-soft { background-color: var(--brand-accent-soft); }
            .text-accent { color: var(--brand-accent); }
            .border-secondary { border-color: var(--brand-secondary); }
        `}</style>
    );
}
