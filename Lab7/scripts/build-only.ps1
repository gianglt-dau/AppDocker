# ============================================================
# Script: build-only.ps1
# Mô tả: Chỉ build Docker images (không push)
# Cách dùng: .\scripts\build-only.ps1 [-Username myapp] [-Version latest]
# ============================================================

param(
    [string]$Username = "myapp",
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "  Building all images..." -ForegroundColor Yellow

Write-Host "[1/3] Building node-api..."
docker build -t "${Username}/node-api-tasks:${Version}" ./node-api

Write-Host "[2/3] Building python-api..."
docker build -t "${Username}/python-api-users:${Version}" ./python-api

Write-Host "[3/3] Building frontend..."
docker build -t "${Username}/react-frontend:${Version}" ./frontend

Write-Host ""
Write-Host "  Build hoan tat! Danh sach images:" -ForegroundColor Green
docker images | Select-String $Username
