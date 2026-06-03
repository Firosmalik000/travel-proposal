@include('pdf.partials.letterhead', [
    'branding' => $branding,
    'seo' => $seo,
    'locale' => $locale,
    'generatedAt' => $generatedAt,
])

<table class="document-header">
    <tr>
        <td style="width: 68%;">
            <div class="document-title">Invoice</div>
            <div class="document-subtitle">{{ $bookingCode }}</div>
        </td>
        <td style="width: 32%; text-align: right;">
            <div class="document-meta">
                <div class="document-meta-value">Dicetak: {{ $generatedAt->format('d M Y H:i') }}</div>
            </div>
        </td>
    </tr>
</table>
