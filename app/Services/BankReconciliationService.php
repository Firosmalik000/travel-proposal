<?php

namespace App\Services;

use App\Models\BankReconciliation;
use App\Models\FinancialAccount;
use App\Models\FinancialTransactionLine;
use DomainException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BankReconciliationService
{
    /** @param array<string, mixed> $data */
    public function reconcile(array $data): BankReconciliation
    {
        $payload = [
            'financial_account_id' => (int) $data['financial_account_id'],
            'statement_date' => (string) $data['statement_date'],
            'statement_balance_idr' => (int) $data['statement_balance_idr'],
            'notes' => filled($data['notes'] ?? null) ? trim((string) $data['notes']) : null,
        ];
        $payloadHash = hash('sha256', (string) json_encode($payload, JSON_THROW_ON_ERROR));

        try {
            return DB::transaction(function () use ($data, $payload, $payloadHash): BankReconciliation {
                $existing = BankReconciliation::query()->where('idempotency_key', $data['idempotency_key'])->lockForUpdate()->first();
                if ($existing) {
                    if (! hash_equals($existing->payload_hash, $payloadHash)) {
                        throw new DomainException('Idempotency key rekonsiliasi sudah digunakan untuk data berbeda.');
                    }

                    return $existing->load(['account:id,code,name', 'reconciledBy:id,name']);
                }

                $account = FinancialAccount::query()->lockForUpdate()->findOrFail($payload['financial_account_id']);
                if (! $account->is_active || ! $account->is_cash_account) {
                    throw new DomainException('Rekonsiliasi hanya dapat dibuat untuk rekening kas/bank aktif.');
                }

                if (BankReconciliation::query()->where('financial_account_id', $account->id)->whereDate('statement_date', $payload['statement_date'])->exists()) {
                    throw new DomainException('Rekening ini sudah direkonsiliasi pada tanggal tersebut.');
                }

                $ledgerBalance = $this->balanceAt($account, $payload['statement_date']);
                $difference = $payload['statement_balance_idr'] - $ledgerBalance;

                return BankReconciliation::query()->create([
                    ...$payload,
                    'ledger_balance_idr' => $ledgerBalance,
                    'difference_idr' => $difference,
                    'status' => $difference === 0 ? 'matched' : 'difference',
                    'idempotency_key' => $data['idempotency_key'],
                    'payload_hash' => $payloadHash,
                    'reconciled_by' => Auth::id(),
                    'reconciled_at' => now(),
                ])->load(['account:id,code,name', 'reconciledBy:id,name']);
            });
        } catch (QueryException $exception) {
            $existing = BankReconciliation::query()->where('idempotency_key', $data['idempotency_key'])->first();
            if ($existing && hash_equals($existing->payload_hash, $payloadHash)) {
                return $existing;
            }

            throw $exception;
        }
    }

    public function balanceAt(FinancialAccount $account, string $date): int
    {
        $totals = FinancialTransactionLine::query()
            ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
            ->where('financial_transaction_lines.financial_account_id', $account->id)
            ->whereIn('financial_transactions.status', ['posted', 'reversed'])
            ->whereDate('financial_transactions.transaction_date', '<=', $date)
            ->selectRaw("COALESCE(SUM(CASE WHEN financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr ELSE 0 END), 0) as debit_total")
            ->selectRaw("COALESCE(SUM(CASE WHEN financial_transaction_lines.entry_type = 'credit' THEN financial_transaction_lines.amount_idr ELSE 0 END), 0) as credit_total")
            ->first();
        $debit = (int) ($totals?->debit_total ?? 0);
        $credit = (int) ($totals?->credit_total ?? 0);

        return $account->usesDebitNormalBalance() ? $debit - $credit : $credit - $debit;
    }
}
