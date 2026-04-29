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
    <h1>Booking Listing</h1>
    <p class="muted">Dicetak: {{ now()->format('Y-m-d H:i') }}</p>

    <div class="box">
        <table class="meta">
            <tr>
                <td>Filter Status</td>
                <td><strong>{{ $filters['status'] }}</strong></td>
            </tr>
            <tr>
                <td>Paket</td>
                <td><strong>{{ $filters['package_label'] }}</strong></td>
            </tr>
            <tr>
                <td>Pencarian</td>
                <td><strong>{{ $filters['search'] !== '' ? $filters['search'] : '-' }}</strong></td>
            </tr>
            <tr>
                <td>Total Data</td>
                <td><strong>{{ count($rows) }}</strong></td>
            </tr>
        </table>
    </div>

    <div class="box">
        <table>
            <thead>
                <tr>
                    <th style="width: 5%">No</th>
                    <th style="width: 16%">Kode</th>
                    <th>Nama</th>
                    <th style="width: 14%">WhatsApp</th>
                    <th style="width: 14%">Kota Asal</th>
                    <th style="width: 17%">Paket</th>
                    <th style="width: 13%">Berangkat</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $index => $row)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $row['booking_code'] }}</td>
                        <td>{{ $row['full_name'] }}</td>
                        <td>{{ $row['phone'] }}</td>
                        <td>{{ $row['origin_city'] }}</td>
                        <td>{{ $row['package'] }}</td>
                        <td>{{ $row['departure'] }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="muted">Tidak ada data.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection

