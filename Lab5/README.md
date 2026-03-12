# Lab 5: Đóng gói vào Docker (Dockerfile)

## Mục tiêu
- Viết Dockerfile cho NodeJS API
- Viết Dockerfile cho Python API
- Viết Dockerfile multi-stage cho React (build + Nginx)
- Cấu hình Nginx làm reverse proxy

## Cấu trúc
```
Lab5/
├── node-api/
│   ├── app.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── python-api/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   └── App.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── nginx.conf
    ├── Dockerfile
    └── .dockerignore
```

## Lưu ý quan trọng
- Frontend `App.jsx` sử dụng relative path (`/api-node/tasks`) thay vì `http://localhost:3000/api-node/tasks`
- `nginx.conf` đóng vai trò reverse proxy, chuyển tiếp request đến đúng backend service
- Backend đọc DB host từ biến môi trường (`DB_HOST`, `DATABASE_URL`)

## Build Docker images
```bash
docker build -t node-api ./node-api
docker build -t python-api ./python-api
docker build -t frontend ./frontend
```
