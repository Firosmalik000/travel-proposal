import { Button } from '@/components/ui/button';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    from: number | null;
    links: PaginationLink[];
    to: number | null;
    total: number;
    onNavigate: (url: string) => void;
};

export function BookingListingPagination({
    from,
    links,
    to,
    total,
    onNavigate,
}: Props) {
    return (
        <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>
                Menampilkan{' '}
                <span className="font-medium text-foreground">{from ?? 0}</span>{' '}
                - <span className="font-medium text-foreground">{to ?? 0}</span>{' '}
                dari{' '}
                <span className="font-medium text-foreground">{total}</span>{' '}
                booking
            </p>
            <div className="flex flex-wrap justify-end gap-2">
                {links.map((link, index) => (
                    <Button
                        key={`${link.label}-${index}`}
                        type="button"
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={link.url === null}
                        onClick={() => {
                            if (link.url) {
                                onNavigate(link.url);
                            }
                        }}
                    >
                        <span
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    </Button>
                ))}
            </div>
        </div>
    );
}
