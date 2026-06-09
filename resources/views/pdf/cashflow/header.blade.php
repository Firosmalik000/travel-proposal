@php
    $locale = $locale ?? 'id';
@endphp

@include('pdf.partials.letterhead', [
    'branding' => $branding,
    'seo' => $seo,
    'locale' => $locale,
    'generatedAt' => $generatedAt,
])

<table width="100%" style="margin-top: 12px; border-collapse: collapse;">
    <tr>
        <td style="width: 70%; vertical-align: top;">
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; line-height: 1.2;">Laporan Cashflow</div>
            <div style="margin-top: 3px; font-size: 9px; font-weight: 700; color: #334155; line-height: 1.35; letter-spacing: 0.3px;">
                Rekap transaksi kas masuk dan kas keluar
            </div>
        </td>
        <td style="width: 30%; text-align: right; vertical-align: top;">
            <div style="display: inline-block; min-width: 150px; padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; font-size: 9px; font-weight: 700; color: #111827; line-height: 1.3;">
                Halaman: {PAGENO} / {nbpg}
            </div>
        </td>
    </tr>
</table>
