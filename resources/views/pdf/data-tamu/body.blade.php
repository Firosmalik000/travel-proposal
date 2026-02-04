<!-- Title -->
<div style="text-align: center; color: #ED1C24; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; padding: 8px 0; border-bottom: 2px solid #ED1C24;">
    LAPORAN DATA TAMU
</div>

<!-- Info Box -->
<div style="background-color: #f5f7fa; padding: 8px 10px; margin: 0 0 15px 0; border: 1px solid #ccc;">
    <div style="margin: 3px 0; font-size: 8pt;">
        <strong style="display: inline-block; width: 140px; font-weight: bold;">Total Tamu:</strong>
        {{ $totalTamu }} Orang
    </div>
    
    <!-- @if(!empty($filters['status']))
    <div style="margin: 3px 0; font-size: 8pt;">
        <strong style="display: inline-block; width: 140px; font-weight: bold;">Filter Status:</strong>
        {{ ucfirst($filters['status']) }}
    </div>
    @endif -->
</div>

<!-- Data Table -->
<table style="width: 100%; border-collapse: collapse; margin: 0 0 15px 0;">
    <thead>
        <tr style="background-color: #ED1C24; color: #ffffff;">
            <th style="width: 4%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">No</th>
            <th style="width: 12%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">NIK / Paspor</th>
            <th style="width: 18%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Nama Lengkap</th>
            <th style="width: 10%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">No. Telp</th>
            <th style="width: 10%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Durasi Tinggal</th>
        </tr>
    </thead>
    <tbody>
        @forelse($tamu as $index => $tam)
        <tr style="{{ $index % 2 == 1 ? 'background-color: #fafcff;' : '' }}">
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">{{ $index + 1 }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">{{ $tam['nik_passpor'] ?? '-' }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">{{ $tam['name'] }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">{{ $tam['no_telp'] ?? '-' }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">{{ $tam['durasi_tinggal'] ?? '-' }}</td>
        </tr>
        @empty
        <tr>
            <td colspan="5" style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">Tidak ada data Tamu</td>
        </tr>
        @endforelse
    </tbody>
</table>

<!-- Summary -->
<!-- <div style="background-color: #f5f7fa; border: 1px solid #ccc; padding: 8px 10px; margin: 10px 0; font-size: 8pt;">
    <strong style="color: #ED1C24;">Catatan:</strong> Dokumen ini berisi data karyawan yang aktif dalam sistem. Data bersifat rahasia dan hanya untuk keperluan internal perusahaan. Tidak diperkenankan memasukkan atau melampirkan salinan KTP dalam dokumen ini.
</div> -->
