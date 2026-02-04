<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;

echo "\n========================================\n";
echo "  MinIO Connection Speed Test\n";
echo "========================================\n\n";

$endpoint = config('filesystems.disks.minio.endpoint');
$bucket = config('filesystems.disks.minio.bucket');

echo "Testing: {$endpoint}\n";
echo "Bucket: {$bucket}\n\n";

// Test 1: Connection speed
echo "[1/3] Testing connection speed...\n";
$start = microtime(true);
try {
    Storage::disk('minio')->put('speed-test.txt', 'test');
    $duration = round((microtime(true) - $start) * 1000, 2);
    echo "      ✓ Connection: {$duration}ms\n\n";

    if ($duration > 5000) {
        echo "      ⚠ WARNING: Connection is slow! ({$duration}ms)\n";
        echo "      This might cause timeout issues.\n\n";
    }
} catch (\Exception $e) {
    $duration = round((microtime(true) - $start) * 1000, 2);
    echo "      ✗ Failed after {$duration}ms\n";
    echo "      Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 2: Upload small file
echo "[2/3] Testing small file upload (1KB)...\n";
$data = str_repeat('x', 1024); // 1KB
$start = microtime(true);
try {
    Storage::disk('minio')->put('speed-test-1kb.txt', $data);
    $duration = round((microtime(true) - $start) * 1000, 2);
    $speed = round(1 / ($duration / 1000), 2);
    echo "      ✓ Upload: {$duration}ms ({$speed} KB/s)\n\n";
} catch (\Exception $e) {
    echo "      ✗ Failed: " . $e->getMessage() . "\n\n";
}

// Test 3: Upload medium file
echo "[3/3] Testing medium file upload (100KB)...\n";
$data = str_repeat('x', 102400); // 100KB
$start = microtime(true);
try {
    Storage::disk('minio')->put('speed-test-100kb.txt', $data);
    $duration = round((microtime(true) - $start) * 1000, 2);
    $speed = round(100 / ($duration / 1000), 2);
    echo "      ✓ Upload: {$duration}ms ({$speed} KB/s)\n\n";

    if ($duration > 10000) {
        echo "      ⚠ WARNING: Upload speed is very slow!\n";
        echo "      Expected: < 2000ms for 100KB\n";
        echo "      Actual: {$duration}ms\n\n";
    }
} catch (\Exception $e) {
    echo "      ✗ Failed: " . $e->getMessage() . "\n\n";
}

// Cleanup
try {
    Storage::disk('minio')->delete(['speed-test.txt', 'speed-test-1kb.txt', 'speed-test-100kb.txt']);
    echo "✓ Cleanup completed\n\n";
} catch (\Exception $e) {
    // Ignore cleanup errors
}

echo "========================================\n";
echo "Speed test completed!\n";
echo "========================================\n\n";

echo "If upload speed is slow:\n";
echo "1. Check network connection to MinIO server\n";
echo "2. Verify MinIO server is not overloaded\n";
echo "3. Consider uploading smaller files first\n";
echo "4. Use async/queue for large file uploads\n\n";
