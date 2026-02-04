import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

export default function Custom() {
    return (
        <PublicLayout>
            <Head title="Custom Umroh">
                <meta name="description" content="Paket custom atau private umroh untuk keluarga dan komunitas." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6">
                <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">
                    Custom atau Private Umroh
                </h1>
                <p className="mt-3 text-[var(--ink-700)]">
                    Untuk keluarga, komunitas, atau corporate dengan kebutuhan khusus.
                </p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="rounded-3xl border border-white/70 bg-white/90 p-6 text-sm text-[var(--ink-700)] shadow-[0_16px_36px_rgba(31, 47, 77,0.12)]">
                    <p>
                        Kami menyesuaikan jadwal, hotel, maskapai, dan itinerary sesuai kebutuhan rombongan.
                        Hubungi admin untuk konsultasi paket custom dan penawaran khusus.
                    </p>
                    <a
                        href="https://wa.me/6281234567890"
                        className="mt-5 inline-flex items-center rounded-full bg-[var(--emerald-700)] px-6 py-3 text-sm font-semibold text-white"
                    >
                        Konsultasi WhatsApp
                    </a>
                </div>
            </section>
        </PublicLayout>
    );
}

