<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MinioTestController extends Controller
{
    /**
     * Test page untuk upload file ke MinIO
     */
    public function index()
    {
        return view('minio-test');
    }

    /**
     * Test koneksi ke MinIO
     */
    public function testConnection()
    {
        try {
            // Test apakah bisa akses MinIO
            $files = Storage::disk('minio')->files();

            return response()->json([
                'success' => true,
                'message' => 'Koneksi ke MinIO berhasil!',
                'data' => [
                    'disk' => 'minio',
                    'endpoint' => config('filesystems.disks.minio.endpoint'),
                    'bucket' => config('filesystems.disks.minio.bucket'),
                    'files_count' => count($files),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Koneksi ke MinIO gagal!',
                'error' => $e->getMessage(),
                'tips' => [
                    'Pastikan MinIO server sudah berjalan',
                    'Cek endpoint di file .env',
                    'Cek Access Key dan Secret Key',
                    'Pastikan bucket sudah dibuat di MinIO Console'
                ]
            ], 500);
        }
    }

    /**
     * Test upload file dummy
     */
    public function testUploadDummy()
    {
        try {
            // Buat file dummy
            $content = "Test file created at " . now()->toDateTimeString();
            $filename = 'test_' . time() . '.txt';

            // Upload ke MinIO
            $path = Storage::disk('minio')->put('test-files/' . $filename, $content);

            // Get URL
            $url = Storage::disk('minio')->url('test-files/' . $filename);

            return response()->json([
                'success' => true,
                'message' => 'Upload dummy file berhasil!',
                'data' => [
                    'path' => 'test-files/' . $filename,
                    'url' => $url,
                    'content' => $content,
                    'size' => strlen($content) . ' bytes'
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload dummy file gagal!',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test list files
     */
    public function testListFiles()
    {
        try {
            $allFiles = Storage::disk('minio')->allFiles();
            $directories = Storage::disk('minio')->allDirectories();

            $fileDetails = [];
            foreach ($allFiles as $file) {
                $fileDetails[] = [
                    'path' => $file,
                    'size' => Storage::disk('minio')->size($file),
                    'size_human' => $this->formatBytes(Storage::disk('minio')->size($file)),
                    'last_modified' => date('Y-m-d H:i:s', Storage::disk('minio')->lastModified($file)),
                    'url' => Storage::disk('minio')->url($file),
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'List files berhasil!',
                'data' => [
                    'total_files' => count($fileDetails),
                    'total_directories' => count($directories),
                    'files' => $fileDetails,
                    'directories' => $directories,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'List files gagal!',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test delete file
     */
    public function testDelete(Request $request)
    {
        try {
            $path = $request->input('path');

            if (!$path) {
                return response()->json([
                    'success' => false,
                    'message' => 'Path file harus diisi'
                ], 400);
            }

            if (!Storage::disk('minio')->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan: ' . $path
                ], 404);
            }

            Storage::disk('minio')->delete($path);

            return response()->json([
                'success' => true,
                'message' => 'File berhasil dihapus: ' . $path
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete file gagal!',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get system info
     */
    public function systemInfo()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'php_version' => phpversion(),
                'laravel_version' => app()->version(),
                'minio_config' => [
                    'endpoint' => config('filesystems.disks.minio.endpoint'),
                    'bucket' => config('filesystems.disks.minio.bucket'),
                    'region' => config('filesystems.disks.minio.region'),
                    'access_key' => Str::mask(config('filesystems.disks.minio.key'), '*', 3, -3),
                ],
                'packages' => [
                    'flysystem_aws_s3' => class_exists('League\Flysystem\AwsS3V3\AwsS3V3Adapter') ? 'Installed' : 'Not Installed',
                    'aws_sdk' => class_exists('Aws\S3\S3Client') ? 'Installed' : 'Not Installed',
                ]
            ]
        ], 200);
    }

    /**
     * Helper function
     */
    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
