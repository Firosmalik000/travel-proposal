<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jadwal Interview</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #555;
            margin-bottom: 20px;
        }
        .info-card {
            background-color: #f8f9fa;
            border-left: 4px solid #4CAF50;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .info-card h3 {
            margin-top: 0;
            color: #4CAF50;
            font-size: 16px;
            font-weight: 600;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #6c757d;
            flex: 0 0 40%;
        }
        .info-value {
            color: #212529;
            flex: 1;
            text-align: right;
        }
        .highlight-box {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
        }
        .highlight-box h2 {
            margin: 0 0 15px 0;
            font-size: 20px;
        }
        .highlight-box .date {
            font-size: 32px;
            font-weight: bold;
            margin: 10px 0;
        }
        .highlight-box .time {
            font-size: 18px;
            opacity: 0.95;
        }
        .meeting-link {
            background-color: #fff;
            border: 2px solid #4CAF50;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .meeting-link a {
            display: inline-block;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .meeting-link a:hover {
            transform: translateY(-2px);
        }
        .tips-box {
            background-color: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .tips-box h3 {
            margin-top: 0;
            color: #2196F3;
            font-size: 16px;
            font-weight: 600;
        }
        .tips-box ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .tips-box li {
            margin: 8px 0;
            color: #555;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
        }
        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Jadwal Interview Anda</h1>
            <p>Kami mengundang Anda untuk mengikuti sesi interview</p>
        </div>

        <div class="content">
            <p class="greeting">
                Halo <strong>{{ $namaKandidat }}</strong>,
            </p>

            <p>
                Terima kasih atas minat Anda untuk bergabung dengan tim kami. Kami dengan senang hati mengundang Anda untuk mengikuti sesi interview untuk posisi <strong>{{ $posisiDilamar }}</strong>.
            </p>

            <div class="highlight-box">
                <h2>🗓️ Tanggal & Waktu</h2>
                <div class="date">{{ \Carbon\Carbon::parse($tglInterview)->isoFormat('dddd, D MMMM Y') }}</div>
                <div class="time">Waktu akan dikonfirmasi lebih lanjut</div>
            </div>

            <div class="info-card">
                <h3>📋 Detail Interview</h3>
                <div class="info-row">
                    <span class="info-label">Posisi</span>
                    <span class="info-value">{{ $posisiDilamar }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Metode</span>
                    <span class="info-value">
                        @if($statusInterview === 'Online')
                            <strong style="color: #2196F3;">🌐 Online</strong>
                        @else
                            <strong style="color: #4CAF50;">🏢 Offline (Kantor)</strong>
                        @endif
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Interviewer HRD</span>
                    <span class="info-value">{{ $namaInterviewerHrd }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Interviewer User</span>
                    <span class="info-value">{{ $namaInterviewerUser }}</span>
                </div>
            </div>

            @if($statusInterview === 'Online' && $linkMeet)
                <div class="meeting-link">
                    <h3 style="margin-top: 0; color: #4CAF50;">💻 Link Meeting Online</h3>
                    <p style="margin: 10px 0; color: #6c757d;">Klik tombol di bawah untuk bergabung ke meeting pada waktu yang ditentukan:</p>
                    <a href="{{ $linkMeet }}" target="_blank">
                        Join Meeting
                    </a>
                    <p style="margin: 15px 0 0 0; font-size: 12px; color: #6c757d;">
                        Link: <a href="{{ $linkMeet }}" style="color: #2196F3;">{{ $linkMeet }}</a>
                    </p>
                </div>
            @endif

            <div class="tips-box">
                <h3>💡 Tips Persiapan Interview</h3>
                <ul>
                    <li>Pastikan Anda sudah mempelajari tentang perusahaan kami</li>
                    <li>Siapkan CV dan portofolio Anda (jika ada)</li>
                    @if($statusInterview === 'Online')
                    <li>Periksa koneksi internet dan pastikan kamera serta mikrofon berfungsi dengan baik</li>
                    <li>Bergabung 5-10 menit sebelum waktu interview dimulai</li>
                    <li>Cari tempat yang tenang dan memiliki pencahayaan yang baik</li>
                    @else
                    <li>Datang 15 menit lebih awal dari jadwal yang ditentukan</li>
                    <li>Berpakaian profesional dan rapi</li>
                    <li>Bawa dokumen pendukung (KTP, ijazah, sertifikat)</li>
                    @endif
                    <li>Siapkan pertanyaan yang ingin Anda tanyakan tentang posisi atau perusahaan</li>
                </ul>
            </div>

            <div class="divider"></div>

            <p style="color: #6c757d; font-size: 14px;">
                <strong>Catatan Penting:</strong><br>
                Jika Anda berhalangan hadir pada jadwal yang telah ditentukan, harap hubungi kami minimal 1x24 jam sebelumnya agar kami dapat mengatur jadwal pengganti.
            </p>

            <p style="margin-top: 30px;">
                Kami sangat menantikan pertemuan dengan Anda!<br><br>
                Salam hormat,<br>
                <strong>Tim HRD - {{ config('app.name') }}</strong>
            </p>
        </div>

        <div class="footer">
            <p><strong>{{ config('app.name') }}</strong></p>
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            <p>Jika ada pertanyaan, silakan hubungi HRD kami.</p>
            <p style="font-size: 12px; color: #adb5bd; margin-top: 10px;">
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
