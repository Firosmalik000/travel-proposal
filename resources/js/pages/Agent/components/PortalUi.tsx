import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Link, router } from '@inertiajs/react';
import {
    Check,
    Clipboard,
    Download,
    QrCode,
    Search,
    Share2,
} from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import type { Paginated, PortalFilters } from '../types';
import { statusLabel } from '../types';

export function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        paid: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
        approved:
            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300',
        pending:
            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
        registered:
            'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
        completed:
            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
        cancelled:
            'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
    };
    return (
        <Badge
            variant="outline"
            className={styles[status] ?? 'border-slate-200 bg-slate-50'}
        >
            {statusLabel[status] ?? status}
        </Badge>
    );
}

export function PageIntro({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[#0d5c52] uppercase dark:text-emerald-300">
                    {eyebrow}
                </p>
                <h1 className="mt-2 font-serif text-2xl font-bold text-slate-950 min-[375px]:text-3xl dark:text-white">
                    {title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            </div>
            {action}
        </div>
    );
}

export function ReferralShare({
    url,
    qrUrl,
    compact = false,
}: {
    url: string;
    qrUrl?: string;
    compact?: boolean;
}) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const input = document.createElement('textarea');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            input.remove();
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };
    const whatsapp = `https://wa.me/?text=${encodeURIComponent(`Lihat paket perjalanan ini: ${url}`)}`;
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                type="button"
                size={compact ? 'sm' : 'default'}
                onClick={copy}
            >
                {copied ? <Check /> : <Clipboard />}
                {copied ? 'Tersalin' : 'Salin Link'}
            </Button>
            <Button size={compact ? 'sm' : 'default'} variant="outline" asChild>
                <a href={whatsapp} target="_blank" rel="noreferrer">
                    <Share2 /> WhatsApp
                </a>
            </Button>
            {qrUrl && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            size={compact ? 'sm' : 'default'}
                            variant="outline"
                        >
                            <QrCode /> QR
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>QR referral</DialogTitle>
                            <DialogDescription>
                                Scan untuk membuka link referral yang sama. QR
                                ini aman dibagikan ke materi promosi.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mx-auto rounded-2xl border border-slate-200 bg-white p-3">
                            <img
                                src={qrUrl}
                                alt="QR link referral agent"
                                className="size-56"
                            />
                        </div>
                        <DialogFooter>
                            <Button asChild className="w-full">
                                <a href={`${qrUrl}?download=1`} download>
                                    <Download /> Unduh QR
                                </a>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

export function RecordFilters({
    route,
    filters,
    statuses,
}: {
    route: string;
    filters: PortalFilters;
    statuses: Array<{ value: string; label: string }>;
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get(
            route,
            {
                search: search || undefined,
                status: status || undefined,
                from: from || undefined,
                to: to || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };
    return (
        <form
            onSubmit={submit}
            className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_180px_150px_150px_auto] dark:border-slate-700 dark:bg-slate-900/40"
        >
            <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari kode, customer, atau package"
                    className="pl-9"
                />
            </div>
            <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
                <option value="">Semua status</option>
                {statuses.map((item) => (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </select>
            <Input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                aria-label="Tanggal awal"
            />
            <Input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                aria-label="Tanggal akhir"
            />
            <Button type="submit">Terapkan</Button>
        </form>
    );
}

export function PaginationLinks<T>({ page }: { page: Paginated<T> }) {
    if (page.last_page <= 1) return null;
    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
                Menampilkan {page.from ?? 0}-{page.to ?? 0} dari {page.total}
            </p>
            <div className="flex flex-wrap gap-1">
                {page.links.map((link, index) => (
                    <Button
                        key={`${link.label}-${index}`}
                        size="sm"
                        variant={link.active ? 'default' : 'outline'}
                        disabled={!link.url}
                        asChild={Boolean(link.url)}
                    >
                        {link.url ? (
                            <Link href={link.url} preserveScroll>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            </Link>
                        ) : (
                            <span
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )}
                    </Button>
                ))}
            </div>
        </div>
    );
}
