<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;
use Aws\S3\S3Client;
use Aws\Exception\AwsException;

echo "\n========================================\n";
echo "  MinIO Deep Diagnostic\n";
echo "========================================\n\n";

// Step 1: Show configuration
echo "=== CONFIGURATION ===\n";
$config = config('filesystems.disks.minio');
echo "Endpoint: " . ($config['endpoint'] ?? 'NOT SET') . "\n";
echo "Bucket: " . ($config['bucket'] ?? 'NOT SET') . "\n";
echo "Region: " . ($config['region'] ?? 'NOT SET') . "\n";
echo "Access Key: " . (isset($config['key']) ? substr($config['key'], 0, 8) . '...' . substr($config['key'], -4) : 'NOT SET') . "\n";
echo "Secret Key: " . (isset($config['secret']) ? substr($config['secret'], 0, 8) . '...' . substr($config['secret'], -4) : 'NOT SET') . "\n";
echo "Use Path Style: " . ($config['use_path_style_endpoint'] ? 'true' : 'false') . "\n\n";

// Step 2: Test AWS SDK directly
echo "=== AWS SDK DIRECT TEST ===\n";
try {
    $s3Client = new S3Client([
        'version' => 'latest',
        'region' => $config['region'] ?? 'us-east-1',
        'endpoint' => $config['endpoint'],
        'use_path_style_endpoint' => true,
        'credentials' => [
            'key' => $config['key'],
            'secret' => $config['secret'],
        ],
        'http' => [
            'verify' => false // Disable SSL verification for self-signed certs
        ]
    ]);

    echo "✓ S3 Client created successfully\n\n";

    // Test 3: List buckets
    echo "=== LIST BUCKETS ===\n";
    try {
        $result = $s3Client->listBuckets();
        echo "Available buckets:\n";
        foreach ($result['Buckets'] as $bucket) {
            $name = $bucket['Name'];
            $marker = ($name === $config['bucket']) ? ' ← TARGET BUCKET' : '';
            echo "  - {$name}{$marker}\n";
        }
        echo "\n";
    } catch (AwsException $e) {
        echo "✗ Failed to list buckets: " . $e->getMessage() . "\n\n";
    }

    // Test 4: Check if bucket exists
    echo "=== CHECK BUCKET EXISTS ===\n";
    try {
        $exists = $s3Client->doesBucketExist($config['bucket']);
        if ($exists) {
            echo "✓ Bucket '{$config['bucket']}' exists!\n\n";
        } else {
            echo "✗ Bucket '{$config['bucket']}' DOES NOT EXIST!\n";
            echo "  Please create bucket in MinIO Console\n\n";
            exit(1);
        }
    } catch (AwsException $e) {
        echo "✗ Error checking bucket: " . $e->getMessage() . "\n\n";
    }

    // Test 5: Upload test file
    echo "=== UPLOAD TEST ===\n";
    $testKey = 'debug-test/' . time() . '.txt';
    $testContent = "Debug test at " . date('Y-m-d H:i:s');

    try {
        $result = $s3Client->putObject([
            'Bucket' => $config['bucket'],
            'Key' => $testKey,
            'Body' => $testContent,
            'ContentType' => 'text/plain'
        ]);

        echo "✓ Upload successful!\n";
        echo "  Key: {$testKey}\n";
        echo "  ETag: " . ($result['ETag'] ?? 'N/A') . "\n";
        echo "  VersionId: " . ($result['VersionId'] ?? 'N/A') . "\n\n";

        // Test 6: Verify upload by getting object
        echo "=== VERIFY UPLOAD ===\n";
        try {
            $result = $s3Client->getObject([
                'Bucket' => $config['bucket'],
                'Key' => $testKey
            ]);

            $body = (string) $result['Body'];
            echo "✓ File retrieved successfully!\n";
            echo "  Content: {$body}\n";
            echo "  Size: " . strlen($body) . " bytes\n\n";

            // Test 7: Get object URL
            echo "=== GENERATE URL ===\n";
            $url = $s3Client->getObjectUrl($config['bucket'], $testKey);
            echo "✓ URL: {$url}\n\n";

            echo "========================================\n";
            echo "  ALL TESTS PASSED!\n";
            echo "========================================\n\n";

            echo "File successfully uploaded to MinIO!\n";
            echo "Check in MinIO Console:\n";
            echo "  Bucket: {$config['bucket']}\n";
            echo "  Folder: debug-test/\n";
            echo "  File: " . basename($testKey) . "\n\n";

            echo "Direct URL:\n";
            echo "  {$url}\n\n";

            // Clean up
            echo "Cleaning up test file...\n";
            $s3Client->deleteObject([
                'Bucket' => $config['bucket'],
                'Key' => $testKey
            ]);
            echo "✓ Test file deleted\n\n";

        } catch (AwsException $e) {
            echo "✗ Failed to retrieve file: " . $e->getMessage() . "\n";
            echo "  Error code: " . $e->getAwsErrorCode() . "\n\n";
        }

    } catch (AwsException $e) {
        echo "✗ Upload failed!\n";
        echo "  Error: " . $e->getMessage() . "\n";
        echo "  Error code: " . $e->getAwsErrorCode() . "\n";
        echo "  Status code: " . $e->getStatusCode() . "\n\n";

        // Detailed error info
        if ($e->getAwsErrorCode() === 'NoSuchBucket') {
            echo "ERROR: Bucket does not exist!\n";
            echo "FIX: Create bucket '{$config['bucket']}' in MinIO Console\n\n";
        } elseif ($e->getAwsErrorCode() === 'InvalidAccessKeyId') {
            echo "ERROR: Access Key is invalid!\n";
            echo "FIX: Check AWS_ACCESS_KEY_ID in .env\n\n";
        } elseif ($e->getAwsErrorCode() === 'SignatureDoesNotMatch') {
            echo "ERROR: Secret Key is invalid!\n";
            echo "FIX: Check AWS_SECRET_ACCESS_KEY in .env\n\n";
        } elseif ($e->getAwsErrorCode() === 'AccessDenied') {
            echo "ERROR: Access denied! Check bucket permissions\n";
            echo "FIX: Set bucket policy to allow write access\n\n";
        }
        exit(1);
    }

} catch (\Exception $e) {
    echo "✗ S3 Client creation failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "Error class: " . get_class($e) . "\n\n";

    if (strpos($e->getMessage(), 'Could not resolve host') !== false) {
        echo "ERROR: Cannot connect to MinIO server!\n";
        echo "FIX: Check endpoint URL in .env\n";
        echo "     Current: " . ($config['endpoint'] ?? 'NOT SET') . "\n\n";
    } elseif (strpos($e->getMessage(), 'SSL') !== false) {
        echo "ERROR: SSL certificate issue!\n";
        echo "FIX: MinIO might use self-signed certificate\n\n";
    }
    exit(1);
}

echo "MinIO is configured correctly and working! ✓\n\n";
