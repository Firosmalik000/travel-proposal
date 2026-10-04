# Roadmap Sistem Keuangan Travel Umrah

Dokumen ini menjadi acuan utama pengembangan alur keuangan Asfar Tour agar perubahan berikutnya tetap konsisten, dapat diaudit, dan tidak memutus alur Booking, Payment, Cashflow, HPP, Inventory, Vendor, serta Komisi yang sudah berjalan.

## Status Dokumen

- Status keputusan: disepakati sebagai arah pengembangan.
- Status implementasi: engineering, regression test, rekonsiliasi data lama, dan UAT gabungan Tahap 0–6 selesai.
- Milestone engineering terakhir: Tahap 6 — selesai dan terverifikasi otomatis.
- Gate manual: UAT gabungan Tahap 0–6 dijalankan pada 21 September 2026; alur utama, tampilan desktop/mobile, dan dialog kontrol lolos setelah satu regresi Inventory diperbaiki.
- Gate data: 2 Booking Payment lama sudah direkonsiliasi ke Rekening Penampungan Jemaah pada 21 September 2026.
- Tahap aktif berikutnya: penggunaan operasional dan audit berkala; tidak ada tahap implementasi lanjutan yang masih terbuka.
- Tanggal pencatatan: 7 September 2026.
- Pengendali operasional: Admin internal, CS/Admin Booking, Finance/Admin Keuangan, dan Super Admin sesuai kewenangan.
- Payment gateway belum menjadi bagian dari ruang lingkup awal.

Implementasi awal sinkronisasi Booking Payment ke Cashflow dari migration `2026_09_07_043517_add_cashflow_id_and_attachment_to_booking_payments_table` telah dilengkapi dengan seluruh transisi status, rekonsiliasi data, proteksi record otomatis, dan regression test yang diperlukan.

## Tujuan

- Menjadikan transaksi keuangan sebagai satu sumber kebenaran untuk seluruh laporan.
- Menjaga uang jemaah terpisah dan dapat direkonsiliasi per rekening.
- Membedakan pergerakan kas, pendapatan, kewajiban, persediaan, HPP, OPEX, dan modal.
- Memastikan satu kejadian operasional hanya menghasilkan satu posting keuangan yang sah.
- Menjaga histori melalui reversal, bukan menghapus transaksi yang sudah diposting.
- Menyediakan laba aktual per trip dan laba rugi perusahaan tanpa perhitungan ganda.
- Mempertahankan flow Booking yang sudah berjalan, dengan kontrol keuangan sebagai lapisan tambahan.

## Prinsip Utama

### Cashflow bukan pendapatan

Uang yang bergerak masuk atau keluar langsung memengaruhi saldo kas/bank. Dampaknya terhadap laba rugi bergantung pada sifat transaksi.

| Transaksi                            | Dampak kas              | Dampak akuntansi utama                      |
| ------------------------------------ | ----------------------- | ------------------------------------------- |
| Pembayaran jemaah                    | Kas masuk saat diterima | Uang muka jemaah sampai layanan dipenuhi    |
| Modal pemilik                        | Kas masuk               | Ekuitas, bukan pendapatan                   |
| DP hotel/maskapai                    | Kas keluar              | Uang muka vendor, belum tentu langsung HPP  |
| Pembelian perlengkapan               | Kas keluar              | Persediaan bertambah                        |
| Perlengkapan diberikan kepada jemaah | Tidak ada kas baru      | Persediaan berkurang dan HPP trip bertambah |
| Gaji, sewa, ATK, dan marketing       | Kas keluar              | OPEX                                        |
| Transfer antar-rekening              | Kas berpindah           | Bukan pendapatan atau biaya                 |
| Refund jemaah                        | Kas keluar              | Pengurang kewajiban atau pendapatan terkait |

### Pembayaran jemaah bukan langsung revenue

Saat pembayaran jemaah dikonfirmasi:

```text
Debit  : Rekening Penampungan / Bank penerima
Kredit : Uang Muka Jemaah
```

Pendapatan diakui ketika kewajiban layanan telah dipenuhi dan trip telah diverifikasi. `end_date` hanya menjadi pengingat, bukan pemicu tunggal pengakuan pendapatan.

### Transaksi posted bersifat tetap

- Transaksi otomatis tidak boleh diedit atau dihapus langsung dari menu Cashflow.
- Koreksi harus dilakukan dari dokumen sumber, misalnya Booking Payment.
- Koreksi transaksi posted menghasilkan reversal dan posting pengganti.
- Setiap posting memiliki sumber, pembuat, pengonfirmasi, waktu, dan bukti yang dapat ditelusuri.

### Satu sumber transaksi

Booking Payment, tagihan vendor, pembayaran vendor, penerimaan/pengeluaran inventory, komisi, refund, modal, dan biaya operasional adalah dokumen sumber. Cashflow dan laporan laba rugi tidak menyimpan salinan angka yang dikelola terpisah; keduanya diturunkan dari transaksi keuangan yang sama.

### Landasan keputusan

- [PP Nomor 38 Tahun 2021](https://peraturan.bpk.go.id/Details/161922/pp-no-38-tahun-2021) menjadi rujukan pemisahan Rekening Penampungan BPIU dari rekening operasional PPIU di luar kegiatan umrah.
- [IAI — PSAK 72](https://web.iaiglobal.or.id/PSAK-Umum/83) menjadi rujukan bahwa pendapatan diakui ketika atau selama kewajiban pelaksanaan dipenuhi.
- [IFRS 15](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/) menjadi referensi prinsip pengakuan pendapatan dari kontrak pelanggan.

## Pembagian Akses

### Customer

- Melihat tagihan dan sisa pembayaran.
- Melihat histori pembayaran yang sudah dapat ditampilkan.
- Melihat invoice dan bukti pembayaran miliknya.
- Tidak dapat mem-posting, mengonfirmasi, mengoreksi, atau membatalkan transaksi keuangan.

### CS / Admin Booking

- Mencatat pembayaran sebagai `pending`.
- Mengunggah bukti pembayaran.
- Memperbaiki data sebelum dikonfirmasi sesuai izin.
- Tidak otomatis memperoleh hak mengonfirmasi transaksi keuangan.

### Finance / Admin Keuangan

- Memverifikasi bukti dan mutasi bank.
- Memilih rekening penerima atau rekening pembayar.
- Mengubah pembayaran menjadi `confirmed`.
- Menjalankan koreksi, void, refund, dan reversal sesuai kewenangan.
- Mengelola vendor, hutang, biaya aktual, modal, OPEX, dan rekonsiliasi.
- Menutup periode dan trip sesuai izin.

### Super Admin

- Memiliki seluruh kewenangan Finance.
- Mengelola akun keuangan, mapping kategori, saldo pembukaan, dan konfigurasi sistem.
- Membuka kembali periode hanya melalui proses yang tercatat dalam audit trail.

Jika saat ini pencatat dan pemeriksa pembayaran adalah admin yang sama, sistem tetap dapat mendukungnya. Walaupun orangnya sama, aktivitas harus disimpan terpisah melalui `recorded_by`, `confirmed_by`, `confirmed_at`, `reversed_by`, dan `reversed_at`.

## Arsitektur Target

### Dokumen sumber

- Booking Payment
- Customer Refund
- Vendor Bill
- Vendor Payment
- Inventory Purchase / Receipt
- Inventory Issue
- Agent Commission Payment
- Payroll / Operational Expense
- Capital Contribution / Owner Withdrawal
- Inter-account Transfer
- Opening Balance

### Inti keuangan

#### Financial Account

Minimal akun yang dibutuhkan:

- Rekening Penampungan Jemaah
- Bank Operasional
- Kas Kecil
- Piutang Jemaah
- Uang Muka Jemaah
- Uang Muka Vendor
- Persediaan
- Hutang Vendor
- Modal Pemilik
- Pendapatan Trip
- HPP Trip
- Komisi Agen
- OPEX

#### Financial Transaction

Menyimpan identitas transaksi, antara lain:

- nomor transaksi;
- tanggal kejadian dan tanggal posting;
- tipe dan sumber transaksi;
- source type dan source id;
- paket/trip terkait;
- mata uang asli, kurs snapshot, dan nilai dasar IDR;
- status draft, posted, atau reversed;
- idempotency key;
- reversal transaction id;
- pembuat, pengonfirmasi, dan waktu konfirmasi;
- deskripsi dan attachment.

#### Financial Transaction Line

Setiap transaksi memiliki baris debit dan kredit. Total debit wajib sama dengan total kredit. Database dan service harus menolak posting yang tidak seimbang.

### Laporan turunan

- Cashflow berasal dari baris transaksi yang menyentuh akun kas/bank.
- Saldo rekening berasal dari seluruh debit dan kredit rekening tersebut.
- P&L berasal dari akun pendapatan dan biaya.
- Laba trip berasal dari transaksi revenue dan expense yang memiliki package/trip id.
- Piutang dan hutang berasal dari dokumen sumber serta pembayaran yang dialokasikan.

## Urutan Implementasi

## Tahap 0 — Audit dan Pengamanan Kondisi Sekarang

### Tujuan

Mengetahui kondisi riil data sebelum membuat posting baru dan mencegah kerusakan dari implementasi parsial.

### Pekerjaan

1. Buat rekonsiliasi read-only untuk:
    - jumlah dan nilai Booking Payment `confirmed`;
    - confirmed payment dengan atau tanpa `cashflow_id`;
    - cashflow yang kehilangan Booking Payment sumber;
    - perbedaan nominal dan tanggal antara payment dan cashflow;
    - kemungkinan transaksi ganda;
    - status payment dan status cashflow yang tidak sesuai;
    - pembayaran per currency.
2. Tambahkan regression test untuk semua celah yang ditemukan.
3. Cegah cashflow yang berasal dari sistem agar tidak diedit atau dihapus manual.
4. Tentukan cut-off dan strategi backfill tanpa mengubah histori secara diam-diam.
5. Jangan mengubah migration yang sudah pernah dijalankan. Koreksi struktur menggunakan migration maju yang aman.
6. Jangan menghapus data lama. Data yang belum dapat diklasifikasikan diberi status `legacy_unclassified` untuk ditinjau admin.

### Kriteria Selesai

- Jumlah mismatch dan duplikat diketahui secara eksplisit.
- Tidak ada record otomatis baru yang dapat diputus melalui Cashflow manual.
- Tes reproduksi tersedia untuk setiap bug sinkronisasi.
- Tersedia laporan sebelum dan sesudah backfill.

### Gerbang Pemeriksaan

```text
Total payment confirmed yang sudah direkonsiliasi
= total penerimaan jemaah yang terhubung
= tidak ada transaksi aktif ganda
= tidak ada record sumber yang hilang
```

## Tahap 1 — Fondasi Akun dan Ledger

### Tujuan

Membentuk satu sumber kebenaran sebelum menambahkan otomatisasi transaksi lain.

### Pekerjaan

1. Tambahkan master `financial_accounts` dengan tipe asset, liability, equity, revenue, dan expense.
2. Tandai akun kas/bank, Rekening Penampungan, rekening operasional, dan kas kecil.
3. Tambahkan `financial_transactions` dan `financial_transaction_lines`.
4. Tambahkan currency, rate snapshot, amount original, dan amount IDR.
5. Tambahkan source link dan idempotency key dengan constraint database.
6. Tambahkan reversal relationship dan aturan immutable untuk transaksi posted.
7. Masukkan saldo awal melalui Opening Balance Transaction, bukan kolom saldo yang dapat diedit.
8. Tempatkan transaksi lama pada akun legacy/unclassified sampai admin mengklasifikasikannya.

### Kriteria Selesai

- Debit selalu sama dengan kredit.
- Saldo dapat dihitung per rekening.
- Rekening Penampungan terpisah dari rekening operasional.
- Transfer antar-rekening tidak memengaruhi laba.
- Retry transaksi dengan idempotency key yang sama tidak membuat duplikat.

## Tahap 2 — Booking Payment ke Keuangan

### Tujuan

Membuat penerimaan jemaah terhubung secara otomatis, konsisten, dan dapat diaudit tanpa mengubah flow Booking utama.

### State Transition

| Perubahan                    | Dampak keuangan                               |
| ---------------------------- | --------------------------------------------- |
| Membuat `pending`            | Tidak ada posting                             |
| `pending` ke `confirmed`     | Posting penerimaan jemaah satu kali           |
| Membuat langsung `confirmed` | Posting penerimaan jemaah satu kali           |
| Edit payment `pending`       | Tidak ada posting                             |
| Edit payment `confirmed`     | Reversal transaksi lama dan posting pengganti |
| `confirmed` ke `void`        | Reversal transaksi aktif                      |
| `confirmed` ke `pending`     | Reversal transaksi aktif                      |
| `void` ke `confirmed`        | Posting baru dengan histori tetap terjaga     |
| Request dikirim ulang        | Tidak membuat transaksi ganda                 |

### Pekerjaan

1. Gunakan Action/Service terpusat di dalam database transaction.
2. Lock Booking Payment dan sumber saldo yang terkait saat posting.
3. Wajibkan rekening penerima pada status confirmed.
4. Bukti pembayaran boleh kosong saat pending dan wajib saat confirmed, kecuali terdapat kebijakan override yang eksplisit dan diaudit.
5. Simpan nomor referensi bank, tanggal dana diterima, payment method, currency, dan kurs.
6. Buat posting:

```text
Debit  : Rekening Penampungan / Bank penerima
Kredit : Uang Muka Jemaah
```

7. Jadikan Cashflow otomatis read-only dan arahkan koreksi ke Booking Payment.
8. Jalankan backfill menggunakan urutan preview, persetujuan hasil, eksekusi idempotent, lalu rekonsiliasi ulang.

### Kriteria Selesai

- Semua state transition memiliki feature test.
- Total penerimaan per rekening sama dengan payment confirmed.
- Void dan koreksi tidak menghilangkan histori.
- Payment lama berhasil dipetakan atau masuk antrean review.
- Customer hanya melihat data pembayaran yang diizinkan.

## Tahap 3 — Modal, OPEX, Transfer, Refund, dan Komisi

**Status engineering: selesai dan terverifikasi otomatis. UAT manual ditunda sampai tahap akhir.**

### Tujuan

Mengklasifikasikan seluruh pergerakan kas non-vendor secara benar.

### Pekerjaan

1. Modal pemilik diposting ke ekuitas, bukan income.
2. Penarikan pemilik tidak diperlakukan sebagai biaya operasional.
3. Gaji, sewa, utilities, ATK, marketing, dan biaya kantor diposting sebagai OPEX.
4. Transfer antar-rekening membuat dua sisi kas yang terhubung dan tidak masuk P&L.
5. Refund wajib terhubung dengan Booking Payment/Booking asal.
6. Agent Commission berstatus `paid` membuat pengeluaran dari rekening yang dipilih.
7. Record sumber otomatis hanya dapat dikoreksi dari modul asal.

### Kriteria Selesai

- Modal tidak menambah omzet.
- Transfer tidak menggandakan pemasukan dan pengeluaran perusahaan.
- Refund mengurangi saldo dan kewajiban/pendapatan yang benar.
- Komisi paid memiliki transaksi keuangan tepat satu kali.
- Seluruh transaksi dapat ditelusuri ke admin dan dokumen sumber.

### Hasil Implementasi — 19 September 2026

- Setoran modal, prive pemilik, dan OPEX tersedia sebagai transaksi kas terklasifikasi dengan pasangan akun yang ditentukan sistem.
- Rekening Penampungan Jemaah tidak dapat dipakai untuk modal, prive, OPEX, atau pembayaran komisi.
- Akun `Prive Pemilik` ditambahkan sebagai akun ekuitas, sehingga penarikan pemilik tidak masuk biaya operasional.
- Refund dibuat dari Booking Payment asal, dibatasi maksimal nilai payment yang belum direfund, mengurangi Uang Muka Jemaah, serta dapat dikoreksi melalui reversal dari halaman sumber.
- Booking Payment yang memiliki refund aktif tidak dapat diedit atau dibatalkan sebelum refund dikoreksi.
- Komisi hanya dapat berstatus paid setelah approved dan wajib memilih rekening operasional/kas kecil, tanggal, kurs, dan nilai IDR.
- Pembayaran komisi membuat tepat satu jurnal biaya dan dapat dikoreksi dari modul Komisi tanpa menghapus histori.
- Retry transaksi terklasifikasi tetap idempotent; transaksi bersumber tidak dapat direversal langsung dari Ledger.
- Migration maju dijalankan tanpa reset database. Baseline 3 Booking Payment tetap utuh.
- Regression suite lintas Tahap 0–3 lulus 47 test dengan 417 assertion. TypeScript, ESLint terarah, Pint, dan audit ledger juga lulus.

## Tahap 4 — Vendor, HPP Aktual, dan Inventory

### Tujuan

Memisahkan estimasi biaya paket dari biaya yang benar-benar terjadi.

### HPP

- HPP yang sudah ada tetap dipakai sebagai estimasi/budget dan pricing snapshot.
- Biaya aktual berasal dari tagihan vendor, penggunaan inventory, komisi, dan transaksi aktual lainnya.
- Laporan menampilkan Budget, Actual, Variance, dan Margin.

### Vendor

```text
Tagihan vendor tercatat -> Hutang vendor
Bayar DP                 -> Uang muka vendor
Layanan digunakan trip   -> HPP aktual
Pelunasan                -> Hutang berkurang dan kas keluar
```

### Inventory

Target status inventory:

- `on_hand`: jumlah fisik yang dimiliki;
- `reserved`: dialokasikan untuk booking tetapi belum diserahkan;
- `available`: on hand dikurangi reserved;
- `issued`: telah diberikan dan dapat menjadi HPP trip.

Target flow:

```text
Pembelian inventory  -> on hand dan nilai persediaan bertambah
Booking registered   -> reserved bertambah
Booking cancelled    -> reserved dilepas
Barang diserahkan    -> issued bertambah, persediaan berkurang, HPP trip bertambah
```

Alokasi booking saat ini tidak boleh langsung dianggap sebagai bukti bahwa barang telah diberikan kepada jemaah.

### Kriteria Selesai

- Tagihan, DP, hutang, pelunasan, dan biaya vendor tidak dihitung ganda.
- Budget HPP tidak dianggap sebagai transaksi kas atau biaya aktual.
- On hand, reserved, available, dan issued dapat direkonsiliasi.
- Inventory menjadi HPP hanya ketika ada issue/serah-terima.
- Seluruh biaya langsung dapat ditelusuri ke paket/trip.

## Tahap 5 — Penyelesaian Trip dan Pengakuan Pendapatan

### Tujuan

Mengakui pendapatan berdasarkan penyelesaian layanan yang diverifikasi.

### Status Operasional Target

Status operasional dipisahkan dari `booking_status` paket:

```text
planning -> ready -> departed -> returned -> financially_closed
```

`booking_status` tetap dipakai untuk ketersediaan pemesanan seperti open, full, dan closed.

### Checklist Penutupan Trip

- Jemaah sudah kembali atau pengecualian terdokumentasi.
- Refund dan cancellation telah diselesaikan.
- Tagihan dan pembayaran vendor telah dicatat.
- Inventory telah direkonsiliasi dan di-issued.
- Komisi terkait telah dihitung.
- Currency rate final tersedia.
- Finance menyetujui penutupan.

### Posting Pendapatan

```text
Debit  : Uang Muka Jemaah
Kredit : Pendapatan Trip
```

### Kriteria Selesai

- `end_date` hanya memunculkan reminder dan tidak otomatis menutup trip.
- Penutupan memerlukan otorisasi Finance.
- Satu trip hanya dapat ditutup satu kali tanpa reversal resmi.
- Revenue, HPP aktual, refund, dan margin dapat ditelusuri ke trip.

## Tahap 6 — Laporan dan Kontrol Periode

### Laporan Target

- Saldo per rekening.
- Rekening Penampungan Jemaah.
- Rekonsiliasi bank.
- Penerimaan jemaah dan uang muka belum menjadi pendapatan.
- Piutang jemaah dan aging.
- Hutang vendor dan jatuh tempo.
- Budget vs actual per trip.
- Laba kotor per trip.
- Laba rugi bulanan perusahaan.
- Cashflow statement.
- Persediaan dan nilai inventory.
- Modal dan penarikan pemilik.
- Audit trail dan transaksi reversal.

### Rumus Utama

```text
Pendapatan trip yang sudah diakui
- HPP aktual trip
= Laba kotor trip

Laba kotor seluruh trip
- OPEX kantor
- Komisi dan biaya non-trip terkait
= Laba bersih perusahaan
```

### Period Closing

- Periode terbuka dapat menerima transaksi.
- Periode tertutup tidak dapat diubah secara langsung.
- Koreksi periode tertutup menggunakan adjustment pada periode terbuka dan referensi ke transaksi asal.
- Membuka kembali periode memerlukan izin khusus serta alasan yang diaudit.

### Kriteria Selesai

- Cashflow, saldo rekening, dan ledger menghasilkan angka yang sama.
- P&L tidak menggunakan total nilai Booking sebagai revenue.
- Laporan per trip dapat direkonsiliasi ke transaksi sumber.
- Periode tertutup terlindungi dari perubahan biasa.

## Urutan Prioritas Resmi

1. Tahap 0: audit dan pengamanan implementasi parsial.
2. Tahap 1: akun keuangan dan ledger.
3. Tahap 2: Booking Payment dan Rekening Penampungan.
4. Tahap 3: modal, OPEX, transfer, refund, dan komisi.
5. Tahap 4: vendor, HPP aktual, dan inventory.
6. Tahap 5: trip closing dan pengakuan pendapatan.
7. Tahap 6: laporan lengkap, rekonsiliasi, dan period closing.

Tahap berikutnya tidak dimulai sebelum kriteria selesai dan gerbang pemeriksaan tahap aktif terpenuhi.

## Aturan Integritas Data

- Gunakan database transaction untuk satu proses bisnis lengkap.
- Gunakan row locking pada transaksi yang dapat diproses bersamaan.
- Gunakan unique constraint/idempotency key untuk mencegah posting ganda.
- Application-level duplicate check tidak menggantikan database constraint.
- Posted transaction tidak dihapus; gunakan reversal.
- Foreign key sumber tidak boleh diam-diam berubah menjadi null karena record keuangan dihapus.
- Backfill selalu memiliki mode preview dan hasil rekonsiliasi.
- File attachment yang gagal disimpan atau dihapus harus ditangani tanpa meninggalkan status database palsu.
- Currency rate adalah snapshot transaksi dan tidak ikut berubah saat master rate diperbarui.
- Tidak menjalankan `migrate:fresh` untuk validasi rutin.
- Perubahan schema menggunakan forward migration yang menjaga data lama.

## Aturan Otorisasi dan Audit

- Seluruh write operation divalidasi dan diotorisasi di backend.
- Visibilitas tombol frontend bukan pengganti authorization.
- Protected flow memiliki pengujian guest, forbidden, dan allowed.
- Setiap transaksi mencatat creator, confirmer, reverser, timestamp, serta alasan koreksi.
- Bukti pembayaran dan bukti transaksi hanya dapat diakses oleh pihak yang berwenang.
- Log tidak boleh menyimpan token, cookie, credential, atau data sensitif yang tidak diperlukan.

## Strategi Pengujian

Setiap tahap minimal menguji:

- happy path;
- validation failure;
- authorization guest, forbidden, dan allowed;
- status transition;
- duplicate request dan retry;
- reversal;
- data lama/legacy;
- currency dan rounding;
- transaksi bersamaan yang relevan;
- ketidakseimbangan debit/kredit;
- record sumber yang tidak ditemukan;
- attachment failure;
- Inertia component dan props penting untuk perubahan UI.

Perintah verifikasi mengikuti aturan proyek:

```text
php artisan test --compact <test-yang-terkait>
vendor/bin/pint --dirty
npm run lint
npm run types
npm run format:check
```

Untuk perubahan frontend, layout harus diperiksa pada breakpoint `sx`, `xs`, `sm`, `md`, `lg`, `xl`, dan `xxl`.

## Definition of Done per Tahap

Satu tahap hanya boleh ditandai selesai jika:

- perubahan schema aman dan dapat diterapkan pada data yang sudah ada;
- service/action dan authorization sudah diterapkan;
- data lama sudah direkonsiliasi atau masuk daftar review eksplisit;
- happy path, failure path, authorization, edge case, dan regression test lulus;
- tidak ada transaksi ganda atau relasi sumber yang putus;
- formatting, lint, type check, dan format check lulus sesuai jenis perubahan;
- hasil pemeriksaan data sebelum dan sesudah terdokumentasi dalam handoff;
- UI dan laporan menunjukkan nilai yang berasal dari sumber transaksi yang sama.

## Non-Goals Awal

- Tidak mengintegrasikan payment gateway pada Tahap 0 sampai Tahap 2.
- Tidak mengganti seluruh sistem menjadi ERP eksternal.
- Tidak menghapus HPP estimasi yang sudah ada.
- Tidak mengubah flow Booking utama di luar tambahan kontrol keuangan yang diperlukan.
- Tidak membuat revenue otomatis hanya karena `end_date` sudah lewat.
- Tidak menganggap seluruh stock adjustment sebagai pembelian atau HPP.

## Checklist Kemajuan

- [x] Tahap 0 — Audit dan pengamanan kondisi sekarang
- [x] Tahap 1 — Fondasi akun dan ledger
- [x] Tahap 2 — Booking Payment ke keuangan (implementasi dan verifikasi otomatis selesai)
- [x] Gate UAT gabungan Tahap 0–6 — alur utama, UI desktop/mobile, regression suite, dan audit akhir selesai
- [x] Gate data Tahap 2 — 2 Booking Payment lama dipetakan ke Rekening Penampungan Jemaah dan audit akhir lulus
- [x] Tahap 3 — Modal, OPEX, transfer, refund, dan komisi (implementasi dan verifikasi otomatis selesai)
- [x] Tahap 4 — Vendor, HPP aktual, dan inventory (engineering, test otomatis, dan UAT gabungan selesai)
- [x] Gate audit vendor — lulus pada skenario terisolasi berisi tagihan, pembayaran, uang muka, alokasi, dan pemakaian layanan; audit database lokal juga konsisten
- [x] Tahap 5 — Penyelesaian trip dan pengakuan pendapatan (engineering, test otomatis, dan UAT gabungan selesai)
- [x] Gate audit trip — lulus saat penutupan finansial aktif dan setelah reversal pada skenario terisolasi; audit database lokal juga konsisten
- [x] Tahap 6 — Laporan dan kontrol periode (engineering, test otomatis, dan UAT gabungan selesai)

Seluruh gate implementasi telah selesai. Command audit tetap dijalankan berkala sebagai kontrol operasional ketika data vendor dan trip nyata bertambah, bukan sebagai tahap pengembangan yang tertunda.

## Hasil UAT Gabungan Tahap 0–6 — 21 September 2026

- Login Super Admin, Akun & Ledger, histori debit-kredit, reversal, transfer, saldo awal, form jurnal, form vendor, daftar booking, riwayat pembayaran, Inventory, Laporan Keuangan, rekonsiliasi bank, kontrol periode, dan audit transaksi berhasil dibuka dari aplikasi lokal.
- Laporan menampilkan nilai booking Rp832.000.000 hanya sebagai nilai operasional/piutang. Pendapatan ledger tetap Rp0 karena trip belum ditutup secara finansial.
- Dua Booking Payment confirmed senilai total Rp1.020.000 semula terlihat sebagai **Belum dipetakan** dan **Perlu rekonsiliasi**. Setelah keputusan pengaturan accounting sementara diberikan, keduanya dipetakan ke Rekening Penampungan Jemaah.
- UAT menemukan crash halaman Inventory pada origin HTTP karena pemanggilan langsung `crypto.randomUUID()`. Pembangkitan idempotency key sekarang memiliki fallback kompatibel dan halaman kembali tampil normal.
- Tampilan Laporan Keuangan diperiksa pada desktop dan viewport mobile 390×844; navigasi, filter, metrik, tab, tabel audit, dan dialog tetap dapat diakses.
- Tidak ada transaksi keuangan baru, tutup periode, rekonsiliasi bank, atau perubahan status trip yang diposting ke database operasional selama UAT.
- Audit ledger akhir lulus dengan debit dan kredit masing-masing Rp26.920.000. Audit vendor, trip, serta laporan juga lulus tanpa inkonsistensi.
- Regression suite akhir lintas Booking Payment, Cashflow, Ledger, Vendor, Trip, Inventory, dan Laporan Keuangan lulus 66 test dengan 558 assertion. Audit vendor diuji pada data transaksi terisolasi; audit trip diuji saat penutupan aktif dan setelah reversal.
- Backfill Payment ID 1 sebesar Rp20.000 dan Payment ID 3 sebesar Rp1.000.000 menghasilkan jurnal `Debit Rekening Penampungan Jemaah / Kredit Uang Muka Jemaah` tanpa menghapus histori.
- Audit akhir Booking Payment menunjukkan 0 payment tanpa cashflow, rekening, snapshot, atau posted ledger; total Cashflow dan Ledger yang direkonsiliasi sama-sama Rp1.020.000.
- Uji retry backfill tidak membuat transaksi ganda. Audit ledger akhir menunjukkan 7 transaksi dengan total debit dan kredit masing-masing Rp26.920.000 serta selisih Rp0.

## Hasil Implementasi Tahap 6 — 19 September 2026

- Financial Report lama yang memakai total booking sebagai revenue diganti dengan laporan berbasis ledger. Revenue hanya berasal dari akun pendapatan yang sudah diposting.
- Dashboard laporan menyediakan saldo per akun dan rekening, Rekening Penampungan Jemaah, uang muka jemaah, laba rugi bulanan, arus kas, budget vs actual serta laba kotor trip, aging piutang dan hutang, nilai persediaan, modal/prive, rekonsiliasi bank, dan audit transaksi.
- Rekonsiliasi bank menyimpan snapshot saldo rekening koran, saldo ledger pada tanggal yang sama, selisih, admin, waktu, catatan, serta idempotency key.
- Periode bulanan dapat ditutup oleh Finance berizin. Seluruh jalur posting ledger menolak transaksi bertanggal periode tertutup.
- Koreksi periode tertutup wajib diposting sebagai adjustment pada periode terbuka dan menunjuk transaksi asal beserta alasan.
- Pembukaan kembali periode hanya tersedia bagi Super Admin dan setiap tutup/buka periode disimpan sebagai histori audit immutable.
- PDF laporan menggunakan angka ledger dan rentang tanggal yang sama dengan halaman laporan.
- Audit read-only tersedia melalui `finance:audit-reporting`; audit database lokal menunjukkan debit dan kredit sama-sama IDR 25.900.000 tanpa ketidaksesuaian periode, rekonsiliasi, atau adjustment.

## Hasil Implementasi Tahap 5 — 19 September 2026

- Status operasional dipisahkan dari `booking_status`: Perencanaan, Siap berangkat, Berangkat, Sudah kembali, dan Ditutup finansial.
- Perubahan status wajib berurutan, memiliki histori immutable, catatan, tanggal kejadian, pelaku, dan idempotency key.
- Tanggal selesai hanya menjadi pengingat; sistem tidak menutup trip secara otomatis.
- Penutupan finansial hanya tersedia bagi admin dengan izin approve dan ditolak jika booking belum lunas, pembayaran/refund belum final, dana booking batal belum dikembalikan, tagihan vendor belum lunas atau belum diakui, inventory belum di-issued, maupun komisi agen belum dihitung.
- Penutupan mem-posting `Debit Uang Muka Jemaah / Kredit Pendapatan Trip` berdasarkan pembayaran terkonfirmasi setelah refund dengan nilai IDR final.
- Booking Payment, refund, tagihan/penggunaan layanan vendor, issue inventory, dan perubahan komisi dilindungi setelah trip ditutup.
- Koreksi penutupan dilakukan melalui reversal resmi; histori dan jurnal asli tidak dihapus, lalu status trip kembali menjadi Sudah kembali.
- Audit read-only tersedia melalui `finance:audit-trips` untuk mencocokkan status trip, dokumen penutupan, nominal, akun, dan jurnal.

## Hasil Implementasi Tahap 4 — 19 September 2026

Fondasi inventory, HPP aktual, dan hutang vendor sudah diterapkan dengan migration maju yang menjaga data lama:

- `inventory_items.quantity` diperlakukan sebagai stok fisik/on hand, dengan `reserved_quantity`, `available_quantity`, dan biaya rata-rata per unit.
- Data reservasi booking lama dikonversi aman dari pengurangan quantity menjadi reservasi; histori mutasi tetap dipertahankan.
- Penerimaan pembelian inventory membuat jurnal `Debit Persediaan / Kredit Kas-Bank Operasional`.
- Serah-terima inventory ke booking membuat jurnal `Debit HPP Trip / Kredit Persediaan` dan mengurangi stok fisik serta reservasi.
- Retry penerimaan dan serah-terima menggunakan unique idempotency key pada mutasi stok dan ledger; retry identik tidak menggandakan data, sedangkan payload berbeda ditolak.
- Inventory dengan nilai biaya belum tersedia tidak boleh di-issue sebagai HPP nol.
- UI inventory menampilkan fisik, direservasi, tersedia, biaya rata-rata, serta action penerimaan dan serah-terima dalam menu tiga titik.
- Test otomatis penerimaan dan issue mencakup posting jurnal seimbang dan retry idempotent.
- Vendor Bill membuat jurnal `Debit Layanan Vendor Belum Digunakan / Kredit Hutang Vendor`; belum menjadi HPP.
- Saat admin mencatat layanan benar-benar digunakan, jurnal `Debit HPP Trip / Kredit Layanan Vendor Belum Digunakan` dibuat per paket. Pengakuan parsial, retry idempotent, dan batas total tagihan divalidasi.
- Pembayaran Vendor membuat jurnal `Debit Hutang Vendor / Kredit Kas-Bank`, memperbarui status open, partially_paid, atau paid, dan menolak pembayaran melebihi sisa.
- Vendor Bill dan pembayaran vendor memiliki idempotency key serta test retry tanpa duplikasi.
- Uang muka vendor membuat jurnal aset Uang Muka Vendor versus kas/bank.
- Uang muka dapat dialokasikan ke Vendor Bill dengan jurnal Hutang Vendor versus Uang Muka Vendor; nominal berlebih, vendor berbeda, dan retry berbeda ditolak.
- Identitas vendor wajib pada tagihan/uang muka dan paket wajib pada tagihan. Admin dapat mengalokasikan DP serta mencatat penggunaan layanan dari Akun & Ledger.

Audit vendor read-only tersedia melalui `finance:audit-vendors`. Hasil nol ketidaksesuaian pada database tanpa dokumen vendor membuktikan command berjalan, bukan penerimaan alur operasional. UAT gabungan tetap dilakukan setelah semua tahap engineering selesai.

## Hasil Tahap 0 — 7 September 2026

Tahap 0 selesai dengan hasil berikut:

- Audit read-only tersedia melalui `finance:audit-booking-payment-cashflows` dan opsi `--json`.
- Audit mengembalikan exit code gagal jika menemukan mismatch agar dapat dipakai sebagai gerbang deployment/operasional.
- Baseline awal database testing sebelum reset otomatis memiliki satu payment lama yang perlu ditinjau pada Tahap 2:
    - payment id `1`;
    - booking `BK-260906-0001`;
    - tanggal pembayaran `2026-09-06`;
    - nominal `IDR 20.000`;
    - status `confirmed`;
    - belum memiliki `cashflow_id`.
- Tidak ditemukan link ganda, link menuju cashflow hilang, cashflow booking yatim, cashflow aktif untuk payment non-confirmed, maupun mismatch tanggal/nominal pada record yang sudah terhubung.
- Relasi `booking_payments.cashflow_id` sekarang unik dan menggunakan `ON DELETE RESTRICT`.
- Cashflow otomatis dari Booking Payment tidak dapat diedit atau dihapus langsung dari menu Cashflow.
- Kategori internal `booking_payment` tidak dapat dibuat melalui form Cashflow manual.
- Transisi payment pending, confirmed, non-confirmed, serta pembaruan nominal/tanggal telah memiliki regression test.
- Data payment lama tidak diubah atau di-backfill pada Tahap 0.

Baseline ini harus diaudit ulang sebelum dan sesudah backfill Tahap 2.

## Hasil Tahap 1 — 8 September 2026

Tahap 1 selesai dengan hasil berikut:

- Master akun keuangan tersedia dengan tipe asset, liability, equity, revenue, dan expense.
- Enam belas akun bawaan tersedia, termasuk Rekening Penampungan Jemaah, Bank Operasional, Kas Kecil, akun kontra Saldo Awal, serta akun legacy.
- Rekening kas/bank memiliki klasifikasi eksplisit customer_funds, operating, petty_cash, atau legacy.
- Ledger menggunakan financial_transactions dan financial_transaction_lines; setiap posting minimal dua baris dan total debit IDR wajib sama dengan total kredit IDR.
- Snapshot mata uang menyimpan currency, exchange_rate, amount_original, dan amount_idr.
- idempotency_key unik di database dan retry dengan payload sama mengembalikan transaksi yang sama; payload berbeda ditolak.
- Transaksi posted tidak dapat diedit atau dihapus. Koreksi menggunakan transaksi reversal yang mempertahankan histori.
- Saldo awal diposting sebagai Opening Balance Transaction dan hanya dapat dibuat satu kali per akun.
- Transfer antar-rekening memakai dua akun aset sehingga tidak memengaruhi akun pendapatan atau biaya.
- Halaman admin **Akun & Ledger** menyediakan master akun, saldo per akun, posting saldo awal/jurnal/transfer, histori baris debit-kredit, dan reversal.
- Audit read-only tersedia melalui finance:audit-ledger dan opsi --json.
- Backfill cashflow lama tersedia melalui finance:backfill-legacy-cashflows; default-nya preview dan perubahan hanya dijalankan dengan opsi --commit.
- Preview database lokal menemukan 0 cashflow eligible, 0 sudah terimpor, dan 0 cashflow Booking Payment aktif yang dikecualikan untuk Tahap 2. Karena itu tidak ada data lama yang perlu diubah pada Tahap 1.
- Audit ledger lokal menghasilkan total debit IDR 0, total kredit IDR 0, tanpa transaksi tidak seimbang atau relasi reversal yang putus.
- Sampel payment lama tidak diposting diam-diam dan tetap berada di database lokal sampai rekening penerimanya dipilih admin.

## Hasil Implementasi Tahap 2 — 11 September 2026

Implementasi Tahap 2 selesai, telah terverifikasi otomatis, lulus UAT gabungan, dan data lama sudah direkonsiliasi:

- Booking Payment `confirmed` otomatis membuat Cashflow penerimaan dan jurnal dua sisi: debit rekening penerima, kredit Uang Muka Jemaah.
- Status `pending` tidak membuat posting. Perubahan dari `confirmed` ke `pending` atau `void` membuat reversal tanpa menghapus histori.
- Perubahan tanggal, nominal, rekening, mata uang, atau kurs pada payment confirmed membuat reversal transaksi lama dan posting pengganti.
- Setiap create payment memakai idempotency key unik di database. Pengiriman ulang identik tidak membuat payment, cashflow, atau jurnal ganda; payload berbeda dengan key yang sama ditolak.
- Status confirmed mewajibkan rekening kas/bank aktif yang sudah terklasifikasi dan memakai mata uang booking.
- Bukti pembayaran wajib saat confirmed, kecuali admin mengisi alasan override eksplisit minimal 10 karakter.
- Snapshot payment menyimpan currency, exchange_rate, amount original, dan amount IDR. Cashflow menggunakan nilai IDR, sedangkan ledger mempertahankan nilai asli dan nilai IDR.
- Halaman Riwayat Pembayaran menampilkan rekening penerima, nomor/status jurnal, status rekonsiliasi data lama, aksi tiga titik, serta form yang responsif dan memberi konteks dampak posting.
- Backfill data lama tersedia melalui `finance:backfill-booking-payments`; mode default hanya preview, sedangkan eksekusi wajib memilih satu payment dan satu rekening secara eksplisit.
- Audit `finance:audit-booking-payment-cashflows` kini memeriksa Payment, Cashflow, rekening penerima, snapshot currency, ledger aktif, duplikat ledger, dan mismatch nilai.
- Database lokal tetap memiliki 3 payment dan tidak ada data lama yang dihapus:
    - 2 payment confirmed senilai total IDR 1.020.000 sudah dipetakan ke Rekening Penampungan Jemaah;
    - payment id `1`, booking `BK-260906-0001`, IDR 20.000;
    - payment id `3`, booking `BK-260906-0002`, IDR 1.000.000;
    - 1 payment void tetap tersimpan sebagai histori.
- Backfill dijalankan secara eksplisit per payment setelah rekening dipilih. Audit akhir melaporkan 0 duplicate cashflow link, 0 missing cashflow link, 0 orphan booking cashflow, dan 0 multiple posted booking ledger.
- Verifikasi menyeluruh Phase 2 lulus 37 test dengan 369 assertion untuk Booking Payment, integrasi Ledger, Financial Ledger, dan Cashflow pada database testing; data test kembali nol setelah rollback dan tidak menggunakan `migrate:fresh`.
