<?php

namespace App\Services;

use App\Mail\InterviewScheduleKandidat;
use App\Mail\InterviewScheduleInterviewer;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class InterviewEmailService
{
    /**
     * Send interview schedule email to kandidat and interviewers.
     *
     * @param array $data
     * @return array ['success' => bool, 'message' => string]
     */
    public function sendInterviewScheduleEmails(array $data): array
    {
        $results = [
            'kandidat' => false,
            'interviewer_user' => false,
            'errors' => []
        ];

        // Send email to kandidat
        if (!empty($data['email_kandidat'])) {
            try {
                Mail::to($data['email_kandidat'])->send(new InterviewScheduleKandidat(
                    namaKandidat: $data['nama_kandidat'],
                    posisiDilamar: $data['posisi_dilamar'] ?? 'Staff',
                    tglInterview: $data['tgl_interview'],
                    statusInterview: $data['status_interview'],
                    linkMeet: $data['link_meet'] ?? null,
                    namaInterviewerHrd: $data['nama_interviewer_hrd'],
                    namaInterviewerUser: $data['nama_interviewer_user'],
                ));

                $results['kandidat'] = true;
                Log::info('Interview schedule email sent to kandidat', ['email' => $data['email_kandidat']]);
            } catch (\Exception $e) {
                $results['errors'][] = 'Kandidat: ' . $e->getMessage();
                Log::error('Failed to send email to kandidat', [
                    'email' => $data['email_kandidat'],
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Send email to User interviewer only (NOT to HRD interviewer)
        if (!empty($data['email_interviewer_user'])) {
            try {
                Mail::to($data['email_interviewer_user'])->send(new InterviewScheduleInterviewer(
                    namaInterviewer: $data['nama_interviewer_user'],
                    namaKandidat: $data['nama_kandidat'],
                    emailKandidat: $data['email_kandidat'],
                    posisiDilamar: $data['posisi_dilamar'] ?? 'Staff',
                    tglInterview: $data['tgl_interview'],
                    statusInterview: $data['status_interview'],
                    linkMeet: $data['link_meet'] ?? null,
                    roleInterviewer: 'User',
                ));

                $results['interviewer_user'] = true;
                Log::info('Interview schedule email sent to User interviewer', ['email' => $data['email_interviewer_user']]);
            } catch (\Exception $e) {
                $results['errors'][] = 'User Interviewer: ' . $e->getMessage();
                Log::error('Failed to send email to User interviewer', [
                    'email' => $data['email_interviewer_user'],
                    'error' => $e->getMessage()
                ]);
            }
        }

        $successCount = array_filter([$results['kandidat'], $results['interviewer_user']]);

        if (count($successCount) > 0) {
            return [
                'success' => true,
                'message' => 'Email jadwal interview berhasil dikirim ke ' . count($successCount) . ' penerima',
                'results' => $results
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Gagal mengirim semua email: ' . implode(', ', $results['errors']),
                'results' => $results
            ];
        }
    }
}
