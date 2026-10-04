<?php

namespace App\Services;

use App\Models\FinancialAccount;
use App\Models\TravelPackage;
use App\Models\VendorAdvance;
use App\Models\VendorAdvanceAllocation;
use App\Models\VendorBill;
use App\Models\VendorBillPayment;
use App\Models\VendorServiceUsage;
use DomainException;
use Illuminate\Support\Facades\DB;

class VendorBillService
{
    public function __construct(private readonly FinancialLedgerService $ledger) {}

    /** @param array<string, mixed> $data */
    public function create(array $data): VendorBill
    {
        return DB::transaction(function () use ($data): VendorBill {
            TravelPackage::query()->lockForUpdate()->findOrFail((int) $data['package_id'])->ensureFinanciallyOpen();
            $hash = $this->hash($data);
            $existing = VendorBill::query()->where('idempotency_key', $data['idempotency_key'])->lockForUpdate()->first();
            if ($existing) {
                if (! hash_equals((string) $existing->payload_hash, $hash)) {
                    throw new DomainException('Kunci idempotensi sudah digunakan untuk tagihan vendor yang berbeda.');
                }

                return $existing;
            }

            $bill = VendorBill::query()->create([
                ...$data,
                'currency' => 'IDR', 'amount_original' => $data['amount_idr'], 'paid_amount_idr' => 0,
                'status' => 'open', 'payload_hash' => $hash,
            ]);
            $pending = FinancialAccount::query()->where('system_key', 'vendor_service_pending')->where('is_active', true)->first();
            $payable = FinancialAccount::query()->where('system_key', 'vendor_payable')->where('is_active', true)->first();
            if (! $pending || ! $payable) {
                throw new DomainException('Akun Layanan Vendor Belum Digunakan atau Hutang Vendor belum tersedia.');
            }

            $transaction = $this->ledger->post([
                'transaction_date' => $bill->bill_date->toDateString(), 'transaction_type' => 'vendor_bill',
                'source_type' => VendorBill::class, 'source_id' => $bill->id, 'package_id' => $bill->package_id,
                'currency' => 'IDR', 'exchange_rate' => 1, 'idempotency_key' => 'vendor-bill:'.$bill->id,
                'description' => $bill->notes,
            ], [
                ['financial_account_id' => $pending->id, 'entry_type' => 'debit', 'amount_original' => $bill->amount_idr, 'amount_idr' => $bill->amount_idr, 'description' => $bill->notes],
                ['financial_account_id' => $payable->id, 'entry_type' => 'credit', 'amount_original' => $bill->amount_idr, 'amount_idr' => $bill->amount_idr, 'description' => $bill->notes],
            ]);
            $bill->update(['posted_financial_transaction_id' => $transaction->id]);

            return $bill->fresh();
        });
    }

    /** @param array<string, mixed> $data */
    public function pay(VendorBill $bill, array $data): VendorBillPayment
    {
        return DB::transaction(function () use ($bill, $data): VendorBillPayment {
            $locked = VendorBill::query()->lockForUpdate()->findOrFail($bill->id);
            $locked->package()->lockForUpdate()->firstOrFail()->ensureFinanciallyOpen();
            $hash = $this->hash(['vendor_bill_id' => $locked->id, ...$data]);
            $existing = VendorBillPayment::query()->where('idempotency_key', $data['idempotency_key'])->lockForUpdate()->first();
            if ($existing) {
                if (! hash_equals((string) $existing->payload_hash, $hash)) {
                    throw new DomainException('Kunci idempotensi sudah digunakan untuk pembayaran vendor yang berbeda.');
                }

                return $existing;
            }
            $amount = (int) $data['amount_idr'];
            if ($locked->status === 'void' || $amount > $locked->remainingAmount()) {
                throw new DomainException('Nominal pembayaran melebihi sisa hutang vendor.');
            }
            $cash = FinancialAccount::query()->whereKey($data['financial_account_id'])->where('is_active', true)->where('is_cash_account', true)->first();
            $payable = FinancialAccount::query()->where('system_key', 'vendor_payable')->where('is_active', true)->first();
            if (! $cash || ! $payable || in_array($cash->cash_account_type, ['customer_funds', 'legacy'], true)) {
                throw new DomainException('Pembayaran vendor hanya boleh dari rekening operasional atau kas kecil.');
            }

            $payment = VendorBillPayment::query()->create([...$data, 'vendor_bill_id' => $locked->id, 'payload_hash' => $hash]);
            $transaction = $this->ledger->post([
                'transaction_date' => $data['payment_date'], 'transaction_type' => 'vendor_payment',
                'source_type' => VendorBillPayment::class, 'source_id' => $payment->id, 'currency' => 'IDR', 'exchange_rate' => 1,
                'idempotency_key' => 'vendor-payment:'.$payment->id, 'description' => $data['notes'],
            ], [
                ['financial_account_id' => $payable->id, 'entry_type' => 'debit', 'amount_original' => $amount, 'amount_idr' => $amount, 'description' => $data['notes']],
                ['financial_account_id' => $cash->id, 'entry_type' => 'credit', 'amount_original' => $amount, 'amount_idr' => $amount, 'description' => $data['notes']],
            ]);
            $payment->update(['financial_transaction_id' => $transaction->id]);
            $paid = (int) $locked->paid_amount_idr + $amount;
            $locked->update(['paid_amount_idr' => $paid, 'status' => $paid >= $locked->amount_idr ? 'paid' : 'partially_paid']);

            return $payment->fresh();
        });
    }

    /** @param array<string, mixed> $data */
    public function createAdvance(array $data): VendorAdvance
    {
        return DB::transaction(function () use ($data): VendorAdvance {
            $hash = $this->hash($data);
            $existing = VendorAdvance::query()->where('idempotency_key', $data['idempotency_key'])->lockForUpdate()->first();
            if ($existing) {
                if (! hash_equals((string) $existing->payload_hash, $hash)) {
                    throw new DomainException('Kunci idempotensi sudah digunakan untuk uang muka vendor yang berbeda.');
                }

                return $existing;
            }
            $cash = FinancialAccount::query()->whereKey($data['financial_account_id'])->where('is_active', true)->where('is_cash_account', true)->first();
            $advanceAccount = FinancialAccount::query()->where('system_key', 'vendor_advance')->where('is_active', true)->first();
            if (! $cash || ! $advanceAccount || in_array($cash->cash_account_type, ['customer_funds', 'legacy'], true)) {
                throw new DomainException('Uang muka vendor hanya boleh dibayar dari rekening operasional atau kas kecil.');
            }
            $advance = VendorAdvance::query()->create([...$data, 'currency' => 'IDR', 'applied_amount_idr' => 0, 'status' => 'open', 'payload_hash' => $hash]);
            $transaction = $this->ledger->post(['transaction_date' => $data['advance_date'], 'transaction_type' => 'vendor_advance_payment', 'source_type' => VendorAdvance::class, 'source_id' => $advance->id, 'currency' => 'IDR', 'exchange_rate' => 1, 'idempotency_key' => 'vendor-advance:'.$advance->id, 'description' => $data['notes']], [
                ['financial_account_id' => $advanceAccount->id, 'entry_type' => 'debit', 'amount_original' => $data['amount_idr'], 'amount_idr' => $data['amount_idr'], 'description' => $data['notes']],
                ['financial_account_id' => $cash->id, 'entry_type' => 'credit', 'amount_original' => $data['amount_idr'], 'amount_idr' => $data['amount_idr'], 'description' => $data['notes']],
            ]);
            $advance->update(['financial_transaction_id' => $transaction->id]);

            return $advance->fresh();
        });
    }

    /** @param array<string, mixed> $data */
    public function applyAdvance(VendorAdvance $advance, VendorBill $bill, array $data): VendorAdvanceAllocation
    {
        return DB::transaction(function () use ($advance, $bill, $data): VendorAdvanceAllocation {
            $lockedAdvance = VendorAdvance::query()->lockForUpdate()->findOrFail($advance->id);
            $lockedBill = VendorBill::query()->lockForUpdate()->findOrFail($bill->id);
            $lockedBill->package()->lockForUpdate()->firstOrFail()->ensureFinanciallyOpen();
            $hash = $this->hash(['vendor_advance_id' => $lockedAdvance->id, 'vendor_bill_id' => $lockedBill->id, ...$data]);
            $existing = VendorAdvanceAllocation::query()->where('idempotency_key', $data['idempotency_key'])->lockForUpdate()->first();
            if ($existing) {
                if (! hash_equals((string) $existing->payload_hash, $hash)) {
                    throw new DomainException('Kunci idempotensi sudah digunakan untuk alokasi uang muka yang berbeda.');
                }

                return $existing;
            }
            if ($lockedBill->status === 'void' || $lockedAdvance->status === 'void') {
                throw new DomainException('Tagihan atau uang muka vendor sudah void.');
            }
            $amount = (int) $data['amount_idr'];
            if ($amount > $lockedAdvance->remainingAmount() || $amount > $lockedBill->remainingAmount()) {
                throw new DomainException('Nominal alokasi melebihi sisa uang muka atau sisa tagihan.');
            }
            if (! $lockedAdvance->package_vendor_id || ! $lockedBill->package_vendor_id || (int) $lockedAdvance->package_vendor_id !== (int) $lockedBill->package_vendor_id) {
                throw new DomainException('Vendor uang muka dan tagihan harus sama.');
            }
            $payable = FinancialAccount::query()->where('system_key', 'vendor_payable')->where('is_active', true)->first();
            $advanceAccount = FinancialAccount::query()->where('system_key', 'vendor_advance')->where('is_active', true)->first();
            if (! $payable || ! $advanceAccount) {
                throw new DomainException('Akun Hutang Vendor atau Uang Muka Vendor belum tersedia.');
            }
            $allocation = VendorAdvanceAllocation::query()->create([...$data, 'vendor_advance_id' => $lockedAdvance->id, 'vendor_bill_id' => $lockedBill->id, 'payload_hash' => $hash]);
            $transaction = $this->ledger->post(['transaction_date' => $data['allocation_date'], 'transaction_type' => 'vendor_advance_application', 'source_type' => VendorAdvanceAllocation::class, 'source_id' => $allocation->id, 'currency' => 'IDR', 'exchange_rate' => 1, 'idempotency_key' => 'vendor-advance-application:'.$allocation->id, 'description' => $data['notes']], [
                ['financial_account_id' => $payable->id, 'entry_type' => 'debit', 'amount_original' => $amount, 'amount_idr' => $amount, 'description' => $data['notes']],
                ['financial_account_id' => $advanceAccount->id, 'entry_type' => 'credit', 'amount_original' => $amount, 'amount_idr' => $amount, 'description' => $data['notes']],
            ]);
            $allocation->update(['financial_transaction_id' => $transaction->id]);
            $applied = (int) $lockedAdvance->applied_amount_idr + $amount;
            $lockedAdvance->update(['applied_amount_idr' => $applied, 'status' => $applied >= $lockedAdvance->amount_idr ? 'applied' : 'partially_applied']);
            $paid = (int) $lockedBill->paid_amount_idr + $amount;
            $lockedBill->update(['paid_amount_idr' => $paid, 'status' => $paid >= $lockedBill->amount_idr ? 'paid' : 'partially_paid']);

            return $allocation->fresh();
        });
    }

    /** @param array<string, mixed> $data */
    public function recordServiceUse(VendorBill $bill, array $data): VendorServiceUsage
    {
        return DB::transaction(function () use ($bill, $data): VendorServiceUsage {
            $locked = VendorBill::query()->lockForUpdate()->findOrFail($bill->id);
            $locked->package()->lockForUpdate()->firstOrFail()->ensureFinanciallyOpen();
            $hash = $this->hash(['vendor_bill_id' => $locked->id, ...$data]);
            $existing = VendorServiceUsage::query()->where('idempotency_key', $data['idempotency_key'])->lockForUpdate()->first();
            if ($existing) {
                if (! hash_equals((string) $existing->payload_hash, $hash)) {
                    throw new DomainException('Kunci idempotensi sudah digunakan untuk pemakaian layanan berbeda.');
                }

                return $existing;
            }

            $recognized = (int) $locked->serviceUsages()->sum('amount_idr');
            $amount = (int) $data['amount_idr'];
            if ($locked->status === 'void' || ! $locked->package_id || $amount > (int) $locked->amount_idr - $recognized) {
                throw new DomainException('Nominal layanan melebihi sisa tagihan yang belum diakui atau tagihan tidak valid.');
            }

            $expense = FinancialAccount::query()->where('system_key', 'trip_cost')->where('is_active', true)->first();
            $pending = FinancialAccount::query()->where('system_key', 'vendor_service_pending')->where('is_active', true)->first();
            if (! $expense || ! $pending) {
                throw new DomainException('Akun HPP Trip atau Layanan Vendor Belum Digunakan belum tersedia.');
            }

            $usage = VendorServiceUsage::query()->create([
                ...$data, 'vendor_bill_id' => $locked->id, 'package_id' => $locked->package_id, 'payload_hash' => $hash,
            ]);
            $transaction = $this->ledger->post([
                'transaction_date' => $data['usage_date'], 'transaction_type' => 'vendor_service_use',
                'source_type' => VendorServiceUsage::class, 'source_id' => $usage->id, 'package_id' => $locked->package_id,
                'currency' => 'IDR', 'exchange_rate' => 1, 'idempotency_key' => 'vendor-service-use:'.$usage->id,
                'description' => $data['notes'],
            ], [
                ['financial_account_id' => $expense->id, 'entry_type' => 'debit', 'amount_original' => $amount, 'amount_idr' => $amount, 'description' => $data['notes']],
                ['financial_account_id' => $pending->id, 'entry_type' => 'credit', 'amount_original' => $amount, 'amount_idr' => $amount, 'description' => $data['notes']],
            ]);
            $usage->update(['financial_transaction_id' => $transaction->id]);

            return $usage->fresh();
        });
    }

    /** @param array<string, mixed> $data */
    private function hash(array $data): string
    {
        ksort($data);

        return hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
    }
}
