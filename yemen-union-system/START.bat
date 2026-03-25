@echo off
title Yemen Union System
color 0B

echo.
echo  ============================================
echo   Yemen Union System - Quick Start
echo  ============================================
echo.

:: Check if PowerShell is available
where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PowerShell is not available!
    echo Please install PowerShell or run start-system.ps1 manually.
    pause
    exit /b 1
)

:: Check if PHP is available
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PHP is not found in PATH!
    echo Please add PHP to your system PATH.
    echo Example: C:\xampp\php
    pause
    exit /b 1
)

:: Check if npm is available
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: npm is not found in PATH!
    echo Frontend may not start properly.
    timeout /t 3
)

echo Starting system...
echo.

:: Run PowerShell script with execution policy bypass
powershell -ExecutionPolicy Bypass -File "%~dp0start-system.ps1"

:: If PowerShell exits unexpectedly
if %errorlevel% neq 0 (
    echo.
    echo System exited with error code: %errorlevel%
    pause
)
