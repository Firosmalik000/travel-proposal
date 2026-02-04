<?php

/**
 * Cleanup Script untuk Inventaris Photos
 *
 * Script ini akan membersihkan data foto_barang yang kosong atau invalid
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Inventaris;

echo "\n";
echo "========================================\n";
echo "  Inventaris Photos Cleanup Script\n";
echo "========================================\n\n";

try {
    $inventaris = Inventaris::all();
    $fixed = 0;
    $total = $inventaris->count();

    echo "Processing {$total} inventaris items...\n\n";

    foreach ($inventaris as $item) {
        $needsUpdate = false;
        $originalPhotos = $item->foto_barang;

        if ($originalPhotos && is_array($originalPhotos)) {
            // Filter out empty or invalid paths
            $cleanedPhotos = array_filter($originalPhotos, function($path) {
                return !empty($path) && is_string($path) && strlen(trim($path)) > 0;
            });

            // Re-index array
            $cleanedPhotos = array_values($cleanedPhotos);

            // Check if anything changed
            if (count($cleanedPhotos) !== count($originalPhotos)) {
                $needsUpdate = true;
                echo "[ID: {$item->id}] Cleaning photos...\n";
                echo "  Before: " . json_encode($originalPhotos) . "\n";
                echo "  After:  " . json_encode($cleanedPhotos) . "\n";

                // Update
                $item->foto_barang = !empty($cleanedPhotos) ? $cleanedPhotos : null;
                $item->save();

                $fixed++;
            }
        } elseif ($originalPhotos === [] || $originalPhotos === '' || $originalPhotos === '[]') {
            // Empty array or string, set to null
            echo "[ID: {$item->id}] Setting empty foto_barang to null\n";
            $item->foto_barang = null;
            $item->save();
            $fixed++;
        }
    }

    echo "\n";
    echo "========================================\n";
    echo "  Cleanup Complete!\n";
    echo "========================================\n";
    echo "Total processed: {$total}\n";
    echo "Total fixed: {$fixed}\n";
    echo "Total unchanged: " . ($total - $fixed) . "\n\n";

} catch (\Exception $e) {
    echo "\n";
    echo "========================================\n";
    echo "  Error!\n";
    echo "========================================\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n\n";
    exit(1);
}
