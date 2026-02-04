# 🔍 MinIO Debugging Guide

Panduan lengkap untuk debug masalah upload MinIO di sistem inventaris.

## 📋 Langkah-Langkah Debugging

### 1. Test Koneksi MinIO

Jalankan script test koneksi:

```bash
php artisan-test-minio.php
```

Script ini akan mengecek:
- ✅ Konfigurasi MinIO
- ✅ Koneksi ke server
- ✅ Upload file test
- ✅ Generate URL
- ✅ Read file
- ✅ Delete file

**Jika gagal:**
- Pastikan MinIO server running di `https://s3.natanet.my.id:9443`
- Cek credentials di `.env`
- Pastikan bucket `xbosone` ada

---

### 2. Cek Konfigurasi di `.env`

Pastikan konfigurasi berikut ada dan benar:

```env
AWS_ACCESS_KEY_ID=LHCHE7ZNYALNZHXE83K5
AWS_SECRET_ACCESS_KEY=3oHgDx5ytOaXsGjk4kdMjbaAwxFsA6kso8lw2Q5u
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=xbosone
AWS_ENDPOINT=https://s3.natanet.my.id:9443
AWS_URL=https://s3.natanet.my.id:9443/xbosone
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_SSL_VERIFY=false  # ⚠️ Penting jika pakai self-signed certificate
```

---

### 3. Test Upload via Browser

1. Buka: `http://super-apps-xboss.test/dashboard/master-data/inventaris`
2. Klik **Edit** pada salah satu item inventaris
3. Upload foto baru (max 5 foto, masing-masing max 10MB)
4. Klik **Simpan**

---

### 4. Monitor Log Real-time

Buka terminal dan jalankan:

```bash
tail -f storage/logs/laravel.log
```

**Log yang harus muncul saat upload:**

```
=== INVENTARIS UPDATE START ===
Validation passed
Keeping existing photos (atau No new files to upload)
Found new files to upload
Uploading file #0
✅ File uploaded to MinIO successfully
Final photo paths to save
Inventaris updated in database
=== INVENTARIS UPDATE SUCCESS ===
```

**Jika ada error, cek:**
- `❌ MinIO upload failed` → Masalah koneksi/kredensial
- `❌ File upload returned false/null` → Masalah permission bucket
- `Validation failed` → File terlalu besar atau format salah

---

### 5. Cek File di MinIO Browser

Buka: `https://s3.natanet.my.id:9443/browser/xbosone/inventaris-photos/`

Login dengan:
- Access Key: `LHCHE7ZNYALNZHXE83K5`
- Secret Key: `3oHgDx5ytOaXsGjk4kdMjbaAwxFsA6kso8lw2Q5u`

File yang berhasil upload akan muncul dengan nama format:
```
inventaris-1734406800-67890abcdef12.jpg
```

---

### 6. Cek Browser Console

Buka Developer Tools (F12) → Console

**Log yang harus muncul:**

```
=== FORM SUBMIT START ===
Mode: edit
Data: {...}
Validation passed, submitting...
Calling POST with _method=PUT for edit
✅ Update success
```

**Jika ada error:**
- `❌ Update error:` → Lihat detail error
- `Network error` → Cek koneksi internet
- `CORS error` → Jarang terjadi, tapi cek CORS settings di MinIO

---

## 🔧 Perbaikan yang Sudah Dilakukan

### 1. **Config Filesystem** (`config/filesystems.php`)
```php
'minio' => [
    'url' => env('AWS_URL'),              // ✅ Added
    'visibility' => 'public',              // ✅ Added
    'options' => [
        'http' => [
            'verify' => env('AWS_SSL_VERIFY', false),  // ✅ SSL fix
        ],
    ],
],
```

### 2. **Controller** (`app/Http/Controllers/MasterData/InventarisController.php`)
- ✅ Extensive logging untuk debug
- ✅ Proper error handling
- ✅ Correct MinIO upload method

### 3. **Frontend** (`resources/js/pages/Dashboard/MasterData/Inventaris/`)
- ✅ Menggunakan `foto_barang_urls` dari backend (MinIO URLs)
- ✅ Bukan lagi menggunakan `/storage/` path yang salah
- ✅ Proper form data submission dengan `forceFormData: true`

---

## 🐛 Common Issues & Solutions

### Issue 1: "SSL certificate problem"
**Solution:** Tambahkan di `.env`:
```env
AWS_SSL_VERIFY=false
```

### Issue 2: "Access Denied" di MinIO
**Solution:**
1. Login ke MinIO console
2. Cek bucket policy untuk `xbosone`
3. Pastikan bucket accessible dengan credentials yang ada

### Issue 3: File tidak muncul di preview
**Solution:**
1. Cek di log apakah upload sukses
2. Pastikan `foto_barang_urls` ada di response
3. Clear browser cache dan reload

### Issue 4: "Connection timeout"
**Solution:**
1. Cek MinIO server masih running
2. Ping ke `s3.natanet.my.id`
3. Cek firewall/network

### Issue 5: File terlalu besar
**Solution:**
- Max size per file: 10MB
- Ubah di controller jika perlu lebih besar
- Cek juga `php.ini` settings:
  ```ini
  upload_max_filesize = 20M
  post_max_size = 20M
  ```

---

## 📊 Testing Checklist

- [ ] MinIO server accessible di browser
- [ ] Test script `artisan-test-minio.php` berhasil
- [ ] Upload foto baru berhasil
- [ ] Foto lama tetap ada saat edit
- [ ] Hapus foto berhasil
- [ ] URL foto bisa diakses di browser
- [ ] File ada di MinIO bucket
- [ ] Tidak ada error di Laravel log

---

## 🆘 Masih Bermasalah?

Jika masih ada masalah setelah mengikuti panduan ini:

1. **Jalankan test script dan capture output:**
   ```bash
   php artisan-test-minio.php > minio-test-result.txt
   ```

2. **Capture Laravel log saat upload:**
   ```bash
   tail -100 storage/logs/laravel.log > upload-error-log.txt
   ```

3. **Screenshot browser console errors**

4. **Cek MinIO server logs** (jika ada akses)

Dengan informasi di atas, akan lebih mudah untuk identifikasi masalahnya.

---

**Last Updated:** 2025-12-17
**Version:** 1.0
