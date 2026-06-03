@extends('pdf.layout')

@section('title', $title)

@push('styles')
    <style>
        .title {
            font-size: 20px;
            font-weight: 900;
            margin: 18px 0 6px 0;
        }
        .excerpt {
            font-size: 11px;
            line-height: 1.55;
            margin: 0 0 14px 0;
            color: #334155;
        }
        .card {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 16px;
            background: #ffffff;
        }
        h3 {
            font-size: 12px;
            margin: 12px 0 4px 0;
            color: #0f172a;
        }
        p {
            margin: 8px 0;
            line-height: 1.65;
            color: #0f172a;
        }
        ul {
            margin: 8px 0 8px 18px;
        }
        li {
            margin: 4px 0;
            line-height: 1.6;
        }
        a {
            color: #8e101b;
            text-decoration: underline;
        }
        .footer-note {
            margin-top: 14px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-size: 9px;
            color: #64748b;
        }
    </style>
@endpush

@section('content')
    @include('pdf.portal-page.header')
    @include('pdf.portal-page.body')
@endsection
