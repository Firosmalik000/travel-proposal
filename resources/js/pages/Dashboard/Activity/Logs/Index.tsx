import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import { Clock3, Search } from 'lucide-react';
import { useState } from 'react';

type ActivityLogItem = {
    id: number;
    actor_name: string;
    event_type: string;
    module: string;
    menu_key: string;
    module_label: string;
    submenu_label: string;
    description: string;
    ip_address: string;
    user_agent: string;
    logged_at: string | null;
    route_name: string;
    method: string;
    properties: Record<string, unknown>;
};

type Props = {
    logs: {
        data: ActivityLogItem[];
        total: number;
        from?: number;
        to?: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search: string;
        module: string;
        user_id: number | null;
        date_from: string;
        date_to: string;
    };
    moduleOptions: Array<{ value: string; label: string }>;
    users: Array<{ id: number; name: string }>;
};

export default function ActivityLogsIndex({
    logs,
    filters,
    moduleOptions,
    users,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [module, setModule] = useState(filters.module || 'all');
    const [userId, setUserId] = useState(
        filters.user_id ? String(filters.user_id) : 'all',
    );
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const formatDateTime = (value: string | null) => {
        if (!value) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(new Date(value));
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { label: 'Activity Log', href: '/admin/activity/logs' },
            ]}
        >
            <Head title="Activity Log" />

            <div className="space-y-4 p-4 md:p-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                        Activity Log
                    </h1>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Cari product, booking code, atau catatan..."
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                            <Select value={module} onValueChange={setModule}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua module" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua module
                                    </SelectItem>
                                    {moduleOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="lg:col-span-4">
                            <Select value={userId} onValueChange={setUserId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Semua user" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua user
                                    </SelectItem>
                                    {users.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={String(user.id)}
                                        >
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="lg:col-span-6">
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(event) =>
                                    setDateFrom(event.target.value)
                                }
                            />
                        </div>
                        <div className="lg:col-span-6">
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(event) =>
                                    setDateTo(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                setModule('all');
                                setUserId('all');
                                setDateFrom('');
                                setDateTo('');
                                router.get(
                                    '/admin/activity/logs',
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            onClick={() =>
                                router.get(
                                    '/admin/activity/logs',
                                    {
                                        search,
                                        module,
                                        user_id:
                                            userId !== 'all' ? userId : null,
                                        date_from: dateFrom,
                                        date_to: dateTo,
                                    },
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                        >
                            Terapkan
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[1080px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14 text-center">
                                        No
                                    </TableHead>
                                    <TableHead className="w-20 text-right">
                                        Aksi
                                    </TableHead>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Aktivitas</TableHead>
                                    <TableHead>Menu / Submenu</TableHead>
                                    <TableHead>IP / Device</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length > 0 ? (
                                    logs.data.map((log, index) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Sheet>
                                                    <SheetTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="ml-auto"
                                                        >
                                                            Detail
                                                        </Button>
                                                    </SheetTrigger>
                                                    <SheetContent
                                                        side="right"
                                                        className="w-full sm:max-w-2xl"
                                                    >
                                                        <SheetHeader>
                                                            <SheetTitle>
                                                                Detail Activity
                                                                Log
                                                            </SheetTitle>
                                                        </SheetHeader>
                                                        <div className="space-y-5 overflow-y-auto px-6 pb-6">
                                                            <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <p className="font-medium text-muted-foreground">
                                                                        Waktu
                                                                    </p>
                                                                    <p className="col-span-2">
                                                                        {formatDateTime(
                                                                            log.logged_at,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <p className="font-medium text-muted-foreground">
                                                                        User
                                                                    </p>
                                                                    <p className="col-span-2">
                                                                        {
                                                                            log.actor_name
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <p className="font-medium text-muted-foreground">
                                                                        Aktivitas
                                                                    </p>
                                                                    <p className="col-span-2 uppercase">
                                                                        {
                                                                            log.event_type
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <p className="font-medium text-muted-foreground">
                                                                        Menu
                                                                    </p>
                                                                    <p className="col-span-2">
                                                                        {
                                                                            log.module_label
                                                                        }{' '}
                                                                        /{' '}
                                                                        {
                                                                            log.submenu_label
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <p className="font-medium text-muted-foreground">
                                                                        Method
                                                                    </p>
                                                                    <p className="col-span-2 uppercase">
                                                                        {
                                                                            log.method
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <p className="font-medium text-muted-foreground">
                                                                        Route
                                                                    </p>
                                                                    <p className="col-span-2 break-all">
                                                                        {
                                                                            log.route_name
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <p className="font-medium text-muted-foreground">
                                                                        IP
                                                                    </p>
                                                                    <p className="col-span-2">
                                                                        {
                                                                            log.ip_address
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <p className="font-medium text-muted-foreground">
                                                                        Device
                                                                    </p>
                                                                    <p className="col-span-2 break-words">
                                                                        {
                                                                            log.user_agent
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="text-sm font-semibold">
                                                                    Deskripsi
                                                                </p>
                                                                <div className="rounded-xl border border-border/70 bg-card p-3 text-sm text-muted-foreground">
                                                                    {
                                                                        log.description
                                                                    }
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <p className="text-sm font-semibold">
                                                                    Data
                                                                    Perubahan
                                                                </p>
                                                                <pre className="max-h-[320px] overflow-auto rounded-xl border border-border/70 bg-muted/30 p-3 text-xs leading-relaxed">
                                                                    {JSON.stringify(
                                                                        log.properties ??
                                                                            {},
                                                                        null,
                                                                        2,
                                                                    )}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </SheetContent>
                                                </Sheet>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <div className="inline-flex items-center gap-2">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    <span className="text-xs whitespace-nowrap md:text-sm">
                                                        {formatDateTime(
                                                            log.logged_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {log.actor_name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary uppercase">
                                                    {log.event_type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">
                                                    {log.module_label}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {log.submenu_label}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-muted-foreground">
                                                    {log.ip_address}
                                                </p>
                                                <p className="max-w-[260px] truncate text-xs text-muted-foreground">
                                                    {log.user_agent}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            Belum ada activity log.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex flex-col gap-3 border-t px-4 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <p>
                            Menampilkan{' '}
                            <span className="font-medium text-foreground">
                                {logs.from ?? 0}
                            </span>{' '}
                            -{' '}
                            <span className="font-medium text-foreground">
                                {logs.to ?? 0}
                            </span>{' '}
                            dari{' '}
                            <span className="font-medium text-foreground">
                                {logs.total}
                            </span>{' '}
                            activity
                        </p>
                        <div className="flex flex-wrap justify-end gap-2">
                            {logs.links.map((link, index) => (
                                <Button
                                    key={`${link.label}-${index}`}
                                    type="button"
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={link.url === null}
                                    onClick={() => {
                                        if (!link.url) {
                                            return;
                                        }

                                        router.visit(link.url, {
                                            preserveScroll: true,
                                            preserveState: true,
                                        });
                                    }}
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
