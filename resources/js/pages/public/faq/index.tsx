import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

const faqs = [
    {
        q: 'Biaya sudah termasuk apa saja?',
        a: 'Termasuk tiket PP, visa, hotel, konsumsi, transport, manasik, dan pembimbing.',
    },
    {
        q: 'Syarat dokumen apa saja?',
        a: 'Paspor, KTP, KK, foto 4x6, dan dokumen tambahan jika dibutuhkan.',
    },
    {
        q: 'Kapan manasik dilakukan?',
        a: 'Manasik dilakukan sebelum keberangkatan, jadwal diinformasikan oleh admin.',
    },
    {
        q: 'Kebijakan refund atau reschedule?',
        a: 'Menyesuaikan ketentuan maskapai, hotel, dan vendor terkait.',
    },
    {
        q: 'Apakah ada pendamping lansia?',
        a: 'Ya, tersedia pendampingan lansia sesuai kebutuhan jamaah.',
    },
    {
        q: 'Berapa jarak hotel ke masjid?',
        a: 'Estimasi jarak diinformasikan pada detail paket.',
    },
];

export default function Faq() {
    return (
        <PublicLayout>
            <Head title="FAQ">
                <meta name="description" content="Pertanyaan yang sering ditanyakan seputar paket umroh." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6">
                <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">FAQ Umroh</h1>
                <p className="mt-3 text-[var(--ink-700)]">Jawaban ringkas untuk pertanyaan paling sering.</p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="space-y-3">
                    {faqs.map((item) => (
                        <details
                            key={item.q}
                            className="rounded-2xl border border-white/70 bg-white/90 px-5 py-4 shadow-[0_12px_30px_rgba(31, 47, 77,0.12)]"
                        >
                            <summary className="cursor-pointer text-sm font-semibold text-[var(--emerald-900)]">
                                {item.q}
                            </summary>
                            <p className="mt-2 text-sm text-[var(--ink-700)]">{item.a}</p>
                        </details>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}

