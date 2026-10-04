import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatDate } from '@/lib/date-format';
import { formatDecimalInput, formatIdr } from '@/lib/number-format';
import { SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeftRight,
    ArrowRight,
    BookOpenCheck,
    CheckCircle2,
    ChevronDown,
    Download,
    FileText,
    Info,
    Landmark,
    Layers,
    Plus,
    RotateCcw,
    Wallet,
} from 'lucide-react';
import {
    Children,
    cloneElement,
    FormEvent,
    isValidElement,
    ReactElement,
    ReactNode,
    useId,
    useState,
} from 'react';
import { toast } from 'sonner';
import MasterAccountsSection from './MasterAccountsSection';
import TransactionsDataTable from './TransactionsDataTable';
import TransactionTypesSection, {
    TransactionType,
} from './TransactionTypesSection';
import VendorHppTrackingSection, {
    TripFinanceTracking,
    VendorBillTracking,
} from './VendorHppTrackingSection';

type Account = {
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

type Transaction = {
    id: number;
    transaction_number: string;
    transaction_date: string;
    transaction_type: string;
    category_code: string | null;
    category_label: string | null;
    status: 'draft' | 'posted' | 'reversed';
    currency: string;
    exchange_rate: string;
    amount_original: string;
    amount_idr: number;
    description: string | null;
    source_type: string | null;
    reversal_of_id: number | null;
    reversal_number: string | null;
    can_reverse: boolean;
    posted_at: string | null;
    posted_by_name: string | null;
    lines: Array<{
        id: number;
        entry_type: 'debit' | 'credit';
        amount_original: string;
        amount_idr: number;
        description: string | null;
        account: { id: number; code: string; name: string };
    }>;
};

type Props = {
    workspace: 'transactions' | 'vendor-hpp' | 'accounting' | 'master';
    permissionKey: string;
    today: string;
    filters: {
        date_from: string;
        date_to: string;
        account_id: string;
        transaction_type: string;
        category_code: string;
        status: string;
        search: string;
    };
    accounts: Account[];
    transactionCategories: Array<{
        value: string;
        label: string;
        transaction_types: string[];
        is_active: boolean;
    }>;
    transactionTypes: TransactionType[];
    transactions: {
        data: Transaction[];
        current_page: number;
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
        last_page: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    summary: {
        accounts: number;
        active_accounts: number;
        cash_accounts: number;
        cash_balance_idr: number;
    };
    vendorHppSummary: {
        trips?: number;
        registered_customers?: number;
        actual_hpp_idr?: number;
        billed_idr?: number;
        paid_idr?: number;
        vendor_payable_idr?: number;
        remaining_actual_hpp_idr?: number;
        recognized_hpp_idr?: number;
        open_bills?: number;
        overdue_bills?: number;
    };
    tripFinanceRows: TripFinanceTracking[];
    accountMappings: Array<{
        source: string;
        debit: string;
        credit: string;
    }>;
    vendorOptions: Array<{ id: number; name: string }>;
    packageOptions: Array<{ id: number; code: string; name: string }>;
    vendorBills: Array<{
        id: number;
        package_vendor_id: number | null;
        vendor_name: string;
        amount_idr: number;
        paid_amount_idr: number;
        remaining_amount_idr: number;
        status: string;
    }>;
    vendorAdvanceOptions: Array<{
        id: number;
        package_vendor_id: number;
        vendor_name: string;
        remaining_amount_idr: number;
    }>;
    vendorAllocations: Array<{
        id: number;
        allocation_date: string;
        vendor_name: string;
        invoice_number: string | null;
        amount_idr: number;
        notes: string | null;
    }>;
    vendorServiceBills: Array<{
        id: number;
        vendor_name: string;
        remaining_amount_idr: number;
    }>;
    tripOptions: Array<{
        id: number;
        code: string;
        name: string;
        start_date: string | null;
        end_date: string | null;
        operational_status: string;
        next_status: string | null;
        blockers: string[];
        revenue_amount_idr: number;
        registered_bookings: number;
        open_vendor_bills: number;
        pending_inventory: number;
    }>;
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

const tripStatusLabels: Record<string, string> = {
    planning: 'Perencanaan',
    ready: 'Siap berangkat',
    departed: 'Berangkat',
    returned: 'Sudah kembali',
    financially_closed: 'Ditutup finansial',
};

function idempotencyKey(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Index({
    workspace,
    permissionKey,
    today,
    filters,
    accounts,
    transactionCategories,
    transactionTypes,
    transactions,
    summary,
    vendorHppSummary,
    tripFinanceRows,
    accountMappings,
    vendorOptions,
    packageOptions,
    vendorAdvanceOptions,
    vendorAllocations,
    vendorServiceBills,
    tripOptions,
}: Props) {
    const { can } = usePermission(permissionKey);
    const isSuperAdmin = Boolean(
        usePage<SharedData>().props.auth.user?.is_super_admin,
    );
    const activeAccounts = accounts.filter((account) => account.is_active);
    const cashAccounts = activeAccounts.filter(
        (account) => account.is_cash_account,
    );
    const [ledgerFilters, setLedgerFilters] = useState(filters);
    const [filterProcessing, setFilterProcessing] = useState(false);
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [showOpeningForm, setShowOpeningForm] = useState(false);
    const [showJournalForm, setShowJournalForm] = useState(false);
    const [showCashForm, setShowCashForm] = useState(false);
    const [showVendorBillForm, setShowVendorBillForm] = useState(false);
    const [payingVendorBill, setPayingVendorBill] =
        useState<VendorBillTracking | null>(null);
    const [showVendorAdvanceForm, setShowVendorAdvanceForm] = useState(false);
    const [allocatingBill, setAllocatingBill] =
        useState<VendorBillTracking | null>(null);
    const [usingServiceBill, setUsingServiceBill] = useState<
        Props['vendorServiceBills'][number] | null
    >(null);
    const [transitioningTrip, setTransitioningTrip] = useState<
        Props['tripOptions'][number] | null
    >(null);
    const pageCopy = {
        transactions: {
            title: 'Transaksi Keuangan',
            description:
                'Catat uang masuk, uang keluar, dan transfer dana. Setiap transaksi otomatis membentuk jurnal seimbang.',
        },
        'vendor-hpp': {
            title: 'HPP & Hutang Vendor',
            description:
                'Pantau HPP aktual, tagihan, pembayaran, sisa hutang, dan realisasi biaya untuk setiap trip.',
        },
        accounting: {
            title: 'Pembukuan',
            description:
                'Tinjau seluruh jurnal otomatis dan manual, detail debit-kredit, serta koreksi tanpa menghapus histori.',
        },
        master: {
            title: 'Master Keuangan',
            description:
                'Kelola bagan akun (Chart of Accounts), rekening kas & bank, serta saldo awal.',
        },
    }[workspace];

    const accountForm = useForm({
        code: '',
        name: '',
        type: 'asset' as Account['type'],
        is_cash_account: false,
        cash_account_type: '',
        account_number: '',
        currency: 'IDR',
        is_active: true,
    });
    const openingForm = useForm({
        financial_account_id: '',
        transaction_date: today,
        currency: 'IDR',
        exchange_rate: formatDecimalInput(1, 8),
        amount_original: '',
        amount_idr: '',
        description: '',
        idempotency_key: idempotencyKey('opening'),
    });
    const journalForm = useForm({
        transaction_date: today,
        transaction_type: 'manual_journal',
        category_code: '',
        debit_account_id: '',
        credit_account_id: '',
        currency: 'IDR',
        exchange_rate: formatDecimalInput(1, 8),
        amount_original: '',
        amount_idr: '',
        description: '',
        idempotency_key: idempotencyKey('journal'),
    });
    const transferForm = useForm({
        transaction_date: today,
        transaction_type: 'transfer',
        category_code: 'inter_account_transfer',
        credit_account_id: '',
        debit_account_id: '',
        currency: 'IDR',
        exchange_rate: formatDecimalInput(1, 8),
        amount_original: '',
        amount_idr: '',
        description: '',
        idempotency_key: idempotencyKey('transfer'),
    });
    const cashForm = useForm({
        transaction_type: 'operating_expense',
        financial_account_id: '',
        package_id: '',
        transaction_date: today,
        currency: 'IDR',
        exchange_rate: formatDecimalInput(1, 8),
        amount_original: '',
        amount_idr: '',
        description: '',
        idempotency_key: idempotencyKey('cash'),
    });
    const vendorBillForm = useForm({
        package_vendor_id: '',
        package_id: '',
        vendor_invoice_number: '',
        bill_date: today,
        due_date: '',
        amount_idr: '',
        notes: '',
        idempotency_key: idempotencyKey('vendor-bill'),
    });
    const vendorPaymentForm = useForm({
        amount_idr: '',
        payment_date: today,
        financial_account_id: '',
        notes: '',
        idempotency_key: idempotencyKey('vendor-payment'),
    });
    const vendorAdvanceForm = useForm({
        package_vendor_id: '',
        amount_idr: '',
        advance_date: today,
        financial_account_id: '',
        notes: '',
        idempotency_key: idempotencyKey('vendor-advance'),
    });
    const allocationForm = useForm({
        vendor_advance_id: '',
        amount_idr: '',
        allocation_date: today,
        notes: '',
        idempotency_key: idempotencyKey('vendor-advance-application'),
    });
    const serviceUseForm = useForm({
        amount_idr: '',
        usage_date: today,
        notes: '',
        idempotency_key: idempotencyKey('vendor-service-use'),
    });
    const tripTransitionForm = useForm({
        to_status: '',
        occurred_date: today,
        notes: '',
        idempotency_key: idempotencyKey('trip-transition'),
    });
    const transferSource = cashAccounts.find(
        (account) =>
            account.id.toString() === transferForm.data.credit_account_id,
    );
    const transferDestination = cashAccounts.find(
        (account) =>
            account.id.toString() === transferForm.data.debit_account_id,
    );
    const transferAmount = Number(transferForm.data.amount_idr || 0);
    const transferHasSufficientFunds =
        !transferSource || transferSource.balance_idr >= transferAmount;
    const transferReady = Boolean(
        transferForm.data.credit_account_id &&
            transferForm.data.debit_account_id &&
            transferForm.data.credit_account_id !==
                transferForm.data.debit_account_id &&
            transferAmount > 0 &&
            transferHasSufficientFunds &&
            transferForm.data.transaction_date &&
            transferForm.data.description.trim(),
    );
    const transferCategoryOptions = transactionCategories.filter(
        (category) =>
            category.is_active &&
            category.transaction_types.includes('transfer'),
    );
    const journalCategoryOptions = transactionCategories.filter(
        (category) =>
            category.is_active &&
            category.transaction_types.includes('manual_journal'),
    );
    const selectedJournalType = transactionTypes.find(
        (type) =>
            type.code === journalForm.data.category_code &&
            type.applies_to === 'manual_journal',
    );
    const selectedJournalDebitAccount = activeAccounts.find(
        (account) =>
            account.id.toString() === journalForm.data.debit_account_id,
    );
    const selectedJournalCreditAccount = activeAccounts.find(
        (account) =>
            account.id.toString() === journalForm.data.credit_account_id,
    );
    const journalTouchesCashAccount = Boolean(
        selectedJournalDebitAccount?.is_cash_account ||
            selectedJournalCreditAccount?.is_cash_account,
    );
    const journalAmount = Number(journalForm.data.amount_idr || 0);
    const journalReady = Boolean(
        journalForm.data.debit_account_id &&
            journalForm.data.credit_account_id &&
            journalForm.data.debit_account_id !==
                journalForm.data.credit_account_id &&
            journalAmount > 0 &&
            journalForm.data.transaction_date &&
            journalForm.data.category_code &&
            journalForm.data.description.trim(),
    );
    const matchingAdvances = vendorAdvanceOptions.filter(
        (advance) =>
            advance.package_vendor_id === allocatingBill?.package_vendor_id,
    );
    const selectedOpeningAccount = accounts.find(
        (account) =>
            account.id.toString() === openingForm.data.financial_account_id,
    );
    const accountError = (accountForm.errors as Record<string, string>).account;
    const openingLedgerError = (openingForm.errors as Record<string, string>)
        .ledger;
    const journalLedgerError = (journalForm.errors as Record<string, string>)
        .ledger;
    const transferLedgerError = (transferForm.errors as Record<string, string>)
        .ledger;
    const cashLedgerError = (cashForm.errors as Record<string, string>).ledger;
    const vendorError = (vendorBillForm.errors as Record<string, string>)
        .vendor;

    const openAccountForm = (account?: Account) => {
        setEditingAccount(account ?? null);
        accountForm.setData(
            account
                ? {
                      code: account.code,
                      name: account.name,
                      type: account.type,
                      is_cash_account: account.is_cash_account,
                      cash_account_type: account.cash_account_type ?? '',
                      account_number: account.account_number ?? '',
                      currency: account.currency,
                      is_active: account.is_active,
                  }
                : {
                      code: '',
                      name: '',
                      type: 'asset',
                      is_cash_account: false,
                      cash_account_type: '',
                      account_number: '',
                      currency: 'IDR',
                      is_active: true,
                  },
        );
        accountForm.clearErrors();
        setShowAccountForm(true);
    };

    const openOpeningForm = (account: Account) => {
        openingForm.setData({
            financial_account_id: account.id.toString(),
            transaction_date: today,
            currency: account.currency,
            exchange_rate: formatDecimalInput(1, 8),
            amount_original: '',
            amount_idr: '',
            description: '',
            idempotency_key: idempotencyKey('opening'),
        });
        openingForm.clearErrors();
        setShowOpeningForm(true);
    };

    const submitAccount = (event: FormEvent) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    editingAccount ? 'Akun diperbarui.' : 'Akun ditambahkan.',
                );
                setShowAccountForm(false);
            },
        };

        if (editingAccount) {
            accountForm.put(
                `/admin/financial-management/ledger/accounts/${editingAccount.id}`,
                options,
            );
        } else {
            accountForm.post(
                '/admin/financial-management/ledger/accounts',
                options,
            );
        }
    };

    const submitOpening = (event: FormEvent) => {
        event.preventDefault();
        openingForm.post(
            '/admin/financial-management/ledger/opening-balances',
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Saldo awal diposting.');
                    openingForm.reset(
                        'amount_original',
                        'amount_idr',
                        'description',
                    );
                    openingForm.setData(
                        'idempotency_key',
                        idempotencyKey('opening'),
                    );
                    setShowOpeningForm(false);
                },
            },
        );
    };

    const postJournal = () => {
        journalForm.post('/admin/financial-management/ledger/journals', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Jurnal manual berhasil diposting.');
                journalForm.reset(
                    'amount_original',
                    'amount_idr',
                    'category_code',
                    'description',
                );
                journalForm.setData(
                    'idempotency_key',
                    idempotencyKey('journal'),
                );
                setShowJournalForm(false);
            },
        });
    };

    const submitJournal = (event: FormEvent) => {
        event.preventDefault();
        postJournal();
    };

    const openTransfer = () => {
        transferForm.setData({
            transaction_date: today,
            transaction_type: 'transfer',
            category_code: 'inter_account_transfer',
            credit_account_id: '',
            debit_account_id: '',
            currency: 'IDR',
            exchange_rate: formatDecimalInput(1, 8),
            amount_original: '',
            amount_idr: '',
            description: '',
            idempotency_key: idempotencyKey('transfer'),
        });
        transferForm.clearErrors();
        setShowTransferForm(true);
    };

    const submitTransfer = (event: FormEvent) => {
        event.preventDefault();
        transferForm.post('/admin/financial-management/ledger/transfers', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Transfer dana berhasil diposting.');
                transferForm.reset();
                transferForm.setData({
                    transaction_date: today,
                    transaction_type: 'transfer',
                    category_code: 'inter_account_transfer',
                    credit_account_id: '',
                    debit_account_id: '',
                    currency: 'IDR',
                    exchange_rate: formatDecimalInput(1, 8),
                    amount_original: '',
                    amount_idr: '',
                    description: '',
                    idempotency_key: idempotencyKey('transfer'),
                });
                setShowTransferForm(false);
            },
        });
    };

    const submitCash = (event: FormEvent) => {
        event.preventDefault();
        cashForm.post('/admin/financial-management/ledger/cash-transactions', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Transaksi kas diposting.');
                cashForm.reset('amount_original', 'amount_idr', 'description');
                cashForm.setData('package_id', '');
                cashForm.setData('idempotency_key', idempotencyKey('cash'));
                setShowCashForm(false);
            },
        });
    };

    const openCashTransaction = (
        transactionType:
            | 'other_income'
            | 'operating_expense'
            | 'capital_contribution'
            | 'owner_withdrawal',
    ) => {
        cashForm.setData('transaction_type', transactionType);
        cashForm.setData('package_id', '');
        cashForm.clearErrors();
        setShowCashForm(true);
    };

    const openJournal = (transactionType: 'manual_journal') => {
        journalForm.setData('transaction_type', transactionType);
        journalForm.setData('category_code', '');
        journalForm.clearErrors();
        setShowJournalForm(true);
    };

    const ledgerPath =
        workspace === 'transactions'
            ? '/admin/financial-management/transactions'
            : '/admin/financial-management/accounting';

    const applyLedgerFilters = (nextFilters = ledgerFilters) => {
        router.get(ledgerPath, nextFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setFilterProcessing(true),
            onFinish: () => setFilterProcessing(false),
        });
    };

    const setDatePreset = (preset: 'today' | 'yesterday' | 'month') => {
        const current = new Date(`${today}T12:00:00`);
        let dateFrom = today;
        let dateTo = today;

        if (preset === 'yesterday') {
            current.setDate(current.getDate() - 1);
            dateFrom = current.toISOString().slice(0, 10);
            dateTo = dateFrom;
        } else if (preset === 'month') {
            dateFrom = `${today.slice(0, 7)}-01`;
        }

        const next = { ...ledgerFilters, date_from: dateFrom, date_to: dateTo };
        setLedgerFilters(next);
        applyLedgerFilters(next);
    };

    const resetLedgerFilters = () => {
        const next = {
            date_from: '',
            date_to: '',
            account_id: '',
            transaction_type: '',
            category_code: '',
            status: '',
            search: '',
        };
        setLedgerFilters(next);
        applyLedgerFilters(next);
    };

    const exportLedger = (
        report: 'journal' | 'general-ledger',
        format: 'pdf' | 'csv',
    ) => {
        const parameters = new URLSearchParams({ report });
        Object.entries(ledgerFilters).forEach(([key, value]) => {
            if (value) parameters.set(key, value);
        });
        window.open(
            `/admin/financial-management/ledger/export/${format}?${parameters.toString()}`,
            '_blank',
        );
    };

    const submitVendorBill = (event: FormEvent) => {
        event.preventDefault();
        vendorBillForm.post('/admin/financial-management/ledger/vendor-bills', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tagihan vendor dicatat.');
                setShowVendorBillForm(false);
                vendorBillForm.reset();
                vendorBillForm.setData(
                    'idempotency_key',
                    idempotencyKey('vendor-bill'),
                );
            },
        });
    };

    const submitVendorPayment = (event: FormEvent) => {
        event.preventDefault();
        if (!payingVendorBill) return;
        vendorPaymentForm.post(
            `/admin/financial-management/ledger/vendor-bills/${payingVendorBill.id}/payments`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Pembayaran vendor dicatat.');
                    setPayingVendorBill(null);
                },
            },
        );
    };

    const submitVendorAdvance = (event: FormEvent) => {
        event.preventDefault();
        vendorAdvanceForm.post(
            '/admin/financial-management/ledger/vendor-advances',
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Uang muka vendor dicatat.');
                    setShowVendorAdvanceForm(false);
                    vendorAdvanceForm.reset();
                    vendorAdvanceForm.setData(
                        'idempotency_key',
                        idempotencyKey('vendor-advance'),
                    );
                },
            },
        );
    };

    const submitAdvanceAllocation = (event: FormEvent) => {
        event.preventDefault();
        if (!allocatingBill || !allocationForm.data.vendor_advance_id) return;
        allocationForm.post(
            `/admin/financial-management/ledger/vendor-advances/${allocationForm.data.vendor_advance_id}/bills/${allocatingBill.id}/apply`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Uang muka dialokasikan.');
                    setAllocatingBill(null);
                },
            },
        );
    };

    const submitServiceUse = (event: FormEvent) => {
        event.preventDefault();
        if (!usingServiceBill) return;
        serviceUseForm.post(
            `/admin/financial-management/ledger/vendor-bills/${usingServiceBill.id}/service-usages`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Layanan digunakan, HPP trip diakui.');
                    setUsingServiceBill(null);
                    serviceUseForm.reset();
                    serviceUseForm.setData(
                        'idempotency_key',
                        idempotencyKey('vendor-service-use'),
                    );
                },
            },
        );
    };

    const openTripTransition = (trip: Props['tripOptions'][number]) => {
        if (!trip.next_status) return;
        tripTransitionForm.setData({
            to_status: trip.next_status,
            occurred_date: today,
            notes:
                trip.next_status === 'financially_closed'
                    ? `Penutupan finansial trip ${trip.code}`
                    : `Perubahan status operasional trip ${trip.code}`,
            idempotency_key: idempotencyKey('trip-transition'),
        });
        tripTransitionForm.clearErrors();
        setTransitioningTrip(trip);
    };

    const submitTripTransition = (event: FormEvent) => {
        event.preventDefault();
        if (!transitioningTrip) return;
        tripTransitionForm.post(
            `/admin/financial-management/ledger/trips/${transitioningTrip.id}/transitions`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Status operasional trip diperbarui.');
                    setTransitioningTrip(null);
                    tripTransitionForm.reset();
                },
            },
        );
    };

    const reverseTripClosure = (trip: Props['tripOptions'][number]) => {
        const reason = window.prompt(
            `Alasan reversal penutupan ${trip.code} (minimal 5 karakter):`,
        );
        if (!reason) return;
        router.post(
            `/admin/financial-management/ledger/trips/${trip.id}/closure/reverse`,
            { reason },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Penutupan finansial trip direversal.'),
            },
        );
    };

    return (
        <AppSidebarLayout>
            <Head title={pageCopy.title} />
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-semibold">
                            <BookOpenCheck className="size-6" />
                            {pageCopy.title}
                        </h1>
                        {workspace !== 'accounting' && (
                            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                                {pageCopy.description}
                            </p>
                        )}
                    </div>
                    {(can('create') ||
                        (workspace === 'accounting' && can('export'))) && (
                        <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
                            {workspace === 'accounting' && can('export') && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <Download className="size-4" />
                                            Ekspor pembukuan
                                            <ChevronDown className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-64"
                                    >
                                        <DropdownMenuLabel>
                                            Jurnal umum
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                exportLedger('journal', 'pdf')
                                            }
                                        >
                                            <FileText className="mr-2 size-4" />
                                            Unduh PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                exportLedger('journal', 'csv')
                                            }
                                        >
                                            <Download className="mr-2 size-4" />
                                            Unduh CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel>
                                            Buku besar
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                exportLedger(
                                                    'general-ledger',
                                                    'pdf',
                                                )
                                            }
                                        >
                                            <FileText className="mr-2 size-4" />
                                            Unduh PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                exportLedger(
                                                    'general-ledger',
                                                    'csv',
                                                )
                                            }
                                        >
                                            <Download className="mr-2 size-4" />
                                            Unduh CSV
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            {can('create') && workspace === 'transactions' && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            openCashTransaction('other_income')
                                        }
                                    >
                                        <Landmark className="size-4" /> Uang
                                        masuk
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            openCashTransaction(
                                                'operating_expense',
                                            )
                                        }
                                    >
                                        <Landmark className="size-4" /> Uang
                                        keluar
                                    </Button>
                                    <Button onClick={openTransfer}>
                                        <ArrowLeftRight className="size-4" />
                                        Transfer dana
                                    </Button>
                                </>
                            )}
                            {can('create') && workspace === 'vendor-hpp' && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowVendorBillForm(true)
                                        }
                                    >
                                        <Landmark className="size-4" /> Tagihan
                                        vendor
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            setShowVendorAdvanceForm(true)
                                        }
                                    >
                                        <Landmark className="size-4" /> Uang
                                        muka vendor
                                    </Button>
                                </>
                            )}
                            {can('create') && workspace === 'accounting' && (
                                <Button
                                    onClick={() =>
                                        openJournal('manual_journal')
                                    }
                                >
                                    <BookOpenCheck className="size-4" />
                                    Buat jurnal manual
                                </Button>
                            )}
                            {can('create') &&
                                workspace === 'master' &&
                                isSuperAdmin && (
                                    <Button onClick={() => openAccountForm()}>
                                        <Plus className="size-4" />
                                        Tambah akun
                                    </Button>
                                )}
                        </div>
                    )}
                </div>

                {workspace !== 'vendor-hpp' && workspace !== 'accounting' && (
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                        <SummaryCard
                            label="Total akun"
                            value={summary.accounts.toString()}
                            icon={<Layers className="size-5" />}
                        />
                        <SummaryCard
                            label="Akun aktif"
                            value={summary.active_accounts.toString()}
                            icon={
                                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                            }
                        />
                        <SummaryCard
                            label="Rekening kas/bank"
                            value={summary.cash_accounts.toString()}
                            icon={
                                <Landmark className="size-5 text-sky-600 dark:text-sky-400" />
                            }
                        />
                        <SummaryCard
                            label="Saldo kas/bank"
                            value={formatIdr(summary.cash_balance_idr)}
                            icon={<Wallet className="size-5 text-primary" />}
                        />
                    </div>
                )}

                <Dialog
                    open={showAccountForm}
                    onOpenChange={(open) => {
                        setShowAccountForm(open);
                        if (!open) accountForm.clearErrors();
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[calc(100%-2rem)] md:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingAccount
                                    ? 'Edit akun'
                                    : 'Tambah akun keuangan'}
                            </DialogTitle>
                            <DialogDescription className="sr-only">
                                Form akun keuangan.
                            </DialogDescription>
                        </DialogHeader>
                        <div>
                            <form
                                className="grid gap-4 sm:grid-cols-2"
                                onSubmit={submitAccount}
                            >
                                {accountError && (
                                    <Alert
                                        className="sm:col-span-2"
                                        variant="destructive"
                                    >
                                        <AlertDescription>
                                            {accountError}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <Field
                                    label="Kode"
                                    error={accountForm.errors.code}
                                >
                                    <Input
                                        value={accountForm.data.code}
                                        onChange={(event) =>
                                            accountForm.setData(
                                                'code',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Nama akun"
                                    error={accountForm.errors.name}
                                >
                                    <Input
                                        value={accountForm.data.name}
                                        onChange={(event) =>
                                            accountForm.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Tipe akun"
                                    error={accountForm.errors.type}
                                >
                                    <Select
                                        value={accountForm.data.type}
                                        onValueChange={(
                                            value: Account['type'],
                                        ) => accountForm.setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(
                                                accountTypeLabels,
                                            ).map(([value, label]) => (
                                                <SelectItem
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field
                                    label="Mata uang"
                                    error={accountForm.errors.currency}
                                >
                                    <Input
                                        maxLength={3}
                                        value={accountForm.data.currency}
                                        onChange={(event) =>
                                            accountForm.setData(
                                                'currency',
                                                event.target.value.toUpperCase(),
                                            )
                                        }
                                    />
                                </Field>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={
                                            accountForm.data.is_cash_account
                                        }
                                        onChange={(event) =>
                                            accountForm.setData(
                                                'is_cash_account',
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    Rekening kas/bank
                                </label>
                                {accountForm.data.is_cash_account && (
                                    <Field
                                        label="Jenis rekening"
                                        error={
                                            accountForm.errors.cash_account_type
                                        }
                                    >
                                        <Select
                                            value={
                                                accountForm.data
                                                    .cash_account_type
                                            }
                                            onValueChange={(value) =>
                                                accountForm.setData(
                                                    'cash_account_type',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jenis" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="customer_funds">
                                                    Penampungan jemaah
                                                </SelectItem>
                                                <SelectItem value="operating">
                                                    Operasional
                                                </SelectItem>
                                                <SelectItem value="petty_cash">
                                                    Kas kecil
                                                </SelectItem>
                                                <SelectItem value="legacy">
                                                    Legacy
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                                <Field
                                    label="Nomor rekening"
                                    error={accountForm.errors.account_number}
                                >
                                    <Input
                                        value={accountForm.data.account_number}
                                        onChange={(event) =>
                                            accountForm.setData(
                                                'account_number',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={accountForm.data.is_active}
                                        onChange={(event) =>
                                            accountForm.setData(
                                                'is_active',
                                                event.target.checked,
                                            )
                                        }
                                    />
                                    Aktif
                                </label>
                                <DialogFooter className="sm:col-span-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowAccountForm(false)
                                        }
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        disabled={accountForm.processing}
                                        type="submit"
                                    >
                                        {accountForm.processing
                                            ? 'Menyimpan...'
                                            : 'Simpan akun'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showOpeningForm}
                    onOpenChange={(open) => {
                        setShowOpeningForm(open);
                        if (!open) openingForm.clearErrors();
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Catat saldo awal</DialogTitle>
                            <DialogDescription className="sr-only">
                                Form saldo awal akun.
                            </DialogDescription>
                        </DialogHeader>
                        <form className="grid gap-5" onSubmit={submitOpening}>
                            {openingLedgerError && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {openingLedgerError}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Field
                                label="Akun"
                                error={openingForm.errors.financial_account_id}
                            >
                                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                                    {selectedOpeningAccount?.code} ·{' '}
                                    {selectedOpeningAccount?.name}
                                </div>
                            </Field>
                            <MoneyFields form={openingForm} />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Tanggal saldo"
                                    error={openingForm.errors.transaction_date}
                                >
                                    <Input
                                        type="date"
                                        value={
                                            openingForm.data.transaction_date
                                        }
                                        onChange={(event) =>
                                            openingForm.setData(
                                                'transaction_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Catatan"
                                    error={openingForm.errors.description}
                                >
                                    <Input
                                        placeholder="Contoh: Saldo per cut-off"
                                        value={openingForm.data.description}
                                        onChange={(event) =>
                                            openingForm.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowOpeningForm(false)}
                                >
                                    Batal
                                </Button>
                                <Button disabled={openingForm.processing}>
                                    {openingForm.processing
                                        ? 'Memposting...'
                                        : 'Posting saldo awal'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showTransferForm}
                    onOpenChange={(open) => {
                        setShowTransferForm(open);
                        if (!open) transferForm.clearErrors();
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                <ArrowLeftRight className="size-5 text-primary" />
                                Transfer Dana Antar-Rekening
                            </DialogTitle>
                            <DialogDescription>
                                Pindahkan saldo antar kas atau rekening bank
                                perusahaan. Saldo akun akan diperbarui secara
                                otomatis.
                            </DialogDescription>
                        </DialogHeader>

                        <form className="grid gap-5" onSubmit={submitTransfer}>
                            {transferLedgerError && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {transferLedgerError}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Petunjuk Visual Alur Perpindahan: Rekening Asal -> Rekening Tujuan */}
                            <div className="overflow-hidden rounded-xl border border-primary/20 bg-linear-to-b from-primary/5 via-muted/30 to-muted/10 p-4 shadow-xs">
                                <div className="mb-3 flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    <span className="flex items-center gap-1.5 text-primary">
                                        <Info className="size-4" />
                                        Alur Perpindahan Dana
                                    </span>
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary normal-case">
                                        Rekening Asal ➔ Rekening Tujuan
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                                    {/* Rekening Asal Box */}
                                    <div
                                        className={`rounded-xl border p-3.5 transition-all ${transferSource ? 'border-amber-500/40 bg-background shadow-xs' : 'border-dashed border-border/80 bg-background/50'}`}
                                    >
                                        <div className="mb-1.5 flex items-center justify-between gap-1">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <Wallet className="size-3.5 text-amber-500" />
                                                Rekening Asal
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="h-4 border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[10px] font-semibold text-amber-700 dark:text-amber-400"
                                            >
                                                Sumber Dana
                                            </Badge>
                                        </div>
                                        <div className="truncate text-sm font-bold text-foreground">
                                            {transferSource
                                                ? `${transferSource.code} · ${transferSource.name}`
                                                : 'Pilih rekening asal di bawah...'}
                                        </div>
                                        <div className="mt-1.5 text-xs text-muted-foreground">
                                            {transferSource ? (
                                                <span className="inline-flex items-center gap-1">
                                                    Saldo saat ini:{' '}
                                                    <strong className="text-foreground">
                                                        {formatIdr(
                                                            transferSource.balance_idr,
                                                        )}
                                                    </strong>
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/80 italic">
                                                    Saldo akan berkurang (-)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Panah Indikator Tengah */}
                                    <div className="flex flex-col items-center justify-center py-1 sm:py-0">
                                        <div className="flex size-10 items-center justify-center rounded-full border border-primary/30 bg-primary text-primary-foreground shadow-xs">
                                            <ArrowRight className="hidden size-5 sm:block" />
                                            <ArrowDown className="size-5 sm:hidden" />
                                        </div>
                                        {transferAmount > 0 && (
                                            <span className="mt-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold whitespace-nowrap text-primary tabular-nums">
                                                {formatIdr(transferAmount)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Rekening Tujuan Box */}
                                    <div
                                        className={`rounded-xl border p-3.5 transition-all ${transferDestination ? 'border-emerald-500/40 bg-background shadow-xs' : 'border-dashed border-border/80 bg-background/50'}`}
                                    >
                                        <div className="mb-1.5 flex items-center justify-between gap-1">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <Landmark className="size-3.5 text-emerald-500" />
                                                Rekening Tujuan
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="h-4 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400"
                                            >
                                                Penerima Dana
                                            </Badge>
                                        </div>
                                        <div className="truncate text-sm font-bold text-foreground">
                                            {transferDestination
                                                ? `${transferDestination.code} · ${transferDestination.name}`
                                                : 'Pilih rekening tujuan di bawah...'}
                                        </div>
                                        <div className="mt-1.5 text-xs text-muted-foreground">
                                            {transferDestination ? (
                                                <span className="inline-flex items-center gap-1">
                                                    Saldo saat ini:{' '}
                                                    <strong className="text-foreground">
                                                        {formatIdr(
                                                            transferDestination.balance_idr,
                                                        )}
                                                    </strong>
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/80 italic">
                                                    Saldo akan bertambah (+)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pilihan Jenis Transfer (Opsional jika ada lebih dari 1 jenis transaksi) */}
                            {transferCategoryOptions.length > 1 && (
                                <Field
                                    label="Jenis perpindahan dana"
                                    error={transferForm.errors.category_code}
                                >
                                    <Select
                                        value={
                                            transferForm.data.category_code ||
                                            'inter_account_transfer'
                                        }
                                        onValueChange={(value) =>
                                            transferForm.setData(
                                                'category_code',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis perpindahan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transferCategoryOptions.map(
                                                (type) => (
                                                    <SelectItem
                                                        key={type.value}
                                                        value={type.value}
                                                    >
                                                        {type.label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}

                            {/* Dropdown Pilihan Rekening */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <AccountSelect
                                    label="Dari Rekening (Asal / Sumber Dana)"
                                    accounts={cashAccounts}
                                    value={transferForm.data.credit_account_id}
                                    onChange={(value) => {
                                        transferForm.setData(
                                            'credit_account_id',
                                            value,
                                        );
                                    }}
                                    error={
                                        transferForm.errors.credit_account_id
                                    }
                                    showBalance
                                />
                                <AccountSelect
                                    label="Ke Rekening (Tujuan / Penerima Dana)"
                                    accounts={cashAccounts.filter(
                                        (acc) =>
                                            acc.id.toString() !==
                                            transferForm.data.credit_account_id,
                                    )}
                                    value={transferForm.data.debit_account_id}
                                    onChange={(value) => {
                                        transferForm.setData(
                                            'debit_account_id',
                                            value,
                                        );
                                    }}
                                    error={transferForm.errors.debit_account_id}
                                    showBalance
                                />
                            </div>

                            {/* Nominal Transfer (MoneyFields) */}
                            <MoneyFields form={transferForm} />

                            {/* Peringatan Saldo Tidak Cukup */}
                            {transferSource &&
                                transferAmount > transferSource.balance_idr && (
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            Saldo rekening asal tidak mencukupi
                                            untuk transfer sebesar{' '}
                                            {formatIdr(transferAmount)}. Saldo
                                            tersedia:{' '}
                                            {formatIdr(
                                                transferSource.balance_idr,
                                            )}
                                            .
                                        </AlertDescription>
                                    </Alert>
                                )}

                            {/* Simulasi Saldo Setelah Transfer */}
                            {transferSource &&
                                transferDestination &&
                                transferAmount > 0 &&
                                transferHasSufficientFunds && (
                                    <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs dark:border-blue-900/40 dark:bg-blue-950/20">
                                        <div className="flex items-center gap-1.5 font-semibold text-blue-950 dark:text-blue-200">
                                            <Info className="size-3.5 text-blue-600 dark:text-blue-400" />
                                            Simulasi Perubahan Saldo Setelah
                                            Transfer:
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
                                            <div className="space-y-1 rounded-lg border border-blue-200/50 bg-background/80 p-2.5 dark:border-blue-800/40">
                                                <div className="flex items-center justify-between text-muted-foreground">
                                                    <span>
                                                        {transferSource.name}
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                                        Pengirim
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
                                                    <span className="text-muted-foreground/70">
                                                        {formatIdr(
                                                            transferSource.balance_idr,
                                                        )}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        ➔
                                                    </span>
                                                    <span className="font-bold text-amber-600 dark:text-amber-400">
                                                        {formatIdr(
                                                            transferSource.balance_idr -
                                                                transferAmount,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                                    Berkurang -
                                                    {formatIdr(transferAmount)}
                                                </div>
                                            </div>
                                            <div className="space-y-1 rounded-lg border border-blue-200/50 bg-background/80 p-2.5 dark:border-blue-800/40">
                                                <div className="flex items-center justify-between text-muted-foreground">
                                                    <span>
                                                        {
                                                            transferDestination.name
                                                        }
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        Penerima
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm font-medium tabular-nums">
                                                    <span className="text-muted-foreground/70">
                                                        {formatIdr(
                                                            transferDestination.balance_idr,
                                                        )}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        ➔
                                                    </span>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                        {formatIdr(
                                                            transferDestination.balance_idr +
                                                                transferAmount,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                    Bertambah +
                                                    {formatIdr(transferAmount)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Tanggal & Keterangan */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Tanggal transaksi"
                                    error={transferForm.errors.transaction_date}
                                >
                                    <Input
                                        type="date"
                                        value={
                                            transferForm.data.transaction_date
                                        }
                                        onChange={(event) =>
                                            transferForm.setData(
                                                'transaction_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Keterangan / Catatan"
                                    error={transferForm.errors.description}
                                >
                                    <Input
                                        placeholder="Contoh: Pengisian kas kecil operasional"
                                        value={transferForm.data.description}
                                        onChange={(event) =>
                                            transferForm.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowTransferForm(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    className="min-h-11"
                                    disabled={
                                        transferForm.processing ||
                                        !transferReady
                                    }
                                >
                                    {transferForm.processing ? (
                                        'Memproses transfer...'
                                    ) : (
                                        <>
                                            <ArrowLeftRight className="size-4" />
                                            Kirim Transfer Dana
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showJournalForm}
                    onOpenChange={(open) => {
                        setShowJournalForm(open);
                        if (!open) journalForm.clearErrors();
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[calc(100%-2rem)] md:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <BookOpenCheck className="size-5 text-primary" />
                                Buat jurnal manual
                            </DialogTitle>
                            <DialogDescription>
                                Catat koreksi klasifikasi, reklasifikasi, atau
                                penyesuaian pembukuan yang tidak mewakili arus
                                kas baru.
                            </DialogDescription>
                        </DialogHeader>
                        <form className="grid gap-5" onSubmit={submitJournal}>
                            {journalLedgerError && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {journalLedgerError}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="rounded-xl border bg-muted/35 p-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            Gunakan hanya untuk penyesuaian
                                            pembukuan
                                        </p>
                                        <p className="text-muted-foreground">
                                            Uang masuk, uang keluar, pembayaran,
                                            dan transfer antar-rekening harus
                                            dicatat dari menu Transaksi Keuangan
                                            agar validasi serta akun pasangannya
                                            diterapkan otomatis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Field
                                label="Jenis jurnal"
                                error={journalForm.errors.category_code}
                            >
                                <Select
                                    value={journalForm.data.category_code}
                                    onValueChange={(value) => {
                                        journalForm.setData(
                                            'category_code',
                                            value,
                                        );
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis jurnal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {journalCategoryOptions.map(
                                            (category) => (
                                                <SelectItem
                                                    key={category.value}
                                                    value={category.value}
                                                >
                                                    {category.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                {selectedJournalType?.description && (
                                    <p className="text-xs text-muted-foreground">
                                        {selectedJournalType.description}
                                    </p>
                                )}
                            </Field>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <AccountSelect
                                    label="Akun debit"
                                    accounts={activeAccounts}
                                    value={journalForm.data.debit_account_id}
                                    onChange={(value) => {
                                        journalForm.setData(
                                            'debit_account_id',
                                            value,
                                        );
                                    }}
                                    error={journalForm.errors.debit_account_id}
                                />
                                <AccountSelect
                                    label="Akun kredit"
                                    accounts={activeAccounts}
                                    value={journalForm.data.credit_account_id}
                                    onChange={(value) => {
                                        journalForm.setData(
                                            'credit_account_id',
                                            value,
                                        );
                                    }}
                                    error={journalForm.errors.credit_account_id}
                                />
                            </div>
                            {journalTouchesCashAccount && (
                                <div
                                    className="flex items-start gap-3 rounded-xl border border-amber-300/70 bg-amber-50/70 p-4 text-sm text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/25 dark:text-amber-100"
                                    role="status"
                                >
                                    <Info className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            Jurnal ini memengaruhi saldo
                                            kas/bank
                                        </p>
                                        <p className="text-amber-900/80 dark:text-amber-100/75">
                                            Pastikan ini benar-benar
                                            penyesuaian. Jika dana berpindah
                                            antar-rekening, batalkan dan gunakan
                                            Transfer dana.
                                        </p>
                                    </div>
                                </div>
                            )}
                            <MoneyFields form={journalForm} />
                            {selectedJournalDebitAccount &&
                                selectedJournalCreditAccount &&
                                journalAmount > 0 && (
                                    <div className="rounded-xl border bg-muted/25 p-4">
                                        <p className="mb-3 text-sm font-medium">
                                            Dampak jurnal
                                        </p>
                                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                                            <div className="rounded-lg bg-background p-3 ring-1 ring-border">
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    Debit
                                                </p>
                                                <p className="mt-1 font-medium">
                                                    {
                                                        selectedJournalDebitAccount.code
                                                    }{' '}
                                                    ·{' '}
                                                    {
                                                        selectedJournalDebitAccount.name
                                                    }
                                                </p>
                                                <p className="mt-1 font-semibold tabular-nums">
                                                    {formatIdr(journalAmount)}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-background p-3 ring-1 ring-border">
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    Kredit
                                                </p>
                                                <p className="mt-1 font-medium">
                                                    {
                                                        selectedJournalCreditAccount.code
                                                    }{' '}
                                                    ·{' '}
                                                    {
                                                        selectedJournalCreditAccount.name
                                                    }
                                                </p>
                                                <p className="mt-1 font-semibold tabular-nums">
                                                    {formatIdr(journalAmount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Tanggal transaksi"
                                    error={journalForm.errors.transaction_date}
                                >
                                    <Input
                                        type="date"
                                        value={
                                            journalForm.data.transaction_date
                                        }
                                        onChange={(event) =>
                                            journalForm.setData(
                                                'transaction_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Deskripsi"
                                    error={journalForm.errors.description}
                                >
                                    <Input
                                        placeholder="Keterangan transaksi jurnal"
                                        value={journalForm.data.description}
                                        onChange={(event) =>
                                            journalForm.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowJournalForm(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    className="min-h-11"
                                    disabled={
                                        journalForm.processing || !journalReady
                                    }
                                >
                                    {journalForm.processing
                                        ? 'Memposting...'
                                        : 'Posting jurnal manual'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showCashForm}
                    onOpenChange={(open) => {
                        setShowCashForm(open);
                        if (!open) cashForm.clearErrors();
                    }}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>
                                {cashForm.data.transaction_type ===
                                'other_income'
                                    ? 'Catat uang masuk'
                                    : cashForm.data.transaction_type ===
                                        'operating_expense'
                                      ? 'Catat uang keluar'
                                      : 'Catat transaksi pemilik'}
                            </DialogTitle>
                            <DialogDescription>
                                Pilih jenis transaksi agar pasangan akun dicatat
                                otomatis.
                            </DialogDescription>
                        </DialogHeader>
                        <form className="grid gap-4" onSubmit={submitCash}>
                            {cashLedgerError && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {cashLedgerError}
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Field
                                label="Jenis transaksi"
                                error={cashForm.errors.transaction_type}
                            >
                                <Select
                                    value={cashForm.data.transaction_type}
                                    onValueChange={(value) =>
                                        cashForm.setData(
                                            'transaction_type',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="capital_contribution">
                                            Setoran modal pemilik
                                        </SelectItem>
                                        <SelectItem value="owner_withdrawal">
                                            Penarikan pemilik
                                        </SelectItem>
                                        <SelectItem value="operating_expense">
                                            Biaya operasional
                                        </SelectItem>
                                        <SelectItem value="other_income">
                                            Pendapatan lain-lain
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <AccountSelect
                                label="Rekening kas/bank"
                                accounts={activeAccounts.filter(
                                    (account) =>
                                        account.is_cash_account &&
                                        ['operating', 'petty_cash'].includes(
                                            account.cash_account_type ?? '',
                                        ),
                                )}
                                value={cashForm.data.financial_account_id}
                                onChange={(value) => {
                                    const account = accounts.find(
                                        (item) => item.id === Number(value),
                                    );
                                    cashForm.setData(
                                        'financial_account_id',
                                        value,
                                    );
                                    if (account)
                                        cashForm.setData(
                                            'currency',
                                            account.currency,
                                        );
                                }}
                                error={cashForm.errors.financial_account_id}
                            />
                            {cashForm.data.transaction_type ===
                            'operating_expense' ? (
                                <Field
                                    label="Paket trip (opsional)"
                                    error={cashForm.errors.package_id}
                                >
                                    <Select
                                        value={cashForm.data.package_id}
                                        onValueChange={(value) =>
                                            cashForm.setData(
                                                'package_id',
                                                value === 'general'
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih trip jika biaya terkait HPP" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">
                                                Biaya umum tanpa trip
                                            </SelectItem>
                                            {packageOptions.map(
                                                (travelPackage) => (
                                                    <SelectItem
                                                        key={travelPackage.id}
                                                        value={String(
                                                            travelPackage.id,
                                                        )}
                                                    >
                                                        {travelPackage.code} ·{' '}
                                                        {travelPackage.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Biaya yang ditautkan akan mengurangi
                                        sisa HPP aktual trip.
                                    </p>
                                </Field>
                            ) : null}
                            <MoneyFields form={cashForm} />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Tanggal transaksi"
                                    error={cashForm.errors.transaction_date}
                                >
                                    <Input
                                        type="date"
                                        value={cashForm.data.transaction_date}
                                        onChange={(event) =>
                                            cashForm.setData(
                                                'transaction_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Keterangan"
                                    error={cashForm.errors.description}
                                >
                                    <Input
                                        value={cashForm.data.description}
                                        onChange={(event) =>
                                            cashForm.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Tujuan transaksi"
                                    />
                                </Field>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCashForm(false)}
                                >
                                    Batal
                                </Button>
                                <Button disabled={cashForm.processing}>
                                    Posting transaksi
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showVendorBillForm}
                    onOpenChange={setShowVendorBillForm}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Catat tagihan vendor</DialogTitle>
                            <DialogDescription>
                                Tagihan dicatat sebagai Hutang Vendor, bukan
                                langsung mengurangi kas.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            className="grid gap-4"
                            onSubmit={submitVendorBill}
                        >
                            {vendorError ? (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {vendorError}
                                    </AlertDescription>
                                </Alert>
                            ) : null}
                            <Field
                                label="Vendor"
                                error={vendorBillForm.errors.package_vendor_id}
                            >
                                <Select
                                    value={
                                        vendorBillForm.data.package_vendor_id
                                    }
                                    onValueChange={(value) =>
                                        vendorBillForm.setData(
                                            'package_vendor_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vendorOptions.map((vendor) => (
                                            <SelectItem
                                                key={vendor.id}
                                                value={String(vendor.id)}
                                            >
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field
                                label="Paket trip"
                                error={vendorBillForm.errors.package_id}
                            >
                                <Select
                                    value={vendorBillForm.data.package_id}
                                    onValueChange={(value) =>
                                        vendorBillForm.setData(
                                            'package_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih paket trip" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {packageOptions.map((travelPackage) => (
                                            <SelectItem
                                                key={travelPackage.id}
                                                value={String(travelPackage.id)}
                                            >
                                                {travelPackage.code} ·{' '}
                                                {travelPackage.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field
                                label="Nomor tagihan vendor"
                                error={
                                    vendorBillForm.errors.vendor_invoice_number
                                }
                            >
                                <Input
                                    value={
                                        vendorBillForm.data
                                            .vendor_invoice_number
                                    }
                                    onChange={(event) =>
                                        vendorBillForm.setData(
                                            'vendor_invoice_number',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field
                                    label="Tanggal tagihan"
                                    error={vendorBillForm.errors.bill_date}
                                >
                                    <Input
                                        type="date"
                                        value={vendorBillForm.data.bill_date}
                                        onChange={(event) =>
                                            vendorBillForm.setData(
                                                'bill_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Jatuh tempo"
                                    error={vendorBillForm.errors.due_date}
                                >
                                    <Input
                                        type="date"
                                        value={vendorBillForm.data.due_date}
                                        onChange={(event) =>
                                            vendorBillForm.setData(
                                                'due_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                            <Field
                                label="Nominal (IDR)"
                                error={vendorBillForm.errors.amount_idr}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    value={vendorBillForm.data.amount_idr}
                                    onChange={(event) =>
                                        vendorBillForm.setData(
                                            'amount_idr',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Keterangan"
                                error={vendorBillForm.errors.notes}
                            >
                                <Input
                                    value={vendorBillForm.data.notes}
                                    onChange={(event) =>
                                        vendorBillForm.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowVendorBillForm(false)}
                                >
                                    Batal
                                </Button>
                                <Button disabled={vendorBillForm.processing}>
                                    {vendorBillForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan tagihan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={allocatingBill !== null}
                    onOpenChange={(open) => !open && setAllocatingBill(null)}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>
                                Alokasikan uang muka vendor
                            </DialogTitle>
                            <DialogDescription>
                                Uang muka dan tagihan harus milik vendor yang
                                sama. Sisa tagihan{' '}
                                {formatIdr(
                                    allocatingBill?.remaining_amount_idr ?? 0,
                                )}
                                .
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            className="grid gap-4"
                            onSubmit={submitAdvanceAllocation}
                        >
                            {(allocationForm.errors as Record<string, string>)
                                .vendor && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {
                                            (
                                                allocationForm.errors as Record<
                                                    string,
                                                    string
                                                >
                                            ).vendor
                                        }
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Field
                                label="Uang muka"
                                error={allocationForm.errors.vendor_advance_id}
                            >
                                <Select
                                    value={
                                        allocationForm.data.vendor_advance_id
                                    }
                                    onValueChange={(value) =>
                                        allocationForm.setData(
                                            'vendor_advance_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih uang muka" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {matchingAdvances.map((advance) => (
                                            <SelectItem
                                                key={advance.id}
                                                value={String(advance.id)}
                                            >
                                                {advance.vendor_name} · sisa{' '}
                                                {formatIdr(
                                                    advance.remaining_amount_idr,
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field
                                label="Nominal alokasi (IDR)"
                                error={allocationForm.errors.amount_idr}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    max={Math.min(
                                        allocatingBill?.remaining_amount_idr ??
                                            0,
                                        matchingAdvances.find(
                                            (advance) =>
                                                String(advance.id) ===
                                                allocationForm.data
                                                    .vendor_advance_id,
                                        )?.remaining_amount_idr ?? 0,
                                    )}
                                    value={allocationForm.data.amount_idr}
                                    onChange={(event) =>
                                        allocationForm.setData(
                                            'amount_idr',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Tanggal alokasi"
                                error={allocationForm.errors.allocation_date}
                            >
                                <Input
                                    type="date"
                                    value={allocationForm.data.allocation_date}
                                    onChange={(event) =>
                                        allocationForm.setData(
                                            'allocation_date',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Keterangan"
                                error={allocationForm.errors.notes}
                            >
                                <Input
                                    value={allocationForm.data.notes}
                                    onChange={(event) =>
                                        allocationForm.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAllocatingBill(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    disabled={
                                        allocationForm.processing ||
                                        !allocationForm.data.vendor_advance_id
                                    }
                                >
                                    {allocationForm.processing
                                        ? 'Menyimpan...'
                                        : 'Alokasikan DP'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={usingServiceBill !== null}
                    onOpenChange={(open) => !open && setUsingServiceBill(null)}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Catat layanan digunakan</DialogTitle>
                            <DialogDescription>
                                HPP trip diakui saat layanan digunakan, bukan
                                saat tagihan dibayar. Sisa{' '}
                                {formatIdr(
                                    usingServiceBill?.remaining_amount_idr ?? 0,
                                )}
                                .
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            className="grid gap-4"
                            onSubmit={submitServiceUse}
                        >
                            {(serviceUseForm.errors as Record<string, string>)
                                .vendor && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {
                                            (
                                                serviceUseForm.errors as Record<
                                                    string,
                                                    string
                                                >
                                            ).vendor
                                        }
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Field
                                label="Nominal layanan (IDR)"
                                error={serviceUseForm.errors.amount_idr}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    max={usingServiceBill?.remaining_amount_idr}
                                    value={serviceUseForm.data.amount_idr}
                                    onChange={(event) =>
                                        serviceUseForm.setData(
                                            'amount_idr',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Tanggal penggunaan"
                                error={serviceUseForm.errors.usage_date}
                            >
                                <Input
                                    type="date"
                                    value={serviceUseForm.data.usage_date}
                                    onChange={(event) =>
                                        serviceUseForm.setData(
                                            'usage_date',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Keterangan"
                                error={serviceUseForm.errors.notes}
                            >
                                <Input
                                    value={serviceUseForm.data.notes}
                                    onChange={(event) =>
                                        serviceUseForm.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setUsingServiceBill(null)}
                                >
                                    Batal
                                </Button>
                                <Button disabled={serviceUseForm.processing}>
                                    {serviceUseForm.processing
                                        ? 'Menyimpan...'
                                        : 'Akui HPP trip'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={transitioningTrip !== null}
                    onOpenChange={(open) => !open && setTransitioningTrip(null)}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>
                                {tripStatusLabels[
                                    tripTransitionForm.data.to_status
                                ] ?? 'Perbarui status trip'}
                            </DialogTitle>
                            <DialogDescription>
                                {transitioningTrip?.code} ·{' '}
                                {transitioningTrip?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            className="grid gap-4"
                            onSubmit={submitTripTransition}
                        >
                            {(
                                tripTransitionForm.errors as Record<
                                    string,
                                    string
                                >
                            ).trip && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {
                                            (
                                                tripTransitionForm.errors as Record<
                                                    string,
                                                    string
                                                >
                                            ).trip
                                        }
                                    </AlertDescription>
                                </Alert>
                            )}
                            {tripTransitionForm.data.to_status ===
                                'financially_closed' &&
                                transitioningTrip && (
                                    <div className="grid gap-3 rounded-lg border bg-muted/30 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm text-muted-foreground">
                                                Pendapatan yang diakui
                                            </span>
                                            <span className="font-semibold">
                                                {formatIdr(
                                                    transitioningTrip.revenue_amount_idr,
                                                )}
                                            </span>
                                        </div>
                                        {transitioningTrip.blockers.length >
                                        0 ? (
                                            <div className="grid gap-1 text-sm text-destructive">
                                                {transitioningTrip.blockers.map(
                                                    (blocker) => (
                                                        <p key={blocker}>
                                                            • {blocker}
                                                        </p>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                                Seluruh pemeriksaan penutupan
                                                terpenuhi.
                                            </p>
                                        )}
                                    </div>
                                )}
                            <Field
                                label="Tanggal kejadian"
                                error={tripTransitionForm.errors.occurred_date}
                            >
                                <Input
                                    type="date"
                                    value={
                                        tripTransitionForm.data.occurred_date
                                    }
                                    onChange={(event) =>
                                        tripTransitionForm.setData(
                                            'occurred_date',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Catatan verifikasi"
                                error={tripTransitionForm.errors.notes}
                            >
                                <Input
                                    value={tripTransitionForm.data.notes}
                                    onChange={(event) =>
                                        tripTransitionForm.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setTransitioningTrip(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    disabled={
                                        tripTransitionForm.processing ||
                                        (tripTransitionForm.data.to_status ===
                                            'financially_closed' &&
                                            (transitioningTrip?.blockers
                                                .length ?? 0) > 0)
                                    }
                                >
                                    {tripTransitionForm.processing
                                        ? 'Memproses...'
                                        : tripTransitionForm.data.to_status ===
                                            'financially_closed'
                                          ? 'Setujui dan posting pendapatan'
                                          : 'Simpan status'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={payingVendorBill !== null}
                    onOpenChange={(open) => !open && setPayingVendorBill(null)}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Bayar hutang vendor</DialogTitle>
                            <DialogDescription>
                                Sisa hutang{' '}
                                {payingVendorBill
                                    ? formatIdr(
                                          payingVendorBill.remaining_amount_idr,
                                      )
                                    : ''}
                                .
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            className="grid gap-4"
                            onSubmit={submitVendorPayment}
                        >
                            {(
                                vendorPaymentForm.errors as Record<
                                    string,
                                    string
                                >
                            ).vendor && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {
                                            (
                                                vendorPaymentForm.errors as Record<
                                                    string,
                                                    string
                                                >
                                            ).vendor
                                        }
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Field
                                label="Nominal pembayaran (IDR)"
                                error={vendorPaymentForm.errors.amount_idr}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    max={payingVendorBill?.remaining_amount_idr}
                                    value={vendorPaymentForm.data.amount_idr}
                                    onChange={(event) =>
                                        vendorPaymentForm.setData(
                                            'amount_idr',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <AccountSelect
                                label="Bayar dari rekening"
                                accounts={activeAccounts.filter(
                                    (account) =>
                                        account.is_cash_account &&
                                        ['operating', 'petty_cash'].includes(
                                            account.cash_account_type ?? '',
                                        ),
                                )}
                                value={
                                    vendorPaymentForm.data.financial_account_id
                                }
                                onChange={(value) =>
                                    vendorPaymentForm.setData(
                                        'financial_account_id',
                                        value,
                                    )
                                }
                                error={
                                    vendorPaymentForm.errors
                                        .financial_account_id
                                }
                            />
                            <Field
                                label="Tanggal pembayaran"
                                error={vendorPaymentForm.errors.payment_date}
                            >
                                <Input
                                    type="date"
                                    value={vendorPaymentForm.data.payment_date}
                                    onChange={(event) =>
                                        vendorPaymentForm.setData(
                                            'payment_date',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Keterangan"
                                error={vendorPaymentForm.errors.notes}
                            >
                                <Input
                                    value={vendorPaymentForm.data.notes}
                                    onChange={(event) =>
                                        vendorPaymentForm.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setPayingVendorBill(null)}
                                >
                                    Batal
                                </Button>
                                <Button disabled={vendorPaymentForm.processing}>
                                    {vendorPaymentForm.processing
                                        ? 'Memproses...'
                                        : 'Posting pembayaran'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showVendorAdvanceForm}
                    onOpenChange={setShowVendorAdvanceForm}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Catat uang muka vendor</DialogTitle>
                            <DialogDescription>
                                Kas keluar dicatat sebagai aset Uang Muka
                                Vendor.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            className="grid gap-4"
                            onSubmit={submitVendorAdvance}
                        >
                            {(
                                vendorAdvanceForm.errors as Record<
                                    string,
                                    string
                                >
                            ).vendor && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {
                                            (
                                                vendorAdvanceForm.errors as Record<
                                                    string,
                                                    string
                                                >
                                            ).vendor
                                        }
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Field
                                label="Vendor"
                                error={
                                    vendorAdvanceForm.errors.package_vendor_id
                                }
                            >
                                <Select
                                    value={
                                        vendorAdvanceForm.data.package_vendor_id
                                    }
                                    onValueChange={(value) =>
                                        vendorAdvanceForm.setData(
                                            'package_vendor_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vendorOptions.map((vendor) => (
                                            <SelectItem
                                                key={vendor.id}
                                                value={String(vendor.id)}
                                            >
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field
                                label="Nominal (IDR)"
                                error={vendorAdvanceForm.errors.amount_idr}
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    value={vendorAdvanceForm.data.amount_idr}
                                    onChange={(event) =>
                                        vendorAdvanceForm.setData(
                                            'amount_idr',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <AccountSelect
                                label="Bayar dari rekening"
                                accounts={activeAccounts.filter(
                                    (account) =>
                                        account.is_cash_account &&
                                        ['operating', 'petty_cash'].includes(
                                            account.cash_account_type ?? '',
                                        ),
                                )}
                                value={
                                    vendorAdvanceForm.data.financial_account_id
                                }
                                onChange={(value) =>
                                    vendorAdvanceForm.setData(
                                        'financial_account_id',
                                        value,
                                    )
                                }
                                error={
                                    vendorAdvanceForm.errors
                                        .financial_account_id
                                }
                            />
                            <Field
                                label="Tanggal"
                                error={vendorAdvanceForm.errors.advance_date}
                            >
                                <Input
                                    type="date"
                                    value={vendorAdvanceForm.data.advance_date}
                                    onChange={(event) =>
                                        vendorAdvanceForm.setData(
                                            'advance_date',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                label="Keterangan"
                                error={vendorAdvanceForm.errors.notes}
                            >
                                <Input
                                    value={vendorAdvanceForm.data.notes}
                                    onChange={(event) =>
                                        vendorAdvanceForm.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setShowVendorAdvanceForm(false)
                                    }
                                >
                                    Batal
                                </Button>
                                <Button disabled={vendorAdvanceForm.processing}>
                                    {vendorAdvanceForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan uang muka'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {workspace === 'master' ? (
                    <Tabs defaultValue="accounts" className="space-y-4">
                        <TabsList className="grid min-h-11 w-full grid-cols-2">
                            <TabsTrigger className="min-h-11" value="accounts">
                                Daftar akun & rekening
                            </TabsTrigger>
                            <TabsTrigger
                                className="min-h-11"
                                value="transaction-types"
                            >
                                Jenis transaksi
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="accounts">
                            <MasterAccountsSection
                                accounts={accounts}
                                can={can}
                                isSuperAdmin={isSuperAdmin}
                                openAccountForm={openAccountForm}
                                openOpeningForm={openOpeningForm}
                            />
                        </TabsContent>
                        <TabsContent value="transaction-types">
                            <TransactionTypesSection
                                can={can}
                                isSuperAdmin={isSuperAdmin}
                                types={transactionTypes}
                            />
                        </TabsContent>
                    </Tabs>
                ) : workspace === 'transactions' ? (
                    <TransactionsDataTable
                        transactions={transactions}
                        activeAccounts={activeAccounts}
                        filters={ledgerFilters}
                        onFilterChange={setLedgerFilters}
                        onApplyFilters={applyLedgerFilters}
                        onResetFilters={resetLedgerFilters}
                        onDatePreset={setDatePreset}
                        processing={filterProcessing}
                        today={today}
                        detailContext="transactions"
                    />
                ) : (
                    workspace !== 'vendor-hpp' && (
                        <Tabs defaultValue="transactions">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger
                                    className="min-h-11 px-2 text-xs sm:text-sm"
                                    value="transactions"
                                >
                                    Semua jurnal transaksi
                                </TabsTrigger>
                                <TabsTrigger
                                    className="min-h-11 px-2 text-xs sm:text-sm"
                                    value="accounts"
                                >
                                    Buku besar & neraca saldo
                                </TabsTrigger>
                            </TabsList>

                            {workspace === 'accounting' && (
                                <TabsContent value="accounts">
                                    <Card>
                                        <CardContent className="overflow-x-auto p-0">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-14 text-center">
                                                            No.
                                                        </TableHead>
                                                        <TableHead>
                                                            Akun
                                                        </TableHead>
                                                        <TableHead>
                                                            Tipe
                                                        </TableHead>
                                                        <TableHead>
                                                            Rekening
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Debit
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Kredit
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Saldo
                                                        </TableHead>
                                                        <TableHead>
                                                            Status
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {accounts.map(
                                                        (account, index) => (
                                                            <TableRow
                                                                key={account.id}
                                                            >
                                                                <TableCell className="text-center text-sm text-muted-foreground">
                                                                    {index + 1}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="font-medium">
                                                                        {
                                                                            account.code
                                                                        }{' '}
                                                                        ·{' '}
                                                                        {
                                                                            account.name
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {
                                                                            account.currency
                                                                        }
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        accountTypeLabels[
                                                                            account
                                                                                .type
                                                                        ]
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {account.is_cash_account ? (
                                                                        <Badge variant="secondary">
                                                                            {account.cash_account_type
                                                                                ? (cashAccountTypeLabels[
                                                                                      account
                                                                                          .cash_account_type
                                                                                  ] ??
                                                                                  account.cash_account_type)
                                                                                : '—'}
                                                                        </Badge>
                                                                    ) : (
                                                                        '—'
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatIdr(
                                                                        account.debit_total,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatIdr(
                                                                        account.credit_total,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {formatIdr(
                                                                        account.balance_idr,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant={
                                                                            account.is_active
                                                                                ? 'default'
                                                                                : 'outline'
                                                                        }
                                                                    >
                                                                        {account.is_active
                                                                            ? 'Aktif'
                                                                            : 'Nonaktif'}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            <TabsContent value="transactions">
                                <TransactionsDataTable
                                    transactions={transactions}
                                    activeAccounts={activeAccounts}
                                    filters={ledgerFilters}
                                    onFilterChange={setLedgerFilters}
                                    onApplyFilters={applyLedgerFilters}
                                    onResetFilters={resetLedgerFilters}
                                    onDatePreset={setDatePreset}
                                    processing={filterProcessing}
                                    today={today}
                                    detailContext="accounting"
                                />
                            </TabsContent>
                        </Tabs>
                    )
                )}

                {workspace === 'master' &&
                    accountMappings &&
                    accountMappings.length > 0 && (
                        <Card>
                            <CardContent className="p-0">
                                <div className="border-b p-4">
                                    <h2 className="text-base font-semibold">
                                        Pemetaan akun otomatis
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/30">
                                                <TableHead className="text-xs">
                                                    Proses
                                                </TableHead>
                                                <TableHead className="text-xs">
                                                    Akun debit
                                                </TableHead>
                                                <TableHead className="text-xs">
                                                    Akun kredit
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {accountMappings.map((mapping) => (
                                                <TableRow
                                                    key={mapping.source}
                                                    className="transition-colors hover:bg-muted/40"
                                                >
                                                    <TableCell className="text-sm font-medium">
                                                        {mapping.source}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <span className="rounded bg-muted/80 px-2 py-0.5 font-mono text-xs text-foreground">
                                                            {mapping.debit}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <span className="rounded bg-muted/80 px-2 py-0.5 font-mono text-xs text-foreground">
                                                            {mapping.credit}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                {workspace === 'vendor-hpp' && (
                    <VendorHppTrackingSection
                        summary={vendorHppSummary}
                        trips={tripFinanceRows}
                    />
                )}

                {workspace === 'vendor-hpp' && tripOptions.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="font-semibold">
                                    Status operasional & penutupan trip
                                </h2>
                                <span className="text-sm text-muted-foreground">
                                    Tanggal selesai hanya pengingat; penutupan
                                    wajib disetujui Finance.
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Trip</TableHead>
                                            <TableHead>Periode</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">
                                                Pendapatan siap diakui
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tripOptions.map((trip) => (
                                            <TableRow key={trip.id}>
                                                <TableCell>
                                                    <p className="font-medium">
                                                        {trip.code}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {trip.name}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-sm whitespace-nowrap">
                                                    {formatDate(
                                                        trip.start_date,
                                                    )}{' '}
                                                    –{' '}
                                                    {formatDate(trip.end_date)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {tripStatusLabels[
                                                            trip
                                                                .operational_status
                                                        ] ??
                                                            trip.operational_status}
                                                    </Badge>
                                                    {trip.operational_status ===
                                                        'returned' &&
                                                        trip.blockers.length >
                                                            0 && (
                                                            <p className="mt-1 text-xs text-destructive">
                                                                {
                                                                    trip
                                                                        .blockers
                                                                        .length
                                                                }{' '}
                                                                pemeriksaan
                                                                belum terpenuhi
                                                            </p>
                                                        )}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {trip.operational_status ===
                                                    'returned'
                                                        ? formatIdr(
                                                              trip.revenue_amount_idr,
                                                          )
                                                        : '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {trip.operational_status ===
                                                        'financially_closed' &&
                                                    can('approve') ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                reverseTripClosure(
                                                                    trip,
                                                                )
                                                            }
                                                        >
                                                            <RotateCcw className="size-4" />{' '}
                                                            Reversal
                                                        </Button>
                                                    ) : trip.next_status &&
                                                      ((trip.next_status ===
                                                          'financially_closed' &&
                                                          can('approve')) ||
                                                          (trip.next_status !==
                                                              'financially_closed' &&
                                                              can('edit'))) ? (
                                                        <Button
                                                            size="sm"
                                                            variant={
                                                                trip.next_status ===
                                                                'financially_closed'
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            onClick={() =>
                                                                openTripTransition(
                                                                    trip,
                                                                )
                                                            }
                                                        >
                                                            {
                                                                tripStatusLabels[
                                                                    trip
                                                                        .next_status
                                                                ]
                                                            }
                                                        </Button>
                                                    ) : null}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {workspace === 'vendor-hpp' && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4">
                                <h2 className="font-semibold">
                                    Riwayat alokasi uang muka
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Jejak penggunaan DP vendor terhadap tagihan.
                                </p>
                            </div>
                            {vendorAllocations.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    Belum ada alokasi. Alur yang benar: catat
                                    uang muka → catat tagihan vendor yang sama →
                                    pilih “Pakai DP”.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>Vendor</TableHead>
                                                <TableHead>Tagihan</TableHead>
                                                <TableHead>Catatan</TableHead>
                                                <TableHead className="text-right">
                                                    Dialokasikan
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {vendorAllocations.map(
                                                (allocation) => (
                                                    <TableRow
                                                        key={allocation.id}
                                                    >
                                                        <TableCell>
                                                            {formatDate(
                                                                allocation.allocation_date,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {
                                                                allocation.vendor_name
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {allocation.invoice_number ||
                                                                'Tanpa nomor invoice'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {allocation.notes ||
                                                                '—'}
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {formatIdr(
                                                                allocation.amount_idr,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
                {workspace === 'vendor-hpp' &&
                    vendorServiceBills.length > 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="font-semibold">
                                        Layanan vendor belum digunakan
                                    </h2>
                                    <span className="text-sm text-muted-foreground">
                                        {vendorServiceBills.length} tagihan
                                    </span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {vendorServiceBills.map((bill) => (
                                        <div
                                            key={bill.id}
                                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {bill.vendor_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Belum diakui{' '}
                                                    {formatIdr(
                                                        bill.remaining_amount_idr,
                                                    )}
                                                </p>
                                            </div>
                                            {can('create') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        serviceUseForm.setData({
                                                            amount_idr: String(
                                                                bill.remaining_amount_idr,
                                                            ),
                                                            usage_date: today,
                                                            notes: `Layanan ${bill.vendor_name} digunakan`,
                                                            idempotency_key:
                                                                idempotencyKey(
                                                                    'vendor-service-use',
                                                                ),
                                                        });
                                                        serviceUseForm.clearErrors();
                                                        setUsingServiceBill(
                                                            bill,
                                                        );
                                                    }}
                                                >
                                                    Catat penggunaan
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
            </div>
        </AppSidebarLayout>
    );
}

function SummaryCard({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: ReactNode;
}) {
    return (
        <Card className="py-3">
            <CardContent className="flex items-center justify-between gap-3 px-3.5">
                <div className="grid gap-1">
                    <span className="text-xs text-muted-foreground sm:text-sm">
                        {label}
                    </span>
                    <span className="text-base font-semibold sm:text-xl">
                        {value}
                    </span>
                </div>
                {icon && (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
                        {icon}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    const inputId = useId();
    const errorId = `${inputId}-error`;
    const linked = { value: false };
    const control = associateFirstControl(
        children,
        inputId,
        error ? errorId : undefined,
        linked,
    );

    return (
        <div className="grid gap-2">
            <Label htmlFor={inputId}>{label}</Label>
            {control}
            {error && (
                <p
                    id={errorId}
                    className="text-xs text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

type LinkableControlProps = {
    children?: ReactNode;
    id?: string;
    className?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
};

function associateFirstControl(
    node: ReactNode,
    inputId: string,
    errorId: string | undefined,
    linked: { value: boolean },
): ReactNode {
    return Children.map(node, (child) => {
        if (!isValidElement<LinkableControlProps>(child)) return child;

        const element = child as ReactElement<LinkableControlProps>;
        if (
            !linked.value &&
            (element.type === Input || element.type === SelectTrigger)
        ) {
            linked.value = true;

            return cloneElement(element, {
                id: inputId,
                'aria-describedby': errorId,
                'aria-invalid': Boolean(errorId),
                className: `min-h-11 ${element.props.className ?? ''}`.trim(),
            });
        }

        if (element.props.children) {
            return cloneElement(element, {
                children: associateFirstControl(
                    element.props.children,
                    inputId,
                    errorId,
                    linked,
                ),
            });
        }

        return element;
    });
}

function AccountSelect({
    label,
    accounts,
    value,
    onChange,
    error,
    showBalance = false,
}: {
    label: string;
    accounts: Account[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    showBalance?: boolean;
}) {
    const inputId = useId();
    const errorId = `${inputId}-error`;
    const selectedAccount = accounts.find(
        (account) => account.id.toString() === value,
    );

    return (
        <div className="grid gap-2">
            <Label htmlFor={inputId}>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger
                    id={inputId}
                    className="min-h-11"
                    aria-describedby={error ? errorId : undefined}
                    aria-invalid={Boolean(error)}
                >
                    <SelectValue placeholder="Pilih akun" />
                </SelectTrigger>
                <SelectContent>
                    {accounts.map((account) => (
                        <SelectItem
                            key={account.id}
                            value={account.id.toString()}
                        >
                            {account.code} · {account.name}
                            {showBalance
                                ? ` · Saldo ${formatIdr(account.balance_idr)}`
                                : ''}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {showBalance && selectedAccount && (
                <p className="text-xs text-muted-foreground">
                    Saldo saat ini {formatIdr(selectedAccount.balance_idr)}
                </p>
            )}
            {error && (
                <p
                    id={errorId}
                    className="text-xs text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

type MoneyForm = ReturnType<
    typeof useForm<{
        currency: string;
        exchange_rate: string;
        amount_original: string;
        amount_idr: string;
    }>
>;

function MoneyFields({ form }: { form: MoneyForm }) {
    const isIdr = form.data.currency.toUpperCase() === 'IDR';

    const updateAmount = (value: string) => {
        form.setData('amount_original', value);
        if (isIdr) form.setData('amount_idr', value);
    };

    const updateCurrency = (value: string) => {
        const currency = value.toUpperCase();
        form.setData('currency', currency);

        if (currency === 'IDR') {
            form.setData('exchange_rate', formatDecimalInput(1, 8));
            form.setData('amount_idr', form.data.amount_original);
        }
    };

    return (
        <div className="grid gap-4 rounded-lg bg-muted/40 p-4">
            <Field
                label={isIdr ? 'Nominal transaksi (IDR)' : 'Nominal transaksi'}
                error={form.errors.amount_original ?? form.errors.amount_idr}
            >
                <Input
                    autoFocus
                    className="h-12 text-lg font-semibold tabular-nums"
                    inputMode="decimal"
                    min="1"
                    placeholder="Contoh: 1000000"
                    type="number"
                    value={form.data.amount_original}
                    onChange={(event) => updateAmount(event.target.value)}
                />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mata uang" error={form.errors.currency}>
                    <Input
                        maxLength={3}
                        value={form.data.currency}
                        onChange={(event) => updateCurrency(event.target.value)}
                    />
                </Field>
                {!isIdr && (
                    <Field
                        label="Kurs ke IDR"
                        error={form.errors.exchange_rate}
                    >
                        <Input
                            inputMode="decimal"
                            value={form.data.exchange_rate}
                            onChange={(event) =>
                                form.setData(
                                    'exchange_rate',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                )}
                {!isIdr && (
                    <Field
                        label="Nilai pencatatan (IDR)"
                        error={form.errors.amount_idr}
                    >
                        <Input
                            inputMode="numeric"
                            min="1"
                            step="1"
                            type="number"
                            value={form.data.amount_idr}
                            onChange={(event) =>
                                form.setData('amount_idr', event.target.value)
                            }
                        />
                    </Field>
                )}
            </div>
        </div>
    );
}
