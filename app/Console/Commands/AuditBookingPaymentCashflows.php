<?php

namespace App\Console\Commands;

use App\Services\BookingPaymentCashflowAuditService;
use Illuminate\Console\Command;

class AuditBookingPaymentCashflows extends Command
{
    protected $signature = 'finance:audit-booking-payment-cashflows {--json : Tampilkan hasil sebagai JSON}';

    protected $description = 'Audit read-only sinkronisasi Booking Payment, Cashflow, dan Ledger';

    public function handle(BookingPaymentCashflowAuditService $auditService): int
    {
        $summary = $auditService->summary();
        $currencies = $auditService->confirmedByCurrency();

        if ($this->option('json')) {
            $this->line((string) json_encode([
                'summary' => $summary,
                'confirmed_by_booking_currency' => $currencies,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } else {
            $labels = [
                'payments_total' => 'Seluruh payment (termasuk terhapus)',
                'confirmed_active' => 'Payment confirmed aktif',
                'confirmed_total_amount' => 'Total nominal confirmed',
                'confirmed_total_amount_idr' => 'Total confirmed dalam IDR',
                'confirmed_without_cashflow' => 'Confirmed tanpa cashflow',
                'linked_non_confirmed' => 'Non-confirmed dengan histori link cashflow',
                'duplicate_cashflow_links' => 'Link cashflow dipakai lebih dari sekali',
                'linked_missing_cashflow' => 'Link menuju cashflow yang hilang',
                'confirmed_cashflow_deleted' => 'Confirmed dengan cashflow terhapus',
                'non_confirmed_cashflow_active' => 'Non-confirmed dengan cashflow aktif',
                'linked_value_mismatches' => 'Mismatch tanggal/nominal/tipe/kategori',
                'reconciled_cashflow_total_amount' => 'Total cashflow confirmed yang cocok',
                'orphan_booking_cashflows' => 'Cashflow booking tanpa sumber payment',
                'confirmed_without_financial_account' => 'Confirmed tanpa rekening penerima',
                'confirmed_without_financial_snapshot' => 'Confirmed tanpa snapshot mata uang/kurs',
                'confirmed_without_posted_ledger' => 'Confirmed tanpa ledger aktif',
                'non_confirmed_with_posted_ledger' => 'Non-confirmed dengan ledger aktif',
                'multiple_posted_booking_ledgers' => 'Payment dengan lebih dari satu ledger aktif',
                'ledger_value_mismatches' => 'Mismatch tanggal/nominal/mata uang/kurs ledger',
                'reconciled_ledger_total_amount' => 'Total ledger booking aktif',
            ];

            $this->table(
                ['Pemeriksaan', 'Nilai'],
                collect($labels)
                    ->map(fn (string $label, string $key): array => [$label, number_format($summary[$key] ?? 0, 0, ',', '.')])
                    ->values()
                    ->all(),
            );

            $this->table(
                ['Mata uang booking', 'Jumlah payment confirmed', 'Total nominal asli'],
                collect($currencies)
                    ->map(fn (array $values, string $currency): array => [
                        $currency,
                        number_format($values['count'], 0, ',', '.'),
                        number_format($values['amount'], 0, ',', '.'),
                    ])
                    ->values()
                    ->all(),
            );
        }

        if ($auditService->hasInconsistencies($summary)) {
            $this->error('Audit menemukan ketidaksesuaian. Tidak ada data yang diubah.');

            return self::FAILURE;
        }

        $this->info('Booking Payment, Cashflow, dan Ledger konsisten. Tidak ada data yang diubah.');

        return self::SUCCESS;
    }
}
