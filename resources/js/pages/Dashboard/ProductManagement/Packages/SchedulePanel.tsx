import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePermission } from '@/hooks/use-permission';
import packages from '@/routes/packages';
import { useForm } from '@inertiajs/react';
import {
    CalendarPlus,
    CheckCircle2,
    Clock,
    Pencil,
    Trash2,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Package, Schedule, ScheduleFormData } from './types';

type Props = { pkg: Package };

const emptySchedule = (): ScheduleFormData => ({
    departure_date: '',
    return_date: '',
    departure_city: '',
    seats_total: 45,
    status: 'open',
    notes: '',
    is_active: true,
});

const statusConfig = {
    open: {
        label: 'Open',
        icon: CheckCircle2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        dot: 'bg-emerald-500',
    },
    full: {
        label: 'Full',
        icon: Clock,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        dot: 'bg-amber-500',
    },
    closed: {
        label: 'Closed',
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/40',
        dot: 'bg-red-500',
    },
} as const;

export function SchedulePanel({ pkg }: Props) {
    const { can } = usePermission('package');
    const canCreate = can('create');
    const canEdit = can('edit');
    const canDelete = can('delete');
    const [editingId, setEditingId] = useState<number | 'new' | null>(null);
    const form = useForm<ScheduleFormData>(emptySchedule());
    const schedules = Array.isArray(pkg.schedules) ? pkg.schedules : [];
    const cityOptions = Array.from(
        new Set(
            [
                pkg.departure_city,
                ...schedules.map((schedule) => schedule.departure_city),
                'Jakarta',
                'Surabaya',
                'Bandung',
                'Medan',
                'Makassar',
                'Yogyakarta',
            ]
                .map((value) => String(value ?? '').trim())
                .filter(Boolean),
        ),
    );

    const selectedCity = cityOptions.includes(form.data.departure_city)
        ? form.data.departure_city
        : 'custom';

    function openNew() {
        if (!canCreate) {
            return;
        }

        form.reset();
        form.clearErrors();
        form.setData({
            ...emptySchedule(),
            departure_city: pkg.departure_city ?? '',
        });
        setEditingId('new');
    }

    function openEdit(schedule: Schedule) {
        if (!canEdit) {
            return;
        }

        form.clearErrors();
        form.setData({
            departure_date: schedule.departure_date,
            return_date: schedule.return_date ?? '',
            departure_city: schedule.departure_city,
            seats_total: schedule.seats_total,
            status: schedule.status,
            notes: schedule.notes ?? '',
            is_active: schedule.is_active,
        });
        setEditingId(schedule.id);
    }

    function cancel() {
        setEditingId(null);
        form.reset();
        form.clearErrors();
    }

    function submit() {
        const url =
            editingId === 'new'
                ? packages.schedules.store(pkg.id).url
                : packages.schedules.update({
                      package: pkg.id,
                      schedule: editingId as number,
                  }).url;

        form.post(url, {
            onSuccess: () => {
                toast.success(
                    editingId === 'new'
                        ? 'Jadwal ditambahkan.'
                        : 'Jadwal diperbarui.',
                );
                cancel();
            },
            onError: () => toast.error('Gagal menyimpan jadwal.'),
        });
    }

    function deleteSchedule(schedule: Schedule) {
        if (!canDelete) {
            return;
        }

        if (!confirm(`Hapus jadwal ${schedule.departure_date}?`)) {
            return;
        }

        form.delete(
            packages.schedules.destroy({
                package: pkg.id,
                schedule: schedule.id,
            }).url,
            {
                onSuccess: () => toast.success('Jadwal dihapus.'),
                onError: () => toast.error('Gagal menghapus jadwal.'),
            },
        );
    }

    const sorted = [...schedules].sort((a, b) =>
        a.departure_date.localeCompare(b.departure_date),
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex gap-3 text-sm">
                    {(['open', 'full', 'closed'] as const).map((status) => {
                        const count = schedules.filter(
                            (schedule) => schedule.status === status,
                        ).length;
                        const config = statusConfig[status];

                        return count > 0 ? (
                            <span
                                key={status}
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                                />
                                {count} {config.label}
                            </span>
                        ) : null;
                    })}
                    {schedules.length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                            Belum ada jadwal
                        </span>
                    ) : null}
                </div>
                {canCreate ? (
                    <Button size="sm" onClick={openNew} className="gap-1.5">
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Tambah
                    </Button>
                ) : null}
            </div>

            {editingId !== null ? (
                <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">
                            {editingId === 'new'
                                ? '+ Jadwal Baru'
                                : 'Edit Jadwal'}
                        </p>
                        <button
                            type="button"
                            onClick={cancel}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="mb-1 block text-xs">
                                Tgl Berangkat *
                            </Label>
                            <Input
                                type="date"
                                value={form.data.departure_date}
                                onChange={(event) =>
                                    form.setData(
                                        'departure_date',
                                        event.target.value,
                                    )
                                }
                            />
                            {form.errors.departure_date ? (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.departure_date}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <Label className="mb-1 block text-xs">
                                Tgl Pulang
                            </Label>
                            <Input
                                type="date"
                                value={form.data.return_date}
                                onChange={(event) =>
                                    form.setData(
                                        'return_date',
                                        event.target.value,
                                    )
                                }
                            />
                            {form.errors.return_date ? (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.return_date}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <Label className="mb-1 block text-xs">
                                Kota Keberangkatan *
                            </Label>
                            <Select
                                value={selectedCity}
                                onValueChange={(value) => {
                                    if (value === 'custom') {
                                        form.setData('departure_city', '');

                                        return;
                                    }

                                    form.setData('departure_city', value);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kota" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cityOptions.map((city) => (
                                        <SelectItem key={city} value={city}>
                                            {city}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="custom">
                                        Tulis manual...
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {selectedCity === 'custom' ? (
                                <Input
                                    className="mt-2"
                                    value={form.data.departure_city}
                                    onChange={(event) =>
                                        form.setData(
                                            'departure_city',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Jakarta"
                                />
                            ) : null}
                            {form.errors.departure_city ? (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.departure_city}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <Label className="mb-1 block text-xs">
                                Status *
                            </Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(value) =>
                                    form.setData('status', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="full">Full</SelectItem>
                                    <SelectItem value="closed">
                                        Closed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.status ? (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.status}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <Label className="mb-1 block text-xs">
                                Total Seat *
                            </Label>
                            <Input
                                type="number"
                                min={1}
                                value={form.data.seats_total}
                                onChange={(event) =>
                                    form.setData(
                                        'seats_total',
                                        Number(event.target.value || 0),
                                    )
                                }
                            />
                            {form.errors.seats_total ? (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.seats_total}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <Label className="mb-1 block text-xs">
                                Seat Tersedia
                            </Label>
                            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                                Otomatis dihitung dari total seat dikurangi
                                total pax booking pada jadwal ini.
                            </div>
                        </div>

                        <div className="col-span-2">
                            <Label className="mb-1 block text-xs">
                                Catatan
                            </Label>
                            <Input
                                value={form.data.notes}
                                onChange={(event) =>
                                    form.setData('notes', event.target.value)
                                }
                                placeholder="Opsional..."
                            />
                            {form.errors.notes ? (
                                <p className="mt-1 text-xs text-destructive">
                                    {form.errors.notes}
                                </p>
                            ) : null}
                        </div>

                        <div className="col-span-2 flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
                            <Checkbox
                                checked={form.data.is_active}
                                onCheckedChange={(checked) =>
                                    form.setData('is_active', checked === true)
                                }
                            />
                            <div>
                                <p className="text-sm font-medium">
                                    Jadwal aktif
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Jadwal nonaktif tidak tampil di daftar
                                    publik.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={cancel}>
                            Batal
                        </Button>
                        <Button
                            size="sm"
                            onClick={submit}
                            disabled={form.processing}
                        >
                            {form.processing ? 'Menyimpan...' : 'Simpan Jadwal'}
                        </Button>
                    </div>
                </div>
            ) : null}

            {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                    <CalendarPlus className="mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        Belum ada jadwal keberangkatan.
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={openNew}
                    >
                        Tambah Jadwal Pertama
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {sorted.map((schedule) => {
                        const config =
                            statusConfig[schedule.status] ?? statusConfig.open;
                        const seatPct =
                            schedule.seats_total > 0
                                ? Math.round(
                                      (schedule.seats_available /
                                          schedule.seats_total) *
                                          100,
                                  )
                                : 0;
                        const StatusIcon = config.icon;

                        return (
                            <div
                                key={schedule.id}
                                className={`group rounded-xl border bg-card p-3 transition-colors hover:bg-muted/30 ${!schedule.is_active ? 'opacity-50' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`mt-0.5 rounded-lg p-1.5 ${config.bg}`}
                                        >
                                            <StatusIcon
                                                className={`h-4 w-4 ${config.color}`}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">
                                                    {schedule.departure_date}
                                                </span>
                                                {schedule.return_date ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        {'-> '}
                                                        {schedule.return_date}
                                                    </span>
                                                ) : null}
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}
                                                >
                                                    {config.label}
                                                </span>
                                                {!schedule.is_active ? (
                                                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                        Nonaktif
                                                    </span>
                                                ) : null}
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {schedule.departure_city}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Users className="h-3 w-3 text-muted-foreground" />
                                                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${seatPct > 50 ? 'bg-emerald-500' : seatPct > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{
                                                            width: `${seatPct}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {schedule.seats_available}/
                                                    {schedule.seats_total} seat
                                                </span>
                                            </div>
                                            {schedule.notes ? (
                                                <p className="mt-1 text-xs text-muted-foreground italic">
                                                    {schedule.notes}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                        {canEdit ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0"
                                                onClick={() =>
                                                    openEdit(schedule)
                                                }
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                        ) : null}
                                        {canDelete ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    deleteSchedule(schedule)
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
