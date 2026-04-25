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
            .title {
                font-size: 20px;
                font-weight: 900;
                margin: 18px 0 10px 0;
            }
            .subtitle {
                font-size: 11px;
                color: #334155;
                margin: 0 0 14px 0;
                line-height: 1.6;
            }
            .pill {
                display: inline-block;
                padding: 6px 10px;
                border-radius: 999px;
                border: 1px solid #e2e8f0;
                background: #f8fafc;
                font-size: 9px;
                color: #475569;
                letter-spacing: 1.4px;
                text-transform: uppercase;
            }
            .grid {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }
            .grid td {
                vertical-align: top;
                padding: 10px 10px;
            }
            .card {
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 14px 14px;
                background: #ffffff;
            }
            h2 {
                font-size: 13px;
                margin: 0 0 8px 0;
                color: #0f172a;
            }
            p {
                margin: 8px 0;
                line-height: 1.65;
            }
            ul {
                margin: 6px 0 0 18px;
            }
            li {
                margin: 4px 0;
                line-height: 1.55;
            }
            .meta {
                font-size: 10px;
                color: #334155;
                line-height: 1.55;
            }
            .meta strong {
                color: #0f172a;
            }
            .waterline {
                margin-top: 14px;
                height: 2px;
                border-radius: 999px;
                background: #e2e8f0;
            }
            .note {
                margin-top: 10px;
                font-size: 9px;
                color: #64748b;
                line-height: 1.55;
            }
        </style>
    </head>
    <body>
        @include('pdf.partials.letterhead', ['branding' => $branding, 'seo' => $seo, 'locale' => $locale, 'generatedAt' => $generatedAt])

        <div class="title">{{ $locale === 'id' ? 'SK Paket Umroh' : 'Umrah Package Terms Summary' }}</div>
        <div class="subtitle">
            <span class="pill">{{ $package->code }}</span>
            <span style="display:inline-block; width:8px;"></span>
            <span class="pill">{{ $package->duration_days }} {{ $locale === 'id' ? 'Hari' : 'Days' }}</span>
            <span style="display:inline-block; width:8px;"></span>
            <span class="pill">{{ $package->departure_city }}</span>
        </div>

        <div class="card">
            <h2>{{ $name }}</h2>
            @if (trim($summary) !== '')
                <p style="color:#334155;">{{ $summary }}</p>
            @endif

            <table class="grid">
                <tr>
                    <td style="width: 50%; padding-left: 0;">
                        <div class="card" style="background:#fbfdff;">
                            <h2>{{ $locale === 'id' ? 'Termasuk' : 'Included' }}</h2>
                            @if (count($included) > 0)
                                <ul>
                                    @foreach ($included as $item)
                                        <li>{{ $item }}</li>
                                    @endforeach
                                </ul>
                            @else
                                <p style="color:#64748b;">-</p>
                            @endif
                        </div>
                    </td>
                    <td style="width: 50%; padding-right: 0;">
                        <div class="card" style="background:#fffaf7;">
                            <h2>{{ $locale === 'id' ? 'Tidak Termasuk' : 'Excluded' }}</h2>
                            @if (count($excluded) > 0)
                                <ul>
                                    @foreach ($excluded as $item)
                                        <li>{{ $item }}</li>
                                    @endforeach
                                </ul>
                            @else
                                <p style="color:#64748b;">-</p>
                            @endif
                        </div>
                    </td>
                </tr>
            </table>

            <div style="margin-top: 12px;" class="card">
                <h2>{{ $locale === 'id' ? 'Kebijakan' : 'Policy' }}</h2>
                @if (trim($policy) !== '')
                    <p>{{ $policy }}</p>
                @else
                    <p style="color:#64748b;">-</p>
                @endif
                <div class="waterline"></div>
                <div class="note">
                    {{ $locale === 'id'
                        ? 'Untuk detail lengkap syarat & ketentuan portal, silakan lihat halaman Terms & Conditions.'
                        : 'For full portal terms and conditions, please refer to the Terms & Conditions page.' }}
                </div>
            </div>

            <div class="note">
                {{ $locale === 'id'
                    ? 'Dokumen ini dibuat untuk memudahkan calon jamaah membaca ringkasan kebijakan paket. Konten mengikuti data paket dan Portal Content.'
                    : 'This document helps customers read a package policy summary. Content follows package data and Portal Content.' }}
            </div>
        </div>
    </body>
</html>

