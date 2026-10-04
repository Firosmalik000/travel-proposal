<?php

namespace App\Services;

use App\Models\BookingPayment;
use App\Models\FinancialAccount;
use DomainException;
use Illuminate\Database\Eloquent\Builder;

class BookingPaymentLedgerBackfillService
{
    public function __construct(private readonly BookingPaymentService $bookingPaymentService) {}

    /** @return array{confirmed: int, already_posted: int, needs_review: int} */
    public function preview(): array
    {
        $confirmed = BookingPayment::query()->where('status', 'confirmed');
        $alreadyPosted = BookingPayment::query()
            ->where('status', 'confirmed')
            ->whereHas('financialTransactions', fn ($query) => $query
                ->where('transaction_type', 'booking_payment')
                ->where('status', 'posted'))
            ->count();

        return [
            'confirmed' => (clone $confirmed)->count(),
            'already_posted' => $alreadyPosted,
            'needs_review' => (clone $confirmed)->count() - $alreadyPosted,
        ];
    }

    public function execute(int $paymentId, int $financialAccountId): BookingPayment
    {
        $payment = BookingPayment::query()->findOrFail($paymentId);
        $receiverAccount = FinancialAccount::query()->findOrFail($financialAccountId);

        if (! $receiverAccount->is_active
            || ! $receiverAccount->is_cash_account
            || $receiverAccount->cash_account_type === 'legacy') {
            throw new DomainException('Rekening tujuan harus berupa akun kas/bank aktif yang sudah terklasifikasi.');
        }

        return $this->bookingPaymentService->reconcileLegacyPayment($payment, $receiverAccount);
    }

    /** @return Builder<BookingPayment> */
    public function reviewQuery()
    {
        return BookingPayment::query()
            ->with('booking:id,booking_code,full_name')
            ->where('status', 'confirmed')
            ->whereDoesntHave('financialTransactions', fn ($query) => $query
                ->where('transaction_type', 'booking_payment')
                ->where('status', 'posted'));
    }
}
