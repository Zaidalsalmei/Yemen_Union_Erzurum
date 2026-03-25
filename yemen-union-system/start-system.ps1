# =====================================================
# Yemen Union System - Complete Startup Pipeline
# =====================================================
# Pipeline: DB Check -> Backend -> Frontend -> Health -> Browser
# =====================================================

param(
    [switch]$SkipBrowser,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "Yemen Union System"

# =====================================================
# CONFIGURATION
# =====================================================
$BACKEND_PORT = 8000
$FRONTEND_PORT = 5176
$projectRoot = $PSScriptRoot
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"

# =====================================================
# HELPER FUNCTIONS
# =====================================================
function Write-Banner {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                                                  ║" -ForegroundColor Cyan
    Write-Host "  ║     YEMEN UNION SYSTEM - Startup Pipeline        ║" -ForegroundColor Cyan
    Write-Host "  ║                                                  ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step { 
    param($num, $msg) 
    Write-Host ""
    Write-Host "  ┌─────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "  │ STEP ${num}: " -ForegroundColor Yellow -NoNewline
    Write-Host $msg -ForegroundColor White
    Write-Host "  └─────────────────────────────────────────────────" -ForegroundColor DarkGray
}

function Write-Success { param($msg) Write-Host "    ✓ " -ForegroundColor Green -NoNewline; Write-Host $msg }
function Write-Error { param($msg) Write-Host "    ✗ " -ForegroundColor Red -NoNewline; Write-Host $msg }
function Write-Info { param($msg) Write-Host "    ℹ " -ForegroundColor Cyan -NoNewline; Write-Host $msg }
function Write-Warning { param($msg) Write-Host "    ⚠ " -ForegroundColor Yellow -NoNewline; Write-Host $msg }

# =====================================================
# PHASE 1: VALIDATE ENVIRONMENT
# =====================================================
Write-Banner
Write-Step "1" "Validating Environment"

# Check .env file
$envFile = Join-Path $backendPath ".env"
if (-not (Test-Path $envFile)) {
    Write-Error ".env file not found!"
    exit 1
}
Write-Success ".env file exists"

# Parse .env
$envContent = Get-Content $envFile -Raw
$requiredKeys = @("DB_HOST", "DB_DATABASE", "DB_USERNAME", "JWT_SECRET", "CORS_ORIGIN")
$missingKeys = @()

foreach ($key in $requiredKeys) {
    if ($envContent -notmatch "$key=") {
        $missingKeys += $key
    }
}

if ($missingKeys.Count -gt 0) {
    Write-Error "Missing required keys: $($missingKeys -join ', ')"
    exit 1
}
Write-Success "All required environment keys present"

# Extract DB config
$dbHost = if ($envContent -match 'DB_HOST=(.+)') { $matches[1].Trim() } else { "localhost" }
$dbPort = if ($envContent -match 'DB_PORT=(.+)') { $matches[1].Trim() } else { "3306" }
$dbName = if ($envContent -match 'DB_DATABASE=(.+)') { $matches[1].Trim() } else { "yemen_union_db" }
$dbUser = if ($envContent -match 'DB_USERNAME=(.+)') { $matches[1].Trim() } else { "root" }
$dbPass = if ($envContent -match 'DB_PASSWORD=(.*)') { $matches[1].Trim() } else { "" }

Write-Info "Database: $dbName @ ${dbHost}:${dbPort}"

# =====================================================
# PHASE 2: CHECK DATABASE CONNECTIVITY
# =====================================================
Write-Step "2" "Checking MySQL Database Connection"

$phpTestCode = "<?php
try {
    `$pdo = new PDO('mysql:host=$dbHost;port=$dbPort;dbname=$dbName', '$dbUser', '$dbPass', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5
    ]);
    `$pdo->query('SELECT 1');
    echo 'CONNECTED';
} catch (PDOException `$e) {
    echo 'ERROR:' . `$e->getMessage();
}
"

$testFile = Join-Path $backendPath "test_db_connection.php"
$phpTestCode | Out-File -FilePath $testFile -Encoding UTF8

try {
    $dbResult = php $testFile 2>&1
    Remove-Item $testFile -Force -ErrorAction SilentlyContinue
    
    if ($dbResult -eq "CONNECTED") {
        Write-Success "Database connection successful!"
    }
    else {
        Write-Error "Database connection failed!"
        Write-Warning $dbResult
        Write-Host ""
        Write-Host "  Please ensure:" -ForegroundColor Yellow
        Write-Host "    1. XAMPP MySQL service is running" -ForegroundColor Yellow
        Write-Host "    2. Database '$dbName' exists" -ForegroundColor Yellow
        Write-Host "    3. Credentials in .env are correct" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
}
catch {
    Remove-Item $testFile -Force -ErrorAction SilentlyContinue
    Write-Error "PHP not found or error occurred: $_"
    exit 1
}

# =====================================================
# PHASE 3: KILL EXISTING PROCESSES
# =====================================================
Write-Step "3" "Cleaning Up Existing Processes"

function Stop-PortProcess {
    param([int]$Port)
    try {
        $connections = netstat -ano | Select-String ":$Port\s+.*LISTENING"
        foreach ($conn in $connections) {
            $parts = $conn -split '\s+'
            $processId = $parts[-1]
            if ($processId -and $processId -ne "0") {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Info "Stopped process on port $Port (PID: $processId)"
            }
        }
    }
    catch {
        # Ignore errors
    }
}

Stop-PortProcess -Port $BACKEND_PORT
Stop-PortProcess -Port $FRONTEND_PORT
Start-Sleep -Seconds 1
Write-Success "Ports $BACKEND_PORT and $FRONTEND_PORT are now free"

# =====================================================
# PHASE 4: START BACKEND SERVER
# =====================================================
Write-Step "4" "Starting Backend Server (PHP)"

# Use the correct command: php -S localhost:8000 -t public public/router.php
$backendProcess = Start-Process -FilePath "php" `
    -ArgumentList "-S", "localhost:$BACKEND_PORT", "-t", "public", "public/router.php" `
    -WorkingDirectory $backendPath `
    -WindowStyle Minimized `
    -PassThru

Write-Info "Backend starting with PID: $($backendProcess.Id)"
Start-Sleep -Seconds 2

# Verify backend is running
$backendReady = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$BACKEND_PORT/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.success -eq $true) {
            $backendReady = $true
            break
        }
    }
    catch {
        Start-Sleep -Milliseconds 500
    }
}

if ($backendReady) {
    Write-Success "Backend running at http://localhost:$BACKEND_PORT"
    if ($response.services.database -eq "connected") {
        Write-Success "Database status: connected"
    }
    else {
        Write-Warning "Database status: $($response.services.database)"
    }
}
else {
    Write-Warning "Backend started but health check pending"
}

# =====================================================
# PHASE 5: START FRONTEND SERVER
# =====================================================
Write-Step "5" "Starting Frontend Server (Vite)"

# Check if node_modules exists
$nodeModulesPath = Join-Path $frontendPath "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Warning "node_modules not found. Installing dependencies..."
    $npmInstall = Start-Process -FilePath "npm" -ArgumentList "install" -WorkingDirectory $frontendPath -Wait -PassThru -NoNewWindow
    if ($npmInstall.ExitCode -ne 0) {
        Write-Error "npm install failed!"
        exit 1
    }
    Write-Success "Dependencies installed"
}

# Start Vite with fixed port
$frontendProcess = Start-Process -FilePath "npm" `
    -ArgumentList "run", "dev", "--", "--port", "$FRONTEND_PORT", "--strictPort" `
    -WorkingDirectory $frontendPath `
    -WindowStyle Minimized `
    -PassThru

Write-Info "Frontend starting with PID: $($frontendProcess.Id)"
Start-Sleep -Seconds 3

# Verify frontend is running
$frontendReady = $false
for ($i = 0; $i -lt 15; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$FRONTEND_PORT" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            break
        }
    }
    catch {
        Start-Sleep -Seconds 1
    }
}

if ($frontendReady) {
    Write-Success "Frontend running at http://localhost:$FRONTEND_PORT"
}
else {
    Write-Warning "Frontend starting... (may take a moment for first compile)"
}

# =====================================================
# PHASE 6: FINAL HEALTH CHECK
# =====================================================
Write-Step "6" "Running System Health Check"

Start-Sleep -Seconds 2

try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:$BACKEND_PORT/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    
    Write-Info "API Status: $($healthCheck.message)"
    Write-Info "Environment: $($healthCheck.environment)"
    Write-Info "Database: $($healthCheck.services.database)"
    Write-Info "Timestamp: $($healthCheck.timestamp)"
    
    if ($healthCheck.services.database -eq "connected") {
        Write-Success "All systems operational!"
    }
    else {
        Write-Warning "System running with warnings"
    }
}
catch {
    Write-Warning "Health check endpoint not responding (may still be starting)"
}

# =====================================================
# PHASE 7: OPEN BROWSER
# =====================================================
if (-not $SkipBrowser) {
    Write-Step "7" "Opening Browser"
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:$FRONTEND_PORT"
    Write-Success "Browser opened!"
}

# =====================================================
# FINAL STATUS
# =====================================================
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║                                                  ║" -ForegroundColor Green
Write-Host "  ║     ✓ SYSTEM STARTED SUCCESSFULLY!               ║" -ForegroundColor Green
Write-Host "  ║                                                  ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  URLs:" -ForegroundColor White
Write-Host "    Frontend:  " -NoNewline; Write-Host "http://localhost:$FRONTEND_PORT" -ForegroundColor Cyan
Write-Host "    Backend:   " -NoNewline; Write-Host "http://localhost:$BACKEND_PORT" -ForegroundColor Cyan
Write-Host "    API:       " -NoNewline; Write-Host "http://localhost:$BACKEND_PORT/api" -ForegroundColor Cyan
Write-Host "    Health:    " -NoNewline; Write-Host "http://localhost:$BACKEND_PORT/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Processes:" -ForegroundColor White
Write-Host "    Backend PID:   $($backendProcess.Id)" -ForegroundColor DarkGray
Write-Host "    Frontend PID:  $($frontendProcess.Id)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  To stop: Close this window or press Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Keep script running to maintain processes
try {
    Write-Host "  System is running... Press Ctrl+C to stop." -ForegroundColor DarkGray
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check if processes are still running
        if ($backendProcess.HasExited) {
            Write-Warning "Backend process stopped unexpectedly!"
        }
        if ($frontendProcess.HasExited) {
            Write-Warning "Frontend process stopped unexpectedly!"
        }
    }
}
finally {
    Write-Host ""
    Write-Host "  Shutting down..." -ForegroundColor Yellow
    
    if (-not $backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Info "Backend stopped"
    }
    if (-not $frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Info "Frontend stopped"
    }
    
    Write-Success "System shutdown complete. Goodbye!"
}
