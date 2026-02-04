import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

const jobs = [
    { title: 'Customer Service', desc: 'Pengalaman 1 tahun di bidang pelayanan.' },
    { title: 'Tour Leader', desc: 'Pengalaman handling jamaah dan komunikasi baik.' },
    { title: 'Marketing Umroh', desc: 'Terbiasa dengan promosi digital dan offline.' },
];

export default function Karier() {
    return (
        <PublicLayout>
            <Head title="Karier">
                <meta name="description" content="Lowongan kerja di Amanah Haramain Travel." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6">
                <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">
                    Karier di Amanah Haramain
                </h1>
                <p className="mt-3 text-[var(--ink-700)]">Bergabung dengan tim yang melayani jamaah dengan amanah.</p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="grid gap-6 md:grid-cols-3">
                    {jobs.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]"
                        >
                            <h3 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">{item.title}</h3>
                            <p className="mt-2 text-sm text-[var(--ink-700)]">{item.desc}</p>
                            <button className="mt-4 rounded-full border border-[var(--emerald-700)] px-4 py-2 text-xs font-semibold text-[var(--emerald-900)]">
                                Lihat Detail
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}

