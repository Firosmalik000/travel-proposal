# Finance Menu Setup Guide

## 📌 Overview
This guide will help you add Finance menu with Cashflow submenu to your application.

## ✅ What Has Been Created

### 1. Database
- ✅ Migration: `2025_01_22_000006_create_cashflows_table.php`
- ✅ Model: `app/Models/Cashflow.php`

### 2. Backend
- ✅ Controller: `app/Http/Controllers/Finance/CashflowController.php`
- ✅ Routes: Added to `routes/web.php`

### 3. Frontend
- ✅ Page: `resources/js/pages/Dashboard/Finance/Cashflow/Index.tsx`
- ✅ Table Component: `resources/js/pages/Dashboard/Finance/Cashflow/components/CashflowTable.tsx`
- ✅ Textarea UI Component: `resources/js/components/ui/textarea.tsx`

### 4. Menu Seeder
- ✅ Updated: `database/seeders/MenuSeeder.php` (includes Finance menu)

---

## 🚀 Quick Start - Choose ONE Method

### Method 1: Using PowerShell Script (Recommended)

```powershell
# Open PowerShell as Administrator
cd C:\laragon\www\super-apps-xboss
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\seed-finance-menu.ps1
```

### Method 2: Using CMD/Batch Script

```cmd
# Double-click this file:
seed-finance-menu.cmd

# OR run in CMD:
cd C:\laragon\www\super-apps-xboss
seed-finance-menu.cmd
```

### Method 3: Manual Artisan Command

```bash
cd C:\laragon\www\super-apps-xboss
php artisan db:seed --class=MenuSeeder
```

### Method 4: Full Migration + Seeder (DELETES ALL DATA!)

```bash
cd C:\laragon\www\super-apps-xboss
php artisan migrate:fresh --seed
```

### Method 5: SQL Script (If all else fails)

1. Open phpMyAdmin
2. Select your database
3. Open file: `insert-finance-menu.sql`
4. Copy and paste the SQL
5. Click "Go"

---

## 🔍 Verification Steps

### Step 1: Check Database
Run in MySQL/phpMyAdmin:
```sql
SELECT * FROM menus WHERE menu_key = 'finance';
SELECT * FROM menus WHERE menu_key LIKE '%cashflow%';
```

Expected result: 1 row for Finance menu

### Step 2: Check via Tinker
```bash
php artisan tinker
```
```php
\App\Models\Menu::where('menu_key', 'finance')->first();
\App\Models\Menu::all()->pluck('name', 'menu_key');
exit
```

### Step 3: Check in Browser
1. Login to your application
2. Look at sidebar - Finance menu should appear
3. Click Finance → Cashflow
4. Should open: `/dashboard/finance/cashflow`

---

## ⚠️ Troubleshooting

### Error: "Duplicate entry 'finance'"
**Solution**: Table already has Finance menu
```bash
php artisan tinker
```
```php
\App\Models\Menu::where('menu_key', 'finance')->delete();
exit
```
Then run seeder again.

### Error: "Database connection refused"
**Solution**:
1. Open Laragon
2. Click "Start All" to start MySQL
3. Verify MySQL is running (green indicator)

### Error: "Database 'xxx' not found"
**Solution**:
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create database with name from `.env` file
3. Check `DB_DATABASE` in `.env` matches your database name

### Error: "Class MenuSeeder not found"
**Solution**:
```bash
composer dump-autoload
php artisan config:clear
php artisan db:seed --class=MenuSeeder
```

### Finance menu not appearing in sidebar
**Solutions**:
1. Clear cache:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

2. Rebuild frontend:
   ```bash
   npm run build
   ```

3. Hard refresh browser: `Ctrl + Shift + R` or `Ctrl + F5`

4. Check user permissions in `user_accesses` table

---

## 📊 Database Structure

### Table: cashflows
```sql
+-------------+-----------------+------+-----+---------+----------------+
| Field       | Type            | Null | Key | Default | Extra          |
+-------------+-----------------+------+-----+---------+----------------+
| id          | bigint unsigned | NO   | PRI | NULL    | auto_increment |
| date        | date            | NO   | MUL | NULL    |                |
| type        | enum            | NO   | MUL | NULL    |                |
| amount      | decimal(15,2)   | NO   |     | NULL    |                |
| description | text            | NO   |     | NULL    |                |
| method      | enum            | NO   | MUL | NULL    |                |
| created_at  | timestamp       | YES  |     | NULL    |                |
| updated_at  | timestamp       | YES  |     | NULL    |                |
+-------------+-----------------+------+-----+---------+----------------+
```

**Enums**:
- `type`: 'debit', 'credit'
- `method`: 'QRIS', 'Transfer', 'Cash', 'Card'

---

## 🎯 Features

### Cashflow Management Page
- ✅ **DataTable** with sorting, search, pagination
- ✅ **Add Transaction** - Form with validation
- ✅ **Edit Transaction** - Pre-filled form
- ✅ **Delete Transaction** - Confirmation dialog
- ✅ **Color-coded badges** - Type and payment method
- ✅ **Currency formatting** - Rupiah format
- ✅ **Responsive design** - Works on all devices

### DataTable Features
- ✅ Sort by: Date, Type, Amount, Description, Method
- ✅ Search by description
- ✅ Pagination: 10/20/30/40/50 rows per page
- ✅ First/Previous/Next/Last page navigation

---

## 📝 Menu Structure After Seeding

```
1. Home
2. Administrator
   ├── Menu Management
   └── User Access
3. HRD
   └── HRIS
       ├── Master Department
       ├── Master Jabatan
       └── Master Karyawan
4. Finance ⭐ NEW
   └── Cashflow ⭐ NEW
5. Profile
```

---

## 🔗 Routes

```php
GET    /dashboard/finance/cashflow          → Index (List all)
POST   /dashboard/finance/cashflow          → Store (Create new)
PUT    /dashboard/finance/cashflow/{id}     → Update (Edit)
DELETE /dashboard/finance/cashflow/{id}     → Destroy (Delete)
```

---

## 📞 Need Help?

If you still have issues:
1. Copy the error message
2. Check which step failed
3. Provide details about:
   - What command you ran
   - Full error message
   - Your environment (Laragon version, PHP version)

---

## ✨ Success Indicators

You'll know it worked when:
- ✅ Seeder shows: "Finance: 1 submenu (Cashflow - navigable)"
- ✅ Database query returns Finance menu
- ✅ Sidebar shows "Finance" with "Cashflow" submenu
- ✅ Page loads at `/dashboard/finance/cashflow`
- ✅ You can add/edit/delete cashflow transactions

---

**Last Updated**: 2025-10-23
**Version**: 1.0
