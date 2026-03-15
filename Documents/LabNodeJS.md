# Bài lab: Xây dựng ứng dụng Task Manager với React + NodeJS + MySQL

## 1. Mục tiêu bài lab

Sau khi hoàn thành bài lab này, người học có thể:

* Tạo frontend bằng **React + Vite**
* Xây dựng component, sử dụng **JSX**, **props**, **state**, **useEffect**
* Gọi API từ frontend bằng `fetch`
* Xây dựng backend bằng **NodeJS + Express**
* Tạo API endpoint `GET /tasks`
* Kết nối MySQL bằng `mysql2`
* Hiểu luồng full-stack: **React → Node API → MySQL** 

---

## 2. Kiến thức nền từ tài liệu

Bài lab này dựa trực tiếp trên các ý chính trong file:

* React là thư viện xây dựng UI theo mô hình **component-based**
* React dùng `useState` để quản lý state và `useEffect` để gọi API khi component mount
* Frontend không truy cập DB trực tiếp mà gọi backend qua HTTP
* Express dùng để tạo API server với routing và middleware
* NodeJS backend kết nối MySQL bằng `mysql2`
* Endpoint mẫu trung tâm là `GET /tasks` trả dữ liệu JSON cho React hiển thị 

---

## 3. Yêu cầu đầu vào

Máy đã cài sẵn:

* Node.js
* npm
* MySQL Server hoặc MySQL chạy container
* VS Code

Khuyến nghị:

* Postman hoặc browser để test API
* MySQL Workbench hoặc CLI

---

## 4. Kết quả đầu ra mong đợi

Khi chạy xong:

* Backend NodeJS chạy ở cổng `3000`
* Frontend React chạy ở cổng `5173` hoặc cổng Vite cấp
* Truy cập giao diện React sẽ thấy danh sách task lấy từ MySQL qua API NodeJS
* API test được ở endpoint:

```bash
http://localhost:3000/tasks
```

và frontend hiển thị được danh sách tiêu đề task. 

---

## 5. Kịch bản bài lab

Người học đóng vai dev full-stack, cần xây dựng một ứng dụng quản lý công việc tối giản:

* Database lưu bảng `tasks`
* NodeJS backend cung cấp API lấy danh sách task
* React frontend gọi API và render danh sách

---

## 6. Cấu trúc bài lab

## Phần A. Chuẩn bị database

### Bước A1. Tạo database

Chạy SQL sau:

```sql
CREATE DATABASE IF NOT EXISTS appdb;
USE appdb;

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending'
);
```

### Bước A2. Thêm dữ liệu mẫu

```sql
INSERT INTO tasks (title, status) VALUES
('Học React component', 'done'),
('Tạo API với Express', 'done'),
('Kết nối MySQL', 'pending'),
('Hiển thị task trên frontend', 'pending');
```

### Kiểm tra

```sql
SELECT * FROM tasks;
```

Kết quả cần có ít nhất 4 dòng dữ liệu.

---

## Phần B. Tạo NodeJS Backend

Tài liệu mô tả backend NodeJS theo cấu trúc có `routes/`, `controllers/`, `services/`, `db.js`, `app.js`. Với bài lab cơ bản, có thể triển khai trước trong một file rồi mở rộng sau. 

### Bước B1. Tạo project backend

```bash
mkdir node-api
cd node-api
npm init -y
npm install express cors mysql2
```

### Bước B2. Tạo file `app.js`

```js
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "YOUR_PASSWORD",
  database: "appdb"
});

db.connect((err) => {
  if (err) {
    console.error("Ket noi MySQL that bai:", err.message);
    return;
  }
  console.log("Da ket noi MySQL");
});

app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Loi truy van CSDL" });
    }
    res.json(result);
  });
});

app.listen(PORT, () => {
  console.log(`Server dang chay tai http://localhost:${PORT}`);
});
```

### Bước B3. Chạy backend

```bash
node app.js
```

### Kiểm tra

Mở trình duyệt hoặc Postman:

```bash
http://localhost:3000/tasks
```

Kỳ vọng trả về JSON như:

```json
[
  {
    "id": 1,
    "title": "Học React component",
    "status": "done"
  }
]
```

Phần này bám đúng luồng trong tài liệu: React gửi `GET /tasks`, Node query MySQL, rồi trả JSON result. 

---

## Phần C. Tạo React Frontend với Vite

Tài liệu dùng **Vite** để khởi tạo React project, với cấu trúc có `src/components/`, `src/api/`, `App.jsx`, `main.jsx`. 

### Bước C1. Tạo project frontend

Mở terminal mới:

```bash
npm create vite@latest frontend
```

Chọn:

* Framework: `React`
* Variant: `JavaScript`

Sau đó chạy:

```bash
cd frontend
npm install
npm run dev
```

### Bước C2. Tổ chức cấu trúc thư mục

Trong `src/`, tạo:

* `components/`
* `api/`

Cấu trúc mong muốn:

```bash
src/
├─ components/
│  └─ TaskList.jsx
├─ api/
│  └─ tasks.js
├─ App.jsx
└─ main.jsx
```

---

## Phần D. Tạo API client layer

Tài liệu khuyến nghị tách logic gọi API ra file riêng để dễ bảo trì. 

### Bước D1. Tạo file `src/api/tasks.js`

```js
export async function getTasks() {
  const res = await fetch("http://localhost:3000/tasks");
  if (!res.ok) {
    throw new Error("Khong the tai danh sach tasks");
  }
  return res.json();
}
```

---

## Phần E. Tạo React component hiển thị dữ liệu

### Bước E1. Tạo file `src/components/TaskList.jsx`

```jsx
function TaskList({ tasks }) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.title} - {task.status}
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
```

Phần này bám đúng nội dung trong tài liệu: component nhận `tasks` qua props, dùng `map()` để render list, và mỗi phần tử cần `key={t.id}`. 

### Bước E2. Cập nhật file `src/App.jsx`

```jsx
import { useEffect, useState } from "react";
import { getTasks } from "./api/tasks";
import TaskList from "./components/TaskList";

function App() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Task Manager</h1>
      <p>Danh sách công việc lấy từ NodeJS API + MySQL</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <TaskList tasks={tasks} />
    </div>
  );
}

export default App;
```

Đây là đúng pattern được tài liệu trình bày: kết hợp `useState` và `useEffect` để fetch data từ API khi component mount. 

---

## 7. Hướng dẫn chạy toàn bộ hệ thống

### Terminal 1: chạy backend

```bash
cd node-api
node app.js
```

### Terminal 2: chạy frontend

```bash
cd frontend
npm run dev
```

### Truy cập

Mở URL mà Vite cung cấp, ví dụ:

```bash
http://localhost:5173
```

Kết quả mong đợi:

* Hiển thị tiêu đề `Task Manager`
* Hiển thị danh sách task lấy từ MySQL

---

## 8. Nhiệm vụ thực hành

## Mức 1 — Cơ bản

1. Tạo được database `appdb`
2. Tạo được bảng `tasks`
3. Viết được NodeJS API `GET /tasks`
4. Viết được React component `TaskList`
5. Hiển thị được dữ liệu từ MySQL trên giao diện

## Mức 2 — Mở rộng

6. Thêm cột `created_at` vào bảng `tasks`
7. Hiển thị thêm trạng thái task trên giao diện
8. Tạo route `GET /tasks/:id`
9. Hiển thị số lượng task ở đầu trang

## Mức 3 — Nâng cao

10. Tạo form thêm task mới
11. Viết API `POST /tasks`
12. Sau khi thêm task, danh sách tự động cập nhật
13. Tách backend theo cấu trúc:

* `routes/`
* `controllers/`
* `services/`
* `db.js`

---

## 9. Câu hỏi thảo luận sau bài lab

1. Vì sao React không truy cập database trực tiếp?
2. Vai trò của `useEffect(..., [])` là gì?
3. Vì sao nên tách API call sang thư mục `src/api/`?
4. Middleware `express.json()` dùng để làm gì?
5. `cors()` giải quyết vấn đề gì?
6. Tại sao `key` là bắt buộc khi render list trong React?
7. Luồng dữ liệu từ frontend đến database diễn ra như thế nào? 

---

## 10. Tiêu chí chấm điểm gợi ý

### Tổng: 10 điểm

* Tạo DB và bảng đúng: **1.5 điểm**
* Backend Express chạy được: **2 điểm**
* API `GET /tasks` trả JSON đúng: **2 điểm**
* Frontend React render được danh sách: **2 điểm**
* Có sử dụng `useState`, `useEffect`, props đúng cách: **1.5 điểm**
* Code rõ ràng, chạy ổn định: **1 điểm**

---

## 11. Lỗi thường gặp

### Lỗi 1: React không gọi được API

Nguyên nhân:

* Backend chưa chạy
* Sai URL `http://localhost:3000/tasks`
* Bị chặn CORS

Cách xử lý:

* Kiểm tra backend có log đang chạy không
* Kiểm tra đã dùng `app.use(cors())` chưa

### Lỗi 2: Backend không kết nối được MySQL

Nguyên nhân:

* Sai user/password
* Database chưa tồn tại
* MySQL chưa bật

Cách xử lý:

* Kiểm tra cấu hình trong `mysql.createConnection`
* Chạy thử `SELECT * FROM tasks;` trong MySQL

### Lỗi 3: React render lỗi `map is not a function`

Nguyên nhân:

* API không trả mảng
* `tasks` khởi tạo sai kiểu dữ liệu

Cách xử lý:

* Đảm bảo `const [tasks, setTasks] = useState([])`

---

## 12. Phiên bản lab nâng cấp cho buổi tiếp theo

Có thể phát triển tiếp bài lab này thành:

* CRUD đầy đủ cho tasks
* So sánh NodeJS backend và Python backend như tài liệu gợi ý
* Docker hóa toàn bộ hệ thống
* Thêm proxy giữa Vite và backend
* Tách controller/service/repository chuẩn hơn

---

## 13. **Đề bài:**
Hãy xây dựng một ứng dụng full-stack đơn giản để quản lý danh sách công việc.

**Yêu cầu:**

1. Tạo CSDL MySQL tên `appdb`, bảng `tasks`
2. Chèn ít nhất 4 bản ghi mẫu
3. Xây dựng NodeJS backend với Express, tạo API `GET /tasks`
4. Kết nối backend với MySQL bằng `mysql2`
5. Tạo React frontend bằng Vite
6. Sử dụng `useState` và `useEffect` để lấy dữ liệu từ API
7. Tạo component `TaskList` để hiển thị dữ liệu
8. Chụp ảnh màn hình kết quả và nộp source code

---

## 14. Mẫu đáp án ngắn gọn m

Luồng đúng của bài lab là:

* MySQL lưu bảng `tasks`
* Express tạo endpoint `GET /tasks`
* React gọi API bằng `fetch`
* `useEffect` chạy khi component mount
* Dữ liệu được lưu vào state bằng `setTasks`
* Component `TaskList` render danh sách bằng `map()` 
