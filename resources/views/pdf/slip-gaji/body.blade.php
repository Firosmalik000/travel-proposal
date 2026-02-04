<!-- Confidential Badge -->
<div style="display: inline-block; border: 2px solid #ED1C24; background-color: #FFF5F5; color: #ED1C24; padding: 6px 12px; font-size: 8pt; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 15px;">
    &#128274; PRIBADI & RAHASIA
</div>

<!-- Document Title -->
<div style="text-align: center; font-size: 16pt; font-weight: bold; color: #333; margin: 20px 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
    SLIP GAJI KARYAWAN
</div>

<!-- Period -->
<div style="text-align: center; font-size: 11pt; color: #666; margin-bottom: 25px; font-weight: bold;">
    Periode: {{ $slip->period_label ?? $slip->period_start->format('d M') . ' - ' . $slip->period_end->format('d M Y') }}
</div>

<!-- Employee Information -->
<div style="background-color: #f8f9fa; border: 1px solid #ddd; padding: 12px 15px; margin-bottom: 20px; border-radius: 4px;">
    <table width="100%" style="border-collapse: collapse;">
        <tr>
            <td style="width: 120px; padding: 4px 0; font-size: 9.5pt; color: #666; font-weight: 600;">NIK</td>
            <td style="width: 15px; padding: 4px 0; font-size: 9.5pt; text-align: center; color: #666;">:</td>
            <td style="padding: 4px 0; font-size: 9.5pt; color: #333; font-weight: 500;">{{ $karyawan->nik }}</td>
            <td style="width: 120px; padding: 4px 0 4px 30px; font-size: 9.5pt; color: #666; font-weight: 600;">Departemen</td>
            <td style="width: 15px; padding: 4px 0; font-size: 9.5pt; text-align: center; color: #666;">:</td>
            <td style="padding: 4px 0; font-size: 9.5pt; color: #333; font-weight: 500;">{{ $karyawan->department?->name ?? '-' }}</td>
        </tr>
        <tr>
            <td style="padding: 4px 0; font-size: 9.5pt; color: #666; font-weight: 600;">Nama</td>
            <td style="padding: 4px 0; font-size: 9.5pt; text-align: center; color: #666;">:</td>
            <td style="padding: 4px 0; font-size: 9.5pt; color: #333; font-weight: 500;">{{ $karyawan->nama_lengkap }}</td>
            <td style="padding: 4px 0 4px 30px; font-size: 9.5pt; color: #666; font-weight: 600;">Jabatan</td>
            <td style="padding: 4px 0; font-size: 9.5pt; text-align: center; color: #666;">:</td>
            <td style="padding: 4px 0; font-size: 9.5pt; color: #333; font-weight: 500;">{{ $karyawan->jabatan?->name ?? '-' }}</td>
        </tr>
    </table>
</div>

<!-- Salary Table -->
<table width="100%" style="border-collapse: collapse; margin-bottom: 20px; font-size: 9.5pt;">
    <tr>
        <th colspan="2" style="background: linear-gradient(to bottom, #ED1C24 0%, #C71820 100%); color: white; padding: 10px; text-align: center; font-weight: bold; border: 1px solid #C71820; font-size: 10pt;">PENDAPATAN</th>
        <th colspan="2" style="background: linear-gradient(to bottom, #ED1C24 0%, #C71820 100%); color: white; padding: 10px; text-align: center; font-weight: bold; border: 1px solid #C71820; font-size: 10pt;">POTONGAN</th>
    </tr>
    @php
        $pendapatan = $slip->pendapatan ?? [];
        $potongan = $slip->potongan ?? [];
        $maxRows = max(count($pendapatan), count($potongan));
    @endphp
    @for ($i = 0; $i < $maxRows; $i++)
    <tr>
        @if (isset($pendapatan[$i]))
        <td style="width: 25%; padding: 8px 10px; border: 1px solid #ddd; color: #333; font-weight: 500;">{{ $pendapatan[$i]['label'] }}</td>
        <td style="width: 25%; padding: 8px 10px; border: 1px solid #ddd; text-align: right; color: #333; font-family: 'DejaVu Sans Mono', monospace;">Rp {{ number_format($pendapatan[$i]['amount'], 0, ',', '.') }}</td>
        @else
        <td style="width: 25%; padding: 8px 10px; border: 1px solid #ddd;"></td>
        <td style="width: 25%; padding: 8px 10px; border: 1px solid #ddd;"></td>
        @endif

        @if (isset($potongan[$i]))
        <td style="width: 25%; padding: 8px 10px; border: 1px solid #ddd; color: #333; font-weight: 500;">{{ $potongan[$i]['label'] }}</td>
        <td style="width: 25%; padding: 8px 10px; border: 1px solid #ddd; text-align: right; color: #333; font-family: 'DejaVu Sans Mono', monospace;">Rp {{ number_format($potongan[$i]['amount'], 0, ',', '.') }}</td>
        @else
        <td style="width: 25%; padding: 8px 10px; border: 1px solid #ddd;"></td>
        <td style="width: 25%; padding: 8px 10px; border: 1px solid #ddd;"></td>
        @endif
    </tr>
    @endfor
    <tr style="background-color: #f8f9fa; font-weight: bold;">
        <td style="padding: 10px; border: 1px solid #ddd; border-top: 2px solid #999; font-size: 10pt; color: #333; font-weight: 500;">TOTAL PENDAPATAN</td>
        <td style="padding: 10px; border: 1px solid #ddd; border-top: 2px solid #999; text-align: right; font-size: 10pt; color: #333; font-family: 'DejaVu Sans Mono', monospace;">Rp {{ number_format($slip->total_pendapatan, 0, ',', '.') }}</td>
        <td style="padding: 10px; border: 1px solid #ddd; border-top: 2px solid #999; font-size: 10pt; color: #333; font-weight: 500;">TOTAL POTONGAN</td>
        <td style="padding: 10px; border: 1px solid #ddd; border-top: 2px solid #999; text-align: right; font-size: 10pt; color: #333; font-family: 'DejaVu Sans Mono', monospace;">Rp {{ number_format($slip->total_potongan, 0, ',', '.') }}</td>
    </tr>
</table>

<!-- Net Salary Box -->
<div style="background: linear-gradient(to right, #ED1C24 0%, #C71820 100%); color: white; padding: 18px 20px; margin: 25px 0; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="font-size: 10pt; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 5px;">GAJI BERSIH (TAKE HOME PAY)</div>
    <div style="font-size: 18pt; font-weight: bold; margin-bottom: 8px; font-family: 'DejaVu Sans Mono', monospace;">Rp {{ number_format($slip->gaji_bersih, 0, ',', '.') }}</div>
    <div style="font-size: 9pt; font-style: italic; opacity: 0.95; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 10px; margin-top: 5px;">{{ $slip->gaji_bersih_terbilang }} Rupiah</div>
</div>

<!-- Signature Section -->
<table width="100%" style="margin-top: 40px;">
    <tr>
        <td width="50%">&nbsp;</td>
        <td width="50%" style="text-align: center;">
            <div style="font-size: 9pt; font-weight: bold; color: #333; margin-bottom: 50px;">Finance PT Xboss Asia Group</div>
            <div style="font-size: 9pt; font-weight: bold; color: #333; border-top: 1px solid #333; padding-top: 5px; display: inline-block; min-width: 150px;">Asiyah</div>
        </td>
    </tr>
</table>
