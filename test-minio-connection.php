<?php

/**
 * MinIO Connection Test Script
 *
 * This script tests the MinIO S3 connection and upload functionality
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Storage;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== MinIO Connection Test ===\n\n";

// 1. Check MinIO Configuration
echo "1. Checking MinIO configuration...\n";
$config = config('filesystems.disks.minio');
echo "   - Endpoint: " . $config['endpoint'] . "\n";
echo "   - Bucket: " . $config['bucket'] . "\n";
echo "   - Region: " . $config['region'] . "\n";
echo "   - URL: " . ($config['url'] ?? 'Not set') . "\n";
echo "   - Visibility: " . ($config['visibility'] ?? 'Not set') . "\n\n";

// 2. Test Connection
echo "2. Testing MinIO connection...\n";
try {
    $disk = Storage::disk('minio');
    echo "   ✓ MinIO disk initialized\n\n";
} catch (Exception $e) {
    echo "   ✗ Failed to initialize MinIO disk: " . $e->getMessage() . "\n";
    exit(1);
}

// 3. Test Bucket Access
echo "3. Testing bucket access...\n";
try {
    // Try to list files (even if empty)
    $files = $disk->files('inventaris-photos');
    echo "   ✓ Bucket accessible\n";
    echo "   - Files in 'inventaris-photos': " . count($files) . "\n\n";
} catch (Exception $e) {
    echo "   ✗ Failed to access bucket: " . $e->getMessage() . "\n";
    echo "   - Check if bucket exists and credentials are correct\n\n";
}

// 4. Test File Upload
echo "4. Testing file upload...\n";
try {
    $testContent = "Test file created at " . date('Y-m-d H:i:s');
    $testPath = 'inventaris-photos/test-' . time() . '.txt';

    $result = $disk->put($testPath, $testContent);

    if ($result) {
        echo "   ✓ File uploaded successfully\n";
        echo "   - Path: {$testPath}\n";

        // 5. Test URL Generation
        echo "\n5. Testing URL generation...\n";
        try {
            $url = $disk->url($testPath);
            echo "   ✓ URL generated successfully\n";
            echo "   - URL: {$url}\n";
        } catch (Exception $e) {
            echo "   ✗ Failed to generate URL: " . $e->getMessage() . "\n";
        }

        // 6. Test File Read
        echo "\n6. Testing file read...\n";
        try {
            $content = $disk->get($testPath);
            if ($content === $testContent) {
                echo "   ✓ File read successfully and content matches\n";
            } else {
                echo "   ✗ File content does not match\n";
            }
        } catch (Exception $e) {
            echo "   ✗ Failed to read file: " . $e->getMessage() . "\n";
        }

        // 7. Clean up test file
        echo "\n7. Cleaning up test file...\n";
        try {
            $disk->delete($testPath);
            echo "   ✓ Test file deleted\n";
        } catch (Exception $e) {
            echo "   ✗ Failed to delete test file: " . $e->getMessage() . "\n";
        }

    } else {
        echo "   ✗ File upload failed\n";
    }

} catch (Exception $e) {
    echo "   ✗ Upload test failed: " . $e->getMessage() . "\n";
    echo "   - Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Complete ===\n";
