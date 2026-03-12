const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

app.use(cors());

const db = mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: "root",
    password: "root",
    database: "appdb"
});

// Auto-reconnect khi mất kết nối
db.on('error', (err) => {
    console.error('DB error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Reconnecting...');
    }
});

app.get('/api-node/tasks', (req, res) => {
    db.query("SELECT * FROM tasks", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.listen(3000, () => console.log("NodeJS chạy ở port 3000"));
