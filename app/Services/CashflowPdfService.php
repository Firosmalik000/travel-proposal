<?php

namespace App\Services;

use Mpdf\Mpdf;
use Illuminate\Support\Facades\View;

class CashflowPdfService
{
    protected $mpdf;

    public function __construct()
    {
        $this->mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'orientation' => 'P',
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
     * Generate PDF for cashflow report
     *
     * @param array $cashflows
     * @param array $filters
     * @param string $typeCashflow
     * @return string PDF content
     */
    public function generateCashflowPdf(array $cashflows, array $filters, string $typeCashflow = 'internal')
    {
        // Calculate totals
        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($cashflows as $cashflow) {
            if ($cashflow['type'] === 'debit') {
                $totalDebit += $cashflow['amount'];
            } else {
                $totalCredit += $cashflow['amount'];
            }
        }

        $netTotal = $totalDebit - $totalCredit;

        // Prepare data for view
        $data = [
            'cashflows' => $cashflows,
            'filters' => $filters,
            'totalDebit' => $totalDebit,
            'totalCredit' => $totalCredit,
            'netTotal' => $netTotal,
            'typeCashflow' => $typeCashflow,
            'generatedAt' => now(),
            'documentId' => 'CF-' . substr(time(), -8),
        ];

        // Set header (will appear on all pages)
        $header = View::make('pdf.cashflow.header', $data)->render();
        $this->mpdf->SetHTMLHeader($header);

        // Set footer (will appear on all pages)
        $footer = View::make('pdf.cashflow.footer', $data)->render();
        $this->mpdf->SetHTMLFooter($footer);

        // Render the body content
        $html = View::make('pdf.cashflow.body', $data)->render();

        // Write HTML to PDF
        $this->mpdf->WriteHTML($html);

        // Return PDF as string
        return $this->mpdf->Output('', 'S');
    }

    /**
     * Download PDF
     *
     * @param array $cashflows
     * @param array $filters
     * @param string $typeCashflow
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadCashflowPdf(array $cashflows, array $filters, string $typeCashflow = 'internal', ?string $filename = null)
    {
        $this->generateCashflowPdf($cashflows, $filters, $typeCashflow);

        if (!$filename) {
            $filename = 'Laporan-Cashflow-' . date('Y-m-d') . '.pdf';
        }

        return $this->mpdf->Output($filename, 'D');
    }

    /**
     * Stream PDF to browser
     *
     * @param array $cashflows
     * @param array $filters
     * @param string $typeCashflow
     * @param string|null $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function streamCashflowPdf(array $cashflows, array $filters, string $typeCashflow = 'internal', ?string $filename = null)
    {
        $this->generateCashflowPdf($cashflows, $filters, $typeCashflow);

        if (!$filename) {
            $filename = 'Laporan-Cashflow-' . date('Y-m-d') . '.pdf';
        }

        return $this->mpdf->Output($filename, 'I');
    }
}
