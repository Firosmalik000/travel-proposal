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
