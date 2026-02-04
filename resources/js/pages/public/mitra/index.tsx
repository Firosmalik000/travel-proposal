import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

export default function Mitra() {
    return (
        <PublicLayout>
            <Head title="Mitra & Corporate">
                <meta name="description" content="Program kerja sama umroh untuk corporate dan komunitas." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6">
                <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">
                    Mitra, Corporate, & Komunitas
                </h1>
                <p className="mt-3 text-[var(--ink-700)]">Program kerja sama untuk kantor, komunitas, dan organisasi.</p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-[var(--ink-700)] shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]">
                    <p>
                        Kami menyediakan penawaran khusus untuk perjalanan rombongan dan corporate.
                        Hubungi tim kami untuk proposal lengkap dan jadwal briefing.
                    </p>
                    <a
                        href="https://wa.me/6281234567890"
                        className="mt-5 inline-flex items-center rounded-full bg-[var(--emerald-700)] px-6 py-3 text-sm font-semibold text-white"
                    >
                        Hubungi Tim Mitra
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}

