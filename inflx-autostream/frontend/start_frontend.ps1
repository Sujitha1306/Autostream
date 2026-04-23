# Inflx Frontend Starter Script
# Ensures dependencies are installed and Vite is running

$ErrorActionPreference = "Continue"

Write-Host "`nPreparing Inflx Frontend..." -ForegroundColor Cyan

# 1. Check for node_modules
if (-not (Test-Path ".\node_modules")) {
    Write-Host "node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "node_modules found." -ForegroundColor Green
}

# 2. Start Vite in Background
Write-Host "Starting Vite development server..." -ForegroundColor Cyan
$frontProcess = Start-Process npm -ArgumentList "run dev" -PassThru -NoNewWindow

# 3. Health Check Retry Loop
Write-Host "Waiting for frontend to become ready..." -ForegroundColor Cyan
$maxRetries = 20
$retryCount = 0
$isReady = $false

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($null -ne $response -and $response.StatusCode -eq 200) {
            $isReady = $true
            break
        }
    } catch { }
    
    $retryCount++
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 1
}

if ($isReady) {
    Write-Host "`n`nFrontend is LIVE!" -ForegroundColor Green
    Write-Host "Local URL: http://localhost:5173" -ForegroundColor Gray
    Write-Host "Press Ctrl+C to stop the server.`n" -ForegroundColor White
    
    Wait-Process -Id $frontProcess.Id
} else {
    Write-Host "`n`nERROR: Frontend failed to start or timed out." -ForegroundColor Red
    if ($null -ne $frontProcess) { Stop-Process -Id $frontProcess.Id -Force -ErrorAction SilentlyContinue }
    exit 1
}
