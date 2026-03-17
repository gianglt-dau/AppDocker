# Hướng dẫn sửa lỗi tiếng Việt trong MySQL (Docker, phpMyAdmin)

## Triệu chứng
- Dữ liệu tiếng Việt bị lỗi, hiển thị ký tự lạ (�, ?).
- Dù đã dùng MySQL 8, bảng và cột khai báo utf8mb4, vẫn lỗi.

## Nguyên nhân
- MySQL server, database, table, cột hoặc client chưa đồng nhất dùng UTF-8 (utf8mb4).
- File init.sql không lưu đúng encoding UTF-8.
- Client (phpMyAdmin, ứng dụng) không gửi truy vấn với charset đúng.
- Volume MySQL cũ không bị xóa, script init.sql không chạy lại.

## Giải pháp tổng thể

### 1. Cấu hình MySQL server dùng utf8mb4
Trong file `docker-compose-db.yml`:
```yaml
services:
  mysql:
    image: mysql:8
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: appdb2
    ...
```

### 2. File init.sql phải lưu đúng UTF-8
- Mở file bằng VS Code, chọn "Save with Encoding" → "UTF-8" (không BOM).

### 3. Script SQL ép client/server dùng utf8mb4
Đầu file `init.sql`:
```sql
SET NAMES 'utf8mb4';
CREATE DATABASE IF NOT EXISTS appdb2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE appdb2;
-- Tạo bảng, insert...
```

### 4. Xóa volume MySQL cũ để script chạy lại
Chạy lệnh:
```sh
docker compose -f docker-compose-db.yml down -v
docker compose -f docker-compose-db.yml up -d
```

### 5. Kiểm tra lại bằng phpMyAdmin
- Đăng nhập, chọn database mới (`appdb2`).
- Kiểm tra bảng, dữ liệu tiếng Việt phải hiển thị đúng.

### 6. Kiểm tra charset/collation trong MySQL
Vào container:
```sh
docker exec -it lab3-mysql-1 mysql -uroot -proot
SHOW VARIABLES LIKE 'char%';
SHOW VARIABLES LIKE 'collation%';
```

## Kết luận
- Đảm bảo mọi nơi đều dùng utf8mb4: server, database, table, cột, client, file SQL.
- Nếu vẫn lỗi, kiểm tra lại encoding file, xóa volume, khởi động lại container.

---
Tài liệu này giúp bạn xử lý triệt để lỗi tiếng Việt trong MySQL khi dùng Docker và phpMyAdmin.