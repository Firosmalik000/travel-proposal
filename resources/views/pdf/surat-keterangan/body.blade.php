<!-- Title -->
<div style="text-align: center; font-size: 12pt; font-weight: bold; margin: 10px 0 15px 0; text-decoration: underline;">
    SURAT KETERANGAN KERJA
</div>

<!-- Letter Number -->
<div style="text-align: center; font-size: 9pt; margin: 0 0 20px 0;">
    Nomor: {{ $documentId }}/SKK/HRD/{{ date('m') }}/{{ date('Y') }}
</div>

<!-- Opening Statement -->
<div style="text-align: justify; line-height: 1.6; margin: 0 0 12px 0; font-size: 10pt;">
    Yang bertanda tangan di bawah ini:
</div>

<!-- Signatory Info -->
<table style="width: 100%; margin: 0 0 12px 0; border-collapse: collapse;">
    <tr>
        <td style="width: 30%; padding: 3px 0; vertical-align: top; font-size: 10pt;">Nama</td>
        <td style="width: 3%; padding: 3px 0; vertical-align: top; font-size: 10pt;">:</td>
        <td style="width: 67%; padding: 3px 0; vertical-align: top; font-size: 10pt;"><strong>HRD Manager</strong></td>
    </tr>
    <tr>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">Jabatan</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">:</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">Manager Human Resources Department</td>
    </tr>
    <tr>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">Alamat Perusahaan</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">:</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">Jl. Synthesis RB 29 RT 004 RW 019 Purnawarman Pisangan, Ciputat Timur, Tangerang Selatan, Banten 15419</td>
    </tr>
</table>

<!-- Statement -->
<div style="text-align: justify; line-height: 1.6; margin: 0 0 12px 0; font-size: 10pt;">
    Dengan ini menerangkan bahwa:
</div>

<!-- Employee Info -->
<table style="width: 100%; margin: 0 0 12px 0; border-collapse: collapse;">
    <tr>
        <td style="width: 30%; padding: 3px 0; vertical-align: top; font-size: 10pt;">Nama Lengkap</td>
        <td style="width: 3%; padding: 3px 0; vertical-align: top; font-size: 10pt;">:</td>
        <td style="width: 67%; padding: 3px 0; vertical-align: top; font-size: 10pt;"><strong>{{ $karyawan['nama_lengkap'] }}</strong></td>
    </tr>
    <tr>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">NIK / Paspor</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">:</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">{{ $karyawan['nik'] ?? '-' }}</td>
    </tr>
    <tr>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">Tempat, Tanggal Lahir</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">:</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">
            {{ $karyawan['tempat_lahir'] ?? '-' }},
            {{ $karyawan['tanggal_lahir'] ? \Carbon\Carbon::parse($karyawan['tanggal_lahir'])->format('d F Y') : '-' }}
        </td>
    </tr>
    <tr>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">Alamat</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">:</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">{{ $karyawan['alamat'] ?? '-' }}</td>
    </tr>
    <tr>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">Jabatan</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">:</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;"><strong>{{ $karyawan['jabatan_name'] ?? '-' }}</strong></td>
    </tr>
    <tr>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">Department</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">:</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">{{ $karyawan['department_name'] ?? '-' }}</td>
    </tr>
    <tr>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">Status Karyawan</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">:</td>
        <td style="padding: 3px 0; vertical-align: top; font-size: 10pt;">{{ ucfirst($karyawan['status_karyawan'] ?? '-') }}</td>
    </tr>
</table>

<!-- Confirmation Statement -->
<div style="text-align: justify; line-height: 1.6; margin: 0 0 12px 0; font-size: 10pt;">
    Adalah benar karyawan/karyawati yang bekerja di <strong>PT XBOSS ASIA GRUP</strong> sejak tanggal
    <strong>{{ $karyawan['tanggal_mulai_bekerja'] ? \Carbon\Carbon::parse($karyawan['tanggal_mulai_bekerja'])->format('d F Y') : '-' }}</strong>
    sampai dengan saat ini.
</div>

<!-- Purpose Statement -->
<div style="text-align: justify; line-height: 1.6; margin: 0 0 20px 0; font-size: 10pt;">
    Surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
</div>

<!-- Closing -->
<div style="text-align: right; margin: 0 0 60px 0; font-size: 10pt;">
    <div>Tangerang Selatan, {{ now()->format('d F Y') }}</div>
    <div style="margin-top: 5px; font-weight: bold;">PT XBOSS ASIA GRUP</div>
</div>

<!-- Signature Space -->
<div style="text-align: right; margin: 0 0 10px 0; font-size: 10pt;">
    <div style="font-weight: bold;">HRD Manager</div>
</div>
