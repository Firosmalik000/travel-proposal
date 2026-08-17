import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import CustomerLayout from '@/layouts/customer-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CircleDollarSign,
    LockKeyhole,
    Pencil,
    Plus,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Participant = {
    id: number;
    full_name: string;
    gender: string | null;
    birth_place: string | null;
    birth_date: string | null;
    marital_status: string | null;
    address: string | null;
    shirt_size: string | null;
    passport_ready: boolean;
    passport_issue_date: string | null;
    passport_expiry_date: string | null;
    passport_type: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    medical_history_notes: string | null;
    referral_source: string | null;
};
type Payment = {
    id: number;
    payment_date: string;
    amount: number;
    payment_method: string;
    reference_number: string | null;
    notes: string | null;
};
type Booking = {
    id: number;
    booking_code: string;
    status: string;
    package_name: string;
    departure_date: string | null;
    return_date: string | null;
    passenger_count: number;
    participants_count: number;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    currency: string;
    participant_data_locked_at: string | null;
    participants: Participant[];
    payments: Payment[];
};
const money = (amount: number, currency: string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);

const emptyForm = {
    full_name: '',
    gender: '',
    birth_place: '',
    birth_date: '',
    marital_status: '',
    address: '',
    shirt_size: '',
    passport_ready: false,
    passport_issue_date: '',
    passport_expiry_date: '',
    passport_type: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    medical_history_notes: '',
    referral_source: '',
};

export default function BookingShow({ booking }: { booking: Booking }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Participant | null>(null);
    const form = useForm(emptyForm);
    const locked = Boolean(booking.participant_data_locked_at);
    const openForm = (participant?: Participant) => {
        setEditing(participant ?? null);
        form.setData(
            participant
                ? ({
                      ...emptyForm,
                      ...Object.fromEntries(
                          Object.entries(participant).map(([key, value]) => [
                              key,
                              value ?? '',
                          ]),
                      ),
                  } as typeof emptyForm)
                : emptyForm,
        );
        form.clearErrors();
        setOpen(true);
    };
    const submit = (event: FormEvent) => {
        event.preventDefault();
        const url = editing
            ? `/customer/bookings/${booking.id}/participants/${editing.id}`
            : `/customer/bookings/${booking.id}/participants`;
        form.post(url, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <CustomerLayout title={`Detail Booking ${booking.booking_code}`}>
            <Head title={`Booking ${booking.booking_code}`} />
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/customer">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
            </Button>
            <div className="rounded-[2rem] bg-[#183d37] p-6 text-white sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold tracking-[.18em] text-emerald-200 uppercase">
                            {booking.booking_code}
                        </p>
                        <h1 className="mt-2 font-serif text-3xl font-bold">
                            {booking.package_name}
                        </h1>
                        <p className="mt-2 text-emerald-50/75">
                            <CalendarDays className="mr-2 inline h-4 w-4" />
                            {booking.departure_date ??
                                'Jadwal menyusul'} sampai{' '}
                            {booking.return_date ?? '-'}
                        </p>
                    </div>
                    <Badge className="bg-[#e1b86a] text-[#3b2a0e]">
                        {booking.status}
                    </Badge>
                </div>
            </div>
            <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-3 bg-[#e8ddcc] dark:bg-[#202836]">
                    <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                    <TabsTrigger value="payments">Pembayaran</TabsTrigger>
                    <TabsTrigger value="participants">Peserta</TabsTrigger>
                </TabsList>
                <TabsContent
                    value="overview"
                    className="mt-5 grid gap-4 md:grid-cols-3"
                >
                    {[
                        [
                            'Total Tagihan',
                            money(booking.total_amount, booking.currency),
                        ],
                        [
                            'Sudah Dibayar',
                            money(booking.paid_amount, booking.currency),
                        ],
                        [
                            'Sisa Tagihan',
                            money(booking.remaining_amount, booking.currency),
                        ],
                    ].map(([a, b]) => (
                        <Card
                            key={a}
                            className="border-[#dfd3bf] bg-[#fffaf1] dark:border-[#334155] dark:bg-[#202836]"
                        >
                            <CardContent className="p-5">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {a}
                                </p>
                                <p className="mt-2 text-xl font-bold">{b}</p>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
                <TabsContent value="payments" className="mt-5">
                    <Card className="border-[#dfd3bf] bg-[#fffaf1] dark:border-[#334155] dark:bg-[#202836]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CircleDollarSign className="h-5 w-5 text-[#0d5c52]" />{' '}
                                Riwayat Pembayaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {booking.payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex flex-wrap justify-between gap-3 rounded-2xl border border-[#e3d7c4] p-4 dark:border-[#3b475a]"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {payment.payment_method}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {payment.payment_date}{' '}
                                            {payment.reference_number
                                                ? `· ${payment.reference_number}`
                                                : ''}
                                        </p>
                                    </div>
                                    <p className="font-bold text-[#0d5c52]">
                                        {money(
                                            payment.amount,
                                            booking.currency,
                                        )}
                                    </p>
                                </div>
                            ))}
                            {booking.payments.length === 0 && (
                                <p className="py-8 text-center text-slate-500 dark:text-slate-400">
                                    Belum ada pembayaran yang dicatat admin.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="participants" className="mt-5">
                    <Card className="border-[#dfd3bf] bg-[#fffaf1] dark:border-[#334155] dark:bg-[#202836]">
                        <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Data Peserta</CardTitle>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        {booking.participants_count} dari{' '}
                                        {booking.passenger_count} slot terisi
                                    </p>
                                </div>
                                {locked ? (
                                    <Badge variant="outline">
                                        <LockKeyhole className="mr-1 h-3 w-3" />{' '}
                                        Dikunci Admin
                                    </Badge>
                                ) : booking.participants_count <
                                  booking.passenger_count ? (
                                    <Button
                                        onClick={() => openForm()}
                                        className="bg-[#0d5c52]"
                                    >
                                        <Plus className="h-4 w-4" /> Tambah
                                        Peserta
                                    </Button>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {booking.participants.map((participant, index) => (
                                <div
                                    key={participant.id}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#e3d7c4] p-4 dark:border-[#3b475a]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-xl bg-[#ead8b8] p-2">
                                            <UserRound className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {index + 1}.{' '}
                                                {participant.full_name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {participant.birth_place ||
                                                    'Tempat lahir belum diisi'}{' '}
                                                ·{' '}
                                                {participant.passport_ready
                                                    ? 'Paspor siap'
                                                    : 'Paspor belum siap'}
                                            </p>
                                        </div>
                                    </div>
                                    {!locked && (
                                        <div className="flex gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() =>
                                                    openForm(participant)
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-rose-700"
                                                onClick={() =>
                                                    confirm(
                                                        'Hapus data peserta ini?',
                                                    ) &&
                                                    router.delete(
                                                        `/customer/bookings/${booking.id}/participants/${participant.id}`,
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <span />
                </SheetTrigger>
                <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>
                            {editing ? 'Ubah' : 'Tambah'} Data Peserta
                        </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={submit} className="mt-6 grid gap-4">
                        <div className="grid gap-2">
                            <Label>Nama lengkap</Label>
                            <Input
                                value={form.data.full_name}
                                onChange={(e) =>
                                    form.setData('full_name', e.target.value)
                                }
                                required
                            />
                            <InputError message={form.errors.full_name} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Jenis kelamin</Label>
                                <Select
                                    value={form.data.gender}
                                    onValueChange={(v) =>
                                        form.setData('gender', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">
                                            Laki-laki
                                        </SelectItem>
                                        <SelectItem value="female">
                                            Perempuan
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Tanggal lahir</Label>
                                <Input
                                    type="date"
                                    value={form.data.birth_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'birth_date',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Tempat lahir</Label>
                            <Input
                                value={form.data.birth_place}
                                onChange={(e) =>
                                    form.setData('birth_place', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Alamat</Label>
                            <Textarea
                                value={form.data.address}
                                onChange={(e) =>
                                    form.setData('address', e.target.value)
                                }
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Ukuran baju</Label>
                                <Input
                                    value={form.data.shirt_size}
                                    onChange={(e) =>
                                        form.setData(
                                            'shirt_size',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="M / L / XL"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Kontak darurat</Label>
                                <Input
                                    value={form.data.emergency_contact_phone}
                                    onChange={(e) =>
                                        form.setData(
                                            'emergency_contact_phone',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Nama kontak darurat</Label>
                            <Input
                                value={form.data.emergency_contact_name}
                                onChange={(e) =>
                                    form.setData(
                                        'emergency_contact_name',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <Button
                            disabled={form.processing}
                            className="mt-2 bg-[#0d5c52]"
                        >
                            {form.processing
                                ? 'Menyimpan...'
                                : 'Simpan Peserta'}
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>
        </CustomerLayout>
    );
}
