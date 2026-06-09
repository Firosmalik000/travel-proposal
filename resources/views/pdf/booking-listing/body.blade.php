<div class="box">
    <table class="meta">
        <tr>
            <td class="label">Filter Status</td>
            <td class="colon">:</td>
            <td class="value"><strong>{{ $filters['status'] }}</strong></td>
        </tr>
        <tr>
            <td class="label">Paket</td>
            <td class="colon">:</td>
            <td class="value"><strong>{{ $filters['package_label'] }}</strong></td>
        </tr>
        <tr>
            <td class="label">Tipe Booking</td>
            <td class="colon">:</td>
            <td class="value"><strong>{{ $filters['booking_type'] ?? 'regular' }}</strong></td>
        </tr>
        <tr>
            <td class="label">Pencarian</td>
            <td class="colon">:</td>
            <td class="value"><strong>{{ $filters['search'] !== '' ? $filters['search'] : '-' }}</strong></td>
        </tr>
        <tr>
            <td class="label">Total Data</td>
            <td class="colon">:</td>
            <td class="value"><strong>{{ count($rows) }}</strong></td>
        </tr>
    </table>
</div>

<div class="box">
    <table class="listing-table">
        <thead>
            <tr>
                <th style="width: 5%">No</th>
                <th style="width: 16%">Kode</th>
                <th>Nama</th>
                <th style="width: 14%">WhatsApp</th>
                <th style="width: 14%">Kota Asal</th>
                <th style="width: 6%">Pax</th>
                <th style="width: 12%">Revenue</th>
                <th style="width: 17%">Paket</th>
                <th style="width: 13%">Berangkat</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $index => $row)
                <tr>
                    <td class="number">{{ $index + 1 }}</td>
                    <td>{{ $row['booking_code'] }}</td>
                    <td>{{ $row['full_name'] }}</td>
                    <td>{{ $row['phone'] }}</td>
                    <td>{{ $row['origin_city'] }}</td>
                    <td class="numeric">{{ $row['pax'] ?? '-' }}</td>
                    <td class="numeric">
                        {{ $row['revenue']['currency'] ?? 'IDR' }}
                        {{ number_format((float) ($row['revenue']['amount'] ?? 0), 0, ',', '.') }}
                    </td>
                    <td>{{ $row['package'] }}</td>
                    <td>{{ $row['departure'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="muted" style="text-align: center;">Tidak ada data.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</div>
