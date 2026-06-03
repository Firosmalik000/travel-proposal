@extends('pdf.layout')

@section('title', $locale === 'id' ? 'SK Paket Umroh' : 'Umrah Package Terms Summary')

@push('styles')
    <style>
        .title {
            font-size: 20px;
            font-weight: 900;
            margin: 18px 0 10px 0;
        }
        .subtitle {
            font-size: 11px;
            color: #334155;
            margin: 0 0 14px 0;
            line-height: 1.6;
        }
        .pill {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            font-size: 9px;
            color: #475569;
            letter-spacing: 1.4px;
            text-transform: uppercase;
        }
        .grid td {
            border: 0;
            vertical-align: top;
            padding: 10px;
        }
        .card {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 14px;
            background: #ffffff;
        }
        .waterline {
            margin-top: 14px;
            height: 2px;
            border-radius: 999px;
            background: #e2e8f0;
        }
        .note {
            margin-top: 10px;
            font-size: 9px;
            color: #64748b;
            line-height: 1.55;
        }
    </style>
@endpush

@section('content')
    @include('pdf.package-sk.header')
    @include('pdf.package-sk.body')
@endsection
