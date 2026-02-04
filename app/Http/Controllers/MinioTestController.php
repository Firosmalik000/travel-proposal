<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            $disk = config('filesystems.default');

            // Test apakah storage default dapat diakses
            $files = Storage::disk($disk)->files();

            return response()->json([
                'success' => true,
                'message' => 'Koneksi storage berhasil!',
                'data' => [
                    'disk' => $disk,
                    'root' => config("filesystems.disks.{$disk}.root"),
                    'url' => config("filesystems.disks.{$disk}.url"),
                    'visibility' => config("filesystems.disks.{$disk}.visibility"),
                    'files_count' => count($files),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Koneksi storage gagal!',
                'error' => $e->getMessage(),
                'tips' => [
                    'Pastikan folder storage dapat ditulis',
                    'Cek FILESYSTEM_DISK di file .env',
                    'Jalankan php artisan storage:link jika perlu'
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
            $disk = config('filesystems.default');

            // Buat file dummy
            $content = "Test file created at " . now()->toDateTimeString();
            $filename = 'test_' . time() . '.txt';

            // Upload ke storage default
            $path = Storage::disk($disk)->put('test-files/' . $filename, $content);

            // Get URL
            $url = Storage::disk($disk)->url('test-files/' . $filename);

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
            $disk = config('filesystems.default');
            $allFiles = Storage::disk($disk)->allFiles();
            $directories = Storage::disk($disk)->allDirectories();

            $fileDetails = [];
            foreach ($allFiles as $file) {
                $fileDetails[] = [
                    'path' => $file,
                    'size' => Storage::disk($disk)->size($file),
                    'size_human' => $this->formatBytes(Storage::disk($disk)->size($file)),
                    'last_modified' => date('Y-m-d H:i:s', Storage::disk($disk)->lastModified($file)),
                    'url' => Storage::disk($disk)->url($file),
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
            $disk = config('filesystems.default');
            $path = $request->input('path');

            if (!$path) {
                return response()->json([
                    'success' => false,
                    'message' => 'Path file harus diisi'
                ], 400);
            }

            if (!Storage::disk($disk)->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan: ' . $path
                ], 404);
            }

            Storage::disk($disk)->delete($path);

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
        $disk = config('filesystems.default');

        return response()->json([
            'success' => true,
            'data' => [
                'php_version' => phpversion(),
                'laravel_version' => app()->version(),
                'storage_config' => [
                    'disk' => $disk,
                    'root' => config("filesystems.disks.{$disk}.root"),
                    'url' => config("filesystems.disks.{$disk}.url"),
                    'visibility' => config("filesystems.disks.{$disk}.visibility"),
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
