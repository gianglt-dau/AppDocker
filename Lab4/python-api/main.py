from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker
import os
import time

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DATABASE_URL = os.environ.get("DATABASE_URL", "mysql+pymysql://root:root@127.0.0.1/appdb")

engine = None
SessionLocal = None
Base = declarative_base()

def connect_db():
    global engine, SessionLocal
    for i in range(10):
        try:
            engine = create_engine(DATABASE_URL)
            engine.connect()
            SessionLocal = sessionmaker(bind=engine)
            print("Kết nối MySQL thành công!")
            return
        except Exception as e:
            print(f"Chờ MySQL... ({i+1}/10): {e}")
            time.sleep(3)
    raise Exception("Không thể kết nối MySQL!")

connect_db()

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
