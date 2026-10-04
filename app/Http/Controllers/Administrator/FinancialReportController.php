<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\CloseFinancialPeriodRequest;
use App\Http\Requests\Administrator\ExportFinancialReportRequest;
use App\Http\Requests\Administrator\ReopenFinancialPeriodRequest;
use App\Http\Requests\Administrator\StoreBankReconciliationRequest;
use App\Http\Requests\Administrator\StoreFinancialBudgetRequest;
use App\Http\Requests\Administrator\StorePeriodAdjustmentRequest;
use App\Http\Requests\Administrator\UpdateFinancialBudgetRequest;
use App\Http\Requests\Administrator\UpdateFinancialBudgetStatusRequest;
use App\Models\FinancialAccount;
use App\Models\FinancialBudget;
use App\Models\FinancialPeriod;
use App\Models\FinancialTransaction;
use App\Models\TravelPackage;
use App\Services\ActivityLogService;
use App\Services\BankReconciliationService;
use App\Services\FinancialBudgetService;
use App\Services\FinancialExportService;
use App\Services\FinancialLedgerService;
use App\Services\FinancialPeriodService;
use App\Services\FinancialReportService;
use App\Services\PdfBrandingService;
use App\Services\PdfRenderer;
use DomainException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinancialReportController extends Controller
{
    public function __construct(
        private readonly PdfRenderer $pdfRenderer,
        private readonly PdfBrandingService $pdfBrandingService,
        private readonly FinancialReportService $financialReportService,
        private readonly FinancialPeriodService $financialPeriodService,
        private readonly BankReconciliationService $bankReconciliationService,
        private readonly FinancialLedgerService $financialLedgerService,
        private readonly FinancialBudgetService $financialBudgetService,
        private readonly FinancialExportService $financialExportService,
        private readonly ActivityLogService $activityLogService,
    ) {}

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);
        $workspace = (string) $request->route('workspace', 'reports');
        $workspace = in_array($workspace, ['overview', 'reports', 'controls'], true)
            ? $workspace
            : 'reports';
        $branding = $this->pdfBrandingService->branding();

        return Inertia::render('Dashboard/FinancialManagement/FinancialReport/Index', [
            'workspace' => $workspace,
            'permissionKey' => match ($workspace) {
                'overview' => 'finance_overview',
                'controls' => 'finance_controls',
                default => 'finance_reports',
            },
            'today' => now()->toDateString(),
            'filters' => $filters,
            'report' => $this->financialReportService->build($filters['date_from'], $filters['date_to']),
            'exportMeta' => [
                'company_name' => $branding['company_name'],
                'company_subtitle' => $branding['company_subtitle'],
                'generated_by' => $request->user()?->name,
            ],
            'cashAccountOptions' => FinancialAccount::query()->where('is_cash_account', true)->where('is_active', true)->orderBy('code')->get(['id', 'code', 'name'])->map(fn (FinancialAccount $account): array => ['id' => $account->id, 'label' => $account->code.' · '.$account->name])->all(),
            'accountOptions' => FinancialAccount::query()->where('is_active', true)->orderBy('code')->get(['id', 'code', 'name'])->map(fn (FinancialAccount $account): array => ['id' => $account->id, 'label' => $account->code.' · '.$account->name])->all(),
            'expenseAccountOptions' => FinancialAccount::query()->where('type', 'expense')->where('is_active', true)->orderBy('code')->get(['id', 'code', 'name'])->map(fn (FinancialAccount $account): array => ['id' => $account->id, 'label' => $account->code.' · '.$account->name])->all(),
            'packageOptions' => TravelPackage::query()->orderByDesc('start_date')->limit(200)->get(['id', 'code', 'name'])->map(fn (TravelPackage $package): array => ['id' => $package->id, 'label' => $package->code.' · '.(data_get($package->name, 'id') ?? $package->code)])->all(),
            'closedTransactionOptions' => FinancialTransaction::query()
                ->whereHas('lines')
                ->whereIn('status', ['posted', 'reversed'])
                ->whereExists(function ($query): void {
                    $query->selectRaw('1')->from('financial_periods')
                        ->where('status', 'closed')
                        ->whereColumn('financial_periods.start_date', '<=', 'financial_transactions.transaction_date')
                        ->whereColumn('financial_periods.end_date', '>=', 'financial_transactions.transaction_date');
                })
                ->latest('transaction_date')->limit(100)->get(['id', 'transaction_number', 'transaction_date', 'description'])
                ->map(fn (FinancialTransaction $transaction): array => [
                    'id' => $transaction->id,
                    'label' => $transaction->transaction_number.' · '.$transaction->transaction_date?->format('d/m/Y').' · '.($transaction->description ?: 'Tanpa deskripsi'),
                ])->all(),
        ]);
    }

    public function pdf(ExportFinancialReportRequest $request): HttpResponse
    {
        $filters = $this->filters($request);
        $generatedAt = now('Asia/Jakarta');
        $branding = $this->pdfBrandingService->branding();
        $report = $this->financialReportService->build($filters['date_from'], $filters['date_to']);

        $this->activityLogService->logFromRequest(
            request: $request,
            eventType: 'export',
            description: 'Mengunduh paket laporan keuangan PDF.',
            module: 'Keuangan',
            menuKey: 'finance_reports',
            properties: ['format' => 'pdf', 'filters' => $filters],
        );

        return $this->pdfRenderer->renderDownload(
            view: 'pdf.financial-report',
            data: [
                'filters' => $filters,
                'report' => $report,
                'branding' => $branding,
                'seo' => $this->pdfBrandingService->seo(),
                'locale' => 'id',
                'generatedAt' => $generatedAt,
                'generatedBy' => $request->user()?->name,
            ],
            filename: 'laporan-keuangan-'.$filters['date_from'].'-'.$filters['date_to'].'.pdf',
            mpdfConfig: ['orientation' => 'L', 'margin_top' => 18, 'margin_bottom' => 22],
            footerView: 'pdf.partials.footer',
            footerData: ['branding' => $branding],
        );
    }

    public function csv(ExportFinancialReportRequest $request): StreamedResponse
    {
        $filters = $this->filters($request);
        $type = (string) ($request->validated('report') ?? 'trial-balance');
        $report = $this->financialReportService->build($filters['date_from'], $filters['date_to']);
        $dataset = $this->financialExportService->reportDataset($type, $report, $filters);

        $this->activityLogService->logFromRequest(
            request: $request,
            eventType: 'export',
            description: 'Mengunduh '.$dataset['title'].' dalam CSV.',
            module: 'Keuangan',
            menuKey: 'finance_reports',
            properties: ['format' => 'csv', 'report' => $type, 'filters' => $filters],
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
        }, $type.'-'.$filters['date_from'].'-'.$filters['date_to'].'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function closePeriod(CloseFinancialPeriodRequest $request): RedirectResponse
    {
        try {
            $this->financialPeriodService->close($request->string('period_code')->value(), $request->string('reason')->value());
        } catch (DomainException $exception) {
            return back()->withErrors(['period' => $exception->getMessage()]);
        }

        return back()->with('success', 'Periode berhasil ditutup dan transaksi historis telah dikunci.');
    }

    public function reopenPeriod(ReopenFinancialPeriodRequest $request, FinancialPeriod $financialPeriod): RedirectResponse
    {
        try {
            $this->financialPeriodService->reopen($financialPeriod, $request->string('reason')->value());
        } catch (DomainException $exception) {
            return back()->withErrors(['period' => $exception->getMessage()]);
        }

        return back()->with('success', 'Periode berhasil dibuka kembali dan alasannya telah diaudit.');
    }

    public function reconcile(StoreBankReconciliationRequest $request): RedirectResponse
    {
        try {
            $reconciliation = $this->bankReconciliationService->reconcile($request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['reconciliation' => $exception->getMessage()]);
        }

        return back()->with('success', $reconciliation->status === 'matched'
            ? 'Rekonsiliasi cocok dengan saldo ledger.'
            : 'Rekonsiliasi tersimpan dengan selisih. Periksa mutasi yang belum tercatat.');
    }

    public function adjustment(StorePeriodAdjustmentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        try {
            $this->financialLedgerService->postTwoSidedJournal([
                ...$data,
                'transaction_type' => 'period_adjustment',
                'currency' => 'IDR',
                'exchange_rate' => 1,
                'amount_original' => $data['amount_idr'],
                'description' => 'Adjustment periode: '.$data['adjustment_reason'],
            ]);
        } catch (DomainException $exception) {
            return back()->withErrors(['adjustment' => $exception->getMessage()]);
        }

        return back()->with('success', 'Adjustment berhasil diposting pada periode terbuka.');
    }

    public function storeBudget(StoreFinancialBudgetRequest $request): RedirectResponse
    {
        $this->financialBudgetService->create($request->validated());

        return back()->with('success', 'Draft anggaran berhasil dibuat.');
    }

    public function updateBudget(UpdateFinancialBudgetRequest $request, FinancialBudget $financialBudget): RedirectResponse
    {
        try {
            $this->financialBudgetService->update($financialBudget, $request->validated());
        } catch (DomainException $exception) {
            return back()->withErrors(['budget' => $exception->getMessage()]);
        }

        return back()->with('success', 'Draft anggaran berhasil diperbarui.');
    }

    public function updateBudgetStatus(UpdateFinancialBudgetStatusRequest $request, FinancialBudget $financialBudget): RedirectResponse
    {
        try {
            $budget = $this->financialBudgetService->transition($financialBudget, $request->string('status')->value());
        } catch (DomainException $exception) {
            return back()->withErrors(['budget' => $exception->getMessage()]);
        }

        return back()->with('success', $budget->status === 'approved'
            ? 'Anggaran disetujui dan mulai dipantau terhadap realisasi ledger.'
            : 'Anggaran berhasil ditutup.');
    }

    /** @return array{date_from:string,date_to:string} */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        return [
            'date_from' => (string) ($validated['date_from'] ?? now()->startOfYear()->toDateString()),
            'date_to' => (string) ($validated['date_to'] ?? now()->toDateString()),
        ];
    }

    private function spreadsheetSafe(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        return preg_match('/^[=+\-@]/', ltrim($value)) === 1 ? "'".$value : $value;
    }
}
