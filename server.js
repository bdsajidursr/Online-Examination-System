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

//  ADMIN STATS

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
// --- GET SCHEDULE ---

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



//  SAVE QUESTION WITH TIME + TIMER
app.post('/api/questions-full', (req, res) => {

    const {
        subject,
        question_text,
        a,
        b,
        c,
        d,
        correct,
        type,
        start_time,
        end_time,
        timer_minutes
    } = req.body;

    const sql = `
        INSERT INTO questions 
        (subject, question_text, option_a, option_b, option_c, option_d, correct_option, type, start_time, end_time, timer_minutes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        subject,
        question_text,
        a,
        b,
        c,
        d,
        correct,
        type,
        start_time,
        end_time,
        timer_minutes
    ], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

app.get('/api/get-questions', (req, res) => {
    const subject = req.query.subject;

    const sql = `
        SELECT *
        FROM questions
        WHERE subject = ?
        ORDER BY id DESC
    `;

    db.query(sql, [subject], (err, results) => {
        if (err) {
            console.error(err);
            return res.json([]);
        }
        res.json(results);
    });
});


app.delete('/api/delete-question', (req, res) => {
    const { id } = req.body;

    const sql = "DELETE FROM questions WHERE id = ?";
    
    db.query(sql, [id], (err) => {
        if (err) {
            console.error(err);
            return res.json({ success:false });
        }
        res.json({ success:true });
    });
});

app.delete('/api/delete-exam', (req, res) => {
    const { subject } = req.body;

    const deleteQuestions = "DELETE FROM questions WHERE subject = ?";
    const deleteSchedule = "DELETE FROM exam_schedule WHERE subject = ?";

    db.query(deleteQuestions, [subject], (err) => {
        if (err) {
            console.error(err);
            return res.json({ success:false });
        }

        db.query(deleteSchedule, [subject], (err2) => {
            if (err2) {
                console.error(err2);
                return res.json({ success:false });
            }

            res.json({ success:true });
        });
    });
});



app.post('/api/create-exam', (req, res) => {
    const { subject } = req.body;

    // Just insert one empty question so subject appears
    const sql = `
        INSERT INTO questions 
        (subject, question_text, option_a, option_b, option_c, option_d, correct_option, type)
        VALUES (?, 'Sample Question', '', '', '', '', '', 'general')
    `;

    db.query(sql, [subject], (err) => {
        if (err) {
            console.error(err);
            return res.json({ success:false });
        }
        res.json({ success:true });
    });
});

app.put('/api/update-question', (req, res) => {
    const { id, question_text, a, b, c, d, correct, type } = req.body;

    const sql = `
        UPDATE questions 
        SET 
            question_text = ?,
            option_a = ?,
            option_b = ?,
            option_c = ?,
            option_d = ?,
            correct_option = ?,
            type = ?
        WHERE id = ?
    `;

    db.query(sql, [question_text, a, b, c, d, correct, type, id], (err) => {
        if (err) {
            console.error(err);
            return res.json({ success:false });
        }
        res.json({ success:true });
    });
});
// ===== FINAL SCHEDULE FIX =====

// GET schedule
app.get('/api/get-schedule/:subject', (req, res) => {
    const sql = "SELECT * FROM exam_schedule WHERE subject=? LIMIT 1";

    db.query(sql, [req.params.subject], (err, result) => {
        if (err || result.length === 0) {
            return res.json(null);
        }
        res.json(result[0]);
    });
});

// SAVE schedule
app.post('/api/set-schedule', (req, res) => {
    const { subject, start, end, timer } = req.body;

    const sql = `
        INSERT INTO exam_schedule (subject, start_time, end_time, timer)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        start_time = VALUES(start_time),
        end_time = VALUES(end_time),
        timer = VALUES(timer)
    `;

    db.query(sql, [subject, start, end, timer], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success:false });
        }
        res.json({ success:true });
    });
});

app.get('/api/qb-subjects', (req, res) => {

    const sql = `
        SELECT subject, COUNT(*) as count
        FROM questions
        GROUP BY subject
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.json([]);
        }
        res.json(results);
    });
});

// QUESTION BANK - GET QUESTIONS

app.get('/api/qb-questions', (req, res) => {

    const subject = req.query.subject;

    const sql = `
        SELECT *
        FROM questions
        WHERE subject = ?
        ORDER BY id DESC
    `;

    db.query(sql, [subject], (err, results) => {
        if (err) {
            console.error(err);
            return res.json([]);
        }
        res.json(results);
    });
});
// GET STUDENTS WITH PARTICIPATION

app.get('/api/students', (req, res) => {

    const sql = `
        SELECT 
            u.student_id AS id,
            u.fullname AS name,
            COUNT(r.id) AS exams
        FROM users u
        LEFT JOIN results r ON u.student_id = r.student_id
        WHERE u.role = 'student'
        GROUP BY u.student_id
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.json([]);
        }
        res.json(results);
    });
});

// ASSESS / MARK STUDENTS

app.post('/api/assess-students', (req, res) => {

    const { ids } = req.body;

    if (!ids || ids.length === 0) {
        return res.json({ success: false });
    }

    const sql = `
        UPDATE results
        SET status = 'checked'
        WHERE student_id IN (?)
    `;

    db.query(sql, [ids], (err) => {
        if (err) {
            console.error(err);
            return res.json({ success: false });
        }
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
