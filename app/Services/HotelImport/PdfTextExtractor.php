<?php

namespace App\Services\HotelImport;

use DOMDocument;
use DOMXPath;
use Illuminate\Process\Exceptions\ProcessTimedOutException;
use Illuminate\Support\Facades\Process;
use RuntimeException;
use Throwable;

class PdfTextExtractor
{
    /**
     * Extract text from PDF file with bounding box information.
     *
     * @return array<int, array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}>>
     *
     * @throws RuntimeException
     */
    public function extract(string $pdfPath): array
    {
        if (! is_file($pdfPath)) {
            throw new RuntimeException("File PDF tidak ditemukan: {$pdfPath}");
        }

        $fileSize = filesize($pdfPath);
        if ($fileSize === false || $fileSize === 0) {
            throw new RuntimeException('File PDF kosong atau tidak dapat dibaca.');
        }

        $binary = $this->resolveBinary();
        $supportsBoundingBoxes = $this->supportsBoundingBoxes($binary);
        $arguments = $supportsBoundingBoxes
            ? [$binary, '-bbox-layout', '-enc', 'UTF-8', $pdfPath, '-']
            : [$binary, '-table', '-enc', 'UTF-8', $pdfPath, '-'];

        try {
            $result = Process::timeout((int) config('services.hotel_pdf.timeout', 30))
                ->run($arguments);
        } catch (ProcessTimedOutException) {
            throw new RuntimeException('Proses membaca PDF melewati batas waktu (timeout). PDF mungkin terlalu besar atau kompleks.');
        } catch (Throwable $exception) {
            throw new RuntimeException('PDF parser dependency "pdftotext" tidak tersedia pada server.', previous: $exception);
        }

        if (! $result->successful()) {
            $error = mb_strtolower($result->errorOutput());

            if (str_contains($error, 'incorrect password') || str_contains($error, 'password required')) {
                throw new RuntimeException('PDF terenkripsi atau dilindungi password dan tidak dapat dibaca.');
            }

            if (str_contains($error, 'command not found') || str_contains($error, 'no such file')) {
                throw new RuntimeException('PDF parser "pdftotext" tidak ditemukan di server.');
            }

            throw new RuntimeException('PDF tidak valid, corrupt, atau format tidak didukung.');
        }

        return $supportsBoundingBoxes
            ? $this->parseBoundingBoxXml($result->output())
            : $this->parseLayoutText($result->output());
    }

    /**
     * @return array<int, array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}>>
     */
    public function parseBoundingBoxXml(string $xml): array
    {
        if (trim($xml) === '') {
            throw new RuntimeException('PDF ini tidak memiliki text layer yang dapat dibaca.');
        }

        $document = new DOMDocument;
        $previousErrors = libxml_use_internal_errors(true);
        $loaded = $document->loadXML($xml, LIBXML_NONET | LIBXML_NOWARNING | LIBXML_NOERROR);
        libxml_clear_errors();
        libxml_use_internal_errors($previousErrors);

        if (! $loaded) {
            throw new RuntimeException('Hasil ekstraksi PDF tidak valid.');
        }

        $xpath = new DOMXPath($document);
        $pages = [];

        foreach ($xpath->query('//*[local-name()="page"]') ?: [] as $pageIndex => $pageNode) {
            $words = [];

            foreach ($xpath->query('.//*[local-name()="word"]', $pageNode) ?: [] as $wordNode) {
                $text = trim(html_entity_decode($wordNode->textContent, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
                if ($text === '') {
                    continue;
                }

                $words[] = [
                    'text' => $text,
                    'x_min' => (float) $wordNode->attributes?->getNamedItem('xMin')?->nodeValue,
                    'y_min' => (float) $wordNode->attributes?->getNamedItem('yMin')?->nodeValue,
                    'x_max' => (float) $wordNode->attributes?->getNamedItem('xMax')?->nodeValue,
                    'y_max' => (float) $wordNode->attributes?->getNamedItem('yMax')?->nodeValue,
                ];
            }

            $pages[$pageIndex + 1] = $words;
        }

        if (collect($pages)->flatten(1)->isEmpty()) {
            throw new RuntimeException('PDF ini tampaknya berupa scan/gambar dan belum memiliki text layer yang dapat dibaca otomatis.');
        }

        return $pages;
    }

    /**
     * @return array<int, array<int, array{text: string, x_min: float, y_min: float, x_max: float, y_max: float}>>
     */
    public function parseLayoutText(string $text): array
    {
        if (trim($text) === '') {
            throw new RuntimeException('PDF ini tampaknya berupa scan/gambar dan belum memiliki text layer yang dapat dibaca otomatis.');
        }

        $pages = [];
        foreach (preg_split('/\f/', $text) ?: [] as $pageIndex => $pageText) {
            $words = [];
            foreach (preg_split('/\R/', $pageText) ?: [] as $lineIndex => $line) {
                preg_match_all('/\S+/', $line, $matches, PREG_OFFSET_CAPTURE);
                foreach ($matches[0] as [$word, $offset]) {
                    $words[] = [
                        'text' => (string) $word,
                        'x_min' => (float) $offset * 6,
                        'y_min' => (float) $lineIndex * 12,
                        'x_max' => (float) ($offset + mb_strlen((string) $word)) * 6,
                        'y_max' => ((float) $lineIndex * 12) + 10,
                        'layout_fallback' => true,
                    ];
                }
            }
            if ($words !== []) {
                $pages[$pageIndex + 1] = $words;
            }
        }

        if ($pages === []) {
            throw new RuntimeException('PDF ini tampaknya berupa scan/gambar dan belum memiliki text layer yang dapat dibaca otomatis.');
        }

        return $pages;
    }

    private function supportsBoundingBoxes(string $binary): bool
    {
        static $capabilities = [];

        if (! array_key_exists($binary, $capabilities)) {
            try {
                $result = Process::timeout(5)->run([$binary, '-h']);
                $help = $result->output().$result->errorOutput();
                $normalizedHelp = mb_strtolower($help);

                if (
                    trim($help) === ''
                    || str_contains($normalizedHelp, 'cannot find the path')
                    || str_contains($normalizedHelp, 'command not found')
                    || str_contains($normalizedHelp, 'no such file')
                ) {
                    throw new RuntimeException('Binary pdftotext tidak dapat dijalankan.');
                }

                $capabilities[$binary] = str_contains($help, '-bbox-layout');
            } catch (Throwable $exception) {
                throw new RuntimeException('PDF parser dependency "pdftotext" tidak tersedia pada server.', previous: $exception);
            }
        }

        return $capabilities[$binary];
    }

    private function resolveBinary(): string
    {
        $configured = (string) config('services.hotel_pdf.pdftotext_binary', 'pdftotext');
        if ($configured !== 'pdftotext') {
            return $configured;
        }

        $commonWindowsPath = 'C:\\laragon\\bin\\git\\mingw64\\bin\\pdftotext.exe';

        return PHP_OS_FAMILY === 'Windows' && is_file($commonWindowsPath)
            ? $commonWindowsPath
            : $configured;
    }
}
