// server.js
const express = require("express");
const cors = require("cors"); // <-- importeren
const app = express();

app.use(cors()); // <-- staat nu alle cross-origin requests toe
app.use(express.json());

const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');


const port = 3000;

// ----------------------
// Middleware
// ----------------------
app.use(cors()); // laat alle origins toe (frontend kan op andere poort draaien)
app.use(bodyParser.json());

// ----------------------
// Database setup
// ----------------------
const dbPath = path.resolve("C:\\Users\\nandd\\test\\leaderboard.db");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if(err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the database.");

        // Maak tabel scores als die nog niet bestaat
        db.run(`
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                score INTEGER NOT NULL
            )
        `, (err) => {
            if(err) console.error("Error creating table:", err.message);
            else console.log("Table 'scores' ready.");
        });
    }
});

// ----------------------
// Endpoints
// ----------------------

// POST /submit-score -> sla naam + score op
app.post('/submit-score', (req, res) => {
    const { name, score } = req.body;

    if(!name || score === undefined) {
        return res.status(400).json({ error: "Name and score are required" });
    }

    const stmt = `INSERT INTO scores (name, score) VALUES (?, ?)`;
    db.run(stmt, [name, score], function(err) {
        if(err) return res.status(500).json({ error: err.message });

        res.json({ success: true, id: this.lastID });
    });
});

// GET /scores -> haal top 10 scores op
app.get('/scores', (req, res) => {
    db.all("SELECT * FROM scores ORDER BY score DESC LIMIT 10", (err, rows) => {
        if(err) return res.status(500).json({ error: err.message });

        res.json(rows);
    });
});

// ----------------------
// Start server
// ----------------------
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
