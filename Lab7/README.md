# Lab 7: Microservices hoàn chỉnh - 2 Backend khác vai trò + Docker Hub

## Mục tiêu
- Hiểu kiến trúc Microservices: mỗi backend đảm nhận **vai trò riêng biệt**
- NodeJS API → quản lý **Tasks** (CRUD)
- Python API → quản lý **Users** + cung cấp **Dashboard thống kê**
- Frontend React gọi cả 2 API cho các tính năng khác nhau
- Sử dụng scripts tự động để push images lên Docker Hub

## So sánh với các Lab trước

| Lab trước | Lab 7 |
|-----------|-------|
| Cả 2 backend cùng trả `/tasks` (giống nhau) | Mỗi backend có endpoints **riêng biệt** |
| Chỉ GET data | Full CRUD (Create, Read, Update, Delete) |
| Không có dashboard | Python cung cấp thống kê tổng hợp |
| Không có script deploy | Có scripts build & push Docker Hub |

## Kiến trúc

```
┌─────────────────────────────────────────────┐
│              Frontend (React)                │
│         Nginx Reverse Proxy (:80)            │
├──────────────────┬──────────────────────────┤
│                  │                          │
│   /api-node/*    │    /api-python/*          │
│        │         │          │                │
│        ▼         │          ▼                │
│  ┌──────────┐    │   ┌──────────────┐       │
│  │ NodeJS   │    │   │ Python       │       │
│  │ (Tasks)  │    │   │ (Users +     │       │
│  │ :3000    │    │   │  Dashboard)  │       │
│  └────┬─────┘    │   │ :8000        │       │
│       │          │   └──────┬───────┘       │
│       └──────────┴──────────┘               │
│                  │                          │
│            ┌─────▼─────┐                    │
│            │  MySQL 8  │                    │
│            │  (appdb)  │                    │
│            └───────────┘                    │
└─────────────────────────────────────────────┘
```

## API Endpoints

### NodeJS API (Tasks) - port 3000
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api-node/tasks` | Lấy tất cả tasks |
| GET | `/api-node/tasks/:id` | Lấy 1 task |
| POST | `/api-node/tasks` | Tạo task mới |
| PUT | `/api-node/tasks/:id` | Cập nhật task |
| DELETE | `/api-node/tasks/:id` | Xóa task |

### Python API (Users + Dashboard) - port 8000
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api-python/users` | Lấy tất cả users |
| GET | `/api-python/users/:id` | Lấy 1 user |
| POST | `/api-python/users` | Tạo user mới |
| PUT | `/api-python/users/:id` | Cập nhật user |
| DELETE | `/api-python/users/:id` | Xóa user |
| GET | `/api-python/dashboard` | Thống kê tổng hợp |

## Cấu trúc thư mục

```
Lab7/
├── docker-compose.yml          # Orchestrate toàn bộ services
├── init.sql                    # Tạo bảng + dữ liệu mẫu
├── node-api/                   # === NodeJS: Quản lý TASKS ===
│   ├── app.js                  #   Express + mysql2 (CRUD)
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── python-api/                 # === Python: Quản lý USERS + DASHBOARD ===
│   ├── main.py                 #   FastAPI + SQLAlchemy (CRUD + Stats)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/                   # === React: Giao diện ===
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx             #   Tabs: Dashboard / Tasks / Users
│   │   └── components/
│   │       ├── Dashboard.jsx   #   Thống kê (gọi Python API)
│   │       ├── TaskList.jsx    #   CRUD Tasks (gọi NodeJS API)
│   │       └── UserList.jsx    #   CRUD Users (gọi Python API)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── Dockerfile
│   └── .dockerignore
├── scripts/                    # === Scripts tự động ===
│   ├── push-to-hub.sh          #   Build + Push (Linux/WSL)
│   ├── push-to-hub.ps1         #   Build + Push (Windows PowerShell)
│   ├── build-only.sh           #   Chỉ Build (Linux/WSL)
│   └── build-only.ps1          #   Chỉ Build (Windows PowerShell)
└── README.md
```

## Hướng dẫn chạy

### Cách 1: Docker Compose (khuyên dùng)

```bash
# Khởi chạy toàn bộ hệ thống
docker compose up --build -d

# Kiểm tra
# Frontend:    http://localhost
# phpMyAdmin:  http://localhost:8080

# Tắt hệ thống
docker compose down

# Tắt + xóa data
docker compose down -v
```

### Cách 2: Chạy thủ công (dev mode)

```bash
# Terminal 1: MySQL
docker compose up mysql phpmyadmin -d

# Terminal 2: NodeJS API
cd node-api && npm install && node app.js

# Terminal 3: Python API
cd python-api && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# Terminal 4: Frontend (dev mode với proxy)
cd frontend && npm install && npm run dev
```

## Push lên Docker Hub

### Windows (PowerShell)
```powershell
cd Lab7
.\scripts\push-to-hub.ps1 -Username yourusername -Version v1
```

### Linux / WSL (Bash)
```bash
cd Lab7
chmod +x scripts/push-to-hub.sh
./scripts/push-to-hub.sh yourusername v1
```

### Chỉ Build (không push)
```powershell
# Windows
.\scripts\build-only.ps1 -Username yourusername -Version v1

# Linux
./scripts/build-only.sh yourusername v1
```

## Database Schema

```sql
-- Bảng Users (Python API quản lý)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member'   -- admin, manager, member
);

-- Bảng Tasks (NodeJS API quản lý)
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',  -- pending, in_progress, done
    assigned_to INT,                        -- FK → users.id
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);
```
