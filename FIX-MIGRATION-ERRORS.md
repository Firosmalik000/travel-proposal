# Fix Migration Errors - Multiple Attachments

## Error 1: Duplicate Column Name 'attachment'

```
SQLSTATE[42S21]: Column already exists: 1060 Duplicate column name 'attachment'
```

**Penyebab:**
Migration lama (`2025_01_25_000001_add_attachment_to_cashflows_table.php`) sudah menambahkan kolom `attachment`, tapi kita sekarang mau pakai tabel terpisah.

**Solusi:**

### Option 1: Gunakan Script Otomatis (RECOMMENDED)

```cmd
migrate-multiple-attachments.cmd
```

Script ini akan:
1. ✅ Drop kolom `attachment` lama
2. ✅ Create tabel `cashflow_attachments` baru

### Option 2: Manual SQL

Jika script gagal, jalankan SQL ini di MySQL:

```sql
-- 1. Drop kolom attachment lama
ALTER TABLE cashflows DROP COLUMN attachment;

-- 2. Create tabel baru untuk attachments
CREATE TABLE cashflow_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cashflow_id BIGINT UNSIGNED NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NULL,
    file_size INT NULL,
    is_image TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_cashflow_id (cashflow_id),
    FOREIGN KEY (cashflow_id) REFERENCES cashflows(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Option 3: Reset Migrations (DESTRUCTIVE!)

⚠️ **WARNING: Ini akan menghapus SEMUA data!**

```cmd
php artisan migrate:fresh
```

Hanya gunakan jika database masih development dan tidak ada data penting.

## Error 2: Table 'cashflow_attachments' doesn't exist

```
SQLSTATE[42S02]: Base table or view not found: 1146 Table 'super_apps_xboss.cashflow_attachments' doesn't exist
```

**Penyebab:**
Controller sudah diupdate untuk menggunakan tabel `cashflow_attachments`, tapi tabelnya belum dibuat.

**Solusi:**

### Pastikan Migration Jalan

```cmd
php artisan migrate --path=database/migrations/2025_01_25_000002_create_cashflow_attachments_table.php
```

### Atau gunakan script otomatis:

```cmd
migrate-multiple-attachments.cmd
```

## Verifikasi Setelah Fix

### 1. Check Tabel Database

Buka MySQL dan jalankan:

```sql
-- Check struktur tabel cashflows (tidak ada kolom attachment)
DESCRIBE cashflows;

-- Check tabel baru
DESCRIBE cashflow_attachments;

-- Check data
SELECT * FROM cashflow_attachments;
```

**Expected Result:**

**Tabel `cashflows`:**
- ✅ TIDAK ada kolom `attachment`
- ✅ Ada kolom: id, date, type, amount, description, method, created_at, updated_at

**Tabel `cashflow_attachments`:**
- ✅ Ada dengan kolom: id, cashflow_id, file_path, file_name, file_type, file_size, is_image, created_at, updated_at

### 2. Check Migration Status

```cmd
php artisan migrate:status
```

Should show:
- ✅ `2025_01_25_000002_create_cashflow_attachments_table` - Ran
- ✅ `2025_01_25_000003_remove_old_attachment_column` - Ran

### 3. Test Application

1. Buka: `http://super-apps-xboss.test/dashboard/finance/cashflow`
2. Klik "Tambah Transaksi"
3. Expand "Attachments"
4. Should see: "Tambah File" button
5. No errors in browser console

## Migration Data Lama (If Needed)

Jika sudah ada data dengan attachment di kolom lama, buat migration untuk migrate data:

```php
// database/migrations/2025_01_25_000004_migrate_old_attachments.php
public function up(): void
{
    $cashflows = DB::table('cashflows')
        ->whereNotNull('attachment')
        ->get();

    foreach ($cashflows as $cashflow) {
        DB::table('cashflow_attachments')->insert([
            'cashflow_id' => $cashflow->id,
            'file_path' => $cashflow->attachment,
            'file_name' => basename($cashflow->attachment),
            'file_type' => null,
            'file_size' => null,
            'is_image' => in_array(
                strtolower(pathinfo($cashflow->attachment, PATHINFO_EXTENSION)),
                ['jpg', 'jpeg', 'png', 'gif', 'webp']
            ),
            'created_at' => $cashflow->created_at,
            'updated_at' => $cashflow->updated_at,
        ]);
    }
}
```

## Files Created

1. ✅ `database/migrations/2025_01_25_000002_create_cashflow_attachments_table.php` - Create new table
2. ✅ `database/migrations/2025_01_25_000003_remove_old_attachment_column.php` - Remove old column
3. ✅ `migrate-multiple-attachments.cmd` - Helper script
4. ❌ `database/migrations/2025_01_25_000001_add_attachment_to_cashflows_table.php` - DELETED!

## Summary

### Problem:
- Old migration added single `attachment` column
- New feature needs separate table for multiple attachments
- Conflict between old and new structure

### Solution:
1. ✅ Delete old migration file
2. ✅ Create migration to drop old column
3. ✅ Create migration for new table
4. ✅ Run migrations in correct order
5. ✅ Update controller to use new table

### Result:
- ✅ No more `attachment` column in `cashflows`
- ✅ New `cashflow_attachments` table created
- ✅ Ready for multiple file uploads
- ✅ Each file has full metadata

---

**Jalankan script dan semua error akan teratasi!** 🎉
