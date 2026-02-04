# Super Apps XBoss - Laravel React Inertia

Sistem manajemen perusahaan berbasis Laravel, React, Inertia.js, Shadcn UI, dan Tailwind CSS dengan fitur dynamic menu management dan granular permission control.

## 🚀 Fitur Utama

- ✅ **Dynamic Menu Management** - Menu dapat dikelola via admin panel
- ✅ **Granular Permission Control** - Per-user, per-menu permissions (View, Create, Edit, Delete, Import, Export)
- ✅ **Responsive Dashboard** - Sidebar collapse/expand dengan UI modern
- ✅ **HRD Module** - Master Department, Jabatan, Karyawan
- ✅ **Authentication** - Laravel Fortify dengan 2FA support
- ✅ **Modern UI** - Shadcn UI components dengan Tailwind CSS 4

## 📋 Requirements

- PHP >= 8.2
- Composer
- Node.js >= 18.x
- MySQL >= 5.7
- Laravel 12

## 🔧 Instalasi

### 1. Clone & Install Dependencies

```bash
cd C:\laragon\www\super-apps-xboss
composer install
npm install
```

### 2. Environment Setup

Copy `.env.example` ke `.env` (jika belum ada):

```bash
copy .env.example .env  # Windows
# atau
cp .env.example .env    # Linux/Mac
```

Edit `.env`:

```env
APP_NAME="Super Apps XBoss"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=super_apps_xboss
DB_USERNAME=root
DB_PASSWORD=
```

Generate application key:

```bash
php artisan key:generate
```

### 3. Database Setup

Buat database MySQL:

```sql
CREATE DATABASE super_apps_xboss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Jalankan migrations dan seeder:

```bash
php artisan migrate:fresh --seed
```

**Output yang diharapkan:**
```
Migration table created successfully.
Migrating: 2025_01_22_000001_create_menus_table
Migrated:  2025_01_22_000001_create_menus_table
Migrating: 2025_01_22_000002_create_user_accesses_table
Migrated:  2025_01_22_000002_create_user_accesses_table
...
✓ Menus seeded successfully!
✓ Admin user created: admin@xboss.com / admin123
✓ Admin user access granted for all menus
🎉 Database seeded successfully!
```

### 4. Build Assets

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
```

### 5. Run Application

```bash
php artisan serve
```

Akses aplikasi di: **http://localhost:8000**

## 👤 Default Login

```
Email: admin@xboss.com
Password: admin123
```

## 📁 Struktur Database

### Tables

1. **users** - Data pengguna
2. **menus** - Menu sistem (hierarchical)
3. **user_accesses** - Permission control per user-menu
4. **departments** - Master department
5. **jabatan** - Master jabatan/posisi
6. **karyawan** - Master karyawan

### Menu Hierarchy (Default Seeder)

```
Home (/)
├── Administrator
│   ├── Menu Management
│   └── User Access
├── HRD
│   └── HRIS
│       ├── Master Department
│       ├── Master Jabatan
│       └── Master Karyawan
└── Profile
```

## 🎨 Component Structure

### React Components

```
resources/js/
├── components/
│   ├── dynamic-sidebar.tsx          # Dynamic menu dari database
│   ├── ui/                          # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   └── ...
├── pages/
│   ├── Dashboard/
│   │   ├── Administrator/
│   │   │   ├── Menus/Index.tsx     # Menu Management
│   │   │   └── UserAccess/Index.tsx # User Access Management
│   │   └── HRD/
│   │       └── HRIS/
│   │           ├── MasterDepartment/Index.tsx
│   │           ├── MasterJabatan/Index.tsx (TODO)
│   │           └── MasterKaryawan/Index.tsx (TODO)
│   └── auth/
├── layouts/
│   └── app/
│       └── app-sidebar-layout.tsx   # Layout dengan sidebar
└── types/
```

### Laravel Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── MenuController.php
│   │   ├── UserAccessController.php
│   │   ├── DepartmentController.php
│   │   ├── JabatanController.php
│   │   └── KaryawanController.php
│   └── Middleware/
│       └── CheckMenuPermission.php
├── Models/
│   ├── User.php
│   ├── Menu.php
│   ├── UserAccess.php
│   ├── Department.php
│   ├── Jabatan.php
│   └── Karyawan.php
└── ...
```

## 🔐 Permission System

### Permission Types

Setiap user-menu memiliki 6 tipe permission:

- `can_view` - Lihat menu di sidebar dan akses halaman
- `can_create` - Buat data baru
- `can_edit` - Edit data
- `can_delete` - Hapus data
- `can_import` - Import data
- `can_export` - Export data

### Cara Menggunakan

1. **Setup Menu** (Administrator > Menu Management)
   - Tambah menu baru dengan path, icon, dan parent

2. **Setup User Access** (Administrator > User Access)
   - Pilih user dan menu
   - Centang permission yang diinginkan

3. **User Login**
   - Sidebar akan menampilkan menu sesuai permission
   - Button Create/Edit/Delete otomatis tersembunyi jika tidak ada permission

### Check Permission di Controller

```php
use App\Models\UserAccess;

// Check permission
$hasEdit = UserAccess::hasPermission($userId, $menuId, 'can_edit');

if (!$hasEdit) {
    abort(403, 'Tidak ada akses');
}
```

### Check Permission di Frontend

```tsx
const [permissions, setPermissions] = useState({});

useEffect(() => {
    fetch('/dashboard/administrator/user-access/check-permission', {
        method: 'POST',
        body: JSON.stringify({
            menu_id: menuId,
            permission: 'can_create'
        })
    })
    .then(res => res.json())
    .then(data => setPermissions(data));
}, []);

// Render conditional
{permissions.can_create && (
    <Button onClick={handleCreate}>Tambah Data</Button>
)}
```

## 📝 Routing

### API Routes

```php
// Get user menus (untuk sidebar)
GET /api/user-menus

// Menu Management
GET    /dashboard/administrator/menus
POST   /dashboard/administrator/menus
PUT    /dashboard/administrator/menus/{id}
DELETE /dashboard/administrator/menus/{id}

// User Access
GET    /dashboard/administrator/user-access
POST   /dashboard/administrator/user-access
PUT    /dashboard/administrator/user-access/{id}
DELETE /dashboard/administrator/user-access/{id}
POST   /dashboard/administrator/user-access/check-permission

// HRD - Department
GET    /dashboard/hrd/hris/master-department
POST   /dashboard/hrd/hris/master-department
PUT    /dashboard/hrd/hris/master-department/{id}
DELETE /dashboard/hrd/hris/master-department/{id}

// HRD - Jabatan
GET    /dashboard/hrd/hris/master-jabatan
POST   /dashboard/hrd/hris/master-jabatan
PUT    /dashboard/hrd/hris/master-jabatan/{id}
DELETE /dashboard/hrd/hris/master-jabatan/{id}

// HRD - Karyawan
GET    /dashboard/hrd/hris/master-karyawan
POST   /dashboard/hrd/hris/master-karyawan
PUT    /dashboard/hrd/hris/master-karyawan/{id}
DELETE /dashboard/hrd/hris/master-karyawan/{id}
GET    /dashboard/hrd/hris/master-karyawan/export
```

## 🎯 TODO / Belum Selesai

### Frontend Pages

- [ ] Master Jabatan Index page
- [ ] Master Karyawan Index page
- [ ] Profile management page
- [ ] Dashboard homepage dengan statistics

### Features

- [ ] Export ke Excel (Master Karyawan)
- [ ] Upload foto karyawan
- [ ] Search & filter di semua tabel
- [ ] Pagination untuk tabel besar
- [ ] Dark mode toggle
- [ ] Activity logs

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev
php artisan serve

# Build for production
npm run build

# Linting & Formatting
npm run lint
npm run format

# Run tests
php artisan test
```

### Adding New Menu

1. **Via Database Seeder** (untuk default menus):

Edit `database/seeders/MenuSeeder.php`:

```php
Menu::create([
    'name' => 'Accounting',
    'path' => '/dashboard/accounting',
    'icon' => 'Calculator',
    'parent_id' => null,
    'order' => 4,
    'is_active' => true,
]);
```

2. **Via Admin Panel** (runtime):

Login > Administrator > Menu Management > Tambah Menu

3. **Create Controller & Routes**:

```bash
php artisan make:controller AccountingController
```

Edit `routes/web.php`:

```php
Route::get('dashboard/accounting', [AccountingController::class, 'index']);
```

4. **Create React Page**:

```tsx
// resources/js/pages/Dashboard/Accounting/Index.tsx
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

export default function AccountingIndex() {
    return (
        <AppSidebarLayout breadcrumbs={[...]}>
            {/* Your content */}
        </AppSidebarLayout>
    );
}
```

5. **Grant Access** (Administrator > User Access):

Pilih user, pilih menu "Accounting", centang permissions.

## 🐛 Troubleshooting

### Problem: Sidebar tidak muncul menu

**Solution:**
- Cek user access di tabel `user_accesses`
- Pastikan `can_view = true`
- Cek menu `is_active = true`
- Clear browser cache

### Problem: 403 Forbidden saat akses halaman

**Solution:**
- Cek user access permissions
- Pastikan user punya `can_view` untuk menu tersebut

### Problem: Migration error

**Solution:**
```bash
php artisan migrate:fresh --seed
```

### Problem: Asset tidak load

**Solution:**
```bash
npm run dev
# atau
npm run build
```

## 📚 Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js](https://inertiajs.com/)
- [React](https://react.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

MIT License

## 👥 Credits

Developed for XBoss Company - Super Apps Management System

---

**Happy Coding! 🚀**
