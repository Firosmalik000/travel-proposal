@include('pdf.partials.letterhead', [
    'branding' => $branding,
    'seo' => $seo,
    'locale' => $locale,
    'generatedAt' => $generatedAt,
])

<table class="document-header">
    <tr>
        <td style="width: 68%;">
            <div class="document-title">Laporan Keuangan</div>
            <div class="document-subtitle">Paket laporan manajemen, pembukuan, dan kontrol keuangan</div>
            <div style="margin-top: 6px; font-size: 8px; color: #64748b;">
                Periode {{ \Illuminate\Support\Carbon::parse($filters['date_from'])->locale('id')->translatedFormat('d F Y') }} s.d. {{ \Illuminate\Support\Carbon::parse($filters['date_to'])->locale('id')->translatedFormat('d F Y') }}
                @if (! empty($generatedBy))
                    &nbsp;|&nbsp; Dicetak oleh {{ $generatedBy }}
                @endif
            </div>
        </td>
        <td style="width: 32%; text-align: right;">
            <div style="font-size: 8px; font-weight: 700; color: #9a3412;">INTERNAL · BELUM DIAUDIT</div>
        </td>
    </tr>
</table>
