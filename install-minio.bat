@echo off
echo ========================================
echo MinIO S3 Package Installation
echo ========================================
echo.

echo Installing AWS S3 Flysystem package...
composer require league/flysystem-aws-s3-v3 "^3.0" --with-all-dependencies

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Pastikan MinIO server sudah berjalan
echo 2. Buat bucket 'xbossone' di MinIO Console
echo 3. Baca dokumentasi lengkap di MINIO_SETUP_GUIDE.md
echo.
pause
