@php
    /** @var string|null $title */
    /** @var string|null $subtitle */

    $title = $title ?? config('app.name');
    $companyName = (string) (config('branding.company_name') ?? config('app.name'));
    $companySubtitle = (string) (config('branding.company_subtitle') ?? '');
    $logoPath = config('branding.logo_path');
    $logoUrl = $logoPath ? url($logoPath) : null;
@endphp

<!doctype html>
<html lang="id">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{{ $title }}</title>
    </head>
    <body
        style="
            margin: 0;
            padding: 24px;
            background: #f5f7fb;
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
                Helvetica, Arial;
            color: #0f172a;
        "
    >
        <div
            style="
                max-width: 680px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                padding: 28px;
                border: 1px solid #e2e8f0;
            "
        >
            <div style="display: flex; align-items: center; gap: 12px; margin: 0 0 20px;">
                @if($logoUrl)
                    <img
                        src="{{ $logoUrl }}"
                        alt="{{ $companyName }}"
                        style="height: 36px; width: auto; display: block;"
                    />
                @endif

                <div style="min-width: 0;">
                    <div style="font-weight: 700; line-height: 1.2; font-size: 14px;">
                        {{ $companyName }}
                    </div>
                    @if($companySubtitle !== '')
                        <div style="color: #64748b; font-size: 12px; line-height: 1.2;">
                            {{ $companySubtitle }}
                        </div>
                    @endif
                </div>
            </div>

            @if(isset($subtitle) && $subtitle)
                <p style="margin: 0 0 18px; font-size: 14px; color: #475569;">
                    {{ $subtitle }}
                </p>
            @endif

            @yield('content')

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #64748b;">
                    Email ini dikirim otomatis oleh {{ $companyName }}.
                </p>
            </div>
        </div>
    </body>
</html>

