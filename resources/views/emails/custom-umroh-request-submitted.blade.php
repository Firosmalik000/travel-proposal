@extends('emails.layouts.base', [
    'title' => 'Notifikasi Custom Umroh Request',
    'subtitle' => 'Ada custom request umroh baru dari website.',
])

@section('content')
    <h1 style="margin: 0 0 8px; font-size: 22px; line-height: 1.3;">
        Ada custom request umroh baru
    </h1>
    <p style="margin: 0 0 24px; font-size: 14px; color: #475569;">
        Seorang customer baru saja mengisi form custom umroh.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; width: 180px; font-weight: bold;">
                Kode Request
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->request_code }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; width: 180px; font-weight: bold;">
                Nama
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->full_name }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                No. WhatsApp
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->phone }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Email
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->email ?: '-' }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Kota Asal
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->origin_city }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Jumlah Jamaah
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->passenger_count }} pax
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Tipe Rombongan
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->group_type }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Bulan Keberangkatan
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->departure_month }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Budget
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->budget ? number_format((int) $customUmrohRequest->budget, 0, ',', '.') : '-' }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Focus
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->focus }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Preferensi Kamar
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->room_preference }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: bold;">
                Catatan
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                {{ $customUmrohRequest->notes ?: '-' }}
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 0; font-weight: bold;">Status</td>
            <td style="padding: 10px 0;">{{ $customUmrohRequest->status }}</td>
        </tr>
    </table>
@endsection
