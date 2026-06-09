@php
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

<div class="box">
    <table class="meta">
        <tr>
            <td class="label">Filter Tipe Booking</td>
            <td class="colon">:</td>
            <td class="value"><strong>{{ $filters['booking_type'] ?? 'all' }}</strong></td>
        </tr>
        <tr>
            <td class="label">Filter Status</td>
            <td class="colon">:</td>
            <td class="value"><strong>{{ $filters['status'] ?? 'all' }}</strong></td>
        </tr>
        <tr>
            <td class="label">Total Bookings</td>
            <td class="colon">:</td>
            <td class="value"><strong>{{ $totalBookings }}</strong></td>
        </tr>
        <tr>
            <td class="label">Total Pax</td>
            <td class="colon">:</td>
            <td class="value"><strong>{{ $totalPax }}</strong></td>
        </tr>
    </table>
</div>

<div class="box">
    <h2 style="margin: 0 0 8px 0; font-size: 12px;">Revenue per Currency</h2>
    <table class="report-table">
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
                    <td class="numeric">{{ $total['bookings'] }}</td>
                    <td class="numeric">{{ $total['pax'] }}</td>
                    <td class="numeric">
                        {{ $currency }} {{ number_format((float) ($total['amount'] ?? 0), 0, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="muted" style="text-align: center;">Tidak ada data.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="box">
    <h2 style="margin: 0 0 8px 0; font-size: 12px;">Breakdown</h2>
    <table class="report-table">
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
                    <td class="numeric">{{ (int) ($row['bookings'] ?? 0) }}</td>
                    <td class="numeric">{{ (int) ($row['pax'] ?? 0) }}</td>
                    <td class="numeric">
                        {{ $currency }} {{ number_format($amount, 0, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="muted" style="text-align: center;">Tidak ada data.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</div>
