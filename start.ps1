# H&B Event Solution — Start Dev Environment
# Run this from PowerShell: .\start.ps1

$PYTHON  = "C:\Users\Muhaddas\AppData\Local\Python\bin\python.exe"
$ROOT    = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BACKEND = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"

Write-Host ""
Write-Host "========================================" -ForegroundColor DarkYellow
Write-Host "   H&B Event Solution - Dev Launcher   " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor DarkYellow
Write-Host ""

# Kill any existing processes on 8000 / 3000
Write-Host "[1/3] Clearing ports 8000 and 3000..." -ForegroundColor Cyan
@(8000, 3000) | ForEach-Object {
    $port = $_
    $pids = netstat -ano 2>$null | Select-String ":$port\s" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Where-Object { $_ -match '^\d+$' } | Select-Object -Unique
    foreach ($p in $pids) {
        try { Stop-Process -Id ([int]$p) -Force -ErrorAction SilentlyContinue } catch {}
    }
}
Start-Sleep -Seconds 1

# Start backend
Write-Host "[2/3] Starting Backend  →  http://localhost:8000" -ForegroundColor Cyan
Write-Host "      API Docs          →  http://localhost:8000/api/docs" -ForegroundColor DarkGray
Start-Process -FilePath $PYTHON `
    -ArgumentList "-m uvicorn main:app --port 8000 --reload" `
    -WorkingDirectory $BACKEND `
    -WindowStyle Normal

Start-Sleep -Seconds 3

# Start frontend
Write-Host "[3/3] Starting Frontend →  http://localhost:3000" -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/k npm run dev" `
    -WorkingDirectory $FRONTEND `
    -WindowStyle Normal

Start-Sleep -Seconds 5

# Health check
Write-Host ""
Write-Host "Checking servers..." -ForegroundColor Cyan
try {
    $b = Invoke-RestMethod "http://localhost:8000/api/health" -TimeoutSec 5
    Write-Host "  Backend  : OK  ($($b.status))" -ForegroundColor Green
} catch {
    Write-Host "  Backend  : Still starting — check the terminal window" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor DarkYellow
Write-Host "  App ready at  http://localhost:3000   " -ForegroundColor Green
Write-Host "  Admin login:  admin@hbeventsolution.com" -ForegroundColor DarkGray
Write-Host "  Password:     HBAdmin@2024            " -ForegroundColor DarkGray
Write-Host "========================================" -ForegroundColor DarkYellow
Write-Host ""
