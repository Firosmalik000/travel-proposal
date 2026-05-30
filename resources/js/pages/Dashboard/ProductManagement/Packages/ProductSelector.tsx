import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useState } from 'react';
import type { ProductOption } from './types';

type Props = {
    options: ProductOption[];
    selected: number[];
    locale: 'id' | 'en';
    onChange: (ids: number[]) => void;
};

const typeConfig: Record<string, { label: string; pill: string }> = {
    hotel: {
        label: 'Hotel',
        pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    tiket: {
        label: 'Tiket',
        pill: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    },
    merchandise: {
        label: 'Merchandise',
        pill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    },
    perlengkapan: {
        label: 'Perlengkapan',
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
    function productDisplayName(product: ProductOption): string {
        if (typeof product.name === 'string') {
            return product.name;
        }

        return product.name?.[locale] || product.name?.id || product.code;
    }

    const selectedProducts = options.filter((product) =>
        selected.includes(product.id),
    );
    const selectedProductsByType = selectedProducts.reduce(
        (groupedProducts, product) => {
            const typeKey = product.product_type || 'lainnya';

            if (!groupedProducts[typeKey]) {
                groupedProducts[typeKey] = [];
            }

            groupedProducts[typeKey].push(product);

            return groupedProducts;
        },
        {} as Record<string, ProductOption[]>,
    );
    const selectedTypeKeys = Object.keys(selectedProductsByType).sort((a, b) =>
        (typeConfig[a]?.label ?? a).localeCompare(typeConfig[b]?.label ?? b),
    );

    const availableTypes = [
        ...new Set(
            options.map((product) => product.product_type).filter(Boolean),
        ),
    ];

    const filteredOptions = options.filter((product) => {
        if (selected.includes(product.id)) {
            return false;
        }

        const name = productDisplayName(product);
        const matchSearch =
            !search ||
            name.toLowerCase().includes(search.toLowerCase()) ||
            product.code.toLowerCase().includes(search.toLowerCase());
        const matchType =
            filterType === 'all' || product.product_type === filterType;

        return matchSearch && matchType;
    });

    function add(id: number) {
        onChange([...selected, id]);
    }

    function remove(id: number) {
        onChange(selected.filter((selectedId) => selectedId !== id));
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
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-9 pl-8 text-sm"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-9 w-36 text-xs">
                        <SelectValue placeholder="Semua tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua tipe</SelectItem>
                        {availableTypes.map((typeValue) => (
                            <SelectItem key={typeValue} value={typeValue}>
                                {typeConfig[typeValue]?.label ?? typeValue}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {filteredOptions.length === 0 ? (
                <div className="rounded-xl border border-dashed py-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        {search || filterType !== 'all'
                            ? 'Tidak ada produk yang cocok.'
                            : 'Semua produk sudah dipilih.'}
                    </p>
                </div>
            ) : (
                <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border bg-muted/20 p-2">
                    {filteredOptions.map((product) => {
                        const name = productDisplayName(product);
                        const cfg = typeConfig[product.product_type] ?? {
                            label: product.product_type,
                            pill: 'bg-gray-100 text-gray-700',
                        };

                        return (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => add(product.id)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-background hover:shadow-sm"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">
                                        {name}
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

            <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                    {selectedProducts.length === 0
                        ? 'Belum ada produk dipilih'
                        : `${selectedProducts.length} produk dipilih`}
                </p>
                {selectedProducts.length > 0 && (
                    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
                        {selectedTypeKeys.map((typeKey) => {
                            const cfg = typeConfig[typeKey] ?? {
                                label: typeKey,
                                pill: 'bg-gray-100 text-gray-700',
                            };

                            return (
                                <div key={typeKey} className="space-y-2">
                                    <p className="text-xs font-semibold text-foreground/80">
                                        {cfg.label}
                                        <span className="ml-1 text-muted-foreground">
                                            (
                                            {
                                                selectedProductsByType[typeKey]
                                                    .length
                                            }
                                            )
                                        </span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProductsByType[typeKey].map(
                                            (product) => {
                                                const name =
                                                    productDisplayName(product);

                                                return (
                                                    <span
                                                        key={product.id}
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.pill}`}
                                                    >
                                                        <span>{name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                remove(
                                                                    product.id,
                                                                )
                                                            }
                                                            className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </span>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => onChange([])}
                            className="w-fit rounded-full px-3 py-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
                        >
                            Hapus semua
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
