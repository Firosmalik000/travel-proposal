<?php

namespace App\Services;

use Mpdf\Mpdf;
use Illuminate\Support\Facades\View;

class InventarisPdfService
{
    protected $mpdf;

    public function __construct()
    {
        $this->mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'orientation' => 'L', // Landscape for inventaris data
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
     * Generate PDF for inventaris report
     *
     * @param array $inventaris
     * @param array $filters
     * @return string PDF content
     */
    public function generateInventarisPdf(array $inventaris, array $filters)
    {
        // Calculate totals
        $totalJumlah = 0;
        $barangBaik = 0;
        $barangRusak = 0;

        foreach ($inventaris as $item) {
            $totalJumlah += $item['jumlah'];

            if ($item['kondisi'] === 'Baik') {
                $barangBaik++;
            } else {
                $barangRusak++;
            }
        }

        // Prepare data for view
        $data = [
            'inventaris' => $inventaris,
            'filters' => $filters,
            'totalBarang' => count($inventaris),
            'totalJumlah' => $totalJumlah,
            'barangBaik' => $barangBaik,
            'barangRusak' => $barangRusak,
            'generatedAt' => now(),
            'documentId' => 'INV-' . substr(time(), -8),
        ];

        // Set header (will appear on all pages)
        $header = View::make('pdf.inventaris-export.header', $data)->render();
        $this->mpdf->SetHTMLHeader($header);

        // Set footer (will appear on all pages)
        $footer = View::make('pdf.inventaris-export.footer', $data)->render();
        $this->mpdf->SetHTMLFooter($footer);

        // Render the body content
        $html = View::make('pdf.inventaris-export.body', $data)->render();

        // Write HTML to PDF
        $this->mpdf->WriteHTML($html);

        // Return PDF as string
        return $this->mpdf->Output('', 'S');
    }

    /**
     * Download PDF
     *
     * @param array $inventaris
     * @param array $filters
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadInventarisPdf(array $inventaris, array $filters, ?string $filename = null)
    {
        $this->generateInventarisPdf($inventaris, $filters);

        if (!$filename) {
            $filename = 'Laporan-Inventaris-' . date('Y-m-d') . '.pdf';
        }

        return $this->mpdf->Output($filename, 'D');
    }

    /**
     * Stream PDF to browser
     *
     * @param array $inventaris
     * @param array $filters
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function streamInventarisPdf(array $inventaris, array $filters, ?string $filename = null)
    {
        $this->generateInventarisPdf($inventaris, $filters);

        if (!$filename) {
            $filename = 'Laporan-Inventaris-' . date('Y-m-d') . '.pdf';
        }

        return $this->mpdf->Output($filename, 'I');
    }
}
