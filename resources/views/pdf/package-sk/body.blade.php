<div class="card">
    <h2>{{ $name }}</h2>
    @if (trim($summary) !== '')
        <p style="color:#334155;">{{ $summary }}</p>
    @endif

    <table class="grid">
        <tr>
            <td style="width: 50%; padding-left: 0;">
                <div class="card" style="background:#fbfdff;">
                    <h2>{{ $locale === 'id' ? 'Termasuk' : 'Included' }}</h2>
                    @if (count($included) > 0)
                        <ul>
                            @foreach ($included as $item)
                                <li>{{ $item }}</li>
                            @endforeach
                        </ul>
                    @else
                        <p style="color:#64748b;">-</p>
                    @endif
                </div>
            </td>
            <td style="width: 50%; padding-right: 0;">
                <div class="card" style="background:#fffaf7;">
                    <h2>{{ $locale === 'id' ? 'Tidak Termasuk' : 'Excluded' }}</h2>
                    @if (count($excluded) > 0)
                        <ul>
                            @foreach ($excluded as $item)
                                <li>{{ $item }}</li>
                            @endforeach
                        </ul>
                    @else
                        <p style="color:#64748b;">-</p>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <div style="margin-top: 12px;" class="card">
        <h2>{{ $locale === 'id' ? 'Kebijakan' : 'Policy' }}</h2>
        @if (trim($policy) !== '')
            <p>{{ $policy }}</p>
        @else
            <p style="color:#64748b;">-</p>
        @endif
        <div class="waterline"></div>
        <div class="note">
            {{ $locale === 'id'
                ? 'Untuk detail lengkap syarat & ketentuan portal, silakan lihat halaman Terms & Conditions.'
                : 'For full portal terms and conditions, please refer to the Terms & Conditions page.' }}
        </div>
    </div>

    <div class="note">
        {{ $locale === 'id'
            ? 'Dokumen ini dibuat untuk memudahkan calon jamaah membaca ringkasan kebijakan paket. Konten mengikuti data paket dan Portal Content.'
            : 'This document helps customers read a package policy summary. Content follows package data and Portal Content.' }}
    </div>
</div>
