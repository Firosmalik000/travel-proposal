<?php

namespace App\Console\Commands;

use App\Services\LegacyCashflowLedgerBackfillService;
use DomainException;
use Illuminate\Console\Command;

class BackfillLegacyCashflowsToLedger extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'finance:backfill-legacy-cashflows {--commit : Eksekusi backfill yang sudah dipreview}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Preview atau backfill idempotent cashflow lama ke akun legacy ledger';

    /**
     * Execute the console command.
     */
    public function handle(LegacyCashflowLedgerBackfillService $backfillService): int
    {
        $preview = $backfillService->preview();
        $this->table(
            ['Pemeriksaan', 'Jumlah'],
            [
                ['Cashflow eligible', $preview['eligible']],
                ['Sudah terimpor', $preview['already_imported']],
                ['Booking payment dikecualikan untuk Tahap 2', $preview['excluded_booking_payment']],
            ],
        );

        if (! $this->option('commit')) {
            $this->info('Mode preview: tidak ada data yang diubah. Gunakan --commit setelah hasil disetujui.');

            return self::SUCCESS;
        }

        try {
            $processed = $backfillService->execute();
        } catch (DomainException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->info("Backfill selesai: {$processed} cashflow diposting ke ledger.");

        return self::SUCCESS;
    }
}
