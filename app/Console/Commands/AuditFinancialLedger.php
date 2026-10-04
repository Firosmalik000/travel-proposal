<?php

namespace App\Console\Commands;

use App\Services\FinancialLedgerAuditService;
use Illuminate\Console\Command;

class AuditFinancialLedger extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'finance:audit-ledger {--json : Tampilkan hasil sebagai JSON}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Audit read-only integritas debit-kredit, reversal, dan kategori ledger';

    /**
     * Execute the console command.
     */
    public function handle(FinancialLedgerAuditService $auditService): int
    {
        $summary = $auditService->summary();

        if ($this->option('json')) {
            $this->line((string) json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } else {
            $this->table(
                ['Pemeriksaan', 'Nilai'],
                collect($summary)
                    ->map(fn (int $value, string $key): array => [
                        str_replace('_', ' ', ucfirst($key)),
                        number_format($value, 0, ',', '.'),
                    ])
                    ->values()
                    ->all(),
            );
        }

        if ($auditService->hasInconsistencies($summary)) {
            $this->error('Audit ledger menemukan ketidaksesuaian. Tidak ada data yang diubah.');

            return self::FAILURE;
        }

        $this->info('Ledger seimbang dan konsisten. Tidak ada data yang diubah.');

        return self::SUCCESS;
    }
}
