Dưới đây là tài liệu hướng dẫn Lab chi tiết từng bước. Để quá trình thực hành diễn ra mượt mà nhất, đặc biệt là khi làm việc với Docker và các script bash, môi trường lý tưởng nhất là sử dụng **VS Code** kết hợp với **WSL (Windows Subsystem for Linux)**.

Hãy tạo một thư mục gốc cho toàn bộ workshop (ví dụ: `fullstack-workshop`) và mở nó bằng VS Code.

---

### Bài Lab 1: Xây dựng Backend NodeJS & Frontend ReactJS (Mock Data)

**1. Xây dựng NodeJS API**
Mở terminal trong VS Code, khởi tạo dự án và cài đặt framework Express:

```bash
mkdir node-api && cd node-api
npm init -y
npm install express cors

```

Tạo file `app.js` và code một server trả về dữ liệu giả (mock data) ở port 3000:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Cho phép React gọi API ở chế độ dev
app.use(express.json());

// Trả về Mock Data
app.get('/api-node/tasks', (req, res) => {
    res.json([
        { id: 1, title: "Mock Task từ NodeJS 1" },
        { id: 2, title: "Mock Task từ NodeJS 2" }
    ]);
});

app.listen(3000, () => {
    console.log("NodeJS API đang chạy tại http://localhost:3000");
});

```

Chạy thử: `node app.js`

**2. Xây dựng Frontend ReactJS**
Mở một tab terminal mới, quay lại thư mục gốc và dùng Vite để tạo project React:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install

```

Chỉnh sửa file `src/App.jsx` để gọi API:

```jsx
import { useState, useEffect } from 'react';

function App() {
  const [nodeTasks, setNodeTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api-node/tasks')
      .then(res => res.json())
      .then(data => setNodeTasks(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager</h1>
      <h2>Dữ liệu từ NodeJS API:</h2>
      <ul>
        {nodeTasks.map(t => <li key={t.id}>{t.title}</li>)}
      </ul>
    </div>
  );
}
export default App;

```

Chạy React: `npm run dev` và xem kết quả trên trình duyệt.

---

### Bài Lab 2: Xây dựng Backend Python (FastAPI) & Tích hợp vào ReactJS

**1. Xây dựng Python API**
Mở terminal mới, tạo thư mục và cài đặt FastAPI cùng web server Uvicorn:

```bash
mkdir python-api && cd python-api
pip install fastapi uvicorn
# Nếu thiếu cors, cài thêm: pip install fastapi[all]

```

Tạo file `main.py` định nghĩa endpoint trả về mock data:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api-python/tasks")
def get_tasks():
    return [
        {"id": 3, "title": "Mock Task từ Python 1"},
        {"id": 4, "title": "Mock Task từ Python 2"}
    ]

```

Chạy server: `uvicorn main:app --reload --port 8000`.

**2. Cập nhật Frontend React**
Mở lại `src/App.jsx` trong thư mục `frontend` và thêm logic gọi API từ Python:

```jsx
import { useState, useEffect } from 'react';

function App() {
  const [nodeTasks, setNodeTasks] = useState([]);
  const [pythonTasks, setPythonTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api-node/tasks').then(res => res.json()).then(setNodeTasks);
    fetch('http://localhost:8000/api-python/tasks').then(res => res.json()).then(setPythonTasks);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Task Manager</h1>
      <h2>Từ NodeJS:</h2>
      <ul>{nodeTasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
      <h2>Từ Python:</h2>
      <ul>{pythonTasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </div>
  );
}
export default App;

```

---

### Bài Lab 3: Cài đặt, quản lý MySQL bằng phpMyAdmin

Cách nhanh nhất để có DB và công cụ quản lý là dùng Docker. Tạo file `docker-compose-db.yml` ở thư mục gốc:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: appdb
    ports:
      - "3306:3306"
  
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    ports:
      - "8080:80"
    environment:
      PMA_HOST: mysql
    depends_on:
      - mysql

```

Khởi chạy: `docker compose -f docker-compose-db.yml up -d`

**Thao tác:**

1. Truy cập `http://localhost:8080`, đăng nhập với user `root` / pass `root`.
2. Chọn database `appdb`.
3. Chạy câu lệnh SQL sau để tạo bảng và insert dữ liệu:

```sql
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255)
);
INSERT INTO tasks (title) VALUES ('Học CI/CD'), ('Triển khai Docker');

```

---

### Bài Lab 4: Tích hợp Database vào 2 ứng dụng Backend

**1. Tích hợp cho NodeJS**
Cài đặt thư viện MySQL2: `npm install mysql2`
Cập nhật `app.js` (Lưu ý: dùng IP `127.0.0.1` hoặc `localhost` khi chạy dev ở ngoài container):

```javascript
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

app.use(cors());

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "appdb"
});

app.get('/api-node/tasks', (req, res) => {
    db.query("SELECT * FROM tasks", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.listen(3000, () => console.log("NodeJS chạy ở port 3000"));

```

**2. Tích hợp cho Python**
Cài đặt SQLAlchemy và driver: `pip install sqlalchemy pymysql`
Cập nhật `main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DATABASE_URL = "mysql+pymysql://root:root@127.0.0.1/appdb"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    title = Column(String)

@app.get("/api-python/tasks")
def tasks():
    db = SessionLocal()
    result = db.query(Task).all()
    db.close()
    return result

```

---

### Bài Lab 5: Đóng gói vào Docker (Dockerfile)

Khi đưa vào Docker, các app không gọi nhau qua `localhost` nữa. Frontend trong file `App.jsx` cần sửa lại để gọi URL theo relative path hoặc qua API Gateway.
*Mẹo:* Ở file `App.jsx`, đổi `fetch('http://localhost:3000/api-node/tasks')` thành `fetch('/api-node/tasks')`.

**1. Dockerfile cho NodeJS (`node-api/Dockerfile`)**:

```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]

```

**2. Dockerfile cho Python (`python-api/Dockerfile`)**:
(Nhớ tạo file `requirements.txt` bằng lệnh `pip freeze > requirements.txt` trước).

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

```

**3. Dockerfile cho React (`frontend/Dockerfile`)**:
Tạo file `nginx.conf` trong thư mục `frontend` để proxy request:

```nginx
server {
    listen 80;
    location / { root /usr/share/nginx/html; index index.html; }
    location /api-node/ { proxy_pass http://node-api:3000/; }
    location /api-python/ { proxy_pass http://python-api:8000/; }
}

```

Dockerfile:

```dockerfile
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

```

---

### Bài Lab 6: Chạy trên Docker & Đưa lên Docker Hub

Tạo file `docker-compose.yml` tổng ở thư mục gốc:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: appdb
    volumes:
      - mysql_data:/var/lib/mysql
  node-api:
    build: ./node-api
    environment:
      DB_HOST: mysql  # Đổi từ 127.0.0.1 sang tên service
    depends_on:
      - mysql
  python-api:
    build: ./python-api
    environment:
      DATABASE_URL: mysql+pymysql://root:root@mysql/appdb
    depends_on:
      - mysql
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

**Lưu ý sửa code Backend:** Bạn cần cập nhật lại `app.js` và `main.py` để đọc Host DB từ biến môi trường (Ví dụ: `process.env.DB_HOST`) thay vì hardcode `127.0.0.1`.

**Khởi chạy:**

```bash
docker compose down # Tắt cái DB cũ ở Lab 3 đi
docker compose up --build -d

```

Mở `http://localhost` (cổng 80) để tận hưởng thành quả!

**Đưa lên Docker Hub:**

1. Đăng nhập: `docker login`
2. Build và tag image (thay `yourusername` bằng username của bạn):

```bash
docker build -t yourusername/node-api:v1 ./node-api
docker build -t yourusername/python-api:v1 ./python-api
docker build -t yourusername/react-frontend:v1 ./frontend

```

3. Push lên Hub:

```bash
docker push yourusername/node-api:v1
docker push yourusername/python-api:v1
docker push yourusername/react-frontend:v1

```

Bạn có muốn tôi hướng dẫn cách áp dụng mô hình kiến trúc đa dịch vụ (Multi-service) này vào hệ thống LMS SeaLMS mà bạn đang phát triển tại trường không?