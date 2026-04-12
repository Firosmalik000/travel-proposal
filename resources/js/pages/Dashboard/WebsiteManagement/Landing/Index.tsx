import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { toast } from 'sonner';

interface LocalizedValue {
    id?: string;
    en?: string;
}

interface LandingPageItem {
    id: number;
    slug: string;
    title: LocalizedValue;
    excerpt?: LocalizedValue | null;
    content: Record<string, any>;
    is_active: boolean;
}

interface FieldDefinition {
    label: string;
    path: string;
    type?: 'text' | 'textarea';
}

const pageLabels: Record<string, string> = {
    home: 'Home',
    'tentang-kami': 'Tentang Kami',
    'paket-umroh': 'Paket Umroh',
    kontak: 'Kontak',
    legalitas: 'Legalitas',
    galeri: 'Galeri',
    mitra: 'Mitra',
    karier: 'Karier',
    'custom-umroh': 'Custom Umroh',
    'paket-detail': 'Detail Paket',
};

const pageFieldDefinitions: Record<string, FieldDefinition[]> = {
    home: [
        { label: 'Hero Label ID', path: 'hero.label.id' },
        { label: 'Hero Label EN', path: 'hero.label.en' },
        { label: 'Hero Title ID', path: 'hero.title.id' },
        { label: 'Hero Title EN', path: 'hero.title.en' },
        { label: 'Hero Description ID', path: 'hero.description.id', type: 'textarea' },
        { label: 'Hero Description EN', path: 'hero.description.en', type: 'textarea' },
        { label: 'Hero Image', path: 'hero.image' },
        { label: 'About Label ID', path: 'about.label.id' },
        { label: 'About Label EN', path: 'about.label.en' },
        { label: 'About Title ID', path: 'about.title.id' },
        { label: 'About Title EN', path: 'about.title.en' },
        { label: 'About Description ID', path: 'about.description.id', type: 'textarea' },
        { label: 'About Description EN', path: 'about.description.en', type: 'textarea' },
        { label: 'About CTA ID', path: 'about.cta.id' },
        { label: 'About CTA EN', path: 'about.cta.en' },
        { label: 'About Image Primary', path: 'about.image_primary' },
        { label: 'About Image Secondary', path: 'about.image_secondary' },
        { label: 'Packages Title ID', path: 'packages.title.id' },
        { label: 'Packages Title EN', path: 'packages.title.en' },
        { label: 'Price Prefix ID', path: 'packages.price_prefix.id' },
        { label: 'Price Prefix EN', path: 'packages.price_prefix.en' },
        { label: 'Services Label ID', path: 'services.label.id' },
        { label: 'Services Label EN', path: 'services.label.en' },
        { label: 'Services Title ID', path: 'services.title.id' },
        { label: 'Services Title EN', path: 'services.title.en' },
        { label: 'Services Description ID', path: 'services.description.id', type: 'textarea' },
        { label: 'Services Description EN', path: 'services.description.en', type: 'textarea' },
        { label: 'Gallery Title ID', path: 'gallery.title.id' },
        { label: 'Gallery Title EN', path: 'gallery.title.en' },
        { label: 'Gallery Description ID', path: 'gallery.description.id', type: 'textarea' },
        { label: 'Gallery Description EN', path: 'gallery.description.en', type: 'textarea' },
        { label: 'Contact Label ID', path: 'contact.label.id' },
        { label: 'Contact Label EN', path: 'contact.label.en' },
        { label: 'Contact Title ID', path: 'contact.title.id' },
        { label: 'Contact Title EN', path: 'contact.title.en' },
        { label: 'Contact Description ID', path: 'contact.description.id', type: 'textarea' },
        { label: 'Contact Description EN', path: 'contact.description.en', type: 'textarea' },
        { label: 'WhatsApp Button ID', path: 'contact.whatsapp_label.id' },
        { label: 'WhatsApp Button EN', path: 'contact.whatsapp_label.en' },
        { label: 'Full Contact Button ID', path: 'contact.contact_label.id' },
        { label: 'Full Contact Button EN', path: 'contact.contact_label.en' },
        { label: 'Stat 1 Value', path: 'stats.0.value' },
        { label: 'Stat 1 Label ID', path: 'stats.0.label.id' },
        { label: 'Stat 1 Label EN', path: 'stats.0.label.en' },
        { label: 'Stat 2 Value', path: 'stats.1.value' },
        { label: 'Stat 2 Label ID', path: 'stats.1.label.id' },
        { label: 'Stat 2 Label EN', path: 'stats.1.label.en' },
        { label: 'Stat 3 Value', path: 'stats.2.value' },
        { label: 'Stat 3 Label ID', path: 'stats.2.label.id' },
        { label: 'Stat 3 Label EN', path: 'stats.2.label.en' },
        { label: 'Stat 4 Value', path: 'stats.3.value' },
        { label: 'Stat 4 Label ID', path: 'stats.3.label.id' },
        { label: 'Stat 4 Label EN', path: 'stats.3.label.en' },
    ],
    'tentang-kami': [
        { label: 'Hero Title ID', path: 'hero.title.id' },
        { label: 'Hero Title EN', path: 'hero.title.en' },
        { label: 'Hero Description ID', path: 'hero.description.id', type: 'textarea' },
        { label: 'Hero Description EN', path: 'hero.description.en', type: 'textarea' },
        { label: 'Profile Title ID', path: 'profile.title.id' },
        { label: 'Profile Title EN', path: 'profile.title.en' },
        { label: 'Profile Description ID', path: 'profile.description.id', type: 'textarea' },
        { label: 'Profile Description EN', path: 'profile.description.en', type: 'textarea' },
        { label: 'Profile Image Primary', path: 'profile.image_primary' },
        { label: 'Profile Image Secondary', path: 'profile.image_secondary' },
        { label: 'Value 1 Title ID', path: 'values.0.title.id' },
        { label: 'Value 1 Title EN', path: 'values.0.title.en' },
        { label: 'Value 1 Description ID', path: 'values.0.description.id', type: 'textarea' },
        { label: 'Value 1 Description EN', path: 'values.0.description.en', type: 'textarea' },
        { label: 'Value 2 Title ID', path: 'values.1.title.id' },
        { label: 'Value 2 Title EN', path: 'values.1.title.en' },
        { label: 'Value 2 Description ID', path: 'values.1.description.id', type: 'textarea' },
        { label: 'Value 2 Description EN', path: 'values.1.description.en', type: 'textarea' },
        { label: 'Team Title ID', path: 'team.title.id' },
        { label: 'Team Title EN', path: 'team.title.en' },
        { label: 'Team Description ID', path: 'team.description.id', type: 'textarea' },
        { label: 'Team Description EN', path: 'team.description.en', type: 'textarea' },
    ],
    'paket-umroh': [
        { label: 'Detail Button ID', path: 'cards.detail.id' },
        { label: 'Detail Button EN', path: 'cards.detail.en' },
        { label: 'Ask Button ID', path: 'cards.ask.id' },
        { label: 'Ask Button EN', path: 'cards.ask.en' },
        { label: 'Note ID', path: 'note.id', type: 'textarea' },
        { label: 'Note EN', path: 'note.en', type: 'textarea' },
    ],
    kontak: [
        { label: 'Badge ID', path: 'badge.id' },
        { label: 'Badge EN', path: 'badge.en' },
        { label: 'Heading ID', path: 'heading.id' },
        { label: 'Heading EN', path: 'heading.en' },
        { label: 'Description ID', path: 'description.id', type: 'textarea' },
        { label: 'Description EN', path: 'description.en', type: 'textarea' },
        { label: 'Map Title ID', path: 'map.title.id' },
        { label: 'Map Title EN', path: 'map.title.en' },
        { label: 'Map Badge ID', path: 'map.badge.id' },
        { label: 'Map Badge EN', path: 'map.badge.en' },
        { label: 'Map Placeholder ID', path: 'map.placeholder.id', type: 'textarea' },
        { label: 'Map Placeholder EN', path: 'map.placeholder.en', type: 'textarea' },
        { label: 'Map Note ID', path: 'map.note.id', type: 'textarea' },
        { label: 'Map Note EN', path: 'map.note.en', type: 'textarea' },
    ],
    legalitas: [
        { label: 'Hero Badge ID', path: 'hero.badge.id' },
        { label: 'Hero Badge EN', path: 'hero.badge.en' },
        { label: 'Hero Title ID', path: 'hero.title.id' },
        { label: 'Hero Title EN', path: 'hero.title.en' },
        { label: 'Hero Description ID', path: 'hero.description.id', type: 'textarea' },
        { label: 'Hero Description EN', path: 'hero.description.en', type: 'textarea' },
        { label: 'Docs Title ID', path: 'docs_title.id' },
        { label: 'Docs Title EN', path: 'docs_title.en' },
        { label: 'Bank Title ID', path: 'bank_title.id' },
        { label: 'Bank Title EN', path: 'bank_title.en' },
        { label: 'Bank Line 1 ID', path: 'bank_lines.0.id' },
        { label: 'Bank Line 1 EN', path: 'bank_lines.0.en' },
        { label: 'Bank Line 2 ID', path: 'bank_lines.1.id' },
        { label: 'Bank Line 2 EN', path: 'bank_lines.1.en' },
        { label: 'Bank Line 3 ID', path: 'bank_lines.2.id' },
        { label: 'Bank Line 3 EN', path: 'bank_lines.2.en' },
        { label: 'Disclaimer Title ID', path: 'disclaimer_title.id' },
        { label: 'Disclaimer Title EN', path: 'disclaimer_title.en' },
        { label: 'Disclaimer ID', path: 'disclaimer.id', type: 'textarea' },
        { label: 'Disclaimer EN', path: 'disclaimer.en', type: 'textarea' },
    ],
    galeri: [
        { label: 'Badge ID', path: 'badge.id' },
        { label: 'Badge EN', path: 'badge.en' },
        { label: 'Description ID', path: 'description.id', type: 'textarea' },
        { label: 'Description EN', path: 'description.en', type: 'textarea' },
    ],
    mitra: [
        { label: 'Badge ID', path: 'badge.id' },
        { label: 'Badge EN', path: 'badge.en' },
        { label: 'Subtitle ID', path: 'subtitle.id', type: 'textarea' },
        { label: 'Subtitle EN', path: 'subtitle.en', type: 'textarea' },
        { label: 'Description ID', path: 'description.id', type: 'textarea' },
        { label: 'Description EN', path: 'description.en', type: 'textarea' },
        { label: 'CTA ID', path: 'cta.id' },
        { label: 'CTA EN', path: 'cta.en' },
    ],
    karier: [
        { label: 'Badge ID', path: 'badge.id' },
        { label: 'Badge EN', path: 'badge.en' },
        { label: 'Subtitle ID', path: 'subtitle.id', type: 'textarea' },
        { label: 'Subtitle EN', path: 'subtitle.en', type: 'textarea' },
        { label: 'CTA ID', path: 'cta.id' },
        { label: 'CTA EN', path: 'cta.en' },
    ],
    'custom-umroh': [
        { label: 'Badge ID', path: 'badge.id' },
        { label: 'Badge EN', path: 'badge.en' },
        { label: 'Subtitle ID', path: 'subtitle.id', type: 'textarea' },
        { label: 'Subtitle EN', path: 'subtitle.en', type: 'textarea' },
        { label: 'Description ID', path: 'description.id', type: 'textarea' },
        { label: 'Description EN', path: 'description.en', type: 'textarea' },
        { label: 'CTA ID', path: 'cta.id' },
        { label: 'CTA EN', path: 'cta.en' },
    ],
    'paket-detail': [
        { label: 'Book CTA ID', path: 'ctas.book.id' },
        { label: 'Book CTA EN', path: 'ctas.book.en' },
        { label: 'Brochure CTA ID', path: 'ctas.brochure.id' },
        { label: 'Brochure CTA EN', path: 'ctas.brochure.en' },
        { label: 'Summary Title ID', path: 'summary_title.id' },
        { label: 'Summary Title EN', path: 'summary_title.en' },
        { label: 'Included Title ID', path: 'included_title.id' },
        { label: 'Included Title EN', path: 'included_title.en' },
        { label: 'Excluded Title ID', path: 'excluded_title.id' },
        { label: 'Excluded Title EN', path: 'excluded_title.en' },
        { label: 'Itinerary Title ID', path: 'itinerary_title.id' },
        { label: 'Itinerary Title EN', path: 'itinerary_title.en' },
        { label: 'Facilities Title ID', path: 'facilities_title.id' },
        { label: 'Facilities Title EN', path: 'facilities_title.en' },
        { label: 'Requirements Title ID', path: 'requirements_title.id' },
        { label: 'Requirements Title EN', path: 'requirements_title.en' },
        { label: 'Payment Title ID', path: 'payment_title.id' },
        { label: 'Payment Title EN', path: 'payment_title.en' },
        { label: 'Policy Title ID', path: 'policy_title.id' },
        { label: 'Policy Title EN', path: 'policy_title.en' },
        { label: 'CTA Block Title ID', path: 'cta_block.title.id' },
        { label: 'CTA Block Title EN', path: 'cta_block.title.en' },
        { label: 'CTA Block Description ID', path: 'cta_block.description.id', type: 'textarea' },
        { label: 'CTA Block Description EN', path: 'cta_block.description.en', type: 'textarea' },
        { label: 'CTA Block Button ID', path: 'cta_block.button.id' },
        { label: 'CTA Block Button EN', path: 'cta_block.button.en' },
        { label: 'Interest Title ID', path: 'interest.title.id' },
        { label: 'Interest Title EN', path: 'interest.title.en' },
        { label: 'Placeholder 1 ID', path: 'interest.placeholders.0.id' },
        { label: 'Placeholder 1 EN', path: 'interest.placeholders.0.en' },
        { label: 'Placeholder 2 ID', path: 'interest.placeholders.1.id' },
        { label: 'Placeholder 2 EN', path: 'interest.placeholders.1.en' },
        { label: 'Placeholder 3 ID', path: 'interest.placeholders.2.id' },
        { label: 'Placeholder 3 EN', path: 'interest.placeholders.2.en' },
        { label: 'Interest Button ID', path: 'interest.button.id' },
        { label: 'Interest Button EN', path: 'interest.button.en' },
    ],
};

export default function LandingIndex({ pages }: { pages: LandingPageItem[] }) {
    const defaultTab = pages[0]?.slug ?? 'home';

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Landing Page', href: '/dashboard/website-management/landing' }]}>
            <Head title="Landing Page" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Landing Page</h1>
                    <p className="text-sm text-muted-foreground">Ubah teks, label, CTA, cover path, dan copy per section tanpa menyentuh layout atau desain UI.</p>
                </div>

                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl bg-muted/60 p-2 lg:grid-cols-5">
                        {pages.map((page) => (
                            <TabsTrigger key={page.slug} value={page.slug} className="rounded-lg">
                                {pageLabels[page.slug] ?? page.slug}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {pages.map((page) => (
                        <TabsContent key={page.slug} value={page.slug} className="mt-6">
                            <LandingPageEditor page={page} />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </AppSidebarLayout>
    );
}

function LandingPageEditor({ page }: { page: LandingPageItem }) {
    const { data, setData, post, processing } = useForm({
        title_id: page.title?.id ?? '',
        title_en: page.title?.en ?? '',
        excerpt_id: page.excerpt?.id ?? '',
        excerpt_en: page.excerpt?.en ?? '',
        content: page.content ?? {},
        is_active: page.is_active,
        _method: 'PATCH',
    });

    const fields = pageFieldDefinitions[page.slug] ?? [];

    const setContentValue = (path: string, value: string) => {
        setData('content', updateNestedValue(data.content, path, value));
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(`/dashboard/website-management/content/${page.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Konten ${pageLabels[page.slug] ?? page.slug} berhasil diperbarui`),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{pageLabels[page.slug] ?? page.slug}</CardTitle>
                <CardDescription>Semua field di bawah ini hanya mengubah data teks dan path media yang tersimpan di database.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-6" onSubmit={submit}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Field label="Page Title ID" value={data.title_id} onChange={(value) => setData('title_id', value)} />
                        <Field label="Page Title EN" value={data.title_en} onChange={(value) => setData('title_en', value)} />
                        <Field label="Excerpt ID" value={data.excerpt_id} onChange={(value) => setData('excerpt_id', value)} multiline />
                        <Field label="Excerpt EN" value={data.excerpt_en} onChange={(value) => setData('excerpt_en', value)} multiline />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {fields.map((field) => (
                            <Field
                                key={field.path}
                                label={field.label}
                                value={String(getNestedValue(data.content, field.path) ?? '')}
                                onChange={(value) => setContentValue(field.path, value)}
                                multiline={field.type === 'textarea'}
                            />
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>Simpan Landing Page</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function Field({
    label,
    value,
    onChange,
    multiline = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    multiline?: boolean;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {multiline ? (
                <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
            ) : (
                <Input value={value} onChange={(event) => onChange(event.target.value)} />
            )}
        </div>
    );
}

function getNestedValue(source: Record<string, any>, path: string): unknown {
    return path.split('.').reduce<unknown>((carry, segment) => {
        if (carry === null || carry === undefined) {
            return undefined;
        }

        if (Array.isArray(carry)) {
            return carry[Number(segment)];
        }

        if (typeof carry === 'object') {
            return (carry as Record<string, unknown>)[segment];
        }

        return undefined;
    }, source);
}

function updateNestedValue(source: Record<string, any>, path: string, value: string): Record<string, any> {
    const result = structuredClone(source ?? {});
    const segments = path.split('.');
    let current: any = result;

    segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1;
        const nextSegment = segments[index + 1];
        const nextIsNumber = nextSegment !== undefined && ! Number.isNaN(Number(nextSegment));
        const numericIndex = Number(segment);

        if (Array.isArray(current)) {
            if (isLast) {
                current[numericIndex] = value;
                return;
            }

            if (current[numericIndex] === undefined) {
                current[numericIndex] = nextIsNumber ? [] : {};
            }

            current = current[numericIndex];
            return;
        }

        if (isLast) {
            current[segment] = value;
            return;
        }

        if (current[segment] === undefined) {
            current[segment] = nextIsNumber ? [] : {};
        }

        current = current[segment];
    });

    return result;
}
