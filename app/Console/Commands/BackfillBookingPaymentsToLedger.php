<?php

namespace App\Console\Commands;

use App\Services\BookingPaymentLedgerBackfillService;
use Illuminate\Console\Command;
use Throwable;

class BackfillBookingPaymentsToLedger extends Command
{
    protected $signature = 'finance:backfill-booking-payments
        {--payment= : ID Booking Payment yang sudah diperiksa}
        {--account= : ID rekening penerima yang sudah dikonfirmasi}
        {--commit : Jalankan rekonsiliasi satu payment}';

    protected $description = 'Preview atau rekonsiliasi Booking Payment lama ke ledger secara idempotent';

    public function handle(BookingPaymentLedgerBackfillService $backfillService): int
    {
        $preview = $backfillService->preview();
        $this->table(['Pemeriksaan', 'Jumlah'], [
            ['Payment confirmed', $preview['confirmed']],
            ['Sudah memiliki histori ledger', $preview['already_posted']],
            ['Perlu review rekening penerima', $preview['needs_review']],
        ]);

        $reviewRows = $backfillService->reviewQuery()
            ->orderBy('id')
            ->get()
            ->map(fn ($payment): array => [
                $payment->id,
                $payment->booking?->booking_code,
                $payment->booking?->full_name,
                $payment->payment_date?->toDateString(),
                $payment->amount,
            ])
            ->all();

        if ($reviewRows !== []) {
            $this->table(['Payment ID', 'Booking', 'Jemaah', 'Tanggal', 'Nominal'], $reviewRows);
        }

        if (! $this->option('commit')) {
            $this->info('Mode preview: tidak ada data yang diubah. Gunakan --commit bersama --payment dan --account setelah rekening dikonfirmasi.');

            return self::SUCCESS;
        }

        $paymentId = (int) $this->option('payment');
        $accountId = (int) $this->option('account');

        if ($paymentId < 1 || $accountId < 1) {
            $this->error('--payment dan --account wajib diisi pada mode commit.');

            return self::FAILURE;
        }

        try {
            $payment = $backfillService->execute($paymentId, $accountId);
        } catch (Throwable $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->info("Payment {$payment->id} berhasil direkonsiliasi tanpa menghapus histori.");

        return self::SUCCESS;
    }
}
