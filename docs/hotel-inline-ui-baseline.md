# Hotel Inline UI Baseline

Dokumen ini menjelaskan alur yang disepakati untuk menu Hotel agar tidak berubah-ubah lagi selama pengerjaan berikutnya.

## Tujuan

- Membuat pengelolaan Hotel terasa sederhana dan konsisten.
- Menjaga input hotel tetap terhubung dengan Product kategori Hotel.
- Menghindari drawer/page-in-page untuk aksi kecil seperti broker dan session.
- Mempertahankan create hotel besar tetap rapi dan mudah dipahami.

## Ruang Lingkup

### Tetap memakai drawer

- `Tambah Hotel`
- `Bulk Create Hotel`

### Dilakukan langsung di card/list

- Tambah broker
- Edit broker
- Hapus broker
- Tambah session/periode harga
- Edit session/periode harga
- Hapus session/periode harga

## Prinsip Tampilan

- Layout utama hotel tetap compact dan mudah dibaca.
- Aksi broker dan session berada langsung di dalam card hotel.
- Saat user klik tambah atau edit, hanya item yang dipilih yang berubah menjadi form input.
- Item lain tetap tampil normal sebagai list/read-only.
- Tidak ada drawer tambahan untuk broker dan session.

## Alur Hotel

### 1. Tambah Hotel

- User klik `Tambah Hotel`.
- Drawer terbuka.
- User mengisi data hotel utama.
- Setelah submit, hotel tersimpan dan otomatis terhubung ke Product kategori Hotel.

### 2. Bulk Create Hotel

- User klik `Bulk Create Hotel`.
- Drawer bulk terbuka.
- User dapat menambahkan banyak hotel sekaligus.
- Data yang sudah ada tidak ikut tersimpan ulang.
- Data duplikat harus diinformasikan ke user.

### 3. Edit Hotel

- Edit hotel dilakukan langsung di card hotel yang dipilih.
- Saat edit aktif, field hotel utama berubah menjadi form input.
- Data lain di card yang sama tetap terlihat agar konteks tidak hilang.

### 4. Broker

- Broker ditampilkan sebagai daftar di dalam card hotel.
- Ada icon `+` untuk menambah broker baru.
- Ada icon edit pada broker yang ingin diubah.
- Ada icon hapus untuk menghapus broker.
- Saat klik tambah/edit broker, hanya baris broker tersebut yang berubah jadi input.

### 5. Session / Periode Harga

- Session adalah periode harga untuk broker/hotel.
- Setiap broker dapat punya satu atau banyak session.
- Ada icon `+` untuk menambah session baru di bawah daftar session yang sudah ada.
- Ada icon edit pada session yang dipilih.
- Ada icon hapus untuk menghapus session.
- Saat edit session, hanya session yang diklik yang berubah jadi input.

## Aturan Data

- Hotel adalah source data utama.
- Product kategori Hotel harus sinkron dengan data Hotel.
- Currency mengikuti master kurs.
- Negara dan kota mengikuti master negara dan master kota.
- Room type mengikuti master room type.

## Catatan UX

- Tidak menampilkan field yang tidak penting untuk workflow utama.
- Hindari elemen visual yang terlalu banyak membuang ruang.
- Aksi yang sering dipakai harus terasa cepat dan langsung.
- Fokus utama adalah kejelasan struktur data, bukan dekorasi.

## Non-Goals

- Tidak menambah drawer baru untuk broker dan session.
- Tidak memecah alur hotel menjadi halaman terpisah yang membingungkan.
- Tidak mengubah konsep source data utama dari Hotel ke Product.

## Patokan Implementasi

Kalau ada perubahan berikutnya, patokan utamanya adalah:

1. Create hotel tetap via drawer.
2. Bulk create tetap via drawer.
3. Broker dan session dikelola inline di card.
4. Edit hanya memengaruhi item yang diklik.
5. Layout harus tetap compact, sederhana, dan konsisten.

