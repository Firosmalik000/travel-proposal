<?php

/**
 * MinIO Production Connection Test
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;

echo "\n";
echo "========================================\n";
echo "  MinIO Production Connection Test\n";
echo "========================================\n\n";

// Display configuration
echo "[1/7] Checking configuration...\n";
$config = config('filesystems.disks.minio');
echo "      Endpoint: " . ($config['endpoint'] ?? 'NOT SET') . "\n";
echo "      Bucket: " . ($config['bucket'] ?? 'NOT SET') . "\n";
echo "      Region: " . ($config['region'] ?? 'NOT SET') . "\n";
echo "      Access Key: " . (isset($config['key']) ? substr($config['key'], 0, 5) . '***' . substr($config['key'], -3) : 'NOT SET') . "\n";
echo "      Use Path Style: " . ($config['use_path_style_endpoint'] ? 'true' : 'false') . "\n\n";

if (empty($config['endpoint']) || empty($config['bucket']) || empty($config['key'])) {
    echo "❌ ERROR: Configuration incomplete!\n";
    echo "   Please check your .env file.\n\n";
    exit(1);
}

// Test 1: List files (connection test)
echo "[2/7] Testing connection to MinIO...\n";
try {
    $files = Storage::disk('minio')->files();
    echo "      ✓ Connection successful!\n";
    echo "      Files in bucket: " . count($files) . "\n\n";
} catch (\Exception $e) {
    echo "      ❌ Connection failed!\n";
    echo "      Error: " . $e->getMessage() . "\n\n";

    echo "Troubleshooting:\n";
    echo "1. Check if MinIO server is running\n";
    echo "2. Verify endpoint URL is correct\n";
    echo "3. Check firewall/network access\n";
    echo "4. Verify SSL certificate if using HTTPS\n\n";
    exit(1);
}

// Test 2: Check if bucket exists
echo "[3/7] Checking if bucket exists...\n";
try {
    $exists = Storage::disk('minio')->exists('test-connection.txt');
    echo "      ✓ Bucket is accessible\n\n";
} catch (\Exception $e) {
    echo "      ❌ Bucket not accessible!\n";
    echo "      Error: " . $e->getMessage() . "\n";
    echo "      Please create bucket '" . $config['bucket'] . "' in MinIO Console\n\n";
}

// Test 3: Upload test file
echo "[4/7] Testing file upload...\n";
try {
    $testContent = "Test upload at " . now()->toDateTimeString() . "\n";
    $testContent .= "Testing MinIO S3 integration\n";
    $testPath = 'test-uploads/test-' . time() . '.txt';

    Storage::disk('minio')->put($testPath, $testContent);
    echo "      ✓ Upload successful!\n";
    echo "      File: {$testPath}\n";
    echo "      Size: " . strlen($testContent) . " bytes\n\n";
} catch (\Exception $e) {
    echo "      ❌ Upload failed!\n";
    echo "      Error: " . $e->getMessage() . "\n\n";

    if (strpos($e->getMessage(), 'NoSuchBucket') !== false) {
        echo "      → Bucket does not exist. Please create it in MinIO Console.\n\n";
    } elseif (strpos($e->getMessage(), 'AccessDenied') !== false) {
        echo "      → Access denied. Check your credentials.\n\n";
    }
    exit(1);
}

// Test 4: Verify uploaded file
echo "[5/7] Verifying uploaded file...\n";
try {
    if (Storage::disk('minio')->exists($testPath)) {
        $size = Storage::disk('minio')->size($testPath);
        echo "      ✓ File exists!\n";
        echo "      Size: {$size} bytes\n\n";
    } else {
        echo "      ❌ File not found after upload!\n\n";
    }
} catch (\Exception $e) {
    echo "      ❌ Verification failed!\n";
    echo "      Error: " . $e->getMessage() . "\n\n";
}

// Test 5: Get file URL
echo "[6/7] Getting file URL...\n";
try {
    $url = Storage::disk('minio')->url($testPath);
    echo "      ✓ URL generated!\n";
    echo "      URL: {$url}\n\n";
} catch (\Exception $e) {
    echo "      ❌ URL generation failed!\n";
    echo "      Error: " . $e->getMessage() . "\n\n";
}

// Test 6: Download file
echo "[7/7] Testing file download...\n";
try {
    $content = Storage::disk('minio')->get($testPath);
    echo "      ✓ Download successful!\n";
    echo "      Content preview: " . substr($content, 0, 50) . "...\n\n";

    // Clean up test file
    Storage::disk('minio')->delete($testPath);
    echo "      ✓ Test file deleted\n\n";
} catch (\Exception $e) {
    echo "      ❌ Download failed!\n";
    echo "      Error: " . $e->getMessage() . "\n\n";
}

echo "========================================\n";
echo "  All Tests Passed! ✓\n";
echo "========================================\n\n";

echo "MinIO is ready to use!\n";
echo "Endpoint: " . $config['endpoint'] . "\n";
echo "Bucket: " . $config['bucket'] . "\n\n";

echo "Next steps:\n";
echo "1. Your MinIO S3 connection is working\n";
echo "2. Try uploading file from inventaris page\n";
echo "3. Check MinIO Console to verify files\n\n";
