<?php

namespace App\Services;

use App\Models\SlipGaji;
use App\Models\MasterKaryawan;
use Mpdf\Mpdf;
use Illuminate\Support\Facades\View;

class SlipGajiPdfService
{
    /**
     * Generate PDF for slip gaji.
     *
     * @param SlipGaji $slipGaji
     * @return string PDF content
     */
    public function generatePdf(SlipGaji $slipGaji): string
    {
        $karyawan = MasterKaryawan::where('user_id', $slipGaji->user_id)
            ->with(['department', 'jabatan'])
            ->first();

        if (!$karyawan) {
            throw new \Exception('Data karyawan tidak ditemukan');
        }

        $data = [
            'slip' => $slipGaji,
            'karyawan' => $karyawan,
        ];

        // Create mPDF instance with margins for header/footer
        $mpdf = new Mpdf([
            'format' => 'A4',
            'orientation' => 'P',
            'margin_left' => 15,
            'margin_right' => 15,
            'margin_top' => 45,
            'margin_bottom' => 25,
            'margin_header' => 10,
            'margin_footer' => 10,
        ]);

        // Set header
        $header = View::make('pdf.slip-gaji.header', $data)->render();
        $mpdf->SetHTMLHeader($header);

        // Set footer
        $footer = View::make('pdf.slip-gaji.footer', $data)->render();
        $mpdf->SetHTMLFooter($footer);

        // Generate body HTML
        $html = View::make('pdf.slip-gaji.body', $data)->render();
        $mpdf->WriteHTML($html);

        // Return PDF as string
        return $mpdf->Output('', 'S');
    }

    /**
     * Stream PDF to browser.
     *
     * @param SlipGaji $slipGaji
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function streamPdf(SlipGaji $slipGaji)
    {
        $karyawan = MasterKaryawan::where('user_id', $slipGaji->user_id)->first();

        if (!$karyawan) {
            throw new \Exception('Data karyawan tidak ditemukan');
        }

        $pdfContent = $this->generatePdf($slipGaji);
        $filename = "Slip Gaji-{$karyawan->nama_lengkap}-{$slipGaji->period_label}.pdf";

        return response()->stream(
            function () use ($pdfContent) {
                echo $pdfContent;
            },
            200,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "inline; filename=\"{$filename}\"",
            ]
        );
    }

    /**
     * Download PDF.
     *
     * @param SlipGaji $slipGaji
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadPdf(SlipGaji $slipGaji)
    {
        $karyawan = MasterKaryawan::where('user_id', $slipGaji->user_id)->first();

        if (!$karyawan) {
            throw new \Exception('Data karyawan tidak ditemukan');
        }

        $pdfContent = $this->generatePdf($slipGaji);
        $filename = "Slip Gaji-{$karyawan->nama_lengkap}-{$slipGaji->period_label}.pdf";

        return response()->stream(
            function () use ($pdfContent) {
                echo $pdfContent;
            },
            200,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ]
        );
    }

    /**
     * Get karyawan data for slip gaji.
     *
     * @param SlipGaji $slipGaji
     * @return MasterKaryawan|null
     */
    public function getKaryawan(SlipGaji $slipGaji): ?MasterKaryawan
    {
        return MasterKaryawan::where('user_id', $slipGaji->user_id)
            ->with(['department', 'jabatan', 'user'])
            ->first();
    }
}
