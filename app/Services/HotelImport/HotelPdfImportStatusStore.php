<?php

namespace App\Services\HotelImport;

use Illuminate\Support\Facades\Cache;

class HotelPdfImportStatusStore
{
    /** @param array<string, mixed> $status */
    public function put(string $importId, array $status): void
    {
        Cache::put($this->key($importId), $status, now()->addHours(2));
    }

    /** @return array<string, mixed>|null */
    public function get(string $importId): ?array
    {
        $status = Cache::get($this->key($importId));

        return is_array($status) ? $status : null;
    }

    public function forget(string $importId): void
    {
        Cache::forget($this->key($importId));
    }

    private function key(string $importId): string
    {
        return "hotel-pdf-import:{$importId}";
    }
}
