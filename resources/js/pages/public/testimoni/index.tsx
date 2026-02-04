import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { Star } from 'lucide-react';
import { usePublicLocale } from '@/contexts/public-locale';

const content = {
    id: {
        title: 'Testimoni',
        meta: 'Cerita jamaah yang telah berangkat bersama Amanah Haramain Travel.',
        badge: 'Cerita Jamaah',
        heading: 'Testimoni & Kisah Perjalanan',
        desc: 'Cerita nyata dari jamaah yang telah berangkat bersama kami. Pendampingan rapi, informasi transparan, dan layanan yang menenangkan menjadi alasan mereka kembali merekomendasikan.',
        stats: ['4.9/5 Rating', '300+ Review', 'Repeat Jamaah'],
        gallery: [
            { label: 'Pendampingan', image: '/images/dummy.jpg' },
            { label: 'Manasik', image: '/images/dummy.jpg' },
            { label: 'Suasana Masjid', image: '/images/dummy.jpg' },
            { label: 'Hotel Strategis', image: '/images/dummy.jpg' },
        ],
        testimonials: [
            {
                quote: 'Pelayanan rapi dari awal. Manasik jelas, hotel sesuai info, dan pembimbing sabar.',
                name: 'Ibu Siti, Bandung',
                paket: 'Paket Reguler 10 Hari',
                image: '/images/dummy.jpg',
            },
            {
                quote: 'Admin cepat respon. Kami lansia dibantu dari bandara sampai pulang.',
                name: 'Bapak H. Rahmat, Bekasi',
                paket: 'Paket Premium',
                image: '/images/dummy.jpg',
            },
            {
                quote: 'Hotel dekat, jadwal jelas, tim pendamping sangat membantu.',
                name: 'Ibu Nur, Surabaya',
                paket: 'Paket Hemat 9 Hari',
                image: '/images/dummy.jpg',
            },
            {
                quote: 'Transparan biaya dan rapi dari awal hingga pulang.',
                name: 'Bapak Ali, Makassar',
                paket: 'Paket Reguler',
                image: '/images/dummy.jpg',
            },
        ],
    },
    en: {
        title: 'Testimonials',
        meta: 'Stories from pilgrims who traveled with Amanah Haramain Travel.',
        badge: 'Pilgrim Stories',
        heading: 'Testimonials & Journey Stories',
        desc: 'Real stories from pilgrims who traveled with us. Clear guidance, transparent information, and calm service are why they keep recommending us.',
        stats: ['4.9/5 Rating', '300+ Reviews', 'Repeat Pilgrims'],
        gallery: [
            { label: 'Guidance', image: '/images/dummy.jpg' },
            { label: 'Manasik', image: '/images/dummy.jpg' },
            { label: 'Mosque Atmosphere', image: '/images/dummy.jpg' },
            { label: 'Strategic Hotels', image: '/images/dummy.jpg' },
        ],
        testimonials: [
            {
                quote: 'Well-organized service. Clear manasik, hotels as described, and patient guides.',
                name: 'Mrs. Siti, Bandung',
                paket: 'Regular Package 10 Days',
                image: '/images/dummy.jpg',
            },
            {
                quote: 'Fast admin response. Our elderly group was assisted from the airport to return.',
                name: 'Mr. Rahmat, Bekasi',
                paket: 'Premium Package',
                image: '/images/dummy.jpg',
            },
            {
                quote: 'Hotels were close, schedule clear, and the team was very helpful.',
                name: 'Mrs. Nur, Surabaya',
                paket: 'Economy Package 9 Days',
                image: '/images/dummy.jpg',
            },
            {
                quote: 'Transparent costs and well-managed from start to finish.',
                name: 'Mr. Ali, Makassar',
                paket: 'Regular Package',
                image: '/images/dummy.jpg',
            },
        ],
    },
};

export default function Testimoni() {
    const { locale } = usePublicLocale();
    const t = content[locale];

    return (
        <PublicLayout>
            <Head title={t.title}>
                <meta name="description" content={t.meta} />
            </Head>

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-12 pt-6">
                <div className="relative overflow-hidden rounded-[32px] border border-border bg-card/90 p-6 shadow-lg sm:p-8 lg:rounded-[40px] lg:p-12">
                    <div className="pointer-events-none absolute -right-24 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
                    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                {t.badge}
                            </span>
                            <h1 className="public-heading mt-6 text-[clamp(2rem,4vw,3.6rem)] font-semibold text-foreground">
                                {t.heading}
                            </h1>
                            <p className="mt-4 max-w-2xl text-muted-foreground">
                                {t.desc}
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                {t.stats.map((stat) => (
                                    <span key={stat} className="rounded-full bg-muted px-3 py-2">
                                        {stat}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {t.gallery.map((item) => (
                                <div
                                    key={item.label}
                                    className="group relative h-28 overflow-hidden rounded-2xl border border-border parallax-frame sm:h-36"
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

            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-16">
                <div className="grid gap-6 sm:grid-cols-2">
                    {t.testimonials.map((item) => (
                        <div
                            key={item.name}
                            className="group overflow-hidden rounded-2xl border border-border bg-card/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="flex items-center gap-4">
                                <div className="parallax-frame h-14 w-14 overflow-hidden rounded-full border border-border" data-parallax data-speed="0.3">
                                    <img src={item.image} alt={item.name} className="parallax-img h-full w-full object-cover" loading="lazy" />
                                </div>
                                <div>
                                    <p className="public-heading text-base font-semibold text-foreground">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.paket}</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">“{item.quote}”</p>
                            <div className="mt-4 flex gap-1 text-amber-400">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <Star key={idx} className="h-4 w-4" fill="currentColor" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
}
