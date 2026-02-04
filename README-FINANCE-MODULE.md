# 💰 Finance Module - Cashflow Management

## 📋 Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [What's Included](#whats-included)
4. [Installation](#installation)
5. [Features](#features)
6. [File Structure](#file-structure)
7. [Usage](#usage)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Finance Module dengan fitur **Cashflow Management** untuk mencatat transaksi keuangan perusahaan:
- ✅ **Debit** (Uang Masuk)
- ✅ **Credit** (Uang Keluar)
- ✅ Multiple payment methods: QRIS, Transfer, Cash, Card
- ✅ DataTable dengan sorting, search, pagination
- ✅ CRUD operations lengkap
- ✅ Currency formatting (Rupiah)
- ✅ Color-coded badges

---

## 🚀 Quick Start

### Metode 1: Automatic Setup (Recommended)

**Double-click file ini:**
```
COMPLETE-SETUP.cmd
```

Script akan:
1. ✅ Create database tables
2. ✅ Seed Finance menu
3. ✅ Verify everything works

### Metode 2: Manual Setup

```bash
# 1. Run migrations
php artisan migrate

# 2. Seed menus
php artisan db:seed --class=MenuSeeder

# 3. Build frontend
npm run build

# 4. Clear cache
php artisan optimize:clear
```

### Metode 3: Full Reset (⚠️ Deletes all data)

```bash
php artisan migrate:fresh --seed
npm run build
```

---

## 📦 What's Included

### ✅ Backend Components

#### Database
- **Migration**: `database/migrations/2025_01_22_000006_create_cashflows_table.php`
  - Table: `cashflows`
  - Columns: id, date, type, amount, description, method, timestamps

#### Models
- **Cashflow**: `app/Models/Cashflow.php`
  - Fillable fields
  - Date casting
  - Scope queries: debit(), credit(), dateRange(), byMethod(), byPeriod()

#### Controllers
- **CashflowController**: `app/Http/Controllers/Finance/CashflowController.php`
  - index() - List all cashflows
  - store() - Create new transaction
  - update() - Update transaction
  - destroy() - Delete transaction

#### Routes
- `GET /dashboard/finance/cashflow` → Index
- `POST /dashboard/finance/cashflow` → Store
- `PUT /dashboard/finance/cashflow/{id}` → Update
- `DELETE /dashboard/finance/cashflow/{id}` → Destroy

#### Seeders
- **MenuSeeder**: `database/seeders/MenuSeeder.php` (updated)
  - Finance parent menu
  - Cashflow submenu

### ✅ Frontend Components

#### Pages
- **Index**: `resources/js/pages/Dashboard/Finance/Cashflow/Index.tsx`
  - Main page with CRUD forms
  - Create/Edit dialogs
  - Delete confirmation
  - Form validation

#### Components
- **CashflowTable**: `resources/js/pages/Dashboard/Finance/Cashflow/components/CashflowTable.tsx`
  - DataTable implementation
  - Column definitions with sorting
  - Search functionality
  - Pagination controls
  - Action buttons (Edit/Delete)

#### UI Components
- **DataTable**: `resources/js/components/ui/data-table.tsx` (existing)
- **Textarea**: `resources/js/components/ui/textarea.tsx` (new)
- Others: Button, Dialog, Input, Select, Card, etc.

### ✅ Setup Scripts

All scripts are located in project root:

| Script | Purpose | Usage |
|--------|---------|-------|
| `COMPLETE-SETUP.cmd` | **Recommended** - Run everything | Double-click |
| `setup-finance.cmd` | Setup wizard with checks | Double-click |
| `seed-finance-menu.cmd` | Seed menu only | Double-click |
| `seed-finance-menu.ps1` | PowerShell version | `.\seed-finance-menu.ps1` |
| `fix-cashflow-table.cmd` | Fix table error | Double-click |
| `run-all-migrations.cmd` | Run migrations | Double-click |
| `insert-finance-menu.sql` | Manual SQL insert | Run in phpMyAdmin |

### ✅ Documentation

| File | Description |
|------|-------------|
| `FINANCE-MENU-SETUP-GUIDE.md` | Complete setup guide |
| `TROUBLESHOOTING.md` | Error solutions |
| `QUICK-COMMANDS.txt` | Command cheat sheet |
| `README-FINANCE-MODULE.md` | This file |

---

## 💻 Installation

### Prerequisites
- ✅ Laragon installed with MySQL running
- ✅ PHP >= 8.1
- ✅ Composer installed
- ✅ Node.js & NPM installed
- ✅ Database created

### Step-by-Step Installation

#### 1. Run Setup Script
```bash
# Navigate to project
cd C:\laragon\www\super-apps-xboss

# Run complete setup
COMPLETE-SETUP.cmd
```

#### 2. Or Manual Installation

```bash
# Install NPM dependencies (if not done)
npm install @tanstack/react-table

# Run migrations
php artisan migrate

# Seed menus
php artisan db:seed --class=MenuSeeder

# Build frontend
npm run build

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

#### 3. Verify Installation

```bash
# Check table exists
php artisan tinker
DB::table('cashflows')->count();
exit

# Check menu exists
php artisan tinker
\App\Models\Menu::where('menu_key', 'finance')->first();
exit

# Check routes
php artisan route:list --name=cashflow
```

---

## ✨ Features

### 1. Transaction Management

#### Add Transaction
- Date picker
- Type selection: Debit (In) / Credit (Out)
- Amount input with decimal support
- Description textarea
- Payment method: QRIS, Transfer, Cash, Card
- Form validation

#### Edit Transaction
- Pre-filled form with existing data
- Same fields as create
- Updates in real-time

#### Delete Transaction
- Confirmation dialog before delete
- Permanent deletion

### 2. DataTable Features

#### Sorting
All columns sortable except Actions:
- Date (ascending/descending)
- Type (debit/credit)
- Amount (numerical sort)
- Description (alphabetical)
- Method (alphabetical)

Visual indicators:
- ⬆️ Ascending: ChevronUp icon
- ⬇️ Descending: ChevronDown icon
- ⬍ Unsorted: ArrowUpDown icon

#### Search & Filter
- Search box for description
- Real-time filtering
- Case-insensitive search

#### Pagination
- Rows per page: 10, 20, 30, 40, 50
- First, Previous, Next, Last navigation
- Page counter: "Page X of Y"
- Results counter: "Showing 1 to 10 of 100"

### 3. UI/UX Features

#### Color Coding
**Transaction Type:**
- 🟢 Debit (Masuk): Green badge
- 🔴 Credit (Keluar): Red badge

**Payment Method:**
- 🟣 QRIS: Purple badge
- 🔵 Transfer: Blue badge
- 🟡 Cash: Yellow badge
- 🟣 Card: Indigo badge

#### Formatting
- Currency: Rp 1.000.000 (Indonesian Rupiah)
- Date: DD/MM/YYYY (Indonesian format)
- Responsive design
- Mobile-friendly

### 4. Security
- CSRF protection
- Form validation (frontend + backend)
- Authorization middleware
- SQL injection protection (Eloquent ORM)

---

## 📁 File Structure

```
super-apps-xboss/
│
├── app/
│   ├── Http/Controllers/Finance/
│   │   └── CashflowController.php          # Main controller
│   └── Models/
│       └── Cashflow.php                     # Eloquent model
│
├── database/
│   ├── migrations/
│   │   └── 2025_01_22_000006_create_cashflows_table.php
│   └── seeders/
│       └── MenuSeeder.php                   # Updated with Finance menu
│
├── resources/js/
│   ├── components/ui/
│   │   ├── data-table.tsx                   # Reusable DataTable
│   │   └── textarea.tsx                     # New component
│   └── pages/Dashboard/Finance/Cashflow/
│       ├── Index.tsx                        # Main page
│       └── components/
│           └── CashflowTable.tsx            # Table component
│
├── routes/
│   └── web.php                              # Updated with Finance routes
│
├── Setup Scripts (Root Directory)/
│   ├── COMPLETE-SETUP.cmd                   # ⭐ Main setup script
│   ├── setup-finance.cmd
│   ├── seed-finance-menu.cmd
│   ├── seed-finance-menu.ps1
│   ├── fix-cashflow-table.cmd
│   ├── run-all-migrations.cmd
│   └── insert-finance-menu.sql
│
└── Documentation (Root Directory)/
    ├── FINANCE-MENU-SETUP-GUIDE.md          # Complete guide
    ├── TROUBLESHOOTING.md                   # Error solutions
    ├── QUICK-COMMANDS.txt                   # Command reference
    └── README-FINANCE-MODULE.md             # This file
```

---

## 🎮 Usage

### Access the Module

1. **Login** to application
2. Look for **"Finance"** menu in sidebar
3. Click **Finance** to expand
4. Click **"Cashflow"** submenu
5. URL: `http://super-apps-xboss.test/dashboard/finance/cashflow`

### Add Transaction

1. Click **"Tambah Transaksi"** button
2. Fill in form:
   - Select date
   - Choose type (Debit/Credit)
   - Enter amount
   - Write description
   - Select payment method
3. Click **"Simpan"**

### Edit Transaction

1. Click **pencil icon** (✏️) on transaction row
2. Modify fields
3. Click **"Simpan"**

### Delete Transaction

1. Click **trash icon** (🗑️) on transaction row
2. Confirm deletion in dialog
3. Click **"Hapus"**

### Search Transactions

1. Use search box above table
2. Type description to search
3. Results filter in real-time

### Sort Transactions

1. Click any column header
2. Click again to reverse order
3. Icon shows sort direction

### Change Page Size

1. Select from dropdown: 10/20/30/40/50
2. Table updates automatically

---

## 🐛 Troubleshooting

### Common Issues

For detailed solutions, see: **TROUBLESHOOTING.md**

#### Quick Fixes

**Error: Table 'cashflows' doesn't exist**
```bash
php artisan migrate
```

**Finance menu not appearing**
```bash
php artisan db:seed --class=MenuSeeder
php artisan cache:clear
```

**Page error 500**
```bash
php artisan optimize:clear
npm run build
```

**Sorting/Search not working**
```bash
npm install @tanstack/react-table
npm run build
```

---

## 📊 Database Schema

### Table: cashflows

```sql
CREATE TABLE `cashflows` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `type` enum('debit','credit') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text NOT NULL,
  `method` enum('QRIS','Transfer','Cash','Card') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cashflows_date_index` (`date`),
  KEY `cashflows_type_index` (`type`),
  KEY `cashflows_method_index` (`method`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Indexes
- `date` - For date range queries
- `type` - For filtering debit/credit
- `method` - For payment method filtering

---

## 🔐 API Routes

### List Cashflows
```
GET /dashboard/finance/cashflow
```
Returns: Inertia page with all cashflows

### Create Cashflow
```
POST /dashboard/finance/cashflow
```
Body:
```json
{
  "date": "2025-10-23",
  "type": "debit",
  "amount": 1000000,
  "description": "Pembayaran dari klien",
  "method": "Transfer"
}
```

### Update Cashflow
```
PUT /dashboard/finance/cashflow/{id}
```
Body: Same as create

### Delete Cashflow
```
DELETE /dashboard/finance/cashflow/{id}
```

---

## 📝 Development Notes

### Tech Stack
- **Backend**: Laravel 11
- **Frontend**: React 19 + TypeScript
- **UI**: shadcn/ui components
- **Table**: TanStack React Table v8
- **Styling**: Tailwind CSS 4
- **State**: Inertia.js useForm hook
- **Icons**: Lucide React

### Dependencies Added
```json
{
  "@tanstack/react-table": "^8.x"
}
```

### Code Quality
- ✅ TypeScript strict mode
- ✅ Laravel validation
- ✅ Eloquent ORM (no raw SQL)
- ✅ CSRF protection
- ✅ Responsive design
- ✅ Accessibility (ARIA labels)

---

## 🎯 Future Enhancements

Potential features to add:
- [ ] Export to Excel/PDF
- [ ] Date range filtering
- [ ] Charts/Analytics dashboard
- [ ] Categories for transactions
- [ ] Recurring transactions
- [ ] File attachments (receipts)
- [ ] Multi-currency support
- [ ] Bank reconciliation
- [ ] Budget planning
- [ ] Approval workflow

---

## 📞 Support

### Need Help?

1. **Check Documentation**
   - FINANCE-MENU-SETUP-GUIDE.md
   - TROUBLESHOOTING.md
   - QUICK-COMMANDS.txt

2. **Run Diagnostic**
   ```bash
   php artisan about
   php artisan route:list --name=cashflow
   ```

3. **Check Logs**
   ```bash
   tail storage/logs/laravel.log
   ```

4. **Collect Debug Info**
   See TROUBLESHOOTING.md for debug script

---

## 📜 License

Part of Super Apps XBoss project.

---

## 🎉 Changelog

### Version 1.0.0 (2025-10-23)
- ✅ Initial release
- ✅ Cashflow management module
- ✅ Finance menu integration
- ✅ DataTable with full features
- ✅ Complete CRUD operations
- ✅ Setup automation scripts
- ✅ Comprehensive documentation

---

**Last Updated**: 2025-10-23
**Module Version**: 1.0.0
**Laravel Version**: 11.x
**Status**: ✅ Production Ready
