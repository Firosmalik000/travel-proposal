<?php

namespace App\Console\Commands;

use App\Services\TripFinanceAuditService;
use Illuminate\Console\Command;

class AuditTripFinances extends Command
{
    protected $signature = 'finance:audit-trips {--json : Tampilkan hasil sebagai JSON}';

    protected $description = 'Audit read-only status penutupan trip dan jurnal pengakuan pendapatannya';

    public function handle(TripFinanceAuditService $audit): int
    {
        $summary = $audit->summary();
        if ($this->option('json')) {
            $this->line((string) json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } else {
            $this->table(['Pemeriksaan', 'Nilai'], collect($summary)->map(fn (int $value, string $key): array => [str_replace('_', ' ', ucfirst($key)), number_format($value, 0, ',', '.')])->values()->all());
        }
        if ($audit->hasInconsistencies($summary)) {
            $this->error('Audit trip menemukan ketidaksesuaian. Tidak ada data yang diubah.');

            return self::FAILURE;
        }
        $this->info('Status penutupan trip dan jurnal pendapatan konsisten.');

        return self::SUCCESS;
    }
}
