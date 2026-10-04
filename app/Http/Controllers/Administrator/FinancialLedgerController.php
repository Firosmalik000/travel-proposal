<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\ApplyVendorAdvanceRequest;
use App\Http\Requests\Administrator\ExportFinancialLedgerRequest;
use App\Http\Requests\Administrator\ReverseFinancialTransactionRequest;
use App\Http\Requests\Administrator\StoreClassifiedCashTransactionRequest;
use App\Http\Requests\Administrator\StoreFinancialAccountRequest;
use App\Http\Requests\Administrator\StoreFinancialJournalRequest;
use App\Http\Requests\Administrator\StoreFinancialTransactionTypeRequest;
use App\Http\Requests\Administrator\StoreOpeningBalanceRequest;
use App\Http\Requests\Administrator\StoreTripTransitionRequest;
use App\Http\Requests\Administrator\StoreVendorAdvanceRequest;
use App\Http\Requests\Administrator\StoreVendorBillPaymentRequest;
use App\Http\Requests\Administrator\StoreVendorBillRequest;
use App\Http\Requests\Administrator\StoreVendorServiceUsageRequest;
use App\Http\Requests\Administrator\UpdateFinancialAccountRequest;
use App\Http\Requests\Administrator\UpdateFinancialTransactionTypeRequest;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\FinancialTransactionLine;
use App\Models\FinancialTransactionType;
use App\Models\PackageVendor;
use App\Models\TravelPackage;
use App\Models\VendorAdvance;
use App\Models\VendorAdvanceAllocation;
use App\Models\VendorBill;
use App\Services\ActivityLogService;
use App\Services\FinancialExportService;
use App\Services\FinancialLedgerService;
use App\Services\PdfBrandingService;
use App\Services\PdfRenderer;
use App\Services\TripClosingService;
use App\Services\VendorBillService;
use App\Services\VendorHppTrackingService;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinancialLedgerController extends Controller
{
    public function __construct(
        private readonly FinancialLedgerService $financialLedgerService,
        private readonly VendorBillService $vendorBillService,
        private readonly TripClosingService $tripClosingService,
        private readonly VendorHppTrackingService $vendorHppTrackingService,
        private readonly FinancialExportService $financialExportService,
        private readonly PdfRenderer $pdfRenderer,
        private readonly PdfBrandingService $pdfBrandingService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request): Response
    {
        $workspace = (string) $request->route('workspace', 'accounting');
        $workspace = in_array($workspace, ['transactions', 'vendor-hpp', 'accounting', 'master'], true)
            ? $workspace
            : 'accounting';

        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'account_id' => ['nullable', 'integer', 'exists:financial_accounts,id'],
            'transaction_type' => ['nullable', Rule::in([
                'opening_balance', 'manual_journal', 'transfer', 'legacy_unclassified', 'booking_payment',
                'capital_contribution', 'owner_withdrawal', 'operating_expense', 'other_income', 'customer_refund',
                'agent_commission', 'inventory_purchase', 'inventory_issue', 'vendor_bill', 'vendor_payment',
                'vendor_advance_payment', 'vendor_advance_application', 'vendor_service_use',
                'trip_revenue_recognition', 'period_adjustment', 'reversal',
            ])],
            'category_code' => ['nullable', 'exists:financial_transaction_types,code'],
            'status' => ['nullable', Rule::in(['posted', 'reversed'])],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $transactionTypes = FinancialTransactionType::query()
            ->withCount('transactions')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $balances = FinancialTransactionLine::query()
            ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
            ->whereIn('financial_transactions.status', ['posted', 'reversed'])
            ->groupBy('financial_transaction_lines.financial_account_id')
            ->select('financial_transaction_lines.financial_account_id')
            ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr ELSE 0 END) as debit_total")
            ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'credit' THEN financial_transaction_lines.amount_idr ELSE 0 END) as credit_total")
            ->get()
            ->keyBy('financial_account_id');

        $openingBalanceAccountIds = FinancialTransactionLine::query()
            ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
            ->where('financial_transactions.transaction_type', 'opening_balance')
            ->pluck('financial_transaction_lines.financial_account_id')
            ->unique()
            ->flip();

        $accounts = FinancialAccount::query()
            ->orderBy('code')
            ->get()
            ->map(function (FinancialAccount $account) use ($balances, $openingBalanceAccountIds): array {
                $totals = $balances->get($account->id);
                $debit = (int) ($totals?->debit_total ?? 0);
                $credit = (int) ($totals?->credit_total ?? 0);

                return [
                    'id' => $account->id,
                    'code' => $account->code,
                    'name' => $account->name,
                    'type' => $account->type,
                    'is_cash_account' => $account->is_cash_account,
                    'cash_account_type' => $account->cash_account_type,
                    'account_number' => $account->account_number,
                    'currency' => $account->currency,
                    'system_key' => $account->system_key,
                    'is_active' => $account->is_active,
                    'has_opening_balance' => $openingBalanceAccountIds->has($account->id),
                    'debit_total' => $debit,
                    'credit_total' => $credit,
                    'balance_idr' => $account->usesDebitNormalBalance() ? $debit - $credit : $credit - $debit,
                ];
            })
            ->values()
            ->all();

        $transactions = FinancialTransaction::query()
            ->with(['lines.account:id,code,name', 'postedBy:id,name', 'reversal:id,transaction_number,reversal_of_id', 'typeDefinition:id,code,name'])
            ->when($filters['date_from'] ?? null, fn ($query, string $date) => $query->whereDate('transaction_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, string $date) => $query->whereDate('transaction_date', '<=', $date))
            ->when($filters['account_id'] ?? null, fn ($query, int|string $accountId) => $query->whereHas('lines', fn ($lineQuery) => $lineQuery->where('financial_account_id', $accountId)))
            ->when($filters['transaction_type'] ?? null, fn ($query, string $type) => $query->where('transaction_type', $type))
            ->when($filters['category_code'] ?? null, fn ($query, string $categoryCode) => $query->where('category_code', $categoryCode))
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery->where('transaction_number', 'like', '%'.$search.'%')
                        ->orWhere('description', 'like', '%'.$search.'%');
                });
            })
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (FinancialTransaction $transaction): array => [
                'id' => $transaction->id,
                'transaction_number' => $transaction->transaction_number,
                'transaction_date' => $transaction->transaction_date?->toDateString(),
                'transaction_type' => $transaction->transaction_type,
                'category_code' => $transaction->category_code,
                'category_label' => $transaction->typeDefinition?->name ?? $transaction->category_code,
                'status' => $transaction->status,
                'currency' => $transaction->currency,
                'exchange_rate' => $transaction->exchange_rate,
                'amount_original' => $transaction->amount_original,
                'amount_idr' => $transaction->amount_idr,
                'description' => $transaction->description,
                'source_type' => $transaction->source_type,
                'reversal_of_id' => $transaction->reversal_of_id,
                'reversal_number' => $transaction->reversal?->transaction_number,
                'can_reverse' => $transaction->status === 'posted'
                    && $transaction->transaction_type !== 'reversal'
                    && $transaction->source_type === null,
                'posted_at' => $transaction->posted_at?->toDateTimeString(),
                'posted_by_name' => $transaction->postedBy?->name,
                'lines' => $transaction->lines->map(fn ($line): array => [
                    'id' => $line->id,
                    'entry_type' => $line->entry_type,
                    'amount_original' => $line->amount_original,
                    'amount_idr' => $line->amount_idr,
                    'description' => $line->description,
                    'account' => [
                        'id' => $line->account->id,
                        'code' => $line->account->code,
                        'name' => $line->account->name,
                    ],
                ])->values()->all(),
            ]);

        $cashBalances = collect($accounts)->where('is_cash_account', true);
        $vendorHppTracking = $workspace === 'vendor-hpp'
            ? $this->vendorHppTrackingService->build()
            : ['summary' => [], 'trips' => []];

        return Inertia::render('Dashboard/FinancialManagement/Ledger/Index', [
            'workspace' => $workspace,
            'permissionKey' => match ($workspace) {
                'transactions' => 'finance_transactions',
                'vendor-hpp' => 'finance_vendor_hpp',
                'master' => 'finance_master',
                default => 'finance_accounting',
            },
            'today' => now()->toDateString(),
            'filters' => [
                'date_from' => (string) ($filters['date_from'] ?? ''),
                'date_to' => (string) ($filters['date_to'] ?? ''),
                'account_id' => (string) ($filters['account_id'] ?? ''),
                'transaction_type' => (string) ($filters['transaction_type'] ?? ''),
                'category_code' => (string) ($filters['category_code'] ?? ''),
                'status' => (string) ($filters['status'] ?? ''),
                'search' => (string) ($filters['search'] ?? ''),
            ],
            'accounts' => $accounts,
            'transactionCategories' => $transactionTypes
                ->whereIn('applies_to', ['transfer', 'manual_journal'])
                ->map(fn (FinancialTransactionType $type): array => [
                    'value' => $type->code,
                    'label' => $type->name,
                    'transaction_types' => [$type->applies_to],
                    'is_active' => $type->is_active,
                ])
                ->values()
                ->all(),
            'transactionTypes' => $transactionTypes
                ->whereIn('applies_to', ['transfer', 'manual_journal'])
                ->map(fn (FinancialTransactionType $type): array => [
                    'id' => $type->id,
                    'code' => $type->code,
                    'name' => $type->name,
                    'applies_to' => $type->applies_to,
                    'description' => $type->description,
                    'is_active' => $type->is_active,
                    'is_system' => $type->is_system,
                    'sort_order' => $type->sort_order,
                    'transactions_count' => $type->transactions_count,
                ])
                ->values()
                ->all(),
            'transactions' => $transactions,
            'summary' => [
                'accounts' => count($accounts),
                'active_accounts' => collect($accounts)->where('is_active', true)->count(),
                'cash_accounts' => $cashBalances->count(),
                'cash_balance_idr' => $cashBalances->sum('balance_idr'),
            ],
            'vendorHppSummary' => $vendorHppTracking['summary'],
            'tripFinanceRows' => $vendorHppTracking['trips'],
            'accountMappings' => [
                ['source' => 'Pembayaran booking', 'debit' => 'Kas/Bank penerima', 'credit' => 'Uang Muka Jemaah'],
                ['source' => 'Pendapatan lain-lain', 'debit' => 'Kas/Bank penerima', 'credit' => 'Pendapatan Lain-lain'],
                ['source' => 'Biaya operasional', 'debit' => 'Biaya Operasional', 'credit' => 'Kas/Bank pembayar'],
                ['source' => 'Transfer dana', 'debit' => 'Kas/Bank tujuan', 'credit' => 'Kas/Bank sumber'],
                ['source' => 'Tagihan vendor', 'debit' => 'Aset/Biaya Trip Ditangguhkan', 'credit' => 'Hutang Vendor'],
                ['source' => 'Pembayaran vendor', 'debit' => 'Hutang Vendor', 'credit' => 'Kas/Bank pembayar'],
                ['source' => 'Uang muka vendor', 'debit' => 'Uang Muka Vendor', 'credit' => 'Kas/Bank pembayar'],
                ['source' => 'Pemakaian layanan vendor', 'debit' => 'HPP Trip', 'credit' => 'Aset/Biaya Trip Ditangguhkan'],
                ['source' => 'Trip ditutup finansial', 'debit' => 'Uang Muka Jemaah', 'credit' => 'Pendapatan Trip'],
            ],
            'vendorOptions' => PackageVendor::query()->orderBy('name')->get(['id', 'name'])->map(fn (PackageVendor $vendor): array => ['id' => $vendor->id, 'name' => $vendor->name])->values()->all(),
            'packageOptions' => TravelPackage::query()->orderByDesc('id')->get(['id', 'code', 'name'])->map(fn (TravelPackage $package): array => ['id' => $package->id, 'code' => $package->code, 'name' => (string) (data_get($package->name, 'id') ?? $package->name ?? $package->code)])->values()->all(),
            'vendorBills' => VendorBill::query()->whereIn('status', ['open', 'partially_paid'])->with('vendor:id,name')->latest('id')->limit(50)->get()->map(fn (VendorBill $bill): array => ['id' => $bill->id, 'package_vendor_id' => $bill->package_vendor_id, 'vendor_name' => $bill->vendor?->name ?? 'Vendor', 'amount_idr' => $bill->amount_idr, 'paid_amount_idr' => $bill->paid_amount_idr, 'remaining_amount_idr' => $bill->remainingAmount(), 'status' => $bill->status])->values()->all(),
            'vendorServiceBills' => VendorBill::query()->where('status', '!=', 'void')->whereRaw('vendor_bills.amount_idr > (SELECT COALESCE(SUM(amount_idr), 0) FROM vendor_service_usages WHERE vendor_bill_id = vendor_bills.id)')->with('vendor:id,name')->withSum('serviceUsages as recognized_amount_idr', 'amount_idr')->latest('id')->limit(100)->get()->map(fn (VendorBill $bill): array => ['id' => $bill->id, 'vendor_name' => $bill->vendor?->name ?? 'Vendor', 'remaining_amount_idr' => (int) $bill->amount_idr - (int) $bill->recognized_amount_idr])->values()->all(),
            'vendorAdvanceOptions' => VendorAdvance::query()->whereIn('status', ['open', 'partially_applied'])->with('vendor:id,name')->latest('id')->limit(50)->get()->map(fn (VendorAdvance $advance): array => ['id' => $advance->id, 'package_vendor_id' => $advance->package_vendor_id, 'vendor_name' => $advance->vendor?->name ?? 'Vendor', 'remaining_amount_idr' => $advance->remainingAmount()])->values()->all(),
            'vendorAllocations' => VendorAdvanceAllocation::query()->with(['advance.vendor:id,name', 'bill:id,vendor_invoice_number'])->latest('allocation_date')->latest('id')->limit(50)->get()->map(fn (VendorAdvanceAllocation $allocation): array => [
                'id' => $allocation->id,
                'allocation_date' => $allocation->allocation_date?->toDateString(),
                'vendor_name' => $allocation->advance?->vendor?->name ?? 'Vendor',
                'invoice_number' => $allocation->bill?->vendor_invoice_number,
                'amount_idr' => $allocation->amount_idr,
                'notes' => $allocation->notes,
            ])->values()->all(),
            'tripOptions' => TravelPackage::query()->orderByDesc('start_date')->limit(50)->get()->map(function (TravelPackage $package): array {
                $assessment = $package->operational_status === 'returned'
                    ? $this->tripClosingService->assessment($package)
                    : ['blockers' => [], 'revenue_amount_idr' => 0, 'registered_bookings' => 0, 'open_vendor_bills' => 0, 'pending_inventory' => 0];

                return [
                    'id' => $package->id,
                    'code' => $package->code,
                    'name' => (string) (data_get($package->name, 'id') ?? $package->name ?? $package->code),
                    'start_date' => $package->start_date?->toDateString(),
                    'end_date' => $package->end_date?->toDateString(),
                    'operational_status' => $package->operational_status,
                    'next_status' => ['planning' => 'ready', 'ready' => 'departed', 'departed' => 'returned', 'returned' => 'financially_closed'][$package->operational_status] ?? null,
                    ...$assessment,
                ];
            })->values()->all(),
        ]);
    }

    public function exportPdf(ExportFinancialLedgerRequest $request): HttpResponse
    {
        $filters = $request->validated();
        $filters['report'] = $filters['report'] ?? 'journal';
        $dataset = $this->financialExportService->ledgerDataset($filters);
        $branding = $this->pdfBrandingService->branding();
        $generatedAt = now('Asia/Jakarta');

        $this->activityLogService->logFromRequest(
            request: $request,
            eventType: 'export',
            description: 'Mengunduh '.$dataset['title'].' dalam PDF.',
            module: 'Keuangan',
            menuKey: 'finance_accounting',
            properties: ['format' => 'pdf', 'filters' => $filters],
        );

        return $this->pdfRenderer->renderDownload(
            view: 'pdf.financial-ledger',
            data: [
                'dataset' => $dataset,
                'filters' => $filters,
                'branding' => $branding,
                'seo' => $this->pdfBrandingService->seo(),
                'locale' => 'id',
                'generatedAt' => $generatedAt,
                'generatedBy' => $request->user()?->name,
            ],
            filename: $filters['report'].'-'.($filters['date_from'] ?? 'awal').'-'.($filters['date_to'] ?? $generatedAt->toDateString()).'.pdf',
            mpdfConfig: ['orientation' => 'L', 'margin_top' => 18, 'margin_bottom' => 30],
            footerView: 'pdf.partials.footer',
            footerData: ['branding' => $branding],
        );
    }

    public function exportCsv(ExportFinancialLedgerRequest $request): StreamedResponse
    {
        $filters = $request->validated();
        $filters['report'] = $filters['report'] ?? 'journal';
        $dataset = $this->financialExportService->ledgerDataset($filters);

        $this->activityLogService->logFromRequest(
            request: $request,
            eventType: 'export',
            description: 'Mengunduh '.$dataset['title'].' dalam CSV.',
            module: 'Keuangan',
            menuKey: 'finance_accounting',
            properties: ['format' => 'csv', 'filters' => $filters],
        );

        return response()->streamDownload(function () use ($dataset): void {
            $stream = fopen('php://output', 'wb');
            if ($stream === false) {
                return;
            }

            fwrite($stream, "\xEF\xBB\xBF");
            fputcsv($stream, array_values($dataset['headers']));
            foreach ($dataset['rows'] as $row) {
                fputcsv($stream, array_map(
                    fn (string $key): mixed => $this->spreadsheetSafe($row[$key] ?? null),
                    array_keys($dataset['headers']),
                ));
            }
            fclose($stream);
        }, $filters['report'].'-'.($filters['date_from'] ?? 'awal').'-'.($filters['date_to'] ?? now()->toDateString()).'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function storeAccount(StoreFinancialAccountRequest $request): RedirectResponse
    {
        FinancialAccount::query()->create($request->validated());

        return back()->with('success', 'Akun keuangan berhasil ditambahkan.');
    }

    public function updateAccount(UpdateFinancialAccountRequest $request, FinancialAccount $financialAccount): RedirectResponse
    {
        $validated = $request->validated();

        if ($financialAccount->system_key && (
            $financialAccount->code !== $validated['code']
            || $financialAccount->type !== $validated['type']
            || $financialAccount->is_cash_account !== (bool) $validated['is_cash_account']
            || $financialAccount->cash_account_type !== $validated['cash_account_type']
            || $financialAccount->currency !== $validated['currency']
            || ! (bool) $validated['is_active']
        )) {
            return back()->withErrors(['account' => 'Struktur akun bawaan sistem tidak dapat diubah atau dinonaktifkan.']);
        }

        if ($financialAccount->transactionLines()->exists() && (
            $financialAccount->code !== $validated['code']
            || $financialAccount->type !== $validated['type']
        )) {
            return back()->withErrors(['account' => 'Kode dan tipe akun yang sudah memiliki transaksi tidak dapat diubah.']);
        }

        $financialAccount->update($validated);

        return back()->with('success', 'Akun keuangan berhasil diperbarui.');
    }

    public function storeTransactionType(StoreFinancialTransactionTypeRequest $request): RedirectResponse
    {
        FinancialTransactionType::query()->create([
            ...$request->validated(),
            'is_system' => false,
        ]);

        return back()->with('success', 'Jenis transaksi berhasil ditambahkan.');
    }

    public function updateTransactionType(UpdateFinancialTransactionTypeRequest $request, FinancialTransactionType $financialTransactionType): RedirectResponse
    {
        if ($financialTransactionType->is_system) {
            return back()->withErrors(['transaction_type' => 'Jenis bawaan sistem tidak dapat diubah.']);
        }

        $validated = $request->validated();
        if ($financialTransactionType->transactions()->exists()
            && $validated['applies_to'] !== $financialTransactionType->applies_to) {
            return back()->withErrors(['applies_to' => 'Penggunaan tidak dapat diubah karena jenis sudah memiliki histori transaksi.']);
        }

        $financialTransactionType->update($validated);

        return back()->with('success', 'Jenis transaksi berhasil diperbarui.');
    }

    public function destroyTransactionType(FinancialTransactionType $financialTransactionType): RedirectResponse
    {
        if ($financialTransactionType->is_system) {
            return back()->withErrors(['transaction_type' => 'Jenis bawaan sistem tidak dapat dihapus.']);
        }

        if ($financialTransactionType->transactions()->exists()) {
            return back()->withErrors(['transaction_type' => 'Jenis sudah digunakan transaksi dan tidak dapat dihapus. Nonaktifkan jenis agar histori audit tetap utuh.']);
        }

        $financialTransactionType->delete();

        return back()->with('success', 'Jenis transaksi berhasil dihapus.');
    }

    public function storeOpeningBalance(StoreOpeningBalanceRequest $request): RedirectResponse
    {
        try {
            $this->financialLedgerService->postOpeningBalance(
                FinancialAccount::query()->findOrFail($request->integer('financial_account_id')),
                $request->validated(),
            );
        } catch (DomainException $exception) {
            return back()->withErrors(['ledger' => $exception->getMessage()]);
        }

        return back()->with('success', 'Saldo awal berhasil diposting.');
    }

    public function storeJournal(StoreFinancialJournalRequest $request): RedirectResponse
    {
        try {
            $this->financialLedgerService->postTwoSidedJournal($request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['ledger' => $exception->getMessage()]);
        }

        return back()->with('success', 'Jurnal berhasil diposting.');
    }

    public function storeTransfer(StoreFinancialJournalRequest $request): RedirectResponse
    {
        if ($request->string('transaction_type')->value() !== 'transfer') {
            return back()->withErrors(['ledger' => 'Endpoint ini hanya menerima transfer antar-rekening kas/bank.']);
        }

        try {
            $this->financialLedgerService->postTwoSidedJournal($request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['ledger' => $exception->getMessage()]);
        }

        return back()->with('success', 'Transfer dana berhasil diposting.');
    }

    public function storeClassifiedCashTransaction(StoreClassifiedCashTransactionRequest $request): RedirectResponse
    {
        if ($request->input('transaction_type') === 'customer_refund') {
            return back()->withErrors(['ledger' => 'Refund dicatat dari pembayaran booking asal.']);
        }

        try {
            $this->financialLedgerService->postClassifiedCashTransaction($request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['ledger' => $exception->getMessage()]);
        }

        return back()->with('success', 'Transaksi kas berhasil diposting.');
    }

    public function show(Request $request, FinancialTransaction $financialTransaction): Response
    {
        $fromAccounting = $request->string('from')->value() === 'accounting';
        $financialTransaction->load([
            'lines.account:id,code,name,type,is_cash_account,cash_account_type,currency',
            'postedBy:id,name,email',
            'reversedBy:id,name,email',
            'reversal:id,transaction_number,transaction_date,description,posted_at,reversal_of_id',
            'reversalOf:id,transaction_number,transaction_date,description,posted_at',
            'typeDefinition:id,code,name,description',
            'package:id,code,name',
        ]);

        return Inertia::render('Dashboard/FinancialManagement/Ledger/Show', [
            'permissionKey' => $fromAccounting ? 'finance_accounting' : 'finance_transactions',
            'backUrl' => $fromAccounting
                ? '/admin/financial-management/accounting'
                : '/admin/financial-management/transactions',
            'backLabel' => $fromAccounting ? 'Pembukuan' : 'Transaksi Keuangan',
            'detailContext' => $fromAccounting ? 'accounting' : 'transactions',
            'transaction' => [
                'id' => $financialTransaction->id,
                'transaction_number' => $financialTransaction->transaction_number,
                'transaction_date' => $financialTransaction->transaction_date?->toDateString(),
                'transaction_type' => $financialTransaction->transaction_type,
                'category_code' => $financialTransaction->category_code,
                'category_label' => $financialTransaction->typeDefinition?->name ?? $financialTransaction->category_code,
                'status' => $financialTransaction->status,
                'currency' => $financialTransaction->currency,
                'exchange_rate' => $financialTransaction->exchange_rate,
                'amount_original' => $financialTransaction->amount_original,
                'amount_idr' => $financialTransaction->amount_idr,
                'description' => $financialTransaction->description,
                'source_type' => $financialTransaction->source_type,
                'source_id' => $financialTransaction->source_id,
                'idempotency_key' => $financialTransaction->idempotency_key,
                'posted_at' => $financialTransaction->posted_at?->toDateTimeString(),
                'posted_by' => $financialTransaction->postedBy?->only(['id', 'name', 'email']),
                'reversed_at' => $financialTransaction->reversed_at?->toDateTimeString(),
                'reversed_by' => $financialTransaction->reversedBy?->only(['id', 'name', 'email']),
                'can_reverse' => $financialTransaction->status === 'posted'
                    && $financialTransaction->transaction_type !== 'reversal'
                    && $financialTransaction->source_type === null,
                'reversal' => $financialTransaction->reversal ? [
                    'id' => $financialTransaction->reversal->id,
                    'transaction_number' => $financialTransaction->reversal->transaction_number,
                    'transaction_date' => $financialTransaction->reversal->transaction_date?->toDateString(),
                    'description' => $financialTransaction->reversal->description,
                    'posted_at' => $financialTransaction->reversal->posted_at?->toDateTimeString(),
                ] : null,
                'reversal_of' => $financialTransaction->reversalOf ? [
                    'id' => $financialTransaction->reversalOf->id,
                    'transaction_number' => $financialTransaction->reversalOf->transaction_number,
                    'transaction_date' => $financialTransaction->reversalOf->transaction_date?->toDateString(),
                    'description' => $financialTransaction->reversalOf->description,
                    'posted_at' => $financialTransaction->reversalOf->posted_at?->toDateTimeString(),
                ] : null,
                'package' => $financialTransaction->package ? [
                    'id' => $financialTransaction->package->id,
                    'code' => $financialTransaction->package->code,
                    'name' => (string) (data_get($financialTransaction->package->name, 'id') ?? $financialTransaction->package->name ?? $financialTransaction->package->code),
                ] : null,
                'lines' => $financialTransaction->lines->map(fn ($line): array => [
                    'id' => $line->id,
                    'entry_type' => $line->entry_type,
                    'amount_original' => $line->amount_original,
                    'amount_idr' => $line->amount_idr,
                    'memo' => $line->memo,
                    'account' => [
                        'id' => $line->account->id,
                        'code' => $line->account->code,
                        'name' => $line->account->name,
                        'type' => $line->account->type,
                        'is_cash_account' => (bool) $line->account->is_cash_account,
                        'cash_account_type' => $line->account->cash_account_type,
                    ],
                ])->values()->all(),
            ],
        ]);
    }

    public function showVendorHpp(TravelPackage $travelPackage): Response
    {
        return Inertia::render('Dashboard/FinancialManagement/Ledger/VendorHppShow', [
            'trip' => $this->vendorHppTrackingService->buildForPackage($travelPackage),
            'today' => now()->toDateString(),
            'paymentAccounts' => $this->hppPaymentAccounts(),
        ]);
    }

    public function storeHppOperationalPayment(
        StoreClassifiedCashTransactionRequest $request,
        TravelPackage $travelPackage,
    ): RedirectResponse {
        $validated = $request->validated();
        $validated['transaction_type'] = 'operating_expense';
        $validated['package_id'] = $travelPackage->id;

        try {
            $this->financialLedgerService->postClassifiedCashTransaction($validated);
        } catch (DomainException $exception) {
            return back()->withErrors(['ledger' => $exception->getMessage()]);
        }

        return back()->with('success', 'Pembayaran operasional HPP berhasil dicatat sebagai uang keluar.');
    }

    public function reverse(ReverseFinancialTransactionRequest $request, FinancialTransaction $financialTransaction): RedirectResponse
    {
        if ($financialTransaction->source_type !== null) {
            return back()->withErrors(['ledger' => 'Transaksi bersumber hanya dapat dikoreksi dari modul asal.']);
        }

        try {
            $this->financialLedgerService->reverse($financialTransaction, $request->string('reason')->value());
        } catch (DomainException $exception) {
            return back()->withErrors(['ledger' => $exception->getMessage()]);
        }

        return back()->with('success', 'Reversal berhasil diposting tanpa menghapus histori.');
    }

    public function storeVendorBill(StoreVendorBillRequest $request): RedirectResponse
    {
        try {
            $this->vendorBillService->create($request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['vendor' => $exception->getMessage()]);
        }

        return back()->with('success', 'Tagihan vendor berhasil dicatat sebagai hutang.');
    }

    public function payVendorBill(StoreVendorBillPaymentRequest $request, VendorBill $vendorBill): RedirectResponse
    {
        try {
            $this->vendorBillService->pay($vendorBill, $request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['vendor' => $exception->getMessage()]);
        }

        return back()->with('success', 'Pembayaran vendor berhasil dicatat.');
    }

    public function storeVendorAdvance(StoreVendorAdvanceRequest $request): RedirectResponse
    {
        try {
            $this->vendorBillService->createAdvance($request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['vendor' => $exception->getMessage()]);
        }

        return back()->with('success', 'Uang muka vendor berhasil dicatat.');
    }

    public function applyVendorAdvance(ApplyVendorAdvanceRequest $request, VendorAdvance $vendorAdvance, VendorBill $vendorBill): RedirectResponse
    {
        try {
            $this->vendorBillService->applyAdvance($vendorAdvance, $vendorBill, $request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['vendor' => $exception->getMessage()]);
        }

        return back()->with('success', 'Uang muka berhasil dialokasikan ke tagihan vendor.');
    }

    public function storeVendorServiceUsage(StoreVendorServiceUsageRequest $request, VendorBill $vendorBill): RedirectResponse
    {
        try {
            $this->vendorBillService->recordServiceUse($vendorBill, $request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['vendor' => $exception->getMessage()]);
        }

        return back()->with('success', 'Layanan vendor digunakan dan HPP trip diakui.');
    }

    public function storeTripTransition(StoreTripTransitionRequest $request, TravelPackage $travelPackage): RedirectResponse
    {
        if ($request->string('to_status')->value() === 'financially_closed'
            && ! $request->user()?->can('menu.financial_ledger.approve')) {
            abort(403, 'Anda tidak memiliki izin untuk menyetujui penutupan finansial trip.');
        }

        try {
            $this->tripClosingService->transition($travelPackage, $request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['trip' => $exception->getMessage()]);
        }

        return back()->with('success', 'Status operasional trip berhasil diperbarui.');
    }

    public function reverseTripClosure(ReverseFinancialTransactionRequest $request, TravelPackage $travelPackage): RedirectResponse
    {
        try {
            $this->tripClosingService->reverseClosure($travelPackage, $request->string('reason')->value());
        } catch (DomainException $exception) {
            return back()->withErrors(['trip' => $exception->getMessage()]);
        }

        return back()->with('success', 'Penutupan finansial trip berhasil direversal dan trip kembali ke status Sudah kembali.');
    }

    /** @return array<int, array<string, int|string|null>> */
    private function hppPaymentAccounts(): array
    {
        $balances = FinancialTransactionLine::query()
            ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
            ->whereIn('financial_transactions.status', ['posted', 'reversed'])
            ->groupBy('financial_transaction_lines.financial_account_id')
            ->select('financial_transaction_lines.financial_account_id')
            ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr ELSE 0 END) as debit_total")
            ->selectRaw("SUM(CASE WHEN financial_transaction_lines.entry_type = 'credit' THEN financial_transaction_lines.amount_idr ELSE 0 END) as credit_total")
            ->get()
            ->keyBy('financial_account_id');

        return FinancialAccount::query()
            ->where('is_active', true)
            ->where('is_cash_account', true)
            ->whereIn('cash_account_type', ['operating', 'petty_cash'])
            ->orderBy('code')
            ->get(['id', 'code', 'name', 'account_number'])
            ->map(function (FinancialAccount $account) use ($balances): array {
                $totals = $balances->get($account->id);

                return [
                    'id' => $account->id,
                    'code' => $account->code,
                    'name' => $account->name,
                    'account_number' => $account->account_number,
                    'balance_idr' => (int) ($totals?->debit_total ?? 0) - (int) ($totals?->credit_total ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    private function spreadsheetSafe(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        return preg_match('/^[=+\-@]/', ltrim($value)) === 1 ? "'".$value : $value;
    }
}
