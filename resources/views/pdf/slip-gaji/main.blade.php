<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Slip Gaji - {{ $karyawan->nama_lengkap }}</title>
    <style>
        @page {
            margin-top: 40mm;
            margin-bottom: 20mm;
            margin-left: 15mm;
            margin-right: 15mm;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10pt;
            margin: 0;
            padding: 0;
            color: #333;
        }
    </style>
</head>
<body>
    @include('pdf.slip-gaji.body')
</body>
</html>
