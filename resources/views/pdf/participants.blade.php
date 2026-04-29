<!doctype html>
<html lang="id">
    <head>
        <meta charset="utf-8" />
        <title>Data Peserta {{ $bookingCode }}</title>
        <style>
            * {
                font-family: DejaVu Sans, Arial, sans-serif;
                font-size: 11px;
            }
            h1 {
                font-size: 16px;
                margin: 0;
                padding: 0;
            }
            .muted {
                color: #666;
            }
            .box {
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 10px;
                margin-top: 10px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th,
            td {
                border: 1px solid #ddd;
                padding: 6px;
                vertical-align: top;
            }
            th {
                background: #f5f5f5;
                text-align: left;
            }
            .meta td {
                border: 0;
                padding: 3px 0;
            }
            .meta td:first-child {
                width: 26%;
                color: #555;
            }
        </style>
    </head>
    <body>
        <h1>Data Peserta ({{ $bookingCode }})</h1>
        <p class="muted">Dicetak: {{ now()->format('Y-m-d H:i') }}</p>

        <div class="box">
            <table class="meta">
                @foreach ($metaRows as [$label, $value])
                    <tr>
                        <td>{{ $label }}</td>
                        <td><strong>{{ $value }}</strong></td>
                    </tr>
                @endforeach
            </table>
        </div>

        <div class="box">
            <table>
                <thead>
                    <tr>
                        <th style="width: 7%">No</th>
                        <th>Nama Peserta</th>
                        <th style="width: 18%">No Paspor</th>
                        <th style="width: 18%">NIK</th>
                        <th style="width: 20%">Tgl Lahir</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($participantRows as $row)
                        <tr>
                            <td>{{ $row[0] }}</td>
                            <td>{{ $row[1] }}</td>
                            <td>{{ $row[2] }}</td>
                            <td>{{ $row[3] }}</td>
                            <td>{{ $row[4] }}</td>
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
    </body>
</html>

