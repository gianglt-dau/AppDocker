-- ==================== BẢNG USERS ====================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member'
);

-- ==================== BẢNG TASKS ====================
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to INT,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== DỮ LIỆU MẪU ====================

-- Users
INSERT INTO users (name, email, role) VALUES
('Nguyễn Văn A', 'nguyenvana@email.com', 'admin'),
('Trần Thị B', 'tranthib@email.com', 'manager'),
('Lê Văn C', 'levanc@email.com', 'member'),
('Phạm Thị D', 'phamthid@email.com', 'member'),
('Hoàng Văn E', 'hoangvane@email.com', 'member');

-- Tasks (gán cho users)
INSERT INTO tasks (title, status, assigned_to) VALUES
('Thiết kế giao diện Dashboard', 'done', 1),
('Viết API quản lý Users', 'done', 2),
('Tích hợp Database MySQL', 'in_progress', 1),
('Viết Dockerfile cho Backend', 'in_progress', 3),
('Deploy lên Docker Hub', 'pending', 2),
('Viết tài liệu hướng dẫn', 'pending', 4),
('Test API endpoints', 'in_progress', 5),
('Cấu hình Nginx reverse proxy', 'done', 3);
