import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Clock3, Power } from 'lucide-react';

type Props = {
    settings: {
        auto_cancellation_enabled: boolean;
    };
};

type ScheduleFormData = {
    auto_cancellation_enabled: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Schedule settings',
        href: '/settings/schedule',
    },
];

export default function Schedule({ settings }: Props) {
    const form = useForm<ScheduleFormData>({
        auto_cancellation_enabled: settings.auto_cancellation_enabled,
    });

    function submit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        form.patch('/settings/schedule', {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedule settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Schedule settings"
                        description="Kelola toggle untuk proses booking otomatis yang dijalankan oleh scheduler."
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <Card>
                            <CardHeader className="gap-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <CardTitle>Auto Cancellation</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Aktifkan atau nonaktifkan proses
                                            auto cancellation yang dijalankan
                                            oleh scheduler server.
                                        </p>
                                    </div>
                                    <Badge
                                        variant={
                                            form.data.auto_cancellation_enabled
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="shrink-0"
                                    >
                                        {form.data.auto_cancellation_enabled
                                            ? 'Active'
                                            : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="auto_cancellation_enabled"
                                            className="text-sm font-medium"
                                        >
                                            Enable auto cancellation
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Saat aktif, command scheduler bisa
                                            melanjutkan proses pembatalan
                                            otomatis. Saat nonaktif, command
                                            bisa dilewati dari sisi aplikasi.
                                        </p>
                                    </div>
                                    <Switch
                                        id="auto_cancellation_enabled"
                                        checked={
                                            form.data.auto_cancellation_enabled
                                        }
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'auto_cancellation_enabled',
                                                checked,
                                            )
                                        }
                                    />
                                </div>

                                {form.errors.auto_cancellation_enabled && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.auto_cancellation_enabled}
                                    </p>
                                )}

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="rounded-xl border border-border/60 p-4">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Clock3 className="h-4 w-4" />
                                            Scheduler
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Jadwal tetap dikelola di Laravel
                                            scheduler dan server cron.
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-border/60 p-4">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Power className="h-4 w-4" />
                                            Runtime toggle
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Halaman ini hanya mengontrol status
                                            aktif atau nonaktif dari proses auto
                                            cancellation.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        {form.processing
                                            ? 'Menyimpan...'
                                            : 'Simpan pengaturan'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
