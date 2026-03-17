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

#### Tăng cường: Sử dụng Môi trường ảo (Virtual Environment)
Nếu lệnh `uvicorn` không được nhận diện, hãy làm theo các bước sau để thiết lập môi trường ảo:

1. **Tạo và kích hoạt môi trường ảo (nếu chưa có):**
   ```powershell
   # Tại thư mục gốc Lab2
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   ```

2. **Cài đặt thư viện:**
   ```powershell
   cd python-api
   pip install -r requirements.txt
   ```

3. **Chạy API:**
   ```powershell
   uvicorn main:app --reload --port 8000
   ```
   *Lưu ý: Nếu vẫn lỗi, thử dùng `python -m uvicorn main:app --reload --port 8000`*

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
