{{-- Title --}}
<div style="text-align: center; font-size: 10pt; font-weight: bold; margin: 5px 0 8px 0; text-decoration: underline;">
    SURAT PENUNJUKAN PENANGGUNG JAWAB BARANG PERUSAHAAN
</div>

{{-- Letter Number --}}
{{-- <div style="text-align: center; font-size: 8pt; margin: 0 0 12px 0;">
    Nomor: INV-{{ substr(time(), -6) }}/SPTJ/HRD/{{ date('m') }}/{{ date('Y') }}
</div> --}}

{{-- Recipient --}}
<div style="text-align: justify; line-height: 1.5; margin: 0 0 8px 0; font-size: 9pt;">
    Kepada Yth,
</div>

<table style="width: 100%; margin: 0 0 12px 0; border-collapse: collapse;">
    <tr>
        <td style="width: 30%; padding: 2px 0; vertical-align: top; font-size: 9pt;">Nama</td>
        <td style="width: 3%; padding: 2px 0; vertical-align: top; font-size: 9pt;">:</td>
        <td style="width: 67%; padding: 2px 0; vertical-align: top; font-size: 9pt;"><strong>{{ $karyawan->nama_lengkap ?? '-' }}</strong></td>
    </tr>
    <tr>
        <td style="padding: 2px 0; vertical-align: top; font-size: 9pt;">Jabatan</td>
        <td style="padding: 2px 0; vertical-align: top; font-size: 9pt;">:</td>
        <td style="padding: 2px 0; vertical-align: top; font-size: 9pt;">{{ $karyawan->jabatan->name ?? '-' }}</td>
    </tr>
    <tr>
        <td style="padding: 2px 0; vertical-align: top; font-size: 9pt;">No. KTP</td>
        <td style="padding: 2px 0; vertical-align: top; font-size: 9pt;">:</td>
        <td style="padding: 2px 0; vertical-align: top; font-size: 9pt;">{{ $karyawan->no_ktp ?? '-' }}</td>
    </tr>
</table>

{{-- Statement --}}
<div style="text-align: justify; line-height: 1.5; margin: 0 0 10px 0; font-size: 9pt;">
    Dengan ini ditunjuk sebagai penanggung jawab atas barang-barang inventaris perusahaan sebagai berikut:
</div>

{{-- Inventaris Table --}}
<table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 8pt;">
    <thead>
        <tr style="background-color: #ED1C24; color: white;">
            <th style="border: 1px solid #ccc; padding: 5px; text-align: center; width: 30px; font-size: 8pt;">No.</th>
            <th style="border: 1px solid #ccc; padding: 5px; text-align: left; font-size: 8pt;">Nama Barang</th>
            <th style="border: 1px solid #ccc; padding: 5px; text-align: left; font-size: 8pt;">Merk/Tipe/Colour</th>
            <th style="border: 1px solid #ccc; padding: 5px; text-align: left; width: 75px; font-size: 8pt;">Nomor Aset</th>
            <th style="border: 1px solid #ccc; padding: 5px; text-align: center; width: 50px; font-size: 8pt;">Kondisi</th>
            <th style="border: 1px solid #ccc; padding: 5px; text-align: left; font-size: 8pt;">Keterangan</th>
        </tr>
    </thead>
    <tbody>
        @foreach($items as $index => $item)
        <tr style="background-color: {{ $index % 2 == 0 ? '#f9f9f9' : 'white' }};">
            <td style="border: 1px solid #ccc; padding: 4px; text-align: center; font-size: 8pt;">{{ $index + 1 }}</td>
            <td style="border: 1px solid #ccc; padding: 4px; font-size: 8pt;">{{ $item->nama_barang }}</td>
            <td style="border: 1px solid #ccc; padding: 4px; font-size: 8pt;">{{ $item->merek_model ?? '-' }}</td>
            <td style="border: 1px solid #ccc; padding: 4px; font-size: 8pt;">{{ $item->kode_barang ?? '-' }}</td>
            <td style="border: 1px solid #ccc; padding: 4px; text-align: center; font-size: 8pt;">{{ ucfirst($item->kondisi) }}</td>
            <td style="border: 1px solid #ccc; padding: 4px; font-size: 8pt;">{{ $item->keterangan ?? '-' }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

{{-- Terms and Conditions --}}
<div style="margin: 10px 0;">
    <p style="margin: 4px 0 6px 0; font-weight: bold; font-size: 9pt;">Ketentuan:</p>
    <ol style="margin: 0; padding-left: 18px; line-height: 1.5; font-size: 8pt;">
        <li style="text-align: justify; margin-bottom: 2px;">Barang tersebut merupakan inventaris perusahaan dan diberikan untuk menunjang pelaksanaan tugas pekerjaan.</li>
        <li style="text-align: justify; margin-bottom: 2px;">PIC berkewajiban untuk menjaga, merawat, dan menggunakan barang sesuai kebutuhan pekerjaan.</li>
        <li style="text-align: justify; margin-bottom: 2px;">Barang tidak boleh dipindahtangankan, dipinjamkan, atau digunakan untuk keperluan pribadi tanpa izin perusahaan.</li>
        <li style="text-align: justify; margin-bottom: 2px;">Apabila terjadi kerusakan, kehilangan, atau penyalahgunaan, maka PIC bertanggung jawab penuh atas penggantian sesuai kebijakan perusahaan.</li>
        <li style="text-align: justify;">Barang wajib dikembalikan apabila karyawan berhenti bekerja, dipindahkan, atau atas permintaan manajemen.</li>
    </ol>
</div>

{{-- Closing Statement --}}
<div style="text-align: justify; line-height: 1.5; margin: 10px 0 15px 0; font-size: 8pt;">
    Demikian surat penunjukan ini dibuat untuk dipergunakan sebagaimana mestinya. Atas perhatian dan tanggung jawab Saudara, kami ucapkan terima kasih.
</div>



{{-- Signatures --}}
<table style="width: 100%; margin-top: 0px; font-size: 9pt;">
    <tr>
        <td style="width: 50%; vertical-align: top; padding-right: 20px;">
            <div style="font-weight: bold; font-size: 9pt; line-height: 1.4; margin-bottom: 2px;">Hormat Kami,</div>
            <div style="font-weight: bold; font-size: 9pt; line-height: 1.4; margin-bottom: 2px;">PT XBOSS ASIA GROUP</div>
            {{-- Spacer untuk membuat jarak tinggi 700px sebelum tanda tangan --}}
            <table style="width:100%; border-collapse:collapse; margin-top: 10px;">
                <tr>
                    <td style="height:70px; font-size:1px; line-height:1px;">&nbsp;</td>
                </tr>
            </table>
            <div style="font-weight: bold; font-size: 9pt; line-height: 1.3; margin-top: 18px; margin-bottom: 2px;">Asiyah</div>
            <div style="font-size: 8pt; line-height: 1.3;">HRD/Manajer Operasional</div>
        </td>

        <td style="width: 50%; vertical-align: top; padding-left: 20px;">
            <div style="font-size: 9pt; line-height: 1.4; margin-bottom: 2px;">Tangerang Selatan, {{ now()->locale('id')->translatedFormat('d F Y') }}</div>
            <div style="font-weight: bold; font-size: 9pt; line-height: 1.4; margin-bottom: 2px;">Mengetahui/Menerima</div>
            {{-- Spacer untuk membuat jarak tinggi 700px sebelum tanda tangan --}}
            <table style="width:100%; border-collapse:collapse; margin-top: 10px;">
                <tr>
                    <td style="height:70px; font-size:1px; line-height:1px;">&nbsp;</td>
                </tr>
            </table>
            <div style="font-weight: bold; font-size: 9pt; line-height: 1.3; margin-top: 18px; margin-bottom: 2px;">{{ $karyawan->nama_lengkap ?? '___________________' }}</div>
            <div style="font-size: 8pt; line-height: 1.3;">{{ $karyawan->jabatan->name ?? '_____________' }}</div>
        </td>
    </tr>
</table>
