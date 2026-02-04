@echo off
echo ========================================
echo   Gmail SMTP Setup Helper
echo ========================================
echo.

set /p EMAIL="Masukkan Gmail Address (contoh: admin@gmail.com): "
set /p PASSWORD="Masukkan App Password (16 digit dari Google): "

echo.
echo Updating .env file...

cd /c/laragon/www/super-apps-xboss

:: Update .env
powershell -Command "(gc .env) -replace 'MAIL_USERNAME=.*', 'MAIL_USERNAME=%EMAIL%' | Out-File -encoding ASCII .env"
powershell -Command "(gc .env) -replace 'MAIL_PASSWORD=.*', 'MAIL_PASSWORD=%PASSWORD%' | Out-File -encoding ASCII .env"
powershell -Command "(gc .env) -replace 'MAIL_FROM_ADDRESS=.*', 'MAIL_FROM_ADDRESS=%EMAIL%' | Out-File -encoding ASCII .env"

echo.
echo Clearing config cache...
"C:\Users\XBOSS\.config\herd\bin\php.bat" artisan config:clear

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Email configuration updated:
echo - MAIL_USERNAME: %EMAIL%
echo - MAIL_FROM_ADDRESS: %EMAIL%
echo - MAIL_PASSWORD: [HIDDEN]
echo.
echo Next steps:
echo 1. Buka: http://super-apps-xboss.test/dashboard/hrd/hris/master-karyawan
echo 2. Tambah karyawan baru
echo 3. Email akan dikirim ke Gmail karyawan!
echo.
pause
