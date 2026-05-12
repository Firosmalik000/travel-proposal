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
                --background: ${branding.palette.primary}0f;
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
                
                --muted: ${branding.palette.primary}12;
                --muted-foreground: ${branding.palette.secondary}d9;
                
                /* Mapping Accents */
                --accent: ${branding.palette.accent};
                --accent-foreground: #ffffff;
                
                --border: ${branding.palette.secondary}33;
                --input: ${branding.palette.secondary}40;
                --ring: ${branding.palette.primary};
                
                --radius: 1rem;

                /* Sidebar - Using Secondary & Accents */
                --sidebar: ${branding.palette.primary}1f;
                --sidebar-foreground: #2a0b10;
                --sidebar-primary: ${branding.palette.primary};
                --sidebar-primary-foreground: #ffffff;
                --sidebar-accent: ${branding.palette.secondary}26;
                --sidebar-accent-foreground: #2a0b10;
                --sidebar-border: ${branding.palette.secondary}45;
                --sidebar-ring: ${branding.palette.primary};

                /* Admin Specific Elements */
                --admin-header-bg: ${branding.palette.primary}22;
                --admin-card-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
                
                /* Interactive Colors */
                --active-item-bg: ${branding.palette.primary}2e;
                --hover-item-bg: ${branding.palette.secondary}20;
            }

            .dark {
                --background: #1a0f0e;
                --foreground: ${branding.palette.surface};
                
                --card: #251614;
                --card-foreground: ${branding.palette.surface};
                
                --popover: #251614;
                --popover-foreground: ${branding.palette.surface};
                
                --primary: ${branding.palette.accent};
                --primary-foreground: #1a0f0e;
                
                --secondary: ${branding.palette.accent_soft};
                --secondary-foreground: #1a0f0e;
                
                --muted: #2d1816;
                --muted-foreground: ${branding.palette.surface}cc;
                
                --accent: ${branding.palette.primary};
                --accent-foreground: #ffffff;
                
                --border: #3d2421;
                --input: #3d2421;
                --ring: ${branding.palette.accent};
                
                --sidebar: #120a09;
                --sidebar-foreground: ${branding.palette.surface};
                --sidebar-primary: ${branding.palette.accent};
                --sidebar-primary-foreground: #1a0f0e;
                --sidebar-accent: ${branding.palette.accent_soft}26;
                --sidebar-accent-foreground: ${branding.palette.surface};
                --sidebar-border: #2d1816;
                --sidebar-ring: ${branding.palette.accent};
                
                --admin-header-bg: rgba(18, 10, 9, 0.95);
            }
            
            /* Apply custom backgrounds to specific elements */
            .bg-accent-soft { background-color: var(--brand-accent-soft); }
            .text-accent { color: var(--brand-accent); }
            .border-secondary { border-color: var(--brand-secondary); }
        `}</style>
    );
}
