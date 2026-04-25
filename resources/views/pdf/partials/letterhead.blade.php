@php
    $companyName = (string) ($branding['company_name'] ?? config('app.name'));
    $companySubtitle = (string) ($branding['company_subtitle'] ?? '');
    $logo = $branding['logo_data_uri'] ?? null;
    $phone = (string) data_get($seo, 'contact.phone', '');
    $whatsapp = (string) data_get($seo, 'contact.whatsapp', '');
    $email = (string) data_get($seo, 'contact.email', '');
    $address = (string) data_get($seo, 'contact.address.full.'.$locale, data_get($seo, 'contact.address.full.id', ''));

    $contactParts = array_values(array_filter([
        $phone ? 'Tel: '.$phone : null,
        $whatsapp ? 'WA: '.$whatsapp : null,
        $email ? $email : null,
    ]));
@endphp

<table width="100%" style="border-collapse: collapse;">
    <tr>
        <td style="width: 76px; vertical-align: top;">
            @if ($logo)
                <img src="{{ $logo }}" style="width: 64px; height: 64px; object-fit: contain;" alt="Logo" />
            @else
                <div style="width: 64px; height: 64px; border-radius: 14px; background: #111827;"></div>
            @endif
        </td>
        <td style="vertical-align: top;">
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.15;">
                {{ $companyName }}
            </div>
            @if (trim($companySubtitle) !== '')
                <div style="margin-top: 2px; font-size: 10px; letter-spacing: 1.6px; color: #475569; text-transform: uppercase;">
                    {{ $companySubtitle }}
                </div>
            @endif
            @if (count($contactParts) > 0)
                <div style="margin-top: 6px; font-size: 9px; color: #334155;">
                    {{ implode(' | ', $contactParts) }}
                </div>
            @endif
            @if (trim($address) !== '')
                <div style="margin-top: 2px; font-size: 9px; color: #334155;">
                    {{ $address }}
                </div>
            @endif
        </td>
        <td style="width: 190px; text-align: right; vertical-align: top;">
            <div style="display: inline-block; padding: 10px 12px; border-radius: 14px; border: 1px solid #e2e8f0; background: #f8fafc;">
                <div style="font-size: 9px; letter-spacing: 1.4px; color: #64748b; text-transform: uppercase;">
                    {{ $locale === 'id' ? 'Tanggal' : 'Date' }}
                </div>
                <div style="margin-top: 2px; font-size: 11px; font-weight: 700; color: #0f172a;">
                    {{ $generatedAt->format('d M Y') }}
                </div>
            </div>
        </td>
    </tr>
</table>

<div style="margin-top: 10px; height: 3px; border-radius: 999px; background: linear-gradient(90deg, #5d0812 0%, #8e101b 35%, #bd3122 65%, #e69c32 100%);"></div>

