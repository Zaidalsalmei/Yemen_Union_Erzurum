@echo off
:: ================================================================
:: YEMEN UNION SYSTEM - ONE CLICK RUN (V2)
:: ================================================================
TITLE Yemen Union System - Auto Launcher
CLS

SET "XAMPP_ROOT=C:\xampp"
SET "PROJECT_DIR=C:\xampp\htdocs\projects\yemen-union-system"
:: FIXED: Point to the Vite React App (Port 5176 per config), NOT the PHP folder
SET "TARGET_URL=http://localhost:5176"

ECHO ============================================================
ECHO    YEMEN UNION SYSTEM - STARTUP SEQUENCE
ECHO ============================================================

:: 1. Start XAMPP Services (Apache/MySQL)
ECHO.
ECHO [1/3] Checking XAMPP Services...
:: Apache
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
IF "%ERRORLEVEL%"=="0" (
    ECHO    -> Apache is running.
) ELSE (
    ECHO    -> Starting Apache...
    START "" "%XAMPP_ROOT%\apache_start.bat"
)
:: MySQL
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
IF "%ERRORLEVEL%"=="0" (
    ECHO    -> MySQL is running.
) ELSE (
    ECHO    -> Starting MySQL...
    START "" "%XAMPP_ROOT%\mysql_start.bat"
)


:: 2. Start Backend API (Port 8000)
ECHO.
ECHO [2/4] Checking Backend API (Port 8000)...
netstat -an | find "8000" | find "LISTENING" >NUL
IF "%ERRORLEVEL%"=="0" (
    ECHO    -> Backend API is ALREADY RUNNING.
) ELSE (
    ECHO    -> Starting Backend API Server...
    IF EXIST "%PROJECT_DIR%\backend\public" (
        START "Yemen Union Backend" /MIN "%XAMPP_ROOT%\php\php.exe" -S localhost:8000 -t "%PROJECT_DIR%\backend\public" "%PROJECT_DIR%\backend\router.php"
    ) ELSE (
        ECHO    [!] ERROR: Backend public folder not found.
    )
)

:: 3. Check Frontend (Avoid "Port Already in Use" Error)

ECHO.
ECHO [3/4] Checking Frontend (Port 5176)...
netstat -an | find "5176" | find "LISTENING" >NUL
IF "%ERRORLEVEL%"=="0" (
    ECHO    -> Frontend is ALREADY RUNNING. Skipping start command.
) ELSE (
    ECHO    -> Starting Frontend Server...
    IF EXIST "%PROJECT_DIR%\frontend\package.json" (
        START "Yemen Union Frontend" /MIN CMD /K "CD /D "%PROJECT_DIR%\frontend" && npm run dev"
        :: Wait for Vite to spin up
        TIMEOUT /T 5 >NUL
    ) ELSE (
        ECHO    [!] ERROR: Frontend folder not found.
    )
)

:: 3. Launch Browser
ECHO.
ECHO [4/4] Opening System...
ECHO    -> URL: %TARGET_URL%
START "" "%TARGET_URL%"

ECHO.
ECHO ============================================================
ECHO    SYSTEM READY.
ECHO    If you see the login page, you are good to go.
ECHO ============================================================
TIMEOUT /T 5
EXIT
