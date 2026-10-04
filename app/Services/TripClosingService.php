<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Models\InventoryStockMutation;
use App\Models\TravelPackage;
use App\Models\TripOperationalTransition;
use App\Models\VendorBill;
use DomainException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TripClosingService
{
    public function __construct(private readonly FinancialLedgerService $ledger) {}

    /** @return array{blockers: array<int, string>, revenue_amount_idr: int, registered_bookings: int, open_vendor_bills: int, pending_inventory: int} */
    public function assessment(TravelPackage $package): array
    {
        $bookings = Booking::query()
            ->where('package_id', $package->id)
            ->with(['payments.financialTransactions', 'agentCommission'])
            ->get();
        $blockers = [];
        $revenueAmountIdr = 0;
        $pendingPayments = 0;
        $unpaidBookings = 0;
        $cancelledWithFunds = 0;
        $unreconciledPayments = 0;
        $missingCommissions = 0;

        foreach ($bookings as $booking) {
            $confirmed = $booking->payments->where('status', 'confirmed');
            $netOriginal = 0;

            foreach ($confirmed as $payment) {
                $postedPayment = $payment->financialTransactions->first(fn (FinancialTransaction $transaction): bool => $transaction->transaction_type === 'booking_payment' && $transaction->status === 'posted');
                $refunds = $payment->financialTransactions->filter(fn (FinancialTransaction $transaction): bool => $transaction->transaction_type === 'customer_refund' && $transaction->status === 'posted');
                $netOriginal += (int) $payment->amount - (int) $refunds->sum('amount_original');
                $revenueAmountIdr += (int) ($postedPayment?->amount_idr ?? 0) - (int) $refunds->sum('amount_idr');

                if (! $postedPayment || ! $payment->financial_account_id || ! $payment->exchange_rate || ! $payment->amount_idr) {
                    $unreconciledPayments++;
                }
            }

            $pendingPayments += $booking->payments->where('status', 'pending')->count();
            if ($booking->status === 'cancelled' && $netOriginal > 0) {
                $cancelledWithFunds++;
            }
            if ($booking->status === 'registered') {
                $total = (int) ($booking->agreed_total_amount ?? $booking->custom_total_amount ?? 0);
                if ($total < 1 || $netOriginal !== $total) {
                    $unpaidBookings++;
                }
                if ($booking->agent_profile_id && ! $booking->agentCommission) {
                    $missingCommissions++;
                }
            }
        }

        $registeredBookings = $bookings->where('status', 'registered')->count();
        $openVendorBills = VendorBill::query()->where('package_id', $package->id)->whereIn('status', ['open', 'partially_paid'])->count();
        $unrecognizedVendorBills = VendorBill::query()->where('package_id', $package->id)
            ->whereRaw('amount_idr > (SELECT COALESCE(SUM(amount_idr), 0) FROM vendor_service_usages WHERE vendor_bill_id = vendor_bills.id)')->count();
        $pendingInventory = (int) InventoryStockMutation::query()
            ->join('bookings', 'bookings.id', '=', 'inventory_stock_mutations.booking_id')
            ->where('bookings.package_id', $package->id)
            ->sum('inventory_stock_mutations.reserved_quantity_change');

        if (! $package->end_date || $package->end_date->isFuture()) {
            $blockers[] = 'Tanggal kepulangan trip belum terlewati.';
        }
        if ($registeredBookings < 1) {
            $blockers[] = 'Trip belum memiliki booking berstatus terdaftar.';
        }
        if ($bookings->where('status', 'pending')->isNotEmpty()) {
            $blockers[] = 'Masih ada booking berstatus pending.';
        }
        if ($pendingPayments > 0) {
            $blockers[] = 'Masih ada pembayaran yang belum dikonfirmasi atau ditolak.';
        }
        if ($unpaidBookings > 0) {
            $blockers[] = "{$unpaidBookings} booking terdaftar belum lunas atau nilai kesepakatannya belum lengkap.";
        }
        if ($cancelledWithFunds > 0) {
            $blockers[] = "{$cancelledWithFunds} booking batal masih memiliki dana yang belum direfund.";
        }
        if ($unreconciledPayments > 0) {
            $blockers[] = "{$unreconciledPayments} pembayaran belum memiliki kurs, rekening, atau jurnal final.";
        }
        if ($openVendorBills > 0) {
            $blockers[] = "{$openVendorBills} tagihan vendor belum lunas.";
        }
        if ($unrecognizedVendorBills > 0) {
            $blockers[] = "{$unrecognizedVendorBills} tagihan vendor belum seluruhnya diakui sebagai layanan digunakan.";
        }
        if ($pendingInventory > 0) {
            $blockers[] = 'Inventory booking masih berstatus reservasi dan belum di-issued.';
        }
        if ($missingCommissions > 0) {
            $blockers[] = "{$missingCommissions} komisi booking agen belum dihitung.";
        }
        if ($revenueAmountIdr < 1) {
            $blockers[] = 'Tidak ada saldo Uang Muka Jemaah yang dapat diakui sebagai pendapatan.';
        }

        return [
            'blockers' => $blockers,
            'revenue_amount_idr' => $revenueAmountIdr,
            'registered_bookings' => $registeredBookings,
            'open_vendor_bills' => $openVendorBills,
            'pending_inventory' => max(0, $pendingInventory),
        ];
    }

    /** @param array<string, mixed> $data */
    public function transition(TravelPackage $package, array $data): TripOperationalTransition
    {
        return DB::transaction(function () use ($package, $data): TripOperationalTransition {
            $locked = TravelPackage::query()->lockForUpdate()->findOrFail($package->id);
            $hash = $this->hash(['package_id' => $locked->id, ...$data]);
            $existing = TripOperationalTransition::query()->where('idempotency_key', $data['idempotency_key'])->lockForUpdate()->first();
            if ($existing) {
                if (! hash_equals((string) $existing->payload_hash, $hash)) {
                    throw new DomainException('Kunci idempotensi sudah digunakan untuk perubahan status trip berbeda.');
                }

                return $existing;
            }

            $from = (string) ($locked->operational_status ?: 'planning');
            $to = (string) $data['to_status'];
            $expected = ['planning' => 'ready', 'ready' => 'departed', 'departed' => 'returned', 'returned' => 'financially_closed'][$from] ?? null;
            if ($to !== $expected) {
                throw new DomainException('Status trip harus diproses berurutan dan tidak dapat dilompati.');
            }
            if ($to === 'departed' && (! $locked->start_date || $data['occurred_date'] < $locked->start_date->toDateString())) {
                throw new DomainException('Trip belum dapat diberangkatkan sebelum tanggal keberangkatan.');
            }
            if ($to === 'returned' && (! $locked->end_date || $data['occurred_date'] < $locked->end_date->toDateString())) {
                throw new DomainException('Trip belum dapat dinyatakan kembali sebelum tanggal kepulangan.');
            }

            $assessment = $to === 'financially_closed' ? $this->assessment($locked) : null;
            if ($assessment && $assessment['blockers'] !== []) {
                throw new DomainException('Trip belum dapat ditutup: '.implode(' ', $assessment['blockers']));
            }

            $transition = TripOperationalTransition::query()->create([
                ...$data,
                'package_id' => $locked->id,
                'from_status' => $from,
                'revenue_amount_idr' => $assessment['revenue_amount_idr'] ?? 0,
                'checklist_snapshot' => $assessment,
                'payload_hash' => $hash,
                'approved_by' => $to === 'financially_closed' ? Auth::id() : null,
                'approved_at' => $to === 'financially_closed' ? now() : null,
            ]);

            if ($to === 'financially_closed') {
                $advance = FinancialAccount::query()->where('system_key', 'customer_advance')->where('is_active', true)->lockForUpdate()->first();
                $revenue = FinancialAccount::query()->where('system_key', 'trip_revenue')->where('is_active', true)->lockForUpdate()->first();
                if (! $advance || ! $revenue) {
                    throw new DomainException('Akun Uang Muka Jemaah atau Pendapatan Trip belum tersedia.');
                }
                $amount = (int) $assessment['revenue_amount_idr'];
                $transaction = $this->ledger->post([
                    'transaction_date' => $data['occurred_date'],
                    'transaction_type' => 'trip_revenue_recognition',
                    'source_type' => TripOperationalTransition::class,
                    'source_id' => $transition->id,
                    'package_id' => $locked->id,
                    'currency' => 'IDR',
                    'exchange_rate' => 1,
                    'idempotency_key' => 'trip-close:'.$transition->id,
                    'description' => 'Pengakuan pendapatan trip '.$locked->code,
                ], [
                    ['financial_account_id' => $advance->id, 'entry_type' => 'debit', 'amount_original' => $amount, 'amount_idr' => $amount, 'description' => 'Reklasifikasi uang muka jemaah'],
                    ['financial_account_id' => $revenue->id, 'entry_type' => 'credit', 'amount_original' => $amount, 'amount_idr' => $amount, 'description' => 'Pendapatan trip '.$locked->code],
                ]);
                $transition->update(['financial_transaction_id' => $transaction->id]);
            }

            $locked->forceFill(['operational_status' => $to])->save();

            return $transition->fresh();
        });
    }

    public function reverseClosure(TravelPackage $package, string $reason): TripOperationalTransition
    {
        return DB::transaction(function () use ($package, $reason): TripOperationalTransition {
            $locked = TravelPackage::query()->lockForUpdate()->findOrFail($package->id);
            if ($locked->operational_status !== 'financially_closed') {
                throw new DomainException('Hanya trip yang sudah ditutup finansial yang dapat direversal.');
            }
            $closure = TripOperationalTransition::query()->where('package_id', $locked->id)->where('to_status', 'financially_closed')->whereNull('reversed_at')->lockForUpdate()->latest('id')->firstOrFail();
            $transaction = FinancialTransaction::query()->findOrFail($closure->financial_transaction_id);
            $reversal = $this->ledger->reverse($transaction, $reason);
            $closure->update([
                'reversal_financial_transaction_id' => $reversal->id,
                'reversed_by' => Auth::id(),
                'reversed_at' => now(),
                'reversal_reason' => trim($reason),
            ]);
            $locked->forceFill(['operational_status' => 'returned'])->save();

            return $closure->fresh();
        });
    }

    /** @param array<string, mixed> $data */
    private function hash(array $data): string
    {
        ksort($data);

        return hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
    }
}
