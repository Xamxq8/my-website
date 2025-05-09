const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// الاتصال بقاعدة البيانات
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true }
});

connection.connect((err) => {
  if (err) return console.error('Connection error:', err);
  console.log('Connected to PlanetScale');
});

// الجلسات
app.use(session({
  secret: 'secret-key-123',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(express.static(__dirname));

// صفحة تسجيل الدخول
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// التحقق من تسجيل الدخول
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).send('خطأ في التحقق');
    if (results.length > 0) {
      req.session.loggedIn = true;
      res.status(200).send('تم الدخول');
    } else {
      res.status(401).send('بيانات غير صحيحة');
    }
  });
});

// صفحة التحكم
app.get('/dashboard', (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// تسجيل الخروج
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// إضافة زوج
app.post('/add-couple', (req, res) => {
  const { coupleId, eggCount, treatment, treatmentDays } = req.body;
  const insertDate = new Date().toISOString().split('T')[0];
  let hatchDate = null;
  let status = 'no_eggs';

  if (eggCount > 0) {
    hatchDate = new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0];
    status = 'eggs';
  } else if (treatment) {
    status = 'treatment';
  }

  const sql = `
    INSERT INTO couples (couple_id, egg_count, treatment, treatment_days, insert_date, hatch_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  connection.query(sql, [coupleId, eggCount, treatment, treatmentDays, insertDate, hatchDate, status], (err) => {
    if (err) {
      console.error("DB Error during insert:", err);
      return res.status(500).send("Error adding couple");
    }
    res.json({ success: true });
  });
});

// حذف زوج
app.delete('/delete-couple/:id', (req, res) => {
  const coupleId = req.params.id;
  const sql = 'DELETE FROM couples WHERE id = ?';
  connection.query(sql, [coupleId], (err) => {
    if (err) {
      console.error("DB Error during delete:", err);
      return res.status(500).json({ error: "Error deleting couple" });
    }
    res.json({ success: true });
  });
});

// جلب الأزواج وتحديث الفقس
app.get('/get-couples', (req, res) => {
  const updateToChicks = `
    UPDATE couples
    SET status = 'chicks'
    WHERE status = 'eggs' AND CURDATE() >= hatch_date
  `;
  const moveToChicks = `
    INSERT INTO chicks (couple_id, hatch_date, days_since_hatch, days_until_slaughter)
    SELECT couple_id, hatch_date,
           DATEDIFF(CURDATE(), hatch_date),
           18 - DATEDIFF(CURDATE(), hatch_date)
    FROM couples
    WHERE status = 'chicks'
      AND couple_id NOT IN (SELECT couple_id FROM chicks)
  `;
  connection.query(updateToChicks, () => {
    connection.query(moveToChicks, () => {
      connection.query('SELECT * FROM couples', (err, results) => {
        if (err) return res.status(500).send('Error fetching couples');
        res.json(results);
      });
    });
  });
});

// جلب الفراخ
app.get('/get-chicks', (req, res) => {
  connection.query('SELECT * FROM chicks', (err, results) => {
    if (err) return res.status(500).send('Error fetching chicks');
    res.json(results);
  });
});

// تشغيل السيرفر
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
