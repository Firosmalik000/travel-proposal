<?php

namespace App\Services;

use App\Models\Cashflow;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use DomainException;

class LegacyCashflowLedgerBackfillService
{
    public function __construct(private readonly FinancialLedgerService $financialLedgerService) {}

    /**
     * @return array{eligible: int, already_imported: int, excluded_booking_payment: int}
     */
    public function preview(): array
    {
        return [
            'eligible' => $this->eligibleQuery()->count(),
            'already_imported' => FinancialTransaction::query()
                ->where('source_type', Cashflow::class)
                ->count(),
            'excluded_booking_payment' => Cashflow::query()
                ->where('category', 'booking_payment')
                ->count(),
        ];
    }

    public function execute(): int
    {
        $legacyCash = FinancialAccount::query()->where('system_key', 'legacy_cash')->first();
        $legacyUnclassified = FinancialAccount::query()->where('system_key', 'legacy_unclassified')->first();

        if (! $legacyCash || ! $legacyUnclassified) {
            throw new DomainException('Akun legacy bawaan belum tersedia.');
        }

        $processed = 0;
        $this->eligibleQuery()->orderBy('id')->chunkById(100, function ($cashflows) use ($legacyCash, $legacyUnclassified, &$processed): void {
            foreach ($cashflows as $cashflow) {
                $isIncome = $cashflow->type === 'income';
                $isOperatingExpense = ! $isIncome && in_array(
                    str($cashflow->category)->lower()->squish()->value(),
                    ['operasional', 'biaya operasional', 'operating expense', 'operating_expense'],
                    true,
                );
                $offsetAccount = $isOperatingExpense
                    ? FinancialAccount::query()->where('system_key', 'operating_expense')->where('is_active', true)->first()
                    : $legacyUnclassified;

                if (! $offsetAccount) {
                    throw new DomainException('Akun Biaya Operasional belum tersedia atau tidak aktif.');
                }

                $this->financialLedgerService->post([
                    'transaction_date' => $cashflow->transaction_date,
                    'transaction_type' => $isOperatingExpense ? 'operating_expense' : 'legacy_unclassified',
                    'source_type' => Cashflow::class,
                    'source_id' => $cashflow->id,
                    'currency' => 'IDR',
                    'exchange_rate' => 1,
                    'idempotency_key' => 'legacy_cashflow:'.$cashflow->id,
                    'description' => 'Backfill cashflow lama: '.($cashflow->description ?? $cashflow->category),
                ], [
                    [
                        'financial_account_id' => $isIncome ? $legacyCash->id : $offsetAccount->id,
                        'entry_type' => 'debit',
                        'amount_original' => $cashflow->amount,
                        'amount_idr' => $cashflow->amount,
                        'description' => $cashflow->category,
                    ],
                    [
                        'financial_account_id' => $isIncome ? $offsetAccount->id : $legacyCash->id,
                        'entry_type' => 'credit',
                        'amount_original' => $cashflow->amount,
                        'amount_idr' => $cashflow->amount,
                        'description' => $cashflow->category,
                    ],
                ]);
                $processed++;
            }
        });

        return $processed;
    }

    private function eligibleQuery()
    {
        return Cashflow::query()
            ->where('category', '!=', 'booking_payment')
            ->whereNotExists(function ($query): void {
                $query->selectRaw('1')
                    ->from('financial_transactions')
                    ->where('source_type', Cashflow::class)
                    ->whereColumn('source_id', 'cashflows.id');
            });
    }
}
