@extends('pdf.layout')

@section('title', 'Booking Listing')

@push('styles')
    <style>
        .meta td {
            border: 0;
            padding: 3px 0;
        }
        .meta td:first-child {
            width: 18%;
            color: #555;
        }
        th,
        td {
            font-size: 10px;
        }
    </style>
@endpush

@section('content')
    @include('pdf.booking-listing.header')
    @include('pdf.booking-listing.body')
@endsection
