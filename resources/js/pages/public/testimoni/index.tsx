import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

const testimonials = [
    {
        quote: 'Pelayanan rapi dari awal. Manasik jelas, hotel sesuai info, dan pembimbing sabar.',
        name: 'Ibu Siti, Bandung',
        paket: 'Paket Reguler 10 Hari',
        image: 'https://source.unsplash.com/0F0E8fG8rvU/800x800',
    },
    {
        quote: 'Admin cepat respon. Kami lansia dibantu dari bandara sampai pulang.',
        name: 'Bapak H. Rahmat, Bekasi',
        paket: 'Paket Premium',
        image: 'https://source.unsplash.com/9m1OFDFA5Kc/800x800',
    },
    {
        quote: 'Hotel dekat, jadwal jelas, tim pendamping sangat membantu.',
        name: 'Ibu Nur, Surabaya',
        paket: 'Paket Hemat 9 Hari',
        image: 'https://source.unsplash.com/8manzosDSGM/800x800',
    },
    {
        quote: 'Transparan biaya dan rapi dari awal hingga pulang.',
        name: 'Bapak Ali, Makassar',
        paket: 'Paket Reguler',
        image: 'https://source.unsplash.com/7R8bhoJv9nA/800x800',
    },
];

export default function Testimoni() {
    return (
        <PublicLayout>
            <Head title="Testimoni">
                <meta name="description" content="Cerita jamaah yang telah berangkat bersama Amanah Haramain Travel." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-12 pt-6">
                <div className="relative overflow-hidden rounded-[40px] border border-white/70 bg-white/85 p-8 shadow-[0_30px_70px_rgba(31, 47, 77,0.16)] lg:p-12">
                    <div className="pointer-events-none absolute -right-24 -top-20 h-52 w-52 rounded-full bg-[rgba(43, 69, 112,0.16)] blur-3xl" />
                    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div>
                            <span className="inline-flex items-center rounded-full bg-[rgba(43, 69, 112,0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-800)]">
                                Cerita Jamaah
                            </span>
                            <h1 className="public-heading mt-6 text-[clamp(2rem,4vw,3.6rem)] font-semibold text-[var(--emerald-900)]">
                                Testimoni & Kisah Perjalanan
                            </h1>
                            <p className="mt-4 max-w-2xl text-[var(--ink-700)]">
                                Cerita nyata dari jamaah yang telah berangkat bersama kami. Pendampingan rapi, informasi transparan,
                                dan layanan yang menenangkan menjadi alasan mereka kembali merekomendasikan.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)]">
                                <span className="rounded-full bg-[rgba(43, 69, 112,0.12)] px-3 py-2">4.9/5 Rating</span>
                                <span className="rounded-full bg-[rgba(43, 69, 112,0.12)] px-3 py-2">300+ Review</span>
                                <span className="rounded-full bg-[rgba(43, 69, 112,0.12)] px-3 py-2">Repeat Jamaah</span>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                { label: 'Pendampingan', image: 'https://source.unsplash.com/kZTSM4i7x-8/900x900' },
                                { label: 'Manasik', image: 'https://source.unsplash.com/yC0rPZiMZMI/900x900' },
                                { label: 'Suasana Masjid', image: 'https://source.unsplash.com/Cg4NDIa4iN0/900x900' },
                                { label: 'Hotel Strategis', image: 'https://source.unsplash.com/thb9M2F4QTs/900x900' },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="group relative h-36 overflow-hidden rounded-2xl border border-white/70 parallax-frame"
                                    data-parallax
                                    data-speed="0.3"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.label}
                                        className="parallax-img h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                    <span className="absolute bottom-3 left-3 text-xs font-semibold text-white">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="grid gap-6 md:grid-cols-2">
                    {testimonials.map((item) => (
                        <div
                            key={item.name}
                            className="group overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_36px_rgba(31, 47, 77,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(31, 47, 77,0.18)]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="parallax-frame h-14 w-14 overflow-hidden rounded-full border border-white/80" data-parallax data-speed="0.3">
                                    <img src={item.image} alt={item.name} className="parallax-img h-full w-full object-cover" loading="lazy" />
                                </div>
                                <div>
                                    <p className="public-heading text-base font-semibold text-[var(--emerald-900)]">{item.name}</p>
                                    <p className="text-xs text-[var(--ink-700)]">{item.paket}</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-[var(--ink-700)]">“{item.quote}”</p>
                            <div className="mt-4 flex gap-1 text-[var(--gold-500)]">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <span key={idx}>★</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}

