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
                --background: #f5f7fb;
                --foreground: #0f172a;

                --card: #ffffff;
                --card-foreground: #0f172a;

                --popover: #ffffff;
                --popover-foreground: #0f172a;

                /* Admin Control Colors */
                --primary: #0f172a;
                --primary-foreground: #ffffff;

                --secondary: #0f172a;
                --secondary-foreground: #ffffff;

                --muted: #eef2f7;
                --muted-foreground: #64748b;

                --accent: ${branding.palette.primary};
                --accent-foreground: #ffffff;

                --border: #dbe3ee;
                --input: #dbe3ee;
                --ring: #0f172a;

                --radius: 1rem;

                /* Sidebar */
                --sidebar: #121826;
                --sidebar-foreground: #f8fafc;
                --sidebar-primary: #f8fafc;
                --sidebar-primary-foreground: #ffffff;
                --sidebar-accent: rgba(255, 255, 255, 0.08);
                --sidebar-accent-foreground: #f8fafc;
                --sidebar-border: rgba(255, 255, 255, 0.1);
                --sidebar-ring: #f8fafc;

                /* Admin Specific Elements */
                --admin-header-bg: #171d27;
                --admin-card-shadow: 0 12px 30px -22px rgba(15, 23, 42, 0.22);

                /* Interactive Colors */
                --active-item-bg: rgba(15, 23, 42, 0.08);
                --hover-item-bg: rgba(15, 23, 42, 0.05);
            }

            .dark {
                --background: #0f131a;
                --foreground: #eef2f8;

                --card: #171d27;
                --card-foreground: #eef2f8;

                --popover: #171d27;
                --popover-foreground: #eef2f8;

                --primary: #f8fafc;
                --primary-foreground: #0f172a;

                --secondary: #242c3a;
                --secondary-foreground: #e5e7eb;

                --muted: #202836;
                --muted-foreground: #a9b3c4;

                --accent: ${branding.palette.primary};
                --accent-foreground: #111826;

                --border: #2c3648;
                --input: #2c3648;
                --ring: #eef2f8;

                --sidebar: #121826;
                --sidebar-foreground: #e8edf7;
                --sidebar-primary: #f8fafc;
                --sidebar-primary-foreground: #0f172a;
                --sidebar-accent: #1c2433;
                --sidebar-accent-foreground: #e8edf7;
                --sidebar-border: #2c3648;
                --sidebar-ring: #f8fafc;

                --admin-header-bg: #171d27;
            }
            
            /* Apply custom backgrounds to specific elements */
            .bg-accent-soft { background-color: var(--brand-accent-soft); }
            .text-accent { color: var(--brand-accent); }
            .border-secondary { border-color: var(--brand-secondary); }
        `}</style>
    );
}
