@include('pdf.partials.letterhead', [
    'branding' => $branding,
    'seo' => $seo,
    'locale' => $locale,
    'generatedAt' => $generatedAt,
])

<div class="title">{{ $title }}</div>
@if (trim($excerpt) !== '')
    <div class="excerpt">{{ $excerpt }}</div>
@endif
