import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ShieldAlert, Undo2 } from 'lucide-react';
import { type PropsWithChildren, useEffect } from 'react';

export default function RootLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;
    const isImpersonating = auth.impersonation?.is_impersonating ?? false;
    const impersonator = auth.impersonation?.impersonator ?? null;

    useEffect(() => {
        const barHeight = isImpersonating ? '48px' : '0px';
        document.documentElement.style.setProperty(
            '--impersonation-bar-height',
            barHeight,
        );
        document.body.style.paddingTop = barHeight;

        return () => {
            document.documentElement.style.removeProperty(
                '--impersonation-bar-height',
            );
            document.body.style.paddingTop = '0px';
        };
    }, [isImpersonating]);

    return (
        <>
            {isImpersonating && (
                <div className="fixed inset-x-0 top-0 z-50 border-b border-amber-200/60 bg-amber-50 px-4 py-2 text-amber-950 sm:px-6 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-100">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm">
                            <ShieldAlert className="h-4 w-4" />
                            <span className="font-medium">
                                Mode impersonate aktif
                            </span>
                            {impersonator && (
                                <span className="text-xs opacity-80">
                                    (akun asli: {impersonator.email})
                                </span>
                            )}
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link
                                href="/impersonation/stop"
                                method="post"
                                as="button"
                            >
                                <Undo2 className="mr-2 h-4 w-4" />
                                Kembali ke akun utama
                            </Link>
                        </Button>
                    </div>
                </div>
            )}

            {children}
        </>
    );
}
