<?php

namespace App\Services;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;
use Mpdf\Mpdf;

class PdfRenderer
{
    /**
     * @param  array<string, mixed>  $configOverrides
     */
    public function __construct(private array $configOverrides = []) {}

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $headerData
     * @param  array<string, mixed>  $footerData
     */
    public function renderInline(
        string $view,
        array $data,
        string $filename,
        array $mpdfConfig = [],
        ?string $headerView = null,
        array $headerData = [],
        ?string $footerView = null,
        array $footerData = [],
    ): Response {
        $html = view($view, $data)->render();

        $tmpDir = storage_path('app/mpdf');
        if (! File::exists($tmpDir)) {
            File::makeDirectory($tmpDir, recursive: true);
        }

        $mpdf = new Mpdf(array_merge([
            'mode' => 'utf-8',
            'format' => 'A4',
            'tempDir' => $tmpDir,
            'default_font' => 'dejavusans',
            'margin_top' => 18,
            'margin_bottom' => 18,
            'margin_left' => 12,
            'margin_right' => 12,
        ], $this->configOverrides, $mpdfConfig));

        $mpdf->SetTitle($filename);

        if (is_string($headerView) && $headerView !== '') {
            $mpdf->SetHTMLHeader(view($headerView, $headerData)->render());
        }

        if (is_string($footerView) && $footerView !== '') {
            $mpdf->SetHTMLFooter(view($footerView, $footerData)->render());
        }

        $mpdf->WriteHTML($html);

        /** @var string $pdf */
        $pdf = $mpdf->Output('', 'S');

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'Cache-Control' => 'private, max-age=0, must-revalidate',
            'Pragma' => 'public',
        ]);
    }
}
