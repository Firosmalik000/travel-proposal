# 📧 Setup Gmail SMTP untuk Mengirim Email

## ⚠️ PENTING: Anda harus melengkapi konfigurasi berikut!

File `.env` sudah diupdate dengan template Gmail SMTP, tetapi Anda perlu mengisi kredensial Gmail Anda.

---

## 🔐 Langkah 1: Buat App Password Gmail

**JANGAN gunakan password Gmail biasa!** Anda harus membuat App Password khusus.

### Cara Membuat App Password:

1. **Buka Google Account Security:**
   - Link: https://myaccount.google.com/security
   - Login dengan akun Gmail yang akan digunakan

2. **Aktifkan 2-Step Verification (jika belum):**
   - Cari "2-Step Verification"
   - Klik "Get Started" dan ikuti instruksi
   - **App Password hanya bisa dibuat jika 2FA sudah aktif**

3. **Generate App Password:**
   - Setelah 2FA aktif, buka: https://myaccount.google.com/apppasswords
   - Atau cari "App passwords" di halaman security
   - Pilih app: **Mail**
   - Pilih device: **Windows Computer** (atau Other - Custom Name)
   - Klik **Generate**
   - Copy 16 karakter password (format: `abcd efgh ijkl mnop`)

---

## 📝 Langkah 2: Update File .env

Buka file: `C:\laragon\www\super-apps-xboss\.env`

Cari bagian MAIL dan update dengan kredensial Anda:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com          # ← Ganti dengan email Gmail Anda
MAIL_PASSWORD=abcd efgh ijkl mnop           # ← Ganti dengan App Password (16 digit)
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com      # ← Ganti dengan email Gmail Anda
MAIL_FROM_NAME="${APP_NAME}"
```

**Contoh:**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=admin@xboss.com
MAIL_PASSWORD=abcd efgh ijkl mnop
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=admin@xboss.com
MAIL_FROM_NAME="${APP_NAME}"
```

---

## 🔄 Langkah 3: Clear Config Cache

Setelah update .env, jalankan command berikut di terminal:

```bash
cd C:\laragon\www\super-apps-xboss
php artisan config:clear
```

Atau dengan Herd:

```bash
cd C:\laragon\www\super-apps-xboss
"C:\Users\XBOSS\.config\herd\bin\php.bat" artisan config:clear
```

---

## 🧪 Langkah 4: Test Kirim Email

1. Buka: http://super-apps-xboss.test/dashboard/hrd/hris/master-karyawan
2. Klik **"Tambah Karyawan"**
3. Isi form dengan email Gmail yang valid
4. Klik **"Simpan"**
5. **Cek inbox Gmail** - email seharusnya masuk dalam beberapa detik!

---

## ⚙️ Troubleshooting

### Email tidak terkirim / Error SMTP

**1. Cek Laravel Log:**
```bash
tail -50 storage/logs/laravel.log
```

**2. Error "Invalid credentials":**
- Pastikan Anda menggunakan **App Password**, bukan password Gmail biasa
- Pastikan 2-Step Verification sudah aktif di akun Gmail

**3. Error "Connection timeout":**
- Pastikan firewall tidak block port 587
- Coba ganti `MAIL_PORT=587` ke `MAIL_PORT=465` dan `MAIL_ENCRYPTION=ssl`

**4. Email masuk ke Spam:**
- Normal untuk pertama kali
- Tandai sebagai "Not Spam" 
- Setup SPF/DKIM untuk production (advanced)

**5. Gmail memblock akun:**
- Buka: https://accounts.google.com/DisplayUnlockCaptcha
- Verifikasi dan allow access
- Tunggu beberapa menit, coba lagi

---

## 📊 Gmail Sending Limits

- **Gmail Gratis:** 500 email per hari
- **Google Workspace:** 2,000 email per hari

Jika butuh lebih, gunakan service email profesional:
- SendGrid (100 email/hari gratis)
- Mailgun (5,000 email/bulan gratis)  
- Amazon SES (62,000 email/bulan gratis)

---

## ✅ Checklist

- [ ] 2-Step Verification aktif di Gmail
- [ ] App Password sudah dibuat
- [ ] File .env sudah diupdate dengan kredensial benar
- [ ] Config cache sudah di-clear (`php artisan config:clear`)
- [ ] Test kirim email berhasil
- [ ] Email masuk ke inbox Gmail

---

## 🔒 Security Notes

1. **JANGAN commit file .env ke Git!**
   - File .env sudah ada di .gitignore
   - Backup di tempat aman (1Password, LastPass, dll)

2. **Jangan share App Password ke siapapun**

3. **Untuk production:**
   - Gunakan environment variables di server
   - Jangan hardcode di .env yang di-commit

---

## 📞 Butuh Bantuan?

Jika masih ada masalah, check:
1. Laravel log: `storage/logs/laravel.log`
2. Error message di browser console (F12)
3. Gmail security: https://myaccount.google.com/security

Good luck! 🚀
