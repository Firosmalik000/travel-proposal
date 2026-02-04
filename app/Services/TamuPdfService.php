<?php

namespace App\Services;

use Mpdf\Mpdf;
use Illuminate\Support\Facades\View;

class TamuPdfService
{
    protected $mpdf;

    public function __construct()
    {
        $this->mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'orientation' => 'L', // Landscape untuk lebih lebar
            'margin_left' => 15,
            'margin_right' => 15,
            'margin_top' => 50,
            'margin_bottom' => 25,
            'margin_header' => 10,
            'margin_footer' => 10,
            'default_font_size' => 9,
            'default_font' => 'dejavusans',
        ]);
    }

    /**
     * Generate PDF for karyawan report
     *
     * @param array $karyawan
     * @param array $filters
     * @return string PDF content
     */
    public function generateTamuPdf(array $tamu, array $filters = [])
    {
        // Prepare data for view
        $data = [
            'tamu' => $tamu,
            'filters' => $filters,
            'generatedAt' => now(),
            'documentId' => 'TAM-' . substr(time(), -8),
            'totalTamu' => count($tamu),
        ];

        // Set header (will appear on all pages)
        $header = View::make('pdf.data-tamu.header', $data)->render();
        $this->mpdf->SetHTMLHeader($header);

        // Set footer (will appear on all pages)
        $footer = View::make('pdf.data-tamu.footer', $data)->render();
        $this->mpdf->SetHTMLFooter($footer);

        // Render the body content
        $html = View::make('pdf.data-tamu.body', $data)->render();

        // Write HTML to PDF
        $this->mpdf->WriteHTML($html);

        // Return PDF as string
        return $this->mpdf->Output('', 'S');
    }

    /**
     * Download PDF
     *
     * @param array $tamu
     * @param array $filters
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadTamuPdf(array $tamu, array $filters = [], ?string $filename = null)
    {
        $this->generateTamuPdf($tamu, $filters);

        if (!$filename) {
            $filename = 'Laporan-Master-Tamu-' . date('Y-m-d') . '.pdf';
        }

        return $this->mpdf->Output($filename, 'D');
    }

    /**
     * Stream PDF to browser
     *
     * @param array $tamu
     * @param array $filters
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function streamTamuPdf(array $tamu, array $filters = [], ?string $filename = null)
    {
        $this->generateTamuPdf($tamu, $filters);

        if (!$filename) {
            $filename = 'Laporan-Master-Tamu-' . date('Y-m-d') . '.pdf';
        }

        return $this->mpdf->Output($filename, 'I');
    }

}
