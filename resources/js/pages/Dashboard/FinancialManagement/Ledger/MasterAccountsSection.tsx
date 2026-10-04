import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/use-permission';
import { formatIdr } from '@/lib/number-format';
import {
    Building2,
    CreditCard,
    Landmark,
    MoreHorizontal,
    Pencil,
    Search,
    Wallet,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export type Account = {
    id: number;
    code: string;
    name: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    is_cash_account: boolean;
    cash_account_type:
        | 'customer_funds'
        | 'operating'
        | 'petty_cash'
        | 'legacy'
        | null;
    account_number: string | null;
    currency: string;
    system_key: string | null;
    is_active: boolean;
    has_opening_balance: boolean;
    debit_total: number;
    credit_total: number;
    balance_idr: number;
};

type Props = {
    accounts: Account[];
    can: ReturnType<typeof usePermission>['can'];
    isSuperAdmin: boolean;
    openAccountForm: (account?: Account) => void;
    openOpeningForm: (account: Account) => void;
};

const accountTypeLabels: Record<Account['type'], string> = {
    asset: 'Aset',
    liability: 'Liabilitas',
    equity: 'Ekuitas',
    revenue: 'Pendapatan',
    expense: 'Biaya',
};

const cashAccountTypeLabels: Record<string, string> = {
    customer_funds: 'Dana jemaah',
    operating: 'Operasional',
    petty_cash: 'Kas kecil',
    legacy: 'Rekening lama',
};

const accountTypeBadges: Record<
    Account['type'],
    { label: string; className: string }
> = {
    asset: {
        label: 'Aset',
        className:
            'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    },
    liability: {
        label: 'Liabilitas',
        className:
            'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    },
    equity: {
        label: 'Ekuitas',
        className:
            'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
    },
    revenue: {
        label: 'Pendapatan',
        className:
            'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    },
    expense: {
        label: 'Biaya',
        className:
            'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    },
};

type TypeTabKey = 'all' | Account['type'];

const typeTabs: Array<{ key: TypeTabKey; label: string }> = [
    { key: 'all', label: 'Semua Akun' },
    { key: 'asset', label: 'Aset' },
    { key: 'liability', label: 'Liabilitas' },
    { key: 'equity', label: 'Ekuitas' },
    { key: 'revenue', label: 'Pendapatan' },
    { key: 'expense', label: 'Biaya' },
];

export default function MasterAccountsSection({
    accounts,
    can,
    isSuperAdmin,
    openAccountForm,
    openOpeningForm,
}: Props) {
    const [selectedType, setSelectedType] = useState<TypeTabKey>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        'all' | 'active' | 'inactive'
    >('all');
    const [cashOnlyFilter, setCashOnlyFilter] = useState(false);

    const typeCounts = useMemo(() => {
        const counts: Record<TypeTabKey, number> = {
            all: accounts.length,
            asset: 0,
            liability: 0,
            equity: 0,
            revenue: 0,
            expense: 0,
        };

        for (const account of accounts) {
            if (counts[account.type] !== undefined) {
                counts[account.type]++;
            }
        }

        return counts;
    }, [accounts]);

    const filteredAccounts = useMemo(() => {
        return accounts.filter((account) => {
            if (selectedType !== 'all' && account.type !== selectedType) {
                return false;
            }

            if (statusFilter === 'active' && !account.is_active) {
                return false;
            }

            if (statusFilter === 'inactive' && account.is_active) {
                return false;
            }

            if (cashOnlyFilter && !account.is_cash_account) {
                return false;
            }

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchCode = account.code.toLowerCase().includes(query);
                const matchName = account.name.toLowerCase().includes(query);
                const matchAccNum = account.account_number
                    ?.toLowerCase()
                    .includes(query);
                const matchSystem = account.system_key
                    ?.toLowerCase()
                    .includes(query);

                if (!matchCode && !matchName && !matchAccNum && !matchSystem) {
                    return false;
                }
            }

            return true;
        });
    }, [accounts, selectedType, statusFilter, cashOnlyFilter, searchQuery]);

    const hasActiveFilters =
        searchQuery.trim() !== '' || statusFilter !== 'all' || cashOnlyFilter;

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCashOnlyFilter(false);
    };

    return (
        <div className="space-y-4">
            {/* Tab Navigasi Per Type */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border bg-muted/40 p-1.5">
                {typeTabs.map((tab) => {
                    const isActive = selectedType === tab.key;
                    const count = typeCounts[tab.key];

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setSelectedType(tab.key)}
                            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all sm:text-sm ${
                                isActive
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                            }`}
                        >
                            <span>{tab.label}</span>
                            <span
                                className={`py-0.2 rounded-full px-1.5 text-[11px] font-semibold transition-colors ${
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Toolbar Filter & Pencarian */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 sm:max-w-md">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Cari kode, nama akun, atau no. rekening..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-9 pl-9 text-sm"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label="Bersihkan pencarian"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={statusFilter}
                        onValueChange={(val: 'all' | 'active' | 'inactive') =>
                            setStatusFilter(val)
                        }
                    >
                        <SelectTrigger className="w-[140px] text-xs sm:text-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        type="button"
                        variant={cashOnlyFilter ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCashOnlyFilter(!cashOnlyFilter)}
                        className="h-9 gap-1.5 text-xs sm:text-sm"
                    >
                        <Wallet className="size-3.5" />
                        <span>Hanya Kas/Bank</span>
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="h-9 text-xs text-muted-foreground hover:text-foreground"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabel Akun */}
            <Card>
                <CardContent className="overflow-x-auto p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-12 text-center text-xs">
                                    No.
                                </TableHead>
                                <TableHead className="w-14 text-center text-xs">
                                    Aksi
                                </TableHead>
                                <TableHead className="min-w-[200px] text-xs">
                                    Akun
                                </TableHead>
                                <TableHead className="w-28 text-xs">
                                    Tipe
                                </TableHead>
                                <TableHead className="min-w-[150px] text-xs">
                                    Rekening Kas/Bank
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Debit
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Kredit
                                </TableHead>
                                <TableHead className="text-right text-xs">
                                    Saldo Akhir
                                </TableHead>
                                <TableHead className="w-24 text-center text-xs">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAccounts.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="h-44 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <Building2 className="size-8 stroke-1 text-muted-foreground/60" />
                                            <p className="text-sm font-medium">
                                                Tidak ada akun ditemukan
                                            </p>
                                            {hasActiveFilters && (
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    size="sm"
                                                    onClick={resetFilters}
                                                    className="h-auto p-0 text-xs"
                                                >
                                                    Hapus filter pencarian
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAccounts.map((account, index) => {
                                    const badgeConfig = accountTypeBadges[
                                        account.type
                                    ] ?? {
                                        label: accountTypeLabels[account.type],
                                        className: '',
                                    };

                                    return (
                                        <TableRow
                                            key={account.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <TableCell className="text-center text-xs text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isSuperAdmin &&
                                                    (can('edit') ||
                                                        (can('create') &&
                                                            account.is_active &&
                                                            !account.has_opening_balance &&
                                                            account.system_key !==
                                                                'opening_balance_equity')) && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    aria-label={`Aksi ${account.name}`}
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="size-8"
                                                                >
                                                                    <MoreHorizontal className="size-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start">
                                                                {can(
                                                                    'edit',
                                                                ) && (
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            openAccountForm(
                                                                                account,
                                                                            )
                                                                        }
                                                                        className="cursor-pointer gap-2"
                                                                    >
                                                                        <Pencil className="size-4" />
                                                                        <span>
                                                                            Edit
                                                                            akun
                                                                        </span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {can(
                                                                    'create',
                                                                ) &&
                                                                    account.is_active &&
                                                                    !account.has_opening_balance &&
                                                                    account.system_key !==
                                                                        'opening_balance_equity' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                openOpeningForm(
                                                                                    account,
                                                                                )
                                                                            }
                                                                            className="cursor-pointer gap-2"
                                                                        >
                                                                            <Landmark className="size-4" />
                                                                            <span>
                                                                                Catat
                                                                                saldo
                                                                                awal
                                                                            </span>
                                                                        </DropdownMenuItem>
                                                                    )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded bg-muted/80 px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                                                            {account.code}
                                                        </span>
                                                        <span className="text-sm font-medium text-foreground">
                                                            {account.name}
                                                        </span>
                                                        {account.system_key && (
                                                            <span className="py-0.2 rounded bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                                                                Sistem
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {account.currency}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${badgeConfig.className}`}
                                                >
                                                    {badgeConfig.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {account.is_cash_account ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                            <CreditCard className="size-3.5 text-muted-foreground" />
                                                            {account.cash_account_type
                                                                ? (cashAccountTypeLabels[
                                                                      account
                                                                          .cash_account_type
                                                                  ] ??
                                                                  account.cash_account_type)
                                                                : 'Kas/Bank'}
                                                        </span>
                                                        {account.account_number && (
                                                            <span className="font-mono text-[11px] text-muted-foreground">
                                                                {
                                                                    account.account_number
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs">
                                                {formatIdr(account.debit_total)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs">
                                                {formatIdr(
                                                    account.credit_total,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                                                {formatIdr(account.balance_idr)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        account.is_active
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    <span
                                                        className={`size-1.5 rounded-full ${
                                                            account.is_active
                                                                ? 'bg-emerald-500'
                                                                : 'bg-muted-foreground'
                                                        }`}
                                                    />
                                                    {account.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Footer Info */}
            <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                <span>
                    Menampilkan {filteredAccounts.length} dari {accounts.length}{' '}
                    akun
                </span>
                {selectedType !== 'all' && (
                    <span>Kategori: {accountTypeLabels[selectedType]}</span>
                )}
            </div>
        </div>
    );
}
