<div class="box">
    <table class="meta">
        @foreach ($metaRows as [$label, $value])
            <tr>
                <td class="label">{{ $label }}</td>
                <td class="colon">:</td>
                <td class="value">{{ $value }}</td>
            </tr>
        @endforeach
    </table>
</div>

<div class="box">
    <table class="participant-table">
        <thead>
            <tr>
                <th style="width: 6%">No</th>
                <th style="width: 24%">Nama Peserta</th>
                <th style="width: 11%">Gender</th>
                <th style="width: 20%">Tempat / Tgl Lahir</th>
                <th style="width: 13%">Status</th>
                <th style="width: 14%">Paspor</th>
                <th style="width: 12%">Catatan</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($participantRows as $row)
                <tr>
                    <td class="participant-number">{{ $row['number'] }}</td>
                    <td class="{{ trim((string) $row['full_name']) === '' ? 'participant-empty' : '' }}">{{ $row['full_name'] !== '' ? $row['full_name'] : '-' }}</td>
                    <td>{{ $row['gender'] !== '' ? $row['gender'] : '-' }}</td>
                    <td>{{ $row['birth'] !== '' ? $row['birth'] : '-' }}</td>
                    <td>{{ $row['marital_status'] !== '' ? $row['marital_status'] : '-' }}</td>
                    <td>{{ $row['passport'] !== '' ? $row['passport'] : '-' }}</td>
                    <td>{{ $row['special_notes'] !== '' ? $row['special_notes'] : '-' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>

@if (trim($notes) !== '')
    <div class="box">
        <strong>Catatan</strong>
        <div style="margin-top: 6px">{!! nl2br(e($notes)) !!}</div>
    </div>
@endif
