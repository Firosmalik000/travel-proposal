<?php

namespace App\Services;

use App\Models\AgentCommission;
use App\Models\FinancialAccount;
use App\Models\TravelPackage;
use DomainException;
use Illuminate\Support\Facades\DB;

class AgentCommissionLedgerService
{
    public function __construct(private readonly FinancialLedgerService $financialLedgerService) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateStatus(AgentCommission $commission, array $data): AgentCommission
    {
        return DB::transaction(function () use ($commission, $data): AgentCommission {
            $locked = AgentCommission::query()
                ->with('booking.package')
                ->lockForUpdate()
                ->findOrFail($commission->id);
            TravelPackage::query()->lockForUpdate()->find($locked->package_id)?->ensureFinanciallyOpen();
            $status = (string) $data['status'];
            $allowedTransitions = [
                'pending' => ['pending', 'approved', 'cancelled'],
                'approved' => ['approved', 'pending', 'paid', 'cancelled'],
                'paid' => ['paid'],
                'cancelled' => ['cancelled', 'pending'],
            ];

            if (! in_array($status, $allowedTransitions[$locked->status] ?? [], true)) {
                throw new DomainException('Perubahan status komisi tidak valid. Komisi paid bersifat final dan pending harus disetujui sebelum dibayar.');
            }

            if ($locked->booking?->status === 'cancelled' && $status !== 'cancelled') {
                throw new DomainException('Komisi booking yang dibatalkan tidak dapat diaktifkan kembali.');
            }

            $updates = [
                'status' => $status,
                'notes' => filled($data['notes'] ?? null) ? trim((string) $data['notes']) : null,
                'approved_at' => in_array($status, ['approved', 'paid'], true) ? ($locked->approved_at ?? now()) : null,
                'paid_at' => $status === 'paid' ? ($locked->paid_at ?? now()) : null,
            ];

            if ($status === 'paid' && $locked->status !== 'paid') {
                $cashAccount = FinancialAccount::query()
                    ->lockForUpdate()
                    ->findOrFail((int) $data['financial_account_id']);

                if (! $cashAccount->is_active || ! $cashAccount->is_cash_account || in_array($cashAccount->cash_account_type, ['customer_funds', 'legacy'], true)) {
                    throw new DomainException('Komisi hanya dapat dibayar dari rekening operasional atau kas kecil yang aktif.');
                }

                if ($cashAccount->currency !== $locked->currency) {
                    throw new DomainException('Mata uang rekening pembayaran harus sama dengan mata uang komisi.');
                }

                if (($locked->currency === 'IDR' && abs((float) $data['exchange_rate'] - 1) > 0.00000001)
                    || (int) round($locked->commission_amount * (float) $data['exchange_rate']) !== (int) $data['amount_idr']) {
                    throw new DomainException('Kurs dan nominal IDR komisi tidak sesuai.');
                }

                $expenseAccount = FinancialAccount::query()
                    ->where('system_key', 'agent_commission')
                    ->where('is_active', true)
                    ->lockForUpdate()
                    ->first();

                if (! $expenseAccount) {
                    throw new DomainException('Akun biaya Komisi Agen belum tersedia atau tidak aktif.');
                }

                $this->financialLedgerService->post([
                    'transaction_date' => $data['payment_date'],
                    'transaction_type' => 'agent_commission',
                    'source_type' => AgentCommission::class,
                    'source_id' => $locked->id,
                    'package_id' => $locked->package_id,
                    'currency' => $locked->currency,
                    'exchange_rate' => $data['exchange_rate'],
                    'idempotency_key' => 'agent_commission:'.$locked->id.':paid:'.($locked->financialTransactions()->where('transaction_type', 'agent_commission')->count() + 1),
                    'description' => 'Pembayaran komisi booking '.$locked->booking_id,
                ], [
                    [
                        'financial_account_id' => $expenseAccount->id,
                        'entry_type' => 'debit',
                        'amount_original' => $locked->commission_amount,
                        'amount_idr' => $data['amount_idr'],
                        'description' => 'Biaya komisi agen',
                    ],
                    [
                        'financial_account_id' => $cashAccount->id,
                        'entry_type' => 'credit',
                        'amount_original' => $locked->commission_amount,
                        'amount_idr' => $data['amount_idr'],
                        'description' => 'Pembayaran komisi agen',
                    ],
                ]);

                $updates += [
                    'financial_account_id' => $cashAccount->id,
                    'payment_date' => $data['payment_date'],
                    'exchange_rate' => $data['exchange_rate'],
                    'amount_idr' => $data['amount_idr'],
                ];
            }

            $locked->update($updates);

            return $locked->refresh();
        });
    }

    public function reversePayment(AgentCommission $commission, string $reason): AgentCommission
    {
        return DB::transaction(function () use ($commission, $reason): AgentCommission {
            $locked = AgentCommission::query()->lockForUpdate()->findOrFail($commission->id);
            TravelPackage::query()->lockForUpdate()->find($locked->package_id)?->ensureFinanciallyOpen();

            if ($locked->status !== 'paid') {
                throw new DomainException('Hanya komisi paid yang dapat dikoreksi.');
            }

            $transaction = $locked->financialTransactions()
                ->where('transaction_type', 'agent_commission')
                ->where('status', 'posted')
                ->lockForUpdate()
                ->latest('id')
                ->first();

            if (! $transaction) {
                throw new DomainException('Jurnal pembayaran komisi aktif tidak ditemukan.');
            }

            $this->financialLedgerService->reverse($transaction, $reason);
            $locked->update([
                'status' => 'approved',
                'paid_at' => null,
                'financial_account_id' => null,
                'payment_date' => null,
                'exchange_rate' => null,
                'amount_idr' => null,
            ]);

            return $locked->refresh();
        });
    }
}
