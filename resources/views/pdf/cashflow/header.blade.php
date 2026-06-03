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
            <div style="font-size: 14pt; font-weight: bold; color: #8e101b;">Laporan Cashflow</div>
            <div style="margin-top: 4px; font-size: 8pt; color: #475569;">
                Rekap transaksi kas masuk dan kas keluar
            </div>
        </td>
        <td style="width: 30%; text-align: right; vertical-align: top;">
            <div style="display: inline-block; padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; font-size: 8pt; color: #334155;">
                Hal: {PAGENO} / {nbpg}
            </div>
        </td>
    </tr>
</table>
