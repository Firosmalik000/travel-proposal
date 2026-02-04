# Storage Sync Guide - Fix Missing Photos After Deployment

## Masalah

Setelah deployment di Ploi, symbolic link `public/storage` mengarah ke path yang salah (staging environment), menyebabkan:
- Foto yang baru di-upload tersimpan di storage yang benar
- Foto lama yang di-upload sebelumnya tidak bisa diakses (404)
- Setelah `php artisan storage:link` diperbaiki, foto lama masih hilang karena tersimpan di path lama

## Penyebab

```bash
# Sebelum fix (SALAH):
public/storage -> /home/ploi/staging.superapp.xboss.id/storage/app/public

# Setelah fix (BENAR):
public/storage -> /home/ploi/superapp.xboss.id/storage/app/public
```

Foto lama masih berada di `/home/ploi/staging.superapp.xboss.id/storage/app/public`, sedangkan aplikasi sekarang mengakses `/home/ploi/superapp.xboss.id/storage/app/public`.

## Solusi

### Opsi 1: Menggunakan Artisan Command (Direkomendasikan)

#### 1. Dry Run (Preview Tanpa Copy)

```bash
cd /home/ploi/superapp.xboss.id
php artisan storage:sync-from-staging --dry-run
```

Ini akan menampilkan:
- Berapa file yang akan di-copy
- Berapa file yang sudah ada (skip)
- Tidak ada file yang benar-benar di-copy

#### 2. Jalankan Sync

```bash
php artisan storage:sync-from-staging
```

Ini akan:
- ✅ Copy semua file dari staging ke production
- ✅ Skip file yang sudah ada dengan ukuran sama
- ✅ Menampilkan progress untuk setiap file
- ✅ Menampilkan summary (total, copied, skipped)

### Opsi 2: Menggunakan Bash Script dengan rsync

#### 1. Dry Run

```bash
cd /home/ploi/superapp.xboss.id
bash scripts/sync-storage.sh --dry-run
```

#### 2. Jalankan Sync

```bash
bash scripts/sync-storage.sh
```

### Opsi 3: Manual dengan rsync (Quick Fix)

```bash
# Pastikan berada di server production
cd /home/ploi/superapp.xboss.id

# Sync storage dengan rsync
rsync -avh --progress \
  /home/ploi/staging.superapp.xboss.id/storage/app/public/ \
  /home/ploi/superapp.xboss.id/storage/app/public/

# Verify
ls -lh storage/app/public/inventaris-photos/
```

## Verifikasi Setelah Sync

### 1. Cek Symbolic Link

```bash
ls -l public/storage
# Output: public/storage -> /home/ploi/superapp.xboss.id/storage/app/public
```

### 2. Cek Foto Inventaris

```bash
ls -lh storage/app/public/inventaris-photos/ | head -20
# Seharusnya menampilkan semua foto (lama + baru)
```

### 3. Test di Browser

Buka halaman inventaris dan pastikan semua foto tampil dengan benar.

## Mencegah Masalah di Masa Depan

### 1. Tambahkan Post-Deploy Hook di Ploi

Di Ploi dashboard → Site → Deploy Settings → Deploy Script, tambahkan:

```bash
# ... existing deploy script ...

# Ensure storage link is correct
php artisan storage:link --force

# Verify storage link
STORAGE_LINK=$(readlink -f public/storage)
EXPECTED_PATH="/home/ploi/superapp.xboss.id/storage/app/public"

if [ "$STORAGE_LINK" != "$EXPECTED_PATH" ]; then
    echo "WARNING: Storage link is incorrect!"
    echo "Current: $STORAGE_LINK"
    echo "Expected: $EXPECTED_PATH"
    echo "Fixing..."
    rm -rf public/storage
    php artisan storage:link
fi

echo "Storage link verified: $(readlink -f public/storage)"
```

### 2. Tambahkan Health Check

Buat route untuk cek storage link:

```php
// routes/web.php
Route::get('/health/storage', function () {
    $link = public_path('storage');
    $target = readlink($link);
    $expected = storage_path('app/public');

    return response()->json([
        'link' => $link,
        'target' => $target,
        'expected' => $expected,
        'is_correct' => $target === $expected,
    ]);
})->middleware('auth'); // Protect dengan auth
```

### 3. Monitor di Ploi

Set up monitoring untuk mengecek apakah symbolic link benar setelah setiap deployment.

## Command Reference

### Artisan Command

```bash
# Lihat help
php artisan storage:sync-from-staging --help

# Dry run
php artisan storage:sync-from-staging --dry-run

# Actual sync
php artisan storage:sync-from-staging
```

### Bash Script

```bash
# Dry run
bash scripts/sync-storage.sh --dry-run

# Actual sync
bash scripts/sync-storage.sh
```

### Manual Commands

```bash
# Fix storage link
rm -rf public/storage
php artisan storage:link

# Verify link
readlink -f public/storage
ls -l public/storage

# Sync dari staging
rsync -avh /home/ploi/staging.superapp.xboss.id/storage/app/public/ \
           /home/ploi/superapp.xboss.id/storage/app/public/

# Check file count
find /home/ploi/staging.superapp.xboss.id/storage/app/public -type f | wc -l
find /home/ploi/superapp.xboss.id/storage/app/public -type f | wc -l
```

## Troubleshooting

### Masalah: Permission Denied

```bash
# Fix permissions
cd /home/ploi/superapp.xboss.id
chmod -R 755 storage/app/public
chown -R ploi:ploi storage/app/public
```

### Masalah: Disk Space

```bash
# Cek disk space
df -h

# Cek ukuran storage
du -sh /home/ploi/staging.superapp.xboss.id/storage/app/public
du -sh /home/ploi/superapp.xboss.id/storage/app/public
```

### Masalah: Foto Masih Hilang Setelah Sync

1. Clear cache aplikasi:
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

2. Restart PHP-FPM:
```bash
sudo service php8.3-fpm restart
```

3. Hard refresh browser (Ctrl + Shift + R)

## Kesimpulan

Setelah menjalankan sync:
- ✅ Semua foto lama dari staging akan tersedia di production
- ✅ Symbolic link sudah benar
- ✅ Upload foto baru akan tersimpan di lokasi yang benar
- ✅ Tidak ada foto yang hilang

**Rekomendasi**: Gunakan **Opsi 1 (Artisan Command)** karena lebih mudah di-track dan memberikan feedback yang jelas.
