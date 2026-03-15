# PHẦN 1 — CÂU HỎI CƠ BẢN (Fundamental)

### 1️⃣ React dùng để làm gì trong kiến trúc web?

**Đáp án mong đợi**

React dùng để:

* xây dựng **User Interface**
* hiển thị dữ liệu từ API
* gửi request tới backend

---

### 2️⃣ Sự khác nhau giữa Frontend và Backend là gì?

**Frontend**

* chạy trên browser
* hiển thị UI

**Backend**

* xử lý logic
* truy cập database
* cung cấp API

---

### 3️⃣ REST API là gì?

REST API là **kiến trúc giao tiếp giữa client và server qua HTTP**.

Ví dụ:

```
GET /tasks
POST /tasks
PUT /tasks/1
DELETE /tasks/1
```

---

### 4️⃣ Trong React, `useState` dùng để làm gì?

`useState` dùng để:

* lưu trữ state
* trigger re-render

Ví dụ

```javascript
const [tasks, setTasks] = useState([])
```

---

### 5️⃣ `useEffect()` thường dùng khi nào?

Dùng cho:

* gọi API
* side effects
* lifecycle logic

Ví dụ

```javascript
useEffect(() => {
 fetchTasks()
}, [])
```

---

# PHẦN 2 — KIẾN TRÚC HỆ THỐNG

### 6️⃣ Vì sao nên dùng kiến trúc Microservices?

Ưu điểm

* dễ scale
* dễ deploy
* service độc lập
* dễ maintain

---

### 7️⃣ Vai trò của API trong hệ thống là gì?

API là **bridge giữa frontend và database**.

Luồng:

```
React → API → Database
```

---

### 8️⃣ Tại sao không cho React truy cập database trực tiếp?

Lý do

* security
* business logic
* validation
* database protection

---

### 9️⃣ Luồng request từ frontend đến database diễn ra như thế nào?

Flow

```
User
 ↓
React
 ↓
HTTP request
 ↓
FastAPI / Node API
 ↓
Database
 ↓
Response JSON
 ↓
React render
```

---

### 🔟 Tại sao backend nên validate dữ liệu?

Để tránh:

* dữ liệu sai
* injection
* lỗi hệ thống

Ví dụ

```
email không hợp lệ
password quá ngắn
```

---

# PHẦN 3 — FASTAPI & BACKEND

### 1️⃣1️⃣ FastAPI khác Flask ở điểm nào?

FastAPI:

* async
* auto docs
* validation built-in
* nhanh hơn

---

### 1️⃣2️⃣ Swagger UI trong FastAPI dùng để làm gì?

Swagger UI giúp:

* test API
* xem documentation
* debug request

URL

```
/docs
```

---

### 1️⃣3️⃣ ORM là gì?

ORM = Object Relational Mapping

Giúp map:

```
table ↔ python object
```

Ví dụ

```
users table
```

↔

```python
class User
```

---

### 1️⃣4️⃣ SQL Injection là gì?

SQL Injection là tấn công bằng cách chèn SQL độc hại.

Ví dụ

```
' OR 1=1
```

---

### 1️⃣5️⃣ Tại sao nên dùng SQLAlchemy thay vì SQL raw?

Lợi ích

* tránh injection
* code dễ đọc
* portable database

---

# PHẦN 4 — DOCKER & DEVOPS

### 1️⃣6️⃣ Docker là gì?

Docker là nền tảng **container hóa ứng dụng**.

Giúp:

* chạy app mọi môi trường
* isolate dependency

---

### 1️⃣7️⃣ Docker Image và Container khác nhau thế nào?

Image

```
template
```

Container

```
instance của image
```

---

### 1️⃣8️⃣ Docker Compose dùng để làm gì?

Docker Compose dùng để **quản lý nhiều container cùng lúc**.

Ví dụ

```
frontend
backend
database
```

---

### 1️⃣9️⃣ Vì sao MySQL container cần volume?

Nếu không có volume

```
container delete
↓
data mất
```

Volume giúp **persist data**.

---

### 2️⃣0️⃣ Trong Docker Compose, vì sao `DB_HOST=mysql`?

Docker network dùng **service name làm hostname**.

```
node-api → mysql
```

không dùng `localhost`.

---

# BONUS — CÂU HỎI NÂNG CAO

### 🚀 Khi hệ thống có 1 triệu user, bạn scale thế nào?

Sinh viên có thể trả lời:

* load balancer
* horizontal scaling
* cache (Redis)
* database replication
* container orchestration (Kubernetes)

---

# Gợi ý cách dùng bộ câu hỏi

Bạn có thể dùng làm:

### Quiz 10 phút

chọn 5 câu

---

### Midterm

10 câu

---

### Final

20 câu + 1 case study

---

Nế