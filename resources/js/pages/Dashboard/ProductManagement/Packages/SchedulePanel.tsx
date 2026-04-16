import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarPlus, Pencil, Trash2, Users, X, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import packages from '@/routes/packages';
import type { Package, Schedule, ScheduleFormData } from './types';

type Props = { pkg: Package };

const emptySchedule = (): ScheduleFormData => ({
    departure_date: '',
    return_date: '',
    departure_city: '',
    seats_total: 45,
    seats_available: 45,
    status: 'open',
    notes: '',
    is_active: true,
});

const statusConfig = {
    open: { label: 'Open', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', dot: 'bg-emerald-500' },
    full: { label: 'Full', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', dot: 'bg-amber-500' },
    closed: { label: 'Closed', icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', dot: 'bg-red-500' },
};

export function SchedulePanel({ pkg }: Props) {
    const [editingId, setEditingId] = useState<number | 'new' | null>(null);
    const form = useForm<ScheduleFormData>(emptySchedule());

    function openNew() {
        form.reset();
        form.setData(emptySchedule());
        setEditingId('new');
    }

    function openEdit(s: Schedule) {
        form.setData({
            departure_date: s.departure_date,
            return_date: s.return_date ?? '',
            departure_city: s.departure_city,
            seats_total: s.seats_total,
            seats_available: s.seats_available,
            status: s.status,
            notes: s.notes ?? '',
            is_active: s.is_active,
        });
        setEditingId(s.id);
    }

    function cancel() {
        setEditingId(null);
        form.reset();
    }

    function submit() {
        const url = editingId === 'new'
            ? packages.schedules.store(pkg.id).url
            : packages.schedules.update({ package: pkg.id, schedule: editingId as number }).url;
        form.post(url, {
            onSuccess: () => { toast.success(editingId === 'new' ? 'Jadwal ditambahkan.' : 'Jadwal diperbarui.'); cancel(); },
            onError: () => toast.error('Gagal menyimpan jadwal.'),
        });
    }

    function deleteSchedule(s: Schedule) {
        if (!confirm(`Hapus jadwal ${s.departure_date}?`)) return;
        form.delete(packages.schedules.destroy({ package: pkg.id, schedule: s.id }).url, {
            onSuccess: () => toast.success('Jadwal dihapus.'),
            onError: () => toast.error('Gagal menghapus jadwal.'),
        });
    }

    const sorted = [...pkg.schedules].sort((a, b) => a.departure_date.localeCompare(b.departure_date));

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex gap-3 text-sm">
                    {(['open', 'full', 'closed'] as const).map((s) => {
                        const count = pkg.schedules.filter((j) => j.status === s).length;
                        const cfg = statusConfig[s];
                        return count > 0 ? (
                            <span key={s} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                {count} {cfg.label}
                            </span>
                        ) : null;
                    })}
                    {pkg.schedules.length === 0 && <span className="text-xs text-muted-foreground">Belum ada jadwal</span>}
                </div>
                <Button size="sm" onClick={openNew} className="gap-1.5">
                    <CalendarPlus className="h-3.5 w-3.5" /> Tambah
                </Button>
            </div>

            {/* Inline form */}
            {editingId !== null && (
                <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">{editingId === 'new' ? '+ Jadwal Baru' : 'Edit Jadwal'}</p>
                        <button type="button" onClick={cancel} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="mb-1 block text-xs">Tgl Berangkat *</Label>
                            <Input type="date" value={form.data.departure_date} onChange={(e) => form.setData('departure_date', e.target.value)} />
                            {form.errors.departure_date && <p className="mt-1 text-xs text-destructive">{form.errors.departure_date}</p>}
                        </div>
                        <div>
                            <Label className="mb-1 block text-xs">Tgl Pulang</Label>
                            <Input type="date" value={form.data.return_date} onChange={(e) => form.setData('return_date', e.target.value)} />
                        </div>
                        <div>
                            <Label className="mb-1 block text-xs">Kota Keberangkatan *</Label>
                            <Input value={form.data.departure_city} onChange={(e) => form.setData('departure_city', e.target.value)} placeholder="Jakarta" />
                            {form.errors.departure_city && <p className="mt-1 text-xs text-destructive">{form.errors.departure_city}</p>}
                        </div>
                        <div>
                            <Label className="mb-1 block text-xs">Status *</Label>
                            <Select value={form.data.status} onValueChange={(v) => form.setData('status', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">✅ Open</SelectItem>
                                    <SelectItem value="full">⏳ Full</SelectItem>
                                    <SelectItem value="closed">🚫 Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-1 block text-xs">Total Seat *</Label>
                            <Input type="number" min={1} value={form.data.seats_total} onChange={(e) => form.setData('seats_total', +e.target.value)} />
                            {form.errors.seats_total && <p className="mt-1 text-xs text-destructive">{form.errors.seats_total}</p>}
                        </div>
                        <div>
                            <Label className="mb-1 block text-xs">Seat Tersedia *</Label>
                            <Input type="number" min={0} value={form.data.seats_available} onChange={(e) => form.setData('seats_available', +e.target.value)} />
                            {form.errors.seats_available && <p className="mt-1 text-xs text-destructive">{form.errors.seats_available}</p>}
                        </div>
                        <div className="col-span-2">
                            <Label className="mb-1 block text-xs">Catatan</Label>
                            <Input value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="Opsional..." />
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={cancel}>Batal</Button>
                        <Button size="sm" onClick={submit} disabled={form.processing}>
                            {form.processing ? 'Menyimpan...' : 'Simpan Jadwal'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Timeline list */}
            {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                    <CalendarPlus className="mb-2 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Belum ada jadwal keberangkatan.</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={openNew}>Tambah Jadwal Pertama</Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {sorted.map((s) => {
                        const cfg = statusConfig[s.status] ?? statusConfig.open;
                        const seatPct = s.seats_total > 0 ? Math.round((s.seats_available / s.seats_total) * 100) : 0;
                        const StatusIcon = cfg.icon;
                        return (
                            <div key={s.id} className={`group rounded-xl border bg-card p-3 transition-colors hover:bg-muted/30 ${!s.is_active ? 'opacity-50' : ''}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 rounded-lg p-1.5 ${cfg.bg}`}>
                                            <StatusIcon className={`h-4 w-4 ${cfg.color}`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{s.departure_date}</span>
                                                {s.return_date && <span className="text-xs text-muted-foreground">→ {s.return_date}</span>}
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">{s.departure_city}</p>
                                            {/* Seat bar */}
                                            <div className="mt-2 flex items-center gap-2">
                                                <Users className="h-3 w-3 text-muted-foreground" />
                                                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${seatPct > 50 ? 'bg-emerald-500' : seatPct > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${seatPct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {s.seats_available}/{s.seats_total} seat
                                                </span>
                                            </div>
                                            {s.notes && <p className="mt-1 text-xs italic text-muted-foreground">{s.notes}</p>}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(s)}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteSchedule(s)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
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
