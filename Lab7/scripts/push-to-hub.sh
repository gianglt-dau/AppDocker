#!/bin/bash
# ============================================================
# Script: push-to-hub.sh
# Mô tả: Build, tag và push Docker images lên Docker Hub
# Cách dùng: ./scripts/push-to-hub.sh <dockerhub_username> [version]
# Ví dụ:   ./scripts/push-to-hub.sh myusername v1
# ============================================================

set -e

# Kiểm tra tham số
if [ -z "$1" ]; then
    echo "❌ Thiếu Docker Hub username!"
    echo "Cách dùng: ./scripts/push-to-hub.sh <username> [version]"
    echo "Ví dụ:    ./scripts/push-to-hub.sh myusername v1"
    exit 1
fi

USERNAME=$1
VERSION=${2:-latest}

echo "============================================"
echo "🐳 Docker Hub Push Script"
echo "   Username: $USERNAME"
echo "   Version:  $VERSION"
echo "============================================"

# Đăng nhập Docker Hub
echo ""
echo "🔐 Đăng nhập Docker Hub..."
docker login

# Build images
echo ""
echo "🔨 [1/3] Building node-api..."
docker build -t ${USERNAME}/node-api-tasks:${VERSION} ./node-api

echo ""
echo "🔨 [2/3] Building python-api..."
docker build -t ${USERNAME}/python-api-users:${VERSION} ./python-api

echo ""
echo "🔨 [3/3] Building frontend..."
docker build -t ${USERNAME}/react-frontend:${VERSION} ./frontend

# Push images
echo ""
echo "📤 [1/3] Pushing node-api-tasks..."
docker push ${USERNAME}/node-api-tasks:${VERSION}

echo ""
echo "📤 [2/3] Pushing python-api-users..."
docker push ${USERNAME}/python-api-users:${VERSION}

echo ""
echo "📤 [3/3] Pushing react-frontend..."
docker push ${USERNAME}/react-frontend:${VERSION}

echo ""
echo "============================================"
echo "✅ Đã push thành công tất cả images!"
echo ""
echo "Images đã push:"
echo "  - ${USERNAME}/node-api-tasks:${VERSION}"
echo "  - ${USERNAME}/python-api-users:${VERSION}"
echo "  - ${USERNAME}/react-frontend:${VERSION}"
echo ""
echo "Kiểm tra tại: https://hub.docker.com/u/${USERNAME}"
echo "============================================"
