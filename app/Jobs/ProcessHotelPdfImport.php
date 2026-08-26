<?php

namespace App\Jobs;

use App\Services\HotelImport\HotelPdfImportProcessor;
use App\Services\HotelImport\HotelPdfImportStatusStore;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProcessHotelPdfImport implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 180;

    public function __construct(
        public readonly string $importId,
        public readonly int $userId,
        public readonly string $storedPath,
        public readonly string $fileName,
        public readonly ?int $defaultCountryId,
        public readonly ?string $defaultCurrency,
    ) {}

    public function handle(
        HotelPdfImportProcessor $processor,
        HotelPdfImportStatusStore $statusStore,
    ): void {
        $statusStore->put($this->importId, [
            'user_id' => $this->userId,
            'status' => 'processing',
            'message' => 'PDF sedang dibaca dan dikonversi menjadi draft hotel.',
        ]);

        try {
            $result = $processor->handle(
                Storage::disk('local')->path($this->storedPath),
                $this->defaultCountryId,
                $this->defaultCurrency,
            );

            $statusStore->put($this->importId, [
                'user_id' => $this->userId,
                'status' => 'completed',
                'result' => $result,
            ]);
        } catch (Throwable $exception) {
            Log::error('Queued hotel PDF import failed', [
                'import_id' => $this->importId,
                'file_name' => $this->fileName,
                'message' => $exception->getMessage(),
                'exception' => get_class($exception),
            ]);

            $statusStore->put($this->importId, [
                'user_id' => $this->userId,
                'status' => 'failed',
                'message' => $exception->getMessage(),
            ]);
        } finally {
            Storage::disk('local')->delete($this->storedPath);
        }
    }
}
