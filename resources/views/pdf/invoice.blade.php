@extends('pdf.layout')

@section('title', "Invoice {$bookingCode}")

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
        .totals td {
            border: 0;
            padding: 6px 0;
        }
        .totals td:first-child {
            text-align: right;
            color: #555;
        }
        .totals td:last-child {
            text-align: right;
            font-weight: bold;
        }
    </style>
@endpush

@section('content')
    <h1>Invoice</h1>
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
                    <th style="width: 6%">No</th>
                    <th>Item</th>
                    <th style="width: 10%; text-align: right">Qty</th>
                    <th style="width: 18%; text-align: right">Harga Satuan</th>
                    <th style="width: 18%; text-align: right">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($lineItems as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $item['label'] }}</td>
                        <td style="text-align: right">{{ $item['qty'] }}</td>
                        <td style="text-align: right">
                            {{ $currency }} {{ number_format((float) $item['unit_price'], 0, ',', '.') }}
                        </td>
                        <td style="text-align: right">
                            {{ $currency }} {{ number_format((float) $item['amount'], 0, ',', '.') }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="totals" style="margin-top: 10px">
            <tr>
                <td style="width: 82%">Total</td>
                <td style="width: 18%">
                    {{ $currency }} {{ number_format((float) $totalAmount, 0, ',', '.') }}
                </td>
            </tr>
        </table>
    </div>
@endsection

