Dưới đây là giải thích chi tiết cho từng câu hỏi trong bối cảnh **React + FastAPI + MySQL + Docker**.

---

# 1️⃣ Vì sao FastAPI phù hợp để xây dựng REST API?

**FastAPI** là framework Python hiện đại được thiết kế đặc biệt cho **REST API**.

## Các lý do chính

### 1. Hiệu năng rất cao

FastAPI sử dụng:

* **ASGI**
* **async / await**

→ xử lý request **non-blocking**

Hiệu năng gần với **NodeJS / Go**.

---

### 2. Tự động sinh API documentation

FastAPI tự sinh:

```text
Swagger UI
Redoc
```

Ví dụ:

```text
http://localhost:8000/docs
```

Sinh viên hoặc developer có thể **test API trực tiếp trên browser**.

---

### 3. Validation dữ liệu tự động

FastAPI dùng **Pydantic**.

Ví dụ:

```python
from pydantic import BaseModel

class Task(BaseModel):
    title: str
    status: str
```

Nếu request sai format:

```json
{
 "title": 123
}
```

→ FastAPI trả lỗi ngay.

---

### 4. Code ngắn gọn và dễ đọc

Ví dụ endpoint:

```python
@app.get("/tasks")
def get_tasks():
    return db.query(Task).all()
```

---

# 2️⃣ Vai trò của `uvicorn` là gì?

`uvicorn` là **ASGI server**.

Nó có nhiệm vụ:

```text
Run Python web application
```

---

## Kiến trúc

```text
Client (Browser)
        ↓
Uvicorn
        ↓
FastAPI Application
        ↓
Database
```

---

## Ví dụ chạy server

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Giải thích:

| Thành phần | Ý nghĩa                     |
| ---------- | --------------------------- |
| main       | file main.py                |
| app        | biến FastAPI                |
| host       | cho phép container truy cập |
| port       | cổng server                 |

---

# 3️⃣ SQLAlchemy giúp gì so với viết SQL raw?

**SQLAlchemy** là ORM (Object Relational Mapping).

Nó cho phép **làm việc với database bằng Python object**.

---

## SQL raw

```sql
SELECT * FROM users WHERE id = 1
```

---

## SQLAlchemy

```python
db.query(User).filter(User.id == 1).first()
```

---

## Lợi ích

### 1. Code dễ đọc

SQL:

```sql
JOIN users tasks status
```

ORM:

```python
user.tasks
```

---

### 2. Tránh SQL Injection

SQL raw dễ bị:

```sql
SELECT * FROM users WHERE name = ' " OR 1=1
```

ORM tự escape input.

---

### 3. Database portable

Code ORM có thể chạy trên:

* MySQL
* PostgreSQL
* SQLite

---

### 4. Mapping object

Table:

```text
users
```

Python class:

```python
class User(Base):
```

---

# 4️⃣ Vì sao không nên hardcode DB credentials?

Ví dụ sai:

```python
DB_USER = "root"
DB_PASSWORD = "123456"
```

---

## Các vấn đề

### 1. Security risk

Nếu code push lên GitHub:

```text
password lộ
```

---

### 2. Khó deploy

Dev environment:

```text
localhost
```

Production:

```text
aws-rds
```

---

### 3. Không linh hoạt

Nếu đổi DB password phải:

```text
edit code
rebuild app
```

---

## Cách đúng

Dùng **environment variables**

```python
DB_HOST = os.getenv("DB_HOST")
```

---

Ví dụ Docker:

```yaml
environment:
 DB_HOST: mysql
 DB_USER: root
 DB_PASSWORD: root
```

---

# 5️⃣ Trong Docker, tại sao `DB_HOST` phải là `mysql` thay vì `localhost`?

Trong Docker Compose:

```yaml
services:
  mysql:
  node-api:
```

Docker tự tạo **network nội bộ**.

---

## Container communication

Service name = hostname

```text
mysql
node-api
python-api
```

---

## Ví dụ kết nối DB

```text
DB_HOST=mysql
```

---

## Nếu dùng localhost

```text
localhost = container itself
```

Node container sẽ cố kết nối:

```text
node-api → node-api
```

không phải MySQL.

---

## Kiến trúc

```text
Node Container
     ↓
mysql (service name)
     ↓
MySQL Container
```

---

# 6️⃣ Điều gì xảy ra nếu MySQL container bị xóa nhưng không có volume?

MySQL lưu data trong:

```text
/var/lib/mysql
```

Nếu container bị xóa:

```bash
docker rm mysql
```

→ **toàn bộ database bị mất**

---

## Vì container filesystem là ephemeral

```text
Container deleted
      ↓
filesystem deleted
```

---

## Cách đúng

Dùng **Docker volume**

```yaml
volumes:
 - mysql_data:/var/lib/mysql
```

---

## Lợi ích

Data lưu trong:

```text
Docker volume
```

Ngay cả khi container bị xóa:

```text
data vẫn còn
```

---

# 7️⃣ Vì sao frontend không nên truy cập DB trực tiếp?

Frontend chạy trên **browser của user**.

---

## Nếu truy cập DB trực tiếp

```text
React → MySQL
```

---

### ❌ 1. Security

User có thể:

* xem DB password
* query database

---

### ❌ 2. Không có validation

Backend thường xử lý:

* validate dữ liệu
* business logic
* authorization

---

### ❌ 3. Không kiểm soát query

User có thể gửi query nguy hiểm:

```sql
DROP TABLE users
```

---

## Kiến trúc đúng

```text
React
   ↓
API
   ↓
Database
```

---

## Flow dữ liệu

```text
User click button
       ↓
React send request
       ↓
Backend API
       ↓
Business logic
       ↓
Database query
       ↓
JSON response
       ↓
React update UI
```

---

# 📊 Tóm tắt nhanh

| Câu hỏi              | Ý chính                       |
| -------------------- | ----------------------------- |
| FastAPI              | nhanh, async, auto docs       |
| uvicorn              | ASGI server chạy FastAPI      |
| SQLAlchemy           | ORM giúp code dễ và an toàn   |
| hardcode DB          | security risk                 |
| DB_HOST=mysql        | Docker service name           |
| không có volume      | mất toàn bộ data              |
| frontend truy cập DB | vi phạm security architecture |

---

Nếu bạn muốn, tôi có thể tiếp tục tạo thêm **20 câu hỏi dạng interview / exam cho sinh viên** dựa trên **React + FastAPI + Docker** (rất phù hợp dùng làm **quiz cuối bài hoặc phỏng vấn DevOps/Web**).
