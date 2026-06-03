@extends('pdf.layout')

@section('title', "Invoice {$bookingCode}")

@push('styles')
    <style>
        .document-header {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
        }
        .document-header td {
            border: 0;
            vertical-align: top;
            padding: 0;
        }
        .document-title {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.2;
        }
        .document-subtitle {
            margin-top: 4px;
            font-size: 10px;
            font-weight: 700;
            color: #334155;
            line-height: 1.35;
        }
        .document-meta {
            display: inline-block;
            min-width: 170px;
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #f8fafc;
        }
        .document-meta-value {
            font-size: 9px;
            font-weight: 700;
            color: #111827;
            line-height: 1.3;
            white-space: nowrap;
        }
        .meta {
            table-layout: fixed;
        }
        .meta td {
            border: 0;
            padding: 2px 0;
            vertical-align: top;
        }
        .meta .label {
            width: 22%;
            font-size: 9px;
            color: #555;
        }
        .meta .colon {
            width: 3%;
            text-align: center;
            font-size: 9px;
            color: #555;
        }
        .meta .value {
            width: 75%;
            font-size: 9px;
            font-weight: 600;
            color: #111827;
            word-break: break-word;
            white-space: normal;
            line-height: 1.35;
            padding-left: 4px;
        }
        .totals td {
            border: 0;
            padding: 6px 0;
        }
        .totals td:first-child {
            text-align: right;
            color: #555;
        }
        .totals td:last-child {
            text-align: right;
            font-weight: bold;
        }
    </style>
@endpush

@section('content')
    @include('pdf.invoice.header')
    @include('pdf.invoice.body')
@endsection
