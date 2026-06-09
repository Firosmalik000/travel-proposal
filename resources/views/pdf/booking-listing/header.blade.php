@include('pdf.partials.letterhead', [
    'branding' => $branding,
    'seo' => $seo,
    'locale' => $locale,
    'generatedAt' => $generatedAt,
])

<table class="document-header">
    <tr>
        <td style="width: 68%;">
            <div class="document-title">Booking Listing</div>
            <div class="document-subtitle">Rekap data booking terfilter</div>
        </td>
        <td style="width: 32%; text-align: right;">
            <div class="document-meta">
                <div class="document-meta-value">Dicetak: {{ $generatedAt->format('d M Y H:i') }}</div>
            </div>
        </td>
    </tr>
</table>
