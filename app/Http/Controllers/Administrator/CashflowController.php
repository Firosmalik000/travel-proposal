<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Administrator\StoreCashflowRequest;
use App\Http\Requests\Administrator\UpdateCashflowRequest;
use App\Models\Cashflow;
use App\Services\CashflowService;
use App\Services\PdfBrandingService;
use App\Services\PdfRenderer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CashflowController extends Controller
{
    public function __construct(
        private readonly CashflowService $cashflowService,
        private readonly PdfRenderer $pdfRenderer,
        private readonly PdfBrandingService $pdfBrandingService,
    ) {}

    public function index(Request $request): Response
    {
        $dateStart = $request->string('date_start')->value();
        $dateEnd = $request->string('date_end')->value();
        $category = trim($request->string('category')->value());
        $type = $request->string('type')->value();

        if (! in_array($type, ['income', 'expense', 'all'], true)) {
            $type = 'all';
        }

        $cashflowQuery = $this->buildFilteredQuery($dateStart, $dateEnd, $category, $type, true);

        $cashflows = $cashflowQuery
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Cashflow $cashflow): array => [
                'id' => $cashflow->id,
                'transaction_date' => $cashflow->transaction_date?->toDateString(),
                'type' => $cashflow->type,
                'amount' => $cashflow->amount,
                'category' => $cashflow->category,
                'description' => $cashflow->description,
                'attachments' => $cashflow->attachments->map(fn ($attachment): array => [
                    'id' => $attachment->id,
                    'file_path' => $attachment->file_path,
                    'file_name' => $attachment->file_name,
                    'file_size' => $attachment->file_size,
                ])->values()->all(),
            ])
            ->values()
            ->all();

        $summary = [
            'total_income' => (int) (clone $cashflowQuery)->where('type', 'income')->sum('amount'),
            'total_expense' => (int) (clone $cashflowQuery)->where('type', 'expense')->sum('amount'),
        ];
        $summary['balance'] = $summary['total_income'] - $summary['total_expense'];

        $categories = Cashflow::query()
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->values()
            ->all();

        return Inertia::render('Dashboard/FinancialManagement/Cashflow/Index', [
            'cashflows' => $cashflows,
            'filters' => [
                'date_start' => $dateStart,
                'date_end' => $dateEnd,
                'category' => $category,
                'type' => $type,
            ],
            'summary' => $summary,
            'categories' => $categories,
        ]);
    }

    public function pdf(Request $request): HttpResponse
    {
        $dateStart = $request->string('date_start')->value();
        $dateEnd = $request->string('date_end')->value();
        $category = trim($request->string('category')->value());
        $type = $request->string('type')->value();

        if (! in_array($type, ['income', 'expense', 'all'], true)) {
            $type = 'all';
        }

        $cashflowQuery = $this->buildFilteredQuery($dateStart, $dateEnd, $category, $type, true);
        $cashflows = $cashflowQuery
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Cashflow $cashflow): array => [
                'date' => $cashflow->transaction_date?->toDateString(),
                'type' => $cashflow->type === 'income' ? 'debit' : 'credit',
                'amount' => $cashflow->amount,
                'category' => $cashflow->category,
                'description' => $cashflow->description ?? '-',
                'method' => 'Manual',
                'attachment_urls' => $cashflow->attachments
                    ->map(fn ($attachment): string => url($attachment->file_path))
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();

        $totalDebit = (int) (clone $cashflowQuery)->where('type', 'income')->sum('amount');
        $totalCredit = (int) (clone $cashflowQuery)->where('type', 'expense')->sum('amount');
        $netTotal = $totalDebit - $totalCredit;

        $generatedAt = now();
        $safeFilename = preg_replace('/[^A-Za-z0-9._-]+/', '-', sprintf(
            'cashflow-report-%s-%s.pdf',
            $type,
            $generatedAt->format('Ymd-His'),
        )) ?: 'cashflow-report.pdf';

        return $this->pdfRenderer->renderDownload(
            view: 'pdf.cashflow.main',
            data: [
                'cashflows' => $cashflows,
                'totalDebit' => $totalDebit,
                'totalCredit' => $totalCredit,
                'netTotal' => $netTotal,
                'typeCashflow' => strtoupper($type === 'all' ? 'SEMUA' : $type),
                'filters' => [
                    'startDate' => $dateStart !== '' ? $dateStart : null,
                    'endDate' => $dateEnd !== '' ? $dateEnd : null,
                    'typeFilter' => $type === 'all' ? 'all' : ($type === 'income' ? 'debit' : 'credit'),
                    'methodFilter' => 'all',
                    'categoryFilter' => $category !== '' ? $category : 'all',
                ],
            ],
            filename: $safeFilename,
            mpdfConfig: [
                'orientation' => 'P',
                'margin_top' => 34,
                'margin_bottom' => 22,
            ],
            headerView: 'pdf.cashflow.header',
            headerData: [
                'generatedAt' => $generatedAt,
                'branding' => $this->pdfBrandingService->branding(),
                'seo' => $this->pdfBrandingService->seo(),
            ],
            footerView: 'pdf.cashflow.footer',
            footerData: [
                'generatedAt' => $generatedAt,
            ],
        );
    }

    public function store(StoreCashflowRequest $request): RedirectResponse
    {
        $this->cashflowService->create(
            payload: [
                'transaction_date' => $request->date('transaction_date'),
                'type' => $request->string('type')->value(),
                'amount' => $request->integer('amount'),
                'category' => trim($request->string('category')->value()),
                'description' => $request->filled('description') ? trim($request->string('description')->value()) : null,
            ],
            attachments: $request->file('attachments', []),
        );

        return back()->with('success', 'Data cashflow berhasil ditambahkan.');
    }

    public function update(UpdateCashflowRequest $request, Cashflow $cashflow): RedirectResponse
    {
        try {
            $this->cashflowService->update(
                cashflow: $cashflow,
                payload: [
                    'transaction_date' => $request->date('transaction_date'),
                    'type' => $request->string('type')->value(),
                    'amount' => $request->integer('amount'),
                    'category' => trim($request->string('category')->value()),
                    'description' => $request->filled('description') ? trim($request->string('description')->value()) : null,
                ],
                newAttachments: $request->file('attachments', []),
                deletedAttachmentIds: collect($request->input('deleted_attachment_ids', []))
                    ->map(fn (mixed $id): int => (int) $id)
                    ->filter(fn (int $id): bool => $id > 0)
                    ->values()
                    ->all(),
            );
        } catch (RuntimeException $exception) {
            return back()->withErrors([
                'attachments' => $exception->getMessage(),
            ]);
        }

        return back()->with('success', 'Data cashflow berhasil diperbarui.');
    }

    public function destroy(Cashflow $cashflow): RedirectResponse
    {
        $this->cashflowService->delete($cashflow);

        return back()->with('success', 'Data cashflow berhasil dihapus.');
    }

    private function buildFilteredQuery(
        string $dateStart,
        string $dateEnd,
        string $category,
        string $type,
        bool $withAttachments = false,
    ) {
        $query = Cashflow::query();

        if ($withAttachments) {
            $query->with('attachments');
        }

        return $query
            ->when($dateStart !== '', fn ($builder) => $builder->whereDate('transaction_date', '>=', $dateStart))
            ->when($dateEnd !== '', fn ($builder) => $builder->whereDate('transaction_date', '<=', $dateEnd))
            ->when($category !== '', fn ($builder) => $builder->where('category', $category))
            ->when($type !== 'all', fn ($builder) => $builder->where('type', $type));
    }
}
