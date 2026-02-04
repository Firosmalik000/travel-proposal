<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jadwal Interview - Interviewer</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .role-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .info-card {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .info-card h3 {
            margin-top: 0;
            color: #667eea;
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .highlight-box .candidate {
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0;
        }
        .meeting-link {
            background-color: #fff;
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        .meeting-link a {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .reminder-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .reminder-box h3 {
            margin-top: 0;
            color: #856404;
            font-size: 16px;
            font-weight: 600;
        }
        .reminder-box ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .reminder-box li {
            margin: 8px 0;
            color: #856404;
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
            <h1>👥 Jadwal Interview</h1>
            <p>Anda ditunjuk sebagai Interviewer</p>
        </div>

        <div class="content">
            <p class="greeting">
                Halo <strong>{{ $namaInterviewer }}</strong>,
            </p>

            <div class="role-badge">
                {{ $roleInterviewer === 'HRD' ? '🏢 Interviewer HRD' : '👤 Interviewer User' }}
            </div>

            <p>
                Anda telah ditunjuk sebagai interviewer untuk kandidat berikut. Mohon untuk mempersiapkan diri dan hadir tepat waktu sesuai jadwal yang telah ditentukan.
            </p>

            <div class="highlight-box">
                <h2>👤 Kandidat</h2>
                <div class="candidate">{{ $namaKandidat }}</div>
                <p style="margin: 5px 0; font-size: 16px; opacity: 0.95;">{{ $posisiDilamar }}</p>
            </div>

            <div class="info-card">
                <h3>📋 Detail Interview</h3>
                <div class="info-row">
                    <span class="info-label">Nama Kandidat</span>
                    <span class="info-value">{{ $namaKandidat }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email Kandidat</span>
                    <span class="info-value">{{ $emailKandidat }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Posisi Dilamar</span>
                    <span class="info-value">{{ $posisiDilamar }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tanggal</span>
                    <span class="info-value"><strong>{{ \Carbon\Carbon::parse($tglInterview)->isoFormat('dddd, D MMMM Y') }}</strong></span>
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
            </div>

            @if($statusInterview === 'Online' && $linkMeet)
                <div class="meeting-link">
                    <h3 style="margin-top: 0; color: #667eea;">💻 Link Meeting Online</h3>
                    <p style="margin: 10px 0; color: #6c757d;">Klik tombol di bawah untuk bergabung ke meeting pada waktu yang ditentukan:</p>
                    <a href="{{ $linkMeet }}" target="_blank">
                        Join Meeting
                    </a>
                    <p style="margin: 15px 0 0 0; font-size: 12px; color: #6c757d;">
                        Link: <a href="{{ $linkMeet }}" style="color: #2196F3;">{{ $linkMeet }}</a>
                    </p>
                </div>
            @endif

            <div class="reminder-box">
                <h3>⏰ Reminder untuk Interviewer</h3>
                <ul>
                    <li>Review CV dan portfolio kandidat sebelum interview</li>
                    <li>Siapkan pertanyaan yang relevan dengan posisi yang dilamar</li>
                    @if($statusInterview === 'Online')
                    <li>Periksa koneksi internet dan pastikan perangkat berfungsi dengan baik</li>
                    <li>Bergabung 5 menit sebelum waktu interview dimulai</li>
                    @else
                    <li>Hadir di ruang interview 10 menit sebelum jadwal</li>
                    <li>Pastikan ruang interview dalam kondisi rapi dan nyaman</li>
                    @endif
                    <li>Buat catatan penilaian selama proses interview</li>
                    <li>Berikan feedback yang konstruktif kepada kandidat</li>
                </ul>
            </div>

            <div class="divider"></div>

            <p style="color: #6c757d; font-size: 14px;">
                <strong>Catatan:</strong><br>
                Jika ada perubahan jadwal atau Anda berhalangan hadir, segera hubungi tim HRD untuk mengatur interviewer pengganti.
            </p>

            <p style="margin-top: 30px;">
                Terima kasih atas partisipasinya dalam proses rekrutmen.<br><br>
                Salam hormat,<br>
                <strong>Tim HRD - {{ config('app.name') }}</strong>
            </p>
        </div>

        <div class="footer">
            <p><strong>{{ config('app.name') }}</strong></p>
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            <p>Jika ada pertanyaan, silakan hubungi tim HRD.</p>
            <p style="font-size: 12px; color: #adb5bd; margin-top: 10px;">
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
