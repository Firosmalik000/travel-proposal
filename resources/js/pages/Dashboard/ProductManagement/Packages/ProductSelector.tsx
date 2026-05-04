import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Package, Search, X } from 'lucide-react';
import { useState } from 'react';
import type { ProductOption } from './types';

type Props = {
    options: ProductOption[];
    selected: number[];
    locale: 'id' | 'en';
    onChange: (ids: number[]) => void;
};

const typeConfig: Record<
    string,
    { label: string; emoji: string; pill: string }
> = {
    dokumen: {
        label: 'Dokumen',
        emoji: '📄',
        pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    transportasi: {
        label: 'Transportasi',
        emoji: '✈️',
        pill: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    },
    akomodasi: {
        label: 'Akomodasi',
        emoji: '🏨',
        pill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
    layanan: {
        label: 'Layanan',
        emoji: '🛎️',
        pill: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    },
    perlengkapan: {
        label: 'Perlengkapan',
        emoji: '🎒',
        pill: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    },
};

export function ProductSelector({
    options,
    selected,
    locale,
    onChange,
}: Props) {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');

    const selectedProducts = options.filter((p) => selected.includes(p.id));
    const availableTypes = [
        ...new Set(options.map((p) => p.product_type).filter(Boolean)),
    ];

    const filteredOptions = options.filter((p) => {
        if (selected.includes(p.id)) return false; // sudah dipilih, tidak tampil di dropdown
        const name = p.name?.[locale] || p.name?.id || p.code;
        const matchSearch =
            !search ||
            name.toLowerCase().includes(search.toLowerCase()) ||
            p.code.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || p.product_type === filterType;
        return matchSearch && matchType;
    });

    function add(id: number) {
        onChange([...selected, id]);
    }

    function remove(id: number) {
        onChange(selected.filter((x) => x !== id));
    }

    if (options.length === 0) {
        return (
            <div className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
                Belum ada produk aktif. Tambahkan produk di menu Product
                Management.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Selected products (chips) */}
            <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                    {selectedProducts.length === 0
                        ? 'Belum ada produk dipilih'
                        : `${selectedProducts.length} produk dipilih`}
                </p>
                {selectedProducts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedProducts.map((p) => {
                            const name =
                                p.name?.[locale] || p.name?.id || p.code;
                            const cfg = typeConfig[p.product_type] ?? {
                                label: p.product_type,
                                emoji: '📦',
                                pill: 'bg-gray-100 text-gray-700',
                            };
                            return (
                                <span
                                    key={p.id}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.pill}`}
                                >
                                    <span>{cfg.emoji}</span>
                                    <span>{name}</span>
                                    <button
                                        type="button"
                                        onClick={() => remove(p.id)}
                                        className="ml-0.5 rounded-full p-0.5 opacity-60 hover:opacity-100"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="rounded-full px-3 py-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
                        >
                            Hapus semua
                        </button>
                    </div>
                )}
            </div>

            {/* Search + filter */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-9 pl-8 text-sm"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-9 w-36 text-xs">
                        <SelectValue placeholder="Semua tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua tipe</SelectItem>
                        {availableTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                                {typeConfig[t]?.emoji}{' '}
                                {typeConfig[t]?.label ?? t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Available products list */}
            {filteredOptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-6 text-center">
                    <Package className="mb-1.5 h-6 w-6 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">
                        {search || filterType !== 'all'
                            ? 'Tidak ada produk yang cocok.'
                            : 'Semua produk sudah dipilih.'}
                    </p>
                </div>
            ) : (
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border bg-muted/20 p-2">
                    {filteredOptions.map((p) => {
                        const name = p.name?.[locale] || p.name?.id || p.code;
                        const cfg = typeConfig[p.product_type] ?? {
                            label: p.product_type,
                            emoji: '📦',
                            pill: 'bg-gray-100 text-gray-700',
                        };
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => add(p.id)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-background hover:shadow-sm"
                            >
                                <span className="text-base">{cfg.emoji}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">
                                        {name}
                                    </p>
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {p.code}
                                    </p>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.pill}`}
                                >
                                    {cfg.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
