<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reschedule Jadwal Interview</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                ⏰ Reschedule Jadwal Interview
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                                Kepada Yth. <strong>{{ $recipientName }}</strong>,
                            </p>

                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                                Dengan ini kami informasikan bahwa jadwal interview telah di-reschedule:
                            </p>

                            <!-- Kandidat Info -->
                            @if($recipientType === 'interviewer')
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #f9fafb; border-radius: 8px; padding: 20px; border-left: 4px solid #f97316;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 5px; font-size: 14px; color: #6b7280; font-weight: 600;">KANDIDAT</p>
                                        <p style="margin: 0 0 10px; font-size: 18px; color: #111827; font-weight: 700;">{{ $namaKandidat }}</p>
                                        <p style="margin: 0; font-size: 14px; color: #6b7280;">
                                            📧 {{ $emailKandidat }}<br>
                                            💼 {{ $posisiDilamar }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Old Schedule (Crossed Out) -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px; background-color: #fee2e2; border-radius: 8px; padding: 20px; border-left: 4px solid #ef4444;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 8px; font-size: 13px; color: #991b1b; font-weight: 700; text-transform: uppercase;">Jadwal Lama (Dibatalkan)</p>
                                        <p style="margin: 0 0 8px; font-size: 16px; color: #7f1d1d; text-decoration: line-through;">
                                            📅 {{ \Carbon\Carbon::parse($tglInterviewOld)->locale('id')->isoFormat('dddd, D MMMM YYYY') }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- New Schedule -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #dcfce7; border-radius: 8px; padding: 20px; border-left: 4px solid #22c55e;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 8px; font-size: 13px; color: #166534; font-weight: 700; text-transform: uppercase;">Jadwal Baru</p>
                                        <p style="margin: 0 0 8px; font-size: 20px; color: #14532d; font-weight: 700;">
                                            📅 {{ \Carbon\Carbon::parse($tglInterviewNew)->locale('id')->isoFormat('dddd, D MMMM YYYY') }}
                                        </p>
                                        <p style="margin: 0; font-size: 15px; color: #166534;">
                                            📍 <strong>{{ $statusInterview }}</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Interviewer Info (for kandidat) -->
                            @if($recipientType === 'kandidat')
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #fef3c7; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #92400e; font-weight: 600;">INTERVIEWER</p>
                                        <p style="margin: 0 0 5px; font-size: 15px; color: #78350f;">
                                            👤 <strong>HRD:</strong> {{ $namaInterviewerHrd }}
                                        </p>
                                        <p style="margin: 0; font-size: 15px; color: #78350f;">
                                            👤 <strong>User:</strong> {{ $namaInterviewerUser }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Meeting Link Button -->
                            @if($statusInterview === 'Online' && $linkMeet)
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="{{ $linkMeet }}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);">
                                            🔗 Join Meeting
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Important Note -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #fef3c7; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #92400e; font-weight: 700;">⚠️ PENTING</p>
                                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #78350f; line-height: 1.8;">
                                            <li>Harap perhatikan tanggal baru dengan seksama</li>
                                            <li>Mohon konfirmasi kehadiran Anda segera</li>
                                            <li>Jika ada kendala, hubungi HRD kami</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 10px; font-size: 16px; line-height: 1.6; color: #374151;">
                                Terima kasih atas pengertiannya.
                            </p>

                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                                Salam,<br>
                                <strong>Tim HRD</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
                                Email ini dikirim secara otomatis, mohon tidak membalas email ini.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
