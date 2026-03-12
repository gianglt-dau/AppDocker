const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

app.use(cors());

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "appdb"
});

app.get('/api-node/tasks', (req, res) => {
    db.query("SELECT * FROM tasks", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

app.listen(3000, () => console.log("NodeJS chạy ở port 3000"));
