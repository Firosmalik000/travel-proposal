import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

const services = [
    {
        title: 'Manasik terjadwal',
        desc: 'Online dan offline untuk kesiapan jamaah.',
    },
    {
        title: 'Visa dan handling',
        desc: 'Proses dokumen dibantu dari awal sampai selesai.',
    },
    {
        title: 'Tour leader',
        desc: 'Pendampingan selama perjalanan dan ibadah.',
    },
    {
        title: 'Perlengkapan',
        desc: 'Perlengkapan standar sesuai paket pilihan.',
    },
];

export default function Layanan() {
    return (
        <PublicLayout>
            <Head title="Layanan">
                <meta name="description" content="Layanan tambahan Amanah Haramain Travel untuk perjalanan umroh." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6">
                <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">Layanan Kami</h1>
                <p className="mt-3 text-[var(--ink-700)]">Layanan tambahan yang membuat perjalanan lebih nyaman.</p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="grid gap-4 md:grid-cols-2">
                    {services.map((item, idx) => (
                        <div
                            key={item.title}
                            className="flex items-start gap-4 rounded-2xl border border-white/70 bg-white/90 px-5 py-4 shadow-[0_12px_30px_rgba(31, 47, 77,0.12)]"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(43, 69, 112,0.12)] text-sm font-semibold text-[var(--emerald-900)]">
                                L{idx + 1}
                            </div>
                            <div>
                                <p className="public-heading text-base font-semibold text-[var(--emerald-900)]">{item.title}</p>
                                <p className="text-sm text-[var(--ink-700)]">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}

