const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serves your index.html, student.html, admin.html

// --- 1. DATABASE CONNECTION ---
// Updated to Port 3307 based on your XAMPP settings
const db = mysql.createConnection({
    host: '127.0.0.1', 
    user: 'root',
    password: '',
    database: 'quiz_db',
    port: 3307  
});

db.connect((err) => {
    if (err) {
        console.error('!!! DATABASE CONNECTION FAILED !!!');
        console.error('Check if MySQL is GREEN in XAMPP and shows port 3307.');
        return;
    }
    console.log('Connected to MySQL Database successfully on Port 3307.');
});

// --- 2. REGISTRATION ROUTE ---
app.post('/api/register', async (req, res) => {
    const { fullname, student_id, email, password, role, admin_pin } = req.body;

    // Admin Security Check
    if (role === 'admin' && admin_pin !== '9988') {
        return res.status(403).json({ error: "Invalid Admin Secret PIN!" });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        
        /* LOGIC FIX: 
           If the user is an Admin, we save the student_id as NULL.
           This prevents the "Duplicate entry" error when multiple admins 
           register with a blank ID box.
        */
        const finalID = (role === 'admin') ? null : (student_id || null);

        const sql = "INSERT INTO users (fullname, student_id, email, password, role) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [fullname, finalID, email, hash, role], (err) => {
            if (err) {
                console.error("DB Error:", err.message);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(500).json({ error: "Email or Student ID already exists!" });
                }
                return res.status(500).json({ error: "Database error during registration." });
            }
            res.json({ message: "Registration successful!" });
        });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- 3. LOGIN ROUTE ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database login error" });
        
        if (results.length > 0) {
            const match = await bcrypt.compare(password, results[0].password);
            if (match) {
                // Send details back to frontend for redirection
                res.json({
                    role: results[0].role,
                    name: results[0].fullname,
                    sid: results[0].student_id 
                });
            } else {
                res.status(401).json({ error: "Incorrect password." });
            }
        } else {
            res.status(404).json({ error: "No account found with this email." });
        }
    });
});

// --- 4. EXAM DATA ROUTES ---
app.get('/api/questions/:subject', (req, res) => {
    db.query("SELECT * FROM questions WHERE subject = ?", [req.params.subject], (err, r) => {
        if (err) return res.status(500).json({ error: "Failed to fetch questions" });
        res.json(r);
    });
});

app.post('/api/results', (req, res) => {
    const { name, sid, score, total, subject } = req.body;
    const sql = "INSERT INTO results (student_name, student_id, score, total, subject) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, sid, score, total, subject], (err) => {
        if (err) return res.status(500).json({ error: "Failed to save exam result" });
        res.json({ message: "Result saved successfully" });
    });
});

// --- 5. ADMIN VIEW ---
app.get('/api/admin/results', (req, res) => {
    db.query("SELECT * FROM results ORDER BY exam_date DESC", (err, r) => {
        if (err) return res.status(500).json({ error: "Failed to load results" });
        res.json(r);
    });
});

// --- 6. SERVER START ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});