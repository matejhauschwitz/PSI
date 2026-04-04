# start-dev.ps1
# Spustí Docker, backend a frontend

Write-Host "=== Spoustim aplikaci ===" -ForegroundColor Green
Write-Host ""

# 1. Docker
Write-Host "1. Spoustim MySQL (Docker)..." -ForegroundColor Cyan
cd api
docker compose up -d
Write-Host "Zvoleny Docker spusten" -ForegroundColor Green
Write-Host ""

# 2. Backend
Write-Host "2. Spoustim Backend (.NET)..." -ForegroundColor Cyan
$backendPath = "$PWD\api"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; dotnet run"
Write-Host "Zvoleny Backend se spousti v novem okne" -ForegroundColor Green
Write-Host ""

# 3. Frontend
Write-Host "3. Spoustim Frontend (React)..." -ForegroundColor Cyan
$frontendPath = "$PWD\..\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"
Write-Host "Zvoleny Frontend se spousti v novem okne" -ForegroundColor Green
Write-Host ""

Write-Host "=== Aplikace se spousti ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:5118" -ForegroundColor Yellow
Write-Host "MySQL:    localhost:5006" -ForegroundColor Yellow
Write-Host ""
Write-Host "Neklikej na toto okno - jde jen o koordinaci" -ForegroundColor Cyan
