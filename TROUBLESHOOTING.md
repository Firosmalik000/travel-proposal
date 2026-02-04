# 🔧 TROUBLESHOOTING GUIDE - Finance Module

## ❌ Error: Table 'cashflows' doesn't exist

### Penyebab
Migration belum dijalankan untuk membuat tabel cashflows.

### Solusi

**Opsi 1 - Recommended (Auto Fix):**
```cmd
COMPLETE-SETUP.cmd
```

**Opsi 2 - Manual:**
```cmd
php artisan migrate
```

**Opsi 3 - Full Reset (⚠️ Hapus semua data):**
```cmd
php artisan migrate:fresh --seed
```

**Verifikasi:**
```bash
php artisan tinker
DB::table('cashflows')->count();
exit
```

---

## ❌ Error: Duplicate entry 'finance' for key 'menus_menu_key_unique'

### Penyebab
Menu Finance sudah ada di database.

### Solusi

**Opsi 1 - Hapus menu lama:**
```bash
php artisan tinker
\App\Models\Menu::where('menu_key', 'finance')->delete();
exit
```

**Opsi 2 - Skip error:**
MenuSeeder sudah otomatis truncate, jadi cukup run:
```cmd
php artisan db:seed --class=MenuSeeder
```

---

## ❌ Error: SQLSTATE[HY000] [2002] Connection refused

### Penyebab
MySQL tidak berjalan di Laragon.

### Solusi
1. Buka Laragon
2. Klik tombol "Start All"
3. Pastikan MySQL berubah hijau (running)
4. Jalankan ulang script

**Verifikasi:**
```bash
php artisan tinker
DB::connection()->getPdo();
exit
```

---

## ❌ Error: Database 'super_apps_xboss' not found

### Penyebab
Database belum dibuat di MySQL.

### Solusi
1. Buka phpMyAdmin: `http://localhost/phpmyadmin`
2. Klik "New" di sidebar kiri
3. Buat database dengan nama: `super_apps_xboss`
4. Collation: `utf8mb4_unicode_ci`
5. Klik "Create"

**Atau via Tinker:**
```bash
php artisan tinker
DB::statement('CREATE DATABASE IF NOT EXISTS super_apps_xboss');
exit
```

---

## ❌ Finance menu tidak muncul di sidebar

### Penyebab & Solusi

**1. Cache belum di-clear:**
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

**2. Frontend belum rebuild:**
```bash
npm run build
# atau
npm run dev
```

**3. Menu belum ada di database:**
```bash
php artisan tinker
\App\Models\Menu::where('menu_key', 'finance')->first();
exit
```

Jika NULL, jalankan:
```bash
php artisan db:seed --class=MenuSeeder
```

**4. User tidak punya akses:**
Check table `user_accesses` - pastikan user Anda punya permission untuk menu finance.

**5. Browser cache:**
- Tekan `Ctrl + Shift + R` (hard refresh)
- Atau buka Incognito/Private window

---

## ❌ Error: Class 'MenuSeeder' not found

### Penyebab
Autoload Composer belum di-refresh.

### Solusi
```bash
composer dump-autoload
php artisan config:clear
php artisan db:seed --class=MenuSeeder
```

---

## ❌ Halaman cashflow error 500

### Debugging Steps

**1. Check error log:**
```bash
tail -f storage/logs/laravel.log
```

**2. Enable debug mode:**
Edit `.env`:
```env
APP_DEBUG=true
```

**3. Check tabel ada:**
```bash
php artisan tinker
DB::table('cashflows')->exists();
exit
```

**4. Check controller:**
```bash
php artisan route:list --name=cashflow
```

**5. Clear all cache:**
```bash
php artisan optimize:clear
```

---

## ❌ Form submit tidak jalan / error 419

### Penyebab
CSRF token issue atau session problem.

### Solusi

**1. Clear session:**
```bash
php artisan session:clear
```

**2. Check .env:**
```env
SESSION_DRIVER=file
```

**3. Clear browser cookies:**
- Logout
- Clear cookies untuk domain
- Login kembali

---

## ❌ DataTable tidak tampil / error React

### Penyebab
Frontend belum di-compile atau ada error JavaScript.

### Solusi

**1. Rebuild frontend:**
```bash
npm install
npm run build
```

**2. Check console browser:**
- Tekan F12
- Lihat tab Console
- Check error JavaScript

**3. Verify file ada:**
```bash
dir resources\js\pages\Dashboard\Finance\Cashflow\Index.tsx
dir resources\js\components\ui\data-table.tsx
```

**4. Clear Vite cache:**
```bash
rm -rf node_modules/.vite
npm run build
```

---

## ❌ Sorting/Search tidak berfungsi

### Penyebab
TanStack Table belum terinstall atau komponen salah.

### Solusi

**1. Install dependency:**
```bash
npm install @tanstack/react-table
```

**2. Rebuild:**
```bash
npm run build
```

**3. Verify import:**
Check file `CashflowTable.tsx` punya:
```typescript
import { ColumnDef } from '@tanstack/react-table';
```

---

## ✅ Verification Checklist

Gunakan checklist ini untuk memastikan semua OK:

### Database
- [ ] Database `super_apps_xboss` exists
- [ ] Table `cashflows` exists
- [ ] Table `menus` exists
- [ ] Finance menu ada di table `menus`

**Command:**
```bash
php artisan tinker
DB::select("SHOW TABLES LIKE 'cashflows'");
\App\Models\Menu::where('menu_key', 'finance')->exists();
exit
```

### Backend
- [ ] Migration file exists: `2025_01_22_000006_create_cashflows_table.php`
- [ ] Model exists: `app/Models/Cashflow.php`
- [ ] Controller exists: `app/Http/Controllers/Finance/CashflowController.php`
- [ ] Routes registered

**Command:**
```bash
php artisan route:list --name=cashflow
```

### Frontend
- [ ] Index page exists: `resources/js/pages/Dashboard/Finance/Cashflow/Index.tsx`
- [ ] Table component exists: `CashflowTable.tsx`
- [ ] DataTable component exists: `resources/js/components/ui/data-table.tsx`
- [ ] Textarea component exists: `resources/js/components/ui/textarea.tsx`

**Command:**
```bash
dir resources\js\pages\Dashboard\Finance\Cashflow\Index.tsx
dir resources\js\components\ui\data-table.tsx
```

### Dependencies
- [ ] @tanstack/react-table installed

**Command:**
```bash
npm list @tanstack/react-table
```

### Runtime
- [ ] MySQL running in Laragon
- [ ] PHP accessible
- [ ] Composer installed
- [ ] NPM installed
- [ ] No cache issues

**Commands:**
```bash
php --version
composer --version
npm --version
```

---

## 🆘 Still Having Issues?

### Collect Information

Run this script to collect debug info:

```bash
php artisan tinker --execute="
echo '=== ENVIRONMENT ===' . PHP_EOL;
echo 'PHP: ' . PHP_VERSION . PHP_EOL;
echo 'Laravel: ' . app()->version() . PHP_EOL;
echo 'DB: ' . env('DB_DATABASE') . PHP_EOL;
echo PHP_EOL;

echo '=== TABLES ===' . PHP_EOL;
try {
    \$tables = DB::select('SHOW TABLES');
    echo 'Total: ' . count(\$tables) . PHP_EOL;
    foreach(\$tables as \$t) {
        \$arr = (array)\$t;
        echo '  - ' . array_values(\$arr)[0] . PHP_EOL;
    }
} catch (Exception \$e) {
    echo 'ERROR: ' . \$e->getMessage() . PHP_EOL;
}
echo PHP_EOL;

echo '=== MENUS ===' . PHP_EOL;
echo 'Total: ' . \App\Models\Menu::count() . PHP_EOL;
\App\Models\Menu::all(['menu_key', 'name'])->each(function(\$m) {
    echo '  - ' . \$m->menu_key . ': ' . \$m->name . PHP_EOL;
});
echo PHP_EOL;

echo '=== CASHFLOW TABLE ===' . PHP_EOL;
try {
    echo 'Records: ' . DB::table('cashflows')->count() . PHP_EOL;
} catch (Exception \$e) {
    echo 'ERROR: ' . \$e->getMessage() . PHP_EOL;
}
"
```

Copy output dan share untuk troubleshooting lebih lanjut.

---

## 📞 Quick Commands Reference

**Clear everything:**
```bash
php artisan optimize:clear
```

**Reset database:**
```bash
php artisan migrate:fresh --seed
```

**Rebuild frontend:**
```bash
npm run build
```

**Check logs:**
```bash
tail storage/logs/laravel.log
```

**Test database:**
```bash
php artisan tinker
DB::connection()->getPdo();
exit
```

---

Last Updated: 2025-10-23
