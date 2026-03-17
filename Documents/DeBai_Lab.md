# ĐỀ BÀI LAB: Xây dựng Backend NodeJS & Frontend ReactJS (Mock Data)

## Thông tin chung

| Mục                                | Chi tiết                                                       |
| ----------------------------------- | --------------------------------------------------------------- |
| **Tên bài lab**             | Xây dựng Backend NodeJS & Frontend ReactJS với Mock Data     |
| **Thời lượng**             | 2 - 3 tiết thực hành                                         |
| **Vị trí trong chuỗi Lab** | Lab 1 / 7 — Bài mở đầu                                     |
| **Bài tiếp theo**           | Lab 2: Thêm Backend Python (FastAPI) & Tích hợp vào ReactJS |

---

## 1. Mục tiêu bài lab

Sau khi hoàn thành bài lab này, sinh viên có thể:

1. Tạo một API server đơn giản bằng **NodeJS + Express** trả về dữ liệu giả (mock data)
2. Tạo một ứng dụng Frontend bằng **ReactJS + Vite** hiển thị dữ liệu từ API
3. Hiểu luồng giao tiếp cơ bản: **Frontend (React) → HTTP Request → Backend (NodeJS) → JSON Response → Frontend hiển thị**
4. Sử dụng các React Hook cơ bản: `useState`, `useEffect`
5. Hiểu vai trò của middleware `cors` và `express.json()`

---

## 2. Bối cảnh bài toán

Bạn được giao nhiệm vụ xây dựng **phần khởi đầu** của một ứng dụng quản lý công việc (Task Manager). Trong giai đoạn đầu, backend chưa kết nối database mà chỉ trả về **dữ liệu giả (mock data)** để frontend có thể phát triển giao diện song song.

Đây là bước đầu tiên trong chuỗi 7 bài lab, tiến dần từ ứng dụng đơn giản đến hệ thống microservices hoàn chỉnh được đóng gói bằng Docker:

```
Lab 1: React + NodeJS (Mock Data)          ← BẠN ĐANG Ở ĐÂY
Lab 2: Thêm Python API (Mock Data)
Lab 3: Cài đặt MySQL + phpMyAdmin (Docker)
Lab 4: Kết nối Backend với Database thực
Lab 5: Viết Dockerfile đóng gói từng service
Lab 6: Docker Compose chạy toàn bộ hệ thống
Lab 7: Microservices hoàn chỉnh + Docker Hub
```

---

## 3. Yêu cầu đầu vào

### Phần mềm cần có trên máy:

| Phần mềm              | Phiên bản tối thiểu | Kiểm tra   |
| ----------------------- | ----------------------- | ----------- |
| **Node.js**       | v18+                    | `node -v` |
| **npm**           | v9+                     | `npm -v`  |
| **VS Code**       | Latest                  | —          |
| **Trình duyệt** | Chrome / Edge / Firefox | —          |

### Kiến thức cần có:

- JavaScript cơ bản (biến, hàm, mảng, object)
- Hiểu khái niệm HTTP request/response
- Biết mở terminal và chạy lệnh

---

## 4. Kết quả đầu ra mong đợi

Khi hoàn thành, sinh viên có:

| Thành phần             | Mô tả                                           | Truy cập                                |
| ------------------------ | ------------------------------------------------- | ---------------------------------------- |
| **NodeJS API**     | Server Express trả về danh sách task (JSON)    | `http://localhost:3000/api-node/tasks` |
| **React Frontend** | Giao diện web hiển thị danh sách task từ API | `http://localhost:5173`                |

### Minh họa kết quả:

**API Response** (truy cập `http://localhost:3000/api-node/tasks`):

```json
[
    { "id": 1, "title": "Mock Task từ NodeJS 1" },
    { "id": 2, "title": "Mock Task từ NodeJS 2" }
]
```

**Giao diện React** (truy cập `http://localhost:5173`):

```
Task Manager
─────────────────
Dữ liệu từ NodeJS API:
• Mock Task từ NodeJS 1
• Mock Task từ NodeJS 2
```

---

## 5. Kiến trúc hệ thống Lab 1

```
┌──────────────────────┐         HTTP GET          ┌──────────────────────┐
│                      │  ──────────────────────►  │                      │
│   React Frontend     │   /api-node/tasks         │   NodeJS Backend     │
│   (Vite Dev Server)  │                           │   (Express)          │
│   Port: 5173         │  ◄──────────────────────  │   Port: 3000         │
│                      │     JSON Response         │                      │
│   - App.jsx          │                           │   - app.js           │
│   - main.jsx         │                           │   - Mock Data        │
└──────────────────────┘                           └──────────────────────┘
       Browser                                          Server
```

### Luồng dữ liệu:

1. Người dùng mở trình duyệt → `http://localhost:5173`
2. React load `App.jsx` → gọi `useEffect`
3. `fetch('http://localhost:3000/api-node/tasks')` gửi HTTP GET
4. NodeJS nhận request → trả JSON mock data
5. React nhận response → cập nhật `state` → render danh sách

---

## 6. Cấu trúc thư mục cần tạo

```
Lab1/
├── node-api/               # Backend NodeJS
│   ├── app.js              # File chính: Express server + mock data
│   └── package.json        # Khai báo dependencies
│
└── frontend/               # Frontend ReactJS
    ├── index.html          # HTML entry point
    ├── package.json        # Khai báo dependencies
    ├── vite.config.js      # Cấu hình Vite
    └── src/
        ├── main.jsx        # Bootstrap React app
        └── App.jsx         # Component chính: gọi API + hiển thị
```

---

## 7. Hướng dẫn thực hiện chi tiết

---

### PHẦN A: Tạo NodeJS Backend (Express API)

---

#### Bước A1: Tạo thư mục project và khởi tạo

Mở terminal, tạo thư mục cho toàn bộ Lab 1:

```bash
mkdir Lab1
cd Lab1
```

Tạo thư mục backend:

```bash
mkdir node-api
cd node-api
npm init -y
```

> **Giải thích:** `npm init -y` tạo file `package.json` với cấu hình mặc định. File này khai báo thông tin project và danh sách thư viện (dependencies) cần dùng.

---

#### Bước A2: Cài đặt các thư viện cần thiết

```bash
npm install express cors
```

| Thư viện        | Vai trò                                                                   |
| ----------------- | -------------------------------------------------------------------------- |
| **express** | Web framework cho Node.js — giúp tạo API server dễ dàng               |
| **cors**    | Middleware cho phép Frontend (port 5173) gọi được Backend (port 3000) |

> **Tại sao cần `cors`?** Trình duyệt mặc định **chặn** request giữa 2 domain/port khác nhau (gọi là Cross-Origin Resource Sharing policy). Frontend chạy ở `localhost:5173`, backend ở `localhost:3000` → khác port → bị chặn. Middleware `cors()` cho phép backend chấp nhận request từ mọi nguồn.

---

#### Bước A3: Tạo file `app.js`

Tạo file `node-api/app.js` với nội dung sau:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());           // Cho phép React gọi API (khác port)
app.use(express.json());   // Parse JSON từ request body

// API endpoint: trả về mock data
app.get('/api-node/tasks', (req, res) => {
    res.json([
        { id: 1, title: "Mock Task từ NodeJS 1" },
        { id: 2, title: "Mock Task từ NodeJS 2" }
    ]);
});

// Khởi động server
app.listen(3000, () => {
    console.log("NodeJS API đang chạy tại http://localhost:3000");
});
```

> **Giải thích từng phần:**
>
> | Dòng code                          | Ý nghĩa                                                       |
> | ----------------------------------- | --------------------------------------------------------------- |
> | `require('express')`              | Import thư viện Express                                       |
> | `app.use(cors())`                 | Cho phép mọi domain gọi API                                  |
> | `app.use(express.json())`         | Middleware parse JSON request body (cần cho POST/PUT sau này) |
> | `app.get('/api-node/tasks', ...)` | Định nghĩa route GET tại đường dẫn `/api-node/tasks`  |
> | `res.json([...])`                 | Trả về mảng JSON cho client                                  |
> | `app.listen(3000, ...)`           | Khởi động server lắng nghe ở port 3000                     |

> **Lưu ý:** Prefix `/api-node/` được sử dụng xuyên suốt chuỗi lab. Ở các lab sau, Nginx sẽ dùng prefix này để phân biệt request gửi đến NodeJS hay Python backend.

---

#### Bước A4: Chạy và kiểm tra Backend

```bash
node app.js
```

Kết quả mong đợi trên terminal:

```
NodeJS API đang chạy tại http://localhost:3000
```

**Kiểm tra bằng trình duyệt:**

Mở trình duyệt, truy cập: `http://localhost:3000/api-node/tasks`

Kết quả hiển thị:

```json
[
    {"id":1,"title":"Mock Task từ NodeJS 1"},
    {"id":2,"title":"Mock Task từ NodeJS 2"}
]
```

> ✅ Nếu thấy JSON như trên → Backend hoạt động chính xác!
>
> ❌ Nếu lỗi "Cannot GET /" → đừng lo, ta chỉ định nghĩa route `/api-node/tasks`, không có route `/`.

**Giữ terminal này mở** (để backend tiếp tục chạy), mở terminal mới cho bước tiếp theo.

---

### PHẦN B: Tạo React Frontend (Vite)

---

#### Bước B1: Tạo project React với Vite

Mở **terminal mới**, quay lại thư mục `Lab1`:

```bash
cd Lab1
npm create vite@latest frontend -- --template react
```

> **Giải thích:**
>
> - `npm create vite@latest` → chạy tool tạo project Vite
> - `frontend` → tên thư mục project
> - `-- --template react` → sử dụng template ReactJS

---

#### Bước B2: Cài đặt dependencies

```bash
cd frontend
npm install
```

Lệnh này đọc `package.json` và cài tất cả thư viện cần thiết (React, ReactDOM, Vite...).

---

#### Bước B3: Chỉnh sửa file `src/App.jsx`

Mở file `frontend/src/App.jsx`, **xóa toàn bộ nội dung cũ** và thay bằng:

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

> **Giải thích từng phần:**
>
> | Code                                              | Ý nghĩa                                                    |
> | ------------------------------------------------- | ------------------------------------------------------------ |
> | `useState([])`                                  | Khai báo state `nodeTasks` là mảng rỗng ban đầu      |
> | `useEffect(() => {...}, [])`                    | Chạy 1 lần khi component được mount (load lần đầu)   |
> | `fetch('http://localhost:3000/api-node/tasks')` | Gửi HTTP GET request đến NodeJS backend                   |
> | `.then(res => res.json())`                      | Chuyển response thành JavaScript object                    |
> | `.then(data => setNodeTasks(data))`             | Cập nhật state → React tự re-render                      |
> | `.catch(err => console.error(err))`             | Bắt lỗi nếu API không phản hồi                         |
> | `nodeTasks.map(t => <li>...</li>)`              | Duyệt mảng, mỗi phần tử → 1 thẻ `<li>`              |
> | `key={t.id}`                                    | Bắt buộc khi render list — giúp React tối ưu re-render |

---

#### Bước B4: Kiểm tra file `src/main.jsx`

File này đã được Vite tạo sẵn, thường có nội dung:

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

> **Giải thích:** `main.jsx` là entry point — nó mount component `<App />` vào thẻ `<div id="root">` trong `index.html`.

**Không cần chỉnh sửa** file này.

---

#### Bước B5: Chạy Frontend

```bash
npm run dev
```

Kết quả mong đợi:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Mở trình duyệt, truy cập: `http://localhost:5173`

> ✅ Kết quả đúng: Thấy tiêu đề "Task Manager" và danh sách 2 mock tasks
>
> ❌ Nếu danh sách trống: Kiểm tra NodeJS backend có đang chạy ở terminal kia không

---

### PHẦN C: Kiểm tra toàn bộ hệ thống

---

#### Bước C1: Đảm bảo cả 2 server đang chạy

| Terminal   | Service        | Lệnh                          | Port |
| ---------- | -------------- | ------------------------------ | ---- |
| Terminal 1 | NodeJS Backend | `cd node-api && node app.js` | 3000 |
| Terminal 2 | React Frontend | `cd frontend && npm run dev` | 5173 |

---

#### Bước C2: Kiểm tra Backend

Mở trình duyệt → `http://localhost:3000/api-node/tasks`

✅ Kết quả đúng:

```json
[
    {"id":1,"title":"Mock Task từ NodeJS 1"},
    {"id":2,"title":"Mock Task từ NodeJS 2"}
]
```

---

#### Bước C3: Kiểm tra Frontend

Mở trình duyệt → `http://localhost:5173`

✅ Kết quả đúng:

- Tiêu đề **"Task Manager"**
- Phần **"Dữ liệu từ NodeJS API:"**
- 2 bullet points với mock tasks

---

#### Bước C4: Kiểm tra Network (Developer Tools)

1. Nhấn **F12** (hoặc chuột phải → Inspect) để mở Developer Tools
2. Chuyển sang tab **Network**
3. Refresh trang (F5)
4. Tìm request `tasks` trong danh sách
5. Click vào request → xem tab **Response** → thấy JSON data

> Đây là cách kiểm tra Frontend đang gọi đúng API endpoint.

---

## 8. Nhiệm vụ thực hành (Bài tập)

### Mức 1 — Cơ bản (Bắt buộc)

| # | Nhiệm vụ                                                               | Gợi ý                               |
| - | ------------------------------------------------------------------------ | ------------------------------------- |
| 1 | Tạo NodeJS API server với Express                                      | Theo hướng dẫn Phần A             |
| 2 | Tạo endpoint `GET /api-node/tasks` trả mock data (ít nhất 3 tasks) | Thêm object vào mảng JSON          |
| 3 | Tạo React Frontend với Vite                                            | Theo hướng dẫn Phần B             |
| 4 | Sử dụng `useState` và `useEffect` để gọi API                   | Xem giải thích ở Bước B3         |
| 5 | Hiển thị danh sách task trên giao diện                              | Dùng `.map()` để render `<li>` |

### Mức 2 — Nâng cao (Tùy chọn)

| #  | Nhiệm vụ                                                                  | Gợi ý                                      |
| -- | --------------------------------------------------------------------------- | -------------------------------------------- |
| 6  | Thêm trường `status` vào mock data (pending/done)                     | Thêm `status: "pending"` vào mỗi object |
| 7  | Hiển thị status bên cạnh title trên giao diện                         | `{t.title} - {t.status}`                   |
| 8  | Thêm style: task "done" có màu xanh, "pending" có màu cam              | Dùng inline `style` với điều kiện     |
| 9  | Hiển thị tổng số task ở đầu trang                                    | `<p>Tổng: {nodeTasks.length} tasks</p>`   |
| 10 | Tách component `TaskList` ra file riêng `src/components/TaskList.jsx` | Tạo component nhận props `tasks`         |

### Mức 3 — Thử thách (Bonus)

| #  | Nhiệm vụ                                                     | Gợi ý                                     |
| -- | -------------------------------------------------------------- | ------------------------------------------- |
| 11 | Thêm endpoint `GET /api-node/tasks/:id` trả 1 task theo ID | `req.params.id` + `Array.find()`        |
| 12 | Thêm endpoint `POST /api-node/tasks` nhận task mới        | `req.body` + `Array.push()`             |
| 13 | Tạo form trên React để thêm task mới và gọi POST API   | `<input>` + `<button>` + `fetch POST` |

---

## 9. Lỗi thường gặp và cách khắc phục

### Lỗi 1: React hiển thị danh sách trống

| Nguyên nhân              | Cách khắc phục                                      |
| -------------------------- | ------------------------------------------------------ |
| NodeJS backend chưa chạy | Mở terminal →`cd node-api && node app.js`          |
| Sai URL trong `fetch()`  | Kiểm tra URL:`http://localhost:3000/api-node/tasks` |
| Backend bị CORS chặn     | Đảm bảo có `app.use(cors())` trong `app.js`    |

### Lỗi 2: `TypeError: nodeTasks.map is not a function`

| Nguyên nhân                              | Cách khắc phục                                    |
| ------------------------------------------ | ---------------------------------------------------- |
| `useState` không khởi tạo mảng rỗng | Sửa:`useState([])` thay vì `useState()`        |
| API trả về không phải mảng            | Kiểm tra `res.json([...])` có phải mảng không |

### Lỗi 3: `Error: listen EADDRINUSE :::3000`

| Nguyên nhân              | Cách khắc phục                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| Port 3000 đang bị chiếm | Tắt process cũ:**Windows:** `taskkill /F /PID <PID>`, hoặc đổi port trong `app.js` |

### Lỗi 4: `npm create vite@latest` không chạy

| Nguyên nhân                | Cách khắc phục                   |
| ---------------------------- | ----------------------------------- |
| Node.js phiên bản quá cũ | Cập nhật Node.js lên v18+        |
| npm chưa cập nhật         | Chạy `npm install -g npm@latest` |

### Lỗi 5: CORS error trong Console

```
Access to fetch at 'http://localhost:3000/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

| Nguyên nhân              | Cách khắc phục                                        |
| -------------------------- | -------------------------------------------------------- |
| Thiếu middleware CORS     | Thêm `const cors = require('cors'); app.use(cors());` |
| Chưa cài thư viện cors | Chạy `npm install cors`                               |

---

## 10. Câu hỏi thảo luận

Trả lời các câu hỏi sau (ghi vào báo cáo hoặc thảo luận trên lớp):

1. **Vì sao React không truy cập database trực tiếp** mà phải gọi qua Backend API?
2. **Vai trò của `useEffect(() => {...}, [])`** là gì? Tại sao dependency array `[]` rỗng?
3. **Middleware `cors()`** giải quyết vấn đề gì? Điều gì xảy ra nếu không dùng nó?
4. **Middleware `express.json()`** dùng để làm gì? Khi nào cần thiết?
5. **Tại sao `key` là bắt buộc** khi render list trong React? Nếu không có `key` thì sao?
6. Hãy mô tả **luồng dữ liệu** từ khi người dùng mở trình duyệt đến khi nhìn thấy danh sách task.
7. Trong bài lab này chúng ta dùng **mock data**. Theo bạn, **ưu và nhược điểm** của mock data là gì?

### Đáp án tóm tắt:

| # | Câu hỏi                 | Ý chính                                                                                                                                 |
| - | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | React không truy cập DB | **Security**: React chạy trên browser, lộ thông tin DB; cần backend xử lý validation, authorization                          |
| 2 | `useEffect([], [])`     | Chạy**1 lần** khi component mount — giống `componentDidMount`                                                                 |
| 3 | `cors()`                | Cho phép**cross-origin request** giữa 2 port khác nhau (5173 → 3000)                                                            |
| 4 | `express.json()`        | **Parse JSON** từ request body để `req.body` có giá trị (cần cho POST/PUT)                                                 |
| 5 | `key` bắt buộc        | Giúp React**diff list hiệu quả**, chỉ re-render phần tử thay đổi                                                            |
| 6 | Luồng dữ liệu          | Browser → React →`fetch()` → Express → JSON → React `setState` → Re-render                                                      |
| 7 | Mock data                 | **Ưu**: dev nhanh, frontend/backend phát triển song song. **Nhược**: không phản ánh thực tế, không test được DB |

---

## 11. Tiêu chí chấm điểm gợi ý

### Tổng: 10 điểm

| Tiêu chí                                                      | Điểm      | Chi tiết                                                         |
| --------------------------------------------------------------- | ----------- | ----------------------------------------------------------------- |
| **Backend Express chạy được**                         | 2.0         | Server start thành công, không lỗi                            |
| **API `GET /api-node/tasks` trả JSON đúng**          | 2.0         | Trả mảng JSON có ít nhất 2 objects với `id` và `title` |
| **Frontend React chạy được**                          | 1.5         | Vite dev server start, trang load không lỗi                     |
| **Frontend hiển thị danh sách task từ API**           | 2.0         | Gọi fetch thành công, render đúng dữ liệu                  |
| **Sử dụng đúng `useState`, `useEffect`, `key`** | 1.5         | Đúng syntax, đúng logic                                       |
| **Code rõ ràng, chạy ổn định**                      | 1.0         | Không lỗi console, code dễ đọc                               |
| **Bonus: Bài tập mức 2-3**                             | +1.0 ~ +2.0 | Mỗi bài tập nâng cao thêm điểm cộng                       |

---

## 12. Hướng dẫn nộp bài

1. **Chụp ảnh màn hình** (screenshots):

   - Terminal chạy NodeJS backend
   - Trình duyệt hiển thị API response (`localhost:3000/api-node/tasks`)
   - Trình duyệt hiển thị React frontend (`localhost:5173`)
   - Tab Network trong Developer Tools (thấy request API)
2. **Nén source code** thư mục `Lab1/` (bỏ thư mục `node_modules/`)
3. **Trả lời câu hỏi thảo luận** (mục 10)

---

## 13. Tổng kết và chuẩn bị Lab 2

### Những gì đã làm trong Lab 1:

- ✅ Tạo NodeJS API server trả mock data
- ✅ Tạo React Frontend hiển thị data từ API
- ✅ Hiểu luồng Frontend → Backend → Response

### Chuẩn bị cho Lab 2:

Trong **Lab 2**, bạn sẽ:

- Tạo thêm một **Python Backend** (FastAPI) cũng trả mock data
- Cập nhật Frontend hiển thị dữ liệu từ **cả 2 backend** (NodeJS + Python)
- Bắt đầu thấy ý tưởng **microservices**: nhiều backend phục vụ 1 frontend

### Sơ đồ tiến trình:

```
Lab 1 ──► Lab 2 ──► Lab 3 ──► Lab 4 ──► Lab 5 ──► Lab 6 ──► Lab 7
React     +Python   MySQL     Connect   Docker-   Docker    Micro-
+NodeJS   Backend   +phpMyAdmin  DB      file     Compose   services
(Mock)    (Mock)    (Docker)   (Real     (Package) (Run All) (Complete
                               Data)                         +Hub)
```

---

## Phụ lục: Giải thích các khái niệm chính

### A. Express.js là gì?

**Express** là web framework phổ biến nhất cho Node.js. Nó giúp tạo HTTP server, định nghĩa routes (đường dẫn API), và xử lý request/response một cách gọn gàng.

### B. React Hook: `useState`

```jsx
const [nodeTasks, setNodeTasks] = useState([]);
//     ^^^^^^^^   ^^^^^^^^^^^^          ^^
//     giá trị    hàm cập nhật      giá trị ban đầu
```

- `nodeTasks`: biến chứa giá trị state hiện tại
- `setNodeTasks`: hàm dùng để cập nhật state → khi gọi, React tự re-render component

### C. React Hook: `useEffect`

```jsx
useEffect(() => {
    // Code chạy sau khi component render
    fetch(...)
}, []);   // [] = chỉ chạy 1 lần khi mount
```

- Tham số 1: callback function chứa logic cần thực thi
- Tham số 2: dependency array — `[]` rỗng = chạy 1 lần duy nhất khi component load

### D. Fetch API

```jsx
fetch('http://localhost:3000/api-node/tasks')   // Gửi GET request
    .then(res => res.json())                     // Parse JSON response
    .then(data => setNodeTasks(data))            // Cập nhật state
    .catch(err => console.error(err));           // Xử lý lỗi
```

`fetch()` là API có sẵn trong trình duyệt, dùng để gửi HTTP request mà không cần thư viện bên ngoài.

### E. Mock Data là gì?

**Mock Data** = dữ liệu giả, được hardcode trực tiếp trong code backend thay vì lấy từ database. Dùng trong giai đoạn phát triển ban đầu để:

- Frontend và Backend phát triển **song song** (không phụ thuộc DB)
- Kiểm tra giao diện nhanh
- Sau này (Lab 4) sẽ thay bằng dữ liệu thật từ MySQL
