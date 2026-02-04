@php
    /**
     * Helper function untuk format tanggal Indonesia yang lebih cantik
     */
    function formatTanggalIndonesia($date, $format = 'full') {
        if (empty($date)) return '-';

        $carbon = \Carbon\Carbon::parse($date);

        // Array nama bulan Indonesia
        $bulanIndo = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        $hari = $carbon->day;
        $bulan = $bulanIndo[$carbon->month];
        $tahun = $carbon->year;

        if ($format === 'short') {
            // Format: 15 Jan 2025
            return $hari . ' ' . substr($bulan, 0, 3) . ' ' . $tahun;
        } elseif ($format === 'medium') {
            // Format: 15 Januari 2025
            return $hari . ' ' . $bulan . ' ' . $tahun;
        } else {
            // Format: Jumat, 15 Januari 2025
            $hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            $namaHari = $hariIndo[$carbon->dayOfWeek];
            return $namaHari . ', ' . $hari . ' ' . $bulan . ' ' . $tahun;
        }
    }
@endphp

<!-- Title dengan styling lebih modern -->
<div style="text-align: center; margin: 0 0 15px 0;">
    <div style="background: linear-gradient(135deg, #ED1C24 0%, #c41820 100%); color: #ffffff; font-size: 13pt; font-weight: bold; padding: 12px 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        LAPORAN DATA INVENTARIS KANTOR
    </div>
</div>

<!-- Info Box dengan styling lebih menarik -->
<div style="background: linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%); padding: 12px 15px; margin: 0 0 15px 0; border: 2px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="border-left: 4px solid #ED1C24; padding-left: 10px; margin-bottom: 8px;">
        <div style="margin: 5px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">📅 Tanggal Cetak:</span>
            <span style="color: #475569;">{{ formatTanggalIndonesia(now(), 'medium') }}</span>
        </div>
        @if(!empty($filters['kategori']))
        <div style="margin: 5px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">📦 Kategori:</span>
            <span style="padding: 2px 8px; border-radius: 4px; background-color: #dbeafe; color: #1e40af; font-weight: bold;">{{ $filters['kategori'] }}</span>
        </div>
        @endif
        @if(!empty($filters['lokasi']))
        <div style="margin: 5px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">📍 Lokasi:</span>
            <span style="padding: 2px 8px; border-radius: 4px; background-color: #dbeafe; color: #1e40af; font-weight: bold;">{{ $filters['lokasi'] }}</span>
        </div>
        @endif
        @if(!empty($filters['penanggung_jawab']))
        <div style="margin: 5px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">👤 Penanggung Jawab:</span>
            <span style="padding: 2px 8px; border-radius: 4px; background-color: #dbeafe; color: #1e40af; font-weight: bold;">{{ $filters['penanggung_jawab'] }}</span>
        </div>
        @endif
    </div>
</div>

<!-- Data Table dengan styling modern -->
<table style="width: 100%; border-collapse: collapse; margin: 0 0 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
    <thead>
        <tr style="background: linear-gradient(135deg, #ED1C24 0%, #c41820 100%); color: #ffffff;">
            <th style="width: 3%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">No</th>
            <th style="width: 7%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Kode</th>
            <th style="width: 13%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Nama Barang</th>
            <th style="width: 8%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Kategori</th>
            <th style="width: 10%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Merek/Model</th>
            <th style="width: 6%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Jumlah</th>
            <th style="width: 8%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Kondisi</th>
            <th style="width: 10%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Lokasi</th>
            <th style="width: 10%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Penanggung Jawab</th>
            <th style="width: 10%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Foto</th>
            <th style="width: 8%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Harga</th>
            <th style="width: 7%; padding: 8px 4px; text-align: center; font-size: 7pt; font-weight: bold; color: #ffffff;">Total</th>
        </tr>
    </thead>
    <tbody>
        @forelse($inventaris as $index => $item)
        <tr style="{{ $index % 2 == 1 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;' }}">
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 7pt; text-align: center; color: #475569; font-weight: 600;">
                {{ $index + 1 }}
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 7pt; text-align: center; color: #1e293b; font-weight: 600;">
                {{ $item['kode_barang'] ?? '-' }}
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 7pt; text-align: left; color: #334155; font-weight: 600;">
                {{ $item['nama_barang'] }}
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 6.5pt; text-align: center;">
                <span style="display: inline-block; padding: 2px 6px; background-color: #f1f5f9; border-radius: 4px; color: #475569;">
                    {{ $item['kategori'] }}
                </span>
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 6.5pt; text-align: left; color: #64748b;">
                {{ $item['merek_model'] ?? '-' }}
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 7pt; text-align: center; font-weight: bold; color: #1e293b;">
                {{ $item['jumlah'] }} {{ $item['satuan'] }}
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 6.5pt; text-align: center;">
                @if($item['kondisi'] === 'Baik')
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 6px; font-size: 6pt; font-weight: bold; background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;">✓ Baik</span>
                @elseif($item['kondisi'] === 'Rusak Ringan')
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 6px; font-size: 6pt; font-weight: bold; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a;">⚠ Rusak Ringan</span>
                @elseif($item['kondisi'] === 'Rusak Berat')
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 6px; font-size: 6pt; font-weight: bold; background-color: #fed7aa; color: #9a3412; border: 1px solid #fdba74;">✗ Rusak Berat</span>
                @else
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 6px; font-size: 6pt; font-weight: bold; background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca;">✗ Tidak Layak</span>
                @endif
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 6.5pt; text-align: left; color: #64748b;">
                {{ $item['lokasi'] }}
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 6.5pt; text-align: left; color: #334155;">
                {{ $item['penanggung_jawab'] ?? '-' }}
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 6.5pt; text-align: center;">
                @if(!empty($item['foto_barang_urls']) && is_array($item['foto_barang_urls']) && count($item['foto_barang_urls']) > 0)
                    @foreach($item['foto_barang_urls'] as $fileIndex => $url)
                        <a href="{{ $url }}" style="display: inline-block; margin: 2px; padding: 3px 6px; background-color: #f1f5f9; color: #3b82f6; text-decoration: none; border-radius: 4px; font-size: 6.5pt; border: 1px solid #cbd5e1;" title="Klik untuk melihat foto {{ $fileIndex + 1 }}">
                            📷 Foto {{ $fileIndex + 1 }}
                        </a>
                        @if($fileIndex < count($item['foto_barang_urls']) - 1)
                            <br/>
                        @endif
                    @endforeach
                @else
                    <span style="color: #94a3b8;">-</span>
                @endif
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 6.5pt; text-align: right; font-weight: 600; color: #059669;">
                Rp {{ number_format($item['harga'] ?? 0, 0, ',', '.') }}
            </td>
            <td style="padding: 5px 4px; border: 1px solid #e2e8f0; font-size: 6.5pt; text-align: right; font-weight: bold; color: #059669;">
                @php
                    $hargaTotal = ($item['harga'] ?? 0) * ($item['jumlah'] ?? 0);
                @endphp
                Rp {{ number_format($hargaTotal, 0, ',', '.') }}
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="12" style="padding: 20px; border: 1px solid #e2e8f0; font-size: 8pt; text-align: center; color: #94a3b8; background-color: #f8fafc;">
                <div style="font-weight: 600;">📭 Tidak ada data inventaris</div>
            </td>
        </tr>
        @endforelse
    </tbody>
</table>

<!-- Summary Box dengan styling modern -->
<div style="width: 100%; max-width: 600px; margin: 20px auto 15px auto; page-break-inside: avoid; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #ED1C24 0%, #c41820 100%); color: #ffffff; padding: 10px; text-align: center; font-weight: bold; font-size: 10pt; letter-spacing: 0.5px;">
        📊 RINGKASAN INVENTARIS
    </div>
    <div style="background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%); padding: 15px; border: 2px solid #ED1C24; border-top: none;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5pt; color: #475569; font-weight: 600;">Total Jenis Barang:</span>
                </td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 9pt; font-weight: bold; color: #1e293b;">{{ $totalBarang }} jenis</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5pt; color: #475569; font-weight: 600;">Total Unit:</span>
                </td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 9pt; font-weight: bold; color: #1e293b;">{{ $totalJumlah }} unit</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 7.5pt; color: #065f46; font-weight: 600;">✓ Kondisi Baik:</span>
                </td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-size: 9pt; font-weight: bold; color: #059669;">{{ $barangBaik }} barang ({{ $totalBarang > 0 ? round(($barangBaik / $totalBarang) * 100, 1) : 0 }}%)</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px;">
                    <span style="font-size: 7.5pt; color: #991b1b; font-weight: 600;">✗ Perlu Perbaikan:</span>
                </td>
                <td style="padding: 8px; text-align: right;">
                    <span style="font-size: 9pt; font-weight: bold; color: #dc2626;">{{ $barangRusak }} barang ({{ $totalBarang > 0 ? round(($barangRusak / $totalBarang) * 100, 1) : 0 }}%)</span>
                </td>
            </tr>
        </table>
    </div>
</div>
