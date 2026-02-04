# Panduan Migrasi Cashflow Attachment

## Langkah-langkah Setup Attachment Feature

### 1. Jalankan Migration
Buka terminal di folder project dan jalankan:

```bash
php artisan migrate
```

Atau jika menggunakan path lengkap:
```bash
C:\laragon\bin\php\php-8.3.0-Win32-vs16-x64\php.exe artisan migrate
```

Migration ini akan menambahkan kolom `attachment` ke table `cashflows`.

### 2. Pastikan Storage Link Sudah Dibuat
Jalankan command berikut untuk membuat symbolic link storage:

```bash
php artisan storage:link
```

Atau:
```bash
C:\laragon\bin\php\php-8.3.0-Win32-vs16-x64\php.exe artisan storage:link
```

### 3. Build Frontend Assets
Jalankan build untuk compile perubahan frontend:

```bash
npm run build
```

### 4. Verifikasi Fitur

Setelah selesai, buka halaman:
```
http://super-apps-xboss.test/dashboard/finance/cashflow
```

Fitur yang tersedia:
- ✅ Upload attachment saat create cashflow
- ✅ Upload/update attachment saat edit cashflow
- ✅ Download attachment
- ✅ Delete attachment
- ✅ Preview file yang sudah diupload

### 5. Perubahan yang Dilakukan

#### Backend:
1. **Migration**: `2025_01_25_000001_add_attachment_to_cashflows_table.php`
   - Menambahkan kolom `attachment` (nullable string) ke table `cashflows`

2. **Model**: `app/Models/Cashflow.php`
   - Menambahkan `attachment` ke `$fillable`

3. **Controller**: `app/Http/Controllers/Finance/CashflowController.php`
   - Update method `index()`: menambahkan attachment URL ke response
   - Update method `store()`: menangani upload file
   - Update method `update()`: menangani update file (hapus file lama, upload file baru)
   - Update method `destroy()`: menghapus file saat delete record
   - Tambah method `deleteAttachment()`: untuk delete attachment tanpa delete record

4. **Routes**: `routes/web.php`
   - Tambah route: `DELETE /dashboard/finance/cashflow/{cashflow}/attachment`

#### Frontend:
1. **Interface**: `CashflowTable.tsx`
   - Update interface `Cashflow` dengan property `attachment` dan `attachment_name`

2. **Index Component**: `Index.tsx`
   - Tambah state untuk file upload dan file input ref
   - Tambah handler `handleFileUpload()` untuk upload file
   - Tambah handler `handleDeleteAttachment()` untuk delete attachment
   - Update form submission untuk support file upload dengan FormData
   - Tambah UI untuk preview dan manage attachment

### 6. Catatan Penting

- Maximum file size: **10MB**
- Allowed file types:
  - Images: jpg, jpeg, png
  - Documents: pdf, doc, docx, xls, xlsx, ppt, pptx, txt
  - Archives: zip, rar
- File disimpan di: `storage/app/public/cashflow_attachments/`
- File dapat diakses via: `storage/cashflow_attachments/{filename}`

### 7. Troubleshooting

**Jika upload file gagal:**
1. Pastikan folder `storage/app/public/cashflow_attachments/` ada dan writable
2. Pastikan symbolic link storage sudah dibuat (`php artisan storage:link`)
3. Check permission folder storage

**Jika file tidak muncul:**
1. Check file ada di `storage/app/public/cashflow_attachments/`
2. Check symbolic link di `public/storage` mengarah ke `storage/app/public`
3. Check URL attachment di browser console

**Jika download tidak bekerja:**
1. Check file path di database
2. Pastikan file masih ada di storage
3. Check permission file

---

## Summary
Fitur attachment untuk cashflow sudah siap digunakan. Fitur ini memungkinkan user untuk:
- Upload bukti transaksi (gambar, PDF, dokumen, dll)
- Download attachment
- Menghapus attachment
- Mengganti attachment saat edit

Silakan jalankan migration dan test fitur ini!
