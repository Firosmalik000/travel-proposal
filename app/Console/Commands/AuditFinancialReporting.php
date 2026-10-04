<?php

namespace App\Console\Commands;

use App\Services\FinancialReportingAuditService;
use Illuminate\Console\Command;

class AuditFinancialReporting extends Command
{
    protected $signature = 'finance:audit-reporting {--json : Tampilkan hasil sebagai JSON}';

    protected $description = 'Audit read-only konsistensi laporan, rekonsiliasi, adjustment, dan periode keuangan';

    public function handle(FinancialReportingAuditService $auditService): int
    {
        $summary = $auditService->summary();

        if ($this->option('json')) {
            $this->line((string) json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } else {
            $this->table(['Pemeriksaan', 'Nilai'], collect($summary)->map(fn (int $value, string $key): array => [str_replace('_', ' ', ucfirst($key)), number_format($value, 0, ',', '.')])->values()->all());
        }

        if ($auditService->hasInconsistencies($summary)) {
            $this->error('Audit laporan menemukan ketidaksesuaian. Tidak ada data yang diubah.');

            return self::FAILURE;
        }

        $this->info('Laporan, rekonsiliasi, dan kontrol periode konsisten. Tidak ada data yang diubah.');

        return self::SUCCESS;
    }
}
