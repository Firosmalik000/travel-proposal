<!-- Title -->
<div style="text-align: center; color: #ED1C24; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; padding: 8px 0; border-bottom: 2px solid #ED1C24;">
    LAPORAN DATA KENDARAAN KARYAWAN
</div>

<!-- Info Box -->
<div style="background-color: #f5f7fa; padding: 8px 10px; margin: 0 0 15px 0; border: 1px solid #ccc;">
    <div style="margin: 3px 0; font-size: 8pt;">
        <strong style="display: inline-block; width: 180px; font-weight: bold;">Total Karyawan:</strong>
        {{ $totalKaryawan }} Orang
    </div>
    <div style="margin: 3px 0; font-size: 8pt;">
        <strong style="display: inline-block; width: 180px; font-weight: bold;">Total Kendaraan:</strong>
        {{ $totalKendaraan }} Kendaraan
    </div>
    <div style="margin: 3px 0; font-size: 8pt;">
        <strong style="display: inline-block; width: 180px; font-weight: bold;">Karyawan dengan Kendaraan:</strong>
        {{ $karyawanWithKendaraan }} Orang ({{ $totalKaryawan > 0 ? number_format(($karyawanWithKendaraan / $totalKaryawan) * 100, 1) : 0 }}%)
    </div>
    <div style="margin: 3px 0; font-size: 8pt;">
        <strong style="display: inline-block; width: 180px; font-weight: bold;">Karyawan tanpa Kendaraan:</strong>
        {{ $karyawanWithoutKendaraan }} Orang ({{ $totalKaryawan > 0 ? number_format(($karyawanWithoutKendaraan / $totalKaryawan) * 100, 1) : 0 }}%)
    </div>
</div>

<!-- Data Table -->
<table style="width: 100%; border-collapse: collapse; margin: 0 0 15px 0;">
    <thead>
        <tr style="background-color: #ED1C24; color: #ffffff;">
            <th style="width: 4%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">No</th>
            <th style="width: 10%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">NIK</th>
            <th style="width: 18%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Nama Lengkap</th>
            <th style="width: 13%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Department</th>
            <th style="width: 13%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Jabatan</th>
            <th style="width: 7%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Jumlah</th>
            <th style="width: 35%; padding: 6px 4px; text-align: center; font-size: 7.5pt; font-weight: bold; border: 1px solid #ED1C24; color: #ffffff;">Daftar Kendaraan</th>
        </tr>
    </thead>
    <tbody>
        @forelse($karyawan as $index => $kar)
        <tr style="{{ $index % 2 == 1 ? 'background-color: #fafcff;' : '' }}">
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">{{ $index + 1 }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">{{ $kar['nik'] }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">{{ $kar['nama_lengkap'] }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">{{ $kar['department_name'] }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">{{ $kar['jabatan_name'] }}</td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">
                @if($kar['jumlah_kendaraan'] > 0)
                    <strong style="color: #ED1C24;">{{ $kar['jumlah_kendaraan'] }}</strong>
                @else
                    <span style="color: #999;">-</span>
                @endif
            </td>
            <td style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: left;">
                @if(count($kar['kendaraan']) > 0)
                    @foreach($kar['kendaraan'] as $kendaraan)
                        <div style="margin: 2px 0; line-height: 1.4;">
                            <strong style="color: #ED1C24;">{{ $kendaraan['plat'] }}</strong> -
                            {{ $kendaraan['merk'] }}
                            ({{ $kendaraan['warna'] }}, {{ $kendaraan['cc'] }} CC)
                        </div>
                    @endforeach
                @else
                    <span style="color: #999; font-style: italic;">Belum ada kendaraan</span>
                @endif
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="7" style="padding: 4px; border: 1px solid #ddd; font-size: 7pt; text-align: center;">Tidak ada data karyawan</td>
        </tr>
        @endforelse
    </tbody>
</table>

<!-- Summary -->
<div style="background-color: #f5f7fa; border: 1px solid #ccc; padding: 8px 10px; margin: 10px 0; font-size: 8pt;">
    <strong style="color: #ED1C24;">Catatan:</strong> Dokumen ini berisi data kendaraan karyawan yang terdaftar dalam sistem parkir perusahaan. Data bersifat internal dan hanya untuk keperluan manajemen HRD. Pastikan data kendaraan selalu diperbarui untuk keamanan dan kenyamanan bersama.
</div>
