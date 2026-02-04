<?php

/**
 * MinIO Quick Test Script
 *
 * Usage: php test-minio.php
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;

echo "\n";
echo "========================================\n";
echo "  MinIO S3 Connection Test\n";
echo "========================================\n\n";

try {
    // Test 1: Check configuration
    echo "[1/6] Checking configuration...\n";
    $config = config('filesystems.disks.minio');
    echo "      Endpoint: " . $config['endpoint'] . "\n";
    echo "      Bucket: " . $config['bucket'] . "\n";
    echo "      Region: " . $config['region'] . "\n";
    echo "      Access Key: " . substr($config['key'], 0, 5) . "***" . substr($config['key'], -3) . "\n";
    echo "      ✓ Configuration loaded\n\n";

    // Test 2: Test connection
    echo "[2/6] Testing connection to MinIO...\n";
    $files = Storage::disk('minio')->files();
    echo "      ✓ Connection successful!\n";
    echo "      Files count: " . count($files) . "\n\n";

    // Test 3: Upload dummy file
    echo "[3/6] Testing upload dummy file...\n";
    $content = "Test file created at " . now()->toDateTimeString() . "\n";
    $content .= "This is a test file from MinIO integration.\n";
    $content .= "Laravel Version: " . app()->version() . "\n";
    $content .= "PHP Version: " . phpversion() . "\n";

    $filename = 'test_' . time() . '.txt';
    $path = 'test-files/' . $filename;

    Storage::disk('minio')->put($path, $content);
    echo "      ✓ Upload successful!\n";
    echo "      File: $path\n";
    echo "      Size: " . strlen($content) . " bytes\n\n";

    // Test 4: List all files
    echo "[4/6] Testing list all files...\n";
    $allFiles = Storage::disk('minio')->allFiles();
    $allDirs = Storage::disk('minio')->allDirectories();

    echo "      ✓ List successful!\n";
    echo "      Total files: " . count($allFiles) . "\n";
    echo "      Total directories: " . count($allDirs) . "\n";

    if (!empty($allFiles)) {
        echo "\n      Recent files:\n";
        $recentFiles = array_slice($allFiles, -5);
        foreach ($recentFiles as $file) {
            $size = Storage::disk('minio')->size($file);
            $modified = date('Y-m-d H:i:s', Storage::disk('minio')->lastModified($file));
            echo "      - $file (" . formatBytes($size) . ", $modified)\n";
        }
    }
    echo "\n";

    // Test 5: Get file info
    echo "[5/6] Testing get file info...\n";
    if (Storage::disk('minio')->exists($path)) {
        $size = Storage::disk('minio')->size($path);
        $lastModified = Storage::disk('minio')->lastModified($path);
        $url = Storage::disk('minio')->url($path);
        $mimeType = Storage::disk('minio')->mimeType($path);

        echo "      ✓ File info retrieved!\n";
        echo "      Path: $path\n";
        echo "      Size: " . formatBytes($size) . "\n";
        echo "      Last Modified: " . date('Y-m-d H:i:s', $lastModified) . "\n";
        echo "      MIME Type: $mimeType\n";
        echo "      URL: $url\n\n";
    }

    // Test 6: Delete test file
    echo "[6/6] Testing delete file...\n";
    if (Storage::disk('minio')->exists($path)) {
        Storage::disk('minio')->delete($path);
        echo "      ✓ File deleted successfully!\n";
        echo "      Deleted: $path\n\n";
    }

    echo "========================================\n";
    echo "  ✓ All tests passed!\n";
    echo "========================================\n\n";

    echo "Next steps:\n";
    echo "1. MinIO sudah siap digunakan di aplikasi\n";
    echo "2. Buka http://localhost:8000/minio-test/connection untuk web testing\n";
    echo "3. Baca dokumentasi lengkap di MINIO_TESTING_GUIDE.md\n\n";

} catch (\Exception $e) {
    echo "\n";
    echo "========================================\n";
    echo "  ✗ Test Failed!\n";
    echo "========================================\n\n";

    echo "Error: " . $e->getMessage() . "\n\n";

    echo "Troubleshooting:\n";
    echo "1. Pastikan MinIO server sudah berjalan\n";
    echo "2. Cek konfigurasi di file .env:\n";
    echo "   - AWS_ENDPOINT (default: http://localhost:9000)\n";
    echo "   - AWS_ACCESS_KEY_ID\n";
    echo "   - AWS_SECRET_ACCESS_KEY\n";
    echo "   - AWS_BUCKET (default: xbossone)\n\n";
    echo "3. Pastikan bucket sudah dibuat di MinIO Console:\n";
    echo "   - Buka: http://localhost:9001\n";
    echo "   - Login dengan credentials\n";
    echo "   - Buat bucket: xbossone\n\n";
    echo "4. Test connection manual:\n";
    echo "   curl http://localhost:9000/minio/health/live\n\n";

    echo "Error Details:\n";
    echo $e->getTraceAsString() . "\n\n";

    exit(1);
}

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= (1 << (10 * $pow));

    return round($bytes, $precision) . ' ' . $units[$pow];
}
