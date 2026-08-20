@extends('pdf.layout')

@section('title', "Invoice Pembayaran {$invoiceNumber}")

@php
    $formatMoney = static fn (int $amount): string => $currency.' '.number_format($amount, 0, ',', '.');
    $statusConfirmed = $invoice['status'] === 'confirmed';
    $paymentMethods = [
        'transfer' => 'Transfer Bank',
        'bank_transfer' => 'Transfer Bank',
        'cash' => 'Tunai',
        'debit_card' => 'Kartu Debit',
        'credit_card' => 'Kartu Kredit',
        'qris' => 'QRIS',
        'e_wallet' => 'Dompet Digital',
    ];
@endphp

@push('styles')
    <style>
        .document-header { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .document-header td { border: 0; padding: 0; vertical-align: top; }
        .document-title { font-size: 17px; font-weight: 800; color: #0f172a; }
        .document-number { margin-top: 4px; font-size: 10px; font-weight: 700; color: #475569; }
        .status-box { padding: 8px 12px; border-radius: 8px; text-align: center; font-size: 10px; font-weight: 800; }
        .status-confirmed { color: #166534; background: #dcfce7; border: 1px solid #86efac; }
        .status-pending { color: #92400e; background: #fef3c7; border: 1px solid #fcd34d; }
        .meta td { border: 0; padding: 3px 0; }
        .meta .label { width: 31%; color: #64748b; }
        .meta .value { font-weight: 700; color: #0f172a; }
        .amount-box { margin-top: 12px; padding: 16px; border-radius: 10px; background: #0d5c52; color: #fff; }
        .amount-label { font-size: 9px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: #d1fae5; }
        .amount-value { margin-top: 5px; font-size: 21px; font-weight: 800; }
        .summary { margin-top: 12px; }
        .summary td { padding: 8px 10px; }
        .summary .value { text-align: right; font-weight: 700; white-space: nowrap; }
        .notice { margin-top: 12px; padding: 10px 12px; border-radius: 8px; color: #475569; background: #f8fafc; line-height: 1.55; }
    </style>
@endpush

@section('content')
    @include('pdf.partials.letterhead', compact('branding', 'seo', 'locale', 'generatedAt'))

    <table class="document-header">
        <tr>
            <td style="width: 68%">
                <div class="document-title">Invoice Pembayaran</div>
                <div class="document-number">{{ $invoiceNumber }}</div>
            </td>
            <td style="width: 32%; text-align: right">
                <div class="status-box {{ $statusConfirmed ? 'status-confirmed' : 'status-pending' }}">
                    {{ $statusConfirmed ? 'PEMBAYARAN BERHASIL' : 'MENUNGGU KONFIRMASI' }}
                </div>
            </td>
        </tr>
    </table>

    <div class="box">
        <table class="meta">
            @foreach ([
                ['Kode Booking', $booking->booking_code],
                ['Nama Jamaah', $booking->full_name],
                ['Paket', $packageName],
                ['Tanggal Pembayaran', $invoice['payment_date'] ? \Illuminate\Support\Carbon::parse($invoice['payment_date'])->locale('id')->translatedFormat('d F Y') : '-'],
                ['Metode Pembayaran', $paymentMethods[$invoice['payment_method']] ?? ucfirst(str_replace('_', ' ', $invoice['payment_method']))],
                ['Nomor Referensi', $invoice['reference_number'] ?: '-'],
            ] as [$label, $value])
                <tr>
                    <td class="label">{{ $label }}</td>
                    <td class="value">{{ $value }}</td>
                </tr>
            @endforeach
        </table>
    </div>

    <div class="amount-box">
        <div class="amount-label">Nominal Transaksi</div>
        <div class="amount-value">{{ $formatMoney((int) $invoice['amount']) }}</div>
    </div>

    <table class="summary">
        <tr><td>Total tagihan booking</td><td class="value">{{ $formatMoney((int) $invoice['total_amount']) }}</td></tr>
        <tr><td>Total terverifikasi setelah transaksi ini</td><td class="value">{{ $formatMoney((int) $invoice['paid_after']) }}</td></tr>
        <tr><td>Sisa tagihan setelah transaksi ini</td><td class="value">{{ $formatMoney((int) $invoice['remaining_after']) }}</td></tr>
    </table>

    <div class="notice">
        @if ($statusConfirmed)
            Pembayaran telah diverifikasi dan diperhitungkan pada total pembayaran booking.
        @else
            Dokumen ini merupakan konfirmasi pencatatan pembayaran. Nominal baru diperhitungkan setelah diverifikasi oleh tim kami.
        @endif
        @if ($invoice['notes'])
            <br><strong>Catatan:</strong> {{ $invoice['notes'] }}
        @endif
    </div>
@endsection
