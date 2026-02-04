<?php

namespace App\Console\Commands;

use App\Models\Inventaris;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class RegenerateInventarisQRCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventaris:regenerate-qrcodes {--force : Force regeneration even if QR code exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate QR codes for all inventaris items';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting QR code regeneration...');

        $force = $this->option('force');

        // Ensure directory exists
        $directory = storage_path('app/public/qr-codes');
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
            $this->info('Created qr-codes directory');
        }

        $inventaris = Inventaris::where('is_active', true)->get();
        $total = $inventaris->count();
        $generated = 0;
        $skipped = 0;
        $failed = 0;

        $this->info("Found {$total} inventaris items");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        foreach ($inventaris as $item) {
            try {
                // Skip if QR code exists and not forcing
                if (!$force && $item->qr_code_path && Storage::disk('public')->exists($item->qr_code_path)) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                // Generate QR code
                $qrData = url('/inventaris/detail/' . $item->kode_barang);
                $filename = 'qr-codes/' . $item->kode_barang . '.png';

                $qrCode = new QrCode($qrData);
                $writer = new PngWriter();
                $result = $writer->write($qrCode);

                // Save to storage
                Storage::disk('public')->put($filename, $result->getString());

                // Update database
                $item->update(['qr_code_path' => $filename]);

                $generated++;
            } catch (\Exception $e) {
                $failed++;
                $this->error("\nFailed to generate QR code for {$item->kode_barang}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("QR code regeneration completed!");
        $this->table(
            ['Status', 'Count'],
            [
                ['Generated', $generated],
                ['Skipped', $skipped],
                ['Failed', $failed],
                ['Total', $total],
            ]
        );

        return Command::SUCCESS;
    }
}
