#!/bin/bash
# ============================================================
# Script: build-only.sh
# Mô tả: Chỉ build Docker images (không push)
# Cách dùng: ./scripts/build-only.sh [username] [version]
# ============================================================

USERNAME=${1:-myapp}
VERSION=${2:-latest}

echo "🔨 Building all images..."

echo "[1/3] Building node-api..."
docker build -t ${USERNAME}/node-api-tasks:${VERSION} ./node-api

echo "[2/3] Building python-api..."
docker build -t ${USERNAME}/python-api-users:${VERSION} ./python-api

echo "[3/3] Building frontend..."
docker build -t ${USERNAME}/react-frontend:${VERSION} ./frontend

echo ""
echo "✅ Build hoàn tất! Danh sách images:"
docker images | grep ${USERNAME}
