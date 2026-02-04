<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Bergabung</title>
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
        .content {
            padding: 40px 30px;
        }
        .welcome-message {
            font-size: 18px;
            color: #555;
            margin-bottom: 30px;
        }
        .info-card {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-card h3 {
            margin-top: 0;
            color: #667eea;
            font-size: 16px;
            font-weight: 600;
        }
        .credential-box {
            background-color: #fff;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        .credential-item {
            margin: 15px 0;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
        .credential-label {
            font-size: 12px;
            color: #6c757d;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .credential-value {
            font-size: 16px;
            color: #212529;
            font-weight: 600;
            font-family: 'Courier New', monospace;
        }
        .login-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
            text-align: center;
            transition: transform 0.2s;
        }
        .login-button:hover {
            transform: translateY(-2px);
        }
        .warning-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning-box p {
            margin: 5px 0;
            font-size: 14px;
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
            <h1>🎉 Selamat Bergabung!</h1>
        </div>
        
        <div class="content">
            <p class="welcome-message">
                Halo <strong>{{ $namaLengkap }}</strong>,
            </p>
            
            <p>
                Selamat bergabung dengan tim kami! Kami sangat senang menyambut Anda sebagai bagian dari keluarga besar perusahaan kami.
            </p>

            <div class="info-card">
                <h3>📋 Informasi Posisi Anda</h3>
                <p><strong>Department:</strong> {{ $department }}</p>
                <p><strong>Jabatan:</strong> {{ $jabatan }}</p>
            </div>

            <div class="divider"></div>

            <h3 style="color: #667eea;">🔐 Informasi Akun Login</h3>
            <p>
                Akun karyawan Anda telah dibuat. Gunakan kredensial berikut untuk mengakses sistem:
            </p>

            <div class="credential-box">
                <div class="credential-item">
                    <div class="credential-label">Email</div>
                    <div class="credential-value">{{ $email }}</div>
                </div>
                
                <div class="credential-item">
                    <div class="credential-label">Username</div>
                    <div class="credential-value">{{ $username }}</div>
                </div>
                
                <div class="credential-item">
                    <div class="credential-label">Password</div>
                    <div class="credential-value">{{ $password }}</div>
                </div>
            </div>

            <div class="warning-box">
                <p><strong>⚠️ Penting untuk Keamanan Anda:</strong></p>
                <p>
                    • Segera ubah password Anda setelah login pertama kali<br>
                    • Jangan bagikan password Anda kepada siapapun<br>
                    • Simpan kredensial ini di tempat yang aman
                </p>
            </div>

            <center>
                <a href="{{ url('/login') }}" class="login-button">
                    Login Sekarang
                </a>
            </center>

            <div class="divider"></div>

            <p style="color: #6c757d; font-size: 14px;">
                Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi tim HR atau IT Support kami.
            </p>

            <p style="margin-top: 30px;">
                Salam hangat,<br>
                <strong>Tim HRD</strong>
            </p>
        </div>

        <div class="footer">
            <p><strong>{{ config('app.name') }}</strong></p>
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            <p style="font-size: 12px; color: #adb5bd; margin-top: 10px;">
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
