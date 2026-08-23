import { Card, CardContent } from '@/components/ui/card';
import AgentLayout from '@/layouts/agent-layout';
import { formatDate } from '@/lib/date-format';
import { Head } from '@inertiajs/react';
import { Phone } from 'lucide-react';
import {
    PageIntro,
    PaginationLinks,
    RecordFilters,
    StatusBadge,
} from './components/PortalUi';
import type { AgentLead, Paginated, PortalFilters } from './types';

export default function Leads({
    leads,
    filters,
}: {
    leads: Paginated<AgentLead>;
    filters: PortalFilters;
}) {
    return (
        <AgentLayout title="Leads Referral">
            <Head title="Leads Referral" />
            <PageIntro
                eyebrow="Pipeline Referral"
                title="Leads Referral"
                description="Registrasi yang masuk dari kode referral Anda dan masih menunggu diproses menjadi booking."
            />
            <div className="mt-5">
                <RecordFilters
                    route="/agent/leads"
                    filters={filters}
                    statuses={[
                        { value: 'pending', label: 'Menunggu' },
                        { value: 'rejected', label: 'Ditolak' },
                    ]}
                />
            </div>
            <Card className="mt-4 border-slate-200 dark:border-slate-700">
                <CardContent className="grid gap-3 p-3 sm:p-5">
                    {leads.data.length === 0 ? (
                        <Empty text="Tidak ada lead yang sesuai filter." />
                    ) : (
                        leads.data.map((lead) => (
                            <article
                                key={lead.id}
                                className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_auto] md:items-center dark:border-slate-700"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-mono text-sm font-bold text-[#0d5c52] dark:text-emerald-300">
                                            {lead.reference}
                                        </p>
                                        <StatusBadge status={lead.status} />
                                    </div>
                                    <h2 className="mt-2 truncate font-semibold text-slate-950 dark:text-white">
                                        {lead.customer_name}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {lead.package_name} ·{' '}
                                        {lead.passenger_count} pax · masuk{' '}
                                        {formatDate(lead.created_at)}
                                    </p>
                                </div>
                                <a
                                    href={`tel:${lead.phone}`}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d5c52] dark:text-emerald-300"
                                >
                                    <Phone className="size-4" /> {lead.phone}
                                </a>
                            </article>
                        ))
                    )}
                    <PaginationLinks page={leads} />
                </CardContent>
            </Card>
        </AgentLayout>
    );
}

function Empty({ text }: { text: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
            {text}
        </div>
    );
}
