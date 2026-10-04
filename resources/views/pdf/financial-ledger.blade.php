@extends('pdf.layout')

@section('title', $dataset['title'])

@push('styles')
    <style>
        .document-title { font-size: 15px; font-weight: 800; color: #0f172a; }
        .document-subtitle { margin-top: 3px; font-size: 9px; color: #475569; }
        .meta-line { margin-top: 5px; font-size: 8px; color: #64748b; }
        .report-table th, .report-table td { font-size: 8px; line-height: 1.3; padding: 4px 5px; }
        .report-table th { background: #f8fafc; color: #1e293b; }
        .numeric { text-align: right; white-space: nowrap; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        .total-row td { border-top: 2px solid #94a3b8; font-weight: 700; }
        .status-note { margin-top: 8px; padding: 6px 8px; border-left: 3px solid #8e101b; background: #fff7ed; color: #7c2d12; font-size: 8px; }
    </style>
@endpush

@section('content')
    @php
        $formatDate = static fn ($value): string => filled($value)
            ? \Illuminate\Support\Carbon::parse($value)->locale('id')->translatedFormat('d F Y')
            : '-';
        $dateKeys = ['transaction_date', 'date', 'period_start', 'period_end', 'created_at'];
    @endphp

    @include('pdf.partials.letterhead', [
        'branding' => $branding,
        'seo' => $seo,
        'locale' => $locale,
        'generatedAt' => $generatedAt,
    ])

    <table style="margin-top: 10px; border: 0;">
        <tr>
            <td style="border: 0; padding: 0;">
                <div class="document-title">{{ $dataset['title'] }}</div>
                <div class="document-subtitle">{{ $dataset['subtitle'] }}</div>
                <div class="meta-line">
                    Periode {{ filled($filters['date_from'] ?? null) ? $formatDate($filters['date_from']) : 'awal pencatatan' }} s.d. {{ $formatDate($filters['date_to'] ?? $generatedAt->toDateString()) }}
                    @if (! empty($generatedBy))
                        &nbsp;|&nbsp; Dicetak oleh {{ $generatedBy }}
                    @endif
                    &nbsp;|&nbsp; {{ $generatedAt->locale('id')->translatedFormat('d F Y H:i') }}
                </div>
            </td>
            <td style="width: 145px; border: 0; padding: 0; text-align: right; color: #9a3412; font-size: 8px; font-weight: 700;">INTERNAL · BELUM DIAUDIT</td>
        </tr>
    </table>

    <div class="status-note">Hasil ekspor mengikuti filter aktif. Transaksi yang direversal tetap dipertahankan untuk menjaga jejak audit.</div>

    <table class="report-table" style="margin-top: 10px;">
        <thead>
            <tr>
                @foreach ($dataset['headers'] as $key => $label)
                    <th class="{{ str_ends_with($key, '_idr') ? 'numeric' : '' }}">{{ $label }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($dataset['rows'] as $row)
                <tr>
                    @foreach ($dataset['headers'] as $key => $label)
                        <td class="{{ str_ends_with($key, '_idr') ? 'numeric' : '' }}">
                            @if (str_ends_with($key, '_idr'))
                                {{ number_format((int) ($row[$key] ?? 0), 0, ',', '.') }}
                            @elseif (in_array($key, $dateKeys, true))
                                {{ $formatDate($row[$key] ?? null) }}
                            @else
                                {{ filled($row[$key] ?? null) ? $row[$key] : '-' }}
                            @endif
                        </td>
                    @endforeach
                </tr>
            @empty
                <tr><td colspan="{{ count($dataset['headers']) }}" style="text-align:center; color:#64748b; padding:18px;">Tidak ada data yang sesuai dengan filter.</td></tr>
            @endforelse
            @if (! empty($dataset['totals']))
                <tr class="total-row">
                    @foreach ($dataset['headers'] as $key => $label)
                        <td class="{{ str_ends_with($key, '_idr') ? 'numeric' : '' }}">
                            @if ($loop->first)
                                TOTAL
                            @elseif (array_key_exists($key, $dataset['totals']))
                                {{ number_format((int) $dataset['totals'][$key], 0, ',', '.') }}
                            @endif
                        </td>
                    @endforeach
                </tr>
            @endif
        </tbody>
    </table>
@endsection
