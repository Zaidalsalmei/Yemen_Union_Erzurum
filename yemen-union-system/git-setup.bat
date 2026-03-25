@echo off
REM ==============================================
REM Yemen Union System - Git Setup Script
REM ==============================================

echo [1/5] Initializing Git repository...
git init

echo [2/5] Adding all files (excluding those in .gitignore)...
git add .

echo [3/5] Making initial commit...
git commit -m "Initial commit: Yemen Union Erzurum System"

echo [4/5] Adding remote origin...
git remote add origin https://github.com/Zaidalsalmei/Yemen_Union_Erzurum.git

echo [5/5] Pushing to main branch...
git branch -M main
git push -u origin main

echo.
echo ==============================================
echo Setup complete! Check your GitHub repository.
echo ==============================================
pause
