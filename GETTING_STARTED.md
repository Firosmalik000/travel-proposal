# 🚀 Getting Started - Super Apps XBoss

Panduan cepat untuk menjalankan aplikasi Super Apps XBoss.

## ✅ Quick Start (5 Menit)

### Step 1: Install Dependencies

```bash
composer install
npm install
```

### Step 2: Setup Environment

```bash
# Copy environment file
copy .env.example .env

# Generate application key
php artisan key:generate
```

### Step 3: Configure Database

Edit file `.env`:

```env
DB_DATABASE=super_apps_xboss
DB_USERNAME=root
DB_PASSWORD=
```

Buat database di MySQL:

```sql
CREATE DATABASE super_apps_xboss;
```

### Step 4: Run Migrations & Seeders

```bash
php artisan migrate:fresh --seed
```

**Output sukses:**
```
✓ Menus seeded successfully!
✓ Admin user created: admin@xboss.com / admin123
✓ Admin user access granted for all menus
🎉 Database seeded successfully!
```

### Step 5: Build Assets & Run Server

Terminal 1 (Vite dev server):
```bash
npm run dev
```

Terminal 2 (Laravel server):
```bash
php artisan serve
```

### Step 6: Login

Buka browser: **http://localhost:8000**

```
Email: admin@xboss.com
Password: admin123
```

## 🎯 Apa yang Sudah Dibuat?

### ✅ Backend (Laravel)

1. **Migrations** (5 tables)
   - `users` - Data pengguna
   - `menus` - Menu sistem (hierarchical)
   - `user_accesses` - Permission control
   - `departments` - Master department
   - `jabatan` - Master jabatan
   - `karyawan` - Master karyawan

2. **Models** dengan relationships
   - `Menu`, `UserAccess`, `Department`, `Jabatan`, `Karyawan`

3. **Controllers**
   - `MenuController` - CRUD menu + get user menus
   - `UserAccessController` - Manage permissions
   - `DepartmentController`, `JabatanController`, `KaryawanController`

4. **Seeders**
   - Admin user (admin@xboss.com)
   - 11 menu items dengan struktur hierarchical
   - Full access untuk admin

5. **Routes** - Semua endpoint sudah configured

6. **Middleware** - `CheckMenuPermission` untuk authorization

### ✅ Frontend (React + Inertia)

1. **Components**
   - `DynamicSidebar` - Sidebar yang load menu dari database
   - `Table`, `Dialog`, `Button`, dll (Shadcn UI)

2. **Pages**
   - ✅ Menu Management (`/dashboard/administrator/menus`)
   - ✅ User Access Management (`/dashboard/administrator/user-access`)
   - ✅ Master Department (`/dashboard/hrd/hris/master-department`)

3. **Layouts**
   - `AppSidebarLayout` - Layout dengan dynamic sidebar

### 📋 TODO (Yang Belum Dibuat)

Anda perlu membuat 2 halaman lagi dengan copy-paste dari MasterDepartment:

1. **Master Jabatan** (`resources/js/pages/Dashboard/HRD/HRIS/MasterJabatan/Index.tsx`)
2. **Master Karyawan** (`resources/js/pages/Dashboard/HRD/HRIS/MasterKaryawan/Index.tsx`)

Strukturnya sama persis dengan `MasterDepartment/Index.tsx`, tinggal sesuaikan:
- Field form sesuai migration
- API endpoint path
- Label dan text

## 📖 Cara Menggunakan Fitur

### 1. Menu Management

**Path:** Administrator > Menu Management

**Fitur:**
- Tambah menu baru
- Edit menu existing
- Hapus menu
- Set parent menu (untuk submenu)
- Set icon dan order

**Contoh Use Case:**
```
1. Buat menu "Finance" (parent)
2. Buat submenu "Laporan Keuangan" dengan parent "Finance"
3. Menu otomatis muncul di sidebar (setelah diberi access)
```

### 2. User Access Management

**Path:** Administrator > User Access

**Fitur:**
- Grant/revoke access user ke menu
- Set granular permissions: View, Create, Edit, Delete, Import, Export

**Contoh Use Case:**
```
User: budi@company.com
Menu: Master Karyawan
Permissions:
  ✓ Can View    - Budi bisa lihat menu & buka halaman
  ✓ Can Create  - Budi bisa tambah karyawan baru
  ✗ Can Edit    - Budi TIDAK bisa edit karyawan
  ✗ Can Delete  - Budi TIDAK bisa hapus karyawan
```

### 3. HRD Modules

**Path:** HRD > HRIS

**Modules:**
- Master Department - Kelola departemen
- Master Jabatan - Kelola jabatan/posisi
- Master Karyawan - Kelola data karyawan

## 🎨 Customization

### Menambah Icon Baru

Edit `resources/js/components/dynamic-sidebar.tsx`:

```tsx
import { Calculator, ... } from 'lucide-react';

const iconMap: Record<string, any> = {
    Home,
    Settings,
    Calculator,  // Icon baru
    // ... existing icons
};
```

### Menambah Module Baru

1. **Create Migration:**
```bash
php artisan make:migration create_products_table
```

2. **Create Model:**
```bash
php artisan make:model Product
```

3. **Create Controller:**
```bash
php artisan make:controller ProductController
```

4. **Add Route** di `routes/web.php`

5. **Create React Page** di `resources/js/pages/...`

6. **Add Menu** via Admin Panel atau Seeder

7. **Grant Access** via User Access Management

## 🔧 Development Tips

### Hot Reload Issues

Jika perubahan code tidak muncul:

```bash
# Restart Vite
npm run dev

# Clear Laravel cache
php artisan optimize:clear
```

### Database Reset

Jika ingin reset database:

```bash
php artisan migrate:fresh --seed
```

### Add New Admin User

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

User::create([
    'name' => 'New Admin',
    'email' => 'newadmin@xboss.com',
    'password' => Hash::make('password123'),
]);
```

Lalu grant access via User Access Management.

## 📊 Database Schema

### Relationships

```
users (1) ----< (N) user_accesses (N) >---- (1) menus
                                                  |
                                            self-reference
                                            (parent-child)

departments (1) ----< (N) jabatan (1) ----< (N) karyawan
     |
     └----< (N) karyawan
```

### Permission Logic

```
User dapat akses menu jika:
1. Ada record di user_accesses
2. user_id = current user
3. menu_id = target menu
4. can_view = true

User dapat Create/Edit/Delete jika:
- Punya access View DAN
- can_create/can_edit/can_delete = true
```

## 🐛 Common Issues

### Issue 1: Sidebar kosong

**Penyebab:** User belum punya access ke menu apapun

**Solution:**
```
1. Login sebagai admin@xboss.com
2. Buka Administrator > User Access
3. Tambah access untuk user tersebut
```

### Issue 2: 404 Not Found

**Penyebab:** Route belum didefinisikan atau React page belum dibuat

**Solution:**
```
1. Cek routes/web.php apakah route ada
2. Cek resources/js/pages/... apakah page component ada
3. Pastikan npm run dev sedang running
```

### Issue 3: Permission denied

**Penyebab:** User tidak punya permission yang dibutuhkan

**Solution:**
```
1. Buka Administrator > User Access
2. Edit access untuk user + menu terkait
3. Centang permission yang dibutuhkan
```

## 📞 Support

Jika ada pertanyaan atau issue:

1. Cek dokumentasi di `README_XBOSS.md`
2. Lihat kode example di halaman yang sudah dibuat
3. Debug dengan `dd()` (Laravel) atau `console.log()` (React)

---

**Selamat mengembangkan Super Apps XBoss! 🎉**
