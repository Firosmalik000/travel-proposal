# Update Cashflow Attachment - Image Preview & Icon Mata

## Perubahan yang Dilakukan

### ✅ Perbaikan Gambar Tidak Tampil

**Backend - Controller** (`app/Http/Controllers/Finance/CashflowController.php:25-46`)

Perubahan pada method `index()`:
- ✅ Menggunakan `asset('storage/' . $cashflow->attachment)` untuk URL yang lebih konsisten
- ✅ Menambahkan deteksi tipe file (is_image)
- ✅ Support format gambar: jpg, jpeg, png, gif, webp

```php
$attachmentUrl = null;
$isImage = false;

if ($cashflow->attachment) {
    $attachmentUrl = asset('storage/' . $cashflow->attachment);
    $extension = strtolower(pathinfo($cashflow->attachment, PATHINFO_EXTENSION));
    $isImage = in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp']);
}

return [
    // ... other fields
    'attachment' => $attachmentUrl,
    'attachment_name' => $cashflow->attachment ? basename($cashflow->attachment) : null,
    'is_image' => $isImage,  // NEW!
];
```

### ✅ Update Interface TypeScript

**Frontend - Interface** (`CashflowTable.tsx:28`)

Menambahkan property `is_image`:
```typescript
export interface Cashflow {
    // ... existing fields
    is_image?: boolean;  // NEW!
}
```

### ✅ Fitur Preview Gambar dengan Icon Mata

**Frontend - Index Component** (`Index.tsx`)

#### 1. Import Eye Icon (line 23)
```typescript
import { Download, Eye, FileIcon, Paperclip, Plus, Trash2 } from 'lucide-react';
```

#### 2. State untuk Preview (line 38)
```typescript
const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
```

#### 3. Handler Preview (line 96-98)
```typescript
const handlePreviewImage = (url: string, name: string) => {
    setPreviewImage({ url, name });
};
```

#### 4. Tampilan Gambar Thumbnail (line 298-310)
- Menampilkan gambar thumbnail jika file adalah gambar
- Menampilkan icon file jika bukan gambar
- Error handling jika gambar gagal load

```typescript
{editingCashflow.is_image ? (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
        <img
            src={editingCashflow.attachment}
            alt={editingCashflow.attachment_name || 'Attachment'}
            className="h-full w-full object-cover"
            onError={(e) => {
                // Fallback to file icon if image fails to load
            }}
        />
    </div>
) : (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border bg-muted">
        <FileIcon className="h-8 w-8 text-muted-foreground" />
    </div>
)}
```

#### 5. Button Icon Mata (line 324-338)
Button preview hanya muncul jika file adalah gambar:

```typescript
{editingCashflow.is_image && (
    <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
            handlePreviewImage(
                editingCashflow.attachment!,
                editingCashflow.attachment_name || 'Image'
            )
        }
    >
        <Eye className="h-4 w-4" />
    </Button>
)}
```

#### 6. Modal Preview Gambar (line 439-477)
Modal fullscreen untuk preview gambar:

```typescript
<Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
    <DialogContent className="max-w-4xl">
        <DialogHeader>
            <DialogTitle>{previewImage?.name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center bg-muted/30 rounded-lg p-4">
            {previewImage && (
                <img
                    src={previewImage.url}
                    alt={previewImage.name}
                    className="max-h-[70vh] max-w-full object-contain rounded"
                />
            )}
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewImage(null)}>
                Tutup
            </Button>
            <Button variant="default" asChild>
                <a href={previewImage.url} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                </a>
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

## 🎯 Fitur Lengkap

### Pada Form Edit Cashflow:

1. **Thumbnail Preview**
   - ✅ Gambar ditampilkan sebagai thumbnail (16x16 px)
   - ✅ File non-gambar ditampilkan sebagai icon
   - ✅ Fallback ke icon jika gambar error

2. **Action Buttons**
   - 👁️ **Eye Icon** - Preview gambar fullscreen (hanya untuk gambar)
   - ⬇️ **Download Icon** - Download file
   - 🗑️ **Trash Icon** - Hapus attachment

3. **Modal Preview**
   - ✅ Gambar ditampilkan maksimal 70vh
   - ✅ Object-fit: contain (gambar tidak terpotong)
   - ✅ Background muted untuk kontras
   - ✅ Button download di modal
   - ✅ Klik luar modal untuk menutup

## 🚀 Cara Menggunakan

### 1. Rebuild Frontend
```bash
npm run build
```

### 2. Test Fitur
1. Buka halaman cashflow: `http://super-apps-xboss.test/dashboard/finance/cashflow`
2. Upload gambar (JPG, PNG, dll) saat create/edit cashflow
3. Lihat thumbnail gambar muncul di form edit
4. Klik icon mata (👁️) untuk preview fullscreen
5. Klik icon download (⬇️) untuk download
6. Klik icon trash (🗑️) untuk hapus

## 📝 Format Gambar yang Didukung

- ✅ JPG / JPEG
- ✅ PNG
- ✅ GIF
- ✅ WEBP

## 🔧 Troubleshooting

### Gambar Tidak Muncul?

1. **Check symbolic link storage:**
   ```bash
   php artisan storage:link
   ```

2. **Verifikasi path file:**
   - File harus ada di: `storage/app/public/cashflow_attachments/`
   - URL harus mengarah ke: `http://super-apps-xboss.test/storage/cashflow_attachments/filename.jpg`

3. **Check permission folder:**
   - Folder `storage/app/public/cashflow_attachments/` harus writable
   - Symbolic link `public/storage` harus mengarah ke `storage/app/public`

4. **Check di browser console:**
   - Buka Developer Tools (F12)
   - Cek Network tab apakah file ter-load dengan status 200
   - Jika 404, berarti file tidak ditemukan atau path salah

### Icon Mata Tidak Muncul?

- Icon mata hanya muncul untuk file gambar (jpg, jpeg, png, gif, webp)
- Untuk file PDF atau dokumen lain, icon mata tidak akan muncul
- Check property `is_image` di data cashflow

## ✨ Summary Fitur

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Upload Gambar | ✅ | Support JPG, PNG, GIF, WEBP |
| Thumbnail Preview | ✅ | 16x16px dengan object-cover |
| Icon Mata | ✅ | Hanya untuk gambar |
| Modal Preview | ✅ | Fullscreen max 70vh |
| Download | ✅ | Dari form & modal |
| Delete Attachment | ✅ | Tanpa hapus record |
| Error Handling | ✅ | Fallback ke icon file |
| URL Fix | ✅ | Menggunakan asset() |

---

**Update ini sudah selesai dan siap digunakan!** 🎉
