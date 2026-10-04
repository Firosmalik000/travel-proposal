<?php

namespace App\Http\Controllers\Administrator;

use App\Http\Controllers\Controller;
use App\Services\FinancialReceivableService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FinancialReceivableController extends Controller
{
    public function __construct(private readonly FinancialReceivableService $financialReceivableService) {}

    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'package_id' => ['nullable', 'integer', 'exists:packages,id'],
            'payment_status' => ['nullable', Rule::in(['all', 'unpaid', 'partial', 'paid', 'overdue'])],
        ]);
        $filters = [
            'search' => trim((string) ($validated['search'] ?? '')),
            'package_id' => isset($validated['package_id']) ? (int) $validated['package_id'] : null,
            'payment_status' => (string) ($validated['payment_status'] ?? 'all'),
        ];
        $prefix = str_starts_with($request->path(), 'super-admin/') ? '/super-admin' : '/admin';

        return Inertia::render('Dashboard/FinancialManagement/Receivables/Index', [
            ...$this->financialReceivableService->build($filters, $prefix.'/booking-management/listing'),
            'filters' => [
                'search' => $filters['search'],
                'package_id' => $filters['package_id'] ? (string) $filters['package_id'] : '',
                'payment_status' => $filters['payment_status'],
            ],
        ]);
    }
}
