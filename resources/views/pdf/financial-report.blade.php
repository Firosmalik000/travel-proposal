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
    @php
        $generatedAt = $generatedAt ?? now();
        $rows = is_array($rows ?? null) ? $rows : [];

        $currencyTotals = collect($rows)
            ->groupBy('currency')
            ->map(fn ($items) => [
                'bookings' => (int) collect($items)->sum('bookings'),
                'pax' => (int) collect($items)->sum('pax'),
                'amount' => (float) collect($items)->sum('amount'),
            ])
            ->sortByDesc('amount');

        $totalBookings = (int) collect($rows)->sum('bookings');
        $totalPax = (int) collect($rows)->sum('pax');
    @endphp

    <h1>Financial Report</h1>
    <p class="muted">Dicetak: {{ $generatedAt->format('Y-m-d H:i') }}</p>

    <div class="box">
        <table class="meta">
            <tr>
                <td>Filter Tipe Booking</td>
                <td><strong>{{ $filters['booking_type'] ?? 'all' }}</strong></td>
            </tr>
            <tr>
                <td>Filter Status</td>
                <td><strong>{{ $filters['status'] ?? 'all' }}</strong></td>
            </tr>
            <tr>
                <td>Total Bookings</td>
                <td><strong>{{ $totalBookings }}</strong></td>
            </tr>
            <tr>
                <td>Total Pax</td>
                <td><strong>{{ $totalPax }}</strong></td>
            </tr>
        </table>
    </div>

    <div class="box">
        <h2 style="margin: 0 0 8px 0; font-size: 12px;">Revenue per Currency</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 22%">Currency</th>
                    <th style="width: 18%; text-align: right;">Bookings</th>
                    <th style="width: 18%; text-align: right;">Pax</th>
                    <th style="text-align: right;">Revenue</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($currencyTotals as $currency => $total)
                    <tr>
                        <td><strong>{{ $currency }}</strong></td>
                        <td style="text-align: right">{{ $total['bookings'] }}</td>
                        <td style="text-align: right">{{ $total['pax'] }}</td>
                        <td style="text-align: right">
                            {{ $currency }} {{ number_format((float) ($total['amount'] ?? 0), 0, ',', '.') }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="muted">Tidak ada data.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="box">
        <h2 style="margin: 0 0 8px 0; font-size: 12px;">Breakdown</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 16%">Tipe</th>
                    <th style="width: 16%">Currency</th>
                    <th style="width: 16%; text-align: right;">Bookings</th>
                    <th style="width: 16%; text-align: right;">Pax</th>
                    <th style="text-align: right;">Revenue</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($rows as $row)
                    @php
                        $type = (string) ($row['booking_type'] ?? 'regular');
                        $currency = (string) ($row['currency'] ?? 'IDR');
                        $amount = (float) ($row['amount'] ?? 0);
                    @endphp
                    <tr>
                        <td>
                            <span class="badge badge-{{ $type === 'custom' ? 'custom' : 'regular' }}">
                                {{ $type }}
                            </span>
                        </td>
                        <td>{{ $currency }}</td>
                        <td style="text-align: right">{{ (int) ($row['bookings'] ?? 0) }}</td>
                        <td style="text-align: right">{{ (int) ($row['pax'] ?? 0) }}</td>
                        <td style="text-align: right">
                            {{ $currency }} {{ number_format($amount, 0, ',', '.') }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="muted">Tidak ada data.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection