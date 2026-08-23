import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AgentLayout from '@/layouts/agent-layout';
import { formatDate } from '@/lib/date-format';
import { Head } from '@inertiajs/react';
import { CalendarDays, MapPin } from 'lucide-react';
import { PageIntro, ReferralShare } from './components/PortalUi';
import { money } from './types';

type Fee = {
    id: number;
    package_code: string | null;
    package_name: string | null;
    image_path: string | null;
    departure_date: string | null;
    return_date: string | null;
    departure_city: string | null;
    price: number;
    currency: string;
    booking_status: string;
    fee_type: 'fixed' | 'percentage';
    fee_value: number;
    referral_url: string;
    qr_url: string;
};

export default function Packages({
    agent,
    fees,
}: {
    agent: { referral_code: string };
    fees: Fee[];
}) {
    return (
        <AgentLayout title="Fee Package">
            <Head title="Fee Package" />
            <PageIntro
                eyebrow="Campaign Catalog"
                title="Package untuk Dipromosikan"
                description={`Pilih package aktif, lihat potensi fee, lalu bagikan link yang sudah terhubung ke kode ${agent.referral_code}.`}
            />
            <section className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {fees.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 py-14 text-center text-sm text-slate-500 dark:border-slate-700">
                        Belum ada fee package aktif untuk akun Anda.
                    </div>
                ) : (
                    fees.map((fee) => (
                        <Card
                            key={fee.id}
                            className="overflow-hidden border-slate-200 dark:border-slate-700"
                        >
                            {fee.image_path ? (
                                <img
                                    src={`/storage/${fee.image_path}`}
                                    alt=""
                                    className="h-40 w-full object-cover"
                                />
                            ) : (
                                <div className="h-28 bg-[linear-gradient(135deg,#0d5c52,#d9b66f)]" />
                            )}
                            <CardContent className="grid gap-4 p-4 sm:p-5">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {fee.package_code}
                                        </Badge>
                                        <Badge>
                                            {fee.booking_status === 'open'
                                                ? 'Pendaftaran dibuka'
                                                : fee.booking_status}
                                        </Badge>
                                    </div>
                                    <h2 className="mt-3 font-serif text-xl font-bold">
                                        {fee.package_name}
                                    </h2>
                                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <CalendarDays className="size-3.5" />{' '}
                                            {formatDate(fee.departure_date)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="size-3.5" />{' '}
                                            {fee.departure_city ??
                                                'Kota menyusul'}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900/50">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Harga package
                                        </p>
                                        <p className="font-semibold">
                                            {money(fee.price, fee.currency)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Fee Anda
                                        </p>
                                        <p className="font-bold text-[#0d5c52] dark:text-emerald-300">
                                            {fee.fee_type === 'fixed'
                                                ? `${money(fee.fee_value, fee.currency)} / pax`
                                                : `${fee.fee_value}%`}
                                        </p>
                                    </div>
                                </div>
                                <ReferralShare
                                    url={fee.referral_url}
                                    qrUrl={fee.qr_url}
                                    compact
                                />
                            </CardContent>
                        </Card>
                    ))
                )}
            </section>
        </AgentLayout>
    );
}
