# Lab 6: Chạy trên Docker & Đưa lên Docker Hub

## Mục tiêu
- Sử dụng Docker Compose để chạy toàn bộ hệ thống (MySQL, NodeJS, Python, React)
- Build, tag và push Docker images lên Docker Hub

## Cấu trúc
```
Lab6/
├── docker-compose.yml      # Orchestrate toàn bộ services
├── init.sql                # Khởi tạo DB
├── node-api/
│   ├── app.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── python-api/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
└── frontend/
    ├── src/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── nginx.conf
    ├── Dockerfile
    └── .dockerignore
```

## Hướng dẫn chạy

### 0. (Tùy chọn) Phát triển Python API local

**Tạo và kích hoạt môi trường ảo (nếu chưa có):**
```powershell
# Tại thư mục gốc Lab6
python -m venv .venv
.venv\Scripts\Activate.ps1
```

```bash
cd python-api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 1. Khởi chạy toàn bộ hệ thống
```bash
docker compose up --build -d
```

### 2. Kiểm tra
- Frontend: http://localhost (port 80)
- phpMyAdmin: http://localhost:8080 (user: root / pass: root)

### 3. Tắt hệ thống
```bash
docker compose down
```

## Đưa lên Docker Hub

### 1. Đăng nhập Docker Hub
```bash
docker login
```

### 2. Build & Tag images (thay `yourusername`)
```bash
docker build -t yourusername/node-api:v1 ./node-api
docker build -t yourusername/python-api:v1 ./python-api
docker build -t yourusername/react-frontend:v1 ./frontend
```

### 3. Push lên Docker Hub
```bash
docker push yourusername/node-api:v1
docker push yourusername/python-api:v1
docker push yourusername/react-frontend:v1
```
