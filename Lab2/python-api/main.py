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
