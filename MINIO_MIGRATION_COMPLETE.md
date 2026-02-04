# ✅ MinIO Migration - Complete Summary

## 🎉 Sudah Selesai Di-Migrate

### 1. **InventarisController** ✅
- **File:** `app/Http/Controllers/MasterData/InventarisController.php`
- **Upload:** Foto inventaris → `inventaris-photos/`
- **Model:** `app/Models/Inventaris.php` dengan accessor `foto_barang_urls`
- **Frontend:** Updated untuk pakai MinIO URLs
- **Status:** ✅ **FULLY MIGRATED**

### 2. **ProfileController** ✅
- **File:** `app/Http/Controllers/Settings/ProfileController.php`
- **Upload:** Foto profile karyawan → `karyawan-photos/`
- **Model:** `app/Models/MasterKaryawan.php` dengan accessor `foto_url`
- **Frontend:** Perlu update untuk pakai `foto_url`
- **Status:** ✅ **BACKEND MIGRATED** (Frontend perlu update)

---

## 📦 Trait & Helper yang Tersedia

### **HasMinioUpload Trait**
**Location:** `app/Traits/HasMinioUpload.php`

**Methods Available:**
```php
// Upload single file
$path = $this->uploadToMinio($file, 'folder-name', 'prefix');

// Upload multiple files
$paths = $this->uploadMultipleToMinio($files, 'folder-name', 'prefix');

// Delete file
$this->deleteFromMinio($path);

// Delete multiple files
$this->deleteMultipleFromMinio($paths);

// Replace file (delete old, upload new)
$newPath = $this->replaceFileInMinio($newFile, $oldPath, 'folder-name', 'prefix');

// Get URL
$url = $this->getMinioUrl($path);
$urls = $this->getMinioUrls($paths);

// Get temporary URL (expires)
$url = $this->getMinioTemporaryUrl($path, 30); // 30 minutes
```

---

## 🔄 Controller yang Masih Perlu Di-Migrate

### **Priority HIGH**

#### 3. **CashflowController** 🔄
**File:** `app/Http/Controllers/Finance/CashflowController.php`
**Current:** Using `Storage::disk('public')` for attachments
**Target Folder:** `cashflow-attachments/`

**Changes Needed:**
1. Add `use HasMinioUpload;` trait
2. Line 148: Change `storeAs('cashflow_attachments', $filename, 'public')` → `uploadToMinio($file, 'cashflow-attachments', 'cashflow')`
3. Line 206: Same as above
4. Line 61: Change `asset('storage/' . $attachmentPath)` → use Model accessor
5. Line 245-247, 296-297: Change `Storage::disk('public')->delete()` → `deleteFromMinio()`

**Model Changes:**
```php
// app/Models/Cashflow.php
protected $appends = ['attachment_urls'];

public function getAttachmentUrlsAttribute(): ?array
{
    if (!$this->attachment || !is_array($this->attachment)) {
        return null;
    }

    return array_map(function ($path) {
        try {
            return \Storage::disk('minio')->url($path);
        } catch (\Exception $e) {
            return null;
        }
    }, $this->attachment);
}
```

#### 4. **ArsipDataKaryawanController** 🔄
**File:** `app/Http/Controllers/MasterData/ArsipDataKaryawanController.php`
**Target Folder:** `arsip-karyawan/`

#### 5. **MasterKaryawanController** 🔄
**File:** `app/Http/Controllers/HRD/MasterKaryawanController.php`
**Target Folder:** `karyawan-data/`

---

### **Priority MEDIUM**

6. **DataKandidatController** - CV & foto kandidat
7. **OfferingSalaryController** - Dokumen offering
8. **InterviewController** - Dokumen interview
9. **TamuController** - Foto tamu
10. **SlipGajiController** - Slip gaji PDF
11. **PeminjamanBarangController** - Attachment
12. **PermintaanBarangController** - Attachment
13. **PermintaanStaffController** - Attachment
14. **PinjamanKaryawanController** - Attachment
15. **IzinKeluarKaryawanController** - Attachment

---

## 📝 Template Migration untuk Controller Lainnya

### **Step 1: Update Controller**

```php
<?php
namespace App\Http\Controllers\YourNamespace;

use App\Traits\HasMinioUpload; // ← Add this

class YourController extends Controller
{
    use HasMinioUpload; // ← Add this

    public function store(Request $request)
    {
        // OLD CODE:
        // $path = $request->file('file')->store('folder', 'public');

        // NEW CODE:
        $path = $this->uploadToMinio(
            $request->file('file'),
            'your-folder-name',
            'prefix' // optional
        );

        if (!$path) {
            return back()->withErrors(['error' => 'Upload failed']);
        }

        // Save $path to database
    }

    public function update(Request $request, $model)
    {
        // Replace old file with new one
        if ($request->hasFile('file')) {
            $newPath = $this->replaceFileInMinio(
                $request->file('file'),
                $model->file_path, // old path
                'your-folder-name',
                'prefix'
            );

            $model->file_path = $newPath;
        }
    }

    public function destroy($model)
    {
        // Delete file from MinIO
        if ($model->file_path) {
            $this->deleteFromMinio($model->file_path);
        }

        $model->delete();
    }
}
```

### **Step 2: Update Model**

```php
<?php
namespace App\Models;

class YourModel extends Model
{
    // Add to $appends array
    protected $appends = ['file_url'];

    // Or for multiple files:
    // protected $appends = ['file_urls'];

    /**
     * Get MinIO URL for single file
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }

        try {
            return \Storage::disk('minio')->url($this->file_path);
        } catch (\Exception $e) {
            \Log::warning("Failed to generate MinIO URL", ['path' => $this->file_path]);
            return null;
        }
    }

    /**
     * Get MinIO URLs for multiple files (if array)
     */
    public function getFileUrlsAttribute(): ?array
    {
        if (!$this->file_paths || !is_array($this->file_paths)) {
            return null;
        }

        return array_map(function ($path) {
            try {
                return \Storage::disk('minio')->url($path);
            } catch (\Exception $e) {
                return null;
            }
        }, $this->file_paths);
    }
}
```

### **Step 3: Update Frontend (React/Inertia)**

```tsx
// OLD CODE:
<img src={`/storage/${item.file_path}`} />

// NEW CODE:
<img src={item.file_url} />

// For multiple files:
{item.file_urls?.map((url, index) => (
    <img key={index} src={url} />
))}
```

---

## 🧪 Testing Checklist

After migrating each controller:

- [ ] Test create with file upload
- [ ] Test update with new file (old file deleted)
- [ ] Test update without changing file
- [ ] Test delete (file removed from MinIO)
- [ ] Test display/preview file
- [ ] Check file exists in MinIO bucket
- [ ] Check old file deleted from MinIO after update
- [ ] Verify URLs are accessible
- [ ] Test with multiple files (if applicable)

---

## ⚙️ MinIO Configuration

**Current Config (`.env`):**
```env
AWS_ACCESS_KEY_ID=LHCHE7ZNYALNZHXE83K5
AWS_SECRET_ACCESS_KEY=3oHgDx5ytOaXsGjk4kdMjbaAwxFsA6kso8lw2Q5u
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=xbosone

# Port 443 = API (for file operations) ✅
# Port 9443 = Console (for browser access)
AWS_ENDPOINT=https://s3.natanet.my.id:443
AWS_URL=https://s3.natanet.my.id:443/xbosone
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_SSL_VERIFY=false
```

**MinIO Disk Config (`config/filesystems.php`):**
```php
'minio' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    'bucket' => env('AWS_BUCKET'),
    'url' => env('AWS_URL'),
    'endpoint' => env('AWS_ENDPOINT'),
    'use_path_style_endpoint' => true,
    'visibility' => 'public',
    'throw' => false,
    'report' => false,
    'options' => [
        'http' => [
            'verify' => env('AWS_SSL_VERIFY', false),
            'connect_timeout' => 120,
            'timeout' => 120,
        ],
    ],
],
```

---

## 📊 Migration Progress

| Controller | Status | Priority | Folder Name |
|------------|--------|----------|-------------|
| InventarisController | ✅ Done | HIGH | inventaris-photos |
| ProfileController | ✅ Done | HIGH | karyawan-photos |
| CashflowController | 🔄 TODO | HIGH | cashflow-attachments |
| ArsipDataKaryawanController | 🔄 TODO | HIGH | arsip-karyawan |
| MasterKaryawanController | 🔄 TODO | HIGH | karyawan-data |
| DataKandidatController | 🔄 TODO | MEDIUM | kandidat-data |
| OfferingSalaryController | 🔄 TODO | MEDIUM | offering-docs |
| InterviewController | 🔄 TODO | MEDIUM | interview-docs |
| TamuController | 🔄 TODO | LOW | tamu-photos |
| SlipGajiController | ⚠️ Consider Local | LOW | - |
| Others | 🔄 TODO | LOW | - |

**Legend:**
- ✅ Done = Fully migrated (backend + frontend)
- 🔄 TODO = Needs migration
- ⚠️ Consider Local = Sensitive data, consider keeping local

---

## 🚀 Next Steps

1. **Test InventarisController & ProfileController** - Pastikan fully working
2. **Migrate CashflowController** - Priority HIGH
3. **Update Frontend untuk ProfileController** - Pakai `foto_url` accessor
4. **Continue dengan controller lainnya** secara bertahap

---

## 💡 Tips

1. **Always test in development first!**
2. **Backup database before migration**
3. **Keep old files during transition** (jangan hapus dulu file di `/storage/app/public/`)
4. **Migrate one controller at a time**
5. **Update documentation as you go**
6. **Use logging to track upload/delete operations**

---

**Last Updated:** 2025-12-17
**Version:** 2.0
