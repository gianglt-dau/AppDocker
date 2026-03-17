# Bài giảng: Đóng gói Hệ thống Ứng dụng Microservices với Docker
## Dựa trên Lab 7 - Task Manager Application

---

# Slide 1: Trang bìa

## ĐÓNG GÓI HỆ THỐNG ỨNG DỤNG VỚI DOCKER
### Kiến trúc Microservices hoàn chỉnh

**Nội dung:** Xây dựng, đóng gói và triển khai hệ thống Task Manager  
**Công nghệ:** Docker, Docker Compose, React, NodeJS, Python, MySQL, Nginx  
**Tham khảo:** Lab 7 - AppDocker

---

# Slide 2: Mục tiêu bài giảng

## Sau bài học, sinh viên có thể:

1. **Hiểu** kiến trúc Microservices: mỗi service đảm nhận vai trò riêng biệt
2. **Viết** Dockerfile cho các ứng dụng NodeJS, Python, React
3. **Cấu hình** Nginx làm Reverse Proxy để định tuyến request
4. **Sử dụng** Docker Compose để khởi chạy toàn bộ hệ thống
5. **Thiết kế** Database Schema với quan hệ giữa các bảng
6. **Tự động hóa** build và push Docker images lên Docker Hub

---

# Slide 3: Nội dung chính

## Chương trình bài giảng

| Phần | Nội dung | Slides |
|------|----------|--------|
| **I** | Tổng quan kiến trúc Microservices | 4-7 |
| **II** | Database Schema & Seeding | 8-10 |
| **III** | Backend APIs (NodeJS + Python) | 11-15 |
| **IV** | Frontend React + Nginx Reverse Proxy | 16-19 |
| **V** | Docker Containerization (Dockerfile) | 20-23 |
| **VI** | Docker Compose Orchestration | 24-26 |
| **VII** | Docker Hub Deployment & Scripts | 27-29 |
| **VIII** | Tổng kết | 30 |

---

# PHẦN I: TỔNG QUAN KIẾN TRÚC

---

# Slide 4: Bài toán - Task Manager

## Hệ thống quản lý công việc (Task Manager)

**Yêu cầu chức năng:**
- Quản lý **Users** (CRUD): thêm, sửa, xóa, xem danh sách người dùng
- Quản lý **Tasks** (CRUD): thêm, sửa, xóa, xem danh sách công việc
- **Dashboard** thống kê: tổng users, tổng tasks, phân loại trạng thái, top users
- Gán tasks cho users cụ thể
- Giao diện web thân thiện, trực quan

**Yêu cầu phi chức năng:**
- Dễ triển khai (deploy) trên mọi môi trường
- Các thành phần độc lập, dễ bảo trì
- Đóng gói hoàn chỉnh bằng Docker

---

# Slide 5: Kiến trúc Microservices

## Tổng quan kiến trúc hệ thống

```
┌─────────────────────────────────────────────┐
│              Frontend (React)                │
│         Nginx Reverse Proxy (:80)            │
├──────────────────┬──────────────────────────┤
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

**5 services** hoạt động phối hợp trong Docker containers

---

# Slide 6: Phân chia trách nhiệm các Service

## Mỗi service có vai trò riêng biệt

| Service | Công nghệ | Vai trò | Port |
|---------|-----------|---------|------|
| **Frontend** | React + Nginx | Giao diện người dùng + Reverse Proxy | 80 |
| **Node API** | Express.js | Quản lý Tasks (CRUD) | 3000 |
| **Python API** | FastAPI | Quản lý Users + Dashboard thống kê | 8000 |
| **MySQL** | MySQL 8 | Lưu trữ dữ liệu | 3306 |
| **phpMyAdmin** | PHP | Quản trị database (dev tool) | 8080 |

### Nguyên tắc thiết kế:
- **Separation of Concerns**: Mỗi backend xử lý 1 domain riêng
- **Single Responsibility**: NodeJS → Tasks, Python → Users + Dashboard
- **Loose Coupling**: Các service giao tiếp qua HTTP API

---

# Slide 7: So sánh Monolithic vs Microservices

## Tại sao chọn Microservices?

| Tiêu chí | Monolithic | Microservices (Lab 7) |
|----------|------------|----------------------|
| Cấu trúc | 1 codebase duy nhất | Nhiều service độc lập |
| Ngôn ngữ | Chung 1 ngôn ngữ | NodeJS + Python (đa ngôn ngữ) |
| Triển khai | Deploy toàn bộ | Deploy từng service |
| Mở rộng | Scale toàn bộ app | Scale từng service |
| Lỗi | 1 lỗi → sập toàn bộ | 1 service lỗi → các service khác vẫn chạy |
| Phát triển | 1 team | Nhiều team song song |

### Ưu điểm trong Lab 7:
- NodeJS team phát triển Tasks API **độc lập** với Python team
- Có thể scale Python API riêng nếu Dashboard có nhiều truy cập
- Dễ thay thế 1 service mà không ảnh hưởng service khác

---

# PHẦN II: DATABASE

---

# Slide 8: Database Schema

## Thiết kế cơ sở dữ liệu

### Bảng `users` (Python API quản lý)
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member'
);
```

### Bảng `tasks` (NodeJS API quản lý)
```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to INT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);
```

### Quan hệ:
- `tasks.assigned_to` → **FOREIGN KEY** tham chiếu → `users.id`
- `ON DELETE SET NULL`: Xóa user → task vẫn tồn tại (assigned_to = NULL)

---

# Slide 9: Database Seeding - Dữ liệu mẫu

## Khởi tạo dữ liệu ban đầu (file `init.sql`)

### Users mẫu:
```sql
INSERT INTO users (name, email, role) VALUES
('Nguyễn Văn A', 'nguyenvana@email.com', 'admin'),
('Trần Thị B', 'tranthib@email.com', 'manager'),
('Lê Văn C', 'levanc@email.com', 'member'),
('Phạm Thị D', 'phamthid@email.com', 'member'),
('Hoàng Văn E', 'hoangvane@email.com', 'member');
```

### Tasks mẫu:
```sql
INSERT INTO tasks (title, status, assigned_to) VALUES
('Thiết kế giao diện Dashboard', 'done', 1),
('Viết API quản lý Users', 'done', 2),
('Tích hợp Database MySQL', 'in_progress', 1),
('Viết Dockerfile cho Backend', 'in_progress', 3),
('Deploy lên Docker Hub', 'pending', 2),
('Viết tài liệu hướng dẫn', 'pending', 4),
('Test API endpoints', 'in_progress', 5),
('Cấu hình Nginx reverse proxy', 'done', 3);
```

**3 Role:** admin, manager, member | **3 Status:** pending, in_progress, done

---

# Slide 10: Cơ chế tự động khởi tạo Database

## Tự động chạy `init.sql` khi khởi động MySQL container

**Trong `docker-compose.yml`:**
```yaml
mysql:
  image: mysql:8
  environment:
    MYSQL_ROOT_PASSWORD: root
    MYSQL_DATABASE: appdb
  volumes:
    - mysql_data:/var/lib/mysql
    - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # ← Tự động chạy!
  healthcheck:
    test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
    interval: 5s
    timeout: 5s
    retries: 10
```

### Giải thích:
1. **`MYSQL_DATABASE: appdb`** → Tự động tạo database `appdb`
2. **Mount `init.sql`** vào `/docker-entrypoint-initdb.d/` → MySQL tự chạy khi khởi tạo lần đầu
3. **`mysql_data` volume** → Dữ liệu được lưu trữ bền vững, không mất khi restart container
4. **Healthcheck** → Đảm bảo MySQL sẵn sàng trước khi các service khác kết nối

---

# PHẦN III: BACKEND APIs

---

# Slide 11: NodeJS Tasks API - Tổng quan

## Express.js API quản lý Tasks (CRUD)

### Endpoints:
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| **GET** | `/api-node/tasks` | Lấy tất cả tasks |
| **GET** | `/api-node/tasks/:id` | Lấy 1 task theo ID |
| **POST** | `/api-node/tasks` | Tạo task mới |
| **PUT** | `/api-node/tasks/:id` | Cập nhật task |
| **DELETE** | `/api-node/tasks/:id` | Xóa task |

### Công nghệ:
- **Express.js** - Web framework cho Node.js
- **mysql2/promise** - Driver kết nối MySQL (async/await)
- **cors** - Middleware xử lý Cross-Origin requests

### Prefix `/api-node/` → Giúp Nginx phân biệt request gửi đến backend nào

---

# Slide 12: NodeJS Tasks API - Code chi tiết

## Kết nối Database với Retry pattern

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());

// Kết nối MySQL với retry (chờ DB sẵn sàng trong Docker)
let db;
async function connectDB() {
    const maxRetries = 10;
    for (let i = 0; i < maxRetries; i++) {
        try {
            db = await mysql.createConnection({
                host: process.env.DB_HOST || "127.0.0.1",
                user: "root", password: "root", database: "appdb"
            });
            console.log("✅ Kết nối MySQL thành công!");
            return;
        } catch (err) {
            console.log(`⏳ Chờ MySQL... (${i + 1}/${maxRetries})`);
            await new Promise(r => setTimeout(r, 3000));
        }
    }
    process.exit(1);
}
```

### Điểm quan trọng:
- **`process.env.DB_HOST`**: Đọc host từ biến môi trường (Docker Compose inject)
- **Retry pattern**: Thử kết nối 10 lần, mỗi lần cách 3 giây → phù hợp khi MySQL chưa sẵn sàng

---

# Slide 13: NodeJS Tasks API - CRUD Operations

## Ví dụ các thao tác CRUD

### GET - Lấy tất cả tasks:
```javascript
app.get('/api-node/tasks', async (req, res) => {
    const [rows] = await db.query("SELECT * FROM tasks ORDER BY id DESC");
    res.json(rows);
});
```

### POST - Tạo task mới:
```javascript
app.post('/api-node/tasks', async (req, res) => {
    const { title, assigned_to } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    const [result] = await db.query(
        "INSERT INTO tasks (title, assigned_to, status) VALUES (?, ?, 'pending')",
        [title, assigned_to || null]
    );
    res.status(201).json({ id: result.insertId, title, status: 'pending' });
});
```

### PUT - Cập nhật task:
```javascript
app.put('/api-node/tasks/:id', async (req, res) => {
    const { title, status, assigned_to } = req.body;
    await db.query(
        "UPDATE tasks SET title=COALESCE(?,title), status=COALESCE(?,status) WHERE id=?",
        [title, status, req.params.id]
    );
    // ... trả về task đã cập nhật
});
```

> **Lưu ý:** Sử dụng **Parameterized Queries** (`?`) để tránh SQL Injection

---

# Slide 14: Python Users & Dashboard API - Tổng quan

## FastAPI + SQLAlchemy quản lý Users và Dashboard

### Endpoints:
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| **GET** | `/api-python/users` | Lấy tất cả users |
| **GET** | `/api-python/users/:id` | Lấy 1 user |
| **POST** | `/api-python/users` | Tạo user mới |
| **PUT** | `/api-python/users/:id` | Cập nhật user |
| **DELETE** | `/api-python/users/:id` | Xóa user |
| **GET** | `/api-python/dashboard` | Thống kê tổng hợp |

### Công nghệ:
- **FastAPI** - Modern web framework cho Python (auto-generate docs)
- **SQLAlchemy** - ORM (Object-Relational Mapping) cho database
- **Pydantic** - Data validation & serialization
- **PyMySQL** - MySQL driver cho Python
- **Uvicorn** - ASGI web server

---

# Slide 15: Python API - Dashboard thống kê

## Endpoint cung cấp tổng hợp dữ liệu từ cả 2 bảng

```python
@app.get("/api-python/dashboard")
def get_dashboard():
    db = SessionLocal()
    total_users = db.query(func.count(User.id)).scalar()
    total_tasks = db.query(func.count(Task.id)).scalar()

    # Đếm tasks theo trạng thái
    pending = db.query(func.count(Task.id)).filter(Task.status == "pending").scalar()
    in_progress = db.query(func.count(Task.id)).filter(Task.status == "in_progress").scalar()
    done = db.query(func.count(Task.id)).filter(Task.status == "done").scalar()

    # Top users (nhiều task nhất)
    top_users = db.execute(text("""
        SELECT u.name, COUNT(t.id) as task_count
        FROM users u LEFT JOIN tasks t ON u.id = t.assigned_to
        GROUP BY u.id, u.name ORDER BY task_count DESC LIMIT 5
    """)).fetchall()
    db.close()
    return {
        "total_users": total_users, "total_tasks": total_tasks,
        "tasks_by_status": {"pending": pending, "in_progress": in_progress, "done": done},
        "top_users": [{"name": r[0], "task_count": r[1]} for r in top_users]
    }
```

### Điểm nổi bật:
- Python API truy cập **cả bảng users và tasks** → cung cấp thống kê cross-service
- Sử dụng **SQLAlchemy ORM** + **Raw SQL** cho truy vấn phức tạp

---

# PHẦN IV: FRONTEND & NGINX

---

# Slide 16: React Frontend - Cấu trúc

## Giao diện với 3 tab chính

```
frontend/src/
├── main.jsx            # Entry point
├── App.jsx             # Tabs: Dashboard / Tasks / Users
└── components/
    ├── Dashboard.jsx   # Gọi Python API → thống kê
    ├── TaskList.jsx    # Gọi NodeJS API → CRUD Tasks
    └── UserList.jsx    # Gọi Python API → CRUD Users
```

### App.jsx - Điều hướng bằng Tabs:
```jsx
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  return (
    <div>
      <h1>📋 Task Manager - Microservices</h1>
      <div>
        <button onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button onClick={() => setActiveTab('tasks')}>📝 Tasks (NodeJS)</button>
        <button onClick={() => setActiveTab('users')}>👥 Users (Python)</button>
      </div>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'tasks' && <TaskList />}
      {activeTab === 'users' && <UserList />}
    </div>
  );
}
```

### Quan trọng: Frontend gọi API qua **relative path** (`/api-node/...`, `/api-python/...`)
→ Nginx đảm nhiệm việc proxy đến đúng backend

---

# Slide 17: React Frontend - Gọi API

## Cách các component gọi đến backend services

### TaskList.jsx → Gọi **NodeJS API**:
```jsx
// Fetch tasks từ NodeJS backend
const fetchTasks = () => fetch('/api-node/tasks').then(r => r.json()).then(setTasks);

// Tạo task mới
const addTask = async () => {
    await fetch('/api-node/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, assigned_to: newAssignee || null })
    });
    fetchTasks(); // Reload danh sách
};
```

### UserList.jsx → Gọi **Python API**:
```jsx
// Fetch users từ Python backend
const fetchUsers = () => fetch('/api-python/users').then(r => r.json()).then(setUsers);

// Tạo user mới
const addUser = async () => {
    await fetch('/api-python/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail, role: newRole })
    });
    fetchUsers();
};
```

### TaskList cũng gọi `/api-python/users` để lấy danh sách users cho dropdown "Gán cho"!
→ Minh họa sự **phối hợp giữa các microservices**

---

# Slide 18: Nginx Reverse Proxy

## Vai trò then chốt: Định tuyến request đến đúng backend

### File `nginx.conf`:
```nginx
server {
    listen 80;

    # Frontend React - Serve static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy tới NodeJS API (Tasks)
    location /api-node/ {
        proxy_pass http://node-api:3000/api-node/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Proxy tới Python API (Users + Dashboard)
    location /api-python/ {
        proxy_pass http://python-api:8000/api-python/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Luồng request:
```
Browser → localhost:80 → Nginx
    → /              → Serve React (static HTML/JS/CSS)
    → /api-node/*    → Proxy → node-api:3000
    → /api-python/*  → Proxy → python-api:8000
```

---

# Slide 19: Nginx - Phân tích chi tiết

## Tại sao cần Reverse Proxy?

### Vấn đề nếu không có Nginx:
- Browser phải biết port của từng backend (3000, 8000)
- Gặp lỗi **CORS** (Cross-Origin Resource Sharing)
- Phải expose nhiều port → không an toàn
- URL phức tạp: `http://localhost:3000/api-node/tasks`

### Giải pháp với Nginx Reverse Proxy:
- Chỉ expose **1 port** (80) cho toàn bộ ứng dụng
- Nginx tự động định tuyến dựa trên **URL prefix**
- Không có CORS issues (cùng origin)
- URL gọn: `http://localhost/api-node/tasks`

### Giải thích cấu hình:
| Directive | Ý nghĩa |
|-----------|---------|
| `listen 80` | Lắng nghe trên port 80 |
| `try_files $uri $uri/ /index.html` | SPA routing: mọi route → index.html |
| `proxy_pass http://node-api:3000` | Chuyển tiếp đến service NodeJS (dùng tên service Docker) |
| `proxy_set_header X-Real-IP` | Giữ nguyên IP thật của client |

---

# PHẦN V: DOCKER CONTAINERIZATION

---

# Slide 20: Tổng quan Docker

## Các khái niệm cốt lõi

### Docker giải quyết vấn đề gì?
> *"It works on my machine!"* → Docker đảm bảo chạy **nhất quán** trên mọi môi trường

### 3 khái niệm chính:

| Khái niệm | Ý nghĩa | Ví von |
|------------|---------|--------|
| **Dockerfile** | File hướng dẫn tạo image | Công thức nấu ăn |
| **Image** | Template chỉ-đọc (read-only) | Khuôn bánh |
| **Container** | Instance đang chạy từ image | Chiếc bánh thực tế |

### Quy trình:
```
Dockerfile  →  docker build  →  Image  →  docker run  →  Container
(công thức)    (nấu)          (khuôn)     (đổ khuôn)     (sản phẩm)
```

### Trong Lab 7, ta đóng gói 3 ứng dụng tự viết:
1. NodeJS Tasks API → Container
2. Python Users API → Container
3. React Frontend → Container (multi-stage build)

Và sử dụng 2 image có sẵn: MySQL, phpMyAdmin

---

# Slide 21: Dockerfile - NodeJS API

## Đóng gói Express.js application

### File `node-api/Dockerfile`:
```dockerfile
FROM node:20           # Base image: Node.js 20
WORKDIR /app           # Thư mục làm việc trong container
COPY package*.json ./  # Copy file khai báo dependencies
RUN npm install        # Cài đặt thư viện
COPY . .               # Copy toàn bộ source code
EXPOSE 3000            # Khai báo port ứng dụng
CMD ["node", "app.js"] # Lệnh khởi chạy
```

### Giải thích từng lệnh:
| Lệnh | Mục đích |
|-------|---------|
| `FROM node:20` | Sử dụng image chính thức Node.js 20 làm nền tảng |
| `WORKDIR /app` | Đặt `/app` là thư mục làm việc cho các lệnh tiếp theo |
| `COPY package*.json ./` | Copy `package.json` trước (tối ưu Docker cache) |
| `RUN npm install` | Cài dependencies → tầng cache riêng |
| `COPY . .` | Copy source code (thay đổi thường xuyên) |
| `EXPOSE 3000` | Metadata: app lắng nghe port 3000 |
| `CMD ["node", "app.js"]` | Lệnh chạy khi container khởi động |

### Tối ưu Docker Cache:
Copy `package.json` → `npm install` → Copy source  
→ Nếu chỉ thay đổi source code, Docker **dùng lại cache** cho bước `npm install`!

---

# Slide 22: Dockerfile - Python API

## Đóng gói FastAPI application

### File `python-api/Dockerfile`:
```dockerfile
FROM python:3.11                                        # Base image: Python 3.11
WORKDIR /app                                            # Thư mục làm việc
COPY requirements.txt .                                 # Copy file dependencies
RUN pip install -r requirements.txt                     # Cài thư viện Python
COPY . .                                                # Copy source code
EXPOSE 8000                                             # Port ứng dụng
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]  # Khởi chạy
```

### File `requirements.txt`:
```
fastapi       # Web framework
uvicorn       # ASGI server
sqlalchemy    # ORM database
pymysql       # MySQL driver
```

### So sánh với NodeJS Dockerfile:
| Bước | NodeJS | Python |
|------|--------|--------|
| Base image | `node:20` | `python:3.11` |
| Dependency file | `package.json` | `requirements.txt` |
| Cài đặt | `npm install` | `pip install -r requirements.txt` |
| Khởi chạy | `node app.js` | `uvicorn main:app --host 0.0.0.0` |

→ **Cùng pattern** nhưng khác công cụ theo ngôn ngữ!

---

# Slide 23: Dockerfile - Frontend (Multi-stage Build)

## Kỹ thuật Multi-stage Build cho React

### File `frontend/Dockerfile`:
```dockerfile
# ===== Stage 1: BUILD =====
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build    # Build React → file tĩnh (HTML/JS/CSS)

# ===== Stage 2: SERVE =====
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html    # Copy output từ Stage 1
COPY nginx.conf /etc/nginx/conf.d/default.conf        # Cấu hình Nginx
EXPOSE 80
```

### Tại sao Multi-stage?

| | Single-stage | Multi-stage (Lab 7) |
|--|-------------|---------------------|
| Image chứa | Node.js + source + node_modules + build output | **Chỉ Nginx + build output** |
| Kích thước | ~1.2 GB | **~50 MB** |
| Bảo mật | Chứa source code gốc | **Chỉ chứa file tĩnh đã build** |

### Luồng xử lý:
```
Stage 1 (node:20):     npm install → npm run build → /app/dist/
                                                        │
Stage 2 (nginx:alpine): COPY --from=build /app/dist ←──┘
                         + nginx.conf
                         → Image chỉ ~50MB!
```

> **Multi-stage build** = Build trong 1 image, chạy trong image khác (nhẹ hơn)

---

# PHẦN VI: DOCKER COMPOSE ORCHESTRATION

---

# Slide 24: Docker Compose - Tổng quan

## Chỉ huy toàn bộ orchestra bằng 1 file

### Vấn đề nếu chạy thủ công:
```bash
# Phải chạy 5 lệnh riêng biệt!
docker run -d --name mysql ...
docker run -d --name phpmyadmin ... --link mysql
docker run -d --name node-api ... --link mysql
docker run -d --name python-api ... --link mysql
docker run -d --name frontend ... --link node-api --link python-api
```
→ Phức tạp, dễ sai, khó quản lý!

### Giải pháp với Docker Compose:
```bash
# Chỉ 1 lệnh duy nhất!
docker compose up --build -d
```

### Docker Compose tự động:
1. ✅ Build images cho các service tự viết
2. ✅ Pull images có sẵn (mysql, phpmyadmin)
3. ✅ Tạo virtual network cho các service giao tiếp
4. ✅ Khởi động theo thứ tự đúng (DB → APIs → Frontend)
5. ✅ Inject biến môi trường
6. ✅ Quản lý volumes cho dữ liệu bền vững

---

# Slide 25: docker-compose.yml - Chi tiết

## File cấu hình hoàn chỉnh

```yaml
version: '3.8'
services:
  # ====== DATABASE ======
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: appdb
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 5s
      retries: 10

  # ====== PHPMYADMIN ======
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    ports: ["8080:80"]
    environment: { PMA_HOST: mysql }
    depends_on:
      mysql: { condition: service_healthy }

  # ====== NODEJS API ======
  node-api:
    build: ./node-api
    environment: { DB_HOST: mysql }
    depends_on:
      mysql: { condition: service_healthy }

  # ====== PYTHON API ======
  python-api:
    build: ./python-api
    environment: { DATABASE_URL: "mysql+pymysql://root:root@mysql/appdb" }
    depends_on:
      mysql: { condition: service_healthy }

  # ====== FRONTEND ======
  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [node-api, python-api]

volumes:
  mysql_data:
```

---

# Slide 26: Docker Compose - Các tính năng quan trọng

## Deep dive vào cấu hình

### 1. Healthcheck - Đảm bảo sẵn sàng
```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 5s     # Kiểm tra mỗi 5 giây
  timeout: 5s      # Timeout mỗi lần kiểm tra
  retries: 10      # Thử tối đa 10 lần
```
→ Chỉ khi MySQL **thực sự sẵn sàng**, các API mới khởi động

### 2. depends_on with condition
```yaml
depends_on:
  mysql:
    condition: service_healthy    # Chờ healthcheck pass
```
→ Đảm bảo **thứ tự khởi động chính xác**: MySQL → APIs → Frontend

### 3. Service Discovery (Networking)
- Docker Compose tự tạo **network** chung
- Các service dùng **tên service** làm hostname:
  - `node-api` kết nối MySQL qua host `mysql`
  - Nginx proxy đến `http://node-api:3000`
  - Python dùng `mysql+pymysql://root:root@mysql/appdb`

### 4. Các lệnh quản lý:
| Lệnh | Mục đích |
|-------|---------|
| `docker compose up --build -d` | Build + khởi chạy |
| `docker compose down` | Dừng + xóa containers |
| `docker compose down -v` | Dừng + xóa cả data |
| `docker compose logs -f` | Xem logs realtime |
| `docker compose ps` | Xem trạng thái services |

---

# PHẦN VII: DOCKER HUB & AUTOMATION

---

# Slide 27: Docker Hub - Chia sẻ Docker Images

## Đưa ứng dụng lên Docker Hub Registry

### Docker Hub là gì?
- **Registry** công cộng lưu trữ Docker images
- Giống **GitHub** nhưng dành cho Docker images
- Cho phép chia sẻ, phân phối images đến mọi nơi

### Quy trình:
```
Source Code → Dockerfile → docker build → Image → docker push → Docker Hub
                                                                     │
Máy khác   ← docker run  ← Image       ← docker pull ←─────────────┘
```

### Naming convention:
```
<username>/<image-name>:<version>

Ví dụ:
  myusername/node-api-tasks:v1
  myusername/python-api-users:v1
  myusername/react-frontend:v1
```

### Lợi ích:
- 🚀 Deploy trên bất kỳ máy nào có Docker
- 🤝 Chia sẻ giữa các thành viên trong team
- 📋 Quản lý phiên bản (v1, v2, latest)
- 🔄 Tích hợp CI/CD pipeline

---

# Slide 28: Scripts tự động - Build & Push

## Tự động hóa với scripts

### Script Build Only (`scripts/build-only.ps1`):
```powershell
param(
    [string]$Username = "myapp",
    [string]$Version = "latest"
)

Write-Host "[1/3] Building node-api..."
docker build -t "${Username}/node-api-tasks:${Version}" ./node-api

Write-Host "[2/3] Building python-api..."
docker build -t "${Username}/python-api-users:${Version}" ./python-api

Write-Host "[3/3] Building frontend..."
docker build -t "${Username}/react-frontend:${Version}" ./frontend
```

### Script Push to Hub (`scripts/push-to-hub.ps1`):
```powershell
# Đăng nhập Docker Hub
docker login

# Build 3 images
docker build -t "${Username}/node-api-tasks:${Version}" ./node-api
docker build -t "${Username}/python-api-users:${Version}" ./python-api
docker build -t "${Username}/react-frontend:${Version}" ./frontend

# Push 3 images
docker push "${Username}/node-api-tasks:${Version}"
docker push "${Username}/python-api-users:${Version}"
docker push "${Username}/react-frontend:${Version}"
```

### Sử dụng:
```powershell
# Chỉ build
.\scripts\build-only.ps1 -Username myusername -Version v1

# Build + Push lên Docker Hub
.\scripts\push-to-hub.ps1 -Username myusername -Version v1
```

---

# Slide 29: Hướng dẫn thực hành

## Quy trình chạy Lab 7 từ đầu đến cuối

### Bước 1: Khởi chạy toàn bộ hệ thống
```bash
cd Lab7
docker compose up --build -d
```

### Bước 2: Kiểm tra hệ thống
- 🌐 Frontend: `http://localhost` (port 80)
- 🔧 phpMyAdmin: `http://localhost:8080` (user: root / pass: root)
- Kiểm tra logs: `docker compose logs -f`
- Kiểm tra services: `docker compose ps`

### Bước 3: Sử dụng ứng dụng
- Tab **Dashboard** → Xem thống kê (Python API)
- Tab **Tasks** → Thêm/sửa/xóa tasks (NodeJS API)
- Tab **Users** → Thêm/sửa/xóa users (Python API)

### Bước 4: Push lên Docker Hub (tùy chọn)
```powershell
.\scripts\push-to-hub.ps1 -Username <your_dockerhub_username> -Version v1
```

### Bước 5: Dọn dẹp
```bash
docker compose down        # Tắt hệ thống (giữ data)
docker compose down -v     # Tắt + xóa data
```

---

# Slide 30: Tổng kết

## Những gì đã học

### Kiến trúc & Thiết kế:
- ✅ Microservices: phân tách trách nhiệm rõ ràng (NodeJS → Tasks, Python → Users)
- ✅ Database Schema: quan hệ bảng users/tasks với Foreign Key
- ✅ Reverse Proxy: Nginx định tuyến request đến đúng service

### Docker & Containerization:
- ✅ **Dockerfile**: Đóng gói ứng dụng thành Docker image
- ✅ **Multi-stage Build**: Tối ưu kích thước image cho frontend
- ✅ **Docker Compose**: Quản lý multi-container application bằng 1 file
- ✅ **Healthcheck + depends_on**: Đảm bảo thứ tự khởi động chính xác
- ✅ **Docker Hub**: Chia sẻ và phân phối images

### Tóm tắt kiến trúc hoàn chỉnh:

```
[Browser] → [Nginx:80] ─┬→ [NodeJS:3000] ──→ [MySQL:3306]
                         ├→ [Python:8000] ──→ [MySQL:3306]
                         └→ [React static files]
                         
[phpMyAdmin:8080] ───────→ [MySQL:3306]
```

### Mở rộng tiếp theo:
- Thêm Redis cache, Message Queue
- CI/CD pipeline tự động
- Kubernetes orchestration
- Monitoring & Logging (Prometheus, Grafana)

---

# PHỤ LỤC

---

# Phụ lục A: Cấu trúc thư mục dự án Lab 7

```
Lab7/
├── docker-compose.yml          # Orchestrate toàn bộ services
├── init.sql                    # Tạo bảng + dữ liệu mẫu
├── README.md                   # Tài liệu hướng dẫn
│
├── node-api/                   # ═══ NodeJS: Quản lý TASKS ═══
│   ├── app.js                  #   Express + mysql2 (CRUD)
│   ├── package.json            #   Dependencies
│   └── Dockerfile              #   Đóng gói Node.js app
│
├── python-api/                 # ═══ Python: Quản lý USERS + DASHBOARD ═══
│   ├── main.py                 #   FastAPI + SQLAlchemy
│   ├── requirements.txt        #   Python dependencies
│   └── Dockerfile              #   Đóng gói Python app
│
├── frontend/                   # ═══ React: Giao diện ═══
│   ├── src/
│   │   ├── main.jsx            #   Entry point
│   │   ├── App.jsx             #   Tabs navigation
│   │   └── components/
│   │       ├── Dashboard.jsx   #   Thống kê (→ Python API)
│   │       ├── TaskList.jsx    #   CRUD Tasks (→ NodeJS API)
│   │       └── UserList.jsx    #   CRUD Users (→ Python API)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf              #   Reverse Proxy config
│   └── Dockerfile              #   Multi-stage build
│
└── scripts/                    # ═══ Scripts tự động ═══
    ├── build-only.ps1          #   Build (Windows)
    ├── build-only.sh           #   Build (Linux)
    ├── push-to-hub.ps1         #   Build + Push (Windows)
    └── push-to-hub.sh          #   Build + Push (Linux)
```

# Phụ lục B: Bảng tóm tắt các lệnh Docker quan trọng

| Lệnh | Mục đích |
|-------|---------|
| `docker build -t <name> .` | Build image từ Dockerfile |
| `docker run -d -p 80:80 <image>` | Chạy container |
| `docker images` | Liệt kê images |
| `docker ps` | Liệt kê containers đang chạy |
| `docker compose up --build -d` | Build + chạy tất cả services |
| `docker compose down` | Dừng tất cả services |
| `docker compose down -v` | Dừng + xóa volumes |
| `docker compose logs -f` | Xem logs realtime |
| `docker compose ps` | Xem trạng thái services |
| `docker login` | Đăng nhập Docker Hub |
| `docker push <image>` | Push image lên registry |
| `docker pull <image>` | Tải image từ registry |
