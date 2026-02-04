import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

const schedules = [
    { date: '10 Maret 2026', duration: '9 Hari', city: 'Jakarta', seat: '12' },
    { date: '15 April 2026', duration: '10 Hari', city: 'Surabaya', seat: '8' },
    { date: '05 Mei 2026', duration: '12 Hari', city: 'Jakarta', seat: '20' },
];

export default function Jadwal() {
    return (
        <PublicLayout>
            <Head title="Jadwal Keberangkatan">
                <meta name="description" content="Jadwal keberangkatan umroh 2026 dengan seat terbaru." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6">
                <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">
                    Jadwal Keberangkatan
                </h1>
                <p className="mt-3 text-[var(--ink-700)]">Daftar jadwal terbaru untuk keberangkatan umroh 2026.</p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/90 shadow-[0_14px_30px_rgba(31, 47, 77,0.12)]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[rgba(43, 69, 112,0.12)] text-[var(--emerald-900)]">
                            <tr>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3">Durasi</th>
                                <th className="px-4 py-3">Kota Keberangkatan</th>
                                <th className="px-4 py-3">Seat</th>
                                <th className="px-4 py-3">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((item) => (
                                <tr key={item.date} className="border-t border-[rgba(31, 47, 77,0.12)]">
                                    <td className="px-4 py-3">{item.date}</td>
                                    <td className="px-4 py-3">{item.duration}</td>
                                    <td className="px-4 py-3">{item.city}</td>
                                    <td className="px-4 py-3">{item.seat}</td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href="/paket-umroh/detail"
                                            className="rounded-full border border-[var(--emerald-700)] px-3 py-1 text-xs font-semibold text-[var(--emerald-900)]"
                                        >
                                            Detail Paket
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </PublicLayout>
    );
}

