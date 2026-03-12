CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255)
);
INSERT INTO tasks (title) VALUES ('Học CI/CD'), ('Triển khai Docker');
