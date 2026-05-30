import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';

type LandingHtmlPage = {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    content: {
        html: string;
    };
    is_active: boolean;
};

export default function LandingHtmlIndex({ page }: { page: LandingHtmlPage }) {
    const { data, setData, post, processing } = useForm({
        title: page.title,
        excerpt: page.excerpt ?? '',
        content: {
            html: page.content.html ?? '',
        },
        is_active: page.is_active,
        _method: 'PATCH',
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(`/admin/website-management/content/${page.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Website Management', href: '#' },
                {
                    label: 'Landing HTML',
                    href: '/admin/website-management/landing',
                },
            ]}
        >
            <Head title="Landing HTML" />

            <div className="p-4 md:p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <h1 className="text-xl font-bold">Landing HTML</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola HTML untuk halaman publik
                            <span className="font-medium text-foreground">
                                {' '}
                                /landing
                            </span>
                            .
                        </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="grid gap-4">
                            <div>
                                <Label className="mb-1.5 block">Judul</Label>
                                <Input
                                    value={data.title}
                                    onChange={(event) =>
                                        setData('title', event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label className="mb-1.5 block">
                                    Ringkasan
                                </Label>
                                <Input
                                    value={data.excerpt}
                                    onChange={(event) =>
                                        setData('excerpt', event.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label className="mb-1.5 block">
                                    HTML Mockup
                                </Label>
                                <Textarea
                                    rows={30}
                                    className="font-mono text-xs"
                                    value={data.content.html}
                                    onChange={(event) =>
                                        setData('content', {
                                            ...data.content,
                                            html: event.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', Boolean(checked))
                                    }
                                    id="is_active"
                                />
                                <Label htmlFor="is_active">Aktif</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                        <a
                            href="/landing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary underline"
                        >
                            Preview /landing
                        </a>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
