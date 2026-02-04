<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class SyncStorageFromStaging extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'storage:sync-from-staging {--dry-run : Run without actually copying files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync storage files from staging environment to production';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');

        // Define source and destination paths
        $stagingPath = '/home/ploi/staging.superapp.xboss.id/storage/app/public';
        $productionPath = storage_path('app/public');

        $this->info('=== Storage Sync from Staging to Production ===');
        $this->info('Source: ' . $stagingPath);
        $this->info('Destination: ' . $productionPath);

        if ($isDryRun) {
            $this->warn('DRY RUN MODE - No files will be copied');
        }

        $this->newLine();

        // Check if source exists
        if (!File::exists($stagingPath)) {
            $this->error('Source path does not exist: ' . $stagingPath);
            return 1;
        }

        // Create destination if not exists
        if (!File::exists($productionPath)) {
            $this->info('Creating destination directory...');
            if (!$isDryRun) {
                File::makeDirectory($productionPath, 0755, true);
            }
        }

        // Get all directories in staging public storage
        $directories = File::directories($stagingPath);

        $totalFiles = 0;
        $copiedFiles = 0;
        $skippedFiles = 0;

        $this->info('Scanning directories...');
        $this->newLine();

        foreach ($directories as $directory) {
            $dirName = basename($directory);
            $destDir = $productionPath . '/' . $dirName;

            $this->line('Processing directory: ' . $dirName);

            // Create destination directory if not exists
            if (!File::exists($destDir)) {
                $this->info('  Creating directory: ' . $dirName);
                if (!$isDryRun) {
                    File::makeDirectory($destDir, 0755, true);
                }
            }

            // Get all files in this directory
            $files = File::allFiles($directory);

            foreach ($files as $file) {
                $totalFiles++;
                $relativePath = $file->getRelativePathname();
                $destFile = $destDir . '/' . $relativePath;

                // Check if file already exists in destination
                if (File::exists($destFile)) {
                    // Compare file sizes
                    $sourceSize = File::size($file->getPathname());
                    $destSize = File::size($destFile);

                    if ($sourceSize === $destSize) {
                        $skippedFiles++;
                        $this->line('  <fg=yellow>SKIP</> ' . $relativePath . ' (already exists with same size)');
                        continue;
                    }
                }

                // Copy file
                $this->line('  <fg=green>COPY</> ' . $relativePath);

                if (!$isDryRun) {
                    // Create subdirectories if needed
                    $destFileDir = dirname($destFile);
                    if (!File::exists($destFileDir)) {
                        File::makeDirectory($destFileDir, 0755, true);
                    }

                    File::copy($file->getPathname(), $destFile);
                }

                $copiedFiles++;
            }

            $this->newLine();
        }

        // Summary
        $this->newLine();
        $this->info('=== Summary ===');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total files scanned', $totalFiles],
                ['Files copied', $copiedFiles],
                ['Files skipped', $skippedFiles],
            ]
        );

        if ($isDryRun) {
            $this->newLine();
            $this->warn('DRY RUN completed. Run without --dry-run to actually copy files.');
            $this->info('Command: php artisan storage:sync-from-staging');
        } else {
            $this->newLine();
            $this->info('✓ Sync completed successfully!');
        }

        return 0;
    }
}
