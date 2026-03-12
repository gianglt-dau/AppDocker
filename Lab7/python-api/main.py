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
