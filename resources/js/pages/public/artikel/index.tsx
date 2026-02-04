import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

const articles = [
    {
        title: 'Checklist Persiapan Umroh 2026',
        desc: 'Panduan dokumen, perlengkapan, dan persiapan fisik.',
    },
    {
        title: 'Tips Umroh Nyaman untuk Lansia',
        desc: 'Cara menjaga stamina, obat, dan pendampingan.',
    },
    {
        title: 'Memilih Paket Umroh Sesuai Budget',
        desc: 'Perbandingan fasilitas hemat, reguler, dan premium.',
    },
];

export default function Artikel() {
    return (
        <PublicLayout>
            <Head title="Artikel & Tips">
                <meta name="description" content="Artikel dan tips umroh untuk edukasi jamaah sebelum berangkat." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6">
                <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">
                    Artikel & Tips Umroh
                </h1>
                <p className="mt-3 text-[var(--ink-700)]">Edukasi ringan agar jamaah siap berangkat dengan tenang.</p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="grid gap-6 md:grid-cols-3">
                    {articles.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]"
                        >
                            <h3 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">{item.title}</h3>
                            <p className="mt-2 text-sm text-[var(--ink-700)]">{item.desc}</p>
                            <button className="mt-4 rounded-full border border-[var(--emerald-700)] px-4 py-2 text-xs font-semibold text-[var(--emerald-900)]">
                                Baca Artikel
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}

