# ============================================================
# Script: push-to-hub.ps1
# Mô tả: Build, tag và push Docker images lên Docker Hub
# Cách dùng: .\scripts\push-to-hub.ps1 -Username <dockerhub_username> [-Version v1]
# Ví dụ:    .\scripts\push-to-hub.ps1 -Username myusername -Version v1
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,

    [Parameter(Mandatory=$false)]
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Docker Hub Push Script" -ForegroundColor Cyan
Write-Host "  Username: $Username" -ForegroundColor Cyan
Write-Host "  Version:  $Version" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Dang nhap Docker Hub
Write-Host ""
Write-Host "  Dang nhap Docker Hub..." -ForegroundColor Yellow
docker login
if ($LASTEXITCODE -ne 0) { Write-Host "Dang nhap that bai!" -ForegroundColor Red; exit 1 }

# Build images
Write-Host ""
Write-Host "  [1/3] Building node-api..." -ForegroundColor Yellow
docker build -t "${Username}/node-api-tasks:${Version}" ./node-api
if ($LASTEXITCODE -ne 0) { Write-Host "Build node-api that bai!" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "  [2/3] Building python-api..." -ForegroundColor Yellow
docker build -t "${Username}/python-api-users:${Version}" ./python-api
if ($LASTEXITCODE -ne 0) { Write-Host "Build python-api that bai!" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "  [3/3] Building frontend..." -ForegroundColor Yellow
docker build -t "${Username}/react-frontend:${Version}" ./frontend
if ($LASTEXITCODE -ne 0) { Write-Host "Build frontend that bai!" -ForegroundColor Red; exit 1 }

# Push images
Write-Host ""
Write-Host "  [1/3] Pushing node-api-tasks..." -ForegroundColor Green
docker push "${Username}/node-api-tasks:${Version}"
if ($LASTEXITCODE -ne 0) { Write-Host "Push node-api that bai!" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "  [2/3] Pushing python-api-users..." -ForegroundColor Green
docker push "${Username}/python-api-users:${Version}"
if ($LASTEXITCODE -ne 0) { Write-Host "Push python-api that bai!" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "  [3/3] Pushing react-frontend..." -ForegroundColor Green
docker push "${Username}/react-frontend:${Version}"
if ($LASTEXITCODE -ne 0) { Write-Host "Push frontend that bai!" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Da push thanh cong tat ca images!" -ForegroundColor Green
Write-Host ""
Write-Host "  Images da push:"
Write-Host "    - ${Username}/node-api-tasks:${Version}"
Write-Host "    - ${Username}/python-api-users:${Version}"
Write-Host "    - ${Username}/react-frontend:${Version}"
Write-Host ""
Write-Host "  Kiem tra tai: https://hub.docker.com/u/${Username}"
Write-Host "============================================" -ForegroundColor Green
