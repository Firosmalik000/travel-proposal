@extends('pdf.layout')

@section('title', "Data Peserta {$bookingCode}")

@push('styles')
    <style>
        .meta td {
            border: 0;
            padding: 3px 0;
        }
        .meta td:first-child {
            width: 26%;
            color: #555;
        }
    </style>
@endpush

@section('content')
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
@endsection
