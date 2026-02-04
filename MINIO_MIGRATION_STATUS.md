# 📊 MinIO Migration Status

Status migrasi file upload dari local storage ke MinIO S3.

**Last Updated:** 2025-12-17

---

## ✅ Sudah Menggunakan MinIO

### 1. **InventarisController** ✅ DONE
- **Path:** `app/Http/Controllers/MasterData/InventarisController.php`
- **Files:** Foto barang inventaris
- **Storage Path:** `inventaris-photos/`
- **Status:** ✅ Sudah menggunakan MinIO dengan benar
- **Features:**
  - Upload multiple photos (max 5)
  - Update photos (keep existing + add new)
  - Delete old photos from MinIO
  - Generate MinIO URLs for display

---

## 🔄 Masih Menggunakan Local Storage (Perlu Review)

### 2. **CashflowController**
- **Path:** `app/Http/Controllers/Finance/CashflowController.php`
- **Files:** Attachment cashflow
- **Current Storage:** `Storage::disk('public')`
- **Recommendation:**
  - ✅ **Migrate to MinIO** - Files finansial lebih baik di cloud
  - Storage path: `cashflow-attachments/`

### 3. **ProfileController (Settings)**
- **Path:** `app/Http/Controllers/Settings/ProfileController.php`
- **Files:** Foto profile karyawan
- **Current Storage:** `Storage::disk('public')`
- **Recommendation:**
  - ✅ **Migrate to MinIO** - Foto profile cocok di cloud
  - Storage path: `profile-photos/`

### 4. **ArsipDataKaryawanController**
- **Path:** `app/Http/Controllers/MasterData/ArsipDataKaryawanController.php`
- **Files:** File arsip karyawan
- **Current Storage:** `Storage::disk('public')`
- **Recommendation:**
  - ✅ **Migrate to MinIO** - Arsip lebih aman di cloud
  - Storage path: `arsip-karyawan/`

### 5. **MasterKaryawanController**
- **Path:** `app/Http/Controllers/HRD/MasterKaryawanController.php`
- **Files:** Data karyawan (foto, dokumen)
- **Current Storage:** Perlu dicek lebih detail
- **Recommendation:** ✅ **Migrate to MinIO**

### 6. **DataKandidatController (Recruitment)**
- **Path:** `app/Http/Controllers/HRD/Recruitment/DataKandidatController.php`
- **Files:** CV, foto kandidat
- **Current Storage:** Perlu dicek lebih detail
- **Recommendation:** ✅ **Migrate to MinIO**

### 7. **SlipGajiController**
- **Path:** `app/Http/Controllers/HRD/Payroll/SlipGajiController.php`
- **Files:** Slip gaji PDF
- **Current Storage:** Perlu dicek lebih detail
- **Recommendation:**
  - ⚠️ **Keep Local** - Slip gaji sebaiknya local untuk keamanan
  - Atau encrypt sebelum upload ke MinIO

---

## 📋 Controllers yang Tidak Perlu MinIO

Files berikut **tidak perlu** di-migrate ke MinIO:

1. **QR Codes (InventarisController)**
   - QR code di-generate on-the-fly
   - Sudah menggunakan `Storage::disk('public')` dengan benar
   - Tidak perlu migrate

2. **Temporary Files**
   - File temporary yang di-generate untuk download langsung
   - Tetap pakai local storage

---

## 🎯 Prioritas Migration

### **High Priority** (Harus)
1. ✅ **InventarisController** - DONE
2. 🔄 **ProfileController** - Foto profile user
3. 🔄 **CashflowController** - Attachment cashflow

### **Medium Priority** (Sebaiknya)
4. 🔄 **ArsipDataKaryawanController** - File arsip
5. 🔄 **MasterKaryawanController** - Data karyawan
6. 🔄 **DataKandidatController** - CV kandidat

### **Low Priority** (Optional)
7. 🔄 **OfferingSalaryController**
8. 🔄 **InterviewController**
9. 🔄 **TamuController**

---

## 🔧 Template Migrasi ke MinIO

Untuk migrate controller lain ke MinIO, gunakan pattern ini:

### **Upload File:**
```php
// OLD - Local Storage
$path = $file->store('folder-name', 'public');

// NEW - MinIO
$filename = 'prefix-' . time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
$path = Storage::disk('minio')->putFileAs('folder-name', $file, $filename);

if ($path) {
    \Log::info("File uploaded to MinIO: {$path}");
}
```

### **Delete File:**
```php
// OLD - Local Storage
Storage::disk('public')->delete($path);

// NEW - MinIO
Storage::disk('minio')->delete($path);
```

### **Generate URL:**
```php
// MinIO - Public URL
$url = Storage::disk('minio')->url($path);

// MinIO - Temporary URL (expires)
$url = Storage::disk('minio')->temporaryUrl($path, now()->addMinutes(30));
```

### **Model Accessor untuk URLs:**
```php
// Di Model (contoh: User.php)
protected $appends = ['foto_url'];

public function getFotoUrlAttribute(): ?string
{
    if (!$this->foto) {
        return null;
    }

    try {
        return \Storage::disk('minio')->url($this->foto);
    } catch (\Exception $e) {
        \Log::warning("Failed to generate MinIO URL for: {$this->foto}");
        return null;
    }
}
```

---

## 📝 Checklist Saat Migrasi

Saat migrate controller ke MinIO, pastikan:

- [ ] Update `store()` method untuk upload
- [ ] Update `update()` method untuk upload & delete old files
- [ ] Update `destroy()` method untuk delete files
- [ ] Tambahkan accessor di Model untuk generate URLs
- [ ] Update frontend untuk pakai URLs dari accessor
- [ ] Test upload baru
- [ ] Test update (ganti file lama)
- [ ] Test delete
- [ ] Test display file (preview/download)
- [ ] Migrate existing files dari local ke MinIO (optional)

---

## 🚀 Next Steps

1. **Test Inventaris Upload** - Pastikan sudah work 100%
2. **Migrate ProfileController** - Next priority
3. **Migrate CashflowController** - High priority
4. **Create Migration Script** - Untuk migrate existing files ke MinIO

---

## ⚙️ MinIO Configuration (.env)

```env
AWS_ACCESS_KEY_ID=LHCHE7ZNYALNZHXE83K5
AWS_SECRET_ACCESS_KEY=3oHgDx5ytOaXsGjk4kdMjbaAwxFsA6kso8lw2Q5u
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=xbosone

# Port 443 = API endpoint (for uploads) ✅
# Port 9443 = Console/Web UI (for browser access)
AWS_ENDPOINT=https://s3.natanet.my.id:443
AWS_URL=https://s3.natanet.my.id:443/xbosone
AWS_USE_PATH_STYLE_ENDPOINT=true
AWS_SSL_VERIFY=false
```

---

**Questions?** Check `MINIO_DEBUG_GUIDE.md` for troubleshooting.
