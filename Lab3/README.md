# Lab 3: Cài đặt, quản lý MySQL bằng phpMyAdmin

## Mục tiêu
- Sử dụng Docker Compose để chạy MySQL và phpMyAdmin
- Tạo bảng và insert dữ liệu mẫu

## Yêu cầu
- Docker & Docker Compose đã được cài đặt

## Hướng dẫn chạy

### 1. Khởi chạy MySQL + phpMyAdmin
```bash
docker compose -f docker-compose-db.yml up -d
```

### 2. Truy cập phpMyAdmin
- Mở trình duyệt: http://localhost:8080
- Đăng nhập: user `root` / password `root`
- Chọn database `appdb`

### 3. Kiểm tra dữ liệu
- File `init.sql` đã tự động tạo bảng `tasks` và insert 2 dòng dữ liệu
- Bạn cũng có thể chạy SQL thủ công trong phpMyAdmin:

```sql
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255)
);
INSERT INTO tasks (title) VALUES ('Học CI/CD'), ('Triển khai Docker');
```

### 4. Tắt services
```bash
docker compose -f docker-compose-db.yml down
```
