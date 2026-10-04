<?php

namespace App\Services;

use App\Models\BookingPayment;
use App\Models\FinancialAccount;
use App\Models\FinancialPeriod;
use App\Models\FinancialTransaction;
use App\Models\FinancialTransactionLine;
use App\Models\FinancialTransactionType;
use App\Models\TravelPackage;
use DomainException;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FinancialLedgerService
{
    public function __construct(private readonly FinancialPeriodService $financialPeriodService) {}

    /**
     * @param  array<string, mixed>  $transactionData
     * @param  array<int, array<string, mixed>>  $lines
     */
    public function post(array $transactionData, array $lines): FinancialTransaction
    {
        $normalizedLines = $this->normalizeAndValidateLines($lines);
        $normalizedTransaction = $this->normalizeTransaction($transactionData, $normalizedLines);
        $payloadHash = $this->payloadHash($normalizedTransaction, $normalizedLines);
        $existing = FinancialTransaction::query()
            ->where('idempotency_key', $normalizedTransaction['idempotency_key'])
            ->first();
        if ($existing) {
            return $this->resolveIdempotentRetry($existing, $payloadHash);
        }

        try {
            return DB::transaction(function () use ($normalizedTransaction, $normalizedLines, $payloadHash): FinancialTransaction {
                $existing = FinancialTransaction::query()
                    ->where('idempotency_key', $normalizedTransaction['idempotency_key'])
                    ->lockForUpdate()
                    ->first();

                if ($existing) {
                    return $this->resolveIdempotentRetry($existing, $payloadHash);
                }

                $this->financialPeriodService->lockForPosting((string) $normalizedTransaction['transaction_date']);

                $accounts = FinancialAccount::query()
                    ->whereIn('id', collect($normalizedLines)->pluck('financial_account_id'))
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($normalizedLines as $line) {
                    $account = $accounts->get($line['financial_account_id']);
                    if (! $account || ! $account->is_active) {
                        throw new DomainException('Seluruh akun jurnal harus tersedia dan aktif.');
                    }

                    if ($account->is_cash_account && strtoupper((string) $account->currency) !== $normalizedTransaction['currency']) {
                        throw new DomainException('Mata uang akun kas/bank harus sama dengan mata uang transaksi.');
                    }

                    if ((int) round((float) $line['amount_original'] * (float) $normalizedTransaction['exchange_rate']) !== $line['amount_idr']) {
                        throw new DomainException('Kurs dan nominal IDR pada setiap baris jurnal harus konsisten.');
                    }
                }

                if ($normalizedTransaction['currency'] === 'IDR'
                    && abs((float) $normalizedTransaction['exchange_rate'] - 1) > 0.00000001) {
                    throw new DomainException('Kurs transaksi IDR harus bernilai 1.');
                }

                if ($normalizedTransaction['transaction_type'] === 'transfer') {
                    $transferAccountsAreCash = collect($normalizedLines)
                        ->every(fn (array $line): bool => (bool) $accounts->get($line['financial_account_id'])?->is_cash_account);

                    if (! $transferAccountsAreCash) {
                        throw new DomainException('Transfer hanya dapat dilakukan antar-rekening kas/bank.');
                    }

                    $sourceLine = collect($normalizedLines)->firstWhere('entry_type', 'credit');
                    $sourceBalance = (int) FinancialTransactionLine::query()
                        ->join('financial_transactions', 'financial_transactions.id', '=', 'financial_transaction_lines.financial_transaction_id')
                        ->where('financial_transaction_lines.financial_account_id', $sourceLine['financial_account_id'])
                        ->whereIn('financial_transactions.status', ['posted', 'reversed'])
                        ->selectRaw("COALESCE(SUM(CASE WHEN financial_transaction_lines.entry_type = 'debit' THEN financial_transaction_lines.amount_idr ELSE -financial_transaction_lines.amount_idr END), 0) as balance_idr")
                        ->value('balance_idr');

                    if ($sourceBalance < (int) $sourceLine['amount_idr']) {
                        throw new DomainException('Saldo rekening sumber tidak mencukupi untuk transfer ini.');
                    }
                }

                $transaction = FinancialTransaction::query()->create([
                    ...$normalizedTransaction,
                    'transaction_number' => 'FT-'.now()->format('Ymd').'-'.Str::upper((string) Str::ulid()),
                    'status' => 'draft',
                    'payload_hash' => $payloadHash,
                ]);

                $transaction->lines()->createMany($normalizedLines);
                $transaction->update([
                    'status' => 'posted',
                    'posted_by' => Auth::id(),
                    'posted_at' => now(),
                ]);

                return $transaction->load(['lines.account', 'postedBy:id,name']);
            });
        } catch (QueryException $exception) {
            $existing = FinancialTransaction::query()
                ->where('idempotency_key', $normalizedTransaction['idempotency_key'])
                ->first();

            if ($existing) {
                return $this->resolveIdempotentRetry($existing, $payloadHash);
            }

            throw $exception;
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function postOpeningBalance(FinancialAccount $account, array $data): FinancialTransaction
    {
        if ($account->system_key === 'opening_balance_equity') {
            throw new DomainException('Akun kontra saldo awal tidak dapat diberi saldo awal.');
        }

        $idempotencyKey = 'opening_balance:'.$account->id;
        $existingOpeningBalance = FinancialTransaction::query()
            ->where('transaction_type', 'opening_balance')
            ->whereHas('lines', fn ($query) => $query->where('financial_account_id', $account->id))
            ->first();

        if ($existingOpeningBalance && $existingOpeningBalance->idempotency_key !== $idempotencyKey) {
            throw new DomainException('Saldo awal akun ini sudah pernah diposting. Gunakan jurnal koreksi.');
        }

        $offsetAccount = FinancialAccount::query()
            ->where('system_key', 'opening_balance_equity')
            ->where('is_active', true)
            ->first();

        if (! $offsetAccount) {
            throw new DomainException('Akun kontra Saldo Awal belum tersedia atau tidak aktif.');
        }

        $normalEntry = $account->usesDebitNormalBalance() ? 'debit' : 'credit';
        $offsetEntry = $normalEntry === 'debit' ? 'credit' : 'debit';

        return $this->post([
            'transaction_date' => $data['transaction_date'],
            'transaction_type' => 'opening_balance',
            'currency' => $data['currency'],
            'exchange_rate' => $data['exchange_rate'],
            'idempotency_key' => $idempotencyKey,
            'description' => $data['description'] ?? 'Saldo awal '.$account->name,
        ], [
            [
                'financial_account_id' => $account->id,
                'entry_type' => $normalEntry,
                'amount_original' => $data['amount_original'],
                'amount_idr' => $data['amount_idr'],
                'description' => 'Saldo awal '.$account->name,
            ],
            [
                'financial_account_id' => $offsetAccount->id,
                'entry_type' => $offsetEntry,
                'amount_original' => $data['amount_original'],
                'amount_idr' => $data['amount_idr'],
                'description' => 'Kontra saldo awal '.$account->name,
            ],
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function postTwoSidedJournal(array $data): FinancialTransaction
    {
        if ((int) $data['debit_account_id'] === (int) $data['credit_account_id']) {
            throw new DomainException('Akun debit dan kredit harus berbeda.');
        }

        return $this->post([
            'transaction_date' => $data['transaction_date'],
            'transaction_type' => $data['transaction_type'],
            'category_code' => $data['category_code'] ?? null,
            'currency' => $data['currency'],
            'exchange_rate' => $data['exchange_rate'],
            'idempotency_key' => $data['idempotency_key'],
            'description' => $data['description'],
            'adjustment_of_id' => $data['adjustment_of_id'] ?? null,
            'adjustment_reason' => $data['adjustment_reason'] ?? null,
        ], [
            [
                'financial_account_id' => (int) $data['debit_account_id'],
                'entry_type' => 'debit',
                'amount_original' => $data['amount_original'],
                'amount_idr' => $data['amount_idr'],
                'description' => $data['description'],
            ],
            [
                'financial_account_id' => (int) $data['credit_account_id'],
                'entry_type' => 'credit',
                'amount_original' => $data['amount_original'],
                'amount_idr' => $data['amount_idr'],
                'description' => $data['description'],
            ],
        ]);
    }

    /**
     * Post a classified cash movement whose accounting pair is controlled by the system.
     *
     * @param  array<string, mixed>  $data
     */
    public function postClassifiedCashTransaction(array $data): FinancialTransaction
    {
        return DB::transaction(function () use ($data): FinancialTransaction {
            $transactionType = (string) $data['transaction_type'];
            $packageId = filled($data['package_id'] ?? null) ? (int) $data['package_id'] : null;
            if ($transactionType === 'operating_expense' && $packageId !== null) {
                TravelPackage::query()->lockForUpdate()->findOrFail($packageId)->ensureFinanciallyOpen();
            }
            $cashAccount = FinancialAccount::query()
                ->lockForUpdate()
                ->findOrFail((int) $data['financial_account_id']);

            if (! $cashAccount->is_active || ! $cashAccount->is_cash_account) {
                throw new DomainException('Rekening transaksi harus berupa akun kas/bank yang aktif.');
            }

            if ($cashAccount->cash_account_type === 'legacy') {
                throw new DomainException('Rekening legacy tidak dapat digunakan untuk transaksi baru.');
            }

            $currency = Str::upper((string) $data['currency']);
            $exchangeRate = (float) $data['exchange_rate'];
            if (($currency === 'IDR' && abs($exchangeRate - 1) > 0.00000001)
                || (int) round((float) $data['amount_original'] * $exchangeRate) !== (int) $data['amount_idr']) {
                throw new DomainException('Kurs dan nominal IDR transaksi tidak sesuai.');
            }
            if ($cashAccount->currency !== $currency) {
                throw new DomainException('Mata uang transaksi harus sama dengan mata uang rekening kas/bank.');
            }

            $offsetSystemKey = match ($transactionType) {
                'capital_contribution' => 'owner_equity',
                'owner_withdrawal' => 'owner_withdrawal',
                'operating_expense' => 'operating_expense',
                'other_income' => 'other_income',
                'customer_refund' => 'customer_advance',
                default => throw new DomainException('Jenis transaksi kas terklasifikasi tidak valid.'),
            };

            if (! in_array($transactionType, ['customer_refund'], true) && $cashAccount->cash_account_type === 'customer_funds') {
                throw new DomainException('Rekening penampungan jemaah hanya dapat digunakan oleh alur booking dan refund terkait.');
            }

            $offsetAccount = FinancialAccount::query()
                ->where('system_key', $offsetSystemKey)
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (! $offsetAccount) {
                throw new DomainException('Akun pasangan transaksi belum tersedia atau tidak aktif.');
            }

            $sourceType = null;
            $sourceId = null;

            if ($transactionType === 'customer_refund') {
                $payment = BookingPayment::query()
                    ->withTrashed()
                    ->with('booking.package')
                    ->lockForUpdate()
                    ->findOrFail((int) ($data['booking_payment_id'] ?? 0));

                if ($payment->status !== 'confirmed') {
                    throw new DomainException('Refund hanya dapat dicatat untuk pembayaran yang berstatus confirmed.');
                }

                TravelPackage::query()->lockForUpdate()->find($payment->booking?->package_id)?->ensureFinanciallyOpen();

                if (! $payment->financialTransactions()
                    ->where('transaction_type', 'booking_payment')
                    ->where('status', 'posted')
                    ->exists()) {
                    throw new DomainException('Pembayaran asal harus direkonsiliasi ke ledger sebelum direfund.');
                }

                if ($payment->currency !== $currency) {
                    throw new DomainException('Mata uang refund harus sama dengan pembayaran asal.');
                }

                $alreadyRefunded = FinancialTransaction::query()
                    ->where('transaction_type', 'customer_refund')
                    ->where('status', 'posted')
                    ->where('source_type', BookingPayment::class)
                    ->where('source_id', $payment->id)
                    ->where('idempotency_key', '!=', $data['idempotency_key'])
                    ->sum('amount_original');

                if ((float) $alreadyRefunded + (float) $data['amount_original'] > (float) $payment->amount) {
                    throw new DomainException('Total refund tidak boleh melebihi nominal pembayaran asal.');
                }

                $sourceType = BookingPayment::class;
                $sourceId = $payment->id;
            }

            $cashEntry = in_array($transactionType, ['capital_contribution', 'other_income'], true) ? 'debit' : 'credit';
            $offsetEntry = $cashEntry === 'debit' ? 'credit' : 'debit';

            return $this->post([
                'transaction_date' => $data['transaction_date'],
                'transaction_type' => $transactionType,
                'currency' => $currency,
                'exchange_rate' => $data['exchange_rate'],
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'package_id' => $transactionType === 'customer_refund'
                    ? $payment->booking?->package_id
                    : ($transactionType === 'operating_expense' ? $packageId : null),
                'idempotency_key' => $data['idempotency_key'],
                'description' => $data['description'],
            ], [
                [
                    'financial_account_id' => $cashAccount->id,
                    'entry_type' => $cashEntry,
                    'amount_original' => $data['amount_original'],
                    'amount_idr' => $data['amount_idr'],
                    'description' => $data['description'],
                ],
                [
                    'financial_account_id' => $offsetAccount->id,
                    'entry_type' => $offsetEntry,
                    'amount_original' => $data['amount_original'],
                    'amount_idr' => $data['amount_idr'],
                    'description' => $data['description'],
                ],
            ]);
        });
    }

    public function reverse(FinancialTransaction $transaction, string $reason): FinancialTransaction
    {
        return DB::transaction(function () use ($transaction, $reason): FinancialTransaction {
            $lockedTransaction = FinancialTransaction::query()
                ->with('lines')
                ->lockForUpdate()
                ->findOrFail($transaction->id);

            if ($lockedTransaction->status === 'reversed') {
                return $lockedTransaction->reversal()->with(['lines.account', 'postedBy:id,name'])->firstOrFail();
            }

            if ($lockedTransaction->status !== 'posted' || $lockedTransaction->transaction_type === 'reversal') {
                throw new DomainException('Hanya transaksi posted yang belum dibalik yang dapat direversal.');
            }

            if ($this->financialPeriodService->isClosed($lockedTransaction->transaction_date->toDateString())) {
                throw new DomainException('Transaksi berasal dari periode tertutup. Gunakan adjustment pada periode yang masih terbuka.');
            }

            $reversal = $this->post([
                'transaction_date' => now()->toDateString(),
                'transaction_type' => 'reversal',
                'category_code' => $lockedTransaction->category_code,
                'currency' => $lockedTransaction->currency,
                'exchange_rate' => $lockedTransaction->exchange_rate,
                'source_type' => $lockedTransaction->source_type,
                'source_id' => $lockedTransaction->source_id,
                'package_id' => $lockedTransaction->package_id,
                'idempotency_key' => 'reversal:'.$lockedTransaction->id,
                'reversal_of_id' => $lockedTransaction->id,
                'description' => 'Reversal '.$lockedTransaction->transaction_number.': '.trim($reason),
            ], $lockedTransaction->lines->map(fn ($line): array => [
                'financial_account_id' => $line->financial_account_id,
                'entry_type' => $line->entry_type === 'debit' ? 'credit' : 'debit',
                'amount_original' => $line->amount_original,
                'amount_idr' => $line->amount_idr,
                'description' => 'Reversal: '.($line->description ?? $lockedTransaction->description),
            ])->all());

            FinancialTransaction::query()
                ->whereKey($lockedTransaction->id)
                ->update([
                    'status' => 'reversed',
                    'reversed_by' => Auth::id(),
                    'reversed_at' => now(),
                    'updated_at' => now(),
                ]);

            return $reversal;
        });
    }

    /**
     * @param  array<int, array<string, mixed>>  $lines
     * @return array<int, array{financial_account_id: int, entry_type: string, amount_original: string, amount_idr: int, description: ?string}>
     */
    private function normalizeAndValidateLines(array $lines): array
    {
        if (count($lines) < 2) {
            throw new DomainException('Transaksi keuangan wajib memiliki minimal dua baris.');
        }

        $normalized = collect($lines)->map(function (array $line): array {
            $entryType = (string) ($line['entry_type'] ?? '');
            $amountOriginal = number_format((float) ($line['amount_original'] ?? 0), 4, '.', '');
            $amountIdr = (int) ($line['amount_idr'] ?? 0);

            if (! in_array($entryType, ['debit', 'credit'], true) || (int) ($line['financial_account_id'] ?? 0) < 1) {
                throw new DomainException('Akun dan posisi debit/kredit setiap baris wajib valid.');
            }

            if ((float) $amountOriginal <= 0 || $amountIdr <= 0) {
                throw new DomainException('Nominal setiap baris transaksi harus lebih dari nol.');
            }

            return [
                'financial_account_id' => (int) $line['financial_account_id'],
                'entry_type' => $entryType,
                'amount_original' => $amountOriginal,
                'amount_idr' => $amountIdr,
                'description' => filled($line['description'] ?? null) ? trim((string) $line['description']) : null,
            ];
        })->all();

        $debit = collect($normalized)->where('entry_type', 'debit')->sum('amount_idr');
        $credit = collect($normalized)->where('entry_type', 'credit')->sum('amount_idr');

        if ($debit !== $credit) {
            throw new DomainException('Jurnal tidak seimbang: total debit harus sama dengan total kredit.');
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, array<string, mixed>>  $lines
     * @return array<string, mixed>
     */
    private function normalizeTransaction(array $data, array $lines): array
    {
        $transactionType = (string) ($data['transaction_type'] ?? '');
        if (! in_array($transactionType, ['opening_balance', 'manual_journal', 'transfer', 'legacy_unclassified', 'booking_payment', 'capital_contribution', 'owner_withdrawal', 'operating_expense', 'other_income', 'customer_refund', 'agent_commission', 'inventory_purchase', 'inventory_issue', 'vendor_bill', 'vendor_payment', 'vendor_advance_payment', 'vendor_advance_application', 'vendor_service_use', 'trip_revenue_recognition', 'period_adjustment', 'reversal'], true)) {
            throw new DomainException('Jenis transaksi keuangan tidak valid.');
        }

        $categoryCode = filled($data['category_code'] ?? null)
            ? trim((string) $data['category_code'])
            : FinancialTransactionType::defaultCodeFor($transactionType);
        $typeDefinition = FinancialTransactionType::query()->where('code', $categoryCode)->first();
        if (! $typeDefinition) {
            throw new DomainException('Jenis transaksi keuangan tidak valid.');
        }
        if (in_array($transactionType, ['transfer', 'manual_journal'], true)) {
            if (! $typeDefinition->is_active || $typeDefinition->applies_to !== $transactionType) {
                throw new DomainException('Jenis transaksi tidak sesuai dengan alur pencatatan.');
            }
        } elseif ($transactionType !== 'reversal'
            && $categoryCode !== FinancialTransactionType::defaultCodeFor($transactionType)) {
            throw new DomainException('Jenis transaksi sistem tidak sesuai dengan sumber pencatatan.');
        }

        $idempotencyKey = trim((string) ($data['idempotency_key'] ?? ''));
        if ($idempotencyKey === '') {
            throw new DomainException('Idempotency key wajib tersedia.');
        }

        $sourceType = filled($data['source_type'] ?? null) ? (string) $data['source_type'] : null;
        $sourceId = filled($data['source_id'] ?? null) ? (int) $data['source_id'] : null;
        if (($sourceType === null) !== ($sourceId === null)) {
            throw new DomainException('Source type dan source id harus tersedia bersamaan.');
        }

        $reversalOfId = filled($data['reversal_of_id'] ?? null) ? (int) $data['reversal_of_id'] : null;
        if (($transactionType === 'reversal') !== ($reversalOfId !== null)) {
            throw new DomainException('Relasi transaksi reversal tidak valid.');
        }

        $adjustmentOfId = filled($data['adjustment_of_id'] ?? null) ? (int) $data['adjustment_of_id'] : null;
        $adjustmentReason = filled($data['adjustment_reason'] ?? null) ? trim((string) $data['adjustment_reason']) : null;
        if (($transactionType === 'period_adjustment') !== ($adjustmentOfId !== null && $adjustmentReason !== null)) {
            throw new DomainException('Adjustment periode wajib memiliki transaksi asal dan alasan.');
        }
        if ($transactionType === 'period_adjustment') {
            $source = FinancialTransaction::query()->find($adjustmentOfId);
            if (! $source || ! $source->transaction_date || ! FinancialPeriod::query()
                ->where('status', 'closed')
                ->whereDate('start_date', '<=', $source->transaction_date->toDateString())
                ->whereDate('end_date', '>=', $source->transaction_date->toDateString())
                ->exists()) {
                throw new DomainException('Transaksi asal adjustment harus berasal dari periode yang sudah ditutup.');
            }
        }

        return [
            'transaction_date' => $data['transaction_date'],
            'transaction_type' => $transactionType,
            'category_code' => $categoryCode,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'package_id' => filled($data['package_id'] ?? null) ? (int) $data['package_id'] : null,
            'currency' => Str::upper((string) ($data['currency'] ?? 'IDR')),
            'exchange_rate' => number_format((float) ($data['exchange_rate'] ?? 1), 8, '.', ''),
            'amount_original' => number_format((float) collect($lines)->where('entry_type', 'debit')->sum('amount_original'), 4, '.', ''),
            'amount_idr' => (int) collect($lines)->where('entry_type', 'debit')->sum('amount_idr'),
            'idempotency_key' => $idempotencyKey,
            'reversal_of_id' => $reversalOfId,
            'adjustment_of_id' => $adjustmentOfId,
            'adjustment_reason' => $adjustmentReason,
            'description' => filled($data['description'] ?? null) ? trim((string) $data['description']) : null,
        ];
    }

    /**
     * @param  array<string, mixed>  $transaction
     * @param  array<int, array<string, mixed>>  $lines
     */
    private function payloadHash(array $transaction, array $lines): string
    {
        return hash('sha256', (string) json_encode([
            'transaction' => $transaction,
            'lines' => $lines,
        ], JSON_THROW_ON_ERROR));
    }

    private function resolveIdempotentRetry(FinancialTransaction $existing, string $payloadHash): FinancialTransaction
    {
        if (! hash_equals($existing->payload_hash, $payloadHash)) {
            throw new DomainException('Idempotency key sudah digunakan untuk payload transaksi yang berbeda.');
        }

        return $existing->load(['lines.account', 'postedBy:id,name']);
    }
}
