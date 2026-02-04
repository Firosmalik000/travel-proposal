import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

export default function Galeri() {
    return (
        <PublicLayout>
            <Head title="Galeri">
                <meta name="description" content="Dokumentasi jamaah, manasik, hotel, dan perjalanan umroh." />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6">
                <h1 className="public-heading text-3xl font-semibold text-[var(--emerald-900)] sm:text-4xl">Galeri Foto & Video</h1>
                <p className="mt-3 text-[var(--ink-700)]">Dokumentasi jamaah, manasik, hotel, dan perjalanan di tanah suci.</p>
            </section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {[
                        { label: 'Foto Jamaah', image: 'https://source.unsplash.com/kZTSM4i7x-8/1200x900' },
                        { label: 'Suasana Masjid', image: 'https://source.unsplash.com/AdZ68iA9X08/1200x900' },
                        { label: 'Masjidil Haram', image: 'https://source.unsplash.com/Cg4NDIa4iN0/1200x900' },
                        { label: 'Hotel Makkah', image: 'https://source.unsplash.com/thb9M2F4QTs/1200x900' },
                        { label: 'Hotel Madinah', image: 'https://source.unsplash.com/KtzvN3OJ4Gg/1200x900' },
                        { label: 'Manasik', image: 'https://source.unsplash.com/yC0rPZiMZMI/1200x900' },
                        { label: 'Suasana Kota', image: 'https://source.unsplash.com/exk_T96LMVk/1200x900' },
                        { label: 'Masjid Nabawi', image: 'https://source.unsplash.com/EIVfsewIHP0/1200x900' },
                        { label: 'Dokumentasi Tim', image: 'https://source.unsplash.com/jrZN8Fp1M7A/1200x900' },
                        { label: 'Perjalanan Bus', image: 'https://source.unsplash.com/1WQxT7kVub0/1200x900' },
                        { label: 'Makkah by Night', image: 'https://source.unsplash.com/oMPAz-DN-9I/1200x900' },
                        { label: 'Kegiatan Ibadah', image: 'https://source.unsplash.com/2d4lAQAlbDA/1200x900' },
                        { label: 'Ziarah', image: 'https://source.unsplash.com/0s5ZpXK0e2g/1200x900' },
                        { label: 'Suasana Mall', image: 'https://source.unsplash.com/9p54GPnsW4U/1200x900' },
                        { label: 'City Walk', image: 'https://source.unsplash.com/9m1OFDFA5Kc/1200x900' },
                        { label: 'Hotel Lobby', image: 'https://source.unsplash.com/2gOxKj594nM/1200x900' },
                        { label: 'Rombongan Jamaah', image: 'https://source.unsplash.com/0F0E8fG8rvU/1200x900' },
                        { label: 'Kota Madinah', image: 'https://source.unsplash.com/0C9-yxVxZ6o/1200x900' },
                        { label: 'Kegiatan Malam', image: 'https://source.unsplash.com/8manzosDSGM/1200x900' },
                        { label: 'Pemandangan Kota', image: 'https://source.unsplash.com/HN-5Z6AmxrM/1200x900' },
                        { label: 'Suasana Airport', image: 'https://source.unsplash.com/7R8bhoJv9nA/1200x900' },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="group relative h-44 overflow-hidden rounded-2xl border border-white/70 shadow-[0_14px_30px_rgba(31, 47, 77,0.12)] parallax-frame"
                            data-parallax
                            data-speed="0.28"
                        >
                            <img
                                src={item.image}
                                alt={item.label}
                                className="parallax-img h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition duration-700 group-hover:opacity-90" />
                            <span className="absolute bottom-3 left-3 text-sm font-semibold text-white transition duration-500 group-hover:-translate-y-1">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}

