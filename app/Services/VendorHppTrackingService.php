<?php

namespace App\Services;

use App\Models\FinancialTransaction;
use App\Models\TravelPackage;
use App\Models\VendorBill;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class VendorHppTrackingService
{
    public function __construct(private readonly PackageActualHppService $actualHppService) {}

    /** @return array{summary:array<string,int>,trips:array<int,array<string,mixed>>} */
    public function build(): array
    {
        $packages = TravelPackage::query()
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->limit(50)
            ->get(['id', 'code', 'name', 'start_date', 'end_date', 'operational_status', 'content']);
        $packageIds = $packages->pluck('id');
        $bills = VendorBill::query()
            ->whereIn('package_id', $packageIds)
            ->where('status', '!=', 'void')
            ->with('serviceUsages:id,vendor_bill_id,amount_idr,usage_date')
            ->orderByDesc('bill_date')
            ->orderByDesc('id')
            ->get()
            ->groupBy('package_id');
        $operationalPayments = FinancialTransaction::query()
            ->whereIn('package_id', $packageIds)
            ->where('transaction_type', 'operating_expense')
            ->where('status', 'posted')
            ->get()
            ->groupBy('package_id');

        $trips = $packages->map(function (TravelPackage $package) use ($bills, $operationalPayments): array {
            $actualHpp = $this->actualHppService->calculateForPackage($package);
            $actualHppTotal = (int) ($actualHpp['grand_total'] ?? 0);
            /** @var Collection<int, VendorBill> $tripBills */
            $tripBills = $bills->get($package->id, collect());
            $tripOperationalPayments = $operationalPayments->get($package->id, collect());
            $operationalPaid = (int) $tripOperationalPayments->sum('amount_idr');

            return $this->serializeTripSummary(
                $package,
                $actualHppTotal,
                (int) ($actualHpp['customer_count'] ?? 0),
                $tripBills,
                $operationalPaid,
            );
        })->values();

        return [
            'summary' => [
                'trips' => $trips->count(),
                'registered_customers' => (int) $trips->sum('registered_customers'),
                'actual_hpp_idr' => (int) $trips->sum('actual_hpp_idr'),
                'billed_idr' => (int) $trips->sum('billed_idr'),
                'paid_idr' => (int) $trips->sum('paid_idr'),
                'vendor_paid_idr' => (int) $trips->sum('vendor_paid_idr'),
                'operational_paid_idr' => (int) $trips->sum('operational_paid_idr'),
                'vendor_payable_idr' => (int) $trips->sum('vendor_payable_idr'),
                'remaining_actual_hpp_idr' => (int) $trips->sum('remaining_actual_hpp_idr'),
                'recognized_hpp_idr' => (int) $trips->sum('recognized_hpp_idr'),
                'open_bills' => (int) $trips->sum('open_bills'),
                'overdue_bills' => (int) $trips->sum('overdue_bills'),
            ],
            'trips' => $trips->all(),
        ];
    }

    /** @return array<string, mixed> */
    public function buildForPackage(TravelPackage $package): array
    {
        $actualHpp = $this->actualHppService->calculateForPackage($package);
        $tripBills = VendorBill::query()
            ->where('package_id', $package->id)
            ->where('status', '!=', 'void')
            ->with([
                'vendor:id,name',
                'payments' => fn ($query) => $query
                    ->with('account:id,code,name,account_number')
                    ->latest('payment_date')
                    ->latest('id'),
                'serviceUsages:id,vendor_bill_id,amount_idr,usage_date',
            ])
            ->orderByDesc('bill_date')
            ->orderByDesc('id')
            ->get();
        $operationalPayments = FinancialTransaction::query()
            ->where('package_id', $package->id)
            ->where('transaction_type', 'operating_expense')
            ->where('status', 'posted')
            ->with(['lines.account:id,code,name,account_number,is_cash_account'])
            ->latest('transaction_date')
            ->latest('id')
            ->get();
        $summary = $this->serializeTripSummary(
            $package,
            (int) ($actualHpp['grand_total'] ?? 0),
            (int) ($actualHpp['customer_count'] ?? 0),
            $tripBills,
            (int) $operationalPayments->sum('amount_idr'),
        );

        return [
            ...$summary,
            'hpp_items' => collect($actualHpp['items'] ?? [])->map(fn (array $item): array => [
                'label' => (string) ($item['label'] ?? 'Komponen HPP'),
                'cost_type' => (string) ($item['cost_type'] ?? 'cost'),
                'calculation_basis' => (string) ($item['calculation_basis'] ?? 'collective'),
                'quantity' => (int) ($item['quantity'] ?? 0),
                'unit_price' => (int) ($item['unit_price'] ?? 0),
                'total_price' => (int) ($item['total_price'] ?? 0),
            ])->values()->all(),
            'operational_payments' => $operationalPayments->map(function (FinancialTransaction $transaction): array {
                $cashAccount = $transaction->lines
                    ->first(fn ($line): bool => (bool) $line->account?->is_cash_account)
                    ?->account;

                return [
                    'id' => $transaction->id,
                    'transaction_date' => $transaction->transaction_date?->toDateString(),
                    'amount_idr' => (int) $transaction->amount_idr,
                    'description' => $transaction->description,
                    'account_label' => $cashAccount
                        ? $cashAccount->code.' · '.$cashAccount->name
                        : 'Rekening tidak tersedia',
                ];
            })->values()->all(),
            'bills' => $tripBills->map(fn (VendorBill $bill): array => $this->serializeBill($bill))->values()->all(),
        ];
    }

    /**
     * @param  Collection<int, VendorBill>  $tripBills
     * @return array<string, mixed>
     */
    private function serializeTripSummary(
        TravelPackage $package,
        int $actualHppTotal,
        int $registeredCustomers,
        Collection $tripBills,
        int $operationalPaid,
    ): array {
        $billed = (int) $tripBills->sum('amount_idr');
        $vendorPaid = (int) $tripBills->sum('paid_amount_idr');
        $outstanding = (int) $tripBills->sum(fn (VendorBill $bill): int => $bill->remainingAmount());
        $recognizedHpp = (int) $tripBills->sum(fn (VendorBill $bill): int => (int) $bill->serviceUsages->sum('amount_idr'));
        $paid = $vendorPaid + $operationalPaid;

        return [
            'id' => $package->id,
            'code' => $package->code,
            'name' => (string) (data_get($package->name, 'id') ?? $package->code),
            'start_date' => $package->start_date?->toDateString(),
            'end_date' => $package->end_date?->toDateString(),
            'operational_status' => $package->operational_status,
            'registered_customers' => $registeredCustomers,
            'actual_hpp_idr' => $actualHppTotal,
            'billed_idr' => $billed,
            'paid_idr' => $paid,
            'vendor_paid_idr' => $vendorPaid,
            'operational_paid_idr' => $operationalPaid,
            'vendor_payable_idr' => $outstanding,
            'remaining_actual_hpp_idr' => max(0, $actualHppTotal - $paid),
            'recognized_hpp_idr' => $recognizedHpp,
            'unbilled_actual_hpp_idr' => max(0, $actualHppTotal - $billed),
            'bill_variance_idr' => $billed - $actualHppTotal,
            'payment_percentage' => $actualHppTotal > 0 ? min(100, round(($paid / $actualHppTotal) * 100, 1)) : 0,
            'open_bills' => $tripBills->whereIn('status', ['open', 'partially_paid'])->count(),
            'overdue_bills' => $tripBills->filter(fn (VendorBill $bill): bool => $this->isOverdue($bill))->count(),
        ];
    }

    /** @return array<string, mixed> */
    private function serializeBill(VendorBill $bill): array
    {
        return [
            'id' => $bill->id,
            'package_vendor_id' => $bill->package_vendor_id,
            'vendor_name' => $bill->vendor?->name ?? 'Vendor belum dipilih',
            'invoice_number' => $bill->vendor_invoice_number,
            'bill_date' => $bill->bill_date?->toDateString(),
            'due_date' => $bill->due_date?->toDateString(),
            'status' => $bill->status,
            'amount_idr' => (int) $bill->amount_idr,
            'paid_amount_idr' => (int) $bill->paid_amount_idr,
            'remaining_amount_idr' => $bill->remainingAmount(),
            'recognized_amount_idr' => (int) $bill->serviceUsages->sum('amount_idr'),
            'notes' => $bill->notes,
            'is_overdue' => $this->isOverdue($bill),
            'payments' => $bill->payments->map(fn ($payment): array => [
                'id' => $payment->id,
                'payment_date' => $payment->payment_date?->toDateString(),
                'amount_idr' => (int) $payment->amount_idr,
                'account_label' => $payment->account
                    ? $payment->account->code.' · '.$payment->account->name
                    : 'Rekening tidak tersedia',
                'notes' => $payment->notes,
            ])->values()->all(),
        ];
    }

    private function isOverdue(VendorBill $bill): bool
    {
        return $bill->remainingAmount() > 0
            && $bill->due_date !== null
            && CarbonImmutable::parse($bill->due_date)->isBefore(CarbonImmutable::today('Asia/Jakarta'));
    }
}
