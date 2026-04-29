@php
    $companyName = (string) ($branding['company_name'] ?? config('app.name'));
@endphp

<div style="border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 9px; color: #64748b;">
    <table width="100%" style="border-collapse: collapse;">
        <tr>
            <td style="text-align: left;">
                {{ $companyName }}
            </td>
            <td style="text-align: right;">
                Halaman {PAGENO} / {nbpg}
            </td>
        </tr>
    </table>
</div>

