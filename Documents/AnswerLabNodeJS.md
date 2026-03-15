Dưới đây là câu trả lời chi tiết cho từng câu hỏi, theo góc nhìn **kiến trúc web hiện đại (React + API + Database)**.

---

# 1️⃣ Vì sao React không truy cập database trực tiếp?

## Lý do chính: **Security + Architecture**

React chạy **trên trình duyệt của người dùng**, nên nếu cho truy cập DB trực tiếp thì:

### ❌ 1. Lộ thông tin database

Ví dụ nếu frontend kết nối trực tiếp:

```js
mysql.connect({
 host: "db-server",
 user: "root",
 password: "123456"
})
```

→ Người dùng có thể **xem source code → biết password DB**

---

### ❌ 2. Không kiểm soát được dữ liệu

Nếu frontend gọi DB trực tiếp:

```sql
DELETE FROM users
```

Người dùng có thể:

* sửa query
* phá database

---

### ❌ 3. Không có business logic

Backend thường xử lý:

* validation
* authorization
* business rules
* logging

---

### ✔ Kiến trúc đúng

```text
React (Frontend)
       ↓
API (NodeJS / Python)
       ↓
Database (MySQL)
```

Frontend **chỉ gọi API**, không truy cập DB.

---

# 2️⃣ Vai trò của `useEffect(..., [])` là gì?

`useEffect` dùng để **chạy code khi component render**.

---

## Cú pháp

```javascript
useEffect(() => {
  fetchData()
}, [])
```

---

## Ý nghĩa của `[]`

`[]` = **dependency array**

Nếu:

```javascript
useEffect(() => {}, [])
```

→ code **chỉ chạy 1 lần khi component mount**

Giống:

```
componentDidMount() trong class component
```

---

## Ví dụ fetch API

```javascript
useEffect(() => {
 fetch("/api/tasks")
   .then(res => res.json())
   .then(setTasks)
}, [])
```

Luồng:

```
Component mount
      ↓
useEffect chạy
      ↓
fetch API
      ↓
setState
      ↓
UI update
```

---

# 3️⃣ Vì sao nên tách API call sang thư mục `src/api/`?

## Lý do: **Clean architecture**

Thay vì viết API trực tiếp trong component:

❌ Bad

```javascript
useEffect(() => {
 fetch("/api/tasks")
}, [])
```

---

### ✔ Good

```
src
 ├── api
 │    └── tasksApi.js
 ├── components
 └── pages
```

---

### Ví dụ

**src/api/tasksApi.js**

```javascript
export const getTasks = () =>
 fetch("/api-node/tasks").then(res => res.json())
```

Component:

```javascript
useEffect(() => {
 getTasks().then(setTasks)
}, [])
```

---

## Lợi ích

### 1️⃣ Code dễ bảo trì

Nếu API đổi URL

```
/api/tasks
→ /api/v2/tasks
```

Chỉ sửa **1 chỗ**

---

### 2️⃣ Tái sử dụng

Nhiều component dùng chung API.

---

### 3️⃣ Clean code

Component chỉ lo:

```
UI logic
```

API code nằm riêng.

---

# 4️⃣ Middleware `express.json()` dùng để làm gì?

Trong Express:

```javascript
app.use(express.json())
```

---

## Chức năng

Middleware này **parse JSON request body**.

---

## Ví dụ request

Frontend gửi:

```json
POST /tasks

{
 "title": "Learn Docker",
 "status": "todo"
}
```

---

Nếu **không dùng `express.json()`**

```javascript
req.body = undefined
```

---

Nếu **có**

```javascript
req.body = {
 title: "Learn Docker",
 status: "todo"
}
```

---

## Tóm lại

`express.json()`:

```
JSON request
     ↓
Parse
     ↓
req.body usable
```

---

# 5️⃣ `cors()` giải quyết vấn đề gì?

## Vấn đề: **Cross-Origin Resource Sharing**

Trình duyệt **chặn request giữa domain khác nhau**.

---

### Ví dụ

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:3000
```

React gọi:

```javascript
fetch("http://localhost:3000/tasks")
```

Browser chặn:

```
CORS error
```

---

## Cách giải quyết

Express:

```javascript
const cors = require("cors")
app.use(cors())
```

---

## Kết quả

Browser cho phép:

```
frontend → backend
```

---

# 6️⃣ Tại sao `key` là bắt buộc khi render list trong React?

Ví dụ render list:

```javascript
tasks.map(task =>
 <li>{task.title}</li>
)
```

React warning:

```
Each child should have a unique key
```

---

## Vì sao?

React dùng **Virtual DOM diffing**.

Để biết:

```
element nào thay đổi
```

React cần **key**.

---

### Ví dụ

```javascript
tasks.map(task =>
 <li key={task.id}>{task.title}</li>
)
```

---

### Nếu không có key

React:

```
re-render toàn bộ list
```

→ performance kém.

---

### Nếu có key

React:

```
update đúng element thay đổi
```

---

# 7️⃣ Luồng dữ liệu từ frontend đến database

Đây là **flow quan trọng nhất trong web app**.

---

## Flow tổng thể

```text
User
 ↓
React Frontend
 ↓
HTTP Request
 ↓
Backend API (NodeJS / Python)
 ↓
Database Query
 ↓
MySQL
```

---

## Ví dụ tạo task

### 1️⃣ User click button

```
Add Task
```

---

### 2️⃣ React gửi request

```javascript
fetch("/api-node/tasks", {
 method: "POST",
 body: JSON.stringify({
   title: "Learn Docker"
 })
})
```

---

### 3️⃣ Backend nhận request

NodeJS:

```javascript
app.post("/tasks", async (req,res)=>{
 const {title} = req.body
})
```

---

### 4️⃣ Backend query database

```sql
INSERT INTO tasks(title)
VALUES ("Learn Docker")
```

---

### 5️⃣ MySQL lưu dữ liệu

Database update.

---

### 6️⃣ Backend trả response

```json
{
 "success": true
}
```

---

### 7️⃣ React update UI

```
setTasks(...)
```

---

# 📊 Flow hoàn chỉnh

```text
User Action
     ↓
React Component
     ↓
API Call (fetch/axios)
     ↓
Backend API
     ↓
Business Logic
     ↓
Database Query
     ↓
MySQL
     ↓
JSON Response
     ↓
React UI Update
```

---

# 📌 Tóm tắt nhanh

| Câu hỏi                 | Ý chính                       |
| ----------------------- | ----------------------------- |
| React không truy cập DB | Security + architecture       |
| `useEffect([], [])`     | chạy 1 lần khi mount          |
| tách `src/api/`         | clean code + reuse            |
| `express.json()`        | parse JSON request body       |
| `cors()`                | cho phép cross-origin request |
| `key` trong React       | giúp React diff list          |
| data flow               | React → API → DB              |

---

Nếu bạn muốn, tôi có thể làm thêm **1 slide “Frontend–Backend Interview Questions”** (rất hay dùng khi dạy sinh viên hoặc phỏng vấn Dev).
