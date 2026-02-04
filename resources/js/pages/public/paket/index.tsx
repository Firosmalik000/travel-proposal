import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

const packages = [
    {
        title: 'Umroh Hemat 9 Hari',
        price: 'Start 29,9 jt',
        date: '10 Maret 2026',
        city: 'Jakarta',
        hotel: 'Setara bintang 3',
        notes: 'Itinerary jelas | Manasik terjadwal',
        image: 'https://source.unsplash.com/kZTSM4i7x-8/1200x900',
    },
    {
        title: 'Umroh Reguler 10 Hari',
        price: 'Start 34,9 jt',
        date: '15 April 2026',
        city: 'Surabaya',
        hotel: 'Setara bintang 4',
        notes: 'Pembimbing berpengalaman',
        image: 'https://source.unsplash.com/thb9M2F4QTs/1200x900',
    },
    {
        title: 'Umroh Premium 12 Hari',
        price: 'Start 44,9 jt',
        date: '05 Mei 2026',
        city: 'Jakarta',
        hotel: 'Hotel dekat',
        notes: 'Fasilitas lengkap | Seat lebih banyak',
        image: 'https://source.unsplash.com/Cg4NDIa4iN0/1200x900',
    },
    {
        title: 'Umroh Plus City Tour',
        price: 'Start 39,9 jt',
        date: '20 Mei 2026',
        city: 'Jakarta',
        hotel: 'Setara bintang 4',
        notes: 'City tour singkat | Kuliner khas',
        image: 'https://source.unsplash.com/EIVfsewIHP0/1200x900',
    },
    {
        title: 'Umroh Family 10 Hari',
        price: 'Start 36,9 jt',
        date: '02 Juni 2026',
        city: 'Surabaya',
        hotel: 'Hotel strategis',
        notes: 'Pendampingan keluarga | Seat terbatas',
        image: 'https://source.unsplash.com/exk_T96LMVk/1200x900',
    },
    {
        title: 'Umroh Premium 12 Hari',
        price: 'Start 44,9 jt',
        date: '15 Juni 2026',
        city: 'Jakarta',
        hotel: 'Hotel dekat Masjid',
        notes: 'Fasilitas lengkap | Lounge bandara',
        image: 'https://source.unsplash.com/AdZ68iA9X08/1200x900',
    },
];

export default function Paket() {
    return (
        <PublicLayout>
            <Head title="Paket Umroh 2026">
                <meta name="description" content="Pilih paket umroh sesuai bulan, kota keberangkatan, durasi, dan preferensi hotel." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-8 pt-6">
                <div className="rounded-[36px] border border-white/70 bg-white/80 px-6 py-8 shadow-[0_24px_60px_rgba(31, 47, 77,0.14)]">
                    <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">
                        Paket Umroh 2026
                    </h1>
                    <p className="mt-2 text-[var(--ink-700)]">
                        Pilih paket sesuai bulan keberangkatan, durasi, kota, dan preferensi hotel.
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-14">
                <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(31, 47, 77,0.12)] md:grid-cols-3">
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)]">
                        Bulan Keberangkatan
                        <select className="mt-2 w-full rounded-2xl border border-[rgba(31, 47, 77,0.18)] bg-white px-3 py-2 text-sm">
                            <option>Maret 2026</option>
                            <option>April 2026</option>
                            <option>Mei 2026</option>
                        </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)]">
                        Kota Keberangkatan
                        <select className="mt-2 w-full rounded-2xl border border-[rgba(31, 47, 77,0.18)] bg-white px-3 py-2 text-sm">
                            <option>Jakarta</option>
                            <option>Surabaya</option>
                            <option>Makassar</option>
                        </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)]">
                        Durasi
                        <select className="mt-2 w-full rounded-2xl border border-[rgba(31, 47, 77,0.18)] bg-white px-3 py-2 text-sm">
                            <option>9 Hari</option>
                            <option>10 Hari</option>
                            <option>12 Hari</option>
                        </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)]">
                        Budget
                        <input className="mt-2 w-full rounded-2xl border border-[rgba(31, 47, 77,0.18)] bg-white px-3 py-2 text-sm" placeholder="Contoh: 30 - 45 jt" />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)]">
                        Tipe Hotel
                        <select className="mt-2 w-full rounded-2xl border border-[rgba(31, 47, 77,0.18)] bg-white px-3 py-2 text-sm">
                            <option>Hemat</option>
                            <option>Reguler</option>
                            <option>Premium</option>
                        </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--emerald-900)]">
                        Maskapai
                        <select className="mt-2 w-full rounded-2xl border border-[rgba(31, 47, 77,0.18)] bg-white px-3 py-2 text-sm">
                            <option>Garuda Indonesia</option>
                            <option>Saudia</option>
                            <option>Menyesuaikan jadwal</option>
                        </select>
                    </label>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {packages.map((item) => (
                        <div
                            key={item.title + item.date}
                            className="group overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_18px_40px_rgba(31, 47, 77,0.12)] transition hover:-translate-y-1 hover:border-[rgba(31,47,77,0.15)] hover:shadow-[0_24px_50px_rgba(31, 47, 77,0.18)]"
                        >
                            <div
                                className="parallax-frame relative h-44 overflow-hidden bg-slate-100"
                                data-parallax
                                data-speed="0.26"
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="parallax-img h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                                <span className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--emerald-900)] backdrop-blur">
                                    {item.city}
                                </span>
                            </div>
                            <div className="p-6">
                                <h3 className="public-heading text-lg font-semibold text-[var(--emerald-900)]">{item.title}</h3>
                                <p className="mt-2 text-2xl font-semibold text-[var(--emerald-800)]">{item.price}</p>
                                <p className="mt-2 text-sm text-[var(--ink-700)]">
                                    Keberangkatan: {item.date} • {item.city}
                                </p>
                                <p className="text-sm text-[var(--ink-700)]">Hotel: {item.hotel}</p>
                                <p className="text-sm text-[var(--ink-700)]">{item.notes}</p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link
                                        href="/paket-umroh/detail"
                                        className="rounded-full border border-[var(--emerald-700)] px-4 py-2 text-xs font-semibold text-[var(--emerald-900)]"
                                    >
                                        Detail Paket
                                    </Link>
                                    <a
                                        href="https://wa.me/6281234567890"
                                        className="rounded-full bg-[var(--emerald-700)] px-4 py-2 text-xs font-semibold text-white"
                                    >
                                        Tanya Seat
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-4 text-sm text-[var(--ink-700)]">
                    Harga dapat berbeda sesuai tipe kamar (quad, triple, double).
                </p>
            </section>

            <a
                href="https://wa.me/6281234567890"
                className="fixed bottom-6 right-6 z-50 inline-flex items-center rounded-full bg-[var(--emerald-700)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(31, 47, 77,0.25)] md:hidden"
            >
                WhatsApp
            </a>
        </PublicLayout>
    );
}

