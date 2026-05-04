@extends('emails.layouts.base', [
    'title' => 'Notifikasi Pendaftaran Paket',
    'subtitle' => 'Ada pendaftaran paket baru dari website.',
])

@section('content')
    <h1 style="margin: 0 0 8px; font-size: 22px; line-height: 1.3;">
        Ada pendaftaran paket baru
    </h1>
    <p style="margin: 0 0 24px; font-size: 14px; color: #475569;">
        Seorang customer baru saja mengisi form pendaftaran paket umroh.
    </p>

    <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="border-collapse: collapse;"
    >
        <tr>
            <td
                style="
                    padding: 10px 0;
                    border-bottom: 1px solid #e2e8f0;
                    width: 180px;
                    font-weight: bold;
                "
            >
                Nama
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $registration->full_name }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                No. WhatsApp
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $registration->phone }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Email
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $registration->email ?: '-' }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Kota Asal
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $registration->origin_city }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Jumlah Jamaah
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $registration->passenger_count }} pax
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Paket
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $registration->package?->name ?? $registration->package?->code ?? '-' }}
                @if($registration->package?->code)
                    ({{ $registration->package->code }})
                @endif
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Jadwal
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $registration->departureSchedule?->departure_date?->translatedFormat('d F Y') ?? '-' }}
                @if($registration->departureSchedule?->departure_city)
                    - {{ $registration->departureSchedule->departure_city }}
                @endif
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Catatan
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $registration->notes ?: '-' }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; font-weight: bold;">Status</td>
            <td style="padding: 10px 0;">{{ $registration->status }}</td>
        </tr>
    </table>
@endsection
