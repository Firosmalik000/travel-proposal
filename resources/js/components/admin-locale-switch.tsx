import { Button } from '@/components/ui/button';
import { useAdminLocale } from '@/contexts/admin-locale';
import { cn } from '@/lib/utils';

export function AdminLocaleSwitch({ className }: { className?: string }) {
    const { locale, setLocale } = useAdminLocale();

    return (
        <div className={cn('inline-flex items-center rounded-full border border-border bg-card p-1 shadow-sm', className)}>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLocale('id')}
                className={cn('h-8 rounded-full px-3 text-xs font-semibold', locale === 'id' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground')}
            >
                ID
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLocale('en')}
                className={cn('h-8 rounded-full px-3 text-xs font-semibold', locale === 'en' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground')}
            >
                EN
            </Button>
        </div>
    );
}
