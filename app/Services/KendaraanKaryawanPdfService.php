<?php

namespace App\Services;

use Mpdf\Mpdf;
use Illuminate\Support\Facades\View;

class KendaraanKaryawanPdfService
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
     * Generate PDF for kendaraan karyawan report
     *
     * @param array $karyawan
     * @return string PDF content
     */
    public function generateKendaraanKaryawanPdf(array $karyawan)
    {
        // Calculate statistics
        $totalKaryawan = count($karyawan);
        $totalKendaraan = array_sum(array_column($karyawan, 'jumlah_kendaraan'));
        $karyawanWithKendaraan = count(array_filter($karyawan, fn($k) => $k['jumlah_kendaraan'] > 0));
        $karyawanWithoutKendaraan = $totalKaryawan - $karyawanWithKendaraan;

        // Prepare data for view
        $data = [
            'karyawan' => $karyawan,
            'generatedAt' => now(),
            'documentId' => 'VHC-' . substr(time(), -8),
            'totalKaryawan' => $totalKaryawan,
            'totalKendaraan' => $totalKendaraan,
            'karyawanWithKendaraan' => $karyawanWithKendaraan,
            'karyawanWithoutKendaraan' => $karyawanWithoutKendaraan,
        ];

        // Set header (will appear on all pages)
        $header = View::make('pdf.kendaraan-karyawan.header', $data)->render();
        $this->mpdf->SetHTMLHeader($header);

        // Set footer (will appear on all pages)
        $footer = View::make('pdf.kendaraan-karyawan.footer', $data)->render();
        $this->mpdf->SetHTMLFooter($footer);

        // Render the body content
        $html = View::make('pdf.kendaraan-karyawan.body', $data)->render();

        // Write HTML to PDF
        $this->mpdf->WriteHTML($html);

        // Return PDF as string
        return $this->mpdf->Output('', 'S');
    }

    /**
     * Download PDF
     *
     * @param array $karyawan
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadKendaraanKaryawanPdf(array $karyawan, ?string $filename = null)
    {
        $this->generateKendaraanKaryawanPdf($karyawan);

        if (!$filename) {
            $filename = 'Laporan-Kendaraan-Karyawan-' . date('Y-m-d') . '.pdf';
        }

        return $this->mpdf->Output($filename, 'D');
    }

    /**
     * Stream PDF to browser
     *
     * @param array $karyawan
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function streamKendaraanKaryawanPdf(array $karyawan, ?string $filename = null)
    {
        $this->generateKendaraanKaryawanPdf($karyawan);

        if (!$filename) {
            $filename = 'Laporan-Kendaraan-Karyawan-' . date('Y-m-d') . '.pdf';
        }

        return $this->mpdf->Output($filename, 'I');
    }
}
