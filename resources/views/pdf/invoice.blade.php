@extends('pdf.layout')

@section('title', "Invoice {$bookingCode}")

@push('styles')
    <style>
        .document-header {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
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
            margin-top: 3px;
            font-size: 9px;
            font-weight: 700;
            color: #334155;
            line-height: 1.35;
            letter-spacing: 0.3px;
        }
        .document-meta {
            display: inline-block;
            min-width: 150px;
            padding: 7px 10px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
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
        .invoice-table th,
        .invoice-table td {
            font-size: 9px;
            line-height: 1.35;
            padding: 5px 6px;
        }
        .invoice-table th {
            background: #f8fafc;
            color: #1e293b;
            font-weight: 700;
        }
        .invoice-table .number {
            text-align: center;
            white-space: nowrap;
        }
        .invoice-table .numeric {
            text-align: right;
            white-space: nowrap;
        }
        .totals td {
            border: 0;
            padding: 7px 10px;
        }
        .totals td:first-child {
            text-align: right;
            color: #475569;
            font-size: 9px;
            font-weight: 700;
        }
        .totals td:last-child {
            text-align: right;
            font-size: 11px;
            font-weight: 800;
            color: #0f172a;
        }
        .totals-row {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
        }
    </style>
@endpush

@section('content')
    @include('pdf.invoice.header')
    @include('pdf.invoice.body')
@endsection
