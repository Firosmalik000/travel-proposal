<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-top: none;
        }
        .info-box {
            background-color: white;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">Slip Gaji</h1>
            <p style="margin: 5px 0 0 0;">PT Xboss Asia Group</p>
        </div>

        <div class="content">
            <p>Kepada Yth,</p>
            <p><strong>{{ $karyawan->nama_lengkap }}</strong><br>
            {{ $karyawan->jabatan?->name ?? '-' }}</p>

            <p>Dengan hormat,</p>

            <p>Bersama email ini kami kirimkan slip gaji Anda untuk periode:</p>

            <div class="info-box">
                <strong>Periode:</strong> {{ $slip->period_label ?? $slip->period_start->format('d M') . ' - ' . $slip->period_end->format('d M Y') }}<br>
                <strong>Gaji Bersih:</strong> Rp {{ number_format($slip->gaji_bersih, 0, ',', '.') }}
            </div>

            <p>Slip gaji terlampir dalam file PDF yang dapat Anda unduh. Mohon untuk menyimpan dokumen ini dengan baik sebagai bukti pembayaran gaji.</p>

            <p>Apabila ada pertanyaan atau perbedaan data, silakan hubungi bagian HRD atau Finance.</p>

            <p>Terima kasih atas dedikasi dan kerja keras Anda.</p>

            <p>Hormat kami,<br>
            <strong>Finance  PT Xboss Asia Group</strong></p>
        </div>

        <div class="footer">
            <p>
                <strong> PT Xboss Asia Group</strong><br>
                Jl Punawarman no.7 Pisangan Timur, Ciputat Timur<br>
                Tangerang Selatan, Banten<br>
                Telp: 08563505050
            </p>
            <p style="color: #999; font-size: 11px; margin-top: 15px;">
                Email ini dikirim secara otomatis. Mohon tidak membalas email ini.<br>
                Dokumen ini bersifat pribadi dan rahasia.
            </p>
        </div>
    </div>
</body>
</html>
