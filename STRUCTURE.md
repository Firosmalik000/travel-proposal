# 📂 Struktur Project - Super Apps XBoss

Dokumentasi lengkap struktur folder dan file project dengan pengelompokan yang terorganisir.

## 🎯 Prinsip Struktur

### Modular & Grouped
- **Backend controllers** dikelompokkan berdasarkan modul (Administrator, HRD)
- **Frontend pages** menggunakan struktur modular dengan components terpisah
- Setiap modul punya folder `components/` sendiri untuk form, table, dialog

### Easy to Read & Maintain
- Nama folder dan file jelas menggambarkan fungsinya
- Components reusable dan isolated
- Separation of concerns yang baik

---

## 📁 Backend Structure

```
app/Http/Controllers/
├── Administrator/              # Module Administrator
│   ├── MenuController.php      # CRUD Menu + getUserMenus()
│   └── UserAccessController.php # CRUD User Access + checkPermission()
│
└── HRD/                        # Module HRD
    ├── DepartmentController.php # CRUD Department
    ├── JabatanController.php    # CRUD Jabatan
    └── KaryawanController.php   # CRUD Karyawan + Export

app/Models/
├── User.php                    # User model with relationships
├── Menu.php                    # Menu dengan parent-child relationship
├── UserAccess.php              # Permission model
├── Department.php              # Department model
├── Jabatan.php                 # Jabatan model
└── Karyawan.php                # Karyawan model

app/Http/Middleware/
└── CheckMenuPermission.php     # Middleware untuk check permission per route
```

---

## 📁 Frontend Structure (Modular)

```
resources/js/
│
├── components/
│   ├── dynamic-sidebar.tsx         # Sidebar dynamic dari database
│   ├── app-*.tsx                   # App-level components (existing)
│   └── ui/                         # Shadcn UI components
│       ├── table.tsx
│       ├── dialog.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── card.tsx
│       └── ...
│
├── pages/
│   └── Dashboard/
│       │
│       ├── Administrator/          # Module Administrator
│       │   ├── Menus/
│       │   │   ├── Index.tsx       # Main page - Menu Management
│       │   │   └── components/     # Menu-specific components
│       │   │       ├── MenuForm.tsx
│       │   │       ├── MenuTable.tsx
│       │   │       └── DeleteMenuDialog.tsx
│       │   │
│       │   └── UserAccess/
│       │       ├── Index.tsx       # Main page - User Access
│       │       └── components/     # UserAccess-specific components
│       │           ├── UserAccessForm.tsx
│       │           ├── UserAccessTable.tsx
│       │           └── DeleteUserAccessDialog.tsx
│       │
│       └── HRD/                    # Module HRD
│           ├── MasterDepartment/
│           │   ├── Index.tsx       # Main page - Department
│           │   └── components/
│           │       ├── DepartmentForm.tsx      # Form create/edit
│           │       ├── DepartmentTable.tsx     # Table display
│           │       └── DeleteDepartmentDialog.tsx
│           │
│           ├── MasterJabatan/
│           │   ├── Index.tsx       # Main page - Jabatan
│           │   └── components/
│           │       ├── JabatanForm.tsx         # Form dengan department dropdown
│           │       ├── JabatanTable.tsx        # Table dengan salary range
│           │       └── DeleteJabatanDialog.tsx
│           │
│           └── MasterKaryawan/
│               ├── Index.tsx       # Main page - Karyawan
│               └── components/
│                   ├── KaryawanForm.tsx        # Form lengkap dengan filter
│                   ├── KaryawanTable.tsx       # Table dengan foto
│                   └── DeleteKaryawanDialog.tsx
│
└── layouts/
    └── app/
        └── app-sidebar-layout.tsx  # Layout with DynamicSidebar
```

---

## 🎨 Component Pattern

### Main Page (Index.tsx)
**Responsibilities:**
- Layout & breadcrumbs
- State management (dialog open/close, editing state)
- Handler functions (create, edit, delete)
- Render header, filters, dan cards

**Example:**
```tsx
export default function MasterDepartmentIndex({ departments }: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);

    const handleCreate = () => { ... }
    const handleEdit = (dept) => { ... }
    const handleDelete = (dept) => { ... }

    return (
        <AppSidebarLayout>
            <DepartmentTable onEdit={handleEdit} onDelete={handleDelete} />
            <DepartmentForm isOpen={isFormOpen} onClose={...} department={editingDept} />
            <DeleteDepartmentDialog ... />
        </AppSidebarLayout>
    );
}
```

### Table Component (XxxTable.tsx)
**Responsibilities:**
- Display data dalam table format
- Emit events via callback props (onEdit, onDelete)
- Conditional rendering (status badge, buttons)

**Props:**
```tsx
interface Props {
    data: DataType[];
    onEdit: (item: DataType) => void;
    onDelete: (item: DataType) => void;
}
```

### Form Component (XxxForm.tsx)
**Responsibilities:**
- Form input handling
- Form submission (create/update)
- Validation errors display
- Dialog wrapper

**Props:**
```tsx
interface Props {
    isOpen: boolean;
    onClose: () => void;
    item?: DataType | null;  // null = create mode
    // Additional props (dropdown data, dll)
}
```

### Delete Dialog Component (DeleteXxxDialog.tsx)
**Responsibilities:**
- Confirmation dialog
- Delete action handling

**Props:**
```tsx
interface Props {
    isOpen: boolean;
    onClose: () => void;
    item: DataType | null;
}
```

---

## 🔄 Data Flow Pattern

```
1. User clicks "Tambah" button
   ↓
2. Index.tsx sets `isFormOpen = true` dan `editingItem = null`
   ↓
3. XxxForm component renders (create mode)
   ↓
4. User fills form and submits
   ↓
5. XxxForm calls useForm().post()
   ↓
6. Laravel controller processes request
   ↓
7. onSuccess callback: close dialog, reset form
   ↓
8. Inertia refreshes page data
   ↓
9. Table component re-renders with new data
```

---

## 📦 Module Checklist

Untuk menambah module baru, ikuti checklist ini:

### Backend
- [ ] Create Controller di folder module (`app/Http/Controllers/ModuleName/`)
- [ ] Create Model (`app/Models/`)
- [ ] Create Migration (`database/migrations/`)
- [ ] Add routes di `routes/web.php`
- [ ] (Optional) Create Seeder

### Frontend
- [ ] Create main page (`pages/Dashboard/ModuleName/Index.tsx`)
- [ ] Create folder `components/`
- [ ] Create `XxxTable.tsx`
- [ ] Create `XxxForm.tsx`
- [ ] Create `DeleteXxxDialog.tsx`
- [ ] Add menu via Admin Panel atau Seeder

### Documentation
- [ ] Update README
- [ ] Update this STRUCTURE.md if needed

---

## 🎯 Naming Conventions

### Backend
- Controllers: `{ModuleName}Controller.php`
- Models: `{ModelName}.php` (singular)
- Tables: `{model_names}` (plural, snake_case)

### Frontend
- Pages: `Index.tsx` (inside module folder)
- Components: `{Purpose}{Type}.tsx`
  - `DepartmentForm.tsx` ✅
  - `DeleteDepartmentDialog.tsx` ✅
  - `DepartmentTable.tsx` ✅

### Variables
- camelCase for JS/TS variables
- PascalCase for components
- snake_case untuk database columns

---

## 📝 Example: Adding New Module "Finance"

### 1. Backend

```bash
# Create Controller
touch app/Http/Controllers/Finance/TransactionController.php
```

```php
<?php
namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::all();
        return Inertia::render('Dashboard/Finance/Transactions/Index', [
            'transactions' => $transactions
        ]);
    }

    // ... CRUD methods
}
```

### 2. Frontend Structure

```
pages/Dashboard/Finance/
└── Transactions/
    ├── Index.tsx
    └── components/
        ├── TransactionForm.tsx
        ├── TransactionTable.tsx
        └── DeleteTransactionDialog.tsx
```

### 3. Add Menu

Via Admin Panel:
1. Login → Administrator → Menu Management
2. Tambah menu "Finance" (parent)
3. Tambah submenu "Transactions" (child of Finance)
4. Grant access via User Access Management

---

## 🔍 File Locations Quick Reference

| What | Where |
|------|-------|
| Controllers | `app/Http/Controllers/{Module}/XxxController.php` |
| Models | `app/Models/Xxx.php` |
| Migrations | `database/migrations/YYYY_MM_DD_HHMMSS_xxx.php` |
| Seeders | `database/seeders/XxxSeeder.php` |
| Routes | `routes/web.php` |
| Pages | `resources/js/pages/Dashboard/{Module}/{Page}/Index.tsx` |
| Components | `resources/js/pages/Dashboard/{Module}/{Page}/components/` |
| UI Components | `resources/js/components/ui/` |
| Layouts | `resources/js/layouts/` |

---

## ✨ Benefits of This Structure

### ✅ Modularity
- Setiap module isolated
- Mudah menambah/remove module
- Components reusable

### ✅ Scalability
- Bisa tumbuh tanpa jadi messy
- Clear boundaries antar module
- Easy to navigate

### ✅ Maintainability
- Mudah find & fix bugs
- Clear separation of concerns
- Consistent patterns

### ✅ Team Collaboration
- Multiple developers bisa work on different modules
- Less merge conflicts
- Clear ownership

---

**Last Updated:** 22 Januari 2025
**Version:** 2.0 (Modular Structure)
