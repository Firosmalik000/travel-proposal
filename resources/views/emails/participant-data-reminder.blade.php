@extends('emails.layouts.base', ['title' => 'Lengkapi Data Peserta'])

@section('content')
    <h1 style="margin: 0 0 8px; font-size: 22px; line-height: 1.3;">Data Peserta Belum Lengkap</h1>
    <p style="margin: 0 0 18px; color: #475569; font-size: 14px;">
        Halo {{ $booking->full_name }}, data peserta untuk booking <strong>{{ $booking->booking_code }}</strong> masih perlu dilengkapi.
    </p>

    <table style="width: 100%; margin: 0 0 20px; border-collapse: separate; border-spacing: 8px; font-size: 13px;">
        <tr>
            <td style="padding: 12px; border-radius: 10px; background: #fff7ed;">
                <strong style="display: block; font-size: 18px;">{{ $summary['remaining_slots'] }}</strong>
                Slot belum diisi
            </td>
            <td style="padding: 12px; border-radius: 10px; background: #fff7ed;">
                <strong style="display: block; font-size: 18px;">{{ $summary['missing_fields_count'] }}</strong>
                Data belum lengkap
            </td>
            <td style="padding: 12px; border-radius: 10px; background: #fff7ed;">
                <strong style="display: block; font-size: 18px;">{{ $summary['missing_documents_count'] }}</strong>
                Dokumen kurang
            </td>
        </tr>
    </table>

    <p style="margin: 0;">
        <a href="{{ $participantsUrl }}" style="display: inline-block; padding: 11px 16px; border-radius: 10px; background: #0d5c52; color: #ffffff; text-decoration: none; font-weight: 700;">
            Lengkapi Data Peserta
        </a>
    </p>
@endsection
