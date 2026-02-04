<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Trait for handling MinIO file uploads
 *
 * Usage:
 * 1. Add 'use HasMinioUpload;' to your controller
 * 2. Call $this->uploadToMinio($file, 'folder-name')
 * 3. Call $this->deleteFromMinio($path)
 */
trait HasMinioUpload
{
    /**
     * Upload file to MinIO
     *
     * @param UploadedFile $file
     * @param string $folder Folder name in MinIO bucket
     * @param string|null $prefix Custom prefix for filename (default: folder name)
     * @return string|false Path to uploaded file or false on failure
     */
    protected function uploadToMinio(UploadedFile $file, string $folder, ?string $prefix = null): string|false
    {
        if (!$file->isValid()) {
            \Log::warning('Invalid file upload attempted', [
                'original_name' => $file->getClientOriginalName(),
            ]);
            return false;
        }

        try {
            $prefix = $prefix ?? $folder;
            $filename = $prefix . '-' . time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();

            \Log::info("Uploading file to MinIO", [
                'folder' => $folder,
                'filename' => $filename,
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ]);

            $path = Storage::disk('minio')->putFileAs($folder, $file, $filename);

            if ($path) {
                \Log::info("✅ File uploaded to MinIO successfully", ['path' => $path]);
                return $path;
            }

            \Log::error("❌ MinIO upload returned false/null");
            return false;

        } catch (\Exception $e) {
            \Log::error("❌ MinIO upload failed", [
                'error' => $e->getMessage(),
                'file' => $file->getClientOriginalName(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Upload multiple files to MinIO
     *
     * @param array $files Array of UploadedFile instances
     * @param string $folder Folder name in MinIO bucket
     * @param string|null $prefix Custom prefix for filename
     * @return array Array of uploaded file paths
     */
    protected function uploadMultipleToMinio(array $files, string $folder, ?string $prefix = null): array
    {
        $uploadedPaths = [];

        foreach ($files as $index => $file) {
            if ($file && $file instanceof UploadedFile && $file->isValid()) {
                $path = $this->uploadToMinio($file, $folder, $prefix);

                if ($path) {
                    $uploadedPaths[] = $path;
                } else {
                    \Log::warning("Failed to upload file #{$index}");
                }
            }
        }

        return $uploadedPaths;
    }

    /**
     * Delete file from MinIO
     *
     * @param string $path File path in MinIO
     * @return bool Success status
     */
    protected function deleteFromMinio(string $path): bool
    {
        try {
            if (empty($path)) {
                return false;
            }

            $result = Storage::disk('minio')->delete($path);

            if ($result) {
                \Log::info("Deleted file from MinIO: {$path}");
            } else {
                \Log::warning("Failed to delete file from MinIO (may not exist): {$path}");
            }

            return $result;

        } catch (\Exception $e) {
            \Log::error("Failed to delete file from MinIO: {$path}", [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Delete multiple files from MinIO
     *
     * @param array $paths Array of file paths
     * @return int Number of successfully deleted files
     */
    protected function deleteMultipleFromMinio(array $paths): int
    {
        $deletedCount = 0;

        foreach ($paths as $path) {
            if ($this->deleteFromMinio($path)) {
                $deletedCount++;
            }
        }

        return $deletedCount;
    }

    /**
     * Get MinIO URL for a file path
     *
     * @param string|null $path File path in MinIO
     * @return string|null Public URL or null if path is empty
     */
    protected function getMinioUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        try {
            return Storage::disk('minio')->url($path);
        } catch (\Exception $e) {
            \Log::warning("Failed to generate MinIO URL for: {$path}", [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get MinIO URLs for multiple file paths
     *
     * @param array|null $paths Array of file paths
     * @return array|null Array of URLs or null if paths is empty
     */
    protected function getMinioUrls(?array $paths): ?array
    {
        if (empty($paths) || !is_array($paths)) {
            return null;
        }

        $urls = array_map(function ($path) {
            return $this->getMinioUrl($path);
        }, $paths);

        // Filter out null values
        $urls = array_filter($urls);

        return !empty($urls) ? array_values($urls) : null;
    }

    /**
     * Get temporary MinIO URL (expires after specified time)
     *
     * @param string $path File path in MinIO
     * @param int $minutes Expiration time in minutes (default: 30)
     * @return string|null Temporary URL or null on failure
     */
    protected function getMinioTemporaryUrl(string $path, int $minutes = 30): ?string
    {
        try {
            return Storage::disk('minio')->temporaryUrl($path, now()->addMinutes($minutes));
        } catch (\Exception $e) {
            \Log::warning("Failed to generate temporary MinIO URL for: {$path}", [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Replace old file with new file in MinIO
     * Deletes old file if it exists, then uploads new file
     *
     * @param UploadedFile $newFile New file to upload
     * @param string|null $oldPath Path to old file (will be deleted)
     * @param string $folder Folder name in MinIO bucket
     * @param string|null $prefix Custom prefix for filename
     * @return string|false Path to new uploaded file or false on failure
     */
    protected function replaceFileInMinio(UploadedFile $newFile, ?string $oldPath, string $folder, ?string $prefix = null): string|false
    {
        // Upload new file first
        $newPath = $this->uploadToMinio($newFile, $folder, $prefix);

        if (!$newPath) {
            return false;
        }

        // Delete old file if it exists
        if ($oldPath) {
            $this->deleteFromMinio($oldPath);
        }

        return $newPath;
    }
}
