import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        title: 'Galeri Foto & Video',
        desc: 'Dokumentasi jamaah, manasik, hotel, dan perjalanan di tanah suci.',
        items: [
            { label: 'Foto Jamaah', image: '/images/dummy.jpg' },
            { label: 'Suasana Masjid', image: '/images/dummy.jpg' },
            { label: 'Masjidil Haram', image: '/images/dummy.jpg' },
            { label: 'Hotel Makkah', image: '/images/dummy.jpg' },
            { label: 'Hotel Madinah', image: '/images/dummy.jpg' },
            { label: 'Manasik', image: '/images/dummy.jpg' },
            { label: 'Suasana Kota', image: '/images/dummy.jpg' },
            { label: 'Masjid Nabawi', image: '/images/dummy.jpg' },
            { label: 'Dokumentasi Tim', image: '/images/dummy.jpg' },
            { label: 'Perjalanan Bus', image: '/images/dummy.jpg' },
            { label: 'Makkah by Night', image: '/images/dummy.jpg' },
            { label: 'Kegiatan Ibadah', image: '/images/dummy.jpg' },
            { label: 'Ziarah', image: '/images/dummy.jpg' },
            { label: 'Suasana Mall', image: '/images/dummy.jpg' },
            { label: 'City Walk', image: '/images/dummy.jpg' },
            { label: 'Hotel Lobby', image: '/images/dummy.jpg' },
            { label: 'Rombongan Jamaah', image: '/images/dummy.jpg' },
            { label: 'Kota Madinah', image: '/images/dummy.jpg' },
            { label: 'Kegiatan Malam', image: '/images/dummy.jpg' },
            { label: 'Pemandangan Kota', image: '/images/dummy.jpg' },
            { label: 'Suasana Airport', image: '/images/dummy.jpg' },
        ],
    },
    en: {
        title: 'Photo & Video Gallery',
        desc: 'Documentation of pilgrims, manasik, hotels, and journeys in the holy land.',
        items: [
            { label: 'Pilgrims', image: '/images/dummy.jpg' },
            { label: 'Mosque Atmosphere', image: '/images/dummy.jpg' },
            { label: 'Masjid al-Haram', image: '/images/dummy.jpg' },
            { label: 'Makkah Hotel', image: '/images/dummy.jpg' },
            { label: 'Madinah Hotel', image: '/images/dummy.jpg' },
            { label: 'Manasik', image: '/images/dummy.jpg' },
            { label: 'City Scene', image: '/images/dummy.jpg' },
            { label: 'Masjid Nabawi', image: '/images/dummy.jpg' },
            { label: 'Team Documentation', image: '/images/dummy.jpg' },
            { label: 'Bus Trip', image: '/images/dummy.jpg' },
            { label: 'Makkah by Night', image: '/images/dummy.jpg' },
            { label: 'Worship Activities', image: '/images/dummy.jpg' },
            { label: 'Ziyarah', image: '/images/dummy.jpg' },
            { label: 'Mall Atmosphere', image: '/images/dummy.jpg' },
            { label: 'City Walk', image: '/images/dummy.jpg' },
            { label: 'Hotel Lobby', image: '/images/dummy.jpg' },
            { label: 'Pilgrim Group', image: '/images/dummy.jpg' },
            { label: 'Madinah City', image: '/images/dummy.jpg' },
            { label: 'Night Activities', image: '/images/dummy.jpg' },
            { label: 'City View', image: '/images/dummy.jpg' },
            { label: 'Airport Atmosphere', image: '/images/dummy.jpg' },
        ],
    },
};

export default function Galeri() {
    const { locale } = usePublicLocale();
    const t = content[locale];

    return (
        <PublicLayout>
            <Head title={t.title}>
                <meta name="description" content={t.desc} />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-10 pt-6">
                <div className="rounded-3xl border border-border bg-card/90 px-6 py-8 shadow-lg">
                    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Gallery
                    </span>
                    <h1 className="public-heading mt-4 text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                        {t.title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">{t.desc}</p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {t.items.map((item) => (
                        <div
                            key={item.label}
                            className="group relative h-36 overflow-hidden rounded-2xl border border-border shadow-sm parallax-frame sm:h-44"
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
