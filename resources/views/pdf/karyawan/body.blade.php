<!-- Title -->
<div style="text-align: center; color: #ED1C24; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; padding: 8px 0; border-bottom: 2px solid #ED1C24;">
    LAPORAN DATA KARYAWAN
</div>

<!-- Info Box -->
<div style="background-color: #f5f7fa; padding: 8px 10px; margin: 0 0 15px 0; border: 1px solid #ccc;">
    <div style="margin: 3px 0; font-size: 8pt;">
        <strong style="display: inline-block; width: 140px; font-weight: bold;">Total Karyawan:</strong>
        {{ $totalKaryawan }} Orang
    </div>
    @if(!empty($filters['department_id']))
    <div style="margin: 3px 0; font-size: 8pt;">
        <strong style="display: inline-block; width: 140px; font-weight: bold;">Filter Department:</strong>
        Ya
    </div>
    @endif
    @if(!empty($filters['jabatan_id']))
    <div style="margin: 3px 0; font-size: 8pt;">
        <strong style="display: inline-block; width: 140px; font-weight: bold;">Filter Jabatan:</strong>
        Ya
    </div>
    @endif
    @if(!empty($filters['status']))
    <div style="margin: 3px 0; font-size: 8pt;">
        <strong style="display: inline-block; width: 140px; font-weight: bold;">Filter Status:</strong>
        {{ ucfirst($filters['status']) }}
    </div>
    @endif
</div>

<!-- Data Table -->
<table style="width: 100%; border-collapse: collapse; margin: 0 0 15px 0;">
    <thead>
        <tr style="background-color: #ED1C24; color: #ffffff;">
            <th style="width: 4%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">No</th>
            <th style="width: 12%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">NIK / Paspor</th>
            <th style="width: 18%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Nama Lengkap</th>
            <th style="width: 10%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">No. Telp</th>
            <th style="width: 10%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Email</th>
            <th style="width: 24%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Alamat</th>
            <th style="width: 11%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Department</th>
            <th style="width: 11%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Jabatan</th>
        </tr>
    </thead>
    <tbody>
        @forelse($karyawan as $index => $kar)
        <tr style="{{ $index % 2 == 1 ? 'background-color: #fafcff;' : '' }}">
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">{{ $index + 1 }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">{{ $kar['nik'] ?? '-' }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">{{ $kar['nama_lengkap'] }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">{{ $kar['no_telp'] ?? '-' }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">{{ $kar['email'] ?? '-' }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">{{ $kar['alamat'] ?? '-' }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">{{ $kar['department_name'] ?? '-' }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">{{ $kar['jabatan_name'] ?? '-' }}</td>
        </tr>
        @empty
        <tr>
            <td colspan="8" style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">Tidak ada data karyawan</td>
        </tr>
        @endforelse
    </tbody>
</table>

<!-- Summary -->
<div style="background-color: #f5f7fa; border: 1px solid #ccc; padding: 8px 10px; margin: 10px 0; font-size: 8pt;">
    <strong style="color: #ED1C24;">Catatan:</strong> Dokumen ini berisi data karyawan yang aktif dalam sistem. Data bersifat rahasia dan hanya untuk keperluan internal perusahaan. Tidak diperkenankan memasukkan atau melampirkan salinan KTP dalam dokumen ini.
</div>
