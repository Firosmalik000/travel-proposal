@php
    $locale = $locale ?? 'id';
@endphp

<div style="padding-bottom: 6px;">
    @include('pdf.partials.letterhead', [
        'branding' => $branding,
        'seo' => $seo,
        'locale' => $locale,
        'generatedAt' => $generatedAt,
    ])
</div>

