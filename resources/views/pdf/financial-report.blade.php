@extends('pdf.layout')

@section('title', 'Laporan Keuangan')

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
        .section-title { margin: 0 0 8px; font-size: 12px; color: #0f172a; }
        .section-subtitle { margin: -4px 0 8px; font-size: 8px; color: #64748b; }
        .page-break-before { page-break-before: always; }
        .avoid-break { page-break-inside: avoid; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        .summary-grid td { border: 0; padding: 4px 7px; }
        .summary-label { color: #64748b; font-size: 8px; }
        .summary-value { margin-top: 2px; color: #0f172a; font-size: 11px; font-weight: 700; }
        .status-note { margin-top: 8px; padding: 6px 8px; border-left: 3px solid #8e101b; background: #fff7ed; color: #7c2d12; font-size: 8px; }
    </style>
@endpush

@section('content')
    @include('pdf.financial-report.header')
    @include('pdf.financial-report.body')
@endsection
