# AGENTS.md

## Tujuan

Bekerjalah sebagai senior engineer pada codebase ini.

Implementasikan permintaan pengguna secara akurat, aman, efisien, dan production-ready dengan tetap mengikuti arsitektur, pola, konvensi, serta bahasa desain aplikasi yang sudah ada.

**Utamakan eksekusi daripada penjelasan.**

Gunakan Bahasa Indonesia untuk komunikasi dengan pengguna dan untuk teks antarmuka aplikasi, kecuali istilah teknis, nama produk, API, atau istilah yang secara wajar tetap menggunakan bahasa aslinya.

---

# 1. Stack Proyek

Stack utama proyek ini:

- PHP 8.4.17
- Laravel 12
- Inertia Laravel v2
- @inertiajs/react v2
- React 19
- Tailwind CSS 4
- Ziggy 2
- Laravel MCP 0
- Laravel Pint 1
- Laravel Sail 1
- Pest 3
- PHPUnit 11
- ESLint 9
- Prettier 3

Gunakan API dan pola yang sesuai dengan versi tersebut.

Jangan melakukan pengecekan versi berulang apabila versi yang dibutuhkan sudah jelas dari konteks ini.

Periksa versi package hanya jika:

- package lain di luar daftar ini terlibat;
- terdapat ketidakpastian;
- implementasi benar-benar bergantung pada versi package tertentu.

---

# 2. Prinsip Kerja Utama

Sebelum mengubah kode:

- baca implementasi yang relevan;
- pahami pola existing;
- periksa sibling file bila struktur atau konvensi belum jelas;
- cari komponen, helper, hook, service, action, route, atau utilitas yang dapat digunakan kembali.

Saat mengimplementasikan:

- buat perubahan terkecil yang menyelesaikan masalah secara lengkap;
- jangan refactor kode yang tidak berkaitan;
- jangan mengubah kode yang sudah bekerja hanya karena ada pendekatan lain yang terlihat lebih menarik;
- jangan membuat abstraksi yang belum diperlukan;
- jangan menduplikasi fungsi yang sudah tersedia;
- pertahankan backward compatibility kecuali task memang meminta perubahan;
- ikuti struktur direktori dan arsitektur existing;
- jangan membuat base directory baru tanpa kebutuhan yang jelas;
- jangan menambah, menghapus, atau meng-upgrade dependency tanpa persetujuan;
- jangan membuat file dokumentasi kecuali diminta.

Jika requirement sudah jelas, langsung kerjakan.

Jangan bertanya untuk keputusan rutin yang dapat disimpulkan dengan aman dari codebase.

---

# 3. Urutan Sumber Kebenaran

Gunakan prioritas berikut:

1. kode existing yang sudah bekerja;
2. aturan proyek yang relevan;
3. Laravel Boost/project-aware tools;
4. dokumentasi resmi versi yang terpasang.

Jika kode existing sudah menunjukkan pola yang benar, ikuti pola tersebut.

Jangan mencari dokumentasi hanya untuk mengonfirmasi hal yang sudah jelas dari implementasi existing.

---

# 4. Aturan Proyek Tambahan

Jika `.ai/rules/index.md` tersedia:

- baca index sebelum perubahan yang relevan;
- identifikasi rule yang sesuai dengan file atau perilaku yang sedang dikerjakan;
- load hanya rule yang diperlukan;
- jangan membaca seluruh `.ai/rules` tanpa alasan.

Cari rule tambahan apabila:

- behavior proyek tidak jelas;
- ada constraint bisnis yang mungkin berlaku;
- perubahan menyentuh area sensitif;
- pola existing belum cukup memberikan jawaban.

Gunakan `record-rule` hanya untuk constraint proyek yang:

- tahan lama;
- tidak obvious;
- penting untuk pekerjaan berikutnya;
- belum jelas dari codebase.

Jangan merekam detail task sementara atau konvensi framework yang sudah umum.

---

# 5. Laravel Boost

Gunakan Laravel Boost secara selektif ketika memberi informasi yang lebih aman atau lebih akurat daripada inspeksi manual.

Gunakan:

- `database-schema` untuk perubahan yang bergantung pada struktur database;
- `database-query` untuk inspeksi database read-only;
- `browser-logs` untuk error frontend/browser terbaru;
- `get-absolute-url` sebelum memberikan URL project;
- tool Artisan apabila parameter command tidak diketahui;
- `search-docs` bila perilaku framework/package tidak jelas atau version-sensitive.

Jangan menggunakan Boost secara mekanis pada task yang tidak membutuhkannya.

---

# 6. Dokumentasi

Gunakan `search-docs` apabila:

- API framework/package belum familiar;
- behavior berbeda antarversi;
- memperkenalkan fitur framework/package baru;
- existing code belum memberikan contoh yang cukup;
- terdapat ketidakpastian implementasi.

Jangan menggunakan `search-docs` hanya karena task menyentuh Laravel, React, Inertia, atau Tailwind.

Jika hasil dokumentasi yang cukup sudah ada dalam konteks, jangan mencarinya lagi.

---

# 7. Laravel

Ikuti cara Laravel dan pola existing aplikasi.

Untuk file Laravel-managed gunakan generator Artisan yang tepat bila relevan:

`php artisan make:* --no-interaction`

Gunakan:

- Eloquent sebelum raw SQL;
- relationship model sebelum manual join;
- eager loading untuk mencegah N+1;
- query builder hanya untuk query yang memang kompleks;
- named routes daripada URL hardcoded;
- `config()` daripada `env()` di luar config;
- authentication dan authorization bawaan Laravel;
- Policy atau Gate untuk authorization bila sesuai pola proyek.

Jangan menggunakan `DB::` bila Eloquent atau query model sudah cukup.

---

# 8. Controller dan Business Logic

Controller harus tetap tipis.

Controller bertugas terutama untuk:

- menerima request;
- menjalankan authorization bila diperlukan;
- mendelegasikan pekerjaan;
- mengembalikan response.

Jangan menempatkan business logic kompleks dalam:

- controller;
- middleware;
- route;
- React page component.

Gunakan Action atau Service untuk domain logic yang kompleks atau reusable.

Jangan membuat Service/Action hanya untuk CRUD sederhana.

---

# 9. Validation

Untuk validation backend yang non-trivial, gunakan Form Request sesuai pola existing.

Form Request harus memiliki:

- validation rules;
- authorization bila relevan;
- pesan validation khusus bila aplikasi memang membutuhkannya.

Periksa Form Request existing sebelum menentukan style rules.

Jangan memindahkan validation sederhana ke layer tambahan jika pola existing proyek tidak melakukannya.

---

# 10. Database

Sebelum perubahan schema:

- periksa schema existing;
- model terkait;
- casts;
- relationships;
- indexes;
- constraints;
- migration sebelumnya yang relevan.

Jangan pernah menggunakan:

`php artisan migrate:fresh`

untuk routine verification.

Untuk verifikasi schema gunakan metode terkecil dan teraman.

Jangan membuat atau mengubah data saat investigasi kecuali memang dibutuhkan.

Untuk inspeksi read-only gunakan tooling read-only.

Saat mengubah column melalui migration, pertahankan atribut existing yang masih diperlukan.

---

# 11. Model

Ikuti pola model existing.

Gunakan:

- relationship dengan return type;
- casts sesuai konvensi project;
- scopes bila memang reusable;
- factory untuk data testing.

Jangan membuat factory atau seeder yang tidak diperlukan hanya karena model baru dibuat.

Buat hanya artefak yang benar-benar dibutuhkan oleh feature.

---

# 12. PHP

Gunakan:

- curly braces untuk semua control structure;
- explicit parameter types;
- explicit return types;
- constructor property promotion bila sesuai;
- nama variable dan method yang deskriptif;
- TitleCase untuk Enum cases.

Jangan membuat constructor kosong kecuali memang diperlukan dan private.

Gunakan PHPDoc jika memberikan informasi tipe atau struktur yang berguna.

Gunakan array-shape PHPDoc bila membantu static analysis.

Hindari komentar yang menjelaskan kode obvious.

Tambahkan komentar hanya untuk logic yang sulit dipahami tanpa konteks tambahan.

---

# 13. Inertia + React

Ikuti struktur Inertia + React existing.

Sebelum membuat sesuatu yang baru:

- cari page/component serupa;
- reuse layout;
- reuse component;
- reuse hook;
- reuse utility;
- reuse form pattern;
- reuse route/navigation pattern.

Gunakan `Link` atau router Inertia untuk navigation internal sesuai pola proyek.

Gunakan `useForm` untuk form jika sesuai dengan pola existing.

Untuk behavior Inertia yang version-sensitive atau belum digunakan di project, gunakan dokumentasi Inertia v2.

Jangan menggunakan API Inertia dari versi lain hanya berdasarkan ingatan.

---

# 14. React

React page component harus fokus pada:

- composition;
- presentation;
- state/data flow yang relevan dengan halaman.

Pindahkan logic kompleks/reusable ke hook, helper, atau layer yang sesuai bila memang memberikan manfaat.

Jangan memecah component hanya demi membuat file lebih banyak.

Ekstrak component bila:

- digunakan kembali;
- terlalu kompleks;
- meningkatkan konsistensi;
- secara jelas memisahkan tanggung jawab.

---

# 15. Tailwind CSS

Gunakan Tailwind CSS v4.

Ikuti utility dan style existing sebelum membuat pola baru.

Jangan menggunakan utility deprecated dari Tailwind versi lama.

Gunakan `gap-*` untuk spacing antar-item dalam flex/grid daripada margin antar-child bila sesuai.

Jika aplikasi sudah mendukung dark mode, perubahan baru harus mempertahankan dukungan dark mode.

Jangan membuat konfigurasi Tailwind v3 pada project Tailwind v4.

Gunakan dokumentasi hanya bila syntax atau behavior Tailwind v4 tidak jelas.

---

# 16. UI dan Responsiveness

Pertahankan bahasa desain aplikasi existing.

Untuk perubahan UI:

- reuse component existing;
- pertahankan hierarchy visual;
- pertahankan accessibility;
- pertahankan responsive behavior;
- pertimbangkan loading, empty, success, disabled, dan error state bila relevan.

Jangan mengubah business logic dalam task UI-only kecuali benar-benar diperlukan.

Untuk perubahan yang memengaruhi layout/responsiveness, verifikasi breakpoint yang digunakan aplikasi, termasuk custom breakpoint bila tersedia.

Tidak perlu melakukan inspeksi seluruh breakpoint untuk perubahan yang tidak memengaruhi layout.

---

# 17. Bahasa Antarmuka

Bahasa utama antarmuka adalah **Bahasa Indonesia**.

Untuk setiap user-facing text baru atau yang diubah:

- gunakan Bahasa Indonesia yang natural;
- hindari campuran Bahasa Inggris yang tidak perlu;
- pertahankan istilah teknis yang memang lebih umum dalam bahasa aslinya;
- ikuti tone dan terminologi existing aplikasi;
- jangan mengubah istilah existing secara sepihak apabila dapat memengaruhi konsistensi UI.

Pastikan tidak ada placeholder, label, error message, atau empty state yang tertinggal dalam bahasa yang tidak konsisten.

---

# 18. Format Tanggal

Semua preview tanggal yang terlihat pengguna di React harus menggunakan helper bersama dari:

`@/lib/date-format`

atau component:

`@/components/formatted-date`

Jangan membuat formatter tanggal lokal di page/component.

Jangan memanggil langsung untuk preview:

- `Intl.DateTimeFormat`;
- `toLocaleDateString`;
- `date-fns/format`;

bila shared helper sudah tersedia.

Tanggal tanpa hari:

`21 Agustus 2026`

Tanggal dengan hari:

`Jumat, 21 Agustus 2026`

Gunakan `formatDateWithDay()` atau `withDay: true` bila nama hari diperlukan.

Tanggal dan waktu harus menggunakan `formatDateTime()` serta mengikuti timezone:

`Asia/Jakarta`

Machine value pada native date input boleh tetap:

`YYYY-MM-DD`

Aturan ini berlaku untuk semua user-facing preview seperti:

- table;
- card;
- detail;
- drawer;
- label;
- modal;
- page.

---

# 19. Security

Jangan pernah mempercayai input client.

Untuk write operation:

- validate input;
- authorize action;
- jangan mengandalkan visibility frontend sebagai access control.

Jangan:

- hardcode secret;
- expose API key/token/credential;
- expose stack trace ke user;
- log password/token/cookie;
- melemahkan security hanya agar feature atau test berhasil.

Validasi upload file untuk:

- type;
- size;
- destination;
- authorization.

Protected behavior harus mempertahankan authorization yang sesuai.

---

# 20. Performance

Hindari:

- N+1;
- query database di dalam loop;
- mengambil dataset besar tanpa pagination;
- blocking HTTP request dengan pekerjaan berat.

Gunakan eager loading bila dibutuhkan.

Gunakan queue untuk pekerjaan lambat seperti:

- email;
- export/import besar;
- image processing;
- external synchronization;

bila sesuai dengan architecture aplikasi.

Gunakan caching hanya jika memberikan manfaat nyata dan memiliki strategi invalidation yang jelas.

Jangan menambahkan cache atau queue tanpa kebutuhan konkret.

---

# 21. Testing

Perubahan behavioral harus memiliki test yang sesuai apabila praktis.

Prioritaskan:

- happy path;
- validation penting;
- authorization penting;
- failure mode penting;
- regression test untuk bug fix.

Jangan membuat test baru hanya untuk:

- copy-only change;
- styling-only change;
- formatting-only change;
- dokumentasi;
- perubahan non-behavioral lain;

kecuali repository memang memiliki konvensi khusus untuk itu.

Gunakan test style existing.

Jika area terkait sudah menggunakan Pest, lanjutkan dengan Pest.

Jangan mengubah test existing dari PHPUnit style ke Pest hanya karena Pest tersedia.

Untuk test baru, gunakan pola testing yang dominan pada area tersebut.

Gunakan factory dan factory state existing bila tersedia.

---

# 22. Inertia Testing

Untuk response Inertia yang berubah, verifikasi bila relevan:

- component yang benar;
- props penting;
- authorization;
- validation;
- behavior yang diminta.

Jangan hanya mengandalkan HTTP status jika behavior Inertia juga perlu diverifikasi.

---

# 23. Verifikasi

Gunakan verifikasi terkecil yang cukup membuktikan perubahan.

## Jika PHP/backend berubah

Jalankan test yang relevan terlebih dahulu:

`php artisan test --compact <test-terkait>`

atau gunakan `--filter`.

Jika PHP berubah, jalankan:

`vendor/bin/pint --dirty`

Jangan menjalankan seluruh test suite secara otomatis untuk perubahan kecil.

Jalankan test lebih luas jika:

- perubahan bersifat lintas-module;
- foundational;
- berisiko tinggi;
- atau diminta pengguna.

## Jika frontend berubah

Jalankan yang relevan:

`npm run lint`

`npm run types`

`npm run format:check`

Jangan menjalankan:

- `npm run build`;
- `npm run build:ssr`;
- `npm run format`;

kecuali diperlukan atau diminta.

## Jika perubahan hanya backend

Jangan menjalankan frontend checks tanpa alasan.

## Jika perubahan hanya frontend

Jangan menjalankan backend test suite tanpa alasan.

---

# 24. Debugging

Untuk bug:

1. pahami symptom;
2. baca implementation terkait;
3. cari bukti;
4. tentukan root cause;
5. buat fix terkecil;
6. verifikasi behavior;
7. periksa regression yang relevan.

Gunakan:

- browser logs untuk frontend error;
- application logs;
- tests;
- schema;
- database read-only;
- routes;
- config;

sesuai kebutuhan.

Jangan melakukan speculative refactor saat memperbaiki bug.

---

# 25. Observability

Log hanya informasi yang benar-benar berguna.

Log:

- meaningful failure;
- job failure penting;
- kondisi abnormal yang membutuhkan investigasi.

Jangan log:

- password;
- token;
- cookie;
- credential;
- sensitive payload.

Biarkan exception mengikuti mekanisme reporting aplikasi kecuali ada kebutuhan khusus.

---

# 26. Scope Discipline

Hormati ruang lingkup task.

Jangan:

- memperbaiki hal lain yang tidak diminta;
- redesign area tetangga;
- mengganti naming unrelated;
- upgrade package;
- melakukan cleanup besar;
- mengubah architecture;

hanya karena kebetulan ditemukan saat bekerja.

Task kecil seharusnya menghasilkan diff kecil.

Diff besar harus mempunyai alasan teknis yang jelas.

---

# 27. Efisiensi Context dan Token

Gunakan context secara hemat.

Jangan:

- membaca seluruh repository tanpa kebutuhan;
- membuka file yang tidak relevan;
- membaca rule yang tidak terkait;
- mencari dokumentasi yang sudah diketahui;
- mengecek package version berulang;
- menjalankan test yang tidak berkaitan;
- mengulang command output panjang;
- menjelaskan langkah rutin;
- menarasikan setiap tindakan.

Prefer:

- targeted inspection;
- targeted search;
- targeted tests;
- existing implementation sebagai reference;
- direct implementation ketika requirement sudah jelas.

---

# 28. Definition of Done

Task dianggap selesai apabila, sesuai relevansinya:

- requested behavior sudah bekerja;
- existing convention dipertahankan;
- tidak ada perubahan unrelated;
- tidak ada dependency yang berubah tanpa izin;
- UI menggunakan Bahasa Indonesia secara konsisten;
- format tanggal mengikuti shared date helper;
- security/authorization tidak melemah;
- behavioral test yang relevan lolos;
- PHP formatting lolos jika PHP berubah;
- frontend lint/type/format checks lolos jika frontend berubah;
- responsive behavior diperiksa jika layout berubah;
- tidak ada accidental changes pada final diff.

---

# 29. Final Review

Sebelum menyelesaikan task:

- review diff;
- pastikan tidak ada perubahan accidental;
- pastikan scope tetap sesuai;
- pastikan semua error yang disebabkan perubahan sudah diselesaikan.

Jangan menjalankan pekerjaan tambahan hanya untuk membuat laporan akhir terlihat lebih lengkap.

---

# 30. Respons Akhir

Respons akhir harus singkat dan dalam Bahasa Indonesia.

Laporkan hanya:

- apa yang berubah;
- area/file penting yang berubah;
- verifikasi yang dilakukan dan hasilnya;
- masalah tersisa atau tindakan pengguna, hanya jika memang ada.

Jangan:

- menjelaskan kode obvious;
- menyalin command output panjang;
- mengulang isi task;
- menulis narasi proses yang tidak dibutuhkan.
