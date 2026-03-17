# Hướng dẫn cấu hình Python & MySQL chuẩn cho Lab 3 đến Lab 7

## 1. Cấu hình MySQL (docker-compose)
- Dùng MySQL 8, charset/collation utf8mb4:
```yaml
services:
  mysql:
    image: mysql:8
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: appdb
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
```

## 2. File init.sql
- Đầu file phải có:
```sql
SET NAMES 'utf8mb4';
CREATE DATABASE IF NOT EXISTS appdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE appdb;
```
- Bảng/cột:
```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 3. Xóa volume khi cần reset DB
```sh
docker compose down -v
docker compose up -d
```

## 4. Cấu hình Python API
- requirements.txt:
```
fastapi
uvicorn
sqlalchemy
pymysql
```
- Dockerfile:
```
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
- Biến môi trường:
```
DATABASE_URL: mysql+pymysql://root:root@mysql/appdb
```
- Kết nối MySQL nên có retry (chờ DB khởi động).

## 5. Cấu hình phpMyAdmin
- Dùng đúng host, port, charset.
- Đảm bảo truy vấn với utf8mb4.

## 6. Kiểm tra encoding file SQL
- File init.sql phải lưu với UTF-8 (không BOM).

## 7. Kiểm tra charset/collation trong MySQL
```sh
docker exec -it <container_mysql> mysql -uroot -proot
SHOW VARIABLES LIKE 'char%';
SHOW VARIABLES LIKE 'collation%';
```

---
Áp dụng các cấu hình này cho tất cả các lab từ Lab3 đến Lab7 để đảm bảo Python API và MySQL hoạt động tốt, hỗ trợ tiếng Việt đầy đủ.