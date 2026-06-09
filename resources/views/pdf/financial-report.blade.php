@extends('pdf.layout')

@section('title', 'Financial Report')

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
        .meta td {
            border: 0;
            padding: 2px 0;
            vertical-align: top;
        }
        .meta .label {
            width: 22%;
            color: #555;
            font-size: 9px;
        }
        .meta .colon {
            width: 3%;
            text-align: center;
            color: #555;
            font-size: 9px;
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
        .report-table th,
        .report-table td {
            font-size: 9px;
            line-height: 1.35;
            padding: 5px 6px;
        }
        .report-table th {
            background: #f8fafc;
            color: #1e293b;
            font-weight: 700;
        }
        .report-table .numeric {
            text-align: right;
            white-space: nowrap;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 600;
            text-transform: capitalize;
        }
        .badge-regular {
            background: #e0f2fe;
            color: #075985;
        }
        .badge-custom {
            background: #ede9fe;
            color: #5b21b6;
        }
    </style>
@endpush

@section('content')
    @include('pdf.financial-report.header')
    @include('pdf.financial-report.body')
@endsection
