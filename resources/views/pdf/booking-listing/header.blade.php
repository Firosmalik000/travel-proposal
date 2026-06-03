@include('pdf.partials.letterhead', [
    'branding' => $branding,
    'seo' => $seo,
    'locale' => $locale,
    'generatedAt' => $generatedAt,
])

<h1 style="margin-top: 14px;">Booking Listing</h1>
<p class="muted">Dicetak: {{ $generatedAt->format('Y-m-d H:i') }}</p>
