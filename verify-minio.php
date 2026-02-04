<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;

echo "\n========================================\n";
echo "  MinIO Upload Verification\n";
echo "========================================\n\n";

// Test 1: Upload file
echo "[1/3] Uploading test file...\n";
$testPath = 'inventaris-photos/test-' . time() . '.txt';
$testContent = "Test upload at " . now()->toDateTimeString();

try {
    Storage::disk('minio')->put($testPath, $testContent);
    echo "      ✓ Upload successful!\n";
    echo "      Path: {$testPath}\n\n";
} catch (\Exception $e) {
    echo "      ✗ Upload failed!\n";
    echo "      Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 2: Download to verify
echo "[2/3] Downloading to verify...\n";
try {
    $downloaded = Storage::disk('minio')->get($testPath);
    echo "      ✓ Download successful!\n";
    echo "      Content: {$downloaded}\n\n";
} catch (\Exception $e) {
    echo "      ✗ Download failed!\n";
    echo "      Error: " . $e->getMessage() . "\n\n";
}

// Test 3: Get URL
echo "[3/3] Getting MinIO URL...\n";
try {
    $url = Storage::disk('minio')->url($testPath);
    echo "      ✓ URL generated!\n";
    echo "      URL: {$url}\n\n";

    echo "========================================\n";
    echo "  File berhasil di MinIO!\n";
    echo "========================================\n\n";

    echo "Cek di MinIO Console:\n";
    echo "1. Login: https://s3.natanet.my.id:9443\n";
    echo "2. Bucket: xbossone\n";
    echo "3. Folder: inventaris-photos/\n";
    echo "4. File: " . basename($testPath) . "\n\n";

    echo "Atau akses langsung:\n";
    echo "{$url}\n\n";

} catch (\Exception $e) {
    echo "      ✗ URL generation failed!\n";
    echo "      Error: " . $e->getMessage() . "\n\n";
}

echo "File sudah tersimpan di MinIO! ✓\n";
echo "Sekarang coba upload dari inventaris page.\n\n";
