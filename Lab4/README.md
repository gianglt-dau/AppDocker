# Lab 4: Tích hợp Database vào 2 ứng dụng Backend

## Mục tiêu
- Kết nối NodeJS API với MySQL (dùng mysql2)
- Kết nối Python API với MySQL (dùng SQLAlchemy + PyMySQL)
- Frontend hiển thị dữ liệu thực từ database

## Yêu cầu
- Docker đã cài đặt (để chạy MySQL)
- Node.js, Python đã cài đặt

## Hướng dẫn chạy

### 1. Khởi chạy MySQL
```bash
docker compose -f docker-compose-db.yml up -d
```

### 2. Chạy NodeJS API
```bash
cd node-api
npm install
node app.js
```

### 3. Chạy Python API
```bash
cd python-api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Chạy Frontend React
```bash
cd frontend
npm install
npm run dev
```

### 5. Kiểm tra
- Mở http://localhost:5173
- Dữ liệu giờ đây được lấy từ database MySQL thay vì mock data
