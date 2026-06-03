@extends('pdf.layout')

@section('title', 'Financial Report')

@push('styles')
    <style>
        .meta td {
            border: 0;
            padding: 3px 0;
        }
        .meta td:first-child {
            width: 22%;
            color: #555;
        }
        th,
        td {
            font-size: 10px;
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
