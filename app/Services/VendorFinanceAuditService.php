<?php

namespace App\Services;

use App\Models\VendorAdvance;
use App\Models\VendorAdvanceAllocation;
use App\Models\VendorBill;
use App\Models\VendorBillPayment;
use App\Models\VendorServiceUsage;

class VendorFinanceAuditService
{
    /** @return array<string, int> */
    public function summary(): array
    {
        $billPaymentTotals = VendorBillPayment::query()->selectRaw('vendor_bill_id, SUM(amount_idr) total')->groupBy('vendor_bill_id')->pluck('total', 'vendor_bill_id');
        $allocationBillTotals = VendorAdvanceAllocation::query()->selectRaw('vendor_bill_id, SUM(amount_idr) total')->groupBy('vendor_bill_id')->pluck('total', 'vendor_bill_id');
        $advanceTotals = VendorAdvanceAllocation::query()->selectRaw('vendor_advance_id, SUM(amount_idr) total')->groupBy('vendor_advance_id')->pluck('total', 'vendor_advance_id');
        $serviceTotals = VendorServiceUsage::query()->selectRaw('vendor_bill_id, SUM(amount_idr) total')->groupBy('vendor_bill_id')->pluck('total', 'vendor_bill_id');
        $billMismatch = VendorBill::query()->get()->filter(fn (VendorBill $bill): bool => (int) $bill->paid_amount_idr !== (int) ($billPaymentTotals->get($bill->id, 0) + $allocationBillTotals->get($bill->id, 0)))->count();
        $advanceMismatch = VendorAdvance::query()->get()->filter(fn (VendorAdvance $advance): bool => (int) $advance->applied_amount_idr !== (int) $advanceTotals->get($advance->id, 0))->count();
        $overAllocatedBills = VendorBill::query()->get()->filter(fn (VendorBill $bill): bool => (int) $bill->paid_amount_idr > (int) $bill->amount_idr)->count();
        $overAllocatedAdvances = VendorAdvance::query()->get()->filter(fn (VendorAdvance $advance): bool => (int) $advance->applied_amount_idr > (int) $advance->amount_idr)->count();
        $overRecognizedBills = VendorBill::query()->get()->filter(fn (VendorBill $bill): bool => (int) $serviceTotals->get($bill->id, 0) > (int) $bill->amount_idr)->count();
        $crossVendorAllocations = VendorAdvanceAllocation::query()->whereHas('bill')->with(['bill:id,package_vendor_id', 'advance:id,package_vendor_id'])->get()->filter(fn (VendorAdvanceAllocation $allocation): bool => ! $allocation->bill?->package_vendor_id || ! $allocation->advance?->package_vendor_id || (int) $allocation->bill->package_vendor_id !== (int) $allocation->advance->package_vendor_id)->count();

        return [
            'bills_total' => VendorBill::query()->count(),
            'bills_open' => VendorBill::query()->whereIn('status', ['open', 'partially_paid'])->count(),
            'bills_amount_idr' => (int) VendorBill::query()->sum('amount_idr'),
            'bills_paid_idr' => (int) VendorBill::query()->sum('paid_amount_idr'),
            'payments_total' => VendorBillPayment::query()->count(),
            'payments_amount_idr' => (int) VendorBillPayment::query()->sum('amount_idr'),
            'advances_total' => VendorAdvance::query()->count(),
            'advances_amount_idr' => (int) VendorAdvance::query()->sum('amount_idr'),
            'advances_applied_idr' => (int) VendorAdvance::query()->sum('applied_amount_idr'),
            'bill_amount_mismatches' => $billMismatch,
            'advance_amount_mismatches' => $advanceMismatch,
            'over_allocated_bills' => $overAllocatedBills,
            'over_allocated_advances' => $overAllocatedAdvances,
            'service_usages_total' => VendorServiceUsage::query()->count(),
            'service_cost_recognized_idr' => (int) VendorServiceUsage::query()->sum('amount_idr'),
            'over_recognized_bills' => $overRecognizedBills,
            'cross_vendor_allocations' => $crossVendorAllocations,
            'missing_bill_transactions' => VendorBill::query()->whereNull('posted_financial_transaction_id')->count(),
            'missing_service_transactions' => VendorServiceUsage::query()->whereNull('financial_transaction_id')->count(),
        ];
    }

    /** @param array<string, int> $summary */
    public function hasInconsistencies(array $summary): bool
    {
        return collect($summary)->only(['bill_amount_mismatches', 'advance_amount_mismatches', 'over_allocated_bills', 'over_allocated_advances', 'over_recognized_bills', 'cross_vendor_allocations', 'missing_bill_transactions', 'missing_service_transactions'])->contains(fn (int $value): bool => $value > 0);
    }
}
