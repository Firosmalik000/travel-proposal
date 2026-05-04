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
        return $this->render(
            view: $view,
            data: $data,
            filename: $filename,
            disposition: 'inline',
            mpdfConfig: $mpdfConfig,
            headerView: $headerView,
            headerData: $headerData,
            footerView: $footerView,
            footerData: $footerData,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $headerData
     * @param  array<string, mixed>  $footerData
     */
    public function renderDownload(
        string $view,
        array $data,
        string $filename,
        array $mpdfConfig = [],
        ?string $headerView = null,
        array $headerData = [],
        ?string $footerView = null,
        array $footerData = [],
    ): Response {
        return $this->render(
            view: $view,
            data: $data,
            filename: $filename,
            disposition: 'attachment',
            mpdfConfig: $mpdfConfig,
            headerView: $headerView,
            headerData: $headerData,
            footerView: $footerView,
            footerData: $footerData,
        );
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $mpdfConfig
     * @param  array<string, mixed>  $headerData
     * @param  array<string, mixed>  $footerData
     */
    private function render(
        string $view,
        array $data,
        string $filename,
        string $disposition,
        array $mpdfConfig = [],
        ?string $headerView = null,
        array $headerData = [],
        ?string $footerView = null,
        array $footerData = [],
    ): Response {
        $html = view($view, $data)->render();

        $tmpDir = storage_path('framework/cache');
        if (! File::exists($tmpDir)) {
            File::makeDirectory($tmpDir, recursive: true);
        }

        if (! File::isWritable($tmpDir)) {
            $tmpDir = sys_get_temp_dir();
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
            'Content-Disposition' => $disposition.'; filename="'.$filename.'"',
            'Cache-Control' => 'private, max-age=0, must-revalidate',
            'Pragma' => 'public',
        ]);
    }
}
