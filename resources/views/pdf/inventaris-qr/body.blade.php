@php
    $items = collect($items ?? []);
@endphp

<div style="text-align: center; margin: 0 0 12px 0;">
    <div style="background: linear-gradient(135deg, #ED1C24 0%, #c41820 100%); color: #ffffff; font-size: 12pt; font-weight: bold; padding: 10px 18px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        KUMPULAN QR CODE INVENTARIS
    </div>
</div>

<div style="background: linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%); padding: 10px 12px; margin: 0 0 15px 0; border: 2px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="border-left: 4px solid #ED1C24; padding-left: 10px;">
        <div style="margin: 4px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">Tanggal Cetak:</span>
            <span style="color: #475569;">{{ ($generatedAt ?? now())->format('d/m/Y H:i') }}</span>
        </div>
        <div style="margin: 4px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">Total QR:</span>
            <span style="color: #475569;">{{ $totalBarang ?? $items->count() }} item</span>
        </div>
        @if(!empty($filters['kategori']))
        <div style="margin: 4px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">Kategori:</span>
            <span style="padding: 2px 8px; border-radius: 4px; background-color: #dbeafe; color: #1e40af; font-weight: bold;">{{ $filters['kategori'] }}</span>
        </div>
        @endif
        @if(!empty($filters['merek']))
        <div style="margin: 4px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">Merek/Model:</span>
            <span style="padding: 2px 8px; border-radius: 4px; background-color: #e2e8f0; color: #334155; font-weight: bold;">{{ $filters['merek'] }}</span>
        </div>
        @endif
        @if(!empty($filters['lokasi']))
        <div style="margin: 4px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">Lokasi:</span>
            <span style="padding: 2px 8px; border-radius: 4px; background-color: #dbeafe; color: #1e40af; font-weight: bold;">{{ $filters['lokasi'] }}</span>
        </div>
        @endif
        @if(!empty($filters['penanggung_jawab']))
        <div style="margin: 4px 0; font-size: 8.5pt; color: #334155;">
            <span style="display: inline-block; width: 140px; font-weight: bold; color: #1e293b;">Penanggung Jawab:</span>
            <span style="padding: 2px 8px; border-radius: 4px; background-color: #dbeafe; color: #1e40af; font-weight: bold;">{{ $filters['penanggung_jawab'] }}</span>
        </div>
        @endif
    </div>
</div>

@if($items->isEmpty())
    <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; color: #94a3b8; font-size: 9pt;">
        Tidak ada QR inventaris yang bisa ditampilkan.
    </div>
@else
    <table style="width: 100%; border-collapse: collapse;">
        @foreach($items->chunk(2) as $row)
        <tr>
            @foreach($row as $item)
            <td width="50%" style="padding: 8px; vertical-align: top; border: 1px solid #0f161fff;">
                <div style="border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 10px; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.08); page-break-inside: avoid;">
                    <table width="100%" style="border-collapse: collapse;">
                        <tr>
                            <td width="45%" style="text-align: center; vertical-align: middle; padding: 6px; border-right: 1px dashed #e2e8f0;">
                                <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; background: #f8fafc; display: inline-block;">
                                    @if(!empty($item['qr_path']))
                                        <img src="{{ $item['qr_path'] }}" alt="QR Code" style="width: 110px; height: 110px; object-fit: contain;">
                                    @else
                                        <div style="width: 110px; height: 110px; border: 1px dashed #cbd5e1; display: inline-flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 7pt;">
                                            QR tidak tersedia
                                        </div>
                                    @endif
                                </div>
                            </td>
                            <td width="55%" style="vertical-align: middle; padding: 6px 8px;">
                                <div style=" padding: 8px; ">
                                    <div style="font-size: 8pt; color: #94a3b8; letter-spacing: 0.4px; text-transform: uppercase; margin-bottom: 4px;">
                                        Inventaris
                                    </div>
                                    <div style="font-size: 9.5pt; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
                                        {{ $item['nama_barang'] ?? '-' }}
                                    </div>
                                    <div style="font-size: 7pt; color: #64748b;">
                                        Kode Barang:
                                    </div>
                                    <div style="font-size: 8pt; font-weight: 600; color: #334155; margin-top: 2px;">
                                        {{ $item['kode_barang'] ?? '-' }}
                                    </div>
                                    <div style="margin-top: 6px; padding-top: 4px; font-size: 6.5pt; color: #94a3b8;">
                                        Scan untuk detail inventaris
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            @endforeach
            @if($row->count() < 2)
            <td width="50%" style="padding: 8px; vertical-align: top;"></td>
            @endif
        </tr>
        @endforeach
    </table>
@endif
