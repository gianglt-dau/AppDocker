const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Cho phép React gọi API ở chế độ dev
app.use(express.json());

// Trả về Mock Data
app.get('/api-node/tasks', (req, res) => {
    res.json([
        { id: 1, title: "Mock Task từ NodeJS 1" },
        { id: 2, title: "Mock Task từ NodeJS 2" }
    ]);
});

app.listen(3000, () => {
    console.log("NodeJS API đang chạy tại http://localhost:3000");
});
