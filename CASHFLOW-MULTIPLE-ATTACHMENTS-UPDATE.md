# Update Cashflow - Multiple Attachments Support

## 🎯 Fitur Baru: Upload Multiple Files

Sekarang Anda bisa mengupload **lebih dari 1 file** per transaksi cashflow!

## 📋 Perubahan Database

### 1. Migration Baru: `cashflow_attachments` Table

File: `database/migrations/2025_01_25_000002_create_cashflow_attachments_table.php`

```php
Schema::create('cashflow_attachments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('cashflow_id')->constrained('cashflows')->onDelete('cascade');
    $table->string('file_path');
    $table->string('file_name');
    $table->string('file_type')->nullable();
    $table->integer('file_size')->nullable();
    $table->boolean('is_image')->default(false);
    $table->timestamps();
});
```

**Kenapa tabel terpisah?**
- ✅ Support multiple files per cashflow
- ✅ Bisa track metadata setiap file (size, type, name)
- ✅ Cascade delete otomatis
- ✅ Lebih scalable dan maintainable

### 2. Model Baru: `CashflowAttachment`

File: `app/Models/CashflowAttachment.php`

**Features:**
- ✅ Relationship ke Cashflow
- ✅ Accessor `getUrlAttribute()` untuk URL lengkap
- ✅ Accessor `getHumanFileSizeAttribute()` untuk format readable (2.5 MB, 150 KB, dll)
- ✅ Auto cast `is_image` ke boolean

### 3. Update Model Cashflow

Ditambahkan relationship:
```php
public function attachments()
{
    return $this->hasMany(CashflowAttachment::class);
}
```

## 🔧 Perubahan Backend

### Controller Updates (`CashflowController.php`)

#### 1. Method `index()` - Line 22-48
```php
$cashflows = Cashflow::with('attachments')  // Eager load
    ->orderBy('date', 'desc')
    ->get()
    ->map(function ($cashflow) {
        return [
            // ... other fields
            'attachments' => $cashflow->attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'url' => $attachment->url,
                    'file_name' => $attachment->file_name,
                    'file_size' => $attachment->file_size,
                    'human_file_size' => $attachment->human_file_size,
                    'is_image' => $attachment->is_image,
                ];
            }),
        ];
    });
```

#### 2. Method `store()` - Line 71-129
```php
// Validate array of files
'attachments' => 'nullable|array',
'attachments.*' => 'file|max:10240|mimes:...',

// Loop and save each file
if ($request->hasFile('attachments')) {
    foreach ($request->file('attachments') as $file) {
        $filename = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('cashflow_attachments', $filename, 'public');

        CashflowAttachment::create([
            'cashflow_id' => $cashflow->id,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'is_image' => in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp']),
        ]);
    }
}
```

#### 3. Method `update()` - Line 135-194
Sama seperti `store()`, tapi tidak menghapus file lama. File baru akan ditambahkan ke yang sudah ada.

#### 4. Method `destroy()` - Line 199-228
```php
// Delete all attachment files
foreach ($cashflow->attachments as $attachment) {
    if (Storage::disk('public')->exists($attachment->file_path)) {
        Storage::disk('public')->delete($attachment->file_path);
    }
}

$cashflow->delete();  // Cascade akan auto delete records
```

#### 5. Method `deleteAttachment()` - Line 233-253
```php
public function deleteAttachment(CashflowAttachment $attachment)
{
    // Delete file dari storage
    Storage::disk('public')->delete($attachment->file_path);

    // Delete record dari database
    $attachment->delete();
}
```

### Routes Update

```php
// OLD
Route::delete('cashflow/{cashflow}/attachment', ...)

// NEW
Route::delete('cashflow-attachment/{attachment}', ...)
```

**Kenapa berubah?**
Sekarang delete berdasarkan ID attachment, bukan cashflow ID.

## 🎨 Perubahan Frontend

### 1. Interface TypeScript (`CashflowTable.tsx`)

```typescript
export interface CashflowAttachment {
    id: number;
    url: string;
    file_name: string;
    file_type: string;
    file_size: number;
    human_file_size: string;
    is_image: boolean;
    created_at: string;
}

export interface Cashflow {
    // ... other fields
    attachments: CashflowAttachment[];  // Array of attachments
}
```

### 2. Form State (`Index.tsx`)

```typescript
// OLD
attachment: null as File | null,

// NEW
attachments: [] as File[],
```

### 3. File Upload Handler

```typescript
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate each file
    const validFiles = files.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
            alert(`File ${file.name} terlalu besar!`);
            return false;
        }
        return true;
    });

    // Append to existing files
    setData('attachments', [...data.attachments, ...validFiles]);

    // Reset input
    fileInputRef.current.value = '';
};
```

### 4. Remove File Handler (NEW!)

```typescript
const handleRemoveFile = (index: number) => {
    const newAttachments = [...data.attachments];
    newAttachments.splice(index, 1);
    setData('attachments', newAttachments);
};
```

### 5. Input File

```html
<input
    ref={fileInputRef}
    type="file"
    multiple  <!-- SUPPORT MULTIPLE FILES! -->
    onChange={handleFileUpload}
    accept="image/*,.pdf,.doc,.docx,..."
/>
```

### 6. UI Layout - Collapsible Content

**File Tersimpan:**
```
┌─────────────────────────────────┐
│ File tersimpan:                 │
├─────────────────────────────────┤
│ [img] invoice.pdf    👁 ⬇ 🗑   │
│ 2.5 MB                          │
├─────────────────────────────────┤
│ [img] receipt.jpg    👁 ⬇ 🗑   │
│ 1.2 MB                          │
└─────────────────────────────────┘
```

**File Akan Diupload:**
```
┌─────────────────────────────────┐
│ File akan diupload:             │
├─────────────────────────────────┤
│ [📄] document.pdf         🗑    │
│ 3.4 MB                          │
└─────────────────────────────────┘
```

## ✨ Fitur UI/UX

### Counter Badge
```
Attachments (3)  ← Shows total: saved + pending
```

### Visual Differentiation
- **Saved files**: Solid border, white background
- **Pending files**: Dashed border, muted background

### Actions per File
- 👁️ Preview (images only)
- ⬇️ Download
- 🗑️ Delete

## 🚀 Cara Menggunakan

### 1. Run Migration

```bash
php artisan migrate
```

Atau jika ada error karena migration sebelumnya:

```bash
# Rollback migration lama attachment single
php artisan migrate:rollback --step=1

# Jalankan migration baru
php artisan migrate
```

### 2. Build Frontend

```bash
npm run build
```

### 3. Test Fitur

#### Upload Multiple Files
1. Buka form create/edit cashflow
2. Klik "Attachments" collapsible
3. Klik "Tambah File"
4. **Pilih multiple files** (Ctrl+Click atau Shift+Click)
5. Lihat preview file yang akan diupload
6. Hapus jika salah pilih (klik 🗑️)
7. Submit form

#### Manage Existing Files
1. Edit cashflow yang sudah punya attachments
2. Expand "Attachments (3)"
3. Lihat semua file tersimpan
4. Preview image (klik 👁️)
5. Download file (klik ⬇️)
6. Hapus individual file (klik 🗑️)

## 📊 Perbandingan: Before vs After

| Aspek | Before | After |
|-------|--------|-------|
| Max files | 1 file | **Unlimited** |
| Storage | Single column | **Dedicated table** |
| Metadata | Minimal | **Full metadata** |
| Delete | All or nothing | **Per file** |
| UI | Static | **Interactive preview** |
| File size info | ❌ | ✅ Human readable |

## 🔍 Technical Details

### File Naming Convention
```
{timestamp}_{uniqid}_{original_filename}
```

Example: `1737849600_65b2f4a3d5_invoice.pdf`

**Benefit:**
- ✅ Avoid name collision
- ✅ Preserve original name
- ✅ Sortable by timestamp

### Storage Location
```
storage/app/public/cashflow_attachments/
    ├── 1737849600_65b2f4a3d5_invoice.pdf
    ├── 1737849601_65b2f4a3d6_receipt.jpg
    └── ...
```

### Database Relations
```
cashflows (1) ──< (many) cashflow_attachments
```

### Eager Loading
```php
Cashflow::with('attachments')  // Prevent N+1 query
```

## 🎯 Use Cases

### 1. Upload Bukti Transfer + Invoice
```
Create Cashflow:
- Date: 2025-01-25
- Type: Debit
- Amount: 5,000,000
- Attachments:
  ✅ bukti_transfer.jpg
  ✅ invoice.pdf
  ✅ kwitansi.jpg
```

### 2. Update: Tambah File Tambahan
```
Edit Cashflow:
- Existing: invoice.pdf (2.5 MB)
- Add new: receipt.jpg (1.2 MB)
- Result: 2 files total
```

### 3. Delete Specific File
```
Edit Cashflow:
- File 1: invoice.pdf (keep)
- File 2: receipt.jpg (delete ✅)
- File 3: contract.pdf (keep)
```

## ⚠️ Important Notes

### Migration Data Lama

Jika sudah ada data dengan attachment di kolom `cashflows.attachment`:

**Option 1: Manual Migration**
```php
// Create migration script
foreach (Cashflow::whereNotNull('attachment')->get() as $cashflow) {
    CashflowAttachment::create([
        'cashflow_id' => $cashflow->id,
        'file_path' => $cashflow->attachment,
        'file_name' => basename($cashflow->attachment),
        // ...
    ]);
}
```

**Option 2: Keep Both**
- Keep old `attachment` column for backward compatibility
- New uploads go to `cashflow_attachments` table
- Show both in UI

### File Size Limits

- **Per file**: 10 MB
- **Total**: No limit (but be reasonable!)
- **Recommended**: Max 5 files per transaction

### Performance

- ✅ Eager loading untuk prevent N+1
- ✅ Index pada `cashflow_id`
- ✅ Cascade delete untuk cleanup
- ✅ File validation sebelum upload

## 📝 Summary

### Backend Changes
✅ New table: `cashflow_attachments`
✅ New model: `CashflowAttachment`
✅ Updated: `Cashflow` model with relationship
✅ Updated: All controller methods
✅ Updated: Routes for delete

### Frontend Changes
✅ New interface: `CashflowAttachment`
✅ Updated: Form state (array of files)
✅ Updated: Upload handler (multiple files)
✅ New: Remove file handler
✅ Updated: UI with separate sections
✅ Updated: Counter badge

### Features
✅ Upload multiple files
✅ Preview each file
✅ Delete individual file
✅ File size display
✅ Visual differentiation (saved vs pending)
✅ Full metadata tracking

---

**Multiple attachments feature is ready!** 🎉

Upload as many files as you need per cashflow transaction!
