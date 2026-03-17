# Lab 7: Hệ thống Microservices hoàn chỉnh - Task Manager

> **Hướng dẫn chi tiết từ A → Z** — thiết lập môi trường, cài đặt phần mềm, tạo code, chạy & kiểm tra.

---

## Mục tiêu

- Xây dựng hệ thống **Microservices** hoàn chỉnh gồm 5 services (Frontend, 2 Backend, Database, phpMyAdmin)
- **NodeJS API** → quản lý Tasks (CRUD)
- **Python API** → quản lý Users + Dashboard thống kê
- **Frontend React** gọi cả 2 API, phục vụ qua **Nginx Reverse Proxy**
- Đóng gói toàn bộ bằng **Docker** và **Docker Compose**
- Push images lên **Docker Hub**

---

## Kiến trúc hệ thống

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

---

## Cấu trúc thư mục hoàn chỉnh

```
Lab7/
├── docker-compose.yml
├── init.sql
├── node-api/
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
├── python-api/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── Dockerfile
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── components/
│           ├── Dashboard.jsx
│           ├── TaskList.jsx
│           └── UserList.jsx
├── scripts/
│   ├── build-only.ps1
│   ├── build-only.sh
│   ├── push-to-hub.ps1
│   └── push-to-hub.sh
└── README.md
```

---

## API Endpoints

### NodeJS API (Tasks) — port 3000

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api-node/tasks` | Lấy tất cả tasks |
| GET | `/api-node/tasks/:id` | Lấy 1 task theo ID |
| POST | `/api-node/tasks` | Tạo task mới |
| PUT | `/api-node/tasks/:id` | Cập nhật task |
| DELETE | `/api-node/tasks/:id` | Xóa task |

### Python API (Users + Dashboard) — port 8000

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api-python/users` | Lấy tất cả users |
| GET | `/api-python/users/{id}` | Lấy 1 user |
| POST | `/api-python/users` | Tạo user mới |
| PUT | `/api-python/users/{id}` | Cập nhật user |
| DELETE | `/api-python/users/{id}` | Xóa user |
| GET | `/api-python/dashboard` | Thống kê tổng hợp |

---

# HƯỚNG DẪN THỰC HÀNH TỪ ĐẦU ĐẾN CUỐI

---

## Phần 0: Cài đặt phần mềm cần thiết

### 0.1. Cài Docker Desktop

1. Tải Docker Desktop tại: https://www.docker.com/products/docker-desktop/
2. Chạy file cài đặt, làm theo hướng dẫn
3. Sau khi cài xong, **khởi động lại máy**
4. Mở Docker Desktop, đợi đến khi biểu tượng Docker ở taskbar chuyển sang **xanh** (running)
5. Kiểm tra bằng terminal:

```powershell
docker --version
docker compose version
```

### 0.2. Cài Node.js (cho phát triển local)

1. Tải Node.js LTS tại: https://nodejs.org/
2. Chạy file cài đặt, chọn mặc định
3. Kiểm tra:

```powershell
node --version
npm --version
```

### 0.3. Cài Python (cho phát triển local)

1. Tải Python 3.11+ tại: https://www.python.org/downloads/
2. **Quan trọng:** Khi cài đặt, **tick chọn "Add Python to PATH"**
3. Kiểm tra:

```powershell
python --version
pip --version
```

### 0.4. Cài Visual Studio Code (tùy chọn)

- Tải tại: https://code.visualstudio.com/
- Extensions hữu ích: Docker, Python, ES7+ React snippets

---

## Phần 1: Tạo Database — `init.sql`

File này sẽ được MySQL tự động chạy khi container khởi tạo lần đầu.

Tạo file `Lab7/init.sql`:

```sql
-- ==================== BẢNG USERS ====================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member'
);

-- ==================== BẢNG TASKS ====================
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to INT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== DỮ LIỆU MẪU ====================

-- Users
INSERT INTO users (name, email, role) VALUES
('Nguyễn Văn A', 'nguyenvana@email.com', 'admin'),
('Trần Thị B', 'tranthib@email.com', 'manager'),
('Lê Văn C', 'levanc@email.com', 'member'),
('Phạm Thị D', 'phamthid@email.com', 'member'),
('Hoàng Văn E', 'hoangvane@email.com', 'member');

-- Tasks (gán cho users)
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

**Giải thích:**
- Bảng `users` có 3 role: `admin`, `manager`, `member`
- Bảng `tasks` có 3 trạng thái: `pending`, `in_progress`, `done`
- `assigned_to` là khóa ngoại liên kết tới `users.id`
- `ON DELETE SET NULL`: khi xóa user thì task không bị mất, chỉ bỏ liên kết

---

## Phần 2: NodeJS API — Quản lý Tasks (CRUD)

### 2.1. Tạo `Lab7/node-api/package.json`

```json
{
  "name": "node-api-tasks",
  "version": "1.0.0",
  "description": "Lab7 - NodeJS API quản lý Tasks (CRUD)",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mysql2": "^3.6.5"
  }
}
```

### 2.2. Tạo `Lab7/node-api/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();

app.use(cors());
app.use(express.json());

// Kết nối MySQL với retry (chờ DB sẵn sàng trong Docker)
let db;
async function connectDB() {
    const maxRetries = 10;
    for (let i = 0; i < maxRetries; i++) {
        try {
            db = await mysql.createConnection({
                host: process.env.DB_HOST || "127.0.0.1",
                user: "root",
                password: "root",
                database: "appdb"
            });
            console.log("✅ Kết nối MySQL thành công!");
            return;
        } catch (err) {
            console.log(`⏳ Chờ MySQL... (${i + 1}/${maxRetries})`);
            await new Promise(r => setTimeout(r, 3000));
        }
    }
    console.error("❌ Không thể kết nối MySQL!");
    process.exit(1);
}

// ===================== TASKS CRUD =====================

// GET - Lấy tất cả tasks
app.get('/api-node/tasks', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tasks ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET - Lấy 1 task theo ID
app.get('/api-node/tasks/:id', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Tạo task mới
app.post('/api-node/tasks', async (req, res) => {
    try {
        const { title, assigned_to } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });
        const [result] = await db.query(
            "INSERT INTO tasks (title, assigned_to, status) VALUES (?, ?, 'pending')",
            [title, assigned_to || null]
        );
        res.status(201).json({ id: result.insertId, title, assigned_to, status: 'pending' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - Cập nhật task
app.put('/api-node/tasks/:id', async (req, res) => {
    try {
        const { title, status, assigned_to } = req.body;
        await db.query(
            "UPDATE tasks SET title = COALESCE(?, title), status = COALESCE(?, status), assigned_to = COALESCE(?, assigned_to) WHERE id = ?",
            [title, status, assigned_to, req.params.id]
        );
        const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Xóa task
app.delete('/api-node/tasks/:id', async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Khởi động server
connectDB().then(() => {
    app.listen(3000, () => console.log("🚀 NodeJS Tasks API chạy ở port 3000"));
});
```

**Giải thích:**
- Sử dụng `mysql2/promise` để dùng async/await
- `connectDB()` thử kết nối 10 lần, mỗi lần cách 3s (vì trong Docker, MySQL có thể khởi động chậm hơn app)
- Tất cả endpoint bắt đầu bằng `/api-node/` để Nginx phân biệt với Python API
- Query dùng `?` placeholder → tránh SQL injection

### 2.3. Tạo `Lab7/node-api/Dockerfile`

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

### 2.4. Cài đặt và chạy thử NodeJS API (local)

```powershell
cd Lab7/node-api
npm install
```

> **Lưu ý:** Chưa chạy `node app.js` được vì cần MySQL. Ta sẽ chạy MySQL bằng Docker ở Phần 5.

---

## Phần 3: Python API — Quản lý Users + Dashboard

### 3.1. Thiết lập môi trường Python (Virtual Environment)

Tạo môi trường ảo để cách ly thư viện, tránh xung đột:

```powershell
# Di chuyển vào thư mục python-api
cd Lab7/python-api

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# --- Windows PowerShell ---
.\venv\Scripts\Activate.ps1

# --- Windows CMD ---
# venv\Scripts\activate.bat

# --- Linux / macOS ---
# source venv/bin/activate
```

Sau khi kích hoạt, đầu dòng terminal sẽ hiện `(venv)` — nghĩa là đang dùng môi trường ảo.

### 3.2. Tạo `Lab7/python-api/requirements.txt`

```
fastapi
uvicorn
sqlalchemy
pymysql
```

**Giải thích thư viện:**
| Thư viện | Công dụng |
|----------|-----------|
| `fastapi` | Framework web Python hiện đại, tự động tạo docs API |
| `uvicorn` | ASGI server để chạy FastAPI |
| `sqlalchemy` | ORM — tương tác database bằng Python object |
| `pymysql` | Driver kết nối MySQL từ Python |

### 3.3. Cài đặt thư viện Python

```powershell
# Đảm bảo đang trong (venv) và thư mục python-api
pip install -r requirements.txt
```

### 3.4. Tạo `Lab7/python-api/main.py`

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, func
from sqlalchemy.orm import declarative_base, sessionmaker
from pydantic import BaseModel
from typing import Optional
import os
import time

app = FastAPI(title="Python Users & Dashboard API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Kết nối MySQL với retry
DATABASE_URL = os.environ.get("DATABASE_URL", "mysql+pymysql://root:root@127.0.0.1/appdb")

engine = None
SessionLocal = None

def connect_db():
    global engine, SessionLocal
    max_retries = 10
    for i in range(max_retries):
        try:
            engine = create_engine(DATABASE_URL)
            engine.connect()
            SessionLocal = sessionmaker(bind=engine)
            print("✅ Kết nối MySQL thành công!")
            return
        except Exception as e:
            print(f"⏳ Chờ MySQL... ({i+1}/{max_retries})")
            time.sleep(3)
    raise Exception("❌ Không thể kết nối MySQL!")

connect_db()

Base = declarative_base()

# ==================== MODELS ====================

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255))
    role = Column(String(50))

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    status = Column(String(50))
    assigned_to = Column(Integer)

# ==================== SCHEMAS ====================

class UserCreate(BaseModel):
    name: str
    email: str
    role: Optional[str] = "member"

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

# ==================== USERS CRUD ====================

@app.get("/api-python/users")
def get_users():
    db = SessionLocal()
    users = db.query(User).all()
    db.close()
    return users

@app.get("/api-python/users/{user_id}")
def get_user(user_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    db.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api-python/users", status_code=201)
def create_user(user: UserCreate):
    db = SessionLocal()
    new_user = User(name=user.name, email=user.email, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    db.close()
    return new_user

@app.put("/api-python/users/{user_id}")
def update_user(user_id: int, user: UserUpdate):
    db = SessionLocal()
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")
    if user.name: db_user.name = user.name
    if user.email: db_user.email = user.email
    if user.role: db_user.role = user.role
    db.commit()
    db.refresh(db_user)
    db.close()
    return db_user

@app.delete("/api-python/users/{user_id}")
def delete_user(user_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    db.close()
    return {"message": "Deleted successfully"}

# ==================== DASHBOARD / THỐNG KÊ ====================

@app.get("/api-python/dashboard")
def get_dashboard():
    db = SessionLocal()

    total_users = db.query(func.count(User.id)).scalar()
    total_tasks = db.query(func.count(Task.id)).scalar()

    # Đếm tasks theo trạng thái
    pending = db.query(func.count(Task.id)).filter(Task.status == "pending").scalar()
    in_progress = db.query(func.count(Task.id)).filter(Task.status == "in_progress").scalar()
    done = db.query(func.count(Task.id)).filter(Task.status == "done").scalar()

    # Top users (có nhiều task nhất)
    from sqlalchemy import text
    top_users = db.execute(text("""
        SELECT u.name, COUNT(t.id) as task_count
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to
        GROUP BY u.id, u.name
        ORDER BY task_count DESC
        LIMIT 5
    """)).fetchall()

    db.close()

    return {
        "total_users": total_users,
        "total_tasks": total_tasks,
        "tasks_by_status": {
            "pending": pending,
            "in_progress": in_progress,
            "done": done
        },
        "top_users": [{"name": r[0], "task_count": r[1]} for r in top_users]
    }
```

**Giải thích:**
- `FastAPI` tự tạo trang docs tại `http://localhost:8000/docs` (Swagger UI)
- `SQLAlchemy` dùng ORM: định nghĩa class Python tương ứng bảng SQL
- `Pydantic BaseModel` dùng để validate dữ liệu đầu vào (request body)
- Dashboard endpoint tổng hợp data từ cả bảng `users` và `tasks`

### 3.5. Tạo `Lab7/python-api/Dockerfile`

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Phần 4: Frontend React + Nginx Reverse Proxy

### 4.1. Tạo `Lab7/frontend/package.json`

```json
{
  "name": "frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

### 4.2. Tạo `Lab7/frontend/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task Manager - Lab 7</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 4.3. Tạo `Lab7/frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-node': 'http://localhost:3000',
      '/api-python': 'http://localhost:8000',
    }
  }
})
```

**Giải thích:** Khi chạy `npm run dev` (dev mode), Vite sẽ proxy:
- `/api-node/*` → NodeJS ở port 3000
- `/api-python/*` → Python ở port 8000

Khi build production, Nginx sẽ đảm nhận việc proxy thay Vite.

### 4.4. Tạo `Lab7/frontend/src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 4.5. Tạo `Lab7/frontend/src/App.jsx`

```jsx
import { useState } from 'react';
import TaskList from './components/TaskList';
import UserList from './components/UserList';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabStyle = (tab) => ({
    padding: '10px 24px',
    cursor: 'pointer',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #2196F3' : '3px solid transparent',
    background: activeTab === tab ? '#e3f2fd' : 'transparent',
    fontWeight: activeTab === tab ? 'bold' : 'normal',
    fontSize: '15px',
  });

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#1565C0' }}>📋 Task Manager - Microservices</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        NodeJS API → Tasks &nbsp;|&nbsp; Python API → Users & Dashboard
      </p>

      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <button style={tabStyle('dashboard')} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button style={tabStyle('tasks')} onClick={() => setActiveTab('tasks')}>📝 Tasks (NodeJS)</button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>👥 Users (Python)</button>
      </div>

      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'tasks' && <TaskList />}
      {activeTab === 'users' && <UserList />}
    </div>
  );
}

export default App;
```

### 4.6. Tạo `Lab7/frontend/src/components/Dashboard.jsx`

```jsx
import { useState, useEffect } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    fetch('/api-python/dashboard')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) return <p>Đang tải...</p>;
  if (!data) return <p>Không có dữ liệu</p>;

  const cardStyle = {
    background: '#f5f5f5', borderRadius: '8px', padding: '20px',
    textAlign: 'center', minWidth: '120px'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={fetchDashboard} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      <h2>📊 Tổng quan hệ thống</h2>
      <p style={{ color: '#888', fontSize: '13px' }}>
        Dữ liệu thống kê được cung cấp bởi <strong>Python API</strong> (FastAPI)
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1565C0' }}>{data.total_users}</div>
          <div>👥 Users</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E7D32' }}>{data.total_tasks}</div>
          <div>📝 Tasks</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F57C00' }}>{data.tasks_by_status.pending}</div>
          <div>⏳ Pending</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976D2' }}>{data.tasks_by_status.in_progress}</div>
          <div>🔄 In Progress</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#388E3C' }}>{data.tasks_by_status.done}</div>
          <div>✅ Done</div>
        </div>
      </div>

      <h3>🏆 Top Users (nhiều task nhất)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#e3f2fd' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>#</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Tên</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Số tasks</th>
          </tr>
        </thead>
        <tbody>
          {data.top_users.map((u, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{i + 1}</td>
              <td style={{ padding: '8px' }}>{u.name}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{u.task_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
```

### 4.7. Tạo `Lab7/frontend/src/components/TaskList.jsx`

```jsx
import { useState, useEffect } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const fetchTasks = () => fetch('/api-node/tasks').then(r => r.json()).then(setTasks);
  const fetchUsers = () => fetch('/api-python/users').then(r => r.json()).then(setUsers);

  useEffect(() => { fetchTasks(); fetchUsers(); }, []);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    await fetch('/api-node/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, assigned_to: newAssignee || null })
    });
    setNewTitle(''); setNewAssignee(''); fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`/api-node/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const startEdit = (task) => {
    setEditId(task.id); setEditTitle(task.title); setEditStatus(task.status);
  };

  const saveEdit = async () => {
    await fetch(`/api-node/tasks/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, status: editStatus })
    });
    setEditId(null); fetchTasks();
  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === id);
    return user ? user.name : '—';
  };

  const statusBadge = (status) => {
    const colors = { pending: '#FF9800', in_progress: '#2196F3', done: '#4CAF50' };
    const labels = { pending: '⏳ Pending', in_progress: '🔄 In Progress', done: '✅ Done' };
    return (
      <span style={{ background: colors[status] || '#999', color: '#fff',
        padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div>
      <h2>📝 Quản lý Tasks <span style={{ fontSize: '13px', color: '#888', fontWeight: 'normal' }}>(NodeJS API)</span></h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
          placeholder="Nhập tên task..." style={{ flex: 1, padding: '8px', minWidth: '200px' }}
          onKeyDown={e => e.key === 'Enter' && addTask()} />
        <select value={newAssignee} onChange={e => setNewAssignee(e.target.value)} style={{ padding: '8px' }}>
          <option value="">-- Gán cho --</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <button onClick={addTask} style={{ padding: '8px 16px', background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer' }}>
          ➕ Thêm
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#e8f5e9' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Title</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Assigned To</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{t.id}</td>
              <td style={{ padding: '8px' }}>
                {editId === t.id
                  ? <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: '100%', padding: '4px' }} />
                  : t.title}
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {editId === t.id
                  ? <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ padding: '4px' }}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  : statusBadge(t.status)}
              </td>
              <td style={{ padding: '8px' }}>{getUserName(t.assigned_to)}</td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {editId === t.id ? (
                  <>
                    <button onClick={saveEdit} style={{ marginRight: '4px', cursor: 'pointer' }}>💾</button>
                    <button onClick={() => setEditId(null)} style={{ cursor: 'pointer' }}>❌</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(t)} style={{ marginRight: '4px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => deleteTask(t.id)} style={{ cursor: 'pointer' }}>🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>Chưa có task nào</p>}
    </div>
  );
}

export default TaskList;
```

### 4.8. Tạo `Lab7/frontend/src/components/UserList.jsx`

```jsx
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');

  const fetchUsers = () => fetch('/api-python/users').then(r => r.json()).then(setUsers);

  useEffect(() => { fetchUsers(); }, []);

  const addUser = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    await fetch('/api-python/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, email: newEmail, role: newRole })
    });
    setNewName(''); setNewEmail(''); setNewRole('member'); fetchUsers();
  };

  const deleteUser = async (id) => {
    await fetch(`/api-python/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const startEdit = (user) => {
    setEditId(user.id); setEditName(user.name); setEditEmail(user.email); setEditRole(user.role);
  };

  const saveEdit = async () => {
    await fetch(`/api-python/users/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, email: editEmail, role: editRole })
    });
    setEditId(null); fetchUsers();
  };

  const roleBadge = (role) => {
    const colors = { admin: '#E91E63', manager: '#9C27B0', member: '#607D8B' };
    return (
      <span style={{ background: colors[role] || '#999', color: '#fff',
        padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
        {role}
      </span>
    );
  };

  return (
    <div>
      <h2>👥 Quản lý Users <span style={{ fontSize: '13px', color: '#888', fontWeight: 'normal' }}>(Python API)</span></h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="Tên..." style={{ padding: '8px', minWidth: '150px' }} />
        <input value={newEmail} onChange={e => setNewEmail(e.target.value)}
          placeholder="Email..." style={{ flex: 1, padding: '8px', minWidth: '200px' }} />
        <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ padding: '8px' }}>
          <option value="member">Member</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={addUser} style={{ padding: '8px 16px', background: '#9C27B0', color: '#fff', border: 'none', cursor: 'pointer' }}>
          ➕ Thêm
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3e5f5' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Role</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{u.id}</td>
              <td style={{ padding: '8px' }}>
                {editId === u.id
                  ? <input value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '4px' }} />
                  : u.name}
              </td>
              <td style={{ padding: '8px' }}>
                {editId === u.id
                  ? <input value={editEmail} onChange={e => setEditEmail(e.target.value)} style={{ width: '100%', padding: '4px' }} />
                  : u.email}
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {editId === u.id
                  ? <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ padding: '4px' }}>
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  : roleBadge(u.role)}
              </td>
              <td style={{ padding: '8px', textAlign: 'center' }}>
                {editId === u.id ? (
                  <>
                    <button onClick={saveEdit} style={{ marginRight: '4px', cursor: 'pointer' }}>💾</button>
                    <button onClick={() => setEditId(null)} style={{ cursor: 'pointer' }}>❌</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(u)} style={{ marginRight: '4px', cursor: 'pointer' }}>✏️</button>
                    <button onClick={() => deleteUser(u.id)} style={{ cursor: 'pointer' }}>🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>Chưa có user nào</p>}
    </div>
  );
}

export default UserList;
```

### 4.9. Cài đặt dependencies Frontend

```powershell
cd Lab7/frontend
npm install
```

### 4.10. Tạo `Lab7/frontend/nginx.conf` (Reverse Proxy)

```nginx
server {
    listen 80;

    # Frontend React (static files)
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

**Giải thích Nginx Reverse Proxy:**
- Browser chỉ truy cập port 80 (Nginx)
- Nginx nhận request rồi **chuyển tiếp** (proxy) tới service phù hợp:
  - `/api-node/*` → container `node-api` port 3000
  - `/api-python/*` → container `python-api` port 8000
  - Mọi request khác → trả file React (SPA)
- `node-api` và `python-api` là tên service trong Docker Compose (Docker DNS tự resolve)

### 4.11. Tạo `Lab7/frontend/Dockerfile`

```dockerfile
# Stage 1: Build React app
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Giải thích Multi-stage build:**
- **Stage 1:** Dùng Node.js để `npm install` + `npm run build` → tạo thư mục `dist/` chứa HTML/JS/CSS tĩnh
- **Stage 2:** Chỉ copy `dist/` vào Nginx → image cuối rất nhẹ (không chứa node_modules)

---

## Phần 5: Docker Compose — Kết nối tất cả

### 5.1. Tạo `Lab7/docker-compose.yml`

```yaml
version: '3.8'
services:
  # ==================== DATABASE ====================
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

  # ==================== phpMyAdmin ====================
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    ports:
      - "8080:80"
    environment:
      PMA_HOST: mysql
    depends_on:
      mysql:
        condition: service_healthy

  # ==================== NodeJS API (Tasks) ====================
  node-api:
    build: ./node-api
    environment:
      DB_HOST: mysql
    depends_on:
      mysql:
        condition: service_healthy

  # ==================== Python API (Users + Dashboard) ====================
  python-api:
    build: ./python-api
    environment:
      DATABASE_URL: mysql+pymysql://root:root@mysql/appdb
    depends_on:
      mysql:
        condition: service_healthy

  # ==================== Frontend (React + Nginx) ====================
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - node-api
      - python-api

volumes:
  mysql_data:
```

**Giải thích từng phần:**

| Service | Mô tả |
|---------|--------|
| `mysql` | Database MySQL 8, tự chạy `init.sql` khi tạo lần đầu. Healthcheck đảm bảo DB sẵn sàng trước khi các service khác kết nối |
| `phpmyadmin` | Giao diện web quản lý MySQL, truy cập port 8080 |
| `node-api` | Build từ `./node-api/Dockerfile`, nhận biến `DB_HOST=mysql` để biết địa chỉ database |
| `python-api` | Build từ `./python-api/Dockerfile`, nhận `DATABASE_URL` chứa connection string đầy đủ |
| `frontend` | Build React + Nginx, expose port 80 ra ngoài, đợi cả 2 backend sẵn sàng |
| `mysql_data` | Named volume — dữ liệu MySQL được lưu giữ ngay cả khi container bị xóa |

---

## Phần 6: Chạy hệ thống

### Cách 1: Docker Compose (khuyên dùng — 1 lệnh duy nhất)

```powershell
# Mở terminal, di chuyển vào thư mục Lab7
cd Lab7

# Build và khởi chạy tất cả services
docker compose up --build -d
```

Đợi khoảng 1-2 phút cho lần đầu tiên (tải images, build, khởi tạo DB).

**Kiểm tra trạng thái:**
```powershell
docker compose ps
```

Kết quả mong đợi — tất cả services đều **running**:
```
NAME               SERVICE       STATUS
lab7-mysql-1       mysql         running (healthy)
lab7-phpmyadmin-1  phpmyadmin    running
lab7-node-api-1    node-api      running
lab7-python-api-1  python-api    running
lab7-frontend-1    frontend      running
```

**Truy cập:**

| URL | Mô tả |
|-----|--------|
| http://localhost | Frontend — giao diện Task Manager |
| http://localhost:8080 | phpMyAdmin — quản lý database (user: `root`, pass: `root`) |

**Xem logs nếu có lỗi:**
```powershell
# Xem logs tất cả services
docker compose logs

# Xem logs 1 service cụ thể
docker compose logs node-api
docker compose logs python-api
```

**Dừng hệ thống:**
```powershell
# Dừng (giữ data)
docker compose down

# Dừng + XÓA data database (reset hoàn toàn)
docker compose down -v
```

---

### Cách 2: Chạy thủ công (Dev mode — debug từng service)

Dùng khi muốn phát triển và debug từng service riêng lẻ.

#### Bước 1: Chạy MySQL bằng Docker

```powershell
cd Lab7
docker compose up mysql phpmyadmin -d
```

Đợi MySQL healthy:
```powershell
docker compose ps
# Chờ đến khi mysql STATUS = running (healthy)
```

#### Bước 2: Chạy NodeJS API (Terminal 2)

```powershell
cd Lab7/node-api
npm install
node app.js
```

Kết quả: `✅ Kết nối MySQL thành công!` và `🚀 NodeJS Tasks API chạy ở port 3000`

#### Bước 3: Chạy Python API (Terminal 3)

```powershell
cd Lab7/python-api

# Tạo và kích hoạt virtual environment (chỉ lần đầu)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Cài thư viện
pip install -r requirements.txt

# Chạy server
uvicorn main:app --reload --port 8000
```

Kết quả: `✅ Kết nối MySQL thành công!` và `Uvicorn running on http://127.0.0.1:8000`

> **Tip:** Sau lần đầu tạo venv, các lần sau chỉ cần kích hoạt lại: `.\venv\Scripts\Activate.ps1`

#### Bước 4: Chạy Frontend Dev Server (Terminal 4)

```powershell
cd Lab7/frontend
npm install
npm run dev
```

Truy cập: http://localhost:5173 (Vite dev server tự proxy API calls)

---

## Phần 7: Kiểm tra & Test API

### Test bằng trình duyệt

- Mở http://localhost (Docker Compose) hoặc http://localhost:5173 (dev mode)
- Tab **Dashboard**: xem thống kê tổng quan
- Tab **Tasks**: thêm, sửa, xóa task, đổi trạng thái
- Tab **Users**: thêm, sửa, xóa user, đổi role

### Test API bằng curl / PowerShell

```powershell
# === NODEJS API (Tasks) ===

# Lấy tất cả tasks
curl http://localhost/api-node/tasks

# Tạo task mới
curl -X POST http://localhost/api-node/tasks `
  -H "Content-Type: application/json" `
  -d '{"title": "Task test", "assigned_to": 1}'

# Cập nhật task (id=1)
curl -X PUT http://localhost/api-node/tasks/1 `
  -H "Content-Type: application/json" `
  -d '{"status": "done"}'

# Xóa task (id=1)
curl -X DELETE http://localhost/api-node/tasks/1


# === PYTHON API (Users + Dashboard) ===

# Lấy tất cả users
curl http://localhost/api-python/users

# Tạo user mới
curl -X POST http://localhost/api-python/users `
  -H "Content-Type: application/json" `
  -d '{"name": "Test User", "email": "test@email.com", "role": "member"}'

# Xem dashboard
curl http://localhost/api-python/dashboard
```

### Test Python API bằng Swagger UI

Khi chạy dev mode, mở: http://localhost:8000/docs → FastAPI tự tạo giao diện test tất cả endpoints.

---

## Phần 8: Push lên Docker Hub

### 8.1. Tạo tài khoản Docker Hub

1. Đăng ký tại: https://hub.docker.com/
2. Ghi nhớ **username** của bạn

### 8.2. Đăng nhập Docker Hub

```powershell
docker login
# Nhập username + password
```

### 8.3. Build & Push bằng script

**Windows (PowerShell):**
```powershell
cd Lab7
.\scripts\push-to-hub.ps1 -Username <dockerhub_username> -Version v1
```

**Linux / WSL (Bash):**
```bash
cd Lab7
chmod +x scripts/push-to-hub.sh
./scripts/push-to-hub.sh <dockerhub_username> v1
```

Script sẽ tự động:
1. Build 3 images (node-api, python-api, frontend)
2. Tag theo format: `<username>/<image-name>:<version>`
3. Push cả 3 lên Docker Hub

### 8.4. Chỉ Build (không push)

```powershell
# Windows
cd Lab7
.\scripts\build-only.ps1 -Username <dockerhub_username> -Version v1

# Linux
./scripts/build-only.sh <dockerhub_username> v1
```

### 8.5. Kiểm tra trên Docker Hub

Truy cập `https://hub.docker.com/u/<username>` để xác nhận 3 repositories:
- `<username>/node-api-tasks`
- `<username>/python-api-users`
- `<username>/react-frontend`

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| `port 80 already in use` | Port 80 đã bị chiếm | Tắt IIS/Apache/Skype hoặc đổi port trong `docker-compose.yml` |
| `port 3306 already in use` | MySQL local đang chạy | Tắt MySQL local hoặc đổi port |
| `Cannot connect to MySQL` | MySQL chưa kịp khởi tạo | Đợi thêm hoặc chạy `docker compose logs mysql` để kiểm tra |
| `Module not found (Python)` | Chưa cài thư viện | Chạy `pip install -r requirements.txt` trong venv |
| `npm ERR! ENOENT` | Chưa cd vào đúng thư mục | Kiểm tra lại đường dẫn |
| `docker compose` không nhận | Docker Desktop chưa chạy | Mở Docker Desktop, đợi xanh |
| Container restart liên tục | App crash | Xem `docker compose logs <service>` |
| Frontend trắng/lỗi | Build lỗi hoặc proxy sai | Kiểm tra `docker compose logs frontend` |

---

## Database Schema

```sql
-- Bảng Users (Python API quản lý)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member'      -- admin, manager, member
);

-- Bảng Tasks (NodeJS API quản lý)
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',   -- pending, in_progress, done
    assigned_to INT,                         -- FK → users.id
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);
```
