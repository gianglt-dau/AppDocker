const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();

app.use(cors());
app.use(express.json());

// Kết nối MySQL với retry (chờ DB sẵn sàng trong Docker)
let db;
async function connectDB() {
    const maxRetries = 10;
    for (let i = 0; i < maxRetries; i++) {
        try {
            db = await mysql.createConnection({
                host: process.env.DB_HOST || "127.0.0.1",
                user: "root",
                password: "root",
                database: "appdb"
            });
            console.log("✅ Kết nối MySQL thành công!");
            return;
        } catch (err) {
            console.log(`⏳ Chờ MySQL... (${i + 1}/${maxRetries})`);
            await new Promise(r => setTimeout(r, 3000));
        }
    }
    console.error("❌ Không thể kết nối MySQL!");
    process.exit(1);
}

// ===================== TASKS CRUD =====================

// GET - Lấy tất cả tasks
app.get('/api-node/tasks', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tasks ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET - Lấy 1 task theo ID
app.get('/api-node/tasks/:id', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Tạo task mới
app.post('/api-node/tasks', async (req, res) => {
    try {
        const { title, assigned_to } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });
        const [result] = await db.query(
            "INSERT INTO tasks (title, assigned_to, status) VALUES (?, ?, 'pending')",
            [title, assigned_to || null]
        );
        res.status(201).json({ id: result.insertId, title, assigned_to, status: 'pending' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - Cập nhật task
app.put('/api-node/tasks/:id', async (req, res) => {
    try {
        const { title, status, assigned_to } = req.body;
        await db.query(
            "UPDATE tasks SET title = COALESCE(?, title), status = COALESCE(?, status), assigned_to = COALESCE(?, assigned_to) WHERE id = ?",
            [title, status, assigned_to, req.params.id]
        );
        const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Xóa task
app.delete('/api-node/tasks/:id', async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Khởi động server
connectDB().then(() => {
    app.listen(3000, () => console.log("🚀 NodeJS Tasks API chạy ở port 3000"));
});
