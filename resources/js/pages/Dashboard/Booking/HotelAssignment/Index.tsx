import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { MoreHorizontal, Plus, SquarePen } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type Assignment = {
    id: number;
    travel_package_id: number;
    departure_schedule_id: number;
    hotel_id: number;
    status: string;
    notes: string | null;
    package_name: string;
    package_code: string;
    departure_date: string | null;
    departure_city: string | null;
    hotel_name: string | null;
    total_rooms: number;
    total_capacity: number;
    total_customers: number;
    rooms: Array<{
        room_type_id: number;
        room_type_name: string | null;
        room_count: number;
        room_capacity: number;
    }>;
};

type Option = { id: number; name: string; code?: string; product_id?: number };
type ScheduleOption = {
    id: number;
    travel_package_id: number;
    departure_date: string | null;
    departure_city: string | null;
};
type ScheduleStat = {
    travel_package_id: number;
    departure_schedule_id: number;
    total_bookings: number;
    total_customers: number;
};
type PackageStat = {
    travel_package_id: number;
    total_bookings: number;
    total_customers: number;
};

type FormData = {
    travel_package_id: string;
    departure_schedule_id: string;
    hotel_id: string;
    status: 'draft' | 'confirmed';
    notes: string;
    rooms: Array<{ room_type_id: string; room_count: string }>;
};

type Props = {
    assignments: Assignment[];
    packages: Option[];
    schedules: ScheduleOption[];
    hotels: Option[];
    roomTypes: Option[];
    filters: {
        travel_package_id: number | null;
        departure_schedule_id: number | null;
        hotel_id: number | null;
        status: string;
    };
    bookingSummary: { total_bookings: number; total_customers: number };
    bookingStatsBySchedule: ScheduleStat[];
    bookingStatsByPackage: PackageStat[];
    packageHotelOptions: Array<{
        travel_package_id: number;
        hotels: Option[];
    }>;
};

const roomCapacityByName = (name: string): number => {
    const normalized = name.toUpperCase();
    if (normalized.includes('DBL') || normalized.includes('DOUBLE')) {
        return 2;
    }
    if (normalized.includes('TRPL') || normalized.includes('TRIPLE')) {
        return 3;
    }
    if (normalized.includes('QUAD')) {
        return 4;
    }
    return 1;
};

const buildBlankRooms = (
    roomTypes: Option[],
): Array<{ room_type_id: string; room_count: string }> =>
    roomTypes.map((roomType) => ({
        room_type_id: String(roomType.id),
        room_count: '0',
    }));

const blankForm = (roomTypes: Option[]): FormData => ({
    travel_package_id: '',
    departure_schedule_id: '',
    hotel_id: '',
    status: 'draft',
    notes: '',
    rooms: buildBlankRooms(roomTypes),
});

const flattenErrorMessages = (input: unknown): string[] => {
    if (typeof input === 'string') {
        return input.trim() !== '' ? [input] : [];
    }

    if (Array.isArray(input)) {
        return input.flatMap((item) => flattenErrorMessages(item));
    }

    if (input && typeof input === 'object') {
        return Object.values(input as Record<string, unknown>).flatMap(
            (value) => flattenErrorMessages(value),
        );
    }

    return [];
};

export default function HotelAssignmentIndex({
    assignments,
    packages,
    schedules,
    hotels,
    roomTypes,
    filters,
    bookingSummary,
    bookingStatsBySchedule,
    bookingStatsByPackage,
    packageHotelOptions,
}: Props) {
    const { can } = usePermission('booking_hotel_assignment');
    const [editing, setEditing] = useState<Assignment | 'new' | null>(null);
    const [filterPackageId, setFilterPackageId] = useState(
        filters.travel_package_id ? String(filters.travel_package_id) : 'all',
    );
    const [filterScheduleId, setFilterScheduleId] = useState(
        filters.departure_schedule_id
            ? String(filters.departure_schedule_id)
            : 'all',
    );
    const [filterHotelId, setFilterHotelId] = useState(
        filters.hotel_id ? String(filters.hotel_id) : 'all',
    );
    const [filterStatus, setFilterStatus] = useState(filters.status || 'all');
    const form = useForm<FormData>(blankForm(roomTypes));

    const filteredScheduleOptions = useMemo(() => {
        if (form.data.travel_package_id === '') {
            return schedules;
        }
        return schedules.filter(
            (schedule) =>
                schedule.travel_package_id ===
                Number(form.data.travel_package_id),
        );
    }, [form.data.travel_package_id, schedules]);

    const selectedPackageStat = useMemo(
        () =>
            bookingStatsByPackage.find(
                (item) =>
                    item.travel_package_id ===
                    Number(form.data.travel_package_id),
            ),
        [bookingStatsByPackage, form.data.travel_package_id],
    );

    const selectedScheduleStat = useMemo(
        () =>
            bookingStatsBySchedule.find(
                (item) =>
                    item.departure_schedule_id ===
                    Number(form.data.departure_schedule_id),
            ),
        [bookingStatsBySchedule, form.data.departure_schedule_id],
    );

    const filteredHotelOptions = useMemo(() => {
        const selectedPackageId = Number(form.data.travel_package_id);
        if (!selectedPackageId) {
            return hotels;
        }

        const mappedHotels = packageHotelOptions.find(
            (item) => item.travel_package_id === selectedPackageId,
        );

        if (!mappedHotels) {
            return [];
        }

        return mappedHotels.hotels;
    }, [form.data.travel_package_id, hotels, packageHotelOptions]);

    const autoSelectedHotel = filteredHotelOptions[0] ?? null;
    const selectedHotelOption =
        filteredHotelOptions.find(
            (item) => String(item.id) === form.data.hotel_id,
        ) ?? autoSelectedHotel;

    const estimatedCapacity = useMemo(() => {
        return form.data.rooms.reduce((total, room) => {
            const roomType = roomTypes.find(
                (item) => String(item.id) === room.room_type_id,
            );
            const roomCapacity = roomCapacityByName(roomType?.name ?? '');
            return total + Number(room.room_count || 0) * roomCapacity;
        }, 0);
    }, [form.data.rooms, roomTypes]);

    const selectedCustomerTarget = selectedScheduleStat?.total_customers ?? 0;
    const selectedRoomAllocations = useMemo(
        () =>
            form.data.rooms
                .map((room) => {
                    const roomType = roomTypes.find(
                        (item) => String(item.id) === room.room_type_id,
                    );
                    const capacity = roomCapacityByName(roomType?.name ?? '');
                    const roomCount = Number(room.room_count || 0);

                    return {
                        roomTypeName: roomType?.name ?? '-',
                        roomCount,
                        capacity,
                        totalPax: roomCount * capacity,
                    };
                })
                .filter((item) => item.roomCount > 0),
        [form.data.rooms, roomTypes],
    );
    const validationErrors = useMemo(() => {
        return Object.values(form.errors)
            .flatMap((value) => (Array.isArray(value) ? value : [value]))
            .filter((value): value is string => typeof value === 'string');
    }, [form.errors]);

    function applyFilters(): void {
        router.get(
            '/admin/booking-management/hotel-assignment',
            {
                travel_package_id:
                    filterPackageId === 'all' ? undefined : filterPackageId,
                departure_schedule_id:
                    filterScheduleId === 'all' ? undefined : filterScheduleId,
                hotel_id: filterHotelId === 'all' ? undefined : filterHotelId,
                status: filterStatus === 'all' ? undefined : filterStatus,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function openCreate(): void {
        form.setData(blankForm(roomTypes));
        form.clearErrors();
        setEditing('new');
    }

    function openCreateFromScheduleStat(stat: ScheduleStat): void {
        const mappedHotels =
            packageHotelOptions.find(
                (item) => item.travel_package_id === stat.travel_package_id,
            )?.hotels ?? [];

        form.setData({
            ...blankForm(roomTypes),
            travel_package_id: String(stat.travel_package_id),
            departure_schedule_id: String(stat.departure_schedule_id),
            hotel_id: mappedHotels[0] ? String(mappedHotels[0].id) : '',
        });
        form.clearErrors();
        setEditing('new');
    }

    function openEdit(assignment: Assignment): void {
        const roomCountMap = new Map(
            assignment.rooms.map((room) => [
                String(room.room_type_id),
                String(room.room_count),
            ]),
        );

        form.setData({
            travel_package_id: String(assignment.travel_package_id),
            departure_schedule_id: String(assignment.departure_schedule_id),
            hotel_id: String(assignment.hotel_id),
            status: assignment.status === 'confirmed' ? 'confirmed' : 'draft',
            notes: assignment.notes ?? '',
            rooms: roomTypes.map((roomType) => ({
                room_type_id: String(roomType.id),
                room_count: roomCountMap.get(String(roomType.id)) ?? '0',
            })),
        });
        form.clearErrors();
        setEditing(assignment);
    }

    function submit(event: React.FormEvent): void {
        event.preventDefault();

        const payload = {
            ...form.data,
            rooms: form.data.rooms.filter(
                (room) => Number(room.room_count || 0) > 0,
            ),
        };

        if (!payload.hotel_id) {
            toast.error('Hotel belum tersedia untuk package ini.');
            form.setError(
                'hotel_id',
                'Hotel belum tersedia untuk package ini.',
            );
            return;
        }

        if (payload.rooms.length === 0) {
            toast.error('Isi minimal 1 alokasi kamar.');
            form.setError('rooms', 'Isi minimal 1 alokasi kamar.');
            return;
        }

        if (editing === 'new') {
            router.post('/admin/booking-management/hotel-assignment', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Hotel assignment berhasil disimpan.');
                    setEditing(null);
                },
                onError: (errors) => {
                    const firstError = flattenErrorMessages(errors)[0];
                    toast.error(
                        firstError ??
                            'Gagal menyimpan hotel assignment. Periksa data alokasi.',
                    );
                },
            });
            return;
        }
        if (editing) {
            router.put(
                `/admin/booking-management/hotel-assignment/${editing.id}`,
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Hotel assignment berhasil diperbarui.');
                        setEditing(null);
                    },
                    onError: (errors) => {
                        const firstError = flattenErrorMessages(errors)[0];
                        toast.error(
                            firstError ??
                                'Gagal update hotel assignment. Periksa data alokasi.',
                        );
                    },
                },
            );
        }
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                {
                    title: 'Booking Management',
                    href: '/admin/booking-management/listing',
                },
                {
                    title: 'Hotel Assignment',
                    href: '/admin/booking-management/hotel-assignment',
                },
            ]}
        >
            <Head title="Hotel Assignment" />
            <div className="space-y-4 p-4 md:p-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                            Hotel Assignment
                        </h1>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Total Booking
                        </p>
                        <p className="mt-1 text-xl font-semibold md:text-2xl">
                            {bookingSummary.total_bookings}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            Total Customer
                        </p>
                        <p className="mt-1 text-xl font-semibold md:text-2xl">
                            {bookingSummary.total_customers}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-12">
                        <div className="lg:col-span-3">
                            <Select
                                value={filterPackageId}
                                onValueChange={setFilterPackageId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih package" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua package
                                    </SelectItem>
                                    {packages.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.code} - {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="lg:col-span-3">
                            <Select
                                value={filterScheduleId}
                                onValueChange={setFilterScheduleId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jadwal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua jadwal
                                    </SelectItem>
                                    {schedules.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.departure_date} -{' '}
                                            {item.departure_city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="lg:col-span-3">
                            <Select
                                value={filterHotelId}
                                onValueChange={setFilterHotelId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih hotel" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua hotel
                                    </SelectItem>
                                    {hotels.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="lg:col-span-3">
                            <Select
                                value={filterStatus}
                                onValueChange={setFilterStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua status
                                    </SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="confirmed">
                                        Confirmed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setFilterPackageId('all');
                                setFilterScheduleId('all');
                                setFilterHotelId('all');
                                setFilterStatus('all');
                                router.get(
                                    '/admin/booking-management/hotel-assignment',
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
                        <Button type="button" onClick={applyFilters}>
                            Terapkan
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[1100px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-14 text-center">
                                        No
                                    </TableHead>
                                    <TableHead className="w-20 text-right">
                                        Aksi
                                    </TableHead>
                                    <TableHead>Package</TableHead>
                                    <TableHead>Jadwal</TableHead>
                                    <TableHead>Total Booking</TableHead>
                                    <TableHead>Total Customer</TableHead>
                                    <TableHead>Hotel Assigned</TableHead>
                                    <TableHead>Total Room</TableHead>
                                    <TableHead>Total Kapasitas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookingStatsBySchedule.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            Belum ada booking dengan package +
                                            jadwal.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bookingStatsBySchedule.map(
                                        (stat, index) => {
                                            const pkg = packages.find(
                                                (item) =>
                                                    item.id ===
                                                    stat.travel_package_id,
                                            );
                                            const sch = schedules.find(
                                                (item) =>
                                                    item.id ===
                                                    stat.departure_schedule_id,
                                            );
                                            const relatedAssignments =
                                                assignments.filter(
                                                    (assignment) =>
                                                        assignment.travel_package_id ===
                                                            stat.travel_package_id &&
                                                        assignment.departure_schedule_id ===
                                                            stat.departure_schedule_id,
                                                );
                                            const assignedHotelCount =
                                                relatedAssignments.length;
                                            const assignedRoomTotal =
                                                relatedAssignments.reduce(
                                                    (total, assignment) =>
                                                        total +
                                                        assignment.total_rooms,
                                                    0,
                                                );
                                            const assignedCapacityTotal =
                                                relatedAssignments.reduce(
                                                    (total, assignment) =>
                                                        total +
                                                        assignment.total_capacity,
                                                    0,
                                                );

                                            return (
                                                <TableRow
                                                    key={`${stat.travel_package_id}-${stat.departure_schedule_id}`}
                                                >
                                                    <TableCell className="text-center text-sm text-muted-foreground">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {relatedAssignments.length ===
                                                        0 ? (
                                                            <Button
                                                                size="sm"
                                                                onClick={() =>
                                                                    openCreateFromScheduleStat(
                                                                        stat,
                                                                    )
                                                                }
                                                            >
                                                                Assign
                                                            </Button>
                                                        ) : (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="ml-auto"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {relatedAssignments.map(
                                                                        (
                                                                            assignment,
                                                                        ) => (
                                                                            <DropdownMenuItem
                                                                                key={
                                                                                    assignment.id
                                                                                }
                                                                                onClick={() =>
                                                                                    openEdit(
                                                                                        assignment,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <SquarePen className="mr-2 h-4 w-4" />
                                                                                Edit
                                                                            </DropdownMenuItem>
                                                                        ),
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-medium">
                                                            {pkg?.name ?? '-'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {pkg?.code ?? '-'}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {sch?.departure_date ??
                                                            '-'}{' '}
                                                        -{' '}
                                                        {sch?.departure_city ??
                                                            '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {stat.total_bookings}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {stat.total_customers}
                                                    </TableCell>
                                                    <TableCell>
                                                        {assignedHotelCount ===
                                                        0 ? (
                                                            <span className="text-xs text-muted-foreground">
                                                                Belum ada
                                                                assignment
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                {
                                                                    assignedHotelCount
                                                                }
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {assignedRoomTotal}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {assignedCapacityTotal}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        },
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <Sheet
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle>
                            {editing === 'new' ? 'Tambah' : 'Edit'} Hotel
                            Assignment
                        </SheetTitle>
                    </SheetHeader>
                    <form className="mt-6 space-y-4" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label>Package</Label>
                            <Select
                                value={form.data.travel_package_id}
                                onValueChange={(value) => {
                                    form.setData((prev) => ({
                                        ...prev,
                                        travel_package_id: value,
                                        departure_schedule_id: '',
                                        hotel_id: (() => {
                                            const firstHotel =
                                                packageHotelOptions.find(
                                                    (item) =>
                                                        item.travel_package_id ===
                                                        Number(value),
                                                )?.hotels[0];
                                            return firstHotel
                                                ? String(firstHotel.id)
                                                : '';
                                        })(),
                                    }));
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih package" />
                                </SelectTrigger>
                                <SelectContent>
                                    {packages.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.code} - {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Jadwal Keberangkatan</Label>
                            <Select
                                value={form.data.departure_schedule_id}
                                onValueChange={(value) =>
                                    form.setData('departure_schedule_id', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih jadwal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredScheduleOptions.map((item) => (
                                        <SelectItem
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.departure_date} -{' '}
                                            {item.departure_city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Hotel</Label>
                            {filteredHotelOptions.length <= 1 ? (
                                <Input
                                    readOnly
                                    value={
                                        selectedHotelOption
                                            ? `${selectedHotelOption.name}${selectedHotelOption.code ? ` (${selectedHotelOption.code})` : ''}`
                                            : 'Belum ada hotel terhubung'
                                    }
                                />
                            ) : (
                                <Select
                                    value={form.data.hotel_id}
                                    onValueChange={(value) =>
                                        form.setData('hotel_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih hotel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredHotelOptions.map((item) => (
                                            <SelectItem
                                                key={item.id}
                                                value={String(item.id)}
                                            >
                                                {item.name}
                                                {item.code
                                                    ? ` (${item.code})`
                                                    : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {form.data.travel_package_id !== '' &&
                                filteredHotelOptions.length === 0 && (
                                    <p className="text-xs text-amber-600">
                                        Belum ada hotel aktif yang terhubung ke
                                        product hotel pada package ini.
                                    </p>
                                )}
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(value) =>
                                    form.setData(
                                        'status',
                                        value as 'draft' | 'confirmed',
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="confirmed">
                                        Confirmed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Room Allocation per Tipe</Label>
                            <div className="space-y-2">
                                {form.data.rooms.map((room, index) => {
                                    const roomType = roomTypes.find(
                                        (item) =>
                                            String(item.id) ===
                                            room.room_type_id,
                                    );
                                    const roomCapacity = roomCapacityByName(
                                        roomType?.name ?? '',
                                    );

                                    return (
                                        <div
                                            key={room.room_type_id}
                                            className="grid grid-cols-6 items-center gap-2"
                                        >
                                            <div className="col-span-3 text-sm">
                                                {roomType?.name ?? '-'}
                                                <div className="text-xs text-muted-foreground">
                                                    kapasitas {roomCapacity}{' '}
                                                    pax/room
                                                </div>
                                            </div>
                                            <Input
                                                className="col-span-2"
                                                type="number"
                                                min={0}
                                                value={room.room_count}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'rooms',
                                                        form.data.rooms.map(
                                                            (
                                                                item,
                                                                itemIndex,
                                                            ) =>
                                                                itemIndex ===
                                                                index
                                                                    ? {
                                                                          ...item,
                                                                          room_count:
                                                                              event
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : item,
                                                        ),
                                                    )
                                                }
                                            />
                                            <div className="col-span-1 text-xs text-muted-foreground">
                                                =
                                                {Number(room.room_count || 0) *
                                                    roomCapacity}{' '}
                                                pax
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {selectedCustomerTarget > 0 &&
                            estimatedCapacity < selectedCustomerTarget && (
                                <Alert>
                                    <AlertDescription>
                                        Warning: kapasitas kamar (
                                        {estimatedCapacity}) masih kurang dari
                                        total customer jadwal ini (
                                        {selectedCustomerTarget}).
                                    </AlertDescription>
                                </Alert>
                            )}
                        {validationErrors.length > 0 && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    <ul className="list-disc pl-5">
                                        {validationErrors.map((message) => (
                                            <li key={message}>{message}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                        {selectedRoomAllocations.length > 0 && (
                            <div className="rounded-md border p-3">
                                <div className="mb-2 text-sm font-medium">
                                    Ringkasan Allocation
                                </div>
                                <div className="space-y-1 text-sm">
                                    {selectedRoomAllocations.map((item) => (
                                        <div
                                            key={item.roomTypeName}
                                            className="flex items-center justify-between"
                                        >
                                            <span>
                                                {item.roomTypeName} -{' '}
                                                {item.roomCount} room
                                            </span>
                                            <span>{item.totalPax} pax</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="rounded-md border p-3 text-sm">
                            Total kapasitas assignment:{' '}
                            <strong>{estimatedCapacity}</strong> pax
                        </div>
                        <div className="grid gap-2">
                            <Label>Catatan</Label>
                            <Textarea
                                value={form.data.notes}
                                onChange={(event) =>
                                    form.setData('notes', event.target.value)
                                }
                            />
                        </div>
                        {form.errors.rooms && (
                            <p className="text-sm text-destructive">
                                {form.errors.rooms}
                            </p>
                        )}
                        {form.errors.hotel_id && (
                            <p className="text-sm text-destructive">
                                {form.errors.hotel_id}
                            </p>
                        )}
                        <Button type="submit" disabled={form.processing}>
                            Simpan
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>
        </AppSidebarLayout>
    );
}
