<?php

namespace App\Console\Commands;

use App\Services\VendorFinanceAuditService;
use Illuminate\Console\Command;

class AuditVendorFinances extends Command
{
    protected $signature = 'finance:audit-vendors {--json : Tampilkan hasil sebagai JSON}';

    protected $description = 'Audit read-only tagihan, pembayaran, uang muka, alokasi, dan penggunaan layanan vendor';

    public function handle(VendorFinanceAuditService $audit): int
    {
        $summary = $audit->summary();
        if ($this->option('json')) {
            $this->line((string) json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } else {
            $this->table(['Pemeriksaan', 'Nilai'], collect($summary)->map(fn (int $value, string $key): array => [str_replace('_', ' ', ucfirst($key)), number_format($value, 0, ',', '.')])->values()->all());
        }
        if ($audit->hasInconsistencies($summary)) {
            $this->error('Audit vendor menemukan ketidaksesuaian. Tidak ada data yang diubah.');

            return self::FAILURE;
        }
        $this->info('Tagihan, pembayaran, uang muka, alokasi, dan penggunaan layanan vendor konsisten.');

        return self::SUCCESS;
    }
}
