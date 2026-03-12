# Lab 2: Xây dựng Backend Python (FastAPI) & Tích hợp vào ReactJS

## Mục tiêu
- Tạo API Python (FastAPI) trả về dữ liệu giả (mock data)
- Cập nhật Frontend ReactJS gọi cả 2 API (NodeJS + Python)

## Hướng dẫn chạy

### 1. Chạy NodeJS API
```bash
cd node-api
npm install
node app.js
```
API sẽ chạy tại: http://localhost:3000

### 2. Chạy Python API
```bash
cd python-api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API sẽ chạy tại: http://localhost:8000

### 3. Chạy Frontend React
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy tại: http://localhost:5173

### 4. Kiểm tra
- Mở trình duyệt tại http://localhost:5173
- Bạn sẽ thấy danh sách task từ cả NodeJS API và Python API
