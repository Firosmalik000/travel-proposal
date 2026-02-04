<?php

/**
 * Quick MinIO Test via Artisan
 * Run: php artisan-test-minio.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║           MinIO S3 Connection & Upload Test                 ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Test 1: Configuration
echo "📋 Step 1: Checking MinIO Configuration...\n";
echo str_repeat("─", 60) . "\n";

$config = config('filesystems.disks.minio');
echo "Endpoint     : " . $config['endpoint'] . "\n";
echo "Bucket       : " . $config['bucket'] . "\n";
echo "Region       : " . $config['region'] . "\n";
echo "URL          : " . ($config['url'] ?? 'NOT SET') . "\n";
echo "Visibility   : " . ($config['visibility'] ?? 'NOT SET') . "\n";
echo "SSL Verify   : " . ($config['options']['http']['verify'] ? 'Yes' : 'No') . "\n";
echo "✓ Configuration loaded\n\n";

// Test 2: Initialize Disk
echo "🔌 Step 2: Initializing MinIO Disk...\n";
echo str_repeat("─", 60) . "\n";

try {
    $disk = Storage::disk('minio');
    echo "✓ MinIO disk initialized successfully\n\n";
} catch (Exception $e) {
    echo "✗ FAILED to initialize MinIO disk\n";
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2.5: Check bucket access
echo "🪣 Step 2.5: Checking Bucket Access...\n";
echo str_repeat("─", 60) . "\n";

try {
    // Try to list files in the bucket
    $files = $disk->files('inventaris-photos');
    echo "✓ Bucket accessible\n";
    echo "  Files found: " . count($files) . "\n";
    if (count($files) > 0) {
        echo "  Sample files:\n";
        foreach (array_slice($files, 0, 3) as $file) {
            echo "    - {$file}\n";
        }
    }
    echo "\n";
} catch (Exception $e) {
    echo "✗ Cannot access bucket or folder\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Note: This might be OK if folder doesn't exist yet\n\n";
}

// Test 3: Test Upload
echo "📤 Step 3: Testing File Upload...\n";
echo str_repeat("─", 60) . "\n";

try {
    $testContent = "MinIO Test File\nCreated at: " . date('Y-m-d H:i:s');
    $testFilename = 'test-' . time() . '.txt';
    $testPath = 'inventaris-photos/' . $testFilename;

    echo "Uploading test file: {$testFilename}...\n";
    echo "Target path: {$testPath}\n";

    // Enable error reporting to catch any exceptions
    $result = null;
    try {
        $result = $disk->put($testPath, $testContent);
    } catch (\Aws\S3\Exception\S3Exception $e) {
        echo "✗ AWS S3 Exception caught!\n";
        echo "Error Code: " . $e->getAwsErrorCode() . "\n";
        echo "Error Message: " . $e->getAwsErrorMessage() . "\n";
        echo "Status Code: " . $e->getStatusCode() . "\n";
        throw $e;
    }

    if ($result) {
        echo "✓ File uploaded successfully!\n";
        echo "  Path: {$testPath}\n\n";

        // Test 4: Generate URL
        echo "🔗 Step 4: Generating Public URL...\n";
        echo str_repeat("─", 60) . "\n";

        try {
            $url = $disk->url($testPath);
            echo "✓ URL generated successfully\n";
            echo "  URL: {$url}\n\n";
        } catch (Exception $e) {
            echo "✗ Failed to generate URL\n";
            echo "Error: " . $e->getMessage() . "\n\n";
        }

        // Test 5: Read File
        echo "📥 Step 5: Reading File Content...\n";
        echo str_repeat("─", 60) . "\n";

        try {
            $readContent = $disk->get($testPath);
            if ($readContent === $testContent) {
                echo "✓ File read successfully, content matches!\n\n";
            } else {
                echo "✗ Content mismatch!\n";
                echo "Expected: {$testContent}\n";
                echo "Got: {$readContent}\n\n";
            }
        } catch (Exception $e) {
            echo "✗ Failed to read file\n";
            echo "Error: " . $e->getMessage() . "\n\n";
        }

        // Test 6: Delete File
        echo "🗑️  Step 6: Cleaning Up Test File...\n";
        echo str_repeat("─", 60) . "\n";

        try {
            $disk->delete($testPath);
            echo "✓ Test file deleted successfully\n\n";
        } catch (Exception $e) {
            echo "✗ Failed to delete test file\n";
            echo "Error: " . $e->getMessage() . "\n\n";
        }

    } else {
        echo "✗ Upload returned false/null\n";
        echo "\n🔍 Debugging Information:\n";
        echo "  - Disk adapter class: " . get_class($disk->getAdapter()) . "\n";
        echo "  - Bucket: " . config('filesystems.disks.minio.bucket') . "\n";
        echo "  - Endpoint: " . config('filesystems.disks.minio.endpoint') . "\n";

        // Try to get more info
        try {
            echo "\n  Attempting direct S3 client check...\n";
            $adapter = $disk->getAdapter();
            $client = $adapter->getClient();

            // Try to list buckets
            $buckets = $client->listBuckets();
            echo "  ✓ S3 Client connected successfully\n";
            echo "  Available buckets:\n";
            foreach ($buckets['Buckets'] as $bucket) {
                echo "    - " . $bucket['Name'] . "\n";
            }
        } catch (Exception $e2) {
            echo "  ✗ S3 Client error: " . $e2->getMessage() . "\n";
        }
        echo "\n";
    }

} catch (Exception $e) {
    echo "✗ Upload test FAILED\n";
    echo "Error Type: " . get_class($e) . "\n";
    echo "Error Message: " . $e->getMessage() . "\n";
    echo "\nStack Trace:\n" . $e->getTraceAsString() . "\n\n";
}

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║                     Test Complete                            ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

echo "💡 Tips:\n";
echo "   - If upload failed, check MinIO server is running\n";
echo "   - Verify credentials in .env file\n";
echo "   - Check bucket 'xbosone' exists in MinIO\n";
echo "   - For SSL errors, set AWS_SSL_VERIFY=false in .env\n\n";
