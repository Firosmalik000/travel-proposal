@extends('emails.layouts.base', ['title' => 'Pengingat Pembayaran Booking'])

@php
    $currency = $booking->agreed_currency ?? $booking->custom_currency ?? $booking->package?->currency ?? 'IDR';
    $formatMoney = static fn (int $amount): string => $currency.' '.number_format($amount, 0, ',', '.');
    $packageName = data_get($booking->package?->name, 'id', $booking->package?->code ?? 'Paket perjalanan');
@endphp

@section('content')
    <div style="margin-bottom: 22px; padding: 22px; border-radius: 16px; background: #0d5c52; color: #ffffff;">
        <p style="margin: 0 0 8px; color: #c9eee7; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;">
            Pengingat Pembayaran
        </p>
        <h1 style="margin: 0; font-size: 24px; line-height: 1.3;">Booking {{ $booking->booking_code }}</h1>
        <p style="margin: 8px 0 0; color: #e0f5f1; font-size: 14px; line-height: 1.6;">{{ $packageName }}</p>
    </div>

    <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.7;">
        Assalamu'alaikum Bapak/Ibu <strong>{{ $booking->full_name }}</strong>,
    </p>
    <p style="margin: 0 0 22px; color: #475569; font-size: 14px; line-height: 1.75;">
        Semoga Bapak/Ibu dalam keadaan sehat. Kami ingin mengingatkan dengan hormat bahwa pembayaran untuk booking di atas masih memiliki sisa tagihan. Berikut ringkasannya:
    </p>

    <table role="presentation" style="width: 100%; margin: 0 0 22px; border-collapse: collapse; border: 1px solid #dbe7e4; border-radius: 14px; font-size: 14px;">
        <tr>
            <td style="padding: 13px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Total tagihan</td>
            <td style="padding: 13px 16px; text-align: right; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{{ $formatMoney($summary['total_amount']) }}</td>
        </tr>
        <tr>
            <td style="padding: 13px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Sudah dibayar</td>
            <td style="padding: 13px 16px; text-align: right; color: #0d5c52; font-weight: 700; border-bottom: 1px solid #e2e8f0;">{{ $formatMoney($summary['paid_amount']) }}</td>
        </tr>
        <tr style="background: #fff8e8;">
            <td style="padding: 15px 16px; color: #7c5a16; font-weight: 700;">Sisa pembayaran</td>
            <td style="padding: 15px 16px; text-align: right; color: #9a6700; font-size: 18px; font-weight: 800;">{{ $formatMoney($summary['remaining_amount']) }}</td>
        </tr>
    </table>

    <p style="margin: 0 0 22px; color: #475569; font-size: 14px; line-height: 1.75;">
        Bapak/Ibu dapat melihat rincian pembayaran dan riwayat transaksi melalui tombol berikut. Jika pembayaran sudah dilakukan, mohon abaikan pesan ini atau hubungi tim kami agar dapat segera diverifikasi.
    </p>

    <p style="margin: 0 0 22px; text-align: center;">
        <a href="{{ $invoiceUrl }}" style="display: inline-block; padding: 13px 22px; border-radius: 11px; background: #0d5c52; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700;">
            Lihat Invoice &amp; Pembayaran
        </a>
    </p>

    <div style="padding: 14px 16px; border-radius: 12px; background: #f8fafc; color: #64748b; font-size: 12px; line-height: 1.65;">
        Pesan ini merupakan pengingat, bukan konfirmasi pembayaran. Status pembayaran diperbarui setelah transaksi diverifikasi oleh tim kami.
    </div>

    <p style="margin: 22px 0 0; font-size: 14px; line-height: 1.7;">
        Terima kasih atas kepercayaan Bapak/Ibu.<br>
        <strong>Tim {{ config('branding.company_name', config('app.name')) }}</strong>
    </p>
@endsection
