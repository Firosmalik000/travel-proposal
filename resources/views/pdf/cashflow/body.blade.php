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
        LAPORAN CASHFLOW {{ strtoupper($typeCashflow) }}
    </div>
</div>

<!-- Info Box dengan styling lebih menarik -->
<div style="background: linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%); padding: 12px 15px; margin: 0 0 15px 0; border: 2px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="border-left: 4px solid #ED1C24; padding-left: 10px; margin-bottom: 8px;">
        <div style="margin: 5px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">📅 Periode Laporan:</span>
            <span style="color: #475569;">
                @if(!empty($filters['startDate']) && !empty($filters['endDate']))
                    {{ formatTanggalIndonesia($filters['startDate'], 'medium') }} - {{ formatTanggalIndonesia($filters['endDate'], 'medium') }}
                @elseif(!empty($filters['startDate']))
                    Dari: {{ formatTanggalIndonesia($filters['startDate'], 'medium') }}
                @elseif(!empty($filters['endDate']))
                    Sampai: {{ formatTanggalIndonesia($filters['endDate'], 'medium') }}
                @else
                    <span style="color: #ED1C24; font-weight: bold;">Semua Periode</span>
                @endif
            </span>
        </div>
        @if(!empty($filters['typeFilter']) && $filters['typeFilter'] !== 'all')
        <div style="margin: 5px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">💰 Tipe Transaksi:</span>
            <span style="padding: 2px 8px; border-radius: 4px; {{ $filters['typeFilter'] === 'debit' ? 'background-color: #d1fae5; color: #065f46;' : 'background-color: #fee2e2; color: #991b1b;' }} font-weight: bold;">
                {{ $filters['typeFilter'] === 'debit' ? 'Debit (Uang Masuk)' : 'Credit (Uang Keluar)' }}
            </span>
        </div>
        @endif
        @if(!empty($filters['methodFilter']) && $filters['methodFilter'] !== 'all')
        <div style="margin: 5px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">💳 Metode Pembayaran:</span>
            <span style="padding: 2px 8px; border-radius: 4px; background-color: #dbeafe; color: #1e40af; font-weight: bold;">{{ $filters['methodFilter'] }}</span>
        </div>
        @endif
    </div>
</div>

<!-- Data Table dengan styling modern -->
<table style="width: 100%; border-collapse: collapse; margin: 0 0 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
    <thead>
        <tr style="background: linear-gradient(135deg, #ED1C24 0%, #c41820 100%); color: #ffffff;">
            <th style="width: 4%; padding: 8px 6px; text-align: center; font-size: 8pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">No</th>
            <th style="width: 10%; padding: 8px 6px; text-align: center; font-size: 8pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Tanggal</th>
            <th style="width: 8%; padding: 8px 6px; text-align: center; font-size: 8pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Tipe</th>
            <th style="width: 15%; padding: 8px 6px; text-align: center; font-size: 8pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Nominal</th>
            <th style="width: 10%; padding: 8px 6px; text-align: center; font-size: 8pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Kategori</th>
            <th style="width: 28%; padding: 8px 6px; text-align: center; font-size: 8pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Keterangan</th>
            <th style="width: 13%; padding: 8px 6px; text-align: center; font-size: 8pt; font-weight: bold; color: #ffffff; border-right: 1px solid rgba(255,255,255,0.2);">Metode</th>
            <th style="width: 12%; padding: 8px 6px; text-align: center; font-size: 8pt; font-weight: bold; color: #ffffff;">File</th>
        </tr>
    </thead>
    <tbody>
        @forelse($cashflows as $index => $cashflow)
        <tr style="{{ $index % 2 == 1 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;' }}">
            <td style="padding: 6px; border: 1px solid #e2e8f0; font-size: 8pt; text-align: center; color: #475569; font-weight: 600;">
                {{ $index + 1 }}
            </td>
            <td style="padding: 6px; border: 1px solid #e2e8f0; font-size: 8pt; text-align: center; color: #475569;">
                <div style="font-weight: 600; color: #1e293b;">{{ formatTanggalIndonesia($cashflow['date'], 'short') }}</div>
            </td>
            <td style="padding: 6px; border: 1px solid #e2e8f0; font-size: 7.5pt; text-align: center;">
                @if($cashflow['type'] === 'debit')
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 7pt; font-weight: bold; background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;">↑ Masuk</span>
                @else
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 7pt; font-weight: bold; background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca;">↓ Keluar</span>
                @endif
            </td>
            <td style="padding: 6px; border: 1px solid #e2e8f0; font-size: 8pt; text-align: right; font-weight: bold; {{ $cashflow['type'] === 'debit' ? 'color: #059669;' : 'color: #dc2626;' }}">
                Rp {{ number_format($cashflow['amount'], 0, ',', '.') }}
            </td>
            <td style="padding: 6px; border: 1px solid #e2e8f0; font-size: 7.5pt; text-align: left; color: #64748b;">
                <span style="display: inline-block; padding: 2px 6px; background-color: #f1f5f9; border-radius: 4px; color: #475569;">
                    {{ $cashflow['category'] ?? '-' }}
                </span>
            </td>
            <td style="padding: 6px; border: 1px solid #e2e8f0; font-size: 7.5pt; text-align: left; color: #334155; line-height: 1.4;">
                {{ $cashflow['description'] }}
            </td>
            <td style="padding: 6px; border: 1px solid #e2e8f0; font-size: 7.5pt; text-align: center;">
                <span style="display: inline-block; padding: 2px 6px; background-color: #dbeafe; color: #1e40af; border-radius: 4px; font-weight: 600;">
                    {{ $cashflow['method'] }}
                </span>
            </td>
            <td style="padding: 6px; border: 1px solid #e2e8f0; font-size: 7.5pt; text-align: center;">
                @if(!empty($cashflow['attachment_urls']) && is_array($cashflow['attachment_urls']) && count($cashflow['attachment_urls']) > 0)
                    @foreach($cashflow['attachment_urls'] as $fileIndex => $url)
                        <a href="{{ $url }}" style="display: inline-block; margin: 2px; padding: 3px 6px; background-color: #f1f5f9; color: #3b82f6; text-decoration: none; border-radius: 4px; font-size: 7pt; border: 1px solid #cbd5e1;" title="Klik untuk melihat file {{ $fileIndex + 1 }}">
                            📎 File {{ $fileIndex + 1 }}
                        </a>
                        @if($fileIndex < count($cashflow['attachment_urls']) - 1)
                            <br/>
                        @endif
                    @endforeach
                @else
                    <span style="color: #94a3b8;">-</span>
                @endif
            </td>
        </tr>
        @empty
        <tr>
            <td colspan="8" style="padding: 20px; border: 1px solid #e2e8f0; font-size: 8pt; text-align: center; color: #94a3b8; background-color: #f8fafc;">
                <div style="font-weight: 600;">📭 Tidak ada data transaksi</div>
            </td>
        </tr>
        @endforelse
    </tbody>
</table>

<!-- Summary Box dengan styling modern -->
<div style="width: 320px; margin: 20px 0 15px auto; page-break-inside: avoid; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #ED1C24 0%, #c41820 100%); color: #ffffff; padding: 10px; text-align: center; font-weight: bold; font-size: 10pt; letter-spacing: 0.5px;">
        📊 RINGKASAN KEUANGAN
    </div>
    <div style="background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%); padding: 15px; border: 2px solid #ED1C24; border-top: none;">
        <!-- Total Pemasukan -->
        <div style="margin: 8px 0; padding: 8px; background-color: #d1fae5; border-left: 4px solid #059669; border-radius: 6px;">
            <div style="font-size: 7.5pt; color: #065f46; margin-bottom: 3px; font-weight: 600;">💰 Total Pemasukan</div>
            <div style="font-size: 10pt; font-weight: bold; color: #059669;">
                Rp {{ number_format($totalDebit, 0, ',', '.') }}
            </div>
        </div>

        <!-- Total Pengeluaran -->
        <div style="margin: 8px 0; padding: 8px; background-color: #fee2e2; border-left: 4px solid #dc2626; border-radius: 6px;">
            <div style="font-size: 7.5pt; color: #991b1b; margin-bottom: 3px; font-weight: 600;">💸 Total Pengeluaran</div>
            <div style="font-size: 10pt; font-weight: bold; color: #dc2626;">
                Rp {{ number_format($totalCredit, 0, ',', '.') }}
            </div>
        </div>

        <!-- Saldo Bersih -->
        <div style="margin: 12px 0 0 0; padding: 10px; background: {{ $netTotal >= 0 ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}; border: 2px solid {{ $netTotal >= 0 ? '#059669' : '#dc2626' }}; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 8pt; color: {{ $netTotal >= 0 ? '#065f46' : '#991b1b' }}; margin-bottom: 4px; font-weight: 600;">
                {{ $netTotal >= 0 ? '✓' : '✗' }} SALDO BERSIH
            </div>
            <div style="font-size: 11pt; font-weight: bold; color: {{ $netTotal >= 0 ? '#059669' : '#dc2626' }};">
                Rp {{ number_format($netTotal, 0, ',', '.') }}
            </div>
            <div style="font-size: 6.5pt; color: {{ $netTotal >= 0 ? '#065f46' : '#991b1b' }}; margin-top: 3px; opacity: 0.8;">
                {{ $netTotal >= 0 ? 'Surplus' : 'Defisit' }}
            </div>
        </div>
    </div>
</div>
