<!doctype html>
<html lang="{{ $locale }}">
    <head>
        <meta charset="utf-8" />
        <style>
            body {
                font-family: dejavusans, sans-serif;
                font-size: 11px;
                color: #0f172a;
            }
            .muted {
                color: #475569;
            }
            .title {
                font-size: 20px;
                font-weight: 900;
                margin: 18px 0 6px 0;
            }
            .excerpt {
                font-size: 11px;
                line-height: 1.55;
                margin: 0 0 14px 0;
                color: #334155;
            }
            .card {
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 16px 16px;
                background: #ffffff;
            }
            h2 {
                font-size: 14px;
                margin: 16px 0 6px 0;
                color: #0f172a;
            }
            h3 {
                font-size: 12px;
                margin: 12px 0 4px 0;
                color: #0f172a;
            }
            p {
                margin: 8px 0;
                line-height: 1.65;
                color: #0f172a;
            }
            ul {
                margin: 8px 0 8px 18px;
            }
            li {
                margin: 4px 0;
                line-height: 1.6;
            }
            a {
                color: #8e101b;
                text-decoration: underline;
            }
            .footer-note {
                margin-top: 14px;
                padding-top: 10px;
                border-top: 1px solid #e2e8f0;
                font-size: 9px;
                color: #64748b;
            }
        </style>
    </head>
    <body>
        @include('pdf.partials.letterhead', ['branding' => $branding, 'seo' => $seo, 'locale' => $locale, 'generatedAt' => $generatedAt])

        <div class="title">{{ $title }}</div>
        @if (trim($excerpt) !== '')
            <div class="excerpt">{{ $excerpt }}</div>
        @endif

        <div class="card">
            @if (trim($bodyHtml) !== '')
                {!! $bodyHtml !!}
            @else
                <p class="muted">
                    {{ $locale === 'id' ? 'Konten belum diisi.' : 'Content has not been filled in yet.' }}
                </p>
            @endif

            <div class="footer-note">
                {{ $locale === 'id' ? 'Dokumen ini dihasilkan otomatis dari Portal Content (Policy & Help).' : 'This document is generated automatically from Portal Content (Policy & Help).' }}
            </div>
        </div>
    </body>
</html>

