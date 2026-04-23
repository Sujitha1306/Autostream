# Inflx Backend Starter Script
# Ensures venv is active, dependencies are installed, and server is healthy

$ErrorActionPreference = "Continue"

Write-Host "`nPreparing Inflx Backend..." -ForegroundColor Cyan

# 1. Check for Virtual Environment
if (-not (Test-Path ".\venv\Scripts\Activate.ps1")) {
    Write-Host "ERROR: Virtual environment not found! Please run 'python -m venv venv' first." -ForegroundColor Red
    exit 1
}

Write-Host "Virtual environment found. Activating..." -ForegroundColor Green
. .\venv\Scripts\Activate.ps1

# 2. Check Dependencies
Write-Host "Verifying dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt --quiet
Write-Host "Dependencies verified." -ForegroundColor Green

# 3. Start Server in Background
Write-Host "Starting FastAPI server..." -ForegroundColor Cyan
$serverProcess = Start-Process python -ArgumentList "main.py" -PassThru -NoNewWindow

# 4. Health Check Retry Loop
Write-Host "Waiting for API to become healthy..." -ForegroundColor Cyan
$maxRetries = 20
$retryCount = 0
$isHealthy = $false

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($null -ne $response -and $response.StatusCode -eq 200) {
            $isHealthy = $true
            break
        }
    } catch { }
    
    $retryCount++
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 1
}

if (-not $isHealthy) {
    Write-Host "`n`nERROR: Backend failed to start or health check timed out." -ForegroundColor Red
    if ($null -ne $serverProcess) { Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue }
    exit 1
}

Write-Host "`n`nBackend is LIVE and Healthy!" -ForegroundColor Green
Write-Host "Health Endpoint: http://127.0.0.1:8000/health" -ForegroundColor Gray
Write-Host "Press Ctrl+C to stop the server.`n" -ForegroundColor White

# Wait for the process to exit so the terminal stays active
Wait-Process -Id $serverProcess.Id
