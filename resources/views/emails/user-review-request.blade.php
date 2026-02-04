<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Review Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                                📝 Request untuk Review Kandidat
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                                Kepada Yth. <strong>{{ $namaUser }}</strong>,
                            </p>

                            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                                HRD telah melakukan interview dan menyetujui kandidat berikut. Kami memerlukan review dan approval dari Anda sebagai User Interviewer.
                            </p>

                            <!-- Kandidat Info -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #f9fafb; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 5px; font-size: 14px; color: #6b7280; font-weight: 600;">KANDIDAT</p>
                                        <p style="margin: 0 0 10px; font-size: 20px; color: #111827; font-weight: 700;">{{ $kandidat->nama_lengkap }}</p>
                                        <p style="margin: 0; font-size: 14px; color: #6b7280;">
                                            📧 {{ $kandidat->email }}<br>
                                            💼 {{ $kandidat->posisi_dilamar ?? 'Staff' }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Interview Info -->
                            @if($kandidat->tgl_interview)
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #dbeafe; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 8px; font-size: 14px; color: #1e3a8a; font-weight: 700;">JADWAL INTERVIEW</p>
                                        <p style="margin: 0; font-size: 15px; color: #1e40af;">
                                            📅 {{ \Carbon\Carbon::parse($kandidat->tgl_interview)->locale('id')->isoFormat('dddd, D MMMM YYYY') }}<br>
                                            📍 {{ $kandidat->status_interview }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Action Required -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #fef3c7; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #92400e; font-weight: 700;">⚡ TINDAKAN YANG DIPERLUKAN</p>
                                        <p style="margin: 0; font-size: 14px; color: #78350f; line-height: 1.8;">
                                            Klik tombol di bawah untuk memberikan review dan approval Anda terhadap kandidat ini.<br>
                                            Anda dapat menyetujui atau menolak kandidat langsung dari form yang tersedia.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Review Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                                <tr>
                                    <td align="center" style="padding: 20px 0;">
                                        <a href="{{ url('/user-review/' . $reviewToken) }}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 8px; font-weight: 700; font-size: 17px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                                            📝 Berikan Review Anda
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #f3f4f6; border-radius: 8px; padding: 15px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center;">
                                            💡 <strong>Tips:</strong> Anda tidak perlu login ke sistem. Cukup klik tombol di atas untuk langsung mengakses form review.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 10px; font-size: 16px; line-height: 1.6; color: #374151;">
                                Terima kasih atas perhatian dan kerjasamanya.
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
