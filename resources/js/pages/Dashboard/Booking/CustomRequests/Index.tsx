import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Mail, MoreHorizontal, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type CustomRequestRow = {
    id: number;
    request_code: string;
    full_name: string;
    phone: string;
    email: string | null;
    origin_city: string;
    passenger_count: number;
    group_type: string;
    departure_month: string;
    departure_date: string | null;
    return_date: string | null;
    budget: number | null;
    focus: string;
    room_preference: string;
    notes: string | null;
    status: 'new' | 'approved' | 'rejected' | string;
    booking_id: number | null;
    created_at: string | null;
    approved_at: string | null;
    rejected_at?: string | null;
};

type PaginatedCustomRequests = {
    data: CustomRequestRow[];
    links: PaginationLink[];
    total: number;
    current_page?: number;
    last_page?: number;
};

type ApproveFormData = {
    passenger_count: string;
    origin_city: string;
    notes: string;
    custom_departure_date: string;
    custom_return_date: string;
    custom_unit_price: string;
};

function statusBadgeTone(status: string): string {
    if (status === 'approved') {
        return 'bg-emerald-100 text-emerald-700';
    }

    if (status === 'rejected') {
        return 'bg-rose-100 text-rose-700';
    }

    return 'bg-amber-100 text-amber-700';
}

function formatCurrencyIDR(value: number | null): string {
    if (value === null) {
        return '-';
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}

/* function scheduleLabel(schedule: any): string {
    const departure = schedule.departure_date ?? '-';
    const city = schedule.departure_city ?? '-';
    const seats = schedule.seats_available ?? '-';

    return `${departure} - ${city} - seat ${seats}`;
} */

const defaultApproveData: ApproveFormData = {
    passenger_count: '1',
    origin_city: '',
    notes: '',
    custom_departure_date: '',
    custom_return_date: '',
    custom_unit_price: '',
};

export default function CustomRequestsIndex({
    requests,
    filters,
}: {
    requests: PaginatedCustomRequests;
    filters: { search: string; status: string };
}) {
    const { can } = usePermission('booking_custom_requests');
    const canApprove = can('approve');
    const canReject = can('reject');
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status || 'all');
    const debouncedSearch = useDebounce(search, 350);

    const [activeRequest, setActiveRequest] = useState<CustomRequestRow | null>(
        null,
    );

    const form = useForm<ApproveFormData>(defaultApproveData);
    const computedTotalRevenue =
        (Number(form.data.passenger_count) || 0) *
        (Number(form.data.custom_unit_price) || 0);

    useEffect(() => {
        router.get(
            '/admin/booking-management/custom-requests',
            {
                search: debouncedSearch,
                status: status === 'all' ? '' : status,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }, [debouncedSearch, status]);

    function openApproveDrawer(request: CustomRequestRow) {
        if (!canApprove) {
            return;
        }

        setActiveRequest(request);
        form.clearErrors();
        form.setData({
            ...defaultApproveData,
            passenger_count: String(request.passenger_count || 1),
            origin_city: request.origin_city || '',
            notes: request.notes ?? '',
            custom_departure_date: request.departure_date ?? '',
            custom_return_date: request.return_date ?? '',
            custom_unit_price:
                request.budget && request.budget > 0
                    ? String(request.budget)
                    : '',
        });
    }

    function closeApproveDrawer() {
        setActiveRequest(null);
        form.reset();
        form.clearErrors();
    }

    function submitApproval() {
        if (!canApprove || !activeRequest) {
            return;
        }

        form.post(
            `/admin/booking-management/custom-requests/${activeRequest.id}/approve`,
            {
                preserveScroll: true,
                onSuccess: () => closeApproveDrawer(),
            },
        );
    }

    const statusCounts = {
        new: requests.data.filter((request) => request.status === 'new').length,
        approved: requests.data.filter(
            (request) => request.status === 'approved',
        ).length,
        rejected: requests.data.filter(
            (request) => request.status === 'rejected',
        ).length,
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Booking',
                    href: '/admin/booking-management/listing',
                },
                {
                    title: 'Custom Requests',
                    href: '/admin/booking-management/custom-requests',
                },
            ]}
        >
            <Head title="Custom Requests" />

            <div className="space-y-4 p-4 sm:p-5">
                <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                        Custom Umroh Requests
                    </h1>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="flex items-center justify-between p-3.5">
                            <div>
                                <p className="text-xs text-muted-foreground md:text-sm">
                                    Total Request
                                </p>
                                <p className="mt-1 text-xl font-semibold md:text-2xl">
                                    {requests.total}
                                </p>
                            </div>
                            <div className="rounded-full bg-muted p-2.5">
                                <Users className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-3.5">
                            <p className="text-xs text-muted-foreground md:text-sm">
                                New
                            </p>
                            <p className="mt-1 text-xl font-semibold md:text-2xl">
                                {statusCounts.new}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-3.5">
                            <p className="text-xs text-muted-foreground md:text-sm">
                                Approved
                            </p>
                            <p className="mt-1 text-xl font-semibold md:text-2xl">
                                {statusCounts.approved}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="p-3.5">
                            <p className="text-xs text-muted-foreground md:text-sm">
                                Rejected
                            </p>
                            <p className="mt-1 text-xl font-semibold md:text-2xl">
                                {statusCounts.rejected}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm md:grid-cols-[1fr_240px] md:items-end">
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari kode, nama, phone, kota..."
                            className="pl-9"
                        />
                    </div>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua status</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <Table className="min-w-[1200px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-14 text-center">
                                    No
                                </TableHead>
                                <TableHead className="w-20 text-right">
                                    Aksi
                                </TableHead>
                                <TableHead>Request</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Kontak</TableHead>
                                <TableHead>Pax</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Asal</TableHead>
                                <TableHead>Keberangkatan</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.data.map((request, index) => (
                                <TableRow
                                    key={request.id}
                                    className="align-top"
                                >
                                    <TableCell className="text-center text-sm text-muted-foreground">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="min-w-20 text-right">
                                        {request.status === 'new' ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="ml-auto"
                                                        aria-label={`Aksi ${request.request_code}`}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {canApprove ? (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openApproveDrawer(
                                                                    request,
                                                                )
                                                            }
                                                        >
                                                            <Check className="h-4 w-4" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                    {canReject ? (
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() => {
                                                                if (
                                                                    window.confirm(
                                                                        'Reject request ini?',
                                                                    )
                                                                ) {
                                                                    router.post(
                                                                        `/admin/booking-management/custom-requests/${request.id}/reject`,
                                                                        {},
                                                                        {
                                                                            preserveScroll: true,
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            Reject
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium text-foreground">
                                            {request.request_code}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium text-foreground">
                                            {request.full_name}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-muted-foreground">
                                            {request.phone}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {request.passenger_count} pax
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground capitalize">
                                            {request.group_type}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {request.origin_city}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {request.departure_month}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatCurrencyIDR(request.budget)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={statusBadgeTone(
                                                request.status,
                                            )}
                                        >
                                            {request.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {requests.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        Belum ada request yang cocok dengan
                                        filter ini.
                                    </TableCell>
                                </TableRow>
                            ) : null}
                        </TableBody>
                    </Table>

                    {requests.links.length > 3 ? (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border px-4 py-4">
                            {requests.links.map((link, index) =>
                                link.url ? (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => router.visit(link.url!)}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ) : (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            <Sheet
                open={activeRequest !== null}
                onOpenChange={(open) => !open && closeApproveDrawer()}
            >
                <SheetContent
                    side="right"
                    className="w-full overflow-y-auto border-l-0 bg-transparent p-0 shadow-none sm:max-w-[720px]"
                >
                    <div className="flex min-h-full flex-col bg-background">
                        <div className="border-b border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] px-4 py-5 sm:px-6 sm:py-6">
                            <SheetHeader className="p-0 pr-10">
                                <div className="mb-4 inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.24em] text-emerald-700 uppercase">
                                    Custom Approval
                                </div>
                                <SheetTitle className="text-2xl font-semibold tracking-tight text-foreground">
                                    {activeRequest?.request_code ??
                                        'Approve Request'}
                                </SheetTitle>
                                <SheetDescription className="mt-2 max-w-2xl text-sm leading-relaxed">
                                    Approve request ini untuk dibuat sebagai
                                    custom booking. Tidak akan masuk ke listing
                                    booking reguler.
                                </SheetDescription>
                            </SheetHeader>

                            {activeRequest ? (
                                <div className="mt-5 grid gap-3 md:grid-cols-3">
                                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm">
                                        <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                                            Harga Satuan
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-foreground">
                                            {formatCurrencyIDR(
                                                Number(
                                                    form.data.custom_unit_price,
                                                ) || 0,
                                            )}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Per pax (IDR)
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm">
                                        <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                                            Total Pax
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-foreground">
                                            {Number(
                                                form.data.passenger_count,
                                            ) || 0}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Akan dikali harga satuan
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm">
                                        <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                                            Total Revenue
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-foreground">
                                            {formatCurrencyIDR(
                                                computedTotalRevenue,
                                            )}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Otomatis (pax x harga satuan)
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex-1 bg-[linear-gradient(180deg,rgba(248,250,252,0.86),rgba(255,255,255,1))] px-4 py-5 sm:px-6 sm:py-6">
                            {activeRequest ? (
                                <form
                                    className="mx-auto max-w-2xl space-y-6 rounded-[2rem] border border-border/70 bg-card/96 p-5 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.28)] backdrop-blur"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        submitApproval();
                                    }}
                                >
                                    <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="font-semibold text-foreground">
                                                {activeRequest.request_code}
                                            </p>
                                            <Badge
                                                variant="secondary"
                                                className={statusBadgeTone(
                                                    activeRequest.status,
                                                )}
                                            >
                                                {activeRequest.status}
                                            </Badge>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-muted-foreground">
                                            <p>
                                                <strong className="text-foreground">
                                                    PIC:
                                                </strong>{' '}
                                                {activeRequest.full_name} -{' '}
                                                {activeRequest.phone}
                                                {activeRequest.email ? (
                                                    <>
                                                        {' '}
                                                        -{' '}
                                                        <span className="inline-flex items-center gap-1">
                                                            <Mail className="h-4 w-4" />
                                                            {
                                                                activeRequest.email
                                                            }
                                                        </span>
                                                    </>
                                                ) : null}
                                            </p>
                                            <p>
                                                <strong className="text-foreground">
                                                    Detail:
                                                </strong>{' '}
                                                {activeRequest.passenger_count}{' '}
                                                pax - {activeRequest.group_type}{' '}
                                                -{' '}
                                                {activeRequest.departure_month}{' '}
                                                -{' '}
                                                {activeRequest.room_preference}
                                            </p>
                                            <p>
                                                <strong className="text-foreground">
                                                    Tanggal:
                                                </strong>{' '}
                                                Berangkat{' '}
                                                {activeRequest.departure_date ??
                                                    '-'}{' '}
                                                | Pulang{' '}
                                                {activeRequest.return_date ??
                                                    '-'}
                                            </p>
                                            <p>
                                                <strong className="text-foreground">
                                                    Focus:
                                                </strong>{' '}
                                                {activeRequest.focus}
                                            </p>
                                            {activeRequest.notes ? (
                                                <p className="whitespace-pre-wrap">
                                                    <strong className="text-foreground">
                                                        Notes:
                                                    </strong>{' '}
                                                    {activeRequest.notes}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="grid gap-5">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label>
                                                    Tanggal berangkat (opsional)
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={
                                                        form.data
                                                            .custom_departure_date
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'custom_departure_date',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                {form.errors
                                                    .custom_departure_date ? (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            form.errors
                                                                .custom_departure_date
                                                        }
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>
                                                    Tanggal pulang (opsional)
                                                </Label>
                                                <Input
                                                    type="date"
                                                    value={
                                                        form.data
                                                            .custom_return_date
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'custom_return_date',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                {form.errors
                                                    .custom_return_date ? (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            form.errors
                                                                .custom_return_date
                                                        }
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label>
                                                    Harga satuan / pax (IDR)
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={
                                                        form.data
                                                            .custom_unit_price
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'custom_unit_price',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: 25000000"
                                                />
                                                {form.errors
                                                    .custom_unit_price ? (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            form.errors
                                                                .custom_unit_price
                                                        }
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>
                                                    Total revenue (otomatis)
                                                </Label>
                                                <Input
                                                    value={String(
                                                        computedTotalRevenue,
                                                    )}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label>Jumlah pax</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={
                                                        form.data
                                                            .passenger_count
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'passenger_count',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                {form.errors.passenger_count ? (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            form.errors
                                                                .passenger_count
                                                        }
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>
                                                    Kota keberangkatan
                                                </Label>
                                                <Input
                                                    value={
                                                        form.data.origin_city
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'origin_city',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                {form.errors.origin_city ? (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            form.errors
                                                                .origin_city
                                                        }
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>
                                                Catatan booking (opsional)
                                            </Label>
                                            <Textarea
                                                rows={4}
                                                value={form.data.notes}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Catatan yang akan masuk ke custom booking"
                                            />
                                            {form.errors.notes ? (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.notes}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <SheetFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={closeApproveDrawer}
                                            className="w-full sm:w-auto"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={form.processing}
                                            className="w-full sm:w-auto"
                                        >
                                            {form.processing
                                                ? 'Menyimpan...'
                                                : 'Approve & Buat Custom Booking'}
                                        </Button>
                                    </SheetFooter>
                                </form>
                            ) : null}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
