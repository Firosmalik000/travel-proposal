# MinIO S3 Object Storage - Setup Guide

Dokumentasi lengkap konfigurasi dan penggunaan MinIO S3 Object Storage di project Super Apps XBoss.

## Kredensial MinIO

```
Access Key : LHCHE7ZNYALNZHXE83K5
Secret Key : 3oHgDx5ytOaXsGjk4kdMjbaAwxFsA6kso8lw2Q5u
Console Username : xbossindonesia
Console Password : 5Ee[.-#gERx0
Bucket Name : xbossone
Endpoint (Local Testing) : http://localhost:9000
```

## 1. Instalasi Package

Pertama, install package AWS S3 Flysystem untuk Laravel:

```bash
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies
```

## 2. Konfigurasi File

### 2.1 File .env

Konfigurasi berikut sudah ditambahkan ke file `.env`:

```env
AWS_ACCESS_KEY_ID=LHCHE7ZNYALNZHXE83K5
AWS_SECRET_ACCESS_KEY=3oHgDx5ytOaXsGjk4kdMjbaAwxFsA6kso8lw2Q5u
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=xbossone
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_ENDPOINT=http://localhost:9000
```

**Catatan untuk Production:**
- Ganti `AWS_ENDPOINT` dengan URL MinIO server production Anda
- Pastikan `AWS_USE_PATH_STYLE_ENDPOINT=true` untuk kompatibilitas MinIO

### 2.2 File config/filesystems.php

Disk MinIO sudah ditambahkan ke konfigurasi filesystem:

```php
'minio' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'bucket' => env('AWS_BUCKET'),
    'endpoint' => env('AWS_ENDPOINT', 'http://localhost:9000'),
    'use_path_style_endpoint' => true,
    'throw' => false,
    'report' => false,
],
```

## 3. Setup MinIO Server (Lokal)

### Menggunakan Docker

```bash
# Pull image MinIO
docker pull minio/minio

# Jalankan MinIO server
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=xbossindonesia" \
  -e "MINIO_ROOT_PASSWORD=5Ee[.-#gERx0" \
  -v minio_data:/data \
  minio/minio server /data --console-address ":9001"
```

### Akses MinIO Console

1. Buka browser: http://localhost:9001
2. Login dengan:
   - Username: `xbossindonesia`
   - Password: `5Ee[.-#gERx0`
3. Buat bucket dengan nama: `xbossone`

## 4. API Routes

Routes berikut sudah tersedia di `routes/web.php`:

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/minio/upload` | Upload file ke MinIO |
| GET | `/minio/download/{path}` | Download file dari MinIO |
| DELETE | `/minio/delete/{path}` | Hapus file dari MinIO |
| GET | `/minio/list/{directory?}` | List files di directory |
| POST | `/minio/temporary-url` | Generate temporary URL |
| GET | `/minio/info/{path}` | Get file information |

## 5. Contoh Penggunaan

### 5.1 Upload File

```php
use Illuminate\Support\Facades\Storage;

// Upload file
$file = $request->file('document');
$path = Storage::disk('minio')->putFileAs(
    'documents',
    $file,
    'my-document.pdf'
);

// Get URL
$url = Storage::disk('minio')->url($path);
```

### 5.2 Download File

```php
// Download file
return Storage::disk('minio')->download('documents/my-document.pdf');

// Download dengan nama custom
return Storage::disk('minio')->download('documents/my-document.pdf', 'custom-name.pdf');
```

### 5.3 Delete File

```php
// Hapus single file
Storage::disk('minio')->delete('documents/my-document.pdf');

// Hapus multiple files
Storage::disk('minio')->delete([
    'documents/file1.pdf',
    'documents/file2.pdf'
]);
```

### 5.4 List Files

```php
// List semua files di directory
$files = Storage::disk('minio')->files('documents');

// List files recursive
$files = Storage::disk('minio')->allFiles('documents');

// List directories
$directories = Storage::disk('minio')->directories('documents');
```

### 5.5 Generate Temporary URL

```php
// URL yang expire dalam 60 menit
$url = Storage::disk('minio')->temporaryUrl(
    'documents/my-document.pdf',
    now()->addMinutes(60)
);
```

### 5.6 File Operations

```php
// Cek apakah file exists
if (Storage::disk('minio')->exists('documents/my-document.pdf')) {
    // File exists
}

// Get file size
$size = Storage::disk('minio')->size('documents/my-document.pdf');

// Get last modified time
$lastModified = Storage::disk('minio')->lastModified('documents/my-document.pdf');

// Get MIME type
$mimeType = Storage::disk('minio')->mimeType('documents/my-document.pdf');
```

## 6. Testing dengan cURL

### Upload File

```bash
curl -X POST http://localhost:8000/minio/upload \
  -H "Content-Type: multipart/form-data" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

### List Files

```bash
curl -X GET http://localhost:8000/minio/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get File Info

```bash
curl -X GET http://localhost:8000/minio/info/uploads/file.pdf \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Generate Temporary URL

```bash
curl -X POST http://localhost:8000/minio/temporary-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"path": "uploads/file.pdf", "expires": 60}'
```

### Download File

```bash
curl -X GET http://localhost:8000/minio/download/uploads/file.pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded-file.pdf
```

### Delete File

```bash
curl -X DELETE http://localhost:8000/minio/delete/uploads/file.pdf \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 7. Testing dengan Postman

### Setup Environment

Buat environment variables di Postman:

```
base_url: http://localhost:8000
token: YOUR_AUTH_TOKEN
```

### Collection Tests

Import collection berikut ke Postman:

**1. Upload File**
- Method: POST
- URL: `{{base_url}}/minio/upload`
- Headers: `Authorization: Bearer {{token}}`
- Body: form-data dengan key `file` (type: File)

**2. List Files**
- Method: GET
- URL: `{{base_url}}/minio/list`
- Headers: `Authorization: Bearer {{token}}`

**3. Get File Info**
- Method: GET
- URL: `{{base_url}}/minio/info/uploads/filename.pdf`
- Headers: `Authorization: Bearer {{token}}`

## 8. Contoh Penggunaan di Controller Lain

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,doc,docx|max:5120'
        ]);

        try {
            // Upload ke MinIO
            $file = $request->file('document');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = Storage::disk('minio')->putFileAs('documents', $file, $filename);

            // Simpan ke database
            $document = Document::create([
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'url' => Storage::disk('minio')->url($path),
            ]);

            return response()->json([
                'success' => true,
                'data' => $document
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function download($id)
    {
        $document = Document::findOrFail($id);

        if (!Storage::disk('minio')->exists($document->path)) {
            return response()->json([
                'success' => false,
                'message' => 'File tidak ditemukan'
            ], 404);
        }

        return Storage::disk('minio')->download($document->path, $document->name);
    }

    public function destroy($id)
    {
        $document = Document::findOrFail($id);

        try {
            // Hapus dari MinIO
            if (Storage::disk('minio')->exists($document->path)) {
                Storage::disk('minio')->delete($document->path);
            }

            // Hapus dari database
            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
```

## 9. Troubleshooting

### Error: "Class 'League\Flysystem\AwsS3V3\AwsS3V3Adapter' not found"

Solusi: Install package AWS S3
```bash
composer require league/flysystem-aws-s3-v3 "^3.0"
```

### Error: "Could not connect to MinIO"

Solusi:
1. Pastikan MinIO server berjalan
2. Cek endpoint di `.env` file
3. Pastikan port 9000 tidak diblok firewall

### Error: "The bucket does not exist"

Solusi:
1. Login ke MinIO Console (http://localhost:9001)
2. Buat bucket dengan nama yang sama dengan `AWS_BUCKET` di `.env`

### Error: "Access Denied"

Solusi:
1. Cek Access Key dan Secret Key di `.env`
2. Pastikan user memiliki permission ke bucket

## 10. Best Practices

### 10.1 Naming Convention

```php
// Good: menggunakan timestamp dan sanitized filename
$filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientExtension();

// Bad: menggunakan original filename langsung
$filename = $file->getClientOriginalName();
```

### 10.2 File Validation

```php
$request->validate([
    'file' => 'required|file|mimes:pdf,jpg,png|max:5120' // max 5MB
]);
```

### 10.3 Error Handling

```php
try {
    $path = Storage::disk('minio')->putFileAs('uploads', $file, $filename);
} catch (\Exception $e) {
    Log::error('MinIO upload failed: ' . $e->getMessage());
    return response()->json(['error' => 'Upload failed'], 500);
}
```

### 10.4 Cleanup Old Files

```php
// Schedule untuk hapus file lama
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->call(function () {
        $files = Storage::disk('minio')->files('temp');
        foreach ($files as $file) {
            if (Storage::disk('minio')->lastModified($file) < now()->subDays(7)->timestamp) {
                Storage::disk('minio')->delete($file);
            }
        }
    })->daily();
}
```

## 11. Migrasi dari Local Storage ke MinIO

Jika Anda memiliki file di local storage dan ingin migrasi ke MinIO:

```php
use Illuminate\Support\Facades\Storage;

public function migrateToMinio()
{
    $localFiles = Storage::disk('local')->allFiles('documents');

    foreach ($localFiles as $file) {
        $contents = Storage::disk('local')->get($file);
        Storage::disk('minio')->put($file, $contents);

        // Optional: hapus dari local setelah berhasil upload
        Storage::disk('local')->delete($file);
    }

    return "Migrated " . count($localFiles) . " files to MinIO";
}
```

## 12. Konfigurasi untuk Production

Untuk production, update file `.env` dengan endpoint production:

```env
AWS_ENDPOINT=https://minio.yourdomain.com
AWS_BUCKET=xbossone-production
AWS_ACCESS_KEY_ID=YOUR_PRODUCTION_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_PRODUCTION_SECRET_KEY
```

## Support

Jika ada pertanyaan atau masalah, hubungi tim development.

---

**Dibuat oleh:** Claude Code
**Tanggal:** 2025-12-16
**Project:** Super Apps XBoss
