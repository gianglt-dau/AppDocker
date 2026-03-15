# Bài lab: Xây dựng REST API với FastAPI kết nối MySQL

## 1) Tên bài lab

**Lab 05–06: Python Backend với FastAPI và MySQL Database**

## 2) Mục tiêu bài lab

Sau khi hoàn thành bài lab, người học có thể:

* Cài đặt và khởi tạo một project backend bằng **FastAPI**
* Tạo API cơ bản với các route **GET** và **POST**
* Kết nối ứng dụng Python với **MySQL** thông qua **SQLAlchemy** và **PyMySQL**
* Tách project theo cấu trúc rõ ràng: `main.py`, `database.py`, `models.py`, `routes/`
* Sử dụng **environment variables** để quản lý thông tin kết nối DB
* Kiểm thử API bằng **Swagger UI**
* Hiểu luồng kiến trúc: **Frontend → Backend API → Database**
* Nhận diện và xử lý các lỗi DB thường gặp trước khi chuyển sang containerization bằng Docker 

---

## 3) Kiến thức nền tảng từ tài liệu

Bài lab này dựa trên các nội dung chính của file:

* FastAPI được chọn vì dễ viết API, hiệu năng tốt và tự sinh docs
* Cài đặt các gói: `fastapi`, `uvicorn`, `sqlalchemy`, `pymysql`
* Tổ chức project theo cấu trúc rõ ràng
* Dùng `os.getenv()` để đọc biến môi trường
* Kết nối MySQL qua SQLAlchemy
* Truy vấn dữ liệu bảng `tasks`
* Tài liệu API tự sinh tại `/docs`
* Trong môi trường Docker, DB host nên là `mysql`, không phải `localhost`
* Cần volume để tránh mất dữ liệu khi container bị xóa/restart 

---

## 4) Yêu cầu đầu vào

### Phần mềm cần có

* Python 3.10+
* MySQL 8.x
* VS Code hoặc IDE bất kỳ
* Postman hoặc trình duyệt
* pip

### Kiến thức cần có

* Python cơ bản
* HTTP method: GET, POST
* SQL cơ bản
* Khái niệm backend và database

---

## 5) Bối cảnh bài toán

Bạn cần xây dựng một backend Python đơn giản cho hệ thống quản lý công việc (**tasks**). Ứng dụng phải:

* Cung cấp API để lấy danh sách task
* Cho phép thêm task mới
* Lưu dữ liệu trong MySQL
* Có thể mở rộng để chạy trong Docker ở bước tiếp theo

---

## 6) Kết quả mong đợi

Sau bài lab, học viên chạy được:

* `GET /` trả về thông điệp chào
* `GET /tasks` trả về danh sách task từ MySQL
* `POST /tasks` thêm task mới vào DB
* Truy cập được Swagger UI tại `http://localhost:8000/docs`

---

# 7) Cấu trúc thư mục đề xuất

```bash
python-api/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── routes/
│   └── tasks.py
├── .env
└── requirements.txt
```

Cấu trúc này bám sát bố cục project được nêu trong tài liệu, chỉ bổ sung thêm `schemas.py` để viết request/response model rõ ràng hơn khi làm lab thực hành. 

---

# 8) Các bước thực hiện bài lab

## Bước 1: Tạo thư mục project và môi trường ảo

```bash
mkdir python-api
cd python-api

python -m venv venv
```

Kích hoạt môi trường ảo:

**Windows**

```bash
venv\Scripts\activate
```

**macOS/Linux**

```bash
source venv/bin/activate
```

---

## Bước 2: Cài đặt dependencies

Tạo file `requirements.txt`:

```txt
fastapi
uvicorn
sqlalchemy
pymysql
python-dotenv
```

Cài đặt:

```bash
pip install -r requirements.txt
```

Các package này bám theo nội dung file gốc: FastAPI, Uvicorn, SQLAlchemy và PyMySQL. Mình thêm `python-dotenv` để việc đọc `.env` thuận tiện hơn trong quá trình lab. 

---

## Bước 3: Tạo database MySQL và bảng `tasks`

Đăng nhập MySQL:

```sql
CREATE DATABASE appdb;
USE appdb;

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);
```

Chèn dữ liệu mẫu:

```sql
INSERT INTO tasks(title) VALUES ("Learn Docker");
INSERT INTO tasks(title) VALUES ("Build API");
```

Cấu trúc bảng `tasks` này bám đúng ví dụ trong tài liệu. 

---

## Bước 4: Tạo file `.env`

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=appdb
DB_USER=appuser
DB_PASSWORD=app123
```

Nếu bạn đang chạy MySQL local, để `DB_HOST=localhost`.
Nếu chạy bằng Docker Compose sau này, đổi thành:

```env
DB_HOST=mysql
```

Điểm này rất quan trọng vì tài liệu nhấn mạnh trong container network phải dùng **tên service** thay vì `localhost`. 

---

## Bước 5: Tạo file `database.py`

```python
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## Bước 6: Tạo file `models.py`

```python
from sqlalchemy import Column, Integer, String
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
```

Model này ánh xạ class Python sang bảng `tasks`, đúng tinh thần ORM được trình bày trong tài liệu. 

---

## Bước 7: Tạo file `schemas.py`

```python
from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str

class TaskResponse(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True
```

---

## Bước 8: Tạo file route `routes/tasks.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Task
from schemas import TaskCreate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@router.post("/", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    new_task = Task(title=task.title)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task
```

---

## Bước 9: Tạo file `main.py`

```python
from fastapi import FastAPI
from database import Base, engine
from routes.tasks import router as tasks_router

app = FastAPI(title="Python Backend & MySQL Lab")

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Hello FastAPI"}

app.include_router(tasks_router)
```

`main.py` đóng vai trò điểm khởi đầu ứng dụng, giống đúng mô tả trong tài liệu. 

---

## Bước 10: Chạy ứng dụng

```bash
uvicorn main:app --reload
```

Truy cập:

* Root: `http://localhost:8000/`
* Swagger UI: `http://localhost:8000/docs`

Tài liệu gốc cũng nhấn mạnh `--reload` rất hữu ích trong quá trình phát triển và Swagger UI là điểm mạnh nổi bật của FastAPI. 

---

# 9) Kiểm thử bài lab

## Test 1: Kiểm tra endpoint gốc

**Request**

```http
GET /
```

**Expected response**

```json
{
  "message": "Hello FastAPI"
}
```

---

## Test 2: Lấy danh sách tasks

**Request**

```http
GET /tasks/
```

**Expected response**

```json
[
  {
    "id": 1,
    "title": "Learn Docker"
  },
  {
    "id": 2,
    "title": "Build API"
  }
]
```

---

## Test 3: Thêm task mới

**Request**

```http
POST /tasks/
Content-Type: application/json
```

**Body**

```json
{
  "title": "Learn FastAPI"
}
```

**Expected response**

```json
{
  "id": 3,
  "title": "Learn FastAPI"
}
```

---

## Test 4: Kiểm tra lại danh sách

**Request**

```http
GET /tasks/
```

**Expected result**
Task mới vừa thêm xuất hiện trong danh sách.

---

# 10) Câu hỏi thảo luận sau lab

1. Vì sao FastAPI phù hợp để xây dựng REST API?
2. Vai trò của `uvicorn` là gì?
3. SQLAlchemy giúp gì so với viết SQL raw?
4. Vì sao không nên hardcode DB credentials?
5. Trong Docker, tại sao `DB_HOST` phải là `mysql` thay vì `localhost`?
6. Điều gì xảy ra nếu MySQL container bị xóa nhưng không có volume?
7. Vì sao frontend không nên truy cập DB trực tiếp?

Các câu hỏi này đều bám sát các slide về FastAPI, API architecture, DB connection flow, common DB errors và persistent storage. 

---

# 11) Các lỗi thường gặp và cách xử lý

## Lỗi 1: Connection Refused

**Nguyên nhân**

* Sai host
* MySQL chưa chạy
* Sai port

**Khắc phục**

* Nếu local: `DB_HOST=localhost`
* Nếu Docker Compose: `DB_HOST=mysql`
* Kiểm tra MySQL service đang hoạt động

---

## Lỗi 2: Authentication Error

**Nguyên nhân**

* Sai `DB_USER` hoặc `DB_PASSWORD`

**Khắc phục**

* Kiểm tra `.env`
* Đảm bảo user có quyền trên database

---

## Lỗi 3: Table does not exist

**Nguyên nhân**

* Chưa tạo bảng `tasks`

**Khắc phục**

* Chạy script SQL tạo bảng
* Kiểm tra đang kết nối đúng database `appdb`

---

## Lỗi 4: Không thấy dữ liệu sau khi restart container

**Nguyên nhân**

* Không dùng Docker volume

**Khắc phục**

* Mount volume cho MySQL, ví dụ `mysql_data`

Các lỗi này được tài liệu tổng kết khá rõ ở phần cuối. 

---

# 12) Phần mở rộng bài lab

## Mở rộng 1: Thêm endpoint lấy task theo ID

```python
@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

## Mở rộng 2: Thêm endpoint xóa task

```python
@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
```

## Mở rộng 3: Thêm endpoint cập nhật task

```python
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskCreate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.title = payload.title
    db.commit()
    db.refresh(task)
    return task
```

---

# 13) Tiêu chí chấm điểm gợi ý

## Mức đạt

* Chạy được FastAPI server
* Kết nối được MySQL
* `GET /tasks` trả dữ liệu đúng
* `POST /tasks` thêm được dữ liệu

## Mức khá

* Tách project đúng cấu trúc
* Dùng `.env` thay vì hardcode credentials
* Swagger UI hoạt động

## Mức tốt

* Có validate dữ liệu bằng Pydantic
* Có xử lý lỗi 404/DB connection
* Có thêm các route mở rộng: GET by ID / PUT / DELETE

---

# 14) Phiếu giao bài cho học viên

## Yêu cầu

Xây dựng một ứng dụng backend bằng FastAPI kết nối tới MySQL để quản lý danh sách công việc.

## Chức năng tối thiểu

* `GET /`
* `GET /tasks/`
* `POST /tasks/`

## Yêu cầu kỹ thuật

* Dùng FastAPI
* Dùng SQLAlchemy ORM
* Dùng PyMySQL để kết nối MySQL
* Dùng biến môi trường qua `.env`
* Có Swagger docs

## Nộp bài

* Source code project
* Ảnh chụp Swagger UI
* Ảnh kết quả gọi `GET /tasks`
* Ảnh hoặc video chứng minh thêm task thành công

---

# 15) Kết luận bài lab

Bài lab này giúp người học hoàn thiện một backend Python cơ bản nhưng đúng chuẩn thực tế: có cấu trúc project, ORM, kết nối DB, API docs và quản lý cấu hình bằng biến môi trường. Đây chính là bước đệm trực tiếp để chuyển sang phần **containerization với Docker**, như tài liệu đã dẫn dắt ở phần cuối. 

Nếu bạn muốn, mình sẽ chuyển tiếp phần này thành **giáo án lab chuẩn Markdown**, hoặc **bản handout cho học viên + đáp án cho giảng viên**.
