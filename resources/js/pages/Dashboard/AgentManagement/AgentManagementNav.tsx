import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { BadgeDollarSign, HandCoins, Users } from 'lucide-react';

export default function AgentManagementNav({
    active,
}: {
    active: 'agents' | 'fees' | 'commissions';
}) {
    const items = [
        ['agents', 'Data Agen', '/admin/agent-management/agents', Users],
        [
            'fees',
            'Aturan Fee Paket',
            '/admin/agent-management/fees',
            BadgeDollarSign,
        ],
        [
            'commissions',
            'Komisi Agen',
            '/admin/agent-management/commissions',
            HandCoins,
        ],
    ] as const;
    return (
        <div className="flex flex-wrap gap-2">
            {items.map(([key, label, href, Icon]) => (
                <Button
                    key={key}
                    asChild
                    variant={active === key ? 'default' : 'outline'}
                >
                    <Link href={href}>
                        <Icon className="size-4" />
                        {label}
                    </Link>
                </Button>
            ))}
        </div>
    );
}
