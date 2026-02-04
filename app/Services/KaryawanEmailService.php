<?php

namespace App\Services;

use App\Mail\WelcomeNewEmployee;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class KaryawanEmailService
{
    /**
     * Send welcome email to new employee.
     *
     * @param array $data
     * @return array ['success' => bool, 'message' => string]
     */
    public function sendWelcomeEmail(array $data): array
    {
        try {
            Mail::to($data['email'])->send(new WelcomeNewEmployee(
                namaLengkap: $data['nama_lengkap'],
                username: $data['username'],
                email: $data['email'],
                password: $data['password'],
                department: $data['department'] ?? '-',
                jabatan: $data['jabatan'] ?? '-',
            ));

            Log::info('Welcome email sent successfully', ['email' => $data['email']]);

            return [
                'success' => true,
                'message' => 'Email selamat datang berhasil dikirim'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to send welcome email', [
                'error' => $e->getMessage(),
                'email' => $data['email']
            ]);

            return [
                'success' => false,
                'message' => 'Gagal mengirim email selamat datang: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Send bulk welcome emails to multiple employees.
     *
     * @param array $employees Array of employee data
     * @return array ['success_count' => int, 'failed_count' => int, 'errors' => array]
     */
    public function bulkSendWelcomeEmail(array $employees): array
    {
        $successCount = 0;
        $failedCount = 0;
        $errors = [];

        foreach ($employees as $employee) {
            $result = $this->sendWelcomeEmail($employee);

            if ($result['success']) {
                $successCount++;
            } else {
                $failedCount++;
                $errors[] = $result['message'];
            }
        }

        return [
            'success_count' => $successCount,
            'failed_count' => $failedCount,
            'errors' => $errors,
        ];
    }
}
