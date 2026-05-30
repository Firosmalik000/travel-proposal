import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search } from 'lucide-react';
import { useState } from 'react';

type CurrencyItem = {
    code: string;
};

type Props = {
    currencies: CurrencyItem[];
    filters: {
        search: string;
    };
    stats: {
        total: number;
    };
};

export default function CurrenciesIndex({ currencies, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search);

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    label: 'Master Currency',
                    href: '/admin/master-data/currencies',
                },
            ]}
        >
            <Head title="Master Currency" />
            <div className="space-y-4 p-4 md:p-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                        Master Currency
                    </h1>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Total Currency
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value.toUpperCase())
                            }
                            placeholder="Cari kode currency..."
                            className="pl-10"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setSearch('');
                                router.get(
                                    '/admin/master-data/currencies',
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
                                    '/admin/master-data/currencies',
                                    { search },
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14 text-center">
                                        No
                                    </TableHead>
                                    <TableHead>Kode Currency</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currencies.length > 0 ? (
                                    currencies.map((item, index) => (
                                        <TableRow key={item.code}>
                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.code}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={2}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            Data currency belum tersedia.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
