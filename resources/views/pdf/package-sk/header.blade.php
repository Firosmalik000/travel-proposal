@include('pdf.partials.letterhead', [
    'branding' => $branding,
    'seo' => $seo,
    'locale' => $locale,
    'generatedAt' => $generatedAt,
])

<div class="title">{{ $locale === 'id' ? 'SK Paket Umroh' : 'Umrah Package Terms Summary' }}</div>
<div class="subtitle">
    <span class="pill">{{ $package->code }}</span>
    <span style="display:inline-block; width:8px;"></span>
    <span class="pill">{{ $package->duration_days }} {{ $locale === 'id' ? 'Hari' : 'Days' }}</span>
    <span style="display:inline-block; width:8px;"></span>
    <span class="pill">{{ $package->departure_city }}</span>
</div>
