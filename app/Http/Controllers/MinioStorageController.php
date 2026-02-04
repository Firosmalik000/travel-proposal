<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class MinioStorageController extends Controller
{
    /**
     * Upload file ke MinIO
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function upload(Request $request): JsonResponse
    {
        try {
            $disk = config('filesystems.default');
            $request->validate([
                'file' => 'required|file|max:10240', // max 10MB
            ]);

            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();

            // Upload ke storage default
            $path = Storage::disk($disk)->putFileAs(
                'uploads',
                $file,
                $fileName
            );

            // Generate URL
            $url = Storage::disk($disk)->url($path);

            return response()->json([
                'success' => true,
                'message' => 'File berhasil diupload',
                'data' => [
                    'path' => $path,
                    'url' => $url,
                    'filename' => $fileName,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download file dari MinIO
     *
     * @param string $path
     * @return \Symfony\Component\HttpFoundation\StreamedResponse|JsonResponse
     */
    public function download(string $path)
    {
        try {
            $disk = config('filesystems.default');

            if (!Storage::disk($disk)->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan'
                ], 404);
            }

            return Storage::disk($disk)->download($path);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Download gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hapus file dari MinIO
     *
     * @param string $path
     * @return JsonResponse
     */
    public function delete(string $path): JsonResponse
    {
        try {
            $disk = config('filesystems.default');

            if (!Storage::disk($disk)->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan'
                ], 404);
            }

            Storage::disk($disk)->delete($path);

            return response()->json([
                'success' => true,
                'message' => 'File berhasil dihapus'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Hapus file gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * List semua file di MinIO
     *
     * @param string $directory
     * @return JsonResponse
     */
    public function listFiles(string $directory = ''): JsonResponse
    {
        try {
            $disk = config('filesystems.default');
            $files = Storage::disk($disk)->files($directory);
            $directories = Storage::disk($disk)->directories($directory);

            $fileDetails = array_map(function($file) {
                return [
                    'path' => $file,
                    'size' => Storage::disk(config('filesystems.default'))->size($file),
                    'last_modified' => Storage::disk(config('filesystems.default'))->lastModified($file),
                    'url' => Storage::disk(config('filesystems.default'))->url($file),
                ];
            }, $files);

            return response()->json([
                'success' => true,
                'data' => [
                    'files' => $fileDetails,
                    'directories' => $directories,
                    'current_directory' => $directory ?: 'root'
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'List files gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get URL file di MinIO (temporary URL)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getTemporaryUrl(Request $request): JsonResponse
    {
        try {
            $disk = config('filesystems.default');
            $request->validate([
                'path' => 'required|string',
                'expires' => 'nullable|integer|min:1|max:10080' // max 7 hari
            ]);

            $path = $request->input('path');
            $expires = $request->input('expires', 60); // default 60 menit

            if (!Storage::disk($disk)->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan'
                ], 404);
            }

            // Generate temporary URL yang expire setelah waktu tertentu
            $url = Storage::disk($disk)->temporaryUrl(
                $path,
                now()->addMinutes($expires)
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $url,
                    'expires_at' => now()->addMinutes($expires)->toDateTimeString(),
                    'expires_in_minutes' => $expires
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Generate URL gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get file info
     *
     * @param string $path
     * @return JsonResponse
     */
    public function getFileInfo(string $path): JsonResponse
    {
        try {
            $disk = config('filesystems.default');

            if (!Storage::disk($disk)->exists($path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'path' => $path,
                    'size' => Storage::disk($disk)->size($path),
                    'size_human' => $this->formatBytes(Storage::disk($disk)->size($path)),
                    'last_modified' => Storage::disk($disk)->lastModified($path),
                    'last_modified_date' => date('Y-m-d H:i:s', Storage::disk($disk)->lastModified($path)),
                    'url' => Storage::disk($disk)->url($path),
                    'mime_type' => Storage::disk($disk)->mimeType($path),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Get file info gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper function untuk format bytes
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
