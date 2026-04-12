import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { usePublicLocale } from '@/contexts/public-locale';
import { localize, usePublicData, usePublicPageContent } from '@/lib/public-content';

const fallback = {
    id: {
        pageTitle: 'Tentang Kami',
        meta: 'Profil travel, visi misi, dan tim inti.',
        hero: {
            title: 'Tentang Kami',
            desc: 'Mengenal visi, misi, dan tim di balik layanan umroh terpercaya.',
        },
        profile: {
            title: 'Profil & Nilai Perusahaan',
            desc: 'Travel umroh yang fokus pada pelayanan tertata dan nyaman.',
        },
        team: {
            title: 'Tim Inti Kami',
            desc: 'Figur-figur yang mendampingi pelayanan jamaah.',
        },
    },
    en: {
        pageTitle: 'About Us',
        meta: 'Travel profile, vision, mission, and core team.',
        hero: {
            title: 'About Us',
            desc: 'Get to know our vision, mission, and team.',
        },
        profile: {
            title: 'Company Profile & Values',
            desc: 'Umrah travel focused on structured and comfortable service.',
        },
        team: {
            title: 'Our Core Team',
            desc: 'The people behind pilgrim service.',
        },
    },
};

export default function Tentang() {
    const { locale } = usePublicLocale();
    const publicData = usePublicData();
    const page = usePublicPageContent('tentang-kami');
    const t = fallback[locale];
    const teamMembers = Array.isArray(publicData.team) ? publicData.team : [];
    const values = Array.isArray(page?.content?.values) ? page.content.values : [];

    return (
        <PublicLayout>
            <Head title={localize(page?.title, locale, t.pageTitle)}>
                <meta name="description" content={localize(page?.excerpt, locale, t.meta)} />
            </Head>

            <main className="bg-background">
                <section className="bg-slate-800 py-14 text-white sm:py-20 md:py-32">
                    <div className="container mx-auto px-4 text-center sm:px-6">
                        <h1 className="font-heading text-3xl font-bold sm:text-4xl md:text-6xl">
                            {localize(page?.content?.hero?.title, locale, t.hero.title)}
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
                            {localize(page?.content?.hero?.description, locale, t.hero.desc)}
                        </p>
                    </div>
                </section>

                <section className="container mx-auto grid items-start gap-12 px-4 py-16 sm:px-6 sm:py-20 md:gap-16 md:py-24 lg:grid-cols-2">
                    <div>
                        <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                            {localize(page?.content?.profile?.title, locale, t.profile.title)}
                        </h2>
                        <p className="mt-4 leading-relaxed text-muted-foreground">
                            {localize(page?.content?.profile?.description, locale, t.profile.desc)}
                        </p>
                        <div className="mt-10 space-y-8">
                            {values.map((value: Record<string, unknown>, index: number) => (
                                <div key={`${index}_${localize(value.title, locale)}`}>
                                    <h3 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                                        {localize(value.title, locale)}
                                    </h3>
                                    <p className="mt-2 leading-relaxed text-muted-foreground">{localize(value.description, locale)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="col-span-1 sm:pt-12">
                            <img
                                src={page?.content?.profile?.image_primary || '/images/dummy.jpg'}
                                alt={localize(page?.content?.profile?.title, locale, t.profile.title)}
                                className="h-auto w-full rounded-2xl object-cover shadow-lg"
                            />
                        </div>
                        <div className="col-span-1">
                            <img
                                src={page?.content?.profile?.image_secondary || '/images/dummy.jpg'}
                                alt={localize(page?.content?.team?.title, locale, t.team.title)}
                                className="h-auto w-full rounded-2xl object-cover shadow-lg"
                            />
                        </div>
                    </div>
                </section>

                <section className="bg-muted/40 py-16 sm:py-20 md:py-24">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="mb-12 text-center">
                            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                                {localize(page?.content?.team?.title, locale, t.team.title)}
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
                                {localize(page?.content?.team?.description, locale, t.team.desc)}
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {teamMembers.map((member: Record<string, unknown>) => (
                                <div key={String(member.name)} className="rounded-2xl bg-card p-6 text-center shadow-sm transition-shadow duration-300 hover:shadow-xl">
                                    <img
                                        src={String(member.image_path || '/images/dummy.jpg')}
                                        alt={String(member.name)}
                                        className="mx-auto mb-4 h-24 w-24 rounded-full object-cover shadow-md sm:h-28 sm:w-28 md:h-32 md:w-32"
                                    />
                                    <h3 className="font-heading text-xl font-bold text-foreground">{String(member.name)}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{localize(member.role, locale)}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{localize(member.bio, locale)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
