@php /** @var string $acceptUrl */ @endphp

@extends('emails.layouts.base', ['title' => 'Undangan Akun'])

@section('content')
    <h1 style="margin: 0 0 8px; font-size: 22px; line-height: 1.3;">Undangan Akun</h1>
    <p style="margin: 0 0 18px; font-size: 14px; color: #475569;">
        Anda mendapatkan undangan untuk membuat akun. Silakan klik tombol di bawah ini untuk mengatur password.
    </p>

    <p style="margin: 0 0 18px;">
        <a
            href="{{ $acceptUrl }}"
            style="
                display: inline-block;
                padding: 10px 14px;
                background: #0f172a;
                color: #ffffff;
                text-decoration: none;
                border-radius: 10px;
                font-weight: 600;
            "
        >
            Terima Undangan
        </a>
    </p>

    <p style="margin: 0 0 6px; color: #64748b; font-size: 13px;">
        Jika tombol tidak berfungsi, salin tautan ini:
    </p>
    <p style="margin: 0;">
        <a href="{{ $acceptUrl }}" style="color: #2563eb; word-break: break-all;">
            {{ $acceptUrl }}
        </a>
    </p>
@endsection
