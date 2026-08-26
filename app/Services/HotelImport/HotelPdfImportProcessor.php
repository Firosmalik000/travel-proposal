<?php

namespace App\Services\HotelImport;

use App\Models\HotelCity;
use App\Models\HotelCountry;
use RuntimeException;

class HotelPdfImportProcessor
{
    public function __construct(
        private readonly PdfTextExtractor $pdfTextExtractor,
        private readonly HotelRatePdfParser $hotelRatePdfParser,
        private readonly HotelImportReconciliationService $hotelImportReconciliationService,
    ) {}

    /** @return array<string, mixed> */
    public function handle(
        string $pdfFullPath,
        ?int $defaultCountryId = null,
        ?string $defaultCurrency = null,
    ): array {
        if (! is_file($pdfFullPath)) {
            throw new RuntimeException('File PDF import tidak ditemukan.');
        }

        $pages = $this->pdfTextExtractor->extract($pdfFullPath);
        if ($pages === []) {
            throw new RuntimeException('PDF tidak mengandung text yang dapat dibaca.');
        }

        $defaultCountry = $defaultCountryId !== null
            ? HotelCountry::query()->find($defaultCountryId)?->name
            : null;
        $knownCities = HotelCity::query()->where('is_active', true)->pluck('name')->all();
        $rows = $this->hotelRatePdfParser->parse(
            $pages,
            $defaultCountry,
            $defaultCurrency,
            $knownCities,
        );

        if ($rows === []) {
            throw new RuntimeException('Tidak ada tabel rate hotel yang terdeteksi di PDF.');
        }

        return [
            'rows' => $rows,
            ...$this->hotelImportReconciliationService->reconcile(
                $rows,
                $defaultCountryId,
                $defaultCurrency,
            ),
        ];
    }
}
