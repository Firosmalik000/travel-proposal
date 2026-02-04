# MinIO Testing Guide

Panduan lengkap untuk testing MinIO S3 Object Storage di Super Apps XBoss.

## Prerequisites

1. Package `league/flysystem-aws-s3-v3` sudah terinstall ✓
2. File `.env` sudah dikonfigurasi dengan kredensial MinIO ✓
3. MinIO server sudah berjalan (local atau remote)
4. Bucket `xbossone` sudah dibuat di MinIO

## Test Routes yang Tersedia

### 1. Test System Info
Cek konfigurasi dan package yang terinstall

```
GET http://localhost:8000/minio-test/system-info
```

Response:
```json
{
  "success": true,
  "data": {
    "php_version": "8.2.4",
    "laravel_version": "12.0",
    "minio_config": {
      "endpoint": "http://localhost:9000",
      "bucket": "xbossone",
      "region": "us-east-1",
      "access_key": "LHC*************83K5"
    },
    "packages": {
      "flysystem_aws_s3": "Installed",
      "aws_sdk": "Installed"
    }
  }
}
```

### 2. Test Connection
Test koneksi ke MinIO server

```
GET http://localhost:8000/minio-test/connection
```

Response jika berhasil:
```json
{
  "success": true,
  "message": "Koneksi ke MinIO berhasil!",
  "data": {
    "disk": "minio",
    "endpoint": "http://localhost:9000",
    "bucket": "xbossone",
    "files_count": 0
  }
}
```

Response jika gagal:
```json
{
  "success": false,
  "message": "Koneksi ke MinIO gagal!",
  "error": "Error message...",
  "tips": [
    "Pastikan MinIO server sudah berjalan",
    "Cek endpoint di file .env",
    "Cek Access Key dan Secret Key",
    "Pastikan bucket sudah dibuat di MinIO Console"
  ]
}
```

### 3. Test Upload Dummy File
Upload file text dummy untuk testing

```
GET http://localhost:8000/minio-test/upload-dummy
```

Response:
```json
{
  "success": true,
  "message": "Upload dummy file berhasil!",
  "data": {
    "path": "test-files/test_1734345600.txt",
    "url": "http://localhost:9000/xbossone/test-files/test_1734345600.txt",
    "content": "Test file created at 2025-12-16 10:00:00",
    "size": "45 bytes"
  }
}
```

### 4. Test List Files
List semua files yang ada di MinIO

```
GET http://localhost:8000/minio-test/list-files
```

Response:
```json
{
  "success": true,
  "message": "List files berhasil!",
  "data": {
    "total_files": 5,
    "total_directories": 2,
    "files": [
      {
        "path": "test-files/test_1734345600.txt",
        "size": 45,
        "size_human": "45 B",
        "last_modified": "2025-12-16 10:00:00",
        "url": "http://localhost:9000/xbossone/test-files/test_1734345600.txt"
      }
    ],
    "directories": ["test-files", "uploads"]
  }
}
```

### 5. Test Delete File
Delete file dari MinIO

```
POST http://localhost:8000/minio-test/delete
Content-Type: application/json

{
  "path": "test-files/test_1734345600.txt"
}
```

Response:
```json
{
  "success": true,
  "message": "File berhasil dihapus: test-files/test_1734345600.txt"
}
```

## Testing dengan Browser

Jalankan Laravel development server:
```bash
php artisan serve
```

Kemudian buka browser dan akses:

1. **System Info**: http://localhost:8000/minio-test/system-info
2. **Test Connection**: http://localhost:8000/minio-test/connection
3. **Upload Dummy**: http://localhost:8000/minio-test/upload-dummy
4. **List Files**: http://localhost:8000/minio-test/list-files

## Testing dengan cURL

### 1. Test System Info
```bash
curl http://localhost:8000/minio-test/system-info
```

### 2. Test Connection
```bash
curl http://localhost:8000/minio-test/connection
```

### 3. Upload Dummy File
```bash
curl http://localhost:8000/minio-test/upload-dummy
```

### 4. List Files
```bash
curl http://localhost:8000/minio-test/list-files
```

### 5. Delete File
```bash
curl -X POST http://localhost:8000/minio-test/delete \
  -H "Content-Type: application/json" \
  -d '{"path": "test-files/test_1734345600.txt"}'
```

### 6. Upload File Real (menggunakan MinioStorageController)
```bash
curl -X POST http://localhost:8000/minio/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@C:/path/to/your/file.pdf"
```

## Testing dengan Postman

### Setup Postman Collection

1. **Buat Environment baru**:
   - Name: `MinIO Local`
   - Variables:
     - `base_url`: `http://localhost:8000`
     - `token`: `YOUR_AUTH_TOKEN` (jika butuh auth)

2. **Import Collection**:

```json
{
  "info": {
    "name": "MinIO Testing",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. System Info",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/minio-test/system-info"
      }
    },
    {
      "name": "2. Test Connection",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/minio-test/connection"
      }
    },
    {
      "name": "3. Upload Dummy",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/minio-test/upload-dummy"
      }
    },
    {
      "name": "4. List Files",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/minio-test/list-files"
      }
    },
    {
      "name": "5. Delete File",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"path\": \"test-files/test_1734345600.txt\"}"
        },
        "url": "{{base_url}}/minio-test/delete"
      }
    },
    {
      "name": "6. Upload Real File",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": ""
            }
          ]
        },
        "url": "{{base_url}}/minio/upload"
      }
    }
  ]
}
```

## Testing Script PHP

Buat file `test-minio.php` di root project:

```php
<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Storage;

try {
    echo "=== MinIO Connection Test ===\n\n";

    // Test 1: Connection
    echo "1. Testing connection...\n";
    $files = Storage::disk('minio')->files();
    echo "   ✓ Connection successful! Files count: " . count($files) . "\n\n";

    // Test 2: Upload dummy file
    echo "2. Testing upload dummy file...\n";
    $content = "Test file created at " . now()->toDateTimeString();
    $filename = 'test_' . time() . '.txt';
    Storage::disk('minio')->put('test-files/' . $filename, $content);
    echo "   ✓ Upload successful! File: test-files/$filename\n\n";

    // Test 3: List files
    echo "3. Testing list files...\n";
    $allFiles = Storage::disk('minio')->allFiles();
    echo "   ✓ Total files: " . count($allFiles) . "\n";
    foreach ($allFiles as $file) {
        $size = Storage::disk('minio')->size($file);
        echo "     - $file ($size bytes)\n";
    }
    echo "\n";

    // Test 4: Get file info
    echo "4. Testing get file info...\n";
    if (!empty($allFiles)) {
        $testFile = $allFiles[0];
        $size = Storage::disk('minio')->size($testFile);
        $lastModified = Storage::disk('minio')->lastModified($testFile);
        $url = Storage::disk('minio')->url($testFile);
        echo "   File: $testFile\n";
        echo "   Size: $size bytes\n";
        echo "   Last Modified: " . date('Y-m-d H:i:s', $lastModified) . "\n";
        echo "   URL: $url\n\n";
    }

    // Test 5: Delete file
    echo "5. Testing delete file...\n";
    if (Storage::disk('minio')->exists('test-files/' . $filename)) {
        Storage::disk('minio')->delete('test-files/' . $filename);
        echo "   ✓ File deleted successfully!\n\n";
    }

    echo "=== All tests passed! ===\n";

} catch (\Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo "\nTips:\n";
    echo "- Pastikan MinIO server sudah berjalan\n";
    echo "- Cek konfigurasi di file .env\n";
    echo "- Pastikan bucket 'xbossone' sudah dibuat\n";
}
```

Jalankan script:
```bash
php test-minio.php
```

## Troubleshooting

### Error: "Could not connect to MinIO"

**Penyebab:**
- MinIO server tidak berjalan
- Endpoint salah

**Solusi:**
1. Pastikan MinIO server sudah berjalan
2. Cek `AWS_ENDPOINT` di `.env` file
3. Test dengan curl: `curl http://localhost:9000/minio/health/live`

### Error: "The bucket does not exist"

**Penyebab:**
- Bucket belum dibuat di MinIO

**Solusi:**
1. Buka MinIO Console: http://localhost:9001
2. Login dengan credentials
3. Buat bucket dengan nama `xbossone`

### Error: "Access Denied"

**Penyebab:**
- Access Key atau Secret Key salah
- User tidak punya permission ke bucket

**Solusi:**
1. Cek `AWS_ACCESS_KEY_ID` dan `AWS_SECRET_ACCESS_KEY` di `.env`
2. Pastikan credentials sama dengan yang di MinIO Console
3. Cek policy bucket di MinIO Console

### Error: "Class not found"

**Penyebab:**
- Package belum terinstall

**Solusi:**
```bash
composer require league/flysystem-aws-s3-v3 "^3.0"
```

## Next Steps

Setelah testing berhasil, Anda bisa:

1. **Integrasi dengan fitur existing**:
   - Upload attachment di cashflow
   - Upload dokumen karyawan
   - Upload file inventaris

2. **Tambahkan fitur**:
   - Image resizing untuk upload foto
   - Preview file PDF/image
   - Bulk upload/download

3. **Security**:
   - Tambahkan validation file type
   - Limit file size
   - Scan virus/malware

4. **Monitoring**:
   - Log upload/download activity
   - Track storage usage
   - Alert jika storage hampir penuh

---

**Created:** 2025-12-16
**Project:** Super Apps XBoss
**Version:** 1.0
