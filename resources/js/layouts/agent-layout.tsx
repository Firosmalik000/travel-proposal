import { Button } from '@/components/ui/button';
import { Link, router, usePage } from '@inertiajs/react';
import { HandCoins, LogOut, Plane, Share2 } from 'lucide-react';
import type { PropsWithChildren } from 'react';

type AgentPageProps = {
    auth?: { user?: { name?: string } };
    branding?: { company_name?: string };
};

export default function AgentLayout({ children }: PropsWithChildren) {
    const { auth, branding } = usePage().props as unknown as AgentPageProps;

    return (
        <div className="min-h-screen bg-[#f3efe5] text-[#17211f]">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_8%_0%,rgba(185,126,47,.20),transparent_30%),radial-gradient(circle_at_90%_8%,rgba(14,89,78,.15),transparent_34%)]" />
            <header className="sticky top-0 z-40 border-b border-[#d7cbb6]/80 bg-[#fffaf0]/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                    <Link href="/agent" className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0e594e] text-white shadow-lg shadow-emerald-950/15">
                            <Plane className="size-5" />
                        </div>
                        <div>
                            <p className="font-serif text-lg leading-none font-bold">
                                Portal Agent
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                                {branding?.company_name}
                            </p>
                        </div>
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            asChild
                            className="hidden sm:inline-flex"
                        >
                            <Link href="/agent">
                                <HandCoins className="size-4" /> Performa
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.post('/logout')}
                        >
                            <LogOut className="size-4" />{' '}
                            <span className="hidden sm:inline">Keluar</span>
                        </Button>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                {children}
            </main>
            <footer className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-8 text-xs text-slate-500 sm:px-6">
                <Share2 className="size-3.5" /> Akun agent: {auth?.user?.name}
            </footer>
        </div>
    );
}
