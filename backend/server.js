const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
    res.send("Backend Task Manager berjalan!");
});


// ======================
// CREATE TASK
// ======================
app.post("/tasks", (req, res) => {
    const { title, description, priority, status } = req.body;

    const sql = `
        INSERT INTO tasks (title, description, priority, status)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title, description, priority, status],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Task berhasil ditambahkan",
                id: result.insertId
            });
        }
    );
});


// ======================
// READ ALL TASKS
// ======================
app.get("/tasks", (req, res) => {
    const sql = "SELECT * FROM tasks ORDER BY created_at DESC";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(result);
    });
});


// ======================
// UPDATE TASK
// ======================
app.put("/tasks/:id", (req, res) => {
    const { title, description, priority, status } = req.body;
    const { id } = req.params;

    const sql = `
        UPDATE tasks
        SET title=?, description=?, priority=?, status=?
        WHERE id=?
    `;

    db.query(
        sql,
        [title, description, priority, status, id],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Task berhasil diupdate"
            });
        }
    );
});


// ======================
// DELETE TASK
// ======================
app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM tasks WHERE id=?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            message: "Task berhasil dihapus"
        });
    });
});


// SERVER
app.listen(3000, () => {
    console.log("Server berjalan di port 3000");
});