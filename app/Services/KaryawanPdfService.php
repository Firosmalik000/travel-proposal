<?php

namespace App\Services;

use Mpdf\Mpdf;
use Illuminate\Support\Facades\View;

class KaryawanPdfService
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
    public function generateKaryawanPdf(array $karyawan, array $filters = [])
    {
        // Prepare data for view
        $data = [
            'karyawan' => $karyawan,
            'filters' => $filters,
            'generatedAt' => now(),
            'documentId' => 'KRY-' . substr(time(), -8),
            'totalKaryawan' => count($karyawan),
        ];

        // Set header (will appear on all pages)
        $header = View::make('pdf.karyawan.header', $data)->render();
        $this->mpdf->SetHTMLHeader($header);

        // Set footer (will appear on all pages)
        $footer = View::make('pdf.karyawan.footer', $data)->render();
        $this->mpdf->SetHTMLFooter($footer);

        // Render the body content
        $html = View::make('pdf.karyawan.body', $data)->render();

        // Write HTML to PDF
        $this->mpdf->WriteHTML($html);

        // Return PDF as string
        return $this->mpdf->Output('', 'S');
    }

    /**
     * Download PDF
     *
     * @param array $karyawan
     * @param array $filters
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadKaryawanPdf(array $karyawan, array $filters = [], ?string $filename = null)
    {
        $this->generateKaryawanPdf($karyawan, $filters);

        if (!$filename) {
            $filename = 'Laporan-Master-Karyawan-' . date('Y-m-d') . '.pdf';
        }

        return $this->mpdf->Output($filename, 'D');
    }

    /**
     * Stream PDF to browser
     *
     * @param array $karyawan
     * @param array $filters
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function streamKaryawanPdf(array $karyawan, array $filters = [], ?string $filename = null)
    {
        $this->generateKaryawanPdf($karyawan, $filters);

        if (!$filename) {
            $filename = 'Laporan-Master-Karyawan-' . date('Y-m-d') . '.pdf';
        }

        return $this->mpdf->Output($filename, 'I');
    }

    /**
     * Generate PDF for surat keterangan kerja
     *
     * @param array $karyawan
     * @return string PDF content
     */
    public function generateSuratKeteranganPdf(array $karyawan)
    {
        // Create a new instance with Portrait orientation for surat
        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'orientation' => 'P', // Portrait for letter
            'margin_left' => 20,
            'margin_right' => 20,
            'margin_top' => 35,
            'margin_bottom' => 20,
            'margin_header' => 5,
            'margin_footer' => 8,
            'default_font_size' => 10,
            'default_font' => 'dejavusans',
        ]);

        // Prepare data for view
        $data = [
            'karyawan' => $karyawan,
            'generatedAt' => now(),
            'documentId' => 'SKK-' . substr(time(), -8),
        ];

        // Set header (will appear on all pages)
        $header = View::make('pdf.surat-keterangan.header', $data)->render();
        $mpdf->SetHTMLHeader($header);

        // Set footer (will appear on all pages)
        $footer = View::make('pdf.surat-keterangan.footer', $data)->render();
        $mpdf->SetHTMLFooter($footer);

        // Render the body content
        $html = View::make('pdf.surat-keterangan.body', $data)->render();

        // Write HTML to PDF
        $mpdf->WriteHTML($html);

        // Return PDF as string
        return $mpdf->Output('', 'S');
    }

    /**
     * Download Surat Keterangan PDF
     *
     * @param array $karyawan
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadSuratKeteranganPdf(array $karyawan, ?string $filename = null)
    {
        // Create a new instance with Portrait orientation for surat
        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'orientation' => 'P', // Portrait for letter
            'margin_left' => 20,
            'margin_right' => 20,
            'margin_top' => 35,
            'margin_bottom' => 20,
            'margin_header' => 5,
            'margin_footer' => 8,
            'default_font_size' => 10,
            'default_font' => 'dejavusans',
        ]);

        // Prepare data for view
        $data = [
            'karyawan' => $karyawan,
            'generatedAt' => now(),
            'documentId' => 'SKK-' . substr(time(), -8),
        ];

        // Set header (will appear on all pages)
        $header = View::make('pdf.surat-keterangan.header', $data)->render();
        $mpdf->SetHTMLHeader($header);

        // Set footer (will appear on all pages)
        $footer = View::make('pdf.surat-keterangan.footer', $data)->render();
        $mpdf->SetHTMLFooter($footer);

        // Render the body content
        $html = View::make('pdf.surat-keterangan.body', $data)->render();

        // Write HTML to PDF
        $mpdf->WriteHTML($html);

        if (!$filename) {
            $filename = 'Surat-Keterangan-Kerja-' . $karyawan['nama_lengkap'] . '-' . date('Y-m-d') . '.pdf';
        }

        return $mpdf->Output($filename, 'D');
    }
}
