<?php

namespace App\Services;

use App\Models\SlipGaji;
use App\Models\MasterKaryawan;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\View;

class SlipGajiEmailService
{
    protected $pdfService;

    public function __construct(SlipGajiPdfService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Send slip gaji via email to single employee.
     *
     * @param SlipGaji $slipGaji
     * @return array ['success' => bool, 'message' => string]
     */
    public function sendEmail(SlipGaji $slipGaji): array
    {
        try {
            $karyawan = $this->pdfService->getKaryawan($slipGaji);

            if (!$karyawan || !$karyawan->user || !$karyawan->user->email) {
                return [
                    'success' => false,
                    'message' => 'Email karyawan tidak ditemukan'
                ];
            }

            // Generate PDF
            $pdfContent = $this->pdfService->generatePdf($slipGaji);

            // Send email with PDF attachment
            $this->sendMailWithAttachment($karyawan, $slipGaji, $pdfContent);

            // Update status and sent_at
            $slipGaji->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            return [
                'success' => true,
                'message' => 'Slip gaji berhasil dikirim ke email'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Gagal mengirim email: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Send multiple slip gaji via email.
     *
     * @param array $slipIds Array of slip gaji IDs
     * @return array ['success_count' => int, 'failed_count' => int, 'errors' => array]
     */
    public function bulkSendEmail(array $slipIds): array
    {
        $successCount = 0;
        $failedCount = 0;
        $errors = [];

        foreach ($slipIds as $slipId) {
            try {
                $slipGaji = SlipGaji::findOrFail($slipId);
                $result = $this->sendEmail($slipGaji);

                if ($result['success']) {
                    $successCount++;
                } else {
                    $failedCount++;
                    $errors[] = $result['message'];
                }
            } catch (\Exception $e) {
                $failedCount++;
                $errors[] = $e->getMessage();
            }
        }

        return [
            'success_count' => $successCount,
            'failed_count' => $failedCount,
            'errors' => $errors,
        ];
    }

    /**
     * Send email with PDF attachment.
     *
     * @param MasterKaryawan $karyawan
     * @param SlipGaji $slipGaji
     * @param string $pdfContent
     * @return void
     */
    protected function sendMailWithAttachment(MasterKaryawan $karyawan, SlipGaji $slipGaji, string $pdfContent): void
    {
        $emailData = [
            'karyawan' => $karyawan,
            'slip' => $slipGaji,
        ];

        Mail::send('emails.slip-gaji', $emailData, function ($message) use ($karyawan, $slipGaji, $pdfContent) {
            $message->to($karyawan->user->email)
                ->subject("Slip Gaji - {$slipGaji->period_label}")
                ->attachData($pdfContent, "Slip Gaji-{$karyawan->nama_lengkap}-{$slipGaji->period_label}.pdf", [
                    'mime' => 'application/pdf',
                ]);
        });
    }

    /**
     * Render email HTML for preview.
     *
     * @param SlipGaji $slipGaji
     * @return string
     */
    public function renderEmailHtml(SlipGaji $slipGaji): string
    {
        $karyawan = $this->pdfService->getKaryawan($slipGaji);

        if (!$karyawan) {
            throw new \Exception('Data karyawan tidak ditemukan');
        }

        return View::make('emails.slip-gaji', [
            'karyawan' => $karyawan,
            'slip' => $slipGaji,
        ])->render();
    }
}
