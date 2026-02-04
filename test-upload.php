<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;

echo "Testing MinIO Upload...\n\n";

try {
    // Test 1: Put simple text
    echo "1. Uploading text file...\n";
    $path = 'test-folder/test-' . time() . '.txt';
    $content = "Hello MinIO from Laravel at " . now();

    Storage::disk('minio')->put($path, $content);
    echo "   ✓ Upload successful!\n";
    echo "   Path: {$path}\n\n";

    // Test 2: Check if exists
    echo "2. Checking if file exists...\n";
    if (Storage::disk('minio')->exists($path)) {
        echo "   ✓ File exists!\n\n";
    } else {
        echo "   ✗ File NOT found!\n\n";
    }

    // Test 3: Get URL
    echo "3. Getting URL...\n";
    $url = Storage::disk('minio')->url($path);
    echo "   URL: {$url}\n\n";

    // Test 4: Download
    echo "4. Downloading file...\n";
    $downloaded = Storage::disk('minio')->get($path);
    echo "   Content: {$downloaded}\n\n";

    // Test 5: List files
    echo "5. Listing all files in bucket...\n";
    $files = Storage::disk('minio')->allFiles();
    echo "   Total files: " . count($files) . "\n";
    foreach ($files as $file) {
        echo "   - {$file}\n";
    }
    echo "\n";

    echo "========================================\n";
    echo "All tests PASSED! MinIO is working! ✓\n";
    echo "========================================\n\n";

    echo "You can now:\n";
    echo "1. Upload files from inventaris page\n";
    echo "2. Check MinIO Console to see uploaded files\n";
    echo "3. Delete test file: Storage::disk('minio')->delete('{$path}')\n\n";

} catch (\Exception $e) {
    echo "\n========================================\n";
    echo "ERROR!\n";
    echo "========================================\n\n";
    echo "Error message: " . $e->getMessage() . "\n\n";
    echo "Error class: " . get_class($e) . "\n\n";

    if (strpos($e->getMessage(), 'NoSuchBucket') !== false) {
        echo "ISSUE: Bucket 'xbossone' does not exist!\n";
        echo "FIX: Create bucket in MinIO Console\n\n";
    } elseif (strpos($e->getMessage(), 'InvalidAccessKeyId') !== false) {
        echo "ISSUE: Access Key is invalid!\n";
        echo "FIX: Check AWS_ACCESS_KEY_ID in .env\n\n";
    } elseif (strpos($e->getMessage(), 'SignatureDoesNotMatch') !== false) {
        echo "ISSUE: Secret Key is invalid!\n";
        echo "FIX: Check AWS_SECRET_ACCESS_KEY in .env\n\n";
    } elseif (strpos($e->getMessage(), 'could not be resolved') !== false) {
        echo "ISSUE: Cannot connect to MinIO server!\n";
        echo "FIX: Check AWS_ENDPOINT in .env\n";
        echo "     Current: " . config('filesystems.disks.minio.endpoint') . "\n\n";
    } elseif (strpos($e->getMessage(), 'SSL') !== false || strpos($e->getMessage(), 'certificate') !== false) {
        echo "ISSUE: SSL Certificate problem!\n";
        echo "FIX: MinIO might use self-signed certificate\n\n";
    }

    echo "Full error:\n";
    echo $e->getTraceAsString() . "\n\n";
}
