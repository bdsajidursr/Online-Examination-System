const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'quiz_db',
    port: 3307
});

const ADMIN_SECRET_PIN = "1234";

// --- LOGIN LOGIC ---
app.post('/api/login', (req, res) => {
    const { email, password, role, pin } = req.body;
    
    if (role === 'admin' && pin !== ADMIN_SECRET_PIN) {
        return res.status(401).json({ success: false, message: "Invalid Admin PIN!" });
    }

    const sql = "SELECT * FROM users WHERE email = ? AND role = ?";
    db.query(sql, [email, role], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length > 0 && password === results[0].password) {
            res.json({ 
                success: true, 
                role: results[0].role, 
                name: results[0].fullname, 
                sid: results[0].student_id 
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials" });
        }
    });
});

// --- REGISTER ---
app.post('/api/register', (req, res) => {
    const { name, sid, email, pass, role } = req.body;

    const sql = "INSERT INTO users (fullname, student_id, email, password, role) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [name, sid, email, pass, role], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Registration failed. ID or Email might exist." });
        }
        res.json({ success: true });
    });
});

// --- SAVE QUESTIONS ---
app.post('/api/questions', (req, res) => {
    const { subject, question_text, a, b, c, d, correct, type } = req.body;

    const sql = "INSERT INTO questions (subject, question_text, option_a, option_b, option_c, option_d, correct_option, type) VALUES (?,?,?,?,?,?,?,?)";
    
    db.query(sql, [subject, question_text, a, b, c, d, correct, type], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});


// ==========================================
// ✅ ✅ ✅ FIXED HERE ONLY
// ==========================================
app.get('/api/questions/:subject', (req, res) => {
    const sql = `
        SELECT 
            id,
            subject,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            COALESCE(type, question_type) AS type
        FROM questions 
        WHERE subject = ?
    `;

    db.query(sql, [req.params.subject], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json([]);
        }
        res.json(results);
    });
});


// --- GET EXAMS ---
app.get('/api/get-exams', (req, res) => {
    const sql = "SELECT subject, COUNT(*) as qCount FROM questions GROUP BY subject";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json([]);
        }
        res.json(results);
    });
});


// ==========================================
// ✅ ADMIN STATS
// ==========================================
app.get('/api/admin-stats', (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(DISTINCT subject) FROM questions) as totalExams,
            (SELECT COUNT(*) FROM users WHERE role = 'student') as totalStudents,
            (SELECT COUNT(DISTINCT student_id, subject) FROM results) as totalResults
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ totalExams: 0, totalStudents: 0, totalResults: 0 });
        }
        res.json(results[0]);
    });
});


// --- GET ALL RESULTS ---
app.get('/api/get-all-results', (req, res) => {
    const sql = "SELECT * FROM results ORDER BY exam_date DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

// --- MY RESULTS ---
app.get('/api/my-results/:identifier', (req, res) => {
    const id = req.params.identifier;

    const sql = "SELECT * FROM results WHERE student_id = ? OR student_name = ? ORDER BY exam_date DESC";
    db.query(sql, [id, id], (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

// --- SAVE RESULT ---
app.post('/api/save-result', (req, res) => {
    const { student_name, student_id, score, total, subject } = req.body;

    const sql = "INSERT INTO results (student_name, student_id, score, total, exam_date, subject) VALUES (?, ?, ?, ?, NOW(), ?)";
    db.query(sql, [student_name, student_id, score, total, subject], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});


// ==========================================
// ✅ UPDATE SCORE
// ==========================================
app.put('/api/update-score', (req, res) => {
    const { id, score } = req.body;

    const sql = "UPDATE results SET score=? WHERE id=?";
    
    db.query(sql, [score, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success:false });
        }
        res.json({ success:true });
    });
});



app.listen(3000, () => console.log("Server running on http://localhost:3000"));