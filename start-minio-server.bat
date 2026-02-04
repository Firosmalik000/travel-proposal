@echo off
echo ========================================
echo Starting MinIO Server with Docker
echo ========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running!
    echo.
    echo Please:
    echo 1. Install Docker Desktop dari https://www.docker.com/products/docker-desktop/
    echo 2. Start Docker Desktop
    echo 3. Jalankan script ini lagi
    echo.
    pause
    exit /b 1
)

echo Checking for existing MinIO container...
docker ps -a | findstr minio-xboss >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo MinIO container sudah ada. Stopping dan removing...
    docker stop minio-xboss >nul 2>&1
    docker rm minio-xboss >nul 2>&1
)

echo.
echo Starting MinIO server dengan Docker Compose...
docker-compose -f docker-compose-minio.yml up -d

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo MinIO Server berhasil dijalankan!
    echo ========================================
    echo.
    echo MinIO API: http://localhost:9000
    echo MinIO Console: http://localhost:9001
    echo.
    echo Login Credentials:
    echo Username: xbossindonesia
    echo Password: 5Ee[.-#gERx0
    echo.
    echo Bucket yang akan dibuat: xbossone
    echo.
    echo Tunggu sekitar 10 detik untuk MinIO siap...
    timeout /t 10 /nobreak >nul
    echo.
    echo Buka browser: http://localhost:9001
    echo.
) else (
    echo.
    echo ERROR: Gagal menjalankan MinIO server!
    echo Cek apakah Docker Desktop sudah berjalan.
    echo.
)

pause
